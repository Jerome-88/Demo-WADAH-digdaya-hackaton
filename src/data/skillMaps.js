// ── SKILL META (PRD §2.2 — exact copy) ─────────────────────────────────────────
export const SKILLS = [
  {
    id: 'social',
    label: 'Social Media',
    tagline: 'Kelola akun & tumbuhkan bisnis',
    desc: 'Pelajari cara kelola Instagram dan TikTok UMKM — dari buat konten yang engage, respons komentar, sampai baca analytics. Skill paling banyak dicari UMKM lokal saat ini.',
    tools: 'Instagram, TikTok, Meta Business Suite',
    emoji: '📱',
  },
  {
    id: 'video',
    label: 'Video & Reels',
    tagline: 'Produksi konten video UMKM',
    desc: 'Kuasai seni bikin video yang berhenti di-scroll — dari script, shooting dengan HP, sampai editing. Demand terus naik setiap bulan.',
    tools: 'CapCut, inShot, scripting framework',
    emoji: '🎬',
  },
  {
    id: 'desain',
    label: 'Desain Grafis',
    tagline: 'Visual, branding & poster',
    desc: 'Bantu UMKM tampil profesional lewat feed Instagram konsisten, menu dan brosur menarik, sampai identitas visual yang diingat. Mulai dari Canva, berkembang ke Figma.',
    tools: 'Canva, Figma dasar',
    emoji: '🎨',
  },
  {
    id: 'ecommerce',
    label: 'E-Commerce',
    tagline: 'Toko online & marketplace',
    desc: 'Kelola toko Shopee dan Tokopedia agar produk muncul di pencarian dan laku — dari optimasi listing, setup iklan, sampai kelola pesanan harian.',
    tools: 'Shopee Seller Center, Tokopedia Partner',
    emoji: '🛒',
  },
  {
    id: 'marketing',
    label: 'Digital Marketing',
    tagline: 'Iklan & campaign berbayar',
    desc: 'Jalankan iklan Meta dan TikTok Ads yang benar-benar menghasilkan penjualan — setup audience, optimasi budget, baca data campaign.',
    tools: 'Meta Ads Manager, TikTok Ads',
    emoji: '📣',
  },
  {
    id: 'ugc',
    label: 'UGC Creator',
    tagline: 'Konten authentic untuk brand',
    desc: 'Buat konten promosi yang terasa nyata untuk brand UMKM — tanpa perlu followers banyak. Dibayar per konten, diposting di akun brand. Tren naik daun 2026.',
    tools: 'Smartphone, CapCut, brief template',
    emoji: '🤳',
  },
];

export const DEFAULT_SKILL = 'desain';

export function getSkillMeta(skillId) {
  return SKILLS.find(s => s.id === skillId) ?? SKILLS.find(s => s.id === DEFAULT_SKILL);
}

// Node ids like "1.1" become URL-safe "1-1"; checkpoint ids ("checkpoint-1")
// already are URL-safe and pass through unchanged.
export function nodeIdToSlug(nodeId) {
  return /^\d+\.\d+$/.test(nodeId) ? nodeId.replace('.', '-') : nodeId;
}

// Parses a "/unit/:unitParam" segment (e.g. "desain-1-1") back into
// { skillId, nodeId }. Returns null if the skill prefix isn't recognized.
export function parseUnitParam(unitParam) {
  const skill = SKILLS.find(s => unitParam.startsWith(`${s.id}-`));
  if (!skill) return null;
  const rest = unitParam.slice(skill.id.length + 1);
  const nodeId = /^\d+-\d+$/.test(rest) ? rest.replace('-', '.') : rest;
  return { skillId: skill.id, nodeId };
}

