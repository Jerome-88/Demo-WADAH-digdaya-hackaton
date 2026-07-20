// ── Data for the "Pengguna Jasa" (UMKM) matching → contract → nego flow ────────
// Keyed by the same skill ids as src/data/skillMaps.js (SKILLS).

export function formatRupiah(n) {
  return `Rp ${n.toLocaleString('id-ID')}`;
}

export const DURASI_OPTIONS = ['1 Minggu', '1 Bulan', '3 Bulan', 'Fleksibel'];

// AI "scope analysis" shown after the UMKM describes their project — a
// breakdown of likely deliverables per skill, not a price estimate.
export const SCOPE_TEMPLATES = {
  social: [
    'Buat 12 konten per bulan (3x seminggu)',
    'Kelola komentar & DM harian',
    'Story update 5x seminggu',
    'Laporan performa bulanan',
  ],
  video: [
    'Produksi 4 video pendek per bulan',
    'Riset hook & tren mingguan',
    'Revisi 1x per video',
    'Laporan performa bulanan',
  ],
  desain: [
    'Buat 8 desain visual per bulan',
    'Revisi maksimal 2x per desain',
    'Konsisten dengan brand guideline',
    'Laporan hasil bulanan',
  ],
  ecommerce: [
    'Optimasi listing produk aktif',
    'Setup & pantau iklan marketplace',
    'Kelola pesanan harian',
    'Laporan penjualan bulanan',
  ],
  marketing: [
    'Setup & jalankan campaign aktif',
    'Optimasi budget & audience mingguan',
    'A/B testing materi iklan',
    'Laporan performa campaign bulanan',
  ],
  ugc: [
    'Produksi 4 video review per bulan',
    'Riset produk sebelum syuting',
    'Revisi 1x per video',
    'Laporan performa konten bulanan',
  ],
};

// The curated talents shown in Step 3 — static regardless of chosen skill,
// matching this codebase's existing deterministic-demo precedent. Only the
// first 3 are ever shown as cards (see CURATED_TALENTS_DISPLAY below); Dewi
// stays in the data purely as the reject-chain fallback.
//
// Rina Kusumawati is deliberately card #1 — she's the exact same persona
// used throughout the Talent-side demo (Skill Map, Unit, Profile pages).
// Showing her as the top recommendation here closes the loop live in a demo:
// the talent who just trained on WADAH is the one UMKM gets matched to.
export const CURATED_TALENTS = [
  {
    slug: 'rina-kusumawati',
    initials: 'RK',
    avatarImg: '/rina.jpg',
    avatarBg: '#7C3AED',
    name: 'Rina Kusumawati',
    role: 'Desain Grafis Specialist',
    location: 'Jakarta',
    responseTime: '15 menit',
    matchReason: 'Baru menyelesaikan checkpoint Desain Grafis di WADAH · Verified Portfolio aktif · Level 2',
    score: 9.5,
    matchPct: 99,
    bio: 'Talent WADAH yang baru menyelesaikan simulasi kerja Desain Grafis dengan skor tinggi. Portfolio-nya sudah diverifikasi human reviewer dan siap menerima proyek nyata pertamanya.',
    competencies: [
      { label: 'Canvas & Layout',              score: 9.4 },
      { label: 'Tipografi & Hierarki Visual',  score: 9.2 },
      { label: 'Psikologi Warna',              score: 9.0 },
      { label: 'Interpretasi Brief Klien',     score: 9.3 },
    ],
    riwayat: [
      { icon: '🎨', task: 'Poster Promosi',            umkm: 'Kopi Senja',           score: 9.2 },
      { icon: '✅', task: 'Checkpoint Desain Grafis',  umkm: 'WADAH Career Sandbox', score: 9.2 },
    ],
    skills: ['Canva', 'Figma Dasar', 'Layout & Tipografi', 'Psikologi Warna', 'Brand Consistency'],
  },
  {
    slug: 'siti-aminah',
    initials: 'SA',
    avatarBg: '#4F46E5',
    name: 'Siti Aminah',
    role: 'Social Media Specialist',
    location: 'Bandung',
    responseTime: '1 jam',
    matchReason: 'Spesialisasi UMKM kuliner lokal · 3 simulasi F&B selesai · skor brand voice 9.2/10',
    score: 9.2,
    matchPct: 97,
    bio: 'Social media specialist yang fokus di brand UMKM kuliner lokal. Suka riset tone brand dulu sebelum eksekusi konten, dan responsif buat revisi cepat.',
    competencies: [
      { label: 'Social Media Management', score: 9.4 },
      { label: 'Copywriting & Caption',    score: 9.1 },
      { label: 'Community Management',     score: 9.0 },
      { label: 'Analisis Konten',          score: 8.8 },
    ],
    riwayat: [
      { icon: '☕', task: 'Admin Sosmed',     umkm: 'Toko Kopi Abadi',    score: 9.2 },
      { icon: '👗', task: 'Konten Kreator',   umkm: 'Batik Nusantara',    score: 9.0 },
    ],
    skills: ['Instagram', 'TikTok', 'Copywriting', 'Content Planning', 'Community Management', 'Canva'],
  },
  {
    slug: 'rizky-aulia',
    initials: 'RA',
    avatarBg: '#7C3AED',
    name: 'Rizky Aulia',
    role: 'Content Creator UMKM',
    location: 'Jakarta',
    responseTime: '30 menit',
    matchReason: 'Pengalaman TikTok & Reels · target audience usia 18-25 · available mulai besok',
    score: 8.8,
    matchPct: 91,
    bio: 'Content creator yang fokus bikin video pendek buat brand yang menyasar Gen Z. Cepat translate brief jadi konsep visual yang catchy.',
    competencies: [
      { label: 'Video & Reels Production', score: 9.0 },
      { label: 'Scripting & Hook',         score: 8.7 },
      { label: 'Editing (CapCut)',         score: 8.9 },
      { label: 'Trend Analysis',           score: 8.6 },
    ],
    riwayat: [
      { icon: '🍜', task: 'Video Promosi',   umkm: 'Kedai Mie Legenda',   score: 8.9 },
      { icon: '🧋', task: 'Konten TikTok',   umkm: 'Teh Kekinian Jaya',   score: 8.7 },
    ],
    skills: ['TikTok', 'Reels', 'CapCut', 'Scripting', 'Trend Research', 'Hook Writing'],
  },
  {
    slug: 'dewi-wulandari',
    initials: 'DW',
    avatarBg: '#0F766E',
    name: 'Dewi Wulandari',
    role: 'Digital Marketing Ops',
    location: 'Yogyakarta',
    responseTime: '20 menit',
    matchReason: 'Budget-friendly · response time cepat · telah bantu 2 UMKM kebutuhan serupa',
    score: 8.5,
    matchPct: 88,
    bio: 'Digital marketing ops yang biasa pegang campaign kecil-menengah buat UMKM. Teliti soal budget dan suka kasih laporan performa yang gampang dimengerti.',
    competencies: [
      { label: 'Campaign Setup',           score: 8.7 },
      { label: 'Ads Budget Management',    score: 8.6 },
      { label: 'Copywriting Iklan',        score: 8.3 },
      { label: 'Reporting & Analisis',     score: 8.4 },
    ],
    riwayat: [
      { icon: '💅', task: 'Campaign Ads',    umkm: 'Klinik Kecantikan Glow', score: 8.6 },
      { icon: '👟', task: 'Setup Iklan',     umkm: 'Toko Sepatu Bumi',       score: 8.4 },
    ],
    skills: ['Meta Ads Manager', 'TikTok Ads', 'Campaign Setup', 'Budget Optimization', 'Reporting'],
  },
];

