/* ============================================================
   WADAH — AI Career Platform
   data.js: all mock data, constants, and shared state
   Must be loaded FIRST before all other JS files.
   ============================================================ */

/* ===== SHARED STATE ===== */
// These variables are read and written across multiple JS files
let selectedSkills  = [];   // skills chosen in step 1 (talent flow)
let mentorMsgCount  = 0;    // number of exchanges in AI Mentor
let defaultIdx      = 0;    // fallback response index for AI Mentor
let sbStep          = 0;    // sandbox step counter (legacy, kept for reset)
let quizQ           = 0;    // quiz question index (legacy, kept for reset)
let aiChatCount     = 0;    // jasa flow AI chat counter

/* ===== TASK DATA (dynamic preview per skill) ===== */
const TASK_DATA = {
  'Social Media': {
    tag:     '📱 SOCIAL MEDIA',
    title:   'Admin Sosial Media — Toko Kopi Abadi',
    company: '🏢 UMKM Kuliner · Bandung',
    desc:    'Kamu akan berperan sebagai Admin Sosial Media untuk Toko Kopi Abadi. SOP mereka: nada hangat, lokal, autentik. Tugasmu: buat caption promosi, respons komentar, dan rancang strategi konten mingguan.',
    time:    '30–45 menit',
    tasks:   '2 Tugas utama',
    skill:   'Copywriting + Social Media',
    match:   'Rp 500rb–1.5jt/bulan',
  },
  'Copywriting': {
    tag:     '✍️ COPYWRITING',
    title:   'Copywriter Konten — Skincare Lokal Glow.id',
    company: '🏢 UMKM Beauty · Jakarta',
    desc:    'Buat copy untuk landing page, email blast, dan iklan Instagram Glow.id — brand skincare lokal yang ingin terasa premium tapi tetap dekat dengan konsumen muda Indonesia.',
    time:    '25–40 menit',
    tasks:   '3 Tugas utama',
    skill:   'Ad Copy + SEO Writing',
    match:   'Rp 400rb–1.2jt/proyek',
  },
  'Desain Grafis': {
    tag:     '🎨 DESAIN GRAFIS',
    title:   'Desainer Visual — Warung Makan Bu Sari',
    company: '🏢 UMKM Kuliner · Surabaya',
    desc:    'Rancang template feed Instagram untuk 12 post dan desain menu digital. Tema: tradisional Jawa, hangat, warna earth tone. Gunakan Canva atau tools pilihan kamu.',
    time:    '40–60 menit',
    tasks:   '2 Tugas utama',
    skill:   'Visual Design + Canva',
    match:   'Rp 350rb–1jt/proyek',
  },
  'E-Commerce': {
    tag:     '🛒 E-COMMERCE',
    title:   'Pengelola Toko Online — Batik Nusantara',
    company: '🏢 UMKM Fashion · Yogyakarta',
    desc:    'Optimalkan listing produk di Shopee dan Tokopedia untuk Batik Nusantara. Tugas: briefing foto produk, deskripsi produk yang convert, dan setup iklan berbayar.',
    time:    '35–50 menit',
    tasks:   '2 Tugas utama',
    skill:   'Marketplace Management',
    match:   'Rp 600rb–2jt/bulan',
  },
  'Web Dev': {
    tag:     '💻 WEB DEV',
    title:   'Frontend Developer — AgriConnect Indonesia',
    company: '🏢 Startup AgriTech · Bogor',
    desc:    'Build landing page untuk AgriConnect — platform yang menghubungkan petani lokal dengan pembeli. Stack: HTML, CSS, vanilla JS. Desain sudah disiapkan dalam bentuk wireframe.',
    time:    '60–90 menit',
    tasks:   '3 Tugas utama',
    skill:   'HTML/CSS + JavaScript',
    match:   'Rp 1jt–3jt/proyek',
  },
  'Data Analytics': {
    tag:     '📊 DATA ANALYTICS',
    title:   'Analis Data — Apotek Sehat Bersama',
    company: '🏢 UMKM Kesehatan · Bandung',
    desc:    'Analisis data penjualan bulanan Apotek Sehat Bersama menggunakan Excel dan Looker Studio. Identifikasi produk terlaris, tren musiman, dan buat dashboard visual yang mudah dibaca owner.',
    time:    '45–60 menit',
    tasks:   '2 Tugas utama',
    skill:   'Excel + Looker Studio',
    match:   'Rp 400rb–1.2jt/proyek',
  },
};

