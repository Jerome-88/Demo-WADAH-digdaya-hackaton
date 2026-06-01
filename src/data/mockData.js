// ── TASK DATA ────────────────────────────────────────────────────────────────
export const TASK_DATA = {
  'Desain Grafis': {
    id: 'desain-grafis-pak-budi',
    title: 'Konten Instagram Pak Budi',
    client: 'Warung Makan Pak Budi',
    category: 'Desain Grafis',
    description:
      'Buat 1 konten Instagram Feed (1080x1080px) untuk promosi menu spesial warung makan Pak Budi. Konten harus menarik, mudah dibaca, dan mencerminkan nuansa hangat keluarga.',
    requirements: [
      'Ukuran 1080x1080px (format Instagram Feed)',
      'Warna utama: merah bata dan kuning emas (sesuai brand warung)',
      'Tampilkan nama menu: "Nasi Goreng Spesial" beserta harga Rp 25.000',
      'Sertakan tagline: "Rasa Rumahan, Harga Terjangkau"',
      'Font mudah dibaca, minimal ukuran 18pt untuk teks utama',
      'Tambahkan elemen visual makanan (ilustrasi atau foto)',
    ],
    deadline: '2 hari',
    format: 'JPG / PNG, max 5MB',
    tips: 'Gunakan kontras warna yang cukup (minimal 4.5:1) agar teks terbaca di layar kecil.',
    reward: '100 XP',
    level: 'Beginner',
  },
  'Social Media': {
    id: 'social-media-umkm',
    title: 'Kalender Konten Bulanan',
    client: 'UMKM Kerajinan Tangan',
    category: 'Social Media',
    description:
      'Buat kalender konten sosial media untuk satu bulan penuh (30 hari). Konten harus variatif, engaging, dan sesuai target audiens milenial.',
    requirements: [
      'Minimal 20 ide konten per bulan',
      'Variasi format: feed, stories, reels',
      'Caption siap pakai untuk 10 konten',
      'Hashtag strategy per kategori konten',
    ],
    deadline: '3 hari',
    format: 'Google Sheets / Excel',
    tips: 'Gunakan 80/20 rule: 80% konten edukatif/hiburan, 20% promosi.',
    reward: '150 XP',
    level: 'Beginner',
  },
  Copywriting: {
    id: 'copywriting-startup',
    title: 'Landing Page Copy',
    client: 'Startup Fintech Lokal',
    category: 'Copywriting',
    description:
      'Tulis copy untuk landing page startup fintech. Fokus pada value proposition yang jelas dan CTA yang kuat.',
    requirements: [
      'Hero headline + subheadline',
      'Minimal 3 seksi benefit',
      'Testimoni fiktif (3 buah)',
      'CTA button copy minimal 5 variasi',
    ],
    deadline: '2 hari',
    format: 'Google Doc',
    tips: 'Gunakan formula AIDA: Attention, Interest, Desire, Action.',
    reward: '125 XP',
    level: 'Beginner',
  },
};

