# WADAH

Demo app for **WADAH** — Digdaya x Hackathon 2026 Bank Indonesia. A dark-themed React SPA that showcases two sides of one platform: UMKM (businesses) looking for talent, and talent (gig workers) building verified skills through a gamified "Skill Map."

Built with React 19 + Vite + Tailwind CSS + Framer Motion. All data is local/session state (`AppContext`) — there is no backend; every flow is scripted for live demo purposes.

## Getting started

```bash
npm install
npm run dev      # start dev server (http://localhost:5173)
npm run build    # production build
npm run lint      # eslint
```

## The two sides of the app

### 1. Pengguna Jasa (UMKM) — hiring flow

Entry point: `/jasa` ([JasaFlow.jsx](src/pages/jasa/JasaFlow.jsx))

WADAH is framed as a **recommendation engine**, not a bidding marketplace — there's no price filter/sort, and rejection from a talent is never shown to the UMKM as such.

1. **Step 1 — Ceritakan proyekmu**: pick a skill category, business name, free-text project description, and a rough budget (single Rp input, not a filter). Blurring the description triggers an "AI Scope Analysis" card — a checklist of likely deliverables per skill.
2. **Step 2 — Matching animation**: a short scripted animation (`⚡ Membaca deskripsi proyekmu...` → `🎯 Mencocokkan dengan 867 talent terverifikasi...` → `✓ Menemukan 3 talent terbaik untukmu!`) that auto-advances — no chat/questions step anymore.
3. **Step 3 — 3 Talent Paling Cocok**: three curated talent cards (`CURATED_TALENTS_DISPLAY` in [jasaData.js](src/data/jasaData.js)), headlined by a "Cocok Karena" reason box rather than a bare score. Rina Kusumawati is always the top card — she's the same persona used on the talent side, closing the demo loop live.
4. **Portfolio** (`/portfolio/:talentSlug`) → **Draft Kontrak** (`/jasa/kontrak/:talentSlug`, editable budget/durasi) → talent responds **accept**, **nego**, or (if rejected) offers the next talent in line (`TALENT_RESPONSE` / `NEXT_TALENT` maps).
5. **Chat & Nego** (`/jasa/nego/:talentSlug`) for talents whose response is `'nego'` (currently Rina and Siti) — scripted opening offer, Setuju/Counter/Tolak, live contract card that highlights on update.
6. **Kontrak Final** (`/jasa/kontrak-final/:talentSlug`) — sign → confetti celebration → contract active. This flips `activeProject.status` to `'matched'`.

### 2. Talenta (talent) — onboarding + Skill Map

Entry point: `/talenta` ([TalentaFlow.jsx](src/pages/talenta/TalentaFlow.jsx))

Onboarding order: **Data Diri** (nama, no HP, foto opsional) → **Verifikasi OTP** (6 digit) → **Pilih Skill** → activation animation auto-plays and drops straight into the Skill Map. Onboarding only ever needs to be completed once per session (`onboardingComplete` in `AppContext`) — revisiting `/talenta` after that redirects straight to `/rina/task`.

- `/rina/task` ([RinaTask.jsx](src/pages/rina/RinaTask.jsx)) — the Skill Map itself (Materi/Quiz/Tantangan nodes per unit).
- `/unit/:unitParam` ([UnitPage.jsx](src/pages/rina/UnitPage.jsx)) — full-page node content.
- `/rina/submit` ([RinaSubmit.jsx](src/pages/rina/RinaSubmit.jsx)) — checkpoint submission + revision cycle.
- `/rina/profile` ([ProfilePage.jsx](src/pages/rina/ProfilePage.jsx)) — level, XP, track record.
- `/rina/match` ([SmartMatchPage.jsx](src/pages/rina/SmartMatchPage.jsx)) — project detail/accept screen, reached from the cross-side banner below.

New talents start at **Level 1 / 0 XP**.

### The cross-side connection

`AppContext.activeProject` is the one piece of state both sides read and write — it's the "aha moment" for demos. When a UMKM posts a project in `/jasa` (status becomes `'open'`), and that project's skill matches the talent's Skill Map, a green banner appears at the top of `/rina/task` linking to `/rina/match`. The banner (and the "proyek cocok" toast when starting a matching Tantangan) stays hidden on a fresh session until a project has actually been posted.

## Project structure

```
src/
  context/AppContext.jsx   — global state: selectedSkill, exp/level, activeProject, onboardingComplete, streak, hearts...
  data/
    skillMaps.js           — skill categories + per-skill map/unit/node content
    jasaData.js            — curated talents, scope templates, nego scripts, match-response tables
    mockData.js            — misc demo data
  pages/
    LandingPage.jsx        — entry point, links to /jasa and /talenta
    jasa/                  — UMKM hiring flow (see above)
    talenta/TalentaFlow.jsx — talent onboarding
    rina/                  — Skill Map, unit pages, profile, submission, smart match
  components/               — Navbar, TopBar, StepIndicator, ScoreBar, AIMentorWidget
```

## Design system

Dark theme throughout: `#0F0F1A` background, `#1A1A2E` surfaces, `#7C3AED` (`purple`) accent, `#2D2D3D` muted borders. Sticky `h-14` headers (`bg-[#1A1A2E]/95 backdrop-blur`). `Navbar`'s shared chrome is hidden on pages that render their own header (`hasOwnHeader` in [Navbar.jsx](src/components/Navbar.jsx)).

## Demo philosophy

Outcomes are deterministic and scripted rather than computed — the same 3 talents are recommended regardless of category, nego scripts always resolve the same way, and every step has an "Isi contoh cepat (demo)" quick-fill button for fast live traversal.