// The 3 cards actually rendered in Step 3 — Dewi is kept out of the visible
// set but stays reachable via the reject-chain fallback below.
export const CURATED_TALENTS_DISPLAY = CURATED_TALENTS.slice(0, 3);

export function getTalentBySlug(slug) {
  return CURATED_TALENTS.find(t => t.slug === slug) || null;
}

// How each curated talent responds when a Draft Kontrak is sent to them.
// Rina declines the initial offer and opens a negotiation — she's the top
// card and the one tied to the live Rina persona, so walking through her
// nego path is the most narratively coherent one to demo. Siti has her own
// fully-scripted nego path too. Rizky/Dewi accept outright so no path
// dead-ends without bespoke nego copy.
export const TALENT_RESPONSE = {
  'rina-kusumawati': 'nego',
  'siti-aminah': 'nego',
  'rizky-aulia': 'accept',
  'dewi-wulandari': 'accept',
};

// Order to offer the next talent in when one is rejected/declines.
export const NEXT_TALENT = {
  'rina-kusumawati': 'siti-aminah',
  'siti-aminah': 'rizky-aulia',
  'rizky-aulia': 'dewi-wulandari',
  'dewi-wulandari': null,
};

// Negotiation script — Rina and Siti are the two talents reachable under
// the default TALENT_RESPONSE script above, so both need authored dialogue.
export const NEGO_SCRIPT = {
  'rina-kusumawati': {
    openingMessage: 'Halo! Makasih banyak sudah tertarik sama portofolio gw 😊\n\nSoal budget yang kamu ajukan — itu agak di bawah rate yang biasa gw pasang untuk scope desain kayak gini. Biasanya gw charge Rp650rb/bulan, biar gw bisa riset brand kamu dulu dan revisi sampai kamu puas.\n\nGimana, cocok?',
    agreedBudget: 650000,
    agreedDurasi: '1 Bulan',
    confirmUser: 'Oke, deal Rp650rb/bulan untuk 1 bulan!',
    confirmTalent: 'Sip, gaskeun! 🙌 Kontrak finalnya gw kirim sekarang ya.',
    counterAck: 'Oke boleh, gw kasih di angka itu asal tetep komitmen 1 bulan ya. Deal? 🤝',
  },
  'siti-aminah': {
    openingMessage: 'Halo! Terima kasih sudah tertarik dengan profil gw 😊\n\nUntuk scope yang kamu describe — kelola Instagram + konten promosi mingguan — gw biasanya charge Rp 800rb/bulan.\n\nTapi kalau bisa kontrak 3 bulan, gw bisa kasih Rp 700rb/bulan. Gimana?',
    agreedBudget: 700000,
    agreedDurasi: '3 Bulan',
    confirmUser: 'Deal! Setuju Rp 700rb/bulan untuk 3 bulan.',
    confirmTalent: 'Siap! Gw kirim kontrak finalnya ya 🤝',
    counterAck: 'Hmm oke deh, gw bisa kasih di angka itu asal tetep kontrak 3 bulan ya. Deal? 🤝',
  },
};