// ── RINA AI TUTOR FLOWS ───────────────────────────────────────────────────────
export const RINA_TUTOR_FLOWS = [
  {
    keywords: ['warna', 'color', 'merah', 'kuning', 'biru', 'hijau', 'kontras'],
    response:
      'Soal warna nih! 🎨 Saya analisis kombinasi **merah bata (#8B2500)** dan **kuning emas (#D4A017)** yang diminta brief.\n\nHasilnya: kontras ratio cuma **2.5:1** — di bawah standar minimum WCAG **4.5:1** untuk teks normal.\n\n**Solusi cepat:**\n- Gelapi background merah ke #6B1A00\n- Atau pakai teks putih (#FFFFFF) di atas merah → kontras 7.2:1 ✅\n- Kuning emas bagus untuk aksen, tapi hindari di atas putih\n\nMau saya bantu cek kombinasi warna lain?',
  },
  {
    keywords: ['sudah', 'baik', 'oke', 'ok', 'bagus', 'selesai', 'done', 'fix', 'beres'],
    response:
      'Wah, progress bagus! ✨ Warna sudah diperbaiki — kontras sekarang lebih baik.\n\n**Tapi ada satu hal lagi yang perlu diperhatikan:** CTA button kamu terlalu kecil! 😅\n\nSaya deteksi teks CTA hanya **12pt** — padahal untuk konten Instagram yang dilihat di layar HP, minimal **24pt** biar mudah dibaca.\n\n**Checklist sebelum submit:**\n- ✅ Kontras warna sudah ≥ 4.5:1\n- ⚠️ Perbesar teks CTA ke **24pt**\n- ⚠️ Pastikan nama menu "Nasi Goreng Spesial" paling menonjol\n- ✅ Tagline sudah ada\n\nSetelah itu, hasilnya siap dikumpulkan!',
  },
  {
    keywords: ['keterbacaan', 'teks', 'tulisan', 'font', 'baca', 'huruf', 'tipografi'],
    response:
      '**Keterbacaan teks** adalah faktor kunci desain konten Instagram! 📖\n\n**Kontras Ratio** adalah perbandingan kecerahan antara teks dan background:\n- Teks normal (≥18px): minimal **4.5:1**\n- Teks besar (≥24px bold): minimal **3:1**\n- Teks dekoratif: tidak ada syarat khusus\n\n**Tools gratis untuk cek:**\n- WebAIM Contrast Checker\n- Adobe Color Accessibility\n- Figma plugin: Color Contrast Checker\n\n**Tips praktis:**\n- Teks gelap di background terang → paling aman\n- Hindari teks abu-abu di background putih\n- Untuk warung makan: teks putih/krem di background gelap = elegan + terbaca',
  },
  {
    keywords: ['brief', 'tugas', 'instruksi', 'ketentuan', 'syarat', 'requirement'],
    response:
      '**Ringkasan Brief Pak Budi** 📋\n\n**Klien:** Warung Makan Pak Budi\n**Output:** 1 konten Instagram Feed 1080x1080px\n\n**Wajib ada:**\n1. 🎨 Warna brand: merah bata + kuning emas\n2. 🍛 Nama menu: "Nasi Goreng Spesial"\n3. 💰 Harga: Rp 25.000\n4. 💬 Tagline: "Rasa Rumahan, Harga Terjangkau"\n5. 📝 Font minimal 18pt untuk teks utama\n6. 🖼️ Elemen visual makanan\n\n**Kriteria AI Evaluasi:**\n- Kesesuaian brief (30%)\n- Keterbacaan & kontras (25%)\n- Konsistensi visual (25%)\n- Relevansi audiens (20%)\n\nAda bagian yang mau ditanyakan lebih detail?',
  },
  {
    keywords: ['cta', 'call to action', 'tombol', 'button', 'klik'],
    response:
      'CTA (Call-to-Action) untuk konten Instagram itu penting banget! 📣\n\n**Best practice CTA di konten feed:**\n- Posisi: pojok kanan bawah atau tengah bawah\n- Ukuran: minimal 24pt, bold\n- Warna: kontras tinggi dengan background\n- Contoh teks: "Order Sekarang!", "Hubungi Kami", "Kunjungi Kami"\n\n**Untuk brief Pak Budi:**\nMeskipun tidak disebutkan eksplisit, tambahkan elemen seperti:\n- Nomor WhatsApp / kontak\n- Jam buka warung\n- Lokasi singkat\n\nIni akan bikin konten lebih fungsional dan naik skor Relevansi Audiens! 🎯',
  },
  {
    keywords: ['ukuran', 'size', 'dimensi', 'pixel', 'px', 'resolusi'],
    response:
      '**Spesifikasi Teknis Instagram Feed** 📐\n\n- Ukuran optimal: **1080 x 1080px** (square)\n- Aspect ratio: 1:1\n- Format: JPG atau PNG\n- Ukuran file: maksimal **5MB** (sesuai brief)\n- Resolusi: 72 DPI untuk digital\n\n**Tips di Canva:**\n1. Pilih template "Instagram Post"\n2. Pastikan elemen tidak terpotong (safe area: 50px dari tiap sisi)\n3. Export → Download → JPG, quality 90%+\n\n**Tips di Photoshop:**\n- New Document → 1080x1080px, 72 DPI, RGB Color\n- Save for Web → JPG, Quality 80+',
  },
];

// Default fallback responses
export const RINA_TUTOR_DEFAULT = [
  'Hmm, saya belum punya referensi spesifik untuk pertanyaan itu. Coba tanyakan tentang **warna**, **keterbacaan teks**, **brief tugas**, atau **ukuran konten**! 🤔',
  'Pertanyaan bagus! Untuk jawaban lebih spesifik, coba kata kunci: **kontras**, **CTA**, **tipografi**, atau **spesifikasi teknis**. Saya siap membantu! 💪',
  'Saya AI Tutor WADAH yang fokus di desain grafis konten sosial media. Coba tanya tentang **warna brand Pak Budi**, **keterbacaan teks**, atau **checklist sebelum submit**! ✨',
];

