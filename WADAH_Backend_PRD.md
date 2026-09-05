# Product Requirements Document
## WADAH — Backend MVP
**Versi:** 1.0  
**Tanggal:** Agustus 2026  
**Author:** Jerome Maxcellino Budianto  
**Status:** Draft

---

## 1. Overview

WADAH adalah platform karier dua sisi yang menghubungkan talent muda dengan klien UMKM. Backend MVP difokuskan pada **sisi talent** — sistem belajar gamified hingga portofolio terverifikasi. Sisi klien (matching, escrow, kontrak) bersifat dummy untuk MVP.

### 1.1 Tujuan Backend MVP
- User bisa register, login, dan progress-nya tersimpan permanen
- AI Mentor bisa merespons sesuai konteks unit yang sedang dibuka
- Submission checkpoint tersimpan dan bisa di-review manual
- Loop lengkap: Onboarding → Belajar → Checkpoint → Portofolio Terverifikasi

### 1.2 Tech Stack
| Layer | Teknologi | Alasan |
|---|---|---|
| Frontend | React + Vercel | Sudah jalan |
| Auth + DB | Supabase | Free tier cukup, setup cepat |
| Backend API | FastAPI + GCP Cloud Run | Untuk Gemini API call yang aman |
| AI | Gemini Flash Lite | Hemat cost, cukup untuk mentor |
| Storage | Supabase Storage | File submission checkpoint |

---

## 2. Database Schema

### 2.1 Tabel `users`
```sql
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT UNIQUE NOT NULL,         -- untuk auth Supabase
  name        TEXT NOT NULL,
  phone       TEXT,
  skill       TEXT NOT NULL,                -- skill yang dipilih saat onboarding
  avatar_url  TEXT,                         -- opsional, bisa diisi belakangan
  is_premium  BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.2 Tabel `progress`
```sql
CREATE TABLE progress (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  unit_id     TEXT NOT NULL,                -- e.g. "dg-1-1" (desain grafis, level 1, unit 1)
  status      TEXT DEFAULT 'locked',        -- locked | opened | completed
  score       INT,                          -- hasil quiz (0-100)
  opened_at   TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);
