// ── TASK DATA ────────────────────────────────────────────────────────────────
// Keys match the 6 skills in src/data/skillMaps.js (PRD §2.2) — same client
// persona used in each skill's map, so the onboarding preview and the actual
// Skill Map tell a consistent story.
export const TASK_DATA = {
  'Social Media': {
    id: 'social-warung-kopi-abadi',
    title: 'Konten Promosi Menu Baru',
    client: 'Warung Kopi Abadi',
    category: 'Social Media',
    description:
      'Kelola akun Instagram & TikTok Warung Kopi Abadi untuk memperkenalkan menu baru, Es Kopi Gula Aren, ke target audiens muda yang suka nongkrong.',
    requirements: [
      'Format video 9:16 (portrait), durasi 15-30 detik',
      'Hook kuat di 2 detik pertama video',
      'Caption punya CTA jelas + ajakan interaksi',
      'Jadwal posting konsisten 3-4x seminggu',
    ],
    deadline: '3 hari',
    format: 'Video MP4 + caption teks',
    tips: 'Gunakan elemen sensori (suara, tekstur) di detik-detik awal biar orang berhenti scroll.',
    reward: '150 XP',
    level: 'Beginner',
  },
  'Video & Reels': {
    id: 'video-kedai-mie-legenda',
    title: 'Video Promosi Mie Nyemek Pedas',
    client: 'Kedai Mie Legenda',
    category: 'Video & Reels',
    description:
      'Produksi 1 video pendek untuk TikTok & Reels yang mempromosikan menu Mie Nyemek Pedas dengan hook kuat agar tidak di-skip.',
    requirements: [
      'Rasio 9:16 portrait, durasi 15-30 detik',
      'Hook visual di detik 0-2 (bukan intro logo)',
      'Teks overlay harga & lokasi tercantum jelas',
      'Pace potongan gambar mengikuti tempo musik',
    ],
    deadline: '3 hari',
    format: 'Video MP4, max 50MB',
    tips: 'Close-up tekstur makanan di detik pertama biasanya paling ampuh jadi hook.',
    reward: '150 XP',
    level: 'Beginner',
  },
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
  'E-Commerce': {
    id: 'ecommerce-toko-sepatu-bumi',
    title: 'Optimasi Listing Marketplace',
    client: 'Toko Sepatu Bumi',
    category: 'E-Commerce',
    description:
      'Perbaiki listing produk Toko Sepatu Bumi di Shopee & Tokopedia agar muncul di hasil pencarian dan meyakinkan pembeli baru untuk checkout.',
    requirements: [
      'Judul listing mengandung keyword utama',
      'Foto produk minimal 4 sudut berbeda',
      'Deskripsi mencantumkan size chart & bahan',
      'Kebijakan garansi/retur tercantum jelas',
    ],
    deadline: '2 hari',
    format: 'Dokumen listing + foto produk',
    tips: 'Judul harus mengandung kata yang benar-benar diketik calon pembeli di search bar.',
    reward: '125 XP',
    level: 'Beginner',
  },
  'Digital Marketing': {
    id: 'marketing-klinik-glow',
    title: 'Campaign Iklan Treatment Baru',
    client: 'Klinik Kecantikan Glow',
    category: 'Digital Marketing',
    description:
      'Susun campaign Meta Ads untuk treatment facial baru Klinik Kecantikan Glow dengan tujuan booking konsultasi, bukan sekadar jangkauan.',
    requirements: [
      'Objective campaign: Conversions/Leads (booking)',
      'Targeting spesifik: demografi + radius lokasi + minat',
      'Ad copy punya CTA dan urgency yang jelas',
      'Visual before/after sesuai etika iklan kecantikan',
    ],
    deadline: '3 hari',
    format: 'Ad copy + setup targeting (dokumen)',
    tips: 'Targeting yang sempit dan relevan jauh lebih efisien untuk budget terbatas.',
    reward: '150 XP',
    level: 'Beginner',
  },
  'UGC Creator': {
    id: 'ugc-alami-skincare',
    title: 'Video Review Autentik',
    client: 'Skincare Lokal Alami',
    category: 'UGC Creator',
    description:
      'Buat 1 video review produk skincare Alami yang terasa autentik dan jujur, lengkap dengan disclosure kerja sama sesuai etika konten berbayar.',
    requirements: [
      'Label kerja sama/iklan tercantum jelas',
      'Gaya bicara natural, bukan skrip kaku',
      'Struktur cerita: masalah → proses → hasil',
      'Before/after ditunjukkan jujur',
    ],
    deadline: '4 hari',
    format: 'Video MP4, max 100MB',
    tips: 'Ceritakan pengalaman nyata dari kamar sendiri — jangan terlalu "iklan TV".',
    reward: '125 XP',
    level: 'Beginner',
  },
};