// ── JASA AI RESPONSES ─────────────────────────────────────────────────────────
export const JASA_AI_RESPONSES = [
  {
    trigger: 'clarify1',
    question: 'Baik! Saya perlu beberapa klarifikasi untuk menemukan talenta terbaik. Pertama, apakah konten ini untuk feed Instagram, Stories, atau keduanya? Dan berapa frekuensi posting yang diinginkan per minggu?',
    userReply: 'Feed Instagram, 3 post per minggu.',
  },
  {
    trigger: 'clarify2',
    question: 'Sempurna! Satu pertanyaan terakhir: apakah Anda sudah memiliki panduan brand (warna, font, logo)? Dan adakah referensi konten yang Anda suka dari kompetitor atau brand lain?',
    userReply: 'Sudah ada logo dan warna merah-kuning. Suka gaya yang bersih dan hangat.',
  },
];

// ── PORTFOLIO / TALENT DATA ───────────────────────────────────────────────────
export const PORTFOLIO_DATA = [
  {
    id: 'siti',
    name: 'Siti Rahayu',
    initials: 'SR',
    match: 97,
    level: 'Level 4 — Intermediate',
    skills: ['Desain Grafis', 'Canva', 'Instagram Content', 'Branding'],
    location: 'Jakarta Selatan',
    responseTime: '1 jam',
    completedProjects: 12,
    avgScore: 88,
    bio: 'Desainer grafis berpengalaman dengan fokus pada UMKM food & beverage. Telah membantu 12+ klien meningkatkan engagement media sosial.',
    portfolio: [
      { title: 'Branding Kafe Kopi Lokal', score: 91, category: 'Branding' },
      { title: 'Konten Ramadhan Restoran', score: 87, category: 'Social Media' },
      { title: 'Flyer Promo Toko Kue', score: 85, category: 'Desain Grafis' },
    ],
    matchReason: 'Spesialisasi F&B, 12 proyek selesai, skor rata-rata 88%',
  },
  {
    id: 'rizky',
    name: 'Rizky Pratama',
    initials: 'RP',
    match: 91,
    level: 'Level 3 — Verified Beginner',
    skills: ['Desain Grafis', 'Adobe Photoshop', 'Typography', 'Color Theory'],
    location: 'Bandung',
    responseTime: '2 jam',
    completedProjects: 7,
    avgScore: 82,
    bio: 'Fresh graduate DKV dengan passion di desain konten kuliner. Kuat di tipografi dan teori warna.',
    portfolio: [
      { title: 'Menu Digital Warung Padang', score: 84, category: 'Desain Grafis' },
      { title: 'Poster Promo Bakso', score: 80, category: 'Desain Grafis' },
      { title: 'Konten IG Catering', score: 83, category: 'Social Media' },
    ],
    matchReason: 'Background DKV, kuat tipografi, 7 proyek terverifikasi',
  },
  {
    id: 'dewi',
    name: 'Dewi Anggraini',
    initials: 'DA',
    match: 88,
    level: 'Level 3 — Verified Beginner',
    skills: ['Desain Grafis', 'Canva', 'Social Media', 'Content Strategy'],
    location: 'Surabaya',
    responseTime: '3 jam',
    completedProjects: 5,
    avgScore: 79,
    bio: 'Content creator yang juga mahir desain grafis. Fokus pada konten yang engaging dan sesuai algoritma Instagram terkini.',
    portfolio: [
      { title: 'Feed Instagram UMKM Fashion', score: 81, category: 'Social Media' },
      { title: 'Banner Promo Hari Raya', score: 78, category: 'Desain Grafis' },
      { title: 'Kalender Konten Bulanan', score: 77, category: 'Content Strategy' },
    ],
    matchReason: 'Pengalaman content strategy, familiar algoritma IG',
  },
];

// ── EVALUATION SCORES ─────────────────────────────────────────────────────────
export const RINA_EVAL_SCORES = {
  brief: 85,
  readability: 78,
  visual: 72,
  relevance: 80,
  total: 79,
};
