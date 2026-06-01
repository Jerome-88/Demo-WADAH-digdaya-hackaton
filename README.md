<div align="center">

# WADAH
### Work-simulation AI Driven Augmented Hiring

**Memutus paradoks pengalaman kerja yang membelenggu talenta muda Indonesia.**

[![Demo](https://img.shields.io/badge/Live_Demo-Coba_Sekarang-4F46E5?style=for-the-badge)](https://jerome-88.github.io/wadah-demo)
[![DIGDAYA X](https://img.shields.io/badge/DIGDAYA_X-Hackathon_2026-F59E0B?style=for-the-badge)](https://github.com/Jerome-88)
[![Bank Indonesia](https://img.shields.io/badge/Sponsor-Bank_Indonesia-DC2626?style=for-the-badge)](#)

</div>

---

## Tentang WADAH

WADAH adalah platform pengembangan karir digital di mana talenta muda berlatih melalui simulasi kerja bergamifikasi, membangun portofolio terverifikasi, dan terhubung langsung dengan pelaku usaha yang membutuhkan — semua dalam satu tempat.

Platform ini hadir untuk menjawab dua masalah yang saling terhubung: talenta muda yang punya kemampuan tapi tidak bisa membuktikannya, dan UMKM yang butuh tenaga kerja digital tapi tidak punya waktu untuk proses rekrutmen panjang.

```
Learn → Prove → Earn
```

| Pengguna | Masalah | Solusi WADAH |
|---|---|---|
| Fresh Graduate & Mahasiswa | Ditolak karena tidak punya pengalaman tercatat | Career Sandbox AI + Verified Portfolio |
| UMKM & Pelaku Usaha | Sulit memverifikasi kompetensi kandidat secara objektif | Smart Matching berbasis skor performa |

---

## Fitur Utama

### Untuk Penyedia Jasa (Talenta)

- **AI Career Sandbox** — Simulasi tugas berstandar industri yang dibimbing AI Mentor secara real-time. Pengguna bisa bertanya langsung tentang kekurangan hasil kerjanya dan mendapatkan feedback yang spesifik.
- **Sistem Gamifikasi** — Pengguna berkembang level demi level berdasarkan skor performa. Semakin tinggi level, semakin kompleks proyek yang bisa diambil.
- **Verified Portfolio** — Setiap hasil kerja yang lolos evaluasi AI dan human verification tersimpan otomatis sebagai portofolio publik yang dapat diverifikasi siapapun.
- **Smart Matching** — Setelah mencapai level tertentu, pengguna terhubung otomatis dengan klien yang membutuhkan jasa sesuai bidang dan skor performanya.

### Untuk Pengguna Jasa (UMKM & Pelaku Usaha)

- **AI Clarification** — Ceritakan kebutuhan proyek, AI membantu mengklarifikasi scope dan spesifikasi secara interaktif.
- **Talenta Terkurasi** — Sistem merekomendasikan talenta yang paling sesuai berdasarkan skor performa, spesialisasi, dan kecepatan penyelesaian task — bukan harga terendah.
- **Transparent Portfolio** — Lihat riwayat simulasi, breakdown skor per kriteria, dan rekam jejak proyek sebelumnya sebelum memilih talenta.

---

## Arsitektur Sistem

```
┌──────────────────────────────────────────────────────────────┐
│                       WADAH PLATFORM                         │
├──────────────────────┬───────────────────────────────────────┤
│    PENYEDIA JASA     │          PENGGUNA JASA                │
│                      │                                       │
│  Isi Profil & Level  │    Ceritakan Kebutuhan Proyek         │
│         ↓            │              ↓                        │
│   AI Career Sandbox  │    AI Clarification Chat              │
│         ↓            │              ↓                        │
│  Iterasi + Feedback  │    Smart Task Allocation              │
│         ↓            │              ↓                        │
│ Human Verification   │    Talenta Terverifikasi              │
│         ↓            │              ↓                        │
│  Verified Portfolio  │    Lihat Portfolio → Hubungi          │
└──────────────────────┴───────────────────────────────────────┘
```

### Tech Stack

```
Frontend            →  React.js + Tailwind CSS
Backend             →  FastAPI (Python)
AI Tutor            →  Gemini API + RAG Pipeline
Database            →  PostgreSQL + Vertex AI Vector Search
Infrastructure      →  Google Cloud Platform
```

### Algoritma Inti

**Semantic Scoring (RAG-based)** — Cosine Similarity untuk mengevaluasi hasil kerja pengguna terhadap standar task yang sudah ditentukan, menghasilkan penilaian yang objektif dan konsisten.

**Weighted Matching Engine (MCDM)** — Multi-Criteria Decision Making dengan tiga parameter: skor performa AI, kecepatan penyelesaian task, dan relevansi bidang keahlian.

**Adaptive Assessment** — Sistem mengukur level awal pengguna secara otomatis berdasarkan profil yang diisi saat onboarding, sehingga task yang diberikan selalu sesuai kemampuan sejak hari pertama.

---

## Demo Interaktif

Demo prototipe dapat diakses langsung di browser tanpa perlu instalasi apapun.

**[Buka Demo WADAH](https://jerome-88.github.io/wadah-demo)**

### Cara Mencoba Demo

**Jalur 1 — Sebagai Penyedia Jasa**

1. Klik **"Mulai Buktikan Kompetensimu"**
2. Pilih bidang yang ingin dikembangkan
3. Isi profil awal dan pengalaman yang dimiliki
4. Terima task simulasi pertama dari AI
5. Masuk ke Dashboard dan mulai berinteraksi dengan AI Mentor
6. Selesaikan task dan lihat skor evaluasi per kriteria
7. Lihat portofolio terverifikasi yang dihasilkan

**Jalur 2 — Sebagai Pengguna Jasa**

1. Klik **"Cari Talenta Sekarang"**
2. Ceritakan kebutuhan proyek
3. Jawab pertanyaan klarifikasi dari AI
4. Lihat rekomendasi talenta beserta alasan matching
5. Buka Verified Portfolio talenta dan mulai bernegosiasi

---


## Tim Waduh

| Nama | Peran | Tanggung Jawab |
|------|-------|----------------|
| Jerome Maxcellino Budianto | CTO — AI/ML & Software Engineer | Sistem matching, LLM orchestration, RAG pipeline, demo platform |
| Kenneth Owen Gozali | AI/ML Engineer | Engine evaluasi kompetensi berbasis rubrik, integrity system |
| Kristanto Winata | Backend Engineer | Arsitektur backend cloud-native, manajemen database, infrastruktur API |
| Jollyn Audrey Lee | CPO — UI/UX & Product Strategy | Pengalaman pengguna end-to-end, strategi produk, validasi pasar |

**Institusi:** BINUS University  
**Kompetisi:** DIGDAYA X Hackathon 2026 — Bank Indonesia, OJK, ASPI, Fintech Indonesia, APUVINDO, LPPI

---

## Target Dampak

| Metrik | Target Tahun 1 |
|--------|----------------|
| Total Pengguna Aktif | 1.000 talenta |
| Pengguna dengan Portofolio Terverifikasi | 250 talenta |
| Talenta yang Mendapat Proyek Pertama | 125 talenta |
| Rata-rata Waktu Dapat Proyek Pertama | Kurang dari 30 hari |

---

## Kontak

**Jerome Maxcellino Budianto**  
jeromebudianto@gmail.com  
[github.com/Jerome-88](https://github.com/Jerome-88)

---

<div align="center">

DIGDAYA X Hackathon 2026 · Bank Indonesia · BINUS University

*Berinovasi untuk masa depan, memberdayakan talenta digital Indonesia.*

</div>