```

### 2.3 Tabel `gamification`
```sql
CREATE TABLE gamification (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  xp              INT DEFAULT 0,
  lives           INT DEFAULT 5,
  lives_reset_at  DATE DEFAULT CURRENT_DATE,
  streak          INT DEFAULT 0,
  last_active_date DATE,
  streak_freeze_until DATE               -- freeze saat masuk task simulasi
);
```

### 2.4 Tabel `submissions`
```sql
CREATE TABLE submissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  unit_id         TEXT NOT NULL,            -- harus unit checkpoint
  content_url     TEXT,                     -- link file di Supabase Storage
  content_text    TEXT,                     -- atau teks deskripsi submission
  status          TEXT DEFAULT 'pending',   -- pending | approved | revision_requested
  reviewer_notes  TEXT,                     -- feedback dari reviewer
  revision_count  INT DEFAULT 0,            -- max 2 revisi
  xp_earned       INT,                      -- 150 / 120 / 100 tergantung revisi
  submitted_at    TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at     TIMESTAMPTZ
);
```

### 2.5 Tabel `portfolio`
```sql
CREATE TABLE portfolio (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES submissions(id),
  title         TEXT NOT NULL,
  description   TEXT,
  skill         TEXT NOT NULL,
  verified      BOOLEAN DEFAULT TRUE,       -- semua yang masuk sini sudah diverifikasi
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.6 Tabel `mentor_context`
```sql
CREATE TABLE mentor_context (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL,                 -- 'user' atau 'assistant'
  content    TEXT NOT NULL,
  unit_id    TEXT,                          -- konteks unit mana yang sedang dibuka
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Hanya simpan 2 pesan terakhir per user (free tier)
-- 10 pesan terakhir untuk premium
```

---

## 3. API Endpoints (FastAPI)

### 3.1 Auth — Dihandle Supabase langsung
Tidak ada endpoint custom untuk auth. Frontend pakai Supabase Auth SDK langsung.

---

### 3.2 User

#### `GET /user/me`
Ambil data user + state gamifikasi sekaligus.

**Response:**
```json
{
  "id": "uuid",
  "name": "Rina Kusumawati",
  "skill": "Desain Grafis",
  "avatar_url": null,
  "is_premium": false,
  "xp": 150,
  "lives": 4,
  "streak": 3,
  "level": 1
}
```

#### `PATCH /user/me`
Update nama, nomor HP, atau avatar URL.

---

### 3.3 Progress & Gamifikasi

#### `POST /unit/open`
Dipanggil saat user pertama kali klik dan buka unit baru.

**Request:**
```json
{ "unit_id": "dg-1-2" }
```

**Logic:**
- Cek apakah unit ini sudah pernah dibuka sebelumnya
- Kalau belum → potong 1 life, set status = 'opened', catat `opened_at`
- Kalau sudah → tidak potong life (gratis dibuka ulang)
- Cek apakah lives sudah reset hari ini (reset tiap hari)

**Response:**
```json
{
  "lives_deducted": true,
  "lives_remaining": 4,
  "already_opened": false
}
```

#### `POST /unit/complete`
Dipanggil saat user selesai semua tahap unit (materi + quiz).

**Request:**
```json
{
  "unit_id": "dg-1-1",
  "quiz_score": 85
}
```

**Logic:**
- Set status = 'completed', catat `completed_at`
- Tambah XP (default +30 per unit non-checkpoint)
- Update streak: set `last_active_date` = today, tambah streak +1 kalau kemarin juga aktif
- Unlock unit berikutnya (update status = 'locked' → bisa dibuka)

---

### 3.4 AI Mentor

#### `POST /mentor/chat`
Endpoint utama AI Mentor. Semua konteks di-inject di sini.

**Request:**
```json
{
  "message": "Apa itu safe zone dalam desain poster?",
  "unit_id": "dg-1-1",
  "unit_stage": "materi"    // materi | quiz | checkpoint
}
```

**Logic di backend:**
1. Ambil data user dari DB (skill, progress, XP)
2. Ambil rolling context 2 pesan terakhir dari `mentor_context` (free) / 10 (premium)
3. Ambil konten unit yang sedang dibuka (dari JSON konten statis)
4. Bangun system prompt kontekstual:

```python
system_prompt = f"""
Kamu adalah Wady, AI Mentor di platform WADAH. Bersikap friendly, casual, dan suportif.

KONTEKS USER:
- Nama: {user.name}
- Skill: {user.skill}
- XP: {user.xp} | Streak: {user.streak} hari
- Sedang belajar: {unit.title}
- Stage saat ini: {unit_stage}

MATERI UNIT YANG SEDANG DIPELAJARI:
{unit.content}

ATURAN PERILAKU:
- Stage 'materi': Jawab pertanyaan tentang konsep secara lengkap
- Stage 'quiz': JANGAN berikan jawaban langsung. Berikan hint atau ajukan pertanyaan balik
- Stage 'checkpoint': Jadilah sparring partner. JANGAN kerjakan task untuk user. Bantu user berpikir mandiri
- Kalau pertanyaan di luar konteks unit: redirect pelan-pelan ke materi yang sedang dipelajari
- Gunakan bahasa Indonesia yang casual dan encouraging
"""
```

5. Panggil Gemini Flash Lite dengan system prompt + rolling context + pesan baru
6. Simpan pesan user dan respons ke `mentor_context`
7. Kalau free tier: hapus pesan lama, sisakan 2 terbaru per user

**Response:**
```json
{
  "response": "Safe zone itu area di dalam poster yang aman dari crop atau pemotongan...",
  "messages_used_today": 3,
  "messages_limit": 10
}
```

---

### 3.5 Submission Checkpoint

#### `POST /submission`
Upload hasil kerja checkpoint.

**Request:** `multipart/form-data`
```
unit_id: "dg-1-checkpoint-1"
content_text: "Ini poster saya untuk Bu Sari..."
file: [upload file]
```

**Logic:**
- Validasi unit_id adalah unit checkpoint
- Validasi revision_count < 2 (kalau sudah 2x revisi dan belum approved, suruh ulang unit)
- Upload file ke Supabase Storage
- Simpan ke tabel `submissions` dengan status `pending`
- Freeze streak (set `streak_freeze_until` = today + 7)

#### `GET /submission/my`
Ambil semua submission milik user yang sedang login.

---

### 3.6 Portfolio

#### `GET /portfolio/:user_id`
Ambil portfolio terverifikasi milik user. Endpoint ini public — bisa diakses klien UMKM nantinya.

**Response:**
```json
{
  "user": {
    "name": "Rina Kusumawati",
    "skill": "Desain Grafis"
  },
  "portfolio": [
    {
      "title": "Poster Promo Toko Kue Bu Sari",
      "skill": "Desain Grafis",
      "verified": true,
      "created_at": "2026-08-01"
    }
  ]
}
```

---

### 3.7 Matching UMKM (Dummy untuk MVP)

#### `GET /matching`
Return hardcoded 3 talent. Rina selalu jadi kartu #1 untuk keperluan demo.

**Request query:**
```
?skill=Desain Grafis&budget=500000
```

**Response:** Array 3 talent hardcoded dari DB dengan `verified_portfolio = true`.

---

## 4. Business Logic Penting

### 4.1 Lives System
- Default: 5 lives/hari (free), 15 lives/hari (premium)
- Reset otomatis tiap hari jam 00:00 WIB
- Dipotong HANYA saat pertama kali buka unit baru
- Unit yang pernah dibuka = gratis dibuka ulang
- Task simulasi checkpoint = tidak kena lives

### 4.2 Streak System
- Minimum 1 unit selesai per hari untuk jaga streak
- Streak +1 kalau `last_active_date` = kemarin
- Streak reset ke 0 kalau lebih dari 1 hari tidak aktif
- Auto-freeze maksimal 7 hari saat user masuk task checkpoint

### 4.3 XP System
| Kondisi | XP |
|---|---|
| Selesai unit biasa | +30 |
| Checkpoint approved langsung | +150 |
| Checkpoint approved setelah 1 revisi | +120 |
| Checkpoint approved setelah 2 revisi | +100 |
| Gagal setelah 2 revisi | 0 (ulang unit) |

### 4.4 Revision Cycle
- Submit → `pending`
- Reviewer approve → `approved` → masuk portfolio otomatis
- Reviewer minta revisi → `revision_requested` + feedback spesifik
- Maksimal 2 revisi dalam 3 hari
- Setelah 2 revisi gagal → status `failed`, user harus ulang unit dari awal

### 4.5 AI Mentor Rate Limiting
| Tier | Pesan/hari | Rolling context | Model |
|---|---|---|---|
| Free | 10 | 2 pesan terakhir | Gemini Flash Lite |
| Premium | Unlimited | 10 pesan terakhir | Gemini Flash (full) |

---

## 5. Konten Statis (JSON)

Konten materi, quiz, dan brief checkpoint disimpan sebagai JSON statis di backend — bukan di DB. Ini lebih cepat dan gak perlu CMS untuk MVP.

### Struktur unit_id:
```
{skill}-{level}-{nomor}
dg = Desain Grafis
sm = Social Media
ve = Video & Reels

Contoh:
dg-1-1    = Desain Grafis, Level 1, Unit 1
dg-1-cp1  = Desain Grafis, Level 1, Checkpoint 1
```

### Struktur JSON konten:
```json
{
  "unit_id": "dg-1-1",
  "title": "Canvas Dimensions & Safe Zones",
  "type": "materi",
  "content": "...",
  "quiz": [
    {
      "question": "Ukuran canvas Instagram post yang benar adalah?",
      "options": ["1080x1080px", "1920x1080px", "800x600px", "1280x720px"],
      "answer": 0,
      "explanation": "Instagram post standar adalah 1:1 ratio, 1080x1080px."
    }
  ]
}
```

---

## 6. Security

- Semua endpoint FastAPI wajib verifikasi JWT dari Supabase (`Authorization: Bearer <token>`)
- Gemini API key disimpan di GCP Secret Manager, tidak di environment variable langsung
- Supabase RLS (Row Level Security) aktif — user hanya bisa baca data milik sendiri
- File submission di Supabase Storage: private bucket, akses via signed URL

---

## 7. Environment Variables

### Vercel (Frontend)
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_URL=https://wadah-api-xxx.a.run.app
```

### GCP Cloud Run (FastAPI)
```
SUPABASE_URL=
SUPABASE_SERVICE_KEY=       # service key, bukan anon key
GEMINI_API_KEY=
ENVIRONMENT=production
```

---

## 8. Deployment

### Supabase
- Buat project di supabase.com
- Jalankan SQL schema di SQL Editor
- Aktifkan RLS per tabel
- Enable Email Auth (OTP)

### FastAPI → GCP Cloud Run
```bash
# Build dan deploy
gcloud builds submit --tag gcr.io/[PROJECT_ID]/wadah-api
gcloud run deploy wadah-api \
  --image gcr.io/[PROJECT_ID]/wadah-api \
  --platform managed \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --set-secrets GEMINI_API_KEY=gemini-key:latest
```

### Frontend → Vercel
- Connect GitHub repo ke Vercel
- Set environment variables
- Auto-deploy setiap push ke main

---

## 9. MVP Scope — Yang Dikerjain vs Tidak

### ✅ Dikerjain
- Auth (email OTP via Supabase)
- User profile tersimpan
- Progress unit (opened/completed)
- Lives, streak, XP logic
- AI Mentor context-aware
- Submission checkpoint
- Portfolio terverifikasi (manual review)
- Matching dummy (hardcoded)

### ❌ Tidak dikerjain di MVP
- SMS OTP (butuh Twilio)
- Smart matching algoritma
- Escrow dan payment
- Human reviewer dashboard (manual via Supabase dashboard)
- Premium payment flow (flag manual di DB)
- Notifikasi push/email
- CMS konten

---

## 10. Development Priority

| Prioritas | Task | Estimasi |
|---|---|---|
| 1 | Setup Supabase + schema semua tabel | 1 hari |
| 2 | Integrasi Supabase Auth ke React | 1 hari |
| 3 | Endpoint `/user/me`, `/unit/open`, `/unit/complete` | 1 hari |
| 4 | Lives + streak + XP logic | 1 hari |
| 5 | AI Mentor endpoint + context-aware system prompt | 2 hari |
| 6 | Submission checkpoint + Supabase Storage | 1 hari |
| 7 | Portfolio endpoint | 0.5 hari |
| 8 | Deploy FastAPI ke Cloud Run | 0.5 hari |
| **Total** | | **~8 hari kerja** |