// ── SKILL MAPS — Peta Misi per skill ───────────────────────────────────────────
// Each map: mapTitle, unitNote, checklist (for /rina/submit), nodes[5]
// Node shape (type 'quiz'): id, title, icon, tag, info, briefLabel, briefBody,
//   materi: { intro, points[] }, aiIntro, suggests[{id,text,answer}],
//   questions: [{ question, options[4], correctIndex, explanation }]
// Node shape (type 'checkpoint'): id, title, icon, tag, info, briefLabel,
//   briefBullets[{strong,rest}], aiIntro, suggests, instruction, deadlineText
export const SKILL_MAPS = {
  // ── SOCIAL MEDIA — Warung Kopi Abadi (light pass) ───────────────────────────
  social: {
    mapTitle: 'Peta Misi: Admin Sosmed',
    unitNote: 'Unit 1: Fondasi Konten & Kepatuhan Brief (Tingkat Pemula)',
    checklist: [
      'Format video 9:16 (portrait), durasi 15-30 detik',
      'Hook kuat di 2 detik pertama',
      'Caption punya CTA jelas + ajakan interaksi',
      'Jadwal & tone bahasa sesuai brief Warung Kopi Abadi',
    ],
    nodes: [
      {
        id: '1.1', title: 'Format Konten Short-Video', icon: 'fa-hashtag', tag: 'TANTANGAN 1.1', type: 'quiz',
        info: 'Memilih format konten yang paling engaging untuk target audiens muda di Instagram & TikTok.',
        briefLabel: 'Client Mini-Brief:',
        briefBody: '"Halo! Warung Kopi Abadi butuh admin buat pegang akun Instagram & TikTok kami. Minggu ini fokusnya bikin 1 konten yang ngajak orang dateng nyobain menu baru kita, Es Kopi Gula Aren."',
        materi: {
          intro: 'Di media sosial, format konten menentukan seberapa jauh jangkauannya sebelum orang sempat baca isinya.',
          points: [
            'Video pendek dengan elemen sensori (suara, tekstur) punya retention lebih tinggi dari foto statis di Reels/TikTok.',
            'Algoritma kedua platform ini secara aktif mendorong (boost) format video dibanding foto tunggal.',
            'Konten teknis/statistik panjang cocok untuk laporan internal, bukan untuk feed yang di-scroll cepat.',
          ],
        },
        aiIntro: 'Halo Rina! Saya asisten AI Mentor-mu. Di tantangan 1.1 ini, kita bantu Warung Kopi Abadi promosiin menu baru mereka lewat konten short-video. Target audiensnya anak muda yang suka nongkrong.',
        suggests: [
          { id: 'faq-1.1-1', text: 'Kenapa video lebih baik dari foto di sini?', answer: 'Video pendek dengan elemen sensori (suara tuang kopi, uap mengepul) punya retention rate jauh lebih tinggi di Reels/TikTok dibanding foto statis — algoritma juga lebih mendorong format video.' },
          { id: 'faq-1.1-2', text: 'Kenapa infografis kurang pas untuk konten ini?', answer: 'Infografis statistik cocok untuk laporan internal, tapi audiens Reels/TikTok scroll cepat dan cari konten yang enak ditonton dalam hitungan detik, bukan data teknis.' },
        ],
        questions: [
          {
            question: 'Format konten apa yang paling pas buat promosi menu baru dengan target nongkrong anak muda di Instagram & TikTok?',
            options: [
              'Foto produk tunggal dengan caption panjang berisi detail teknis kopi',
              'Video singkat 15 detik proses penyajian + suara ASMR tuang kopi',
              'Infografis statistik penjualan kopi nasional',
              'Video tutorial menyeduh kopi durasi 5 menit penuh',
            ],
            correctIndex: 1,
            explanation: 'Target audiens muda di Reels/TikTok lebih responsif ke video singkat yang engaging — bukan teks panjang, data, atau video yang kelamaan.',
          },
        ],
      },
      {
        id: '1.2', title: 'Ritme Jadwal Posting', icon: 'fa-comments', tag: 'TANTANGAN 1.2', type: 'quiz',
        info: 'Menentukan frekuensi & jam posting yang membangun kebiasaan follower, bukan overposting.',
        briefLabel: 'Kriteria Utama Konsistensi Konten:',
        briefBody: 'Owner Warung Kopi Abadi nanya, sebaiknya kapan & seberapa sering posting biar konsisten dilihat pelanggan tanpa bikin followers bosan atau mute akunnya.',
        materi: {
          intro: 'Konsistensi jadwal jauh lebih penting daripada frekuensi tinggi asal-asalan.',
          points: [
            'Posting di jam yang sama membuat follower "belajar" kapan harus cek akun kita.',
            'Overposting di jam acak justru bikin follower merasa spam dan mute/unfollow akun.',
          ],
        },
        aiIntro: 'Sekarang kita masuk ke strategi jadwal posting. Ingat, di sosial media konsistensi jauh lebih penting daripada asal sering posting.',
        suggests: [
          { id: 'faq-1.2-1', text: 'Kenapa posting terlalu sering itu buruk?', answer: 'Overposting bikin timeline follower penuh sama satu akun terus — hasilnya mereka justru unfollow atau mute, bukan makin engage.' },
          { id: 'faq-1.2-2', text: 'Kenapa jam konsisten itu penting?', answer: 'Kalau kita posting di jam yang sama tiap kali, follower lama-lama "belajar" kapan harus cek akun kita — ini yang membangun kebiasaan checking, bukan sekadar keberuntungan algoritma.' },
        ],
        questions: [
          {
            question: 'Strategi jadwal posting mana yang paling sehat untuk membangun kebiasaan follower checking konten kita?',
            options: [
              'Posting 5-6x sehari di jam acak biar keliatan aktif',
              'Posting 3-4x seminggu di jam konsisten (makan siang & jam pulang kerja)',
              'Posting sekali sebulan saja biar hemat effort',
              'Posting hanya saat ada promo besar-besaran',
            ],
            correctIndex: 1,
            explanation: 'Overposting di jam acak bikin followers merasa spam, sementara posting terlalu jarang bikin akun terlupakan. Konsistensi jadwal-lah yang membangun kebiasaan checking.',
          },
        ],
      },
      {
        id: '1.3', title: 'Elemen Caption Engaging', icon: 'fa-comment-dots', tag: 'TANTANGAN 1.3', type: 'quiz',
        info: 'Mengidentifikasi elemen wajib supaya caption terasa personal dan mengajak interaksi.',
        briefLabel: 'Kombinasi Elemen Caption:',
        briefBody: 'Sebelum posting, cek dulu unsur apa aja yang bikin sebuah caption Instagram/TikTok UMKM kuliner benar-benar "nyantol" di pembaca — bukan sekadar jualan.',
        materi: {
          intro: 'Caption yang bagus bukan cuma soal jualan — ada unsur psikologi interaksi yang bikin orang mau komentar dan bertindak.',
          points: [
            'Pertanyaan ringan ke followers memicu komentar reflek, yang menaikkan jangkauan konten di algoritma.',
            'Call-to-action yang jelas (DM/kunjungi) mengubah "lihat" jadi "tindakan nyata".',
          ],
        },
        aiIntro: 'Caption yang bagus bukan cuma soal jualan, Rina! Ada unsur psikologi interaksi yang bikin orang mau komentar dan bertindak.',
        suggests: [{ id: 'faq-1.3-1', text: 'Kenapa pertanyaan ke followers penting?', answer: 'Pertanyaan ringan (misal "kalian tim manis apa pahit?") memicu komentar reflek — makin banyak komentar, makin tinggi juga jangkauan konten di algoritma.' }],
        questions: [
          {
            question: 'Elemen apa yang paling penting supaya caption mengajak interaksi, bukan sekadar jualan?',
            options: [
              'Harga produk ditulis besar-besar di awal caption',
              'Pertanyaan ringan ke followers + call-to-action yang jelas',
              'Hashtag sebanyak-banyaknya tanpa konteks',
              'Emoji di setiap kata supaya ramai',
            ],
            correctIndex: 1,
            explanation: 'Pertanyaan ringan memicu komentar, dan CTA jelas mengarahkan follower ke tindakan konkret — kombinasi ini yang bikin caption terasa personal, bukan cuma jualan.',
          },
        ],
      },
      {
        id: '1.4', title: 'Membaca Brief & Interpretasi Klien', icon: 'fa-clipboard-check', tag: 'TANTANGAN 1.4', type: 'quiz',
        info: 'Menerjemahkan pesan brief informal dari UMKM jadi requirement konten yang jelas.',
        briefLabel: 'Brief via WhatsApp:',
        briefBody: '"Kak tolong bikinin konten buat weekend ini ya, yang penting rame yang liat, terus jangan lupa sebut promo beli 2 gratis 1." — Owner Warung Kopi Abadi',
        materi: {
          intro: 'Brief UMKM jarang serapi dokumen resmi — tugas kamu menerjemahkan bahasa sehari-hari jadi requirement konten yang jelas.',
          points: [
            'Pisahkan permintaan eksplisit (must-have) dari gaya bahasa santai di sekitarnya.',
            'Kalau ada bagian ambigu ("yang rame yang liat"), catat asumsi kamu (mis. pakai hook + jam posting strategis) sebelum eksekusi.',
          ],
        },
        aiIntro: 'Brief UMKM sering datang lewat chat santai, Rina — kemampuan menerjemahkan itu jadi konten yang benar sama pentingnya dengan skill teknis produksi.',
        suggests: [{ id: 'faq-1.4-1', text: 'Bagaimana cara memastikan interpretasi saya benar?', answer: 'Kalau ada bagian ambigu, tulis balik ringkasan pemahamanmu ke klien sebelum eksekusi — ini mencegah revisi besar di akhir.' }],
        questions: [
          {
            question: 'Dari brief WhatsApp di atas, mana yang termasuk requirement WAJIB (must-have)?',
            options: [
              'Promo "beli 2 gratis 1" harus disebutkan di konten',
              'Konten harus direkam di hari Sabtu pagi',
              'Warna konten harus berbeda dari biasanya',
              'Video harus berdurasi tepat 30 detik',
            ],
            correctIndex: 0,
            explanation: '"Jangan lupa sebut promo beli 2 gratis 1" adalah permintaan eksplisit — itu must-have. Sisanya ("yang rame yang liat") adalah tujuan, bukan instruksi teknis spesifik.',
          },
        ],
      },
      {
        id: 'checkpoint-1', title: 'Kastil Checkpoint 1', icon: 'fa-fort-awesome', tag: 'UJIAN REVISI', type: 'checkpoint',
        info: 'Ujian mandiri caption promosi Warung Kopi Abadi lengkap sebelum membuka gerbang kerja!',
        briefLabel: 'Brief Mandatori Proyek Komersial:',
        briefBullets: [
          { strong: 'Wajib Ada Hook:', rest: ' kalimat pembuka yang bikin orang berhenti scroll dalam 2 detik pertama.' },
          { strong: 'Wajib CTA Konkret:', rest: ' ajakan jelas seperti "Mampir yuk" atau "DM buat reservasi".' },
          { strong: 'Tone Bahasa:', rest: ' santai dan hangat, bukan formal ala press release.' },
        ],
        materi: {
          intro: 'Ini adalah ujian Checkpoint — gabungan dari semua yang sudah kamu pelajari di Unit 1.',
          points: [
            'Kamu akan direview lewat quiz singkat yang merangkum 4 topik sebelumnya.',
            'Setelah lulus quiz, kamu masuk ke Tantangan Nyata: mengerjakan deliverable asli dengan deadline 7 hari.',
            'Tantangan dinilai 100% oleh human reviewer, bukan skor otomatis.',
          ],
        },
        aiIntro: 'Ini adalah ujian Checkpoint pertama-mu! Baca brief di atas baik-baik, lalu kumpulkan hasil kerjamu untuk direview human reviewer kami.',
        suggests: [{ id: 'faq-cp-1', text: 'Kenapa harus direview manusia, bukan AI saja?', answer: 'Tone bahasa yang "kerasa asli" itu sulit dinilai objektif oleh AI semata — human reviewer memastikan caption benar-benar cocok dengan karakter brand sebelum tayang ke publik.' }],
        instruction: 'Kumpulkan 1 caption + rencana visual konten sesuai brief di atas.',
        deadlineText: '7 hari',
      },
    ],
  },

  // ── VIDEO & REELS — Kedai Mie Legenda (light pass) ──────────────────────────
  video: {
    mapTitle: 'Peta Misi: Video Creator',
    unitNote: 'Unit 1: Fondasi Hook & Kepatuhan Brief (Tingkat Pemula)',
    checklist: [
      'Format 9:16 portrait, durasi 15-30 detik',
      'Hook visual kuat di detik 0-2',
      'Teks overlay harga & lokasi tercantum',
      'Pace & musik sesuai tren short-video',
    ],
    nodes: [
      {
        id: '1.1', title: 'Rasio & Durasi Video', icon: 'fa-clapperboard', tag: 'TANTANGAN 1.1', type: 'quiz',
        info: 'Memilih rasio dan durasi video yang optimal untuk ditonton penuh di TikTok & Reels.',
        briefLabel: 'Client Mini-Brief:',
        briefBody: '"Kedai Mie Legenda mau bikin video pendek buat TikTok & Reels ngiklanin menu Mie Nyemek Pedas kita. Videonya harus enak ditonton sampai habis, jangan bikin orang skip."',
        materi: {
          intro: 'Format teknis video menentukan apakah video-mu ditonton full-screen atau terpotong bar hitam.',
          points: [
            'Rasio 9:16 portrait itu native untuk TikTok/Reels — full-layar tanpa bar hitam.',
            'Durasi 15-30 detik punya peluang ditonton penuh (full watch) jauh lebih tinggi daripada video panjang.',
          ],
        },
        aiIntro: 'Halo Rina! Di tantangan 1.1, kita bantu Kedai Mie Legenda bikin video promosi menu pedas mereka. Yang pertama harus benar adalah format teknisnya.',
        suggests: [
          { id: 'faq-1.1-1', text: 'Kenapa rasio 16:9 kurang cocok?', answer: 'Video landscape/kotak bakal nongol dengan bar hitam besar di feed vertikal TikTok/Reels, dan itu bikin orang cepat skip karena terasa tidak native.' },
          { id: 'faq-1.1-2', text: 'Kenapa durasi pendek lebih baik dari video 3 menit?', answer: 'Semakin panjang video, semakin besar drop-off rate-nya. Video 15-30 detik punya peluang ditonton penuh (full watch) yang jauh lebih tinggi, dan itu sinyal positif buat algoritma.' },
        ],
        questions: [
          {
            question: 'Format video apa yang paling optimal untuk ditonton penuh (full-screen) di TikTok & Instagram Reels?',
            options: [
              '1920x1080 (16:9) landscape',
              '1080x1920 (9:16) portrait, durasi 15-30 detik',
              '1080x1080 (1:1) square, durasi 3 menit',
              '1080x1920 (9:16) portrait, durasi 10 menit',
            ],
            correctIndex: 1,
            explanation: 'Rasio 9:16 portrait itu native buat TikTok/Reels, dan durasi pendek (15-30 detik) menjaga retention agar video ditonton sampai habis.',
          },
        ],
      },
      {
        id: '1.2', title: 'Posisi Hook Video', icon: 'fa-bolt', tag: 'TANTANGAN 1.2', type: 'quiz',
        info: 'Menentukan di detik keberapa hook harus muncul agar video tidak di-skip.',
        briefLabel: 'Kriteria Utama Retention Video:',
        briefBody: 'Produser lokal bilang video kuliner sering di-skip di detik pertama. Kedai Mie Legenda pengen video mereka nggak kena skip.',
        materi: {
          intro: 'Hook adalah momen paling menarik yang menentukan penonton lanjut nonton atau langsung swipe.',
          points: [
            'Algoritma & kebiasaan scroll user cuma kasih 1-2 detik pertama untuk memutuskan lanjut atau skip.',
            'Hook yang ditaruh di akhir sebagai "reward" nyaris tidak pernah terlihat — penonton sudah keburu pindah.',
          ],
        },
        aiIntro: 'Sekarang kita bahas soal hook — momen yang menentukan penonton lanjut nonton atau langsung swipe ke video lain.',
        suggests: [
          { id: 'faq-1.2-1', text: 'Apa itu hook dalam video pendek?', answer: 'Hook adalah momen paling menarik/mengejutkan di awal video yang bikin penonton penasaran dan memutuskan untuk terus menonton, bukannya langsung scroll.' },
          { id: 'faq-1.2-2', text: 'Kenapa nggak taruh hook di akhir sebagai reward?', answer: 'Kebiasaan scroll cepat bikin mayoritas penonton udah keburu geser ke video lain sebelum sempat sampai ke bagian akhir — hook harus muncul di awal, bukan jadi kejutan penutup.' },
        ],
        questions: [
          {
            question: 'Di mana seharusnya "hook" (momen paling menarik) diletakkan dalam video promosi 15 detik?',
            options: [
              'Di detik 0-2, sebelum orang sempat scroll',
              'Di detik terakhir sebagai kejutan penutup',
              'Di tengah-tengah video, setelah intro logo',
              'Tidak perlu hook selama produk terlihat jelas',
            ],
            correctIndex: 0,
            explanation: 'Kebiasaan scroll cepat bikin mayoritas penonton keburu geser sebelum sempat sampai ke tengah atau akhir video — hook harus di detik 0-2.',
          },
        ],
      },
      {
        id: '1.3', title: 'Teknik Hook Kuliner', icon: 'fa-fire', tag: 'TANTANGAN 1.3', type: 'quiz',
        info: 'Mengidentifikasi teknik visual hook yang paling efektif untuk video kuliner pendek.',
        briefLabel: 'Kombinasi Teknik Hook:',
        briefBody: 'Tim kreatif Kedai Mie Legenda pengen tau teknik apa aja yang paling ampuh bikin video kuliner mereka berhenti di-scroll.',
        materi: {
          intro: 'Ada teknik-teknik visual yang terbukti ampuh khusus untuk konten kuliner.',
          points: [
            'Close-up tekstur makanan (kuah mendidih, keju melted) adalah hook visual sensori yang kuat.',
            'Teks overlay pertanyaan provokatif memicu rasa penasaran dan menahan penonton untuk tidak skip.',
          ],
        },
        aiIntro: 'Ada beberapa teknik hook yang terbukti ampuh khusus untuk konten kuliner. Yuk kita identifikasi.',
        suggests: [{ id: 'faq-1.3-1', text: 'Kenapa teks overlay pertanyaan efektif?', answer: 'Teks provokatif seperti "Berani coba level pedas ini?" memicu rasa penasaran dan menantang ego penonton — itu bikin mereka menahan diri untuk tidak langsung skip.' }],
        questions: [
          {
            question: 'Teknik hook mana yang paling efektif untuk video kuliner pendek?',
            options: [
              'Intro logo brand selama 5 detik di awal',
              'Close-up tekstur makanan + teks overlay pertanyaan provokatif',
              'Voice over penjelasan sejarah resep selama 1 menit',
              'Layar hitam dengan teks "Loading..." sebelum video mulai',
            ],
            correctIndex: 1,
            explanation: 'Visual sensori kuat (close-up tekstur) dan teks provokatif sama-sama bekerja di 1-2 detik pertama untuk menahan perhatian penonton.',
          },
        ],
      },
      {
        id: '1.4', title: 'Membaca Brief & Interpretasi Klien', icon: 'fa-clipboard-check', tag: 'TANTANGAN 1.4', type: 'quiz',
        info: 'Menerjemahkan pesan brief informal dari UMKM jadi requirement video yang jelas.',
        briefLabel: 'Brief via WhatsApp:',
        briefBody: '"Bang tolong bikin video yang nunjukin pedesnya menu baru kita, biar orang penasaran. Jangan lupa harga sama alamat kedai kelihatan ya." — Owner Kedai Mie Legenda',
        materi: {
          intro: 'Brief video dari UMKM biasanya berupa "feeling" (mis. "biar penasaran"), bukan instruksi teknis siap pakai.',
          points: [
            'Terjemahkan "biar penasaran" jadi elemen teknis konkret: close-up visual + teks provokatif.',
            'Detail administratif (harga, alamat) sering disebut belakangan tapi tetap wajib — jangan sampai terlewat.',
          ],
        },
        aiIntro: 'Brief video dari UMKM sering berupa perasaan yang ingin ditimbulkan, bukan instruksi teknis — tugas kita menerjemahkannya, Rina.',
        suggests: [{ id: 'faq-1.4-1', text: 'Gimana cara menerjemahkan brief yang berupa "perasaan" seperti ini?', answer: 'Pecah jadi elemen konkret: "penasaran" bisa diterjemahkan ke hook visual + teks provokatif, sementara instruksi administratif (harga, alamat) tetap wajib dicek sebagai checklist terpisah.' }],
        questions: [
          {
            question: 'Dari brief di atas, elemen mana yang WAJIB ada di video meski disebut belakangan?',
            options: [
              'Harga menu dan alamat kedai',
              'Wawancara dengan pemilik kedai',
              'Testimoni 5 pelanggan berbeda',
              'Behind-the-scenes proses memasak',
            ],
            correctIndex: 0,
            explanation: '"Jangan lupa harga sama alamat kelihatan" adalah instruksi eksplisit meski ditulis di akhir kalimat — tetap masuk kategori wajib.',
          },
        ],
      },
      {
        id: 'checkpoint-1', title: 'Kastil Checkpoint 1', icon: 'fa-fort-awesome', tag: 'UJIAN REVISI', type: 'checkpoint',
        info: 'Ujian mandiri storyboard video Kedai Mie Legenda lengkap sebelum membuka gerbang kerja!',
        briefLabel: 'Brief Mandatori Proyek Komersial:',
        briefBullets: [
          { strong: 'Wajib Hook Instan:', rest: ' visual close-up makanan langsung muncul di detik 0, bukan intro logo.' },
          { strong: 'Wajib Teks Overlay:', rest: ' harga & lokasi outlet harus terbaca di layar.' },
          { strong: 'Pace Cepat:', rest: ' potongan gambar (cut) mengikuti tempo musik tren.' },
        ],
        materi: {
          intro: 'Ini adalah ujian Checkpoint — gabungan dari semua yang sudah kamu pelajari di Unit 1.',
          points: [
            'Kamu akan direview lewat quiz singkat yang merangkum 4 topik sebelumnya.',
            'Setelah lulus quiz, kamu masuk ke Tantangan Nyata: mengerjakan deliverable asli dengan deadline 7 hari.',
            'Tantangan dinilai 100% oleh human reviewer, bukan skor otomatis.',
          ],
        },
        aiIntro: 'Ini adalah ujian Checkpoint pertama-mu! Baca brief di atas baik-baik, lalu kumpulkan hasil kerjamu untuk direview human reviewer kami.',
        suggests: [{ id: 'faq-cp-1', text: 'Kenapa storyboard perlu direview manusia?', answer: 'Timing pace dan rasa "enak ditonton" itu sangat kontekstual dan sulit dinilai objektif oleh sistem — human reviewer yang berpengalaman produksi video pendek memastikan hasilnya benar-benar layak tayang.' }],
        instruction: 'Kumpulkan 1 storyboard/naskah video pendek sesuai brief di atas.',
        deadlineText: '7 hari',
      },
    ],
  },

  // ── DESAIN GRAFIS — Warung Makan Pak Budi / Kopi Senja (FULL DEPTH) ─────────
  desain: {
    mapTitle: 'Peta Misi: Poster Designer',
    unitNote: 'Unit 1: Fondasi Estetika & Kepatuhan Brief (Tingkat Pemula)',
    checklist: [
      'Ukuran 1080x1080px (format Instagram Feed)',
      'Warna brand konsisten (merah bata & kuning emas)',
      'Logo & headline promo terbaca jelas dalam 2 detik',
      'Kontras teks minimal 4.5:1 sudah dicek',
    ],
    nodes: [
      {
        id: '1.1', title: 'Canvas Dimensions & Safe Zones', icon: 'fa-crop-simple', tag: 'TANTANGAN 1.1', type: 'quiz',
        info: 'Pilihlah spesifikasi dimensi agar tidak terpotong saat diposting di feed Instagram.',
        briefLabel: 'Client Mini-Brief:',
        briefBody: '"Halo! Saya butuh dibuatkan poster promosi Instagram Feed harian (Rasio 1:1) yang bersih agar tidak terpotong saat dipajang di grid utama profil kami."',
        materi: {
          intro: 'Sebelum desain apapun, kanvas yang benar adalah fondasi paling dasar. Salah ukuran berarti kerja ulang total.',
          points: [
            'Instagram Feed pakai rasio 1:1 (persegi) — di luar rasio ini otomatis terpotong di grid profil.',
            'Selalu sisakan "safe zone" ±50px dari tepi kanvas supaya elemen penting tidak kepotong saat platform meng-crop otomatis.',
            'Warung Makan Pak Budi minta poster feed harian — berarti kanvas wajib 1080x1080px, bukan ukuran story atau landscape.',
          ],
        },
        aiIntro: 'Halo Rina! Saya asisten AI Mentor-mu. Di tantangan 1.1 ini, kita harus membantu Warung Makan Pak Budi membuat poster Instagram Feed. Ingat! Klien butuh rasio grid 1:1.',
        suggests: [
          { id: 'faq-1.1-1', text: 'Kenapa rasio grid sangat penting, Mentor?', answer: 'Rasio 1:1 (Square) memastikan poster terlihat penuh dan tidak terpotong di bagian atas/bawah pada halaman profil (Grid Feed) Instagram utama.' },
          { id: 'faq-1.1-2', text: 'Bagaimana kalau saya pakai resolusi 1920x1080?', answer: 'Resolusi 1920x1080 adalah rasio Portrait 16:9. Di grid feed utama Instagram, ia akan terpotong secara otomatis menjadi 1:1, membuat informasi penting di atas atau bawah hilang.' },
        ],
        questions: [
          {
            question: 'Berapakah resolusi & dimensi kanvas paling tepat untuk mematuhi brief klien di atas?',
            options: [
              '1080 x 1920 piksel (Rasio 9:16)',
              '1080 x 1080 piksel (Rasio 1:1)',
              '1920 x 1080 piksel (Rasio 16:9)',
              '800 x 800 piksel, resolusi rendah',
            ],
            correctIndex: 1,
            explanation: 'Resolusi 1080x1080px (Rasio 1:1) adalah standar Instagram Feed — cukup tinggi resolusinya dan tidak terpotong di grid utama profil.',
          },
          {
            question: 'Kenapa penting menyisakan "safe zone" di tepi kanvas?',
            options: [
              'Supaya ukuran file lebih kecil',
              'Supaya elemen penting tidak terpotong saat platform meng-crop otomatis',
              'Supaya warna terlihat lebih cerah',
              'Tidak ada alasan khusus, murni estetika',
            ],
            correctIndex: 1,
            explanation: 'Beberapa platform sedikit meng-crop gambar saat merender thumbnail — elemen yang terlalu mepet ke tepi berisiko terpotong atau hilang.',
          },
          {
            question: 'Warung Pak Budi juga sesekali posting ke Instagram Story. Kenapa story TIDAK boleh pakai kanvas 1:1 yang sama dengan feed?',
            options: [
              'Story pakai rasio vertikal 9:16 penuh layar — kanvas 1:1 akan menyisakan area kosong besar di atas-bawah',
              'Story tidak mendukung gambar persegi sama sekali',
              'Ukuran file untuk story dibatasi lebih kecil dari feed',
              'Tidak masalah, rasio apapun bisa dipakai untuk story',
            ],
            correctIndex: 0,
            explanation: 'Story tampil full-screen vertikal (9:16). Memakai kanvas 1:1 di story menyisakan banyak area kosong dan bikin konten terlihat kecil di tengah layar.',
          },
        ],
      },
      {
        id: '1.2', title: 'Tipografi & Prinsip 2 Detik', icon: 'fa-font', tag: 'TANTANGAN 1.2', type: 'quiz',
        info: 'Mengatur Headline dan Body Text agar visual utama langsung terbaca dalam 2 detik.',
        briefLabel: 'Kriteria Utama Desain Komersial:',
        briefBody: 'Audiens media sosial rata-rata hanya meluangkan waktu 2 detik untuk memperhatikan poster promo. Pengaturan visual teks harus sangat berurutan agar pesan diskon langsung ditangkap.',
        materi: {
          intro: 'Orang scroll Instagram dalam hitungan detik. Kalau pesan utama tidak tertangkap di 2 detik pertama, poster kamu akan di-skip.',
          points: [
            'Susun hierarki ukuran font: Headline promo paling besar → Call to Action → Detail/syarat ketentuan paling kecil.',
            'Manusia membaca pola Z (kiri-atas ke kanan-bawah) — taruh info terpenting di jalur itu.',
            'Kontras teks vs background minimal 4.5:1 supaya tetap terbaca di layar kecil HP.',
          ],
        },
        aiIntro: 'Bagus sekali! Sekarang kita masuk ke Tipografi. Ingat prinsip emas industri: Konsumen hanya memberikan waktu 2 detik untuk membaca poster promo media sosial.',
        suggests: [
          { id: 'faq-1.2-1', text: 'Apa itu prinsip 2 detik?', answer: 'Audiens di media sosial memiliki perhatian yang sangat pendek. Jika dalam 2 detik pertama mereka tidak menangkap informasi "Apa keuntungan saya?" (Headline), mereka akan langsung meng-scroll poster Anda.' },
          { id: 'faq-1.2-2', text: 'Kenapa Headline diletakkan paling atas?', answer: 'Manusia membaca dari atas ke bawah dan kiri ke kanan (Z-pattern). Meletakkan Headline di sisi atas memastikan itu menjadi elemen visual pertama yang ditangkap retina mata.' },
        ],
        questions: [
          {
            question: 'Bagaimana urutan prioritas ukuran font yang benar dari yang terbesar sampai yang terkecil?',
            options: [
              'Headline Promo ➔ Call to Action ➔ Detail/Syarat Ketentuan',
              'Syarat Ketentuan ➔ Headline Promo ➔ Call to Action',
              'Call to Action ➔ Detail ➔ Headline Promo',
              'Semua elemen teks berukuran sama rata',
            ],
            correctIndex: 0,
            explanation: 'Headline harus paling menonjol karena itu yang menjawab "apa untungnya buat saya" dalam sekejap mata — CTA dan detail menyusul sesuai urutan kepentingan.',
          },
          {
            question: 'Kenapa Headline sebaiknya diletakkan di area atas poster?',
            options: [
              'Supaya tidak menutupi logo brand',
              'Karena pola baca Z-pattern menangkap area atas lebih dulu',
              'Karena software desain defaultnya begitu',
              'Tidak ada alasan khusus, hanya kebiasaan',
            ],
            correctIndex: 1,
            explanation: 'Pola scan mata manusia dimulai dari kiri-atas — menaruh headline di posisi itu membuatnya paling cepat tertangkap sebelum orang melanjutkan scroll.',
          },
          {
            question: 'Teks "DISKON 50%" berwarna abu-abu tua di atas background cokelat gelap. Apa masalah utamanya?',
            options: [
              'Tidak masalah selama ukuran fontnya besar',
              'Kontrasnya kemungkinan di bawah 4.5:1 sehingga sulit dibaca di layar kecil',
              'Warna abu-abu dianggap tidak sesuai tren desain',
              'Ukuran file gambar jadi lebih besar',
            ],
            correctIndex: 1,
            explanation: 'Dua warna gelap yang berdekatan biasanya gagal memenuhi standar kontras minimum 4.5:1, membuat teks seolah menyatu (blend) dengan background.',
          },
        ],
      },
      {
        id: '1.3', title: 'Psikologi Warna Industri', icon: 'fa-palette', tag: 'TANTANGAN 1.3', type: 'quiz',
        info: 'Mencocokkan palet warna dominan dengan niche usaha milik klien.',
        briefLabel: 'Kombinasi Psikologi Warna:',
        briefBody: 'Hubungkan warna yang sesuai dengan karakter industri klien berikut untuk membuktikan keahlian desain Anda.',
        materi: {
          intro: 'Warna bukan dekorasi — warna adalah sinyal psikologis yang memengaruhi keputusan beli konsumen dalam hitungan detik.',
          points: [
            'Cokelat hangat = kehangatan, keakraban, aroma organik → cocok untuk kafe/UMKM kopi.',
            'Hijau pastel = alami, sehat, tenang → cocok untuk produk organik/kesehatan.',
            'Salah pilih warna bisa bikin audiens merasa brand "nggak nyambung" meski produknya bagus.',
          ],
        },
        aiIntro: 'Warna bukan sekadar hiasan, Rina! Warna adalah psikologi emosional yang memicu keputusan transaksi konsumen. Bantu UMKM kita mencocokkan identitas bisnis mereka.',
        suggests: [{ id: 'faq-1.3-1', text: 'Apa psikologi warna cokelat?', answer: 'Warna cokelat hangat memberikan rasa kehangatan, keakraban, ketenangan, serta aroma rasa tanah/organik. Sangat pas untuk niche kafe atau UMKM kopi.' }],
        questions: [
          {
            question: 'Warna apa yang paling cocok untuk UMKM kopi tradisional yang ingin menonjolkan kehangatan & keakraban?',
            options: [
              'Biru terang',
              'Cokelat hangat',
              'Pink neon',
              'Abu-abu netral',
            ],
            correctIndex: 1,
            explanation: 'Cokelat hangat identik dengan aroma kopi/tanah dan memberi kesan akrab — pas untuk kafe tradisional seperti Kopi Senja.',
          },
          {
            question: 'Sebuah brand skincare organik ingin kesan "alami & menenangkan". Warna dominan yang paling tepat?',
            options: [
              'Merah menyala',
              'Hijau pastel',
              'Hitam pekat',
              'Oranye terang',
            ],
            correctIndex: 1,
            explanation: 'Hijau secara psikologis terasosiasi dengan alam dan ketenangan — cocok untuk positioning produk organik.',
          },
          {
            question: 'Kenapa warna yang salah bisa merusak persepsi brand meski produknya bagus?',
            options: [
              'Karena warna memengaruhi biaya cetak',
              'Karena warna adalah sinyal emosional pertama yang ditangkap otak sebelum membaca teks',
              'Karena software desain membatasi pilihan warna',
              'Warna tidak berpengaruh sama sekali pada persepsi',
            ],
            correctIndex: 1,
            explanation: 'Otak memproses warna lebih cepat daripada teks — warna yang tidak sesuai ekspektasi niche bisa bikin audiens ragu sebelum sempat membaca copy-nya.',
          },
        ],
      },
      {
        id: '1.4', title: 'Membaca Brief & Interpretasi SOP', icon: 'fa-clipboard-check', tag: 'TANTANGAN 1.4', type: 'quiz',
        info: 'Menerjemahkan kalimat sehari-hari klien menjadi requirement teknis yang jelas.',
        briefLabel: 'Contoh Brief Nyata:',
        briefBody: '"Tolong bikinin poster promo, yang penting keliatan diskon-nya, terus jangan lupa logo kita ya, warnanya yang biasa aja kayak sebelumnya." — Pak Budi, WhatsApp jam 22.14',
        materi: {
          intro: 'Brief klien jarang ditulis serapi dokumen resmi — tugasmu adalah menerjemahkan kalimat sehari-hari menjadi requirement teknis yang jelas.',
          points: [
            'Pisahkan brief jadi kategori: wajib ada (must-have), nice-to-have, dan batasan/larangan.',
            'Kalau brief ambigu, catat asumsimu secara eksplisit sebelum mulai kerja — jangan menebak sembarangan.',
            'SOP checkpoint biasanya berisi 3 hal: elemen wajib tampil, identitas visual (warna/logo), dan batas teknis (ukuran/format).',
          ],
        },
        aiIntro: 'Brief klien sering datang lewat chat santai, Rina — kemampuan menerjemahkan itu jadi requirement teknis sama pentingnya dengan skill desain itu sendiri.',
        suggests: [
          { id: 'faq-1.4-1', text: 'Bagaimana cara memastikan interpretasi saya benar?', answer: 'Kalau ada bagian brief yang ambigu, tulis balik ringkasan pemahamanmu ke klien sebelum eksekusi. Ini mencegah revisi besar di akhir proyek.' },
        ],
        questions: [
          {
            question: 'Dari brief informal Pak Budi di atas, mana yang termasuk requirement WAJIB (must-have)?',
            options: [
              'Diskon terlihat jelas & logo tercantum',
              'Warna harus baru dan berbeda dari sebelumnya',
              'Poster harus dicetak fisik dan ditempel',
              'Tidak ada requirement yang jelas sama sekali',
            ],
            correctIndex: 0,
            explanation: '"Yang penting keliatan diskon-nya" dan "jangan lupa logo" adalah dua permintaan eksplisit — itu must-have, sisanya adalah interpretasi/gaya.',
          },
          {
            question: 'Brief bilang "warnanya yang biasa aja kayak sebelumnya" — apa langkah paling tepat sebagai desainer?',
            options: [
              'Bebas memilih warna sesuai selera pribadi',
              'Mengecek desain/poster sebelumnya sebagai referensi warna brand yang konsisten',
              'Menanyakan warna kesukaan pribadi klien di luar konteks brand',
              'Mengabaikan instruksi warna sepenuhnya',
            ],
            correctIndex: 1,
            explanation: '"Kayak sebelumnya" adalah instruksi implisit untuk konsistensi brand — mengecek karya lama adalah langkah paling aman dan akurat.',
          },
          {
            question: 'Kenapa mencatat asumsi secara eksplisit penting saat brief ambigu?',
            options: [
              'Supaya terlihat lebih profesional saja',
              'Supaya ada dasar klarifikasi kalau hasil akhir dianggap tidak sesuai ekspektasi klien',
              'Brief ambigu sebenarnya boleh diabaikan begitu saja',
              'Supaya pekerjaan selesai lebih cepat tanpa perlu berpikir',
            ],
            correctIndex: 1,
            explanation: 'Kalau asumsi dicatat dan dikonfirmasi di awal, revisi besar di akhir proyek bisa dihindari — ini melindungi kamu dan klien dari miskomunikasi.',
          },
        ],
      },
      {
        id: 'checkpoint-1', title: 'Kastil Checkpoint 1', icon: 'fa-fort-awesome', tag: 'UJIAN REVISI', type: 'checkpoint',
        info: 'Ujian mandiri poster Kopi Senja lengkap sebelum membuka gerbang kerja!',
        briefLabel: 'Brief Mandatori Proyek Komersial:',
        briefBullets: [
          { strong: 'Wajib Terbaca Jelas:', rest: ' menampilkan promo bertuliskan "DISKON 50%" yang memiliki kontras tinggi dari background agar terbaca dalam 2 detik.' },
          { strong: 'Wajib Memasang Logo:', rest: ' harus menyertakan Logo Bulat "KOPI SENJA" di sisi pojok atas.' },
          { strong: 'Warna Identitas:', rest: ' menggunakan palet dominasi warna cokelat hangat / warm.' },
        ],
        materi: {
          intro: 'Ini adalah ujian Checkpoint — gabungan dari semua yang sudah kamu pelajari di Unit 1: kanvas, tipografi, warna, dan cara membaca brief.',
          points: [
            'Kamu akan direview lewat quiz singkat yang merangkum ke-4 topik sebelumnya.',
            'Setelah lulus quiz, kamu masuk ke Tantangan Nyata: mengerjakan poster asli dengan deadline 7 hari.',
            'Tantangan dinilai 100% oleh human reviewer, bukan skor otomatis.',
          ],
        },
        aiIntro: 'Ini adalah ujian Checkpoint pertama-mu! Kamu sudah menguasai fondasi kanvas, tipografi, warna, dan cara membaca brief. Baca brief di atas baik-baik, lalu kumpulkan hasil kerjamu untuk direview human reviewer kami.',
        suggests: [{ id: 'faq-cp-1', text: 'Bagaimana cara reviewer menilai keaslian karya?', answer: 'Human reviewer kami membaca sebaran komposisi, konsistensi elemen brand, dan kepatuhan brief untuk membedakan karya yang benar-benar dikerjakan sesuai instruksi dengan yang asal jadi.' }],
        instruction: 'Kumpulkan 1 file poster promosi (JPG/PNG) sesuai brief di atas.',
        deadlineText: '7 hari',
      },
    ],
  },

  // ── E-COMMERCE — Toko Sepatu Bumi (light pass) ──────────────────────────────
  ecommerce: {
    mapTitle: 'Peta Misi: Seller Marketplace',
    unitNote: 'Unit 1: Fondasi Listing & Kepatuhan Brief (Tingkat Pemula)',
    checklist: [
      'Judul listing mengandung keyword utama',
      'Foto produk minimal 4 sudut berbeda',
      'Deskripsi mencantumkan size chart & bahan',
      'Kebijakan garansi/retur tercantum jelas',
    ],
    nodes: [
      {
        id: '1.1', title: 'Judul Listing Search-Friendly', icon: 'fa-magnifying-glass', tag: 'TANTANGAN 1.1', type: 'quiz',
        info: 'Menyusun judul listing yang mengandung keyword agar mudah ditemukan di pencarian marketplace.',
        briefLabel: 'Client Mini-Brief:',
        briefBody: '"Toko Sepatu Bumi baru buka lapak di Shopee & Tokopedia, tapi produk kami belum pernah muncul di hasil pencarian. Tolong bantu kami perbaiki judul listingnya."',
        materi: {
          intro: 'Judul listing adalah faktor pencarian nomor satu di marketplace — algoritma mencocokkan listing dengan kata kunci yang benar-benar diketik pembeli.',
          points: [
            'Judul harus memuat jenis produk, target pengguna, dan varian — bukan kata promosi generik.',
            'Nama brand yang belum dikenal orang tidak akan menjadi kata kunci pencarian mereka.',
          ],
        },
        aiIntro: 'Halo Rina! Di tantangan 1.1, kita bantu Toko Sepatu Bumi supaya produknya muncul di pencarian marketplace. Kuncinya ada di struktur judul listing.',
        suggests: [
          { id: 'faq-1.1-1', text: 'Kenapa kata "Murah Banget Hari Ini" tidak efektif?', answer: 'Kata-kata promosi generik seperti itu tidak dicari orang di kolom search — algoritma marketplace mencocokkan listing dengan kata kunci produk yang benar-benar diketik pembeli.' },
          { id: 'faq-1.1-2', text: 'Kenapa cuma nama brand saja tidak cukup?', answer: 'Kalau pembeli belum kenal brand "Bumi", mereka tidak akan mengetik nama itu di search bar. Mereka akan mengetik jenis produk yang mereka cari, misalnya "sepatu sneakers pria".' },
        ],
        questions: [
          {
            question: 'Struktur judul listing mana yang paling optimal biar produk gampang ketemu di pencarian marketplace?',
            options: [
              '"Sepatu Bagus Banget Murah Cuma Hari Ini"',
              '"Sepatu Sneakers Pria Sport Casual Bumi Original Size 39-43"',
              '"BUMI"',
              '"Best Seller!!! Buruan Order!!!"',
            ],
            correctIndex: 1,
            explanation: 'Judul dengan kata kunci jenis produk + target pengguna + varian ukuran itulah yang ditangkap algoritma pencarian marketplace.',
          },
        ],
      },
      {
        id: '1.2', title: 'Bukti Kepercayaan Pembeli', icon: 'fa-boxes-stacked', tag: 'TANTANGAN 1.2', type: 'quiz',
        info: 'Menentukan elemen listing yang paling krusial untuk menaikkan kepercayaan pembeli baru.',
        briefLabel: 'Kriteria Utama Konversi Listing:',
        briefBody: 'Konversi visitor ke pembeli di Toko Sepatu Bumi masih rendah meski listing sudah rapi secara visual.',
        materi: {
          intro: 'Listing yang rapi saja belum tentu bikin orang percaya untuk beli — ada elemen kepercayaan yang harus diperkuat dulu.',
          points: [
            'Foto multi-angle & video unboxing mengurangi keraguan pembeli soal kondisi asli produk.',
            'Menambah varian tanpa memperkuat bukti visual tidak menjawab keraguan utama pembeli baru.',
          ],
        },
        aiIntro: 'Listing yang rapi saja belum tentu bikin orang percaya untuk beli, Rina. Ada elemen kepercayaan yang harus diperkuat dulu.',
        suggests: [
          { id: 'faq-1.2-1', text: 'Kenapa video unboxing membantu konversi?', answer: 'Video unboxing menunjukkan kondisi produk apa adanya, mengurangi keraguan pembeli soal "barang aslinya kayak gimana sih" sebelum mereka memutuskan checkout.' },
        ],
        questions: [
          {
            question: 'Elemen mana yang paling krusial ditambahkan dulu untuk menaikkan kepercayaan pembeli baru?',
            options: [
              'Foto produk dari banyak sudut + video pendek unboxing',
              'Menambah jumlah pilihan warna tanpa menambah info lain',
              'Mengganti nama toko jadi lebih unik',
              'Menambahkan lebih banyak emoji di judul',
            ],
            correctIndex: 0,
            explanation: 'Foto multi-angle & video unboxing mengurangi keraguan pembeli soal kondisi asli produk sebelum beli — jauh lebih efektif dari menambah varian saja.',
          },
        ],
      },
      {
        id: '1.3', title: 'Elemen Deskripsi Wajib', icon: 'fa-tags', tag: 'TANTANGAN 1.3', type: 'quiz',
        info: 'Mengidentifikasi elemen deskripsi produk yang wajib ada agar retur berkurang dan kepercayaan naik.',
        briefLabel: 'Kombinasi Elemen Deskripsi:',
        briefBody: 'Tim Toko Sepatu Bumi ingin tahu elemen apa saja yang wajib ada di deskripsi produk supaya angka retur dari kesalahan ukuran bisa turun.',
        materi: {
          intro: 'Deskripsi produk yang lengkap adalah investasi jangka panjang — mengurangi retur dan komplain.',
          points: [
            'Size chart yang jelas mencegah pembeli menebak ukuran sendiri.',
            'Kebijakan garansi/retur yang jelas membangun kepercayaan sebelum checkout.',
          ],
        },
        aiIntro: 'Deskripsi produk yang lengkap itu investasi jangka panjang — mengurangi retur dan komplain, Rina.',
        suggests: [{ id: 'faq-1.3-1', text: 'Kenapa size chart penting banget?', answer: 'Ukuran sepatu antar brand suka berbeda-beda. Tanpa size chart yang jelas, pembeli menebak-nebak ukuran sendiri dan berujung retur karena kekecilan/kebesaran.' }],
        questions: [
          {
            question: 'Elemen apa yang paling penting ada di deskripsi supaya retur akibat salah ukuran berkurang?',
            options: [
              'Kata-kata pujian tentang kualitas produk',
              'Size chart lengkap + kebijakan garansi/retur yang jelas',
              'Jumlah testimoni sebanyak-banyaknya',
              'Daftar semua warna yang pernah dijual',
            ],
            correctIndex: 1,
            explanation: 'Size chart mencegah kesalahan ukuran sejak awal, dan kebijakan retur yang jelas membangun kepercayaan — dua hal ini paling langsung menekan angka retur.',
          },
        ],
      },
      {
        id: '1.4', title: 'Membaca Brief & Interpretasi Klien', icon: 'fa-clipboard-check', tag: 'TANTANGAN 1.4', type: 'quiz',
        info: 'Menerjemahkan pesan brief informal dari UMKM jadi requirement listing yang jelas.',
        briefLabel: 'Brief via WhatsApp:',
        briefBody: '"Kak tolong benerin listing sepatu kita, yang penting ketemu pas dicari orang, terus jangan sampe ada yang komplain ukuran lagi." — Owner Toko Sepatu Bumi',
        materi: {
          intro: 'Brief marketplace dari UMKM biasanya berupa keluhan bisnis ("jangan komplain lagi"), bukan instruksi teknis siap pakai.',
          points: [
            'Terjemahkan "ketemu pas dicari orang" jadi optimasi keyword judul.',
            'Terjemahkan "jangan sampai komplain ukuran" jadi kelengkapan size chart di deskripsi.',
          ],
        },
        aiIntro: 'Brief dari pemilik toko sering berupa keluhan bisnis, Rina — tugas kita menerjemahkannya jadi perbaikan teknis konkret.',
        suggests: [{ id: 'faq-1.4-1', text: 'Bagaimana menerjemahkan keluhan bisnis jadi requirement teknis?', answer: 'Pecah keluhan jadi akar masalah: "jangan komplain ukuran" berarti size chart belum lengkap, "ketemu pas dicari" berarti keyword judul belum optimal. Baru dari situ susun requirement teknis.' }],
        questions: [
          {
            question: 'Dari brief di atas, dua masalah bisnis yang perlu diterjemahkan jadi requirement teknis adalah...',
            options: [
              'Optimasi keyword judul dan kelengkapan size chart',
              'Mengganti seluruh foto produk dengan model baru',
              'Menurunkan harga semua produk',
              'Menambah jumlah pilihan warna sepatu',
            ],
            correctIndex: 0,
            explanation: '"Ketemu pas dicari orang" → masalah keyword judul. "Jangan sampai komplain ukuran" → masalah kelengkapan size chart. Keduanya requirement teknis yang konkret.',
          },
        ],
      },
      {
        id: 'checkpoint-1', title: 'Kastil Checkpoint 1', icon: 'fa-fort-awesome', tag: 'UJIAN REVISI', type: 'checkpoint',
        info: 'Ujian mandiri listing Toko Sepatu Bumi lengkap sebelum membuka gerbang kerja!',
        briefLabel: 'Brief Mandatori Proyek Komersial:',
        briefBullets: [
          { strong: 'Wajib Keyword di Judul:', rest: ' jenis produk, target pengguna, dan varian ukuran harus tercantum.' },
          { strong: 'Wajib Size Chart:', rest: ' deskripsi harus mencantumkan tabel ukuran lengkap.' },
          { strong: 'Wajib Kebijakan Retur:', rest: ' syarat garansi/retur harus jelas tertulis.' },
        ],
        materi: {
          intro: 'Ini adalah ujian Checkpoint — gabungan dari semua yang sudah kamu pelajari di Unit 1.',
          points: [
            'Kamu akan direview lewat quiz singkat yang merangkum 4 topik sebelumnya.',
            'Setelah lulus quiz, kamu masuk ke Tantangan Nyata: mengerjakan deliverable asli dengan deadline 7 hari.',
            'Tantangan dinilai 100% oleh human reviewer, bukan skor otomatis.',
          ],
        },
        aiIntro: 'Ini adalah ujian Checkpoint pertama-mu! Baca brief di atas baik-baik, lalu kumpulkan hasil kerjamu untuk direview human reviewer kami.',
        suggests: [{ id: 'faq-cp-1', text: 'Apa yang dicek reviewer di listing ini?', answer: 'Reviewer memeriksa apakah keyword judul relevan dengan produk, kelengkapan size chart, dan kejelasan kebijakan retur — tiga hal yang paling sering jadi sumber komplain pembeli marketplace.' }],
        instruction: 'Kumpulkan 1 draft listing (judul + deskripsi) sesuai brief di atas.',
        deadlineText: '7 hari',
      },
    ],
  },

  // ── DIGITAL MARKETING — Klinik Kecantikan Glow (light pass) ─────────────────
  marketing: {
    mapTitle: 'Peta Misi: Ads Specialist',
    unitNote: 'Unit 1: Fondasi Campaign & Kepatuhan Brief (Tingkat Pemula)',
    checklist: [
      'Objective campaign sesuai tujuan bisnis (booking)',
      'Targeting audiens spesifik (demografi + lokasi + minat)',
      'Ad copy punya CTA dan urgency yang jelas',
      'Visual before/after sesuai etika iklan kecantikan',
    ],
    nodes: [
      {
        id: '1.1', title: 'Objective Campaign', icon: 'fa-bullseye', tag: 'TANTANGAN 1.1', type: 'quiz',
        info: 'Memilih objective campaign iklan yang sesuai dengan tujuan bisnis, bukan sekadar jangkauan.',
        briefLabel: 'Client Mini-Brief:',
        briefBody: '"Klinik Kecantikan Glow mau pasang iklan Meta Ads pertama kami buat promo treatment facial baru. Tujuannya biar orang booking konsultasi, bukan cuma tau kami ada."',
        materi: {
          intro: 'Objective campaign menentukan siapa yang ditarget algoritma dan metrik apa yang dioptimalkan.',
          points: [
            'Objective Leads/Conversions mengoptimalkan untuk orang yang benar-benar mengisi form booking.',
            'Objective Awareness/Engagement mengoptimalkan metrik yang berbeda dari tujuan bisnis nyata (booking).',
          ],
        },
        aiIntro: 'Halo Rina! Di tantangan 1.1, kita bantu Klinik Kecantikan Glow pasang campaign iklan pertama mereka. Objective yang dipilih menentukan siapa yang ditarget algoritma.',
        suggests: [
          { id: 'faq-1.1-1', text: 'Kenapa Brand Awareness kurang cocok di sini?', answer: 'Objective Brand Awareness mengoptimalkan iklan untuk dilihat sebanyak mungkin orang, bukan untuk mendorong orang mengisi form booking — dua metrik itu berbeda.' },
        ],
        questions: [
          {
            question: 'Objective campaign mana yang paling tepat kalau tujuannya adalah booking konsultasi, bukan sekadar dikenal?',
            options: [
              'Brand Awareness',
              'Conversions / Leads dengan tujuan form booking',
              'Engagement (like/comment)',
              'Reach (jangkauan sebanyak mungkin akun)',
            ],
            correctIndex: 1,
            explanation: 'Objective Leads/Conversions mengoptimalkan iklan untuk orang yang benar-benar mengisi form booking, bukan cuma melihat atau berinteraksi dengan iklan.',
          },
        ],
      },
      {
        id: '1.2', title: 'Audience Targeting', icon: 'fa-coins', tag: 'TANTANGAN 1.2', type: 'quiz',
        info: 'Menentukan targeting audiens yang paling efisien untuk budget iklan yang terbatas.',
        briefLabel: 'Kriteria Utama Efisiensi Budget:',
        briefBody: 'Budget iklan Klinik Kecantikan Glow terbatas, jadi targeting-nya harus benar-benar tepat sasaran.',
        materi: {
          intro: 'Budget terbatas berarti targeting harus presisi — semakin luas targeting, semakin cepat budget habis ke orang yang tidak relevan.',
          points: [
            'Targeting sempit (demografi + lokasi + minat) membuat budget jatuh ke orang yang benar-benar potensial.',
            'Klinik adalah bisnis lokal — radius jarak dari lokasi adalah filter penting.',
          ],
        },
        aiIntro: 'Budget terbatas berarti targeting harus presisi, Rina. Semakin luas targeting, semakin cepat budget habis ke orang yang tidak relevan.',
        suggests: [
          { id: 'faq-1.2-1', text: 'Kenapa targeting semua orang itu boros?', answer: 'Kalau targeting terlalu luas, iklan ditampilkan ke banyak orang yang sama sekali tidak berminat treatment kecantikan — budget habis tapi konversi rendah.' },
        ],
        questions: [
          {
            question: 'Targeting audiens mana yang paling efisien untuk treatment facial premium di kota tersebut?',
            options: [
              'Semua orang di Indonesia usia 18-65 tahun',
              'Wanita 25-45 tahun, radius 10km dari klinik, minat skincare/kecantikan',
              'Semua gender di seluruh dunia',
              'Hanya berdasarkan usia, tanpa filter lokasi atau minat',
            ],
            correctIndex: 1,
            explanation: 'Targeting sempit dan relevan (demografi + lokasi + minat) bikin budget terbatas jatuh ke orang yang benar-benar potensial booking.',
          },
        ],
      },
      {
        id: '1.3', title: 'Elemen Ad Copy Wajib', icon: 'fa-bullhorn', tag: 'TANTANGAN 1.3', type: 'quiz',
        info: 'Mengidentifikasi elemen ad copy yang wajib ada agar iklan mendorong aksi konkret.',
        briefLabel: 'Kombinasi Elemen Ad Copy:',
        briefBody: 'Tim Klinik Kecantikan Glow ingin tahu elemen apa saja yang wajib ada di teks iklan supaya orang benar-benar bergerak untuk booking.',
        materi: {
          intro: 'Ad copy yang bagus bukan cuma soal kata-kata indah — ada struktur yang mendorong aksi konkret.',
          points: [
            'CTA yang jelas ("Booking Sekarang") mengarahkan pembaca ke tindakan spesifik.',
            'Urgency ("diskon minggu ini saja") mendorong orang bertindak sekarang, bukan menunda.',
          ],
        },
        aiIntro: 'Ad copy yang bagus bukan cuma soal kata-kata indah, Rina — ada struktur yang mendorong aksi konkret.',
        suggests: [{ id: 'faq-1.3-1', text: 'Kenapa urgency penting di ad copy?', answer: 'Urgency (misal "diskon minggu ini saja") mendorong orang bertindak sekarang, bukan menunda-nunda sampai lupa — ini krusial karena iklan sering cuma dilihat sekilas.' }],
        questions: [
          {
            question: 'Elemen apa yang wajib ada di ad copy supaya orang benar-benar bergerak untuk booking?',
            options: [
              'Deskripsi panjang tentang sejarah klinik',
              'CTA yang jelas + urgency/penawaran spesifik',
              'Daftar semua treatment yang tersedia',
              'Kutipan testimoni tanpa call-to-action',
            ],
            correctIndex: 1,
            explanation: 'CTA jelas mengarahkan tindakan konkret, dan urgency mendorong orang bertindak sekarang — kombinasi ini yang paling efektif mendorong booking.',
          },
        ],
      },
      {
        id: '1.4', title: 'Membaca Brief & Interpretasi Klien', icon: 'fa-clipboard-check', tag: 'TANTANGAN 1.4', type: 'quiz',
        info: 'Menerjemahkan pesan brief informal dari klinik jadi requirement campaign yang jelas.',
        briefLabel: 'Brief via WhatsApp:',
        briefBody: '"Sis tolong bikinin iklan buat treatment baru kita, yang penting orang langsung mau booking, budget-nya terbatas ya bulan ini." — Owner Klinik Kecantikan Glow',
        materi: {
          intro: 'Brief campaign dari klien sering berupa tujuan bisnis ("orang langsung mau booking"), bukan setup teknis siap pakai.',
          points: [
            'Terjemahkan "orang langsung mau booking" jadi objective Conversions/Leads, bukan Awareness.',
            'Terjemahkan "budget terbatas" jadi targeting yang sempit dan presisi, bukan targeting luas.',
          ],
        },
        aiIntro: 'Brief dari klinik sering berupa tujuan bisnis, Rina — tugas kita menerjemahkannya jadi setup campaign yang tepat.',
        suggests: [{ id: 'faq-1.4-1', text: 'Bagaimana menerjemahkan "budget terbatas" jadi keputusan teknis?', answer: '"Budget terbatas" berarti kita tidak mampu menjangkau audiens luas — solusinya adalah targeting yang sangat spesifik (demografi + lokasi + minat) supaya setiap rupiah budget jatuh ke orang yang benar-benar potensial.' }],
        questions: [
          {
            question: 'Dari brief di atas, "budget-nya terbatas ya bulan ini" paling tepat diterjemahkan jadi keputusan teknis apa?',
            options: [
              'Targeting audiens yang sangat luas supaya jangkauan maksimal',
              'Targeting audiens yang sempit dan presisi (demografi + lokasi + minat)',
              'Menunda campaign sampai budget lebih besar',
              'Mengabaikan targeting sama sekali',
            ],
            correctIndex: 1,
            explanation: 'Budget terbatas berarti setiap rupiah harus dimaksimalkan — targeting sempit dan presisi memastikan iklan hanya menjangkau orang yang benar-benar potensial.',
          },
        ],
      },
      {
        id: 'checkpoint-1', title: 'Kastil Checkpoint 1', icon: 'fa-fort-awesome', tag: 'UJIAN REVISI', type: 'checkpoint',
        info: 'Ujian mandiri campaign iklan Klinik Kecantikan Glow lengkap sebelum membuka gerbang kerja!',
        briefLabel: 'Brief Mandatori Proyek Komersial:',
        briefBullets: [
          { strong: 'Wajib Manfaat Konkret:', rest: ' headline harus menyebutkan manfaat nyata, bukan klaim umum.' },
          { strong: 'Wajib CTA Sesuai Objective:', rest: ' tombol harus mengarah ke booking, bukan sekadar "Pelajari Lebih Lanjut".' },
          { strong: 'Etika Visual:', rest: ' before/after harus sesuai izin klien dan tidak menyesatkan.' },
        ],
        materi: {
          intro: 'Ini adalah ujian Checkpoint — gabungan dari semua yang sudah kamu pelajari di Unit 1.',
          points: [
            'Kamu akan direview lewat quiz singkat yang merangkum 4 topik sebelumnya.',
            'Setelah lulus quiz, kamu masuk ke Tantangan Nyata: mengerjakan deliverable asli dengan deadline 7 hari.',
            'Tantangan dinilai 100% oleh human reviewer, bukan skor otomatis.',
          ],
        },
        aiIntro: 'Ini adalah ujian Checkpoint pertama-mu! Baca brief di atas baik-baik, lalu kumpulkan hasil kerjamu untuk direview human reviewer kami.',
        suggests: [{ id: 'faq-cp-1', text: 'Kenapa iklan kecantikan perlu review manusia?', answer: 'Iklan kecantikan sensitif secara etika (klaim hasil, before/after) — human reviewer memastikan copy tidak menyesatkan dan sesuai kebijakan platform iklan.' }],
        instruction: 'Kumpulkan 1 draft ad copy + setup targeting sesuai brief di atas.',
        deadlineText: '7 hari',
      },
    ],
  },

  // ── UGC CREATOR — Skincare Lokal Alami (node 1.1 diberi bobot penuh sesuai brief user) ──
  ugc: {
    mapTitle: 'Peta Misi: UGC Creator',
    unitNote: 'Unit 1: Fondasi Autentisitas & Kepatuhan Brief (Tingkat Pemula)',
    checklist: [
      'Label kerja sama/iklan tercantum jelas',
      'Gaya bicara natural, bukan skrip kaku',
      'Struktur cerita: masalah → proses → hasil',
      'Before/after ditunjukkan jujur',
    ],
    nodes: [
      {
        id: '1.1', title: 'Gaya Konten Autentik', icon: 'fa-mobile-screen-button', tag: 'TANTANGAN 1.1', type: 'quiz',
        info: 'Membedakan gaya konten UGC yang autentik dari gaya iklan formal.',
        briefLabel: 'Client Mini-Brief:',
        briefBody: '"Brand skincare lokal Alami cari kreator buat bikin video review yang KERASA asli, bukan kayak iklan TV. Kami mau audiens percaya ini pengalaman jujur, bukan settingan."',
        materi: {
          intro: 'Konten UGC yang bagus bukan soal kamera mahal atau setting studio — justru sebaliknya. Autentisitas adalah tentang:',
          points: [
            'Reaksi yang tidak dibuat-buat.',
            'Lingkungan yang terasa "nyata" (kamar, dapur, luar ruangan).',
            'Bahasa yang natural, bukan scripted.',
            'Pengalaman yang bisa di-relate audiens.',
          ],
        },
        aiIntro: 'Halo Rina! Di tantangan 1.1, kita bantu brand Alami dapat konten UGC yang benar-benar terasa autentik, bukan seperti iklan formal.',
        suggests: [
          { id: 'faq-1.1-1', text: 'Kenapa video studio profesional kurang cocok untuk UGC?', answer: 'Produksi yang terlalu rapi dan formal justru menghilangkan kesan "apa adanya" yang jadi nilai jual utama konten UGC — penonton bisa merasakan bedanya.' },
          { id: 'faq-1.1-2', text: 'Apa maksud "cerita pengalaman jujur"?', answer: 'Maksudnya konten yang menunjukkan proses pemakaian nyata dari waktu ke waktu, lengkap dengan reaksi asli — bukan cuma pujian sekali jadi tanpa konteks.' },
        ],
        questions: [
          {
            question: 'Apa yang membuat konten UGC terasa autentik?',
            options: [
              'Lighting studio profesional',
              'Reaksi natural dan setting sehari-hari',
              'Background musik yang epik',
              'Banyak cut dan efek visual',
            ],
            correctIndex: 1,
            explanation: 'Reaksi yang tidak dibuat-buat dan lingkungan sehari-hari (kamar, dapur) itulah yang bikin penonton percaya ini pengalaman nyata, bukan settingan.',
          },
          {
            question: 'Brand Alami meminta video yang "KERASA asli". Pendekatan mana yang paling tepat?',
            options: [
              'Syuting di studio dengan lighting ring light',
              'Edit dengan banyak transisi keren',
              'Rekam di kamar sambil pakai produk secara natural',
              'Gunakan script yang sudah disiapkan brand',
            ],
            correctIndex: 2,
            explanation: 'Merekam natural di ruang sehari-hari (kamar) tanpa skrip kaku adalah pendekatan yang paling sesuai dengan brief "kerasa asli".',
          },
          {
            question: 'Apa risiko terbesar kalau konten UGC terasa "settingan"?',
            options: [
              'Video jadi kurang estetis',
              'Audiens tidak percaya dan engagement turun',
              'Brand tidak suka warnanya',
              'Video terlalu pendek',
            ],
            correctIndex: 1,
            explanation: 'Nilai jual utama UGC adalah kepercayaan — begitu konten terasa settingan, audiens langsung skeptis dan engagement anjlok.',
          },
        ],
      },
      {
        id: '1.2', title: 'Struktur Cerita Review', icon: 'fa-heart', tag: 'TANTANGAN 1.2', type: 'quiz',
        info: 'Menyusun struktur cerita review yang meyakinkan penonton, bukan klaim kosong.',
        briefLabel: 'Kriteria Utama Kredibilitas Review:',
        briefBody: 'Brand Alami pengen video review yang bikin penonton percaya, bukan cuma pujian kosong tanpa konteks.',
        materi: {
          intro: 'Review yang meyakinkan punya struktur cerita — bukan sekadar bilang "bagus banget".',
          points: [
            'Struktur masalah → proses → hasil membuat klaim produk terasa dibuktikan, bukan sekadar diucapkan.',
            'Klaim tanpa konteks/bukti terasa seperti settingan bagi penonton yang makin skeptis.',
          ],
        },
        aiIntro: 'Review yang meyakinkan itu punya struktur cerita, Rina — bukan sekadar bilang "bagus banget".',
        suggests: [{ id: 'faq-1.2-1', text: 'Kenapa struktur masalah-proses-hasil lebih kuat?', answer: 'Struktur ini menunjukkan perjalanan nyata: ada masalah yang relatable, proses mencoba yang jujur, dan hasil yang bisa dibuktikan — itu yang bikin klaim produk terasa dibuktikan, bukan sekadar diucapkan.' }],
        questions: [
          {
            question: 'Struktur review mana yang paling meyakinkan penonton?',
            options: [
              'Langsung bilang "produk ini bagus banget, wajib beli!" tanpa konteks',
              'Cerita masalah kulit yang dialami → proses coba produk → hasil nyata yang terlihat',
              'Membaca daftar bahan produk secara teknis',
              'Membandingkan harga dengan brand lain saja',
            ],
            correctIndex: 1,
            explanation: 'Struktur masalah→proses→hasil menunjukkan perjalanan nyata yang bisa dibuktikan, bukan klaim kosong.',
          },
        ],
      },
      {
        id: '1.3', title: 'Etika Disclosure & Keaslian', icon: 'fa-comment-dots', tag: 'TANTANGAN 1.3', type: 'quiz',
        info: 'Mengidentifikasi elemen wajib untuk menjaga etika dan kesan jujur dalam konten berbayar.',
        briefLabel: 'Kombinasi Elemen Disclosure:',
        briefBody: 'Brand Alami ingin memastikan setiap kreator yang bekerja sama tetap menjaga etika dan kesan jujur di kontennya.',
        materi: {
          intro: 'Autentik bukan berarti menyembunyikan bahwa ini konten berbayar — justru transparansi bikin makin dipercaya.',
          points: [
            'Label "kerja sama berbayar" adalah kewajiban etika dan diatur dalam pedoman periklanan platform.',
            'Menampilkan momen "tidak sempurna" justru menambah kesan jujur, bukan mengurangi kualitas.',
          ],
        },
        aiIntro: 'Autentik bukan berarti menyembunyikan kalau ini konten berbayar, Rina — justru transparansi bikin makin dipercaya.',
        suggests: [{ id: 'faq-1.3-1', text: 'Apakah label kerja sama wajib secara hukum?', answer: 'Ya — disclosure endorsement/kerja sama berbayar adalah kewajiban etika dan diatur dalam pedoman periklanan platform. Menyembunyikannya berisiko bagi brand maupun kreator.' }],
        questions: [
          {
            question: 'Elemen apa yang wajib ada di konten UGC berbayar supaya tetap etis dan terasa jujur?',
            options: [
              'Label kerja sama berbayar yang jelas + momen "tidak sempurna" yang ditampilkan apa adanya',
              'Menyembunyikan bahwa ini konten berbayar supaya terlihat organik',
              'Hanya menampilkan hasil sempurna tanpa proses',
              'Skrip yang disetujui penuh oleh brand tanpa boleh diubah',
            ],
            correctIndex: 0,
            explanation: 'Disclosure kerja sama adalah kewajiban etika/legal, dan momen tidak sempurna justru menambah kesan jujur — dua hal ini yang menjaga kredibilitas konten UGC.',
          },
        ],
      },
      {
        id: '1.4', title: 'Membaca Brief & Interpretasi Klien', icon: 'fa-clipboard-check', tag: 'TANTANGAN 1.4', type: 'quiz',
        info: 'Menerjemahkan pesan brief informal dari brand jadi requirement konten yang jelas.',
        briefLabel: 'Brief via WhatsApp:',
        briefBody: '"Kak tolong bikin konten review produk kita ya, yang penting keliatan asli dipake, jangan lupa sebut ini kerja sama juga." — Tim Brand Alami',
        materi: {
          intro: 'Brief UGC dari brand sering berupa perasaan yang ingin ditimbulkan ("keliatan asli"), plus satu instruksi legal yang wajib (disclosure).',
          points: [
            'Terjemahkan "keliatan asli dipake" jadi struktur cerita masalah→proses→hasil yang direkam natural.',
            '"Jangan lupa sebut kerja sama" adalah instruksi wajib legal/etika, bukan opsional.',
          ],
        },
        aiIntro: 'Brief dari brand UGC biasanya singkat tapi ada satu instruksi yang tidak boleh dilewatkan: disclosure, Rina.',
        suggests: [{ id: 'faq-1.4-1', text: 'Kenapa instruksi disclosure tidak boleh dianggap opsional?', answer: 'Disclosure endorsement berbayar diatur oleh pedoman periklanan platform — melewatkannya berisiko bagi brand maupun kreator, jadi harus selalu masuk requirement wajib meski disebut santai di brief.' }],
        questions: [
          {
            question: 'Dari brief di atas, instruksi mana yang bersifat WAJIB dan tidak boleh dilewatkan?',
            options: [
              'Menyebutkan bahwa ini konten kerja sama',
              'Merekam di lokasi outdoor',
              'Menggunakan filter warna tertentu',
              'Durasi video harus di atas 3 menit',
            ],
            correctIndex: 0,
            explanation: '"Jangan lupa sebut ini kerja sama" adalah instruksi legal/etika yang wajib, terlepas dari nada santai brief secara keseluruhan.',
          },
        ],
      },
      {
        id: 'checkpoint-1', title: 'Kastil Checkpoint 1', icon: 'fa-fort-awesome', tag: 'UJIAN REVISI', type: 'checkpoint',
        info: 'Ujian mandiri konten review brand Alami lengkap sebelum membuka gerbang kerja!',
        briefLabel: 'Brief Mandatori Proyek Komersial:',
        briefBullets: [
          { strong: 'Wajib Disclosure:', rest: ' label kerja sama harus tercantum jelas di awal konten.' },
          { strong: 'Gaya Bicara Natural:', rest: ' bukan skrip kaku yang dibaca dari teleprompter.' },
          { strong: 'Before/After Jujur:', rest: ' hasil ditunjukkan apa adanya, tidak dilebih-lebihkan.' },
        ],
        materi: {
          intro: 'Ini adalah ujian Checkpoint — gabungan dari semua yang sudah kamu pelajari di Unit 1.',
          points: [
            'Kamu akan direview lewat quiz singkat yang merangkum 4 topik sebelumnya.',
            'Setelah lulus quiz, kamu masuk ke Tantangan Nyata: mengerjakan deliverable asli dengan deadline 7 hari.',
            'Tantangan dinilai 100% oleh human reviewer, bukan skor otomatis.',
          ],
        },
        aiIntro: 'Ini adalah ujian Checkpoint pertama-mu! Baca brief di atas baik-baik, lalu kumpulkan hasil kerjamu untuk direview human reviewer kami.',
        suggests: [{ id: 'faq-cp-1', text: 'Kenapa "kesan jujur" perlu dinilai manusia?', answer: 'Menilai apakah sebuah konten "terasa jujur" itu sangat subjektif dan kontekstual — human reviewer yang berpengalaman menilai nuansa nada bicara dan penyampaian yang sulit diukur otomatis.' }],
        instruction: 'Kumpulkan 1 video review (link/file) sesuai brief di atas.',
        deadlineText: '7 hari',
      },
    ],
  },
};