/* ===== AI MENTOR — MOCK CONVERSATION FLOWS ===== */
// Matched by keyword triggers from user input
const MENTOR_FLOWS = [
  {
    triggers: ['siap', 'oke', 'ok', 'mulai', 'yuk', 'gas', 'lanjut'],
    reply: `Oke! Tugas pertama nih 🎯<br><br>
      <strong>Tugas 1 dari 2:</strong> Toko Kopi Abadi baru rilis menu
      <em>"Es Kopi Gula Aren Special"</em>. Buat 1 caption Instagram yang
      menonjolkan <strong>rasa autentik</strong> sesuai nada bicara SOP mereka.
      <br><br>Tuliskan caption kamu di bawah ini. Sertakan emoji dan hashtag juga ya!`,
  },
  {
    triggers: ['kopi', 'caption', 'instagram', '#', '☕', '🍃', 'satu tegukan',
               'rasa', 'mampir', 'gula aren', 'autentik', 'lokal'],
    reply: `Evaluasi AI Mentor:<br><br>
      ✅ <strong>Relevansi SOP: 9/10</strong> — Nada bicara hangat dan lokal sangat terasa<br>
      ✅ <strong>Kreativitas: 8.5/10</strong> — Caption original dan engaging<br>
      ✅ <strong>Kelengkapan: 9/10</strong> — Hashtag relevan, ada CTA yang jelas<br><br>
      Skor tugas ini: <strong style="color:#059669;font-size:16px;">9/10</strong> 🎉<br><br>
      Lanjut ke <strong>Tugas 2!</strong> Ada komentar negatif masuk:
      <em>"Kopinya kemarin pahit banget, kecewa."</em><br>
      Buat respons profesional yang tetap hangat sesuai SOP!`,
  },
  {
    triggers: ['maaf', 'mohon', 'terima kasih', 'halo kak', 'kak', 'dm',
               'kunjungan', 'terbaik', 'mampir lagi', 'kami'],
    reply: `Sempurna! Evaluasi Tugas 2:<br><br>
      ✅ <strong>Empati: 9.5/10</strong> — Respons sangat hangat dan tidak defensif<br>
      ✅ <strong>Profesionalisme: 9/10</strong> — Solusi konkret ditawarkan<br>
      ✅ <strong>Brand Voice: 10/10</strong> — 100% sesuai nada SOP<br><br>
      <strong style="color:#059669;font-size:18px;">Simulasi Selesai! 🏆</strong><br><br>
      Skor akhirmu: <strong style="font-size:20px;color:#059669;">88/100</strong><br>
      Verified Portfolio Badge: <strong>Social Media Specialist</strong> berhasil diraih!<br><br>
      Cek tab <strong>List Kerjaan</strong> — ada 1 tugas baru yang masuk dari sistem!`,
  },
];

// Fallback responses when no keyword matches
const MENTOR_DEFAULT = [
  `Pertanyaan bagus! Berdasarkan SOP Toko Kopi Abadi, nada bicara mereka sangat
   personal — hindari bahasa formal yang kaku. Gunakan "Kak" dan sapaan hangat.
   Ada yang ingin ditanyakan lagi?`,

  `Betul! Dan jangan lupa — setiap konten harus terasa seperti ditulis oleh manusia,
   bukan mesin. Autentisitas adalah kunci brand Toko Kopi Abadi. Siap lanjut ke tugas?`,

  `Good thinking! Untuk UMKM kuliner lokal, konten terbaik biasanya yang menampilkan
   "behind the scene" atau cerita di balik produk. Coba tulis caption dengan angle itu!`,

  `Noted! Kalau kamu sudah siap, ketik <strong>"siap"</strong> untuk mulai simulasi
   atau tanyakan apapun tentang SOP-nya terlebih dahulu.`,
];

/* ===== JASA FLOW — AI CLARIFICATION RESPONSES ===== */
const AI_JASA_RESPONSES = [
  `Bagus! Dengan brand voice yang jelas, talenta bisa langsung menyesuaikan konten.
   Satu lagi: <strong>apakah kamu punya contoh konten yang sudah kamu suka</strong>
   sebagai referensi untuk talenta?`,

  `Mengerti! Saya sudah merekam semua preferensimu. Sistem WADAH akan mencocokkan
   talenta terbaik berdasarkan skor kompetensi nyata — bukan harga terendah.
   Klik <strong>"Temukan Talenta"</strong> untuk lihat hasilnya!`,
];

/* ===== SKILL DETECTION MAP (upload flow) ===== */
// Maps selected skills to detected skill tags shown after upload
const SKILL_MAPS = {
  'Social Media':   ['Social Media Management', 'Content Planning', 'Instagram Algorithm', 'Copywriting', 'Community Management'],
  'Copywriting':    ['Copywriting', 'SEO Writing', 'Brand Voice', 'Content Strategy', 'Ad Copywriting'],
  'Desain Grafis':  ['Graphic Design', 'Canva', 'Color Theory', 'Typography', 'Brand Identity'],
  'E-Commerce':     ['E-Commerce Management', 'Product Listing', 'Shopee/Tokopedia Ads', 'Inventory Management', 'Customer Service'],
  'Web Dev':        ['HTML/CSS', 'JavaScript', 'React', 'Responsive Design', 'API Integration'],
  'Data Analytics': ['Data Analysis', 'Excel', 'SQL', 'Looker Studio', 'Data Visualization'],
};

// Color pairs [background, text] for skill tags
const DETECTED_COLORS = [
  '#EEF2FF,#4F46E5',
  '#ECFDF5,#059669',
  '#FEF3C7,#D97706',
  '#FDF2F8,#9D174D',
  '#EFF6FF,#1D4ED8',
  '#F0FDF4,#15803D',
];

/* ===== INITIAL AI MENTOR MESSAGE (stored for reset) ===== */
// Populated after DOM loads in navigation.js
let MENTOR_INITIAL = '';