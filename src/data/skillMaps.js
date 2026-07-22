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

// Which unit (1, 2, 3...) a node belongs to, parsed from its id — quiz nodes
// are "<unit>.<index>" (e.g. "2.3"), checkpoints are "checkpoint-<unit>".
export function getNodeUnit(nodeId) {
  const quizMatch = /^(\d+)\./.exec(nodeId);
  if (quizMatch) return Number(quizMatch[1]);
  const cpMatch = /^checkpoint-(\d+)$/.exec(nodeId);
  return cpMatch ? Number(cpMatch[1]) : 1;
}

// Most skill maps only have Unit 1 authored so far; desain is the one
// fully-built golden path with 3 units through to certification.
export function getTotalUnits(skillMap) {
  return skillMap.unitNotes ? skillMap.unitNotes.length : 1;
}

// Falls back to the legacy singular `unitNote` for skills that haven't been
// split into multiple units yet.
export function getUnitNote(skillMap, unitNumber) {
  if (skillMap.unitNotes) return skillMap.unitNotes[unitNumber - 1] ?? skillMap.unitNotes[0];
  return skillMap.unitNote;
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
    unitNotes: [
      'Unit 1: Fondasi Konten & Kepatuhan Brief (Tingkat Pemula)',
      'Unit 2: Sistem Konten & Konsistensi Brand (Tingkat Menengah)',
      'Unit 3: Kampanye Bulanan & Sertifikasi (Tingkat Mahir)',
    ],
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
        checklist: [
          'Format video 9:16 (portrait), durasi 15-30 detik',
          'Hook kuat di 2 detik pertama',
          'Caption punya CTA jelas + ajakan interaksi',
          'Jadwal & tone bahasa sesuai brief Warung Kopi Abadi',
        ],
      },

      // ── UNIT 2 — Warung Kopi Abadi: rangkaian konten mingguan (Menengah) ───
      {
        id: '2.1', title: 'Kalender & Pilar Konten', icon: 'fa-calendar-days', tag: 'TANTANGAN 2.1', type: 'quiz',
        info: 'Menyusun sistem pilar konten & kalender agar posting konsisten tanpa kehabisan ide.',
        briefLabel: 'Client Mini-Brief:',
        briefBody: '"Sekarang Warung Kopi Abadi mau posting rutin, nggak cuma pas ada promo doang. Tapi bingung tiap hari mau posting apa."',
        materi: {
          intro: 'Posting konsisten butuh sistem, bukan mikir ide dari nol tiap hari — di sinilah "pilar konten" dan kalender berperan.',
          points: [
            'Pilar konten membagi ide jadi beberapa kategori tetap (mis. promo, edukasi, testimoni, behind-the-scenes) — supaya tidak kehabisan ide dan variasinya seimbang.',
            'Kalender konten (rencana 1-2 minggu ke depan) mencegah posting dadakan yang kualitasnya asal jadi.',
          ],
        },
        aiIntro: 'Sekarang kita masuk ke sistem konten, Rina — biar Warung Kopi Abadi bisa posting konsisten tanpa kehabisan ide tiap hari.',
        suggests: [{ id: 'faq-2.1-1', text: 'Kenapa perlu pilar konten, nggak bisa random aja?', answer: 'Tanpa pilar, konten cenderung itu-itu saja (semua jualan) atau random tanpa arah — pilar memastikan variasi seimbang antara jualan, edukasi, dan interaksi.' }],
        questions: [
          {
            question: 'Warung Kopi Abadi bingung mau posting apa tiap hari. Solusi sistemnya?',
            options: [
              'Posting apa saja yang kepikiran saat itu juga',
              'Bikin pilar konten (promo/edukasi/testimoni/BTS) + kalender rencana 1-2 minggu',
              'Cuma posting kalau ada promo besar',
              'Menunggu ide viral dari akun lain',
            ],
            correctIndex: 1,
            explanation: 'Pilar konten + kalender memberi struktur supaya ide tidak monoton dan posting tetap konsisten tanpa mendadak.',
          },
          {
            question: 'Kenapa kalender konten mencegah "posting dadakan asal jadi"?',
            options: [
              'Karena kalender otomatis membuat desain',
              'Karena kontennya sudah direncanakan lebih dulu, ada waktu untuk eksekusi matang',
              'Kalender tidak ada hubungannya dengan kualitas',
              'Karena kalender mengurangi jumlah followers',
            ],
            correctIndex: 1,
            explanation: 'Rencana di muka memberi waktu produksi yang cukup, beda dengan konten yang dibuat mendadak di menit terakhir.',
          },
        ],
      },
      {
        id: '2.2', title: 'Konsistensi Tone of Voice', icon: 'fa-comments', tag: 'TANTANGAN 2.2', type: 'quiz',
        info: 'Menjaga karakter tertulis brand tetap sama di setiap caption meski topiknya berbeda.',
        briefLabel: 'Client Mini-Brief:',
        briefBody: '"Kadang caption kita formal, kadang terlalu santai sampe kayak bukan Warung Kopi Abadi. Owner minta biar \'kedengeran\' sama tiap post."',
        materi: {
          intro: 'Tone of voice adalah "kepribadian tertulis" brand — kalau berubah-ubah, followers susah mengenali karakter brand.',
          points: [
            'Tentukan 2-3 kata sifat yang mewakili karakter brand (mis. hangat, santai, akrab) sebagai acuan tiap nulis caption.',
            'Tone boleh menyesuaikan konteks (promo vs edukasi) tapi "kepribadian dasarnya" harus tetap sama.',
          ],
        },
        aiIntro: 'Tone of voice itu kayak kepribadian brand dalam bentuk tulisan, Rina — kalau berubah-ubah, followers bingung ini akun siapa.',
        suggests: [{ id: 'faq-2.2-1', text: 'Gimana caranya tone tetap sama meski topiknya beda-beda?', answer: 'Pegang 2-3 kata sifat acuan (misal hangat & santai) sebagai filter tiap nulis caption apapun topiknya — dari situ nada bicara otomatis konsisten.' }],
        questions: [
          {
            question: 'Owner komplain caption kadang formal kadang santai. Solusi paling tepat?',
            options: [
              'Ganti admin sosmed tiap minggu',
              'Tentukan 2-3 kata sifat acuan tone brand, pakai sebagai filter tiap caption',
              'Biarkan saja, audiens tidak peduli',
              'Selalu pakai bahasa formal supaya aman',
            ],
            correctIndex: 1,
            explanation: 'Kata sifat acuan (hangat, santai, dst) jadi filter konsisten meski topik caption berbeda-beda.',
          },
          {
            question: 'Apakah tone of voice boleh berubah sama sekali tergantung jenis konten?',
            options: [
              'Boleh berubah total, tidak masalah',
              'Boleh menyesuaikan konteks tapi kepribadian dasarnya harus tetap sama',
              'Tidak boleh berubah sama sekali walau konteksnya beda',
              'Tone hanya berlaku untuk konten promo',
            ],
            correctIndex: 1,
            explanation: 'Nuansa boleh sedikit menyesuaikan (lebih serius saat edukasi, lebih ceria saat promo) tapi karakter dasarnya tetap harus dikenali sebagai brand yang sama.',
          },
        ],
      },
      {
        id: '2.3', title: 'Community Management & Respons Cepat', icon: 'fa-reply', tag: 'TANTANGAN 2.3', type: 'quiz',
        info: 'Menjaga kecepatan & kualitas respons komentar/DM sebagai bagian dari layanan pelanggan.',
        briefLabel: 'Client Mini-Brief:',
        briefBody: '"Makin banyak yang komen & DM sekarang, tapi kita suka telat bales jadi orang kayaknya kabur duluan."',
        materi: {
          intro: 'Respons cepat & tepat di komentar/DM adalah bagian dari layanan pelanggan — bukan cuma soal posting konten.',
          points: [
            'Respons dalam hitungan jam (bukan hari) menjaga calon pembeli tidak kabur ke kompetitor.',
            'Balasan personal (menyebut nama/pertanyaan spesifik) terasa lebih dipercaya dibanding template copy-paste.',
          ],
        },
        aiIntro: 'Community management itu bagian dari layanan pelanggan, Rina — bukan cuma soal posting konten doang.',
        suggests: [{ id: 'faq-2.3-1', text: 'Kenapa nggak boleh pakai template balasan yang sama semua?', answer: 'Balasan template terasa robotic dan bikin calon pembeli merasa tidak didengar — balasan personal yang menyebut pertanyaan spesifik mereka jauh lebih meyakinkan.' }],
        questions: [
          {
            question: 'Warung Kopi Abadi sering telat balas komentar/DM. Dampak paling langsung?',
            options: [
              'Tidak ada dampak berarti',
              'Calon pembeli bisa kabur ke kompetitor yang responsnya lebih cepat',
              'Followers otomatis bertambah',
              'Algoritma akan memprioritaskan akun ini',
            ],
            correctIndex: 1,
            explanation: 'Respons lambat membuat calon pembeli kehilangan momentum minat dan beralih ke opsi lain yang lebih responsif.',
          },
          {
            question: 'Kenapa balasan personal lebih efektif dibanding template copy-paste?',
            options: [
              'Balasan personal lebih cepat diketik',
              'Template selalu salah ejaan',
              'Balasan personal terasa lebih dipercaya karena merespons pertanyaan spesifik',
              'Tidak ada bedanya sama sekali',
            ],
            correctIndex: 2,
            explanation: 'Balasan yang menyebut detail spesifik pertanyaan pelanggan terasa lebih manusiawi dan meyakinkan dibanding template generik.',
          },
        ],
      },
      {
        id: '2.4', title: 'Menerjemahkan Feedback Revisi', icon: 'fa-comment-dots', tag: 'TANTANGAN 2.4', type: 'quiz',
        info: 'Mengubah feedback vague klien jadi keputusan konten yang konkret.',
        briefLabel: 'Brief via WhatsApp:',
        briefBody: '"Kontennya udah oke tapi kayaknya kurang \'nendang\' buat bikin orang stop scroll deh. Terus captionnya kurang related sama gaya kita." — Owner Warung Kopi Abadi, revisi ronde 1',
        materi: {
          intro: 'Sama seperti desain visual, feedback konten sosial media juga sering berupa perasaan ("kurang nendang") bukan instruksi teknis.',
          points: [
            '"Kurang nendang" di konten sosmed biasanya berarti hook 2 detik pertama lemah atau CTA kurang tegas.',
            '"Kurang related" berarti tone of voice menyimpang dari karakter brand yang sudah disepakati di 2.2.',
          ],
        },
        aiIntro: 'Feedback sosial media juga sering berupa perasaan, Rina — tugas kita menerjemahkannya jadi perbaikan konkret.',
        suggests: [{ id: 'faq-2.4-1', text: 'Gimana bedain "kurang nendang" itu soal hook atau soal CTA?', answer: 'Cek dulu di detik-detik awal — kalau orang kemungkinan besar sudah scroll sebelum sampai isi, itu soal hook. Kalau orang nonton sampai habis tapi tidak bertindak, itu soal CTA.' }],
        questions: [
          {
            question: 'Feedback "kurang nendang" pada konten sosmed paling sering berakar dari apa?',
            options: [
              'Warna konten yang terlalu terang',
              'Hook 2 detik pertama yang lemah atau CTA yang kurang tegas',
              'Jumlah hashtag yang sedikit',
              'Waktu posting yang salah',
            ],
            correctIndex: 1,
            explanation: 'Sama seperti desain, "kurang nendang" di konten sosmed biasanya soal hook awal yang lemah atau CTA yang tidak cukup mengajak bertindak.',
          },
          {
            question: '"Kurang related sama gaya kita" mengacu ke elemen apa yang perlu dicek ulang?',
            options: [
              'Jumlah followers',
              'Tone of voice yang sudah disepakati sebelumnya',
              'Ukuran font caption',
              'Jam posting',
            ],
            correctIndex: 1,
            explanation: 'Kalau konten terasa "bukan gaya brand", itu tanda tone of voice menyimpang dari karakter yang sudah ditetapkan — perlu dicek ulang ke acuan tone.',
          },
        ],
      },
      {
        id: 'checkpoint-2', title: 'Kastil Checkpoint 2', icon: 'fa-fort-awesome', tag: 'UJIAN REVISI', type: 'checkpoint',
        info: 'Ujian mandiri: rangkaian 3 konten mingguan Warung Kopi Abadi yang konsisten sebagai satu sistem brand!',
        briefLabel: 'Brief Mandatori Proyek Komersial:',
        briefBullets: [
          { strong: 'Wajib 3 Konten Berbeda Pilar:', rest: ' promo, edukasi/tips, dan testimoni — dengan tone of voice yang sama di ketiganya.' },
          { strong: 'Kalender Posting Jelas:', rest: ' tentukan jadwal 1 minggu untuk ketiga konten ini.' },
          { strong: 'Rencana Respons Komentar:', rest: ' siapkan contoh balasan untuk 2 skenario komentar berbeda (pertanyaan & pujian).' },
        ],
        materi: {
          intro: 'Ini adalah ujian Checkpoint Unit 2 — gabungan dari semua yang sudah kamu pelajari soal sistem konten mingguan.',
          points: [
            'Kamu akan direview lewat quiz singkat yang merangkum 4 topik Unit 2.',
            'Setelah lulus quiz, kamu masuk ke Tantangan Nyata: menyusun 1 set (3 konten) untuk Warung Kopi Abadi dengan deadline 7 hari.',
            'Tantangan dinilai 100% oleh human reviewer, bukan skor otomatis.',
          ],
        },
        aiIntro: 'Checkpoint kedua, Rina! Kali ini kamu diuji bikin SISTEM konten mingguan yang konsisten, bukan cuma 1 post bagus.',
        suggests: [{ id: 'faq-cp-2', text: 'Apa yang paling dinilai reviewer di checkpoint ini?', answer: 'Konsistensi tone of voice dan variasi pilar konten — apakah ketiganya benar-benar terasa dari brand yang sama meski temanya berbeda.' }],
        instruction: 'Kumpulkan 1 set (3 caption + rencana visual) untuk Warung Kopi Abadi sesuai brief di atas.',
        deadlineText: '7 hari',
        checklist: [
          'Tiga pilar konten berbeda (promo/edukasi/testimoni) tercakup',
          'Tone of voice konsisten di ketiganya',
          'Kalender posting 1 minggu disertakan',
          'Contoh respons komentar disiapkan',
        ],
      },

      // ── UNIT 3 — Roti Bakar Kenangan: kampanye bulanan (Mahir) ─────────────
      {
        id: '3.1', title: 'Riset Audiens & Positioning Konten', icon: 'fa-users', tag: 'TANTANGAN 3.1', type: 'quiz',
        info: 'Meneliti audiens & menentukan positioning sebagai fondasi kampanye sebulan penuh.',
        briefLabel: 'Client Mini-Brief:',
        briefBody: '"Roti Bakar Kenangan ada di 3 cabang kota beda-beda. Kami mau kelola sosmed pusat tapi kontennya tetep relevan buat semua cabang. Dari mana mulainya?"',
        materi: {
          intro: 'Proyek skala besar kayak gini butuh riset dulu sebelum eksekusi — siapa target audiensnya, dan gimana posisi brand dibanding kompetitor sejenis.',
          points: [
            'Audiens 3 cabang beda kota bisa punya kebiasaan beda — riset dulu pola interaksi tiap cabang sebelum bikin 1 strategi pukul rata.',
            'Positioning menentukan "kenapa orang harus pilih Roti Bakar Kenangan" dibanding roti bakar lain — ini jadi benang merah semua konten sebulan.',
          ],
        },
        aiIntro: 'Ini proyek akhir Unit 3, Rina — skala paling besar: 1 brand, banyak cabang, 1 bulan penuh. Mulai dari riset dulu sebelum eksekusi.',
        suggests: [{ id: 'faq-3.1-1', text: 'Kenapa nggak bisa langsung bikin 1 strategi sama buat semua cabang?', answer: 'Audiens tiap kota bisa punya kebiasaan dan waktu aktif berbeda — riset dulu memastikan strategi tetap relevan meski dieksekusi dari 1 akun pusat.' }],
        questions: [
          {
            question: 'Roti Bakar Kenangan punya 3 cabang beda kota. Langkah pertama sebelum bikin strategi konten sebulan?',
            options: [
              'Langsung posting sebanyak mungkin',
              'Riset pola audiens tiap cabang + tentukan positioning brand yang jadi benang merah',
              'Menyalin strategi kompetitor persis sama',
              'Fokus 1 cabang saja, abaikan yang lain',
            ],
            correctIndex: 1,
            explanation: 'Riset audiens dan positioning yang jelas jadi fondasi sebelum eksekusi konten skala besar dan multi-cabang.',
          },
          {
            question: 'Apa fungsi "positioning brand" dalam kampanye sebulan ini?',
            options: [
              'Menentukan harga produk',
              'Jadi benang merah alasan orang harus pilih brand ini dibanding kompetitor',
              'Menentukan jumlah cabang baru',
              'Mengatur jadwal karyawan',
            ],
            correctIndex: 1,
            explanation: 'Positioning adalah alasan diferensiasi brand yang harus konsisten muncul di semua konten sepanjang kampanye.',
          },
        ],
      },
      {
        id: '3.2', title: 'Kalender Konten Lintas Platform', icon: 'fa-diagram-project', tag: 'TANTANGAN 3.2', type: 'quiz',
        info: 'Mengelola konten Instagram & TikTok sekaligus dengan tim kecil lewat sistem 1 ide banyak format.',
        briefLabel: 'Client Mini-Brief:',
        briefBody: '"Kita mau aktif di Instagram DAN TikTok bulan ini, tapi tim kecil. Gimana biar nggak keteteran bikin dua-duanya?"',
        materi: {
          intro: 'Mengelola 2 platform sekaligus butuh sistem, bukan bikin konten dobel dari nol untuk masing-masing.',
          points: [
            '1 ide konten inti bisa diadaptasi jadi format berbeda per platform (mis. behind-the-scenes jadi Reels + carousel IG) — bukan bikin 2 ide terpisah.',
            'Kalender lintas platform mencegah 2 tim/akun saling tumpang tindih jadwal posting atau malah kosong di hari yang sama.',
          ],
        },
        aiIntro: 'Kunci kelola 2 platform dengan tim kecil adalah 1 ide, banyak format — bukan dobel kerjaan dari nol, Rina.',
        suggests: [{ id: 'faq-3.2-1', text: 'Gimana caranya 1 ide bisa jadi konten di 2 platform berbeda?', answer: 'Ambil inti pesannya (misal proses bikin roti), lalu adaptasi formatnya — jadi video pendek dengan musik tren buat TikTok, jadi carousel foto proses buat Instagram.' }],
        questions: [
          {
            question: 'Tim kecil mau aktif di IG dan TikTok bulan ini. Pendekatan paling efisien?',
            options: [
              'Bikin ide konten terpisah total untuk masing-masing platform',
              'Ambil 1 ide inti, adaptasi format sesuai kebiasaan tiap platform',
              'Fokus 1 platform saja dan abaikan yang lain',
              'Posting konten yang sama persis tanpa penyesuaian format',
            ],
            correctIndex: 1,
            explanation: '1 ide inti yang diadaptasi formatnya jauh lebih efisien untuk tim kecil dibanding membuat ide terpisah untuk tiap platform.',
          },
          {
            question: 'Kenapa kalender lintas platform penting saat mengelola lebih dari 1 akun?',
            options: [
              'Supaya kontennya boleh sama persis semua',
              'Mencegah jadwal tumpang tindih atau justru kosong di hari yang sama',
              'Kalender hanya berguna untuk 1 platform saja',
              'Tidak penting selama ada admin yang pegang',
            ],
            correctIndex: 1,
            explanation: 'Kalender terpusat memastikan kedua platform tetap aktif terjadwal tanpa bentrok atau kekosongan konten.',
          },
        ],
      },
      {
        id: '3.3', title: 'Menangani Komentar Negatif & Krisis Kecil', icon: 'fa-triangle-exclamation', tag: 'TANTANGAN 3.3', type: 'quiz',
        info: 'Merespons komplain publik dengan tenang & transparan supaya krisis kecil tidak membesar.',
        briefLabel: 'Client Mini-Brief:',
        briefBody: '"Kemarin ada yang komplain rasa roti beda dari biasanya, komentarnya rame di post kita. Gimana cara jawabnya biar nggak makin panas?"',
        materi: {
          intro: 'Krisis kecil di kolom komentar bisa membesar kalau direspons defensif atau diabaikan — perlu pendekatan yang tenang dan transparan.',
          points: [
            'Jangan hapus/abaikan komentar negatif yang valid — itu justru terlihat menyembunyikan masalah dan memicu kecurigaan lebih besar.',
            'Respons publik singkat + ajak lanjut ke DM untuk detail — ini menunjukkan brand serius menangani tapi tidak membuka drama panjang di ruang publik.',
          ],
        },
        aiIntro: 'Krisis kecil di kolom komentar itu soal cara merespons, Rina — bukan soal menghilangkan komentarnya.',
        suggests: [{ id: 'faq-3.3-1', text: 'Kenapa nggak boleh langsung hapus komentar komplain?', answer: 'Menghapus komentar valid justru terlihat menyembunyikan masalah dan bisa memicu tuduhan brand tidak transparan — lebih baik direspons dengan tenang di ruang publik.' }],
        questions: [
          {
            question: 'Ada komplain rasa produk yang rame di kolom komentar. Respons paling tepat?',
            options: [
              'Hapus komentarnya supaya tidak makin rame',
              'Diamkan saja sampai reda sendiri',
              'Balas singkat secara publik dengan tenang + ajak lanjut ke DM untuk detail',
              'Balas dengan nada defensif membela produk',
            ],
            correctIndex: 2,
            explanation: 'Respons publik yang tenang menunjukkan brand terbuka menangani masalah, sementara DM menjaga detail sensitif tidak jadi drama publik berkepanjangan.',
          },
          {
            question: 'Kenapa menghapus komentar komplain yang valid berisiko bagi brand?',
            options: [
              'Karena melanggar aturan platform secara otomatis',
              'Karena terlihat menyembunyikan masalah dan bisa memicu kecurigaan lebih besar',
              'Karena komentar yang dihapus akan muncul lagi otomatis',
              'Tidak ada risiko sama sekali',
            ],
            correctIndex: 1,
            explanation: 'Publik cenderung curiga kalau komentar komplain "hilang" begitu saja — itu bisa dianggap brand menutupi masalah, bukan menyelesaikannya.',
          },
        ],
      },
      {
        id: '3.4', title: 'Laporan Performa & Rekomendasi', icon: 'fa-chart-line', tag: 'TANTANGAN 3.4', type: 'quiz',
        info: 'Menyusun laporan hasil kampanye yang menghubungkan angka ke tujuan awal, plus rekomendasi lanjutan.',
        briefLabel: 'Brief via WhatsApp:',
        briefBody: '"Udah sebulan jalan, owner mau tau hasilnya gimana dan rekomendasi buat bulan depan apa." — Owner Roti Bakar Kenangan',
        materi: {
          intro: 'Proyek besar tidak berakhir di "konten sudah posting" — laporan performa membuktikan strategi bekerja dan memberi arah bulan berikutnya.',
          points: [
            'Laporan yang baik menghubungkan hasil (engagement/reach) balik ke tujuan awal kampanye, bukan cuma angka mentah tanpa konteks.',
            'Rekomendasi lanjutan berdasarkan data yang sudah ada (mis. "konten edukasi paling tinggi engagement, perbanyak format ini") menunjukkan kerja yang terukur, bukan tebakan.',
          ],
        },
        aiIntro: 'Proyek besar seperti ini nggak selesai di "konten sudah posting", Rina — laporan & rekomendasi adalah bagian penting dari pekerjaan profesional.',
        suggests: [{ id: 'faq-3.4-1', text: 'Apa beda laporan angka mentah dengan laporan yang baik?', answer: 'Laporan yang baik menghubungkan angka balik ke tujuan awal (misal "engagement naik 40% dari target awal") dan memberi rekomendasi konkret, bukan sekadar menumpuk angka tanpa makna.' }],
        questions: [
          {
            question: 'Owner minta laporan hasil sebulan + rekomendasi. Elemen paling penting dalam laporan yang baik?',
            options: [
              'Daftar semua post yang pernah diunggah',
              'Menghubungkan hasil ke tujuan awal kampanye + rekomendasi berbasis data',
              'Jumlah total karakter caption yang ditulis',
              'Warna-warna yang paling sering dipakai',
            ],
            correctIndex: 1,
            explanation: 'Laporan yang baik memberi makna pada angka dengan mengaitkannya ke tujuan awal, lalu memberi rekomendasi konkret untuk langkah berikutnya.',
          },
          {
            question: 'Rekomendasi "perbanyak konten edukasi bulan depan" seharusnya didasarkan pada apa?',
            options: [
              'Perasaan atau tebakan pribadi',
              'Data performa konten edukasi dibanding pilar lain di bulan ini',
              'Permintaan kompetitor',
              'Jumlah followers baru saja',
            ],
            correctIndex: 1,
            explanation: 'Rekomendasi yang kredibel harus berbasis data performa nyata, bukan sekadar asumsi atau kesukaan pribadi.',
          },
        ],
      },
      {
        id: 'checkpoint-3', title: 'Gerbang Akhir: Proyek Sertifikasi', icon: 'fa-graduation-cap', tag: 'PROYEK AKHIR', type: 'checkpoint',
        isFinalProject: true,
        info: 'Proyek akhir Skill Map Social Media — kelulusan di sini menerbitkan Sertifikat Kompetensi WADAH-mu!',
        briefLabel: 'Brief Mandatori Proyek Akhir:',
        briefBullets: [
          { strong: 'Wajib Kalender Sebulan:', rest: ' rencana konten untuk Instagram & TikTok Roti Bakar Kenangan selama 4 minggu.' },
          { strong: 'Konsisten Tone & Positioning:', rest: ' semua konten mencerminkan karakter brand yang sudah ditentukan di riset awal.' },
          { strong: 'Siap Tangani Komentar:', rest: ' sertakan rencana respons untuk skenario komentar positif & negatif.' },
          { strong: 'Laporan & Rekomendasi:', rest: ' ringkasan strategi + rekomendasi lanjutan untuk bulan berikutnya.' },
        ],
        materi: {
          intro: 'Ini adalah Gerbang Akhir Skill Map Social Media — proyek paling kompleks yang pernah kamu kerjakan di WADAH.',
          points: [
            'Kamu akan direview lewat quiz singkat yang merangkum seluruh Unit 3.',
            'Setelah lulus quiz, kamu masuk ke Proyek Akhir: menyusun strategi konten 1 bulan untuk Roti Bakar Kenangan dengan deadline 10 hari.',
            'Proyek ini dinilai 100% oleh human reviewer WADAH — kelulusan di sini menerbitkan Sertifikat Kompetensi Social Media-mu, lengkap dengan nomor verifikasi resmi.',
          ],
        },
        aiIntro: 'Selamat sampai di gerbang terakhir, Rina! Ini bukan sekadar checkpoint biasa — approval di sini menerbitkan sertifikat kompetensi resmi WADAH-mu. Kerjakan sebaik yang kamu bisa.',
        suggests: [{ id: 'faq-cp-3', text: 'Apa yang terjadi setelah proyek akhir ini disetujui?', answer: 'Kamu akan mendapatkan Sertifikat Kompetensi Social Media resmi dari WADAH — punya nomor verifikasi unik yang bisa dicek siapa saja, dan langsung masuk ke profil publikmu.' }],
        instruction: 'Kumpulkan 1 dokumen strategi (kalender konten sebulan + rencana respons + rekomendasi) untuk Roti Bakar Kenangan sesuai brief di atas.',
        deadlineText: '10 hari',
        checklist: [
          'Kalender konten 4 minggu untuk IG & TikTok tersusun',
          'Tone of voice & positioning konsisten di seluruh rencana',
          'Rencana respons komentar positif & negatif disertakan',
          'Laporan & rekomendasi lanjutan disertakan',
        ],
      },
    ],
  },

  // ── VIDEO & REELS — Kedai Mie Legenda (light pass) ──────────────────────────
  video: {
    mapTitle: 'Peta Misi: Video Creator',
    unitNotes: [
      'Unit 1: Fondasi Hook & Kepatuhan Brief (Tingkat Pemula)',
      'Unit 2: Konsistensi Visual Series Video (Tingkat Menengah)',
      'Unit 3: Proyek Kampanye Video & Sertifikasi (Tingkat Mahir)',
    ],
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
        checklist: [
          'Format 9:16 portrait, durasi 15-30 detik',
          'Hook visual kuat di detik 0-2',
          'Teks overlay harga & lokasi tercantum',
          'Pace & musik sesuai tren short-video',
        ],
      },

      // ── UNIT 2 — Kedai Mie Legenda: series video mingguan (Menengah) ───────
      {
        id: '2.1', title: 'Storyboard Sebelum Syuting', icon: 'fa-clipboard-list', tag: 'TANTANGAN 2.1', type: 'quiz',
        info: 'Merencanakan urutan shot sebelum syuting agar produksi lebih efisien.',
        briefLabel: 'Client Mini-Brief:',
        briefBody: '"Kita mau bikin beberapa video sekaligus minggu ini, tapi kalau syuting asal jalan suka buang waktu take ulang. Ada cara biar lebih efisien?"',
        materi: {
          intro: 'Storyboard sederhana sebelum syuting menghemat waktu produksi dan memastikan hasil sesuai rencana, bukan improvisasi di lokasi.',
          points: [
            'Storyboard tidak perlu gambar detail — cukup sketsa kasar + catatan shot (close-up, wide, dst) per adegan.',
            'Merencanakan urutan shot dulu mencegah bolak-balik setup kamera yang buang waktu produksi.',
          ],
        },
        aiIntro: 'Sekarang kita masuk ke persiapan produksi, Rina — storyboard sederhana bikin syuting jauh lebih efisien.',
        suggests: [{ id: 'faq-2.1-1', text: 'Storyboard itu harus digambar bagus ya?', answer: 'Tidak — cukup sketsa kasar/coretan + catatan shot per adegan. Tujuannya cuma supaya tim tahu urutan syuting, bukan karya seni.' }],
        questions: [
          {
            question: 'Tim mau syuting beberapa video sekaligus minggu ini. Cara paling efisien mencegah buang waktu take ulang?',
            options: [
              'Langsung syuting tanpa perencanaan, improvisasi di lokasi',
              'Bikin storyboard sederhana + urutan shot sebelum syuting',
              'Syuting semua adegan berkali-kali sampai puas',
              'Menunggu ide muncul saat kamera sudah nyala',
            ],
            correctIndex: 1,
            explanation: 'Storyboard sederhana memastikan urutan shot jelas sebelum syuting, mengurangi bolak-balik setup yang buang waktu.',
          },
          {
            question: 'Apa isi minimal sebuah storyboard produksi video pendek?',
            options: [
              'Gambar detail berwarna tiap frame',
              'Sketsa kasar + catatan jenis shot (close-up/wide) per adegan',
              'Daftar lagu yang akan dipakai saja',
              'Nama-nama crew produksi',
            ],
            correctIndex: 1,
            explanation: 'Storyboard produksi cukup berupa sketsa kasar dan catatan jenis shot — bukan karya seni, tapi panduan praktis di lokasi syuting.',
          },
        ],
      },
      {
        id: '2.2', title: 'Konsistensi Gaya Edit & Transisi', icon: 'fa-film', tag: 'TANTANGAN 2.2', type: 'quiz',
        info: 'Menjaga gaya edit & transisi tetap seragam supaya series video terasa satu identitas.',
        briefLabel: 'Client Mini-Brief:',
        briefBody: '"Video-video kita kemarin gaya editnya beda-beda, ada yang transisi cepat ada yang lambat. Owner bilang jadi kayak bukan dari 1 akun."',
        materi: {
          intro: 'Sama seperti desain visual, video juga butuh "sistem" — gaya edit yang konsisten bikin series video terasa satu identitas.',
          points: [
            'Tentukan 1-2 jenis transisi/efek yang jadi "ciri khas" dan pakai berulang di semua video series.',
            'Kecepatan potongan (pace) yang konsisten dengan genre konten (cepat untuk hype, lambat untuk storytelling) menjaga rasa video tetap seragam.',
          ],
        },
        aiIntro: 'Video juga butuh sistem gaya edit yang konsisten, Rina — biar series-nya terasa 1 identitas, bukan video lepas-lepas.',
        suggests: [{ id: 'faq-2.2-1', text: 'Berapa banyak jenis transisi yang ideal dipakai berulang?', answer: 'Cukup 1-2 jenis transisi ciri khas yang dipakai konsisten di semua video — kebanyakan variasi malah bikin identitas visual jadi tidak jelas.' }],
        questions: [
          {
            question: 'Video-video terasa beda gaya edit satu sama lain. Solusi paling tepat?',
            options: [
              'Ganti editor tiap video biar variatif',
              'Tentukan 1-2 gaya transisi ciri khas, pakai konsisten di semua video series',
              'Pakai semua jenis transisi yang tersedia di software',
              'Tidak masalah, penonton tidak memperhatikan',
            ],
            correctIndex: 1,
            explanation: 'Membatasi ke 1-2 gaya transisi ciri khas dan memakainya konsisten adalah cara membangun identitas visual series video.',
          },
          {
            question: 'Kenapa pace (kecepatan potongan) perlu konsisten dengan genre konten?',
            options: [
              'Supaya durasi video selalu sama persis',
              'Karena pace yang sesuai genre (cepat untuk hype, lambat untuk storytelling) menjaga rasa video tetap seragam',
              'Pace tidak berpengaruh ke apapun',
              'Supaya file lebih ringan',
            ],
            correctIndex: 1,
            explanation: 'Pace yang konsisten dengan genre kontennya menjaga "rasa" series video tetap seragam dan mudah dikenali penonton.',
          },
        ],
      },
      {
        id: '2.3', title: 'Musik yang Konsisten dengan Brand', icon: 'fa-music', tag: 'TANTANGAN 2.3', type: 'quiz',
        info: 'Memilih musik berdasarkan kecocokan mood brand, bukan sekadar tren.',
        briefLabel: 'Client Mini-Brief:',
        briefBody: '"Musik video kita kadang tren TikTok random, kadang nggak nyambung sama vibe kedai. Ada cara milih musik yang lebih terarah?"',
        materi: {
          intro: 'Musik bukan sekadar ikut tren — musik yang tepat memperkuat mood brand, musik yang salah bisa merusak kesan meski visualnya bagus.',
          points: [
            'Pilih musik yang mood-nya sesuai karakter brand (energik untuk kedai ramai, santai untuk kafe tenang) — bukan sekadar ikut tren viral tanpa filter.',
            'Konsistensi genre musik antar video (walau lagunya beda-beda) membantu series terasa "senada".',
          ],
        },
        aiIntro: 'Musik bukan sekadar ikut tren, Rina — musik yang tepat memperkuat mood brand, yang salah bisa merusak kesan.',
        suggests: [{ id: 'faq-2.3-1', text: 'Apakah harus selalu pakai lagu yang lagi tren?', answer: 'Tidak selalu — tren cuma bermanfaat kalau moodnya cocok sama brand. Musik yang nyambung dengan karakter brand lebih penting daripada sekadar viral.' }],
        questions: [
          {
            question: 'Musik video sering asal ikut tren TikTok tanpa mempertimbangkan kecocokan. Risiko utamanya?',
            options: [
              'Video jadi lebih viral otomatis',
              'Mood musik bisa tidak nyambung dengan karakter brand, merusak kesan meski visual bagus',
              'Tidak ada risiko sama sekali',
              'Durasi video jadi lebih pendek',
            ],
            correctIndex: 1,
            explanation: 'Musik yang tidak cocok mood-nya dengan brand bisa merusak kesan keseluruhan video, walau secara visual sudah bagus.',
          },
          {
            question: 'Bagaimana cara menjaga series video "senada" meski memakai lagu berbeda-beda tiap video?',
            options: [
              'Pakai lagu yang identik persis setiap video',
              'Konsisten di genre/mood musik yang sesuai karakter brand',
              'Musik tidak perlu diperhatikan sama sekali',
              'Ganti genre musik total di setiap video',
            ],
            correctIndex: 1,
            explanation: 'Konsistensi genre/mood musik (walau lagu berbeda) menjaga series terasa senada dan mencerminkan karakter brand yang sama.',
          },
        ],
      },
      {
        id: '2.4', title: 'Menerjemahkan Feedback Revisi', icon: 'fa-comment-dots', tag: 'TANTANGAN 2.4', type: 'quiz',
        info: 'Mengecek konsistensi hook & gaya di seluruh series, bukan cuma satu video.',
        briefLabel: 'Brief via WhatsApp:',
        briefBody: '"Videonya udah bagus tapi kayaknya kurang \'nendang\' di awal. Terus rasanya kurang related sama gaya kedai kita." — Owner Kedai Mie Legenda, revisi ronde 1',
        materi: {
          intro: 'Sama seperti Unit 1, feedback video sering berupa perasaan — sekarang levelnya soal SERIES, bukan cuma 1 video.',
          points: [
            '"Kurang nendang di awal" tetap soal hook — tapi sekarang cek juga apakah hook-nya konsisten kuat di SEMUA video series, bukan cuma 1.',
            '"Kurang related sama gaya kedai" berarti gaya edit/musik menyimpang dari sistem yang sudah dibangun di 2.2/2.3.',
          ],
        },
        aiIntro: 'Feedback di level series ini sedikit beda, Rina — kita perlu cek konsistensi hook dan gaya di SEMUA video, bukan cuma satu.',
        suggests: [{ id: 'faq-2.4-1', text: 'Gimana cek "konsistensi hook" di banyak video sekaligus?', answer: 'Tonton beberapa detik pertama tiap video berurutan — kalau semuanya sama-sama kuat menahan perhatian, berarti konsisten. Kalau ada yang lemah, itu yang perlu revisi dulu.' }],
        questions: [
          {
            question: 'Feedback "kurang nendang di awal" untuk SERIES video (bukan 1 video) perlu dicek di mana?',
            options: [
              'Hanya di video pertama saja',
              'Konsistensi kekuatan hook di SEMUA video dalam series',
              'Hanya di video terakhir',
              'Tidak perlu dicek ulang, cukup 1 video representatif',
            ],
            correctIndex: 1,
            explanation: 'Untuk series, feedback hook perlu dicek konsistensinya di semua video — bukan cuma sampel satu video saja.',
          },
          {
            question: '"Kurang related sama gaya kedai" pada level series mengacu ke elemen apa?',
            options: [
              'Jumlah penonton video',
              'Gaya edit/musik yang menyimpang dari sistem yang sudah dibangun sebelumnya',
              'Warna baju talent',
              'Nama file video',
            ],
            correctIndex: 1,
            explanation: 'Di level series, "kurang related" berarti gaya edit atau musik sudah menyimpang dari sistem konsisten yang dibangun di topik-topik sebelumnya.',
          },
        ],
      },
      {
        id: 'checkpoint-2', title: 'Kastil Checkpoint 2', icon: 'fa-fort-awesome', tag: 'UJIAN REVISI', type: 'checkpoint',
        info: 'Ujian mandiri: rangkaian 3 video series Kedai Mie Legenda yang konsisten sebagai satu identitas!',
        briefLabel: 'Brief Mandatori Proyek Komersial:',
        briefBullets: [
          { strong: 'Wajib 3 Video Konsisten:', rest: ' gaya edit, transisi, dan mood musik yang sama di ketiganya.' },
          { strong: 'Storyboard Disertakan:', rest: ' rencana shot untuk masing-masing video sebelum produksi.' },
          { strong: 'Hook Kuat di Semua Video:', rest: ' bukan cuma 1 video yang kuat, ketiganya harus sama kuatnya.' },
        ],
        materi: {
          intro: 'Ini adalah ujian Checkpoint Unit 2 — gabungan dari semua yang sudah kamu pelajari soal konsistensi series video.',
          points: [
            'Kamu akan direview lewat quiz singkat yang merangkum 4 topik Unit 2.',
            'Setelah lulus quiz, kamu masuk ke Tantangan Nyata: menyusun 1 set (3 storyboard) untuk Kedai Mie Legenda dengan deadline 7 hari.',
            'Tantangan dinilai 100% oleh human reviewer, bukan skor otomatis.',
          ],
        },
        aiIntro: 'Checkpoint kedua, Rina! Kali ini kamu diuji bikin SERIES video yang konsisten, bukan cuma 1 video bagus.',
        suggests: [{ id: 'faq-cp-2', text: 'Apa yang paling dinilai reviewer di checkpoint ini?', answer: 'Konsistensi gaya edit, transisi, dan mood musik antar video — apakah ketiganya benar-benar terasa satu series, bukan video lepas-lepas.' }],
        instruction: 'Kumpulkan 1 set (3 storyboard/naskah) video series untuk Kedai Mie Legenda sesuai brief di atas.',
        deadlineText: '7 hari',
        checklist: [
          'Storyboard tersedia untuk ketiga video',
          'Gaya edit & transisi konsisten di ketiganya',
          'Mood musik senada di seluruh series',
          'Hook kuat & konsisten di semua video',
        ],
      },

      // ── UNIT 3 — Kopi Kilat Ekspres: proyek akhir (Mahir) ──────────────────
      {
        id: '3.1', title: 'Riset Tren & Hook Multi-Video', icon: 'fa-magnifying-glass', tag: 'TANTANGAN 3.1', type: 'quiz',
        info: 'Meriset variasi teknik hook supaya 3 video sekaligus tidak terasa formula yang diulang.',
        briefLabel: 'Client Mini-Brief:',
        briefBody: '"Kopi Kilat Ekspres mau kampanye video buat launching 3 menu baru sekaligus. Kami pengen tiap video punya hook yang kuat tapi nggak keliatan sama semua."',
        materi: {
          intro: 'Proyek besar butuh riset tren dulu — supaya tiap video punya hook yang segar & berbeda, bukan formula yang itu-itu saja diulang 3 kali.',
          points: [
            'Riset video-video sejenis yang sedang tren membantu menemukan variasi teknik hook (pertanyaan, visual mengejutkan, suara ASMR, dst).',
            '3 video untuk 3 menu beda perlu 3 pendekatan hook berbeda supaya tidak terasa formula yang diulang-ulang.',
          ],
        },
        aiIntro: 'Ini proyek akhir Unit 3, Rina — 3 video untuk 3 menu baru sekaligus. Riset tren dulu supaya tiap hook terasa segar.',
        suggests: [{ id: 'faq-3.1-1', text: 'Kenapa nggak boleh pakai formula hook yang sama di ketiga video?', answer: 'Kalau formulanya sama persis, penonton yang lihat ketiganya berturut-turut akan merasa "déjà vu" dan bosan — variasi teknik hook menjaga tiap video tetap segar.' }],
        questions: [
          {
            question: 'Kopi Kilat Ekspres mau 3 video untuk 3 menu baru. Kenapa hook-nya harus berbeda pendekatan?',
            options: [
              'Supaya lebih susah dibuat',
              'Supaya tidak terasa formula yang diulang-ulang saat ditonton berurutan',
              'Aturan platform mewajibkan variasi',
              'Tidak ada alasan khusus',
            ],
            correctIndex: 1,
            explanation: 'Variasi pendekatan hook mencegah kesan "formula yang sama diulang" saat ketiga video ditonton berurutan oleh audiens yang sama.',
          },
          {
            question: 'Apa manfaat riset tren sebelum produksi 3 video sekaligus?',
            options: [
              'Supaya bisa menjiplak video kompetitor persis sama',
              'Menemukan variasi teknik hook yang relevan dan sedang efektif',
              'Riset tren tidak ada manfaatnya untuk produksi',
              'Supaya proses produksi lebih lama',
            ],
            correctIndex: 1,
            explanation: 'Riset tren membantu menemukan variasi teknik hook yang benar-benar efektif saat ini, bukan asal tebak.',
          },
        ],
      },
      {
        id: '3.2', title: 'Adaptasi 1 Konsep ke Banyak Platform', icon: 'fa-shuffle', tag: 'TANTANGAN 3.2', type: 'quiz',
        info: 'Menyesuaikan 1 konsep video untuk kebiasaan berbeda di TikTok, Reels, dan YouTube Shorts.',
        briefLabel: 'Client Mini-Brief:',
        briefBody: '"Video-video ini mau kita taruh di TikTok, Reels, sama YouTube Shorts. Apa perlu bikin beda-beda tiap platform?"',
        materi: {
          intro: 'Meski formatnya mirip (semua vertical short video), tiap platform punya kebiasaan audiens berbeda yang perlu disesuaikan.',
          points: [
            'Struktur inti (hook-isi-CTA) bisa sama, tapi durasi ideal & gaya caption sedikit berbeda antar TikTok/Reels/Shorts.',
            'Adaptasi bukan berarti bikin ulang dari nol — cukup sesuaikan bagian intro/outro & teks caption per platform.',
          ],
        },
        aiIntro: 'Ketiga platform ini mirip tapi tidak identik, Rina — kita adaptasi sedikit, bukan bikin ulang dari nol.',
        suggests: [{ id: 'faq-3.2-1', text: 'Apa yang paling perlu disesuaikan antar platform?', answer: 'Durasi ideal dan gaya caption paling perlu disesuaikan — struktur inti video (hook-isi-CTA) bisa tetap sama di ketiga platform.' }],
        questions: [
          {
            question: 'Video yang sama mau ditaruh di TikTok, Reels, dan YouTube Shorts. Pendekatan paling tepat?',
            options: [
              'Bikin ulang total dari nol untuk tiap platform',
              'Pakai struktur inti yang sama, sesuaikan durasi & caption per platform',
              'Upload video identik tanpa penyesuaian apapun',
              'Pilih hanya 1 platform saja supaya tidak ribet',
            ],
            correctIndex: 1,
            explanation: 'Struktur inti bisa dipakai ulang, cukup adaptasi durasi dan caption sesuai kebiasaan tiap platform — lebih efisien daripada membuat ulang total.',
          },
          {
            question: 'Kenapa adaptasi platform TIDAK sama dengan membuat video benar-benar baru?',
            options: [
              'Karena keduanya sebenarnya sama saja',
              'Karena adaptasi cukup menyesuaikan bagian tertentu (intro/outro/caption), bukan mengubah keseluruhan konsep',
              'Karena platform tidak mempengaruhi apapun',
              'Karena video baru selalu lebih baik',
            ],
            correctIndex: 1,
            explanation: 'Adaptasi mempertahankan konsep inti dan hanya menyesuaikan elemen yang benar-benar berbeda kebiasaannya antar platform.',
          },
        ],
      },
      {
        id: '3.3', title: 'Directing Talent & Koordinasi Tim Kecil', icon: 'fa-user-group', tag: 'TANTANGAN 3.3', type: 'quiz',
        info: 'Mengarahkan talent non-profesional & mengatur urutan syuting agar efisien.',
        briefLabel: 'Client Mini-Brief:',
        briefBody: '"Kali ini kita syuting pake talent/karyawan kedai buat 3 video sekaligus dalam 1 hari. Gimana biar efisien dan hasilnya tetap natural?"',
        materi: {
          intro: 'Mengarahkan talent non-profesional (karyawan, bukan aktor) butuh pendekatan berbeda dari mengarahkan aktor — fokus ke kenyamanan supaya hasilnya tetap natural.',
          points: [
            'Beri arahan sederhana & konkret (bukan istilah teknis film) supaya talent non-profesional mudah mengikuti.',
            'Syuting beberapa video dalam 1 hari perlu urutan yang efisien (kelompokkan shot dengan setup/lokasi yang sama) supaya tidak bolak-balik.',
          ],
        },
        aiIntro: 'Mengarahkan karyawan kedai beda dengan mengarahkan aktor profesional, Rina — kuncinya bikin mereka nyaman dan arahannya sederhana.',
        suggests: [{ id: 'faq-3.3-1', text: 'Gimana kalau talent-nya grogi di depan kamera?', answer: 'Beri arahan sederhana dan konkret (bukan istilah teknis), dan biarkan mereka melakukan aktivitas natural yang biasa mereka lakukan — itu mengurangi rasa "diawasi kamera".' }],
        questions: [
          {
            question: 'Syuting 3 video sekaligus dalam 1 hari pakai karyawan kedai sebagai talent. Arahan yang paling tepat?',
            options: [
              'Gunakan istilah teknis film yang detail supaya profesional',
              'Beri arahan sederhana & konkret, fokus bikin talent nyaman',
              'Biarkan talent improvisasi total tanpa arahan sama sekali',
              'Ganti talent dengan aktor profesional saja',
            ],
            correctIndex: 1,
            explanation: 'Talent non-profesional lebih mudah mengikuti arahan sederhana dan konkret — kenyamanan mereka menentukan seberapa natural hasilnya.',
          },
          {
            question: 'Cara paling efisien syuting 3 video dalam 1 hari?',
            options: [
              'Syuting video 1 sampai selesai total, baru pindah ke video 2',
              'Kelompokkan shot berdasarkan setup/lokasi yang sama meski beda video',
              'Syuting semua secara acak tanpa urutan',
              'Menyuruh talent syuting sendiri tanpa pengawasan',
            ],
            correctIndex: 1,
            explanation: 'Mengelompokkan shot dengan setup/lokasi yang sama (meski untuk video berbeda) menghindari bolak-balik setup yang buang waktu.',
          },
        ],
      },
      {
        id: '3.4', title: 'Presentasi Konsep ke Klien', icon: 'fa-file-signature', tag: 'TANTANGAN 3.4', type: 'quiz',
        info: 'Mendapatkan persetujuan konsep sebelum produksi supaya revisi terjadi di tahap murah.',
        briefLabel: 'Brief via WhatsApp:',
        briefBody: '"Sebelum kita syuting semua, boleh liat dulu konsepnya kayak gimana? Biar aku bisa kasih masukan sebelum mulai produksi." — Owner Kopi Kilat Ekspres',
        materi: {
          intro: 'Proyek besar butuh persetujuan konsep SEBELUM produksi — supaya revisi terjadi di tahap murah (konsep), bukan tahap mahal (syuting ulang).',
          points: [
            'Presentasi konsep berisi: storyboard singkat, referensi hook, dan alasan pemilihan gaya untuk tiap video.',
            'Mendapat sign-off klien sebelum syuting mencegah revisi besar setelah produksi selesai — jauh lebih murah memperbaiki di tahap konsep.',
          ],
        },
        aiIntro: 'Presentasi konsep sebelum syuting itu investasi, Rina — revisi di tahap konsep jauh lebih murah daripada syuting ulang.',
        suggests: [{ id: 'faq-3.4-1', text: 'Apa isi minimal presentasi konsep ke klien?', answer: 'Storyboard singkat tiap video, referensi hook yang dipakai, dan alasan singkat kenapa gaya itu dipilih — cukup untuk klien memahami arah sebelum produksi dimulai.' }],
        questions: [
          {
            question: 'Kenapa penting mendapat persetujuan konsep SEBELUM syuting, bukan setelahnya?',
            options: [
              'Supaya proses terlihat lebih formal',
              'Revisi di tahap konsep jauh lebih murah dan cepat dibanding syuting ulang',
              'Klien selalu setuju di tahap manapun',
              'Tidak ada bedanya, revisi bisa kapan saja',
            ],
            correctIndex: 1,
            explanation: 'Mengubah storyboard jauh lebih murah dan cepat dibanding mengulang syuting yang sudah selesai — makanya sign-off konsep dilakukan di awal.',
          },
          {
            question: 'Apa isi minimal presentasi konsep video ke klien sebelum produksi?',
            options: [
              'Hanya judul video saja',
              'Storyboard singkat + referensi hook + alasan pemilihan gaya',
              'Daftar harga jasa produksi',
              'Nama-nama crew yang terlibat',
            ],
            correctIndex: 1,
            explanation: 'Storyboard singkat, referensi, dan alasan pemilihan gaya sudah cukup untuk klien memahami arah konsep sebelum memberi persetujuan.',
          },
        ],
      },
      {
        id: 'checkpoint-3', title: 'Gerbang Akhir: Proyek Sertifikasi', icon: 'fa-graduation-cap', tag: 'PROYEK AKHIR', type: 'checkpoint',
        isFinalProject: true,
        info: 'Proyek akhir Skill Map Video & Reels — kelulusan di sini menerbitkan Sertifikat Kompetensi WADAH-mu!',
        briefLabel: 'Brief Mandatori Proyek Akhir:',
        briefBullets: [
          { strong: 'Wajib 3 Video Konsisten:', rest: ' satu sistem gaya edit & musik diterapkan di ketiga video untuk 3 menu baru.' },
          { strong: 'Hook Bervariasi:', rest: ' tiap video pakai pendekatan hook berbeda, tidak formula yang diulang.' },
          { strong: 'Siap Multi-Platform:', rest: ' storyboard mempertimbangkan adaptasi ke TikTok, Reels, dan YouTube Shorts.' },
          { strong: 'Sertakan Rasional Konsep:', rest: ' ringkasan alasan di balik pemilihan hook & gaya tiap video.' },
        ],
        materi: {
          intro: 'Ini adalah Gerbang Akhir Skill Map Video & Reels — proyek paling kompleks yang pernah kamu kerjakan di WADAH.',
          points: [
            'Kamu akan direview lewat quiz singkat yang merangkum seluruh Unit 3.',
            'Setelah lulus quiz, kamu masuk ke Proyek Akhir: menyusun 3 storyboard video untuk Kopi Kilat Ekspres dengan deadline 10 hari.',
            'Proyek ini dinilai 100% oleh human reviewer WADAH — kelulusan di sini menerbitkan Sertifikat Kompetensi Video & Reels-mu, lengkap dengan nomor verifikasi resmi.',
          ],
        },
        aiIntro: 'Selamat sampai di gerbang terakhir, Rina! Ini bukan sekadar checkpoint biasa — approval di sini menerbitkan sertifikat kompetensi resmi WADAH-mu. Kerjakan sebaik yang kamu bisa.',
        suggests: [{ id: 'faq-cp-3', text: 'Apa yang terjadi setelah proyek akhir ini disetujui?', answer: 'Kamu akan mendapatkan Sertifikat Kompetensi Video & Reels resmi dari WADAH — punya nomor verifikasi unik yang bisa dicek siapa saja, dan langsung masuk ke profil publikmu.' }],
        instruction: 'Kumpulkan 1 set (3 storyboard/naskah + rasional konsep) video untuk Kopi Kilat Ekspres sesuai brief di atas.',
        deadlineText: '10 hari',
        checklist: [
          'Ketiga storyboard menerapkan satu sistem gaya edit & musik',
          'Hook tiap video pakai pendekatan berbeda',
          'Storyboard siap diadaptasi ke TikTok/Reels/Shorts',
          'Rasional konsep (alasan pemilihan hook & gaya) disertakan',
        ],
      },
    ],
  },

  // ── DESAIN GRAFIS — Warung Makan Pak Budi / Kopi Senja (FULL DEPTH) ─────────
  desain: {
    mapTitle: 'Peta Misi: Poster Designer',
    unitNotes: [
      'Unit 1: Fondasi Estetika & Kepatuhan Brief (Tingkat Pemula)',
      'Unit 2: Konsistensi Visual & Sistem Brand (Tingkat Menengah)',
      'Unit 3: Proyek Akhir & Sertifikasi (Tingkat Mahir)',
    ],
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
        checklist: [
          'Ukuran 1080x1080px (format Instagram Feed)',
          'Warna brand konsisten (merah bata & kuning emas)',
          'Logo & headline promo terbaca jelas dalam 2 detik',
          'Kontras teks minimal 4.5:1 sudah dicek',
        ],
      },

      // ── UNIT 2 — Kopi Senja: rangkaian konten mingguan (Menengah) ──────────
      {
        id: '2.1', title: 'Sistem Grid & Alignment', icon: 'fa-table-cells', tag: 'TANTANGAN 2.1', type: 'quiz',
        info: 'Menyusun beberapa desain berbeda agar tetap terasa satu sistem lewat grid dan alignment yang konsisten.',
        briefLabel: 'Client Mini-Brief:',
        briefBody: '"Kopi Senja mau posting rutin 3x seminggu sekarang, bukan cuma sesekali. Tolong bantu biar feed kita keliatan rapi as a set, jangan berantakan kayak asal comot template."',
        materi: {
          intro: 'Satu poster yang bagus itu mudah. Yang lebih sulit adalah bikin banyak poster berbeda yang tetap terasa satu keluarga saat dilihat berjajar di grid profil.',
          points: [
            'Grid/margin yang sama di setiap desain (misal margin 60px di semua sisi) bikin mata pembaca "terbiasa" dan tidak perlu beradaptasi ulang tiap geser.',
            'Alignment yang konsisten (semua headline rata kiri, atau semua rata tengah) adalah sinyal visual bahwa konten-konten ini berasal dari brand yang sama.',
          ],
        },
        aiIntro: 'Sekarang levelnya naik, Rina — bukan cuma 1 poster, tapi serangkaian konten yang harus terasa 1 keluarga. Sistem grid yang konsisten adalah kuncinya.',
        suggests: [{ id: 'faq-2.1-1', text: 'Kenapa grid/margin harus sama persis di semua desain?', answer: 'Kalau margin berubah-ubah antar desain, feed jadi terasa "goyang" saat di-scroll — padahal detail sekecil itu yang bikin sebuah akun terasa profesional dan terkurasi.' }],
        questions: [
          {
            question: 'Kopi Senja mau posting 3 desain berbeda minggu ini (promo, testimoni, produk baru). Apa yang PALING menjaga ketiganya terasa "satu keluarga" di grid feed?',
            options: [
              'Menggunakan margin, grid, dan alignment yang sama persis di ketiganya meski isi kontennya beda',
              'Membuat tiap desain sebebas-bebasnya sesuai mood masing-masing',
              'Memakai template gratis yang berbeda-beda dari internet',
              'Mengganti logo di tiap desain supaya lebih variatif',
            ],
            correctIndex: 0,
            explanation: 'Konsistensi sistem (grid, margin, alignment) adalah yang membuat konten yang berbeda-beda tetap terasa berasal dari brand yang sama.',
          },
          {
            question: 'Kenapa "alignment rata kiri di semua desain" lebih baik daripada alignment yang berubah-ubah tiap posting?',
            options: [
              'Rata kiri secara teknis lebih mudah dikerjakan di software',
              'Alignment yang konsisten adalah sinyal visual bawah sadar bahwa konten berasal dari brand yang sama',
              'Rata kiri satu-satunya alignment yang didukung Instagram',
              'Tidak ada bedanya sama sekali secara persepsi audiens',
            ],
            correctIndex: 1,
            explanation: 'Alignment yang konsisten membangun "bahasa visual" brand — audiens belajar mengenali konten kita bahkan sebelum membaca isinya.',
          },
        ],
      },
      {
        id: '2.2', title: 'Hierarki di Multi-Aset', icon: 'fa-layer-group', tag: 'TANTANGAN 2.2', type: 'quiz',
        info: 'Menentukan elemen dominan yang berbeda di tiap desain tanpa merusak sistem visual keseluruhan.',
        briefLabel: 'Client Mini-Brief:',
        briefBody: '"Untuk 3 post minggu ini: satu buat promo diskon, satu testimoni pelanggan, satu produk baru. Tapi jangan sampai fokusnya sama semua — kan pesannya beda-beda."',
        materi: {
          intro: 'Hierarki visual di Unit 1 mengajarkan "apa yang paling besar di 1 poster". Di sini, tantangannya lebih jauh: elemen dominan boleh beda tiap desain, tapi sistemnya (ukuran heading, jenis font, dst) harus tetap satu.',
          points: [
            'Elemen dominan menyesuaikan tujuan konten: diskon → angka diskon paling besar; testimoni → kutipan pelanggan paling besar; produk baru → foto produk paling besar.',
            'Yang TIDAK boleh berubah antar desain: font family, skala ukuran heading vs body, dan posisi logo — itu yang menjaga sistemnya tetap satu.',
          ],
        },
        aiIntro: 'Nah ini bagian yang sering bikin bingung, Rina — elemen dominan boleh beda-beda, tapi bukan berarti sistem desainnya ikut berantakan.',
        suggests: [{ id: 'faq-2.2-1', text: 'Kalau elemen dominannya beda, apa dong yang harus tetap sama?', answer: 'Font family, skala ukuran (headline selalu 2x lebih besar dari body misalnya), dan posisi logo — itu semua yang menjaga desain tetap terasa satu sistem meski isinya beda-beda.' }],
        questions: [
          {
            question: 'Untuk desain post "Testimoni Pelanggan", elemen apa yang paling masuk akal jadi paling dominan/besar?',
            options: [
              'Logo brand dibuat sebesar mungkin',
              'Kutipan/quote testimoni pelanggan',
              'Harga menu yang tidak dibahas di testimoni',
              'Background pattern dekoratif',
            ],
            correctIndex: 1,
            explanation: 'Testimoni menjual lewat kata-kata pelanggan asli — kutipan itu sendiri yang harus jadi pusat perhatian, bukan elemen dekoratif.',
          },
          {
            question: 'Manakah yang HARUS tetap konsisten di ketiga desain (promo, testimoni, produk baru) meski elemen dominannya berbeda?',
            options: [
              'Elemen dominan harus selalu sama di semua desain',
              'Font family, skala hierarki ukuran, dan posisi logo',
              'Warna background harus identik pixel-perfect',
              'Semua desain harus punya foto produk',
            ],
            correctIndex: 1,
            explanation: 'Font, skala hierarki, dan posisi logo adalah "tulang punggung" sistem — itu yang bikin variasi konten tetap terasa satu brand.',
          },
        ],
      },
      {
        id: '2.3', title: 'Brand Guideline Mini', icon: 'fa-swatchbook', tag: 'TANTANGAN 2.3', type: 'quiz',
        info: 'Menyusun aturan pemakaian warna & logo yang bisa dipakai ulang, bukan menebak-nebak tiap kali desain baru.',
        briefLabel: 'Client Mini-Brief:',
        briefBody: '"Jujur aja kadang gw bingung logo Kopi Senja taruh di mana, terus warnanya kadang beda-beda tiap post. Ada standar bakunya nggak sih?"',
        materi: {
          intro: 'Brand guideline "mini" bukan dokumen 50 halaman ala perusahaan besar — cukup 3-4 aturan simpel yang konsisten dipakai ulang di setiap desain baru.',
          points: [
            'Aturan logo: satu posisi baku (misal selalu pojok kanan atas) + satu ukuran minimum supaya tetap terbaca di thumbnail kecil.',
            'Aturan warna: 1 warna utama (dominan), 1 warna aksen (untuk CTA/highlight), maksimal 1 warna netral (background/teks) — bukan bebas pilih warna tiap kali.',
          ],
        },
        aiIntro: 'Brand guideline itu kedengarannya formal, tapi sebenarnya cuma "aturan main" simpel biar kamu nggak nebak-nebak lagi tiap kali desain baru.',
        suggests: [{ id: 'faq-2.3-1', text: 'Berapa banyak warna yang idealnya ada di sebuah brand guideline mini?', answer: 'Cukup 3: 1 warna utama/dominan, 1 warna aksen untuk CTA atau highlight, dan 1 warna netral untuk teks/background. Lebih dari itu biasanya bikin desain terasa tidak terkontrol.' }],
        questions: [
          {
            question: 'Apa manfaat utama menetapkan posisi logo yang BAKU (selalu di tempat yang sama) di setiap desain?',
            options: [
              'Supaya proses desain lebih cepat tanpa mikir ulang tiap kali, dan audiens langsung mengenali pola brand',
              'Supaya file desain berukuran lebih kecil',
              'Karena software desain mewajibkan posisi logo tetap',
              'Tidak ada manfaat nyata, hanya soal selera',
            ],
            correctIndex: 0,
            explanation: 'Posisi logo yang konsisten mempercepat proses desain (tidak perlu menebak ulang) dan membangun pola visual yang dikenali audiens dari waktu ke waktu.',
          },
          {
            question: 'Kopi Senja punya warna cokelat sebagai warna utama. Apa peran warna aksen dalam sistem ini?',
            options: [
              'Menggantikan warna utama supaya tidak monoton',
              'Menonjolkan elemen penting seperti tombol CTA atau info diskon, tanpa merebut posisi warna utama',
              'Dipakai secara acak di background',
              'Warna aksen tidak diperlukan dalam sistem warna manapun',
            ],
            correctIndex: 1,
            explanation: 'Warna aksen bertugas menarik perhatian ke bagian spesifik (CTA, diskon) sambil warna utama tetap mendominasi identitas keseluruhan.',
          },
        ],
      },
      {
        id: '2.4', title: 'Menerjemahkan Feedback Revisi', icon: 'fa-comments', tag: 'TANTANGAN 2.4', type: 'quiz',
        info: 'Mengubah feedback vague klien ("kurang nendang") jadi keputusan desain yang konkret.',
        briefLabel: 'Brief via WhatsApp:',
        briefBody: '"Desainnya udah oke tapi kok kurang nendang ya? Terus kayak kurang related aja sama brand kita gitu, kurang tau napa." — Owner Kopi Senja, revisi ronde 1',
        materi: {
          intro: 'Feedback klien jarang teknis — "kurang nendang" atau "kurang related" itu perasaan, bukan instruksi. Tugas desainer profesional adalah menerjemahkannya jadi keputusan visual konkret, bukan menebak-nebak ulang dari nol.',
          points: [
            '"Kurang nendang" biasanya berarti kontras/hierarki lemah — coba naikkan ukuran elemen utama atau perkuat kontras warna.',
            '"Kurang related sama brand" biasanya berarti elemen visualnya menyimpang dari brand guideline yang sudah disepakati (font asing, warna di luar palet) — cek kembali ke guideline, bukan menambah elemen baru sembarangan.',
            'Kalau masih ambigu, tanya balik dengan pertanyaan spesifik (mis. "related dari sisi warna, font, atau gaya foto?") daripada menebak dan revisi berkali-kali.',
          ],
        },
        aiIntro: 'Ini skill yang jarang diajarkan tapi krusial, Rina — menerjemahkan perasaan klien jadi keputusan desain yang bisa dieksekusi.',
        suggests: [{ id: 'faq-2.4-1', text: 'Gimana kalau feedbacknya tetap ambigu setelah ditanya ulang?', answer: 'Tunjukkan 2 opsi visual konkret (bukan tanya terbuka lagi) — klien biasanya lebih mudah memilih "yang ini atau itu" daripada mendeskripsikan dari nol.' }],
        questions: [
          {
            question: 'Klien bilang desainnya "kurang nendang". Langkah PALING tepat sebagai desainer profesional?',
            options: [
              'Mendesain ulang dari nol dengan konsep yang sama sekali berbeda',
              'Menerjemahkan ke kemungkinan teknis (kontras/hierarki lemah) dan mencoba perbaikan spesifik di area itu dulu',
              'Mengabaikan feedback karena terlalu subjektif',
              'Langsung menambahkan banyak elemen dekoratif baru',
            ],
            correctIndex: 1,
            explanation: '"Kurang nendang" paling sering berakar dari kontras atau hierarki yang lemah — itu titik awal paling masuk akal untuk diperbaiki sebelum redesain total.',
          },
          {
            question: 'Klien bilang "kurang related sama brand kita" tapi tidak menjelaskan detail. Pertanyaan balik apa yang paling membantu?',
            options: [
              '"Mau saya desain ulang total?"',
              '"Related-nya dari sisi warna, font, atau gaya foto yang dimaksud?"',
              'Tidak perlu bertanya, cukup tebak saja',
              '"Budgetnya cukup nggak buat revisi?"',
            ],
            correctIndex: 1,
            explanation: 'Memecah pertanyaan jadi opsi konkret (warna/font/gaya foto) membuat klien lebih mudah menjawab spesifik dibanding pertanyaan terbuka yang justru menambah ambiguitas.',
          },
        ],
      },
      {
        id: 'checkpoint-2', title: 'Kastil Checkpoint 2', icon: 'fa-fort-awesome', tag: 'UJIAN REVISI', type: 'checkpoint',
        info: 'Ujian mandiri: rangkaian 3 konten Instagram Kopi Senja yang konsisten sebagai satu sistem brand!',
        briefLabel: 'Brief Mandatori Proyek Komersial:',
        briefBullets: [
          { strong: 'Wajib 3 Desain Konsisten:', rest: ' promo, testimoni, dan produk baru — grid, alignment, dan posisi logo harus sama di ketiganya.' },
          { strong: 'Hierarki Menyesuaikan Tujuan:', rest: ' elemen dominan boleh beda tiap desain (diskon/kutipan/produk), tapi sistem font & warna tetap satu.' },
          { strong: 'Ikuti Brand Guideline Mini:', rest: ' maksimal 3 warna (utama, aksen, netral), logo di posisi baku.' },
        ],
        materi: {
          intro: 'Ini adalah ujian Checkpoint Unit 2 — gabungan dari semua yang sudah kamu pelajari soal sistem visual multi-aset.',
          points: [
            'Kamu akan direview lewat quiz singkat yang merangkum 4 topik Unit 2.',
            'Setelah lulus quiz, kamu masuk ke Tantangan Nyata: membuat 1 set (3 desain) untuk Kopi Senja dengan deadline 7 hari.',
            'Tantangan dinilai 100% oleh human reviewer, bukan skor otomatis.',
          ],
        },
        aiIntro: 'Checkpoint kedua, Rina! Kali ini kamu diuji bukan cuma bikin 1 desain bagus, tapi 1 SISTEM yang konsisten di 3 desain sekaligus.',
        suggests: [{ id: 'faq-cp-2', text: 'Apa yang paling dinilai reviewer di checkpoint ini?', answer: 'Konsistensi sistem — apakah grid, tipografi, dan warnanya benar-benar sama di ketiga desain, bukan menilai satu desain individual saja.' }],
        instruction: 'Kumpulkan 1 set (3 file) desain Instagram Feed yang konsisten sesuai brief di atas.',
        deadlineText: '7 hari',
        checklist: [
          'Grid, margin & alignment sama di ketiga desain',
          'Elemen dominan sesuai tujuan tiap konten (promo/testimoni/produk)',
          'Palet warna & posisi logo konsisten dengan brand guideline',
          'Feedback revisi sebelumnya sudah diterapkan',
        ],
      },

      // ── UNIT 3 — Toko Batik Nusantara: proyek akhir (Mahir) ────────────────
      {
        id: '3.1', title: 'Riset Visual & Moodboard', icon: 'fa-images', tag: 'TANTANGAN 3.1', type: 'quiz',
        info: 'Menerjemahkan brief abstrak ("tradisional tapi modern") jadi arah visual yang jelas sebelum mulai desain.',
        briefLabel: 'Client Mini-Brief:',
        briefBody: '"Toko Batik Nusantara mau bikin 5 konten Instagram Feed yang menonjolkan motif batik tradisional tapi dengan gaya modern, biar anak muda juga tertarik beli."',
        materi: {
          intro: 'Sebelum buka software desain, proyek sebesar ini butuh arah visual yang jelas dulu — kalau tidak, 5 desain bisa saling tidak nyambung meski masing-masing "bagus".',
          points: [
            '"Tradisional tapi modern" adalah brief abstrak — pecah jadi elemen konkret: motif batik asli (tradisional) dipadukan dengan layout minimalis & tipografi kontemporer (modern).',
            'Moodboard (kumpulan referensi visual) membantu menyamakan ekspektasi dengan klien SEBELUM eksekusi — jauh lebih murah dibanding revisi total di akhir.',
            'Menjaga rasa hormat pada motif budaya itu penting: jangan distorsi motif batik sampai tidak dikenali, cukup padukan lewat layout & warna modern di sekitarnya.',
          ],
        },
        aiIntro: 'Ini proyek akhir Unit 3, Rina — skala paling besar yang pernah kamu kerjakan. Sebelum eksekusi, kita harus punya arah visual yang jelas dulu.',
        suggests: [{ id: 'faq-3.1-1', text: 'Gimana caranya "tradisional tapi modern" tidak jadi dua kesan yang tabrakan?', answer: 'Biarkan motif batik tetap otentik/asli sebagai elemen utama, lalu modernkan lewat elemen di sekitarnya — layout minimalis, tipografi kontemporer, whitespace yang cukup. Jangan mengubah motifnya sendiri.' }],
        questions: [
          {
            question: 'Brief "tradisional tapi modern" untuk Toko Batik Nusantara paling tepat diterjemahkan sebagai...',
            options: [
              'Menghapus motif batik sepenuhnya supaya terlihat modern',
              'Motif batik asli dipertahankan, dipadukan dengan layout minimalis dan tipografi kontemporer',
              'Menambahkan sebanyak mungkin efek dan filter modern ke motif batik',
              'Mengabaikan brief dan membuat desain generik ala brand internasional',
            ],
            correctIndex: 1,
            explanation: 'Kesan "modern" datang dari elemen di sekitar motif (layout, tipografi, whitespace) — bukan dari mengubah/menghapus motif batik itu sendiri.',
          },
          {
            question: 'Kenapa membuat moodboard sebelum mendesain 5 konten sekaligus itu penting?',
            options: [
              'Supaya proses desain terlihat lebih formal',
              'Untuk menyamakan ekspektasi arah visual dengan klien sebelum eksekusi, mencegah revisi total di akhir',
              'Moodboard wajib secara hukum untuk proyek komersial',
              'Tidak penting, langsung eksekusi lebih efisien',
            ],
            correctIndex: 1,
            explanation: 'Moodboard adalah investasi kecil di awal yang mencegah kerugian besar — revisi total 5 desain sekaligus jauh lebih mahal daripada meluruskan arah visual di awal.',
          },
        ],
      },
      {
        id: '3.2', title: 'Adaptasi Lintas Format', icon: 'fa-clone', tag: 'TANTANGAN 3.2', type: 'quiz',
        info: 'Menerapkan satu sistem desain ke kanvas Feed (1:1) dan Story (9:16) tanpa terasa dua brand berbeda.',
        briefLabel: 'Client Mini-Brief:',
        briefBody: '"5 konten ini nantinya juga mau kita share ulang ke Story biar lebih banyak yang lihat. Tapi jangan asal stretch ya, ntar gepeng."',
        materi: {
          intro: 'Di Unit 1 kamu belajar kenapa Feed dan Story butuh kanvas berbeda. Sekarang tantangannya lebih jauh: bagaimana SATU sistem desain bisa "mengalir" ke dua rasio tanpa terasa asal crop atau asal stretch.',
          points: [
            'Jangan pernah stretch/tarik paksa desain 1:1 ke 9:16 — itu merusak proporsi elemen (logo jadi gepeng, teks jadi distorsi).',
            'Sisakan "safe margin" ekstra di elemen utama supaya saat diadaptasi ke rasio lain, elemen kunci (motif, headline) tidak terpotong atau harus dipaksa reposisi drastis.',
            'Elemen sistem (font, warna, posisi logo) tetap sama di kedua format — yang berubah hanya layout/komposisi supaya pas dengan kanvas baru.',
          ],
        },
        aiIntro: 'Bagian ini yang bikin proyek terasa "profesional" — desainmu harus bisa hidup di lebih dari satu kanvas tanpa kehilangan identitasnya.',
        suggests: [{ id: 'faq-3.2-1', text: 'Kenapa nggak boleh asal stretch desain Feed ke ukuran Story?', answer: 'Stretch/tarik paksa mengubah rasio asli elemen — logo dan teks jadi terlihat gepeng atau melar, yang justru merusak kesan profesional yang susah payah dibangun.' }],
        questions: [
          {
            question: 'Kenapa desain Feed (1:1) tidak boleh sekadar di-stretch untuk dipakai di Story (9:16)?',
            options: [
              'Karena Instagram melarang secara teknis',
              'Karena stretch akan mendistorsi proporsi elemen seperti logo dan teks sehingga terlihat gepeng/melar',
              'Karena ukuran file akan menjadi terlalu besar',
              'Tidak masalah, stretch adalah cara tercepat dan hasilnya sama saja',
            ],
            correctIndex: 1,
            explanation: 'Stretch memaksa rasio elemen berubah non-proporsional — visual jadi terdistorsi dan terlihat tidak profesional, walau secara teknis "cepat".',
          },
          {
            question: 'Apa yang SEBAIKNYA tetap sama saat satu desain diadaptasi dari Feed ke Story?',
            options: [
              'Ukuran kanvas harus dipaksa identik',
              'Font, warna, dan posisi logo (elemen sistem) — layout boleh menyesuaikan kanvas baru',
              'Semua elemen harus di-resize dengan skala yang sama persis',
              'Tidak ada yang perlu dipertahankan, desain ulang dari nol lebih baik',
            ],
            correctIndex: 1,
            explanation: 'Elemen sistem (font, warna, posisi logo) menjaga identitas brand tetap dikenali, sementara layout/komposisi memang wajar berubah menyesuaikan bentuk kanvas.',
          },
        ],
      },
      {
        id: '3.3', title: 'Tipografi & Elemen Budaya', icon: 'fa-font', tag: 'TANTANGAN 3.3', type: 'quiz',
        info: 'Memilih tipografi yang terasa modern tanpa "menabrak" kekayaan visual motif batik.',
        briefLabel: 'Client Mini-Brief:',
        briefBody: '"Font-nya jangan yang kaku formal ya, tapi juga jangan norak. Yang penting harga sama nama produknya kebaca jelas walau di atas motif batik yang rame."',
        materi: {
          intro: 'Motif batik itu sendiri sudah punya kepadatan visual/detail tinggi — tipografi yang dipilih justru harus jadi penyeimbang, bukan menambah keramaian.',
          points: [
            'Font sans-serif dengan weight tegas (bold/semi-bold) lebih terbaca di atas motif yang ramai dibanding font tipis atau dekoratif yang justru "tenggelam".',
            'Beri "ruang napas" di sekitar teks (misal kotak/plang warna solid semi-transparan di belakang teks) supaya tetap terbaca tanpa harus menghilangkan motif di baliknya.',
            'Hindari font kaligrafi/script Barat yang justru terasa asing berdampingan dengan motif batik — pilih font netral modern yang tidak "bersaing budaya" dengan motif.',
          ],
        },
        aiIntro: 'Tipografi di atas motif seramai batik itu tantangan tersendiri, Rina — kuncinya bukan mengalahkan motifnya, tapi menyeimbanginya.',
        suggests: [{ id: 'faq-3.3-1', text: 'Kenapa font tipis/dekoratif kurang cocok di atas motif batik?', answer: 'Motif batik sudah punya banyak detail visual — font yang tipis atau terlalu dekoratif akan "tenggelam" dan sulit terbaca, beda dengan font tegas berbobot (bold) yang tetap menonjol di atas keramaian visual.' }],
        questions: [
          {
            question: 'Kenapa font sans-serif bold lebih disarankan dibanding font tipis di atas motif batik yang ramai?',
            options: [
              'Font bold lebih murah lisensinya',
              'Font tipis akan "tenggelam" di tengah detail motif yang padat, sementara font bold tetap terbaca jelas',
              'Font tipis tidak didukung oleh Instagram',
              'Tidak ada perbedaan keterbacaan antara keduanya',
            ],
            correctIndex: 1,
            explanation: 'Kepadatan visual motif batik butuh "lawan" tipografi yang tegas supaya teks tetap menjadi fokus, bukan justru hilang di antara detail motif.',
          },
          {
            question: 'Klien minta harga & nama produk tetap terbaca jelas walau di atas motif ramai. Solusi paling tepat?',
            options: [
              'Menghapus motif batik di area teks',
              'Menambahkan plang/kotak warna solid semi-transparan di belakang teks sebagai "ruang napas"',
              'Memperkecil ukuran teks supaya tidak mengganggu motif',
              'Mengganti motif batik dengan background polos di semua desain',
            ],
            correctIndex: 1,
            explanation: 'Kotak/plang semi-transparan menjaga keterbacaan teks tanpa menghilangkan motif — solusi yang menyeimbangkan kedua kebutuhan sekaligus.',
          },
        ],
      },
      {
        id: '3.4', title: 'Presentasi & Sign-off Klien', icon: 'fa-file-signature', tag: 'TANTANGAN 3.4', type: 'quiz',
        info: 'Mengemas hasil kerja beserta alasan desainnya supaya klien percaya diri menyetujui, bukan sekadar menerima pasrah.',
        briefLabel: 'Brief via WhatsApp:',
        briefBody: '"Sebelum gw approve buat posting semua, boleh dijelasin dulu nggak kenapa desainnya kayak gini? Biar gw juga ngerti dan bisa jelasin ke tim gw." — Owner Toko Batik Nusantara',
        materi: {
          intro: 'Proyek besar seperti ini biasanya tidak selesai dengan "kirim file lalu selesai" — presentasi singkat yang menjelaskan RASIONAL di balik keputusan desain membangun kepercayaan dan mempercepat approval.',
          points: [
            'Rasional desain menjawab "kenapa", bukan cuma "apa" — misal "warna aksen emas dipilih karena mengangkat kesan batik premium, bukan sekadar estetika".',
            'Presentasikan sebagai SATU SET (5 konten sekaligus), bukan satu-satu terpisah — supaya klien melihat konsistensi sistem yang sudah dibangun sejak Unit 2.',
            'Sertakan bagaimana desain ini menjawab tujuan awal ("menjangkau pembeli muda") secara eksplisit — klien akan lebih percaya diri approve kalau ia melihat brief-nya benar-benar terjawab.',
          ],
        },
        aiIntro: 'Ini kemampuan yang sering diabaikan tapi sangat menentukan reputasimu sebagai profesional — mempresentasikan hasil kerja, bukan cuma mengirim file.',
        suggests: [{ id: 'faq-3.4-1', text: 'Apa isi minimal dari presentasi rasional desain ke klien?', answer: 'Cukup 2-3 kalimat per keputusan besar (kenapa pilih warna ini, kenapa layout ini) yang mengaitkan balik ke brief awal klien — tidak perlu dokumen panjang, yang penting klien paham alasan di baliknya.' }],
        questions: [
          {
            question: 'Kenapa menjelaskan RASIONAL desain (bukan cuma mengirim file) penting di proyek sebesar ini?',
            options: [
              'Supaya terlihat sibuk dan effort',
              'Membangun kepercayaan klien dan mempercepat approval karena mereka paham alasan di balik tiap keputusan',
              'Itu syarat wajib dari WADAH untuk semua submission',
              'Tidak penting, hasil visual saja sudah cukup',
            ],
            correctIndex: 1,
            explanation: 'Klien yang memahami alasan di balik desain akan lebih percaya diri menyetujui — presentasi rasional mengubah "menerima pasrah" jadi "setuju dengan yakin".',
          },
          {
            question: 'Saat presentasi 5 konten sekaligus ke klien, hal apa yang paling penting ditonjolkan?',
            options: [
              'Menunjukkan tiap konten satu-satu tanpa menyebut hubungan antar konten',
              'Konsistensi sistem visual antar kelima konten dan bagaimana itu menjawab brief awal',
              'Harga jasa desain yang dikenakan',
              'Waktu pengerjaan yang dihabiskan',
            ],
            correctIndex: 1,
            explanation: 'Menunjukkan konsistensi sebagai SATU sistem (bukan potongan lepas) membuktikan bahwa brief "biar terasa satu brand" benar-benar dipenuhi.',
          },
        ],
      },
      {
        id: 'checkpoint-3', title: 'Gerbang Akhir: Proyek Sertifikasi', icon: 'fa-graduation-cap', tag: 'PROYEK AKHIR', type: 'checkpoint',
        isFinalProject: true,
        info: 'Proyek akhir Skill Map Desain Grafis — kelulusan di sini menerbitkan Sertifikat Kompetensi WADAH-mu!',
        briefLabel: 'Brief Mandatori Proyek Akhir:',
        briefBullets: [
          { strong: 'Wajib 5 Konten Konsisten:', rest: ' satu sistem visual (grid, tipografi, warna) diterapkan di seluruh 5 desain Instagram Feed.' },
          { strong: 'Motif Batik Otentik:', rest: ' motif tradisional dipertahankan, dipadukan dengan layout & tipografi modern.' },
          { strong: 'Siap Multi-Format:', rest: ' sistem desain harus bisa diadaptasi ke Story (9:16) tanpa distorsi.' },
          { strong: 'Sertakan Rasional Desain:', rest: ' ringkasan singkat alasan di balik keputusan warna, tipografi, dan layout.' },
        ],
        materi: {
          intro: 'Ini adalah Gerbang Akhir Skill Map Desain Grafis — proyek paling kompleks yang pernah kamu kerjakan di WADAH.',
          points: [
            'Kamu akan direview lewat quiz singkat yang merangkum seluruh Unit 3.',
            'Setelah lulus quiz, kamu masuk ke Proyek Akhir: mengerjakan 5 konten Instagram Feed untuk Toko Batik Nusantara dengan deadline 10 hari.',
            'Proyek ini dinilai 100% oleh human reviewer WADAH — kelulusan di sini menerbitkan Sertifikat Kompetensi Desain Grafis-mu, lengkap dengan nomor verifikasi resmi.',
          ],
        },
        aiIntro: 'Selamat sampai di gerbang terakhir, Rina! Ini bukan sekadar checkpoint biasa — approval di sini menerbitkan sertifikat kompetensi resmi WADAH-mu. Kerjakan sebaik yang kamu bisa.',
        suggests: [{ id: 'faq-cp-3', text: 'Apa yang terjadi setelah proyek akhir ini disetujui?', answer: 'Kamu akan mendapatkan Sertifikat Kompetensi Desain Grafis resmi dari WADAH — punya nomor verifikasi unik yang bisa dicek siapa saja, dan langsung masuk ke profil publikmu.' }],
        instruction: 'Kumpulkan 1 set (5 file) konten Instagram Feed untuk Toko Batik Nusantara sesuai brief di atas.',
        deadlineText: '10 hari',
        checklist: [
          'Kelima desain menerapkan satu sistem visual yang sama',
          'Motif batik otentik terjaga, dipadukan gaya modern',
          'Layout siap diadaptasi ke format Story (9:16)',
          'Rasional desain (alasan keputusan) disertakan',
        ],
      },
    ],
  },

  // ── E-COMMERCE — Toko Sepatu Bumi (light pass) ──────────────────────────────
  ecommerce: {
    mapTitle: 'Peta Misi: Seller Marketplace',
    unitNotes: [
      'Unit 1: Fondasi Listing & Kepatuhan Brief (Tingkat Pemula)',
      'Unit 2: Optimasi Multi-Listing & Iklan Dasar (Tingkat Menengah)',
      'Unit 3: Optimasi Toko & Sertifikasi (Tingkat Mahir)',
    ],
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
        checklist: [
          'Judul listing mengandung keyword utama',
          'Foto produk minimal 4 sudut berbeda',
          'Deskripsi mencantumkan size chart & bahan',
          'Kebijakan garansi/retur tercantum jelas',
        ],
      },

      // ── UNIT 2 — Toko Sepatu Bumi: optimasi multi-listing (Menengah) ───────
      {
        id: '2.1', title: 'Konsistensi Branding di Semua Listing', icon: 'fa-store', tag: 'TANTANGAN 2.1', type: 'quiz',
        info: 'Menjaga identitas visual konsisten di seluruh listing supaya toko mudah dikenali.',
        briefLabel: 'Client Mini-Brief:',
        briefBody: '"Sekarang kita punya belasan listing produk, tapi masing-masing kelihatan beda gaya — ada yang pakai watermark, ada yang enggak. Kayak bukan toko yang sama."',
        materi: {
          intro: 'Toko dengan banyak listing butuh identitas visual yang konsisten — supaya pembeli langsung kenali "ini toko yang sama" di manapun mereka lihat produknya.',
          points: [
            'Watermark/logo yang konsisten di semua foto produk membangun kepercayaan dan mencegah foto dicuri kompetitor.',
            'Template foto (angle, background, pencahayaan) yang seragam bikin katalog toko terlihat profesional saat dilihat berjajar.',
          ],
        },
        aiIntro: 'Toko dengan banyak listing butuh identitas visual yang konsisten, Rina — biar pembeli langsung kenali ini toko yang sama.',
        suggests: [{ id: 'faq-2.1-1', text: 'Kenapa watermark penting di semua foto produk?', answer: 'Watermark membangun kepercayaan (toko yang serius biasanya konsisten) dan mencegah foto produk dicuri kompetitor untuk dipakai di listing mereka sendiri.' }],
        questions: [
          {
            question: 'Listing-listing Toko Sepatu Bumi terlihat beda gaya satu sama lain. Solusi paling tepat?',
            options: [
              'Biarkan saja, tiap produk bebas gaya sendiri',
              'Terapkan watermark & template foto yang konsisten di semua listing',
              'Hapus listing lama, buat listing baru semua',
              'Ganti nama toko supaya lebih menarik',
            ],
            correctIndex: 1,
            explanation: 'Watermark dan template foto yang konsisten membangun identitas visual toko yang mudah dikenali di semua listing.',
          },
          {
            question: 'Apa manfaat template foto (angle, background) yang seragam di semua listing?',
            options: [
              'Supaya file foto lebih kecil ukurannya',
              'Katalog toko terlihat profesional dan konsisten saat dilihat berjajar',
              'Tidak ada manfaat khusus',
              'Supaya proses upload lebih cepat',
            ],
            correctIndex: 1,
            explanation: 'Template yang seragam membuat katalog terlihat rapi dan profesional, memperkuat kesan toko yang serius dan terpercaya.',
          },
        ],
      },
      {
        id: '2.2', title: 'A/B Testing Judul & Foto Listing', icon: 'fa-flask', tag: 'TANTANGAN 2.2', type: 'quiz',
        info: 'Menguji versi listing mana yang lebih efektif berdasarkan data, bukan tebakan.',
        briefLabel: 'Client Mini-Brief:',
        briefBody: '"Kita punya 2 versi judul buat produk sepatu terlaris. Gimana cara tau mana yang lebih efektif?"',
        materi: {
          intro: 'A/B testing adalah cara mengetahui versi mana yang lebih efektif berdasarkan data, bukan tebakan atau selera pribadi.',
          points: [
            'Uji 1 variabel dalam satu waktu (misal cuma judul, foto tetap sama) supaya hasilnya jelas variabel mana yang berpengaruh.',
            'Beri waktu cukup (misal 1 minggu) sebelum menyimpulkan mana yang menang — data terlalu sedikit bisa menyesatkan.',
          ],
        },
        aiIntro: 'A/B testing itu cara mengetahui versi mana yang lebih efektif berdasarkan data, Rina — bukan tebakan atau selera pribadi.',
        suggests: [{ id: 'faq-2.2-1', text: 'Kenapa cuma boleh uji 1 variabel dalam satu waktu?', answer: 'Kalau judul DAN foto diganti bersamaan, kita tidak akan tahu mana yang sebenarnya menyebabkan perubahan performa — uji satu per satu supaya hasilnya jelas.' }],
        questions: [
          {
            question: 'Ingin tahu judul listing mana yang lebih efektif antara 2 versi. Cara paling tepat?',
            options: [
              'Tanya pendapat teman saja',
              'A/B testing: uji satu variabel (judul) dalam waktu tertentu, foto tetap sama',
              'Ganti kedua judul dan foto sekaligus',
              'Pilih judul yang paling disukai secara pribadi',
            ],
            correctIndex: 1,
            explanation: 'A/B testing yang valid menguji satu variabel dalam satu waktu supaya hasilnya bisa disimpulkan dengan jelas variabel mana yang berpengaruh.',
          },
          {
            question: 'Kenapa perlu menunggu waktu cukup (mis. 1 minggu) sebelum menyimpulkan hasil A/B testing?',
            options: [
              'Supaya terlihat lebih profesional',
              'Data yang terlalu sedikit bisa menyesatkan kesimpulan',
              'Tidak ada alasan khusus, bisa disimpulkan kapan saja',
              'Karena platform mewajibkan durasi tertentu',
            ],
            correctIndex: 1,
            explanation: 'Sampel data yang terlalu sedikit (misal baru 1 hari) belum cukup representatif dan bisa menghasilkan kesimpulan yang keliru.',
          },
        ],
      },
      {
        id: '2.3', title: 'Setup Iklan Dasar Marketplace', icon: 'fa-rectangle-ad', tag: 'TANTANGAN 2.3', type: 'quiz',
        info: 'Memfokuskan budget iklan terbatas ke produk yang paling berpotensi konversi.',
        briefLabel: 'Client Mini-Brief:',
        briefBody: '"Kita mau coba pasang iklan di dalam marketplace biar listing lebih sering muncul. Tapi budgetnya kecil, gimana strateginya?"',
        materi: {
          intro: 'Iklan marketplace dengan budget kecil harus fokus ke produk yang sudah terbukti laku — bukan menyebar tipis ke semua produk sekaligus.',
          points: [
            'Iklankan produk best-seller yang sudah punya review bagus — produk yang belum terbukti berisiko boros budget tanpa hasil.',
            'Budget kecil lebih efektif difokuskan ke sedikit produk daripada disebar tipis ke banyak produk sekaligus.',
          ],
        },
        aiIntro: 'Iklan marketplace dengan budget kecil harus fokus, Rina — bukan menyebar tipis ke semua produk.',
        suggests: [{ id: 'faq-2.3-1', text: 'Kenapa harus iklankan produk yang sudah laku, bukan produk baru?', answer: 'Produk yang sudah punya review bagus lebih mudah dikonversi jadi penjualan dari trafik iklan — produk baru tanpa review berisiko boros budget karena calon pembeli masih ragu.' }],
        questions: [
          {
            question: 'Budget iklan marketplace terbatas. Strategi paling efektif?',
            options: [
              'Sebar budget tipis ke semua produk sekaligus',
              'Fokuskan budget ke produk best-seller yang sudah punya review bagus',
              'Iklankan produk yang belum pernah terjual sama sekali',
              'Hentikan rencana iklan karena budget kecil',
            ],
            correctIndex: 1,
            explanation: 'Budget kecil lebih efektif difokuskan ke produk yang sudah terbukti laku, karena konversinya lebih tinggi dibanding produk yang belum punya bukti sosial.',
          },
          {
            question: 'Kenapa produk tanpa review berisiko boros budget iklan?',
            options: [
              'Karena produk tanpa review otomatis lebih mahal diiklankan',
              'Calon pembeli masih ragu tanpa bukti sosial, sehingga konversi dari klik ke pembelian lebih rendah',
              'Marketplace melarang iklan produk baru',
              'Tidak ada risiko khusus',
            ],
            correctIndex: 1,
            explanation: 'Tanpa review sebagai bukti sosial, calon pembeli cenderung ragu checkout meski sudah klik iklan — konversi rendah berarti budget iklan kurang efisien.',
          },
        ],
      },
      {
        id: '2.4', title: 'Menerjemahkan Komplain Pembeli', icon: 'fa-comment-dots', tag: 'TANTANGAN 2.4', type: 'quiz',
        info: 'Mengubah komplain pembeli jadi perbaikan konkret pada listing.',
        briefLabel: 'Brief via WhatsApp:',
        briefBody: '"Ada beberapa komplain masuk soal pengiriman lama dan produk beda dari foto. Ini gimana ya baiknya?" — Owner Toko Sepatu Bumi',
        materi: {
          intro: 'Komplain pembeli adalah sinyal ada yang perlu diperbaiki di listing/operasional — bukan sekadar dijawab basa-basi.',
          points: [
            '"Pengiriman lama" bisa berarti perlu update estimasi pengiriman di listing supaya ekspektasi pembeli sesuai kenyataan.',
            '"Produk beda dari foto" berarti foto/deskripsi perlu direvisi supaya representasi produk lebih akurat — bukan cuma masalah komunikasi customer service.',
          ],
        },
        aiIntro: 'Komplain pembeli itu sinyal ada yang perlu diperbaiki di listing, Rina — bukan cuma soal jawaban customer service.',
        suggests: [{ id: 'faq-2.4-1', text: 'Komplain "produk beda dari foto" itu salah siapa?', answer: 'Ini sinyal foto/deskripsi listing perlu direvisi supaya representasinya lebih akurat — memperbaiki listing lebih penting daripada sekadar minta maaf ke pembeli yang komplain.' }],
        questions: [
          {
            question: 'Ada komplain "pengiriman lama". Tindakan paling tepat selain menjawab pembeli?',
            options: [
              'Mengabaikan karena bukan salah toko',
              'Update estimasi pengiriman di listing supaya ekspektasi pembeli sesuai kenyataan',
              'Menghapus fitur komentar pembeli',
              'Menaikkan harga produk',
            ],
            correctIndex: 1,
            explanation: 'Memperbaiki informasi estimasi pengiriman di listing mencegah komplain serupa terulang di masa depan, bukan cuma menjawab satu komplain saja.',
          },
          {
            question: 'Komplain "produk beda dari foto" paling tepat diterjemahkan jadi tindakan apa?',
            options: [
              'Menghapus komplain tersebut',
              'Merevisi foto/deskripsi listing supaya lebih akurat merepresentasikan produk',
              'Memberi diskon ke semua pembeli',
              'Mengganti nama produk',
            ],
            correctIndex: 1,
            explanation: 'Akar masalahnya ada di representasi produk di listing — merevisi foto/deskripsi mencegah kekecewaan pembeli berikutnya.',
          },
        ],
      },
      {
        id: 'checkpoint-2', title: 'Kastil Checkpoint 2', icon: 'fa-fort-awesome', tag: 'UJIAN REVISI', type: 'checkpoint',
        info: 'Ujian mandiri: optimasi 3 listing Toko Sepatu Bumi yang konsisten sebagai satu identitas toko!',
        briefLabel: 'Brief Mandatori Proyek Komersial:',
        briefBullets: [
          { strong: 'Wajib 3 Listing Konsisten:', rest: ' watermark, template foto, dan gaya deskripsi yang sama di ketiganya.' },
          { strong: 'Rencana A/B Testing:', rest: ' sertakan 2 versi judul untuk salah satu listing beserta rencana pengujiannya.' },
          { strong: 'Revisi Berdasarkan Komplain:', rest: ' perbaiki minimal 1 elemen listing berdasarkan pola komplain yang umum terjadi.' },
        ],
        materi: {
          intro: 'Ini adalah ujian Checkpoint Unit 2 — gabungan dari semua yang sudah kamu pelajari soal optimasi multi-listing.',
          points: [
            'Kamu akan direview lewat quiz singkat yang merangkum 4 topik Unit 2.',
            'Setelah lulus quiz, kamu masuk ke Tantangan Nyata: mengoptimasi 1 set (3 listing) untuk Toko Sepatu Bumi dengan deadline 7 hari.',
            'Tantangan dinilai 100% oleh human reviewer, bukan skor otomatis.',
          ],
        },
        aiIntro: 'Checkpoint kedua, Rina! Kali ini kamu diuji mengoptimasi SISTEM listing yang konsisten, bukan cuma 1 listing bagus.',
        suggests: [{ id: 'faq-cp-2', text: 'Apa yang paling dinilai reviewer di checkpoint ini?', answer: 'Konsistensi branding antar listing dan apakah revisi yang dilakukan benar-benar menjawab pola komplain yang umum terjadi.' }],
        instruction: 'Kumpulkan 1 set (3 listing) yang dioptimasi untuk Toko Sepatu Bumi sesuai brief di atas.',
        deadlineText: '7 hari',
        checklist: [
          'Watermark & template foto konsisten di ketiga listing',
          'Rencana A/B testing judul disertakan',
          'Revisi berdasarkan pola komplain diterapkan',
          'Deskripsi & size chart tetap lengkap sesuai fondasi Unit 1',
        ],
      },

      // ── UNIT 3 — Toko Elektronik Rumahan Jaya: proyek akhir (Mahir) ────────
      {
        id: '3.1', title: 'Audit Toko Keseluruhan', icon: 'fa-clipboard-check', tag: 'TANTANGAN 3.1', type: 'quiz',
        info: 'Memetakan kondisi toko secara menyeluruh sebelum menentukan prioritas perbaikan.',
        briefLabel: 'Client Mini-Brief:',
        briefBody: '"Toko Elektronik Rumahan Jaya udah jualan 2 tahun tapi belum pernah dicek menyeluruh. Bisa bantu audit toko kita dari awal?"',
        materi: {
          intro: 'Proyek skala toko (bukan cuma 1 listing) butuh audit menyeluruh dulu — memetakan mana yang sudah baik, mana yang perlu diperbaiki.',
          points: [
            'Audit toko mencakup: performa tiap listing, konsistensi branding, respons CS, dan kebijakan toko (retur/garansi).',
            'Prioritaskan perbaikan pada listing dengan trafik tinggi tapi konversi rendah — potensi dampaknya paling besar.',
          ],
        },
        aiIntro: 'Ini proyek akhir Unit 3, Rina — audit toko secara menyeluruh, bukan cuma 1 listing.',
        suggests: [{ id: 'faq-3.1-1', text: 'Kenapa harus prioritaskan listing trafik tinggi tapi konversi rendah?', answer: 'Listing seperti itu sudah menarik banyak pengunjung tapi gagal mengonversi jadi pembeli — memperbaikinya punya potensi dampak penjualan paling besar dibanding listing yang trafiknya memang rendah.' }],
        questions: [
          {
            question: 'Toko Elektronik Rumahan Jaya minta audit menyeluruh. Apa saja yang perlu dicek?',
            options: [
              'Hanya warna logo toko',
              'Performa listing, konsistensi branding, respons CS, dan kebijakan toko',
              'Hanya jumlah followers toko',
              'Hanya harga produk termurah',
            ],
            correctIndex: 1,
            explanation: 'Audit toko menyeluruh mencakup semua aspek yang mempengaruhi kepercayaan dan konversi pembeli, bukan cuma satu elemen saja.',
          },
          {
            question: 'Listing mana yang paling prioritas diperbaiki dalam audit toko?',
            options: [
              'Listing dengan trafik rendah dan konversi rendah',
              'Listing dengan trafik tinggi tapi konversi rendah',
              'Listing yang sudah paling laku',
              'Semua listing harus diperbaiki bersamaan tanpa prioritas',
            ],
            correctIndex: 1,
            explanation: 'Listing dengan trafik tinggi tapi konversi rendah punya potensi dampak perbaikan paling besar karena pengunjungnya sudah banyak, tinggal dioptimasi konversinya.',
          },
        ],
      },
      {
        id: '3.2', title: 'Kalender Promo & Flash Sale', icon: 'fa-calendar-days', tag: 'TANTANGAN 3.2', type: 'quiz',
        info: 'Merancang promo terencana yang menjaga persepsi nilai produk, bukan diskon asal-asalan.',
        briefLabel: 'Client Mini-Brief:',
        briefBody: '"Kita mau mulai rutin bikin promo, tapi bingung kapan waktu yang pas dan gimana biar nggak kelihatan diskon terus-terusan."',
        materi: {
          intro: 'Promo yang terlalu sering bisa menurunkan persepsi nilai produk — perlu kalender yang terencana, bukan diskon asal-asalan.',
          points: [
            'Promo besar sebaiknya berkaitan dengan momen tertentu (gajian, hari besar) supaya terasa spesial, bukan rutin generik.',
            'Terlalu sering diskon membuat pembeli menunggu diskon berikutnya alih-alih beli harga normal — rusak persepsi nilai produk.',
          ],
        },
        aiIntro: 'Promo yang terlalu sering justru bisa merusak persepsi nilai produk, Rina — perlu kalender yang terencana.',
        suggests: [{ id: 'faq-3.2-1', text: 'Kenapa nggak boleh diskon terus-terusan?', answer: 'Kalau selalu diskon, pembeli akan menunggu promo berikutnya daripada beli di harga normal — ini merusak nilai produk dan margin keuntungan toko dalam jangka panjang.' }],
        questions: [
          {
            question: 'Toko mau rutin bikin promo tapi khawatir kelihatan "diskon terus". Solusi yang tepat?',
            options: [
              'Diskon setiap hari supaya selalu menarik',
              'Kalender promo terencana yang dikaitkan dengan momen tertentu (gajian, hari besar)',
              'Tidak perlu promo sama sekali',
              'Diskon besar-besaran tanpa jadwal tertentu',
            ],
            correctIndex: 1,
            explanation: 'Kalender promo yang dikaitkan momen tertentu membuat promo terasa spesial dan ditunggu, bukan rutin generik yang menurunkan persepsi nilai.',
          },
          {
            question: 'Apa risiko jangka panjang dari diskon yang terlalu sering?',
            options: [
              'Toko jadi lebih terkenal',
              'Pembeli terbiasa menunggu diskon, enggan beli di harga normal',
              'Tidak ada risiko sama sekali',
              'Produk jadi lebih awet',
            ],
            correctIndex: 1,
            explanation: 'Diskon yang terlalu sering mengkondisikan pembeli untuk selalu menunggu promo berikutnya, merusak penjualan di harga normal dan margin toko.',
          },
        ],
      },
      {
        id: '3.3', title: 'Manajemen Stok & Respons Cepat CS', icon: 'fa-boxes-stacked', tag: 'TANTANGAN 3.3', type: 'quiz',
        info: 'Membangun sistem stok dan CS yang mengimbangi lonjakan permintaan.',
        briefLabel: 'Client Mini-Brief:',
        briefBody: '"Kita sering kejadian stok habis pas lagi rame pembeli, terus CS juga suka telat bales pas jam sibuk."',
        materi: {
          intro: 'Toko yang berkembang butuh sistem manajemen stok dan CS yang bisa mengimbangi lonjakan permintaan, bukan cuma andalkan kerja manual.',
          points: [
            'Stok yang menipis perlu sistem peringatan dini (mis. reorder point) supaya tidak kehabisan saat demand tinggi.',
            'Jam sibuk butuh alokasi CS ekstra atau template balasan cepat untuk pertanyaan umum — supaya respons tetap gesit.',
          ],
        },
        aiIntro: 'Toko yang berkembang butuh sistem manajemen stok dan CS yang kuat, Rina — bukan cuma andalkan kerja manual.',
        suggests: [{ id: 'faq-3.3-1', text: 'Apa itu "reorder point" dalam manajemen stok?', answer: 'Reorder point adalah batas jumlah stok minimum yang jadi sinyal untuk segera restock — supaya toko tidak kehabisan barang di tengah lonjakan permintaan.' }],
        questions: [
          {
            question: 'Toko sering kehabisan stok saat lagi ramai pembeli. Solusi sistemnya?',
            options: [
              'Menunggu stok benar-benar habis baru restock',
              'Menetapkan reorder point (batas stok minimum) sebagai sinyal restock dini',
              'Membatasi jumlah pembeli yang boleh checkout',
              'Menghapus produk yang sering habis dari listing',
            ],
            correctIndex: 1,
            explanation: 'Reorder point memberi peringatan dini sebelum stok benar-benar habis, memberi waktu cukup untuk restock sebelum kehabisan total.',
          },
          {
            question: 'CS sering telat balas saat jam sibuk. Solusi yang paling praktis?',
            options: [
              'Menonaktifkan fitur chat saat jam sibuk',
              'Siapkan template balasan cepat untuk pertanyaan umum + alokasi CS ekstra saat jam ramai',
              'Membiarkan saja, pembeli akan menunggu',
              'Menaikkan harga supaya pembeli berkurang',
            ],
            correctIndex: 1,
            explanation: 'Template balasan cepat untuk pertanyaan umum dan alokasi CS ekstra saat jam sibuk menjaga kecepatan respons tanpa mengorbankan kualitas layanan.',
          },
        ],
      },
      {
        id: '3.4', title: 'Laporan Penjualan & Rekomendasi', icon: 'fa-chart-line', tag: 'TANTANGAN 3.4', type: 'quiz',
        info: 'Menyusun laporan yang membuktikan dampak perbaikan dan memberi arah lanjutan.',
        briefLabel: 'Brief via WhatsApp:',
        briefBody: '"Setelah semua diperbaiki, owner mau lihat laporan hasilnya dan rencana ke depan gimana." — Owner Toko Elektronik Rumahan Jaya',
        materi: {
          intro: 'Proyek audit toko tidak berhenti di perbaikan — laporan penjualan yang menghubungkan hasil ke masalah awal membuktikan perbaikan bekerja.',
          points: [
            'Laporan yang baik membandingkan kondisi SEBELUM dan SESUDAH perbaikan (mis. tingkat konversi, jumlah komplain).',
            'Rekomendasi lanjutan berdasarkan data yang paling berdampak (mis. "listing X naik konversi 2x, terapkan pola sama ke listing lain").',
          ],
        },
        aiIntro: 'Proyek audit toko tidak berhenti di perbaikan, Rina — laporan hasil membuktikan kerja kita benar-benar berdampak.',
        suggests: [{ id: 'faq-3.4-1', text: 'Apa yang bikin laporan "sebelum-sesudah" lebih meyakinkan?', answer: 'Perbandingan sebelum-sesudah menunjukkan dampak nyata dari perbaikan yang dilakukan — jauh lebih meyakinkan dibanding hanya menunjukkan angka akhir tanpa konteks awal.' }],
        questions: [
          {
            question: 'Owner minta laporan hasil audit + rencana ke depan. Elemen paling penting dalam laporan?',
            options: [
              'Daftar semua produk yang dijual',
              'Perbandingan kondisi sebelum-sesudah perbaikan + rekomendasi berbasis data',
              'Jumlah karyawan toko',
              'Riwayat lengkap seluruh chat CS',
            ],
            correctIndex: 1,
            explanation: 'Perbandingan sebelum-sesudah membuktikan dampak nyata perbaikan, dan rekomendasi berbasis data memberi arah jelas untuk langkah berikutnya.',
          },
          {
            question: 'Rekomendasi "terapkan pola sama ke listing lain" seharusnya berdasarkan apa?',
            options: [
              'Perasaan pribadi tentang produk favorit',
              'Data listing yang terbukti mengalami peningkatan konversi setelah perbaikan',
              'Permintaan acak dari pembeli',
              'Jumlah warna yang tersedia',
            ],
            correctIndex: 1,
            explanation: 'Rekomendasi yang kredibel didasarkan pada pola yang sudah terbukti berhasil dari data nyata, bukan asumsi atau kesukaan pribadi.',
          },
        ],
      },
      {
        id: 'checkpoint-3', title: 'Gerbang Akhir: Proyek Sertifikasi', icon: 'fa-graduation-cap', tag: 'PROYEK AKHIR', type: 'checkpoint',
        isFinalProject: true,
        info: 'Proyek akhir Skill Map E-Commerce — kelulusan di sini menerbitkan Sertifikat Kompetensi WADAH-mu!',
        briefLabel: 'Brief Mandatori Proyek Akhir:',
        briefBullets: [
          { strong: 'Wajib Audit Menyeluruh:', rest: ' laporan kondisi toko mencakup listing, branding, CS, dan kebijakan.' },
          { strong: 'Kalender Promo Terencana:', rest: ' rencana promo/flash sale yang dikaitkan momen tertentu, bukan diskon acak.' },
          { strong: 'Sistem Stok & CS:', rest: ' rencana reorder point dan alokasi CS untuk jam sibuk.' },
          { strong: 'Laporan & Rekomendasi:', rest: ' perbandingan sebelum-sesudah + rekomendasi lanjutan.' },
        ],
        materi: {
          intro: 'Ini adalah Gerbang Akhir Skill Map E-Commerce — proyek paling kompleks yang pernah kamu kerjakan di WADAH.',
          points: [
            'Kamu akan direview lewat quiz singkat yang merangkum seluruh Unit 3.',
            'Setelah lulus quiz, kamu masuk ke Proyek Akhir: menyusun audit & rencana optimasi toko untuk Toko Elektronik Rumahan Jaya dengan deadline 10 hari.',
            'Proyek ini dinilai 100% oleh human reviewer WADAH — kelulusan di sini menerbitkan Sertifikat Kompetensi E-Commerce-mu, lengkap dengan nomor verifikasi resmi.',
          ],
        },
        aiIntro: 'Selamat sampai di gerbang terakhir, Rina! Ini bukan sekadar checkpoint biasa — approval di sini menerbitkan sertifikat kompetensi resmi WADAH-mu. Kerjakan sebaik yang kamu bisa.',
        suggests: [{ id: 'faq-cp-3', text: 'Apa yang terjadi setelah proyek akhir ini disetujui?', answer: 'Kamu akan mendapatkan Sertifikat Kompetensi E-Commerce resmi dari WADAH — punya nomor verifikasi unik yang bisa dicek siapa saja, dan langsung masuk ke profil publikmu.' }],
        instruction: 'Kumpulkan 1 dokumen audit & rencana optimasi toko untuk Toko Elektronik Rumahan Jaya sesuai brief di atas.',
        deadlineText: '10 hari',
        checklist: [
          'Audit toko mencakup listing, branding, CS, dan kebijakan',
          'Kalender promo/flash sale terencana disertakan',
          'Rencana manajemen stok & CS jam sibuk disertakan',
          'Laporan sebelum-sesudah & rekomendasi disertakan',
        ],
      },
    ],
  },

  // ── DIGITAL MARKETING — Klinik Kecantikan Glow (light pass) ─────────────────
  marketing: {
    mapTitle: 'Peta Misi: Ads Specialist',
    unitNotes: [
      'Unit 1: Fondasi Campaign & Kepatuhan Brief (Tingkat Pemula)',
      'Unit 2: Optimasi Campaign & Budget (Tingkat Menengah)',
      'Unit 3: Kampanye Multi-Channel & Sertifikasi (Tingkat Mahir)',
    ],
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
        checklist: [
          'Objective campaign sesuai tujuan bisnis (booking)',
          'Targeting audiens spesifik (demografi + lokasi + minat)',
          'Ad copy punya CTA dan urgency yang jelas',
          'Visual before/after sesuai etika iklan kecantikan',
        ],
      },

      // ── UNIT 2 — Klinik Kecantikan Glow: optimasi campaign (Menengah) ──────
      {
        id: '2.1', title: 'A/B Testing Ad Creative', icon: 'fa-flask', tag: 'TANTANGAN 2.1', type: 'quiz',
        info: 'Menemukan visual/copy iklan yang benar-benar efektif berdasarkan data.',
        briefLabel: 'Client Mini-Brief:',
        briefBody: '"Kita punya 2 versi visual iklan buat treatment yang sama. Gimana cara tau mana yang lebih menarik orang buat booking?"',
        materi: {
          intro: 'A/B testing creative membantu menemukan visual/copy yang benar-benar berhasil, bukan sekadar tebakan desain mana yang "lebih cantik".',
          points: [
            'Uji satu elemen dalam satu waktu (misal cuma gambar utama, headline tetap sama) supaya jelas elemen mana yang berpengaruh.',
            'Metrik yang dibandingkan harus sesuai tujuan bisnis (booking), bukan sekadar like/reach.',
          ],
        },
        aiIntro: 'A/B testing creative membantu menemukan visual yang benar-benar berhasil, Rina — bukan sekadar tebakan desain mana yang lebih cantik.',
        suggests: [{ id: 'faq-2.1-1', text: 'Metrik apa yang harus dibandingkan saat A/B test iklan booking?', answer: 'Jumlah booking/leads yang dihasilkan, bukan like atau reach — karena tujuan bisnisnya adalah booking, metrik yang dibandingkan harus selaras dengan tujuan itu.' }],
        questions: [
          {
            question: 'Ingin tahu visual iklan mana yang lebih efektif dari 2 versi. Cara paling tepat?',
            options: [
              'Pilih berdasarkan selera desainer',
              'A/B testing: uji satu elemen (gambar), headline tetap sama, bandingkan hasil booking',
              'Pakai kedua visual secara bergantian tanpa data',
              'Tanya pendapat tim internal saja',
            ],
            correctIndex: 1,
            explanation: 'A/B testing yang valid menguji satu elemen dalam satu waktu dan membandingkan metrik yang sesuai tujuan bisnis (booking).',
          },
          {
            question: 'Metrik apa yang paling relevan dibandingkan saat A/B testing iklan dengan tujuan booking?',
            options: [
              'Jumlah like saja',
              'Jumlah share saja',
              'Jumlah booking/leads yang dihasilkan',
              'Warna yang paling disukai tim',
            ],
            correctIndex: 2,
            explanation: 'Metrik yang dibandingkan harus selaras dengan tujuan bisnis campaign — kalau tujuannya booking, itu yang harus diukur, bukan metrik vanity seperti like.',
          },
        ],
      },
      {
        id: '2.2', title: 'Optimasi Budget & Bidding', icon: 'fa-coins', tag: 'TANTANGAN 2.2', type: 'quiz',
        info: 'Membaca masa belajar campaign & mengontrol biaya per hasil.',
        briefLabel: 'Client Mini-Brief:',
        briefBody: '"Budget iklan kita jalan tapi hasilnya nggak stabil, kadang murah kadang mahal per booking. Gimana caranya lebih terkontrol?"',
        materi: {
          intro: 'Biaya per hasil (cost per booking) yang tidak stabil biasanya berarti campaign perlu waktu belajar (learning phase) atau targeting terlalu luas.',
          points: [
            'Campaign baru butuh "masa belajar" beberapa hari sebelum algoritma menemukan audiens optimal — jangan buru-buru ubah setting di masa ini.',
            'Monitor cost per hasil secara berkala, dan matikan ad set yang biayanya jauh di atas rata-rata setelah data cukup.',
          ],
        },
        aiIntro: 'Biaya per booking yang naik-turun biasanya berarti campaign masih dalam masa belajar algoritma, Rina — atau targeting-nya terlalu luas.',
        suggests: [{ id: 'faq-2.2-1', text: 'Kenapa nggak boleh buru-buru ubah setting di awal campaign?', answer: 'Campaign baru butuh masa belajar (learning phase) supaya algoritma menemukan audiens optimal — mengubah setting terlalu cepat me-reset proses belajar itu dan bikin performa makin tidak stabil.' }],
        questions: [
          {
            question: 'Biaya per booking naik-turun tidak stabil. Langkah paling tepat di awal?',
            options: [
              'Langsung ubah semua setting campaign',
              'Biarkan campaign melewati masa belajar beberapa hari sebelum evaluasi',
              'Hentikan campaign secepatnya',
              'Naikkan budget 10x lipat',
            ],
            correctIndex: 1,
            explanation: 'Campaign baru butuh masa belajar sebelum algoritma stabil menemukan audiens optimal — evaluasi terlalu dini bisa menyesatkan.',
          },
          {
            question: 'Setelah data cukup, ad set mana yang sebaiknya dimatikan?',
            options: [
              'Ad set dengan biaya per hasil jauh di atas rata-rata',
              'Ad set yang paling baru dibuat',
              'Semua ad set harus dimatikan dan diganti',
              'Ad set dengan jumlah like tertinggi',
            ],
            correctIndex: 0,
            explanation: 'Ad set dengan cost per hasil jauh di atas rata-rata adalah yang paling tidak efisien dan layak dihentikan untuk mengalihkan budget ke yang lebih efektif.',
          },
        ],
      },
      {
        id: '2.3', title: 'Retargeting Audiens', icon: 'fa-bullseye', tag: 'TANTANGAN 2.3', type: 'quiz',
        info: 'Menjangkau ulang audiens hangat yang sudah berinteraksi tapi belum konversi.',
        briefLabel: 'Client Mini-Brief:',
        briefBody: '"Banyak orang klik iklan kita tapi nggak langsung booking. Sayang banget kalau dibiarin gitu aja."',
        materi: {
          intro: 'Orang yang sudah berinteraksi (klik/kunjungi halaman) tapi belum konversi adalah audiens "hangat" — mereka lebih mudah dikonversi lewat retargeting dibanding audiens baru.',
          points: [
            'Retargeting menargetkan orang yang sudah menunjukkan minat (klik iklan, kunjungi website) — jauh lebih murah dan efektif dibanding menjangkau audiens dingin.',
            'Pesan retargeting bisa berbeda dari iklan awal (mis. tambahkan urgency atau testimoni) untuk mendorong keputusan akhir.',
          ],
        },
        aiIntro: 'Orang yang sudah klik iklan tapi belum booking itu audiens "hangat", Rina — sayang kalau dilepas begitu saja.',
        suggests: [{ id: 'faq-2.3-1', text: 'Kenapa retargeting lebih murah dibanding iklan ke audiens baru?', answer: 'Audiens retargeting sudah menunjukkan minat sebelumnya (klik/kunjungi), jadi mereka lebih mudah dan lebih murah dikonversi dibanding audiens dingin yang belum pernah dengar brand sama sekali.' }],
        questions: [
          {
            question: 'Banyak orang klik iklan tapi tidak booking. Strategi lanjutan yang tepat?',
            options: [
              'Abaikan, fokus cari audiens baru saja',
              'Retargeting ke orang yang sudah klik/kunjungi halaman sebelumnya',
              'Hentikan campaign karena dianggap gagal',
              'Naikkan harga treatment supaya lebih eksklusif',
            ],
            correctIndex: 1,
            explanation: 'Retargeting audiens yang sudah menunjukkan minat adalah cara paling efisien untuk mengonversi mereka yang "hampir" booking.',
          },
          {
            question: 'Kenapa pesan iklan retargeting boleh berbeda dari iklan awal?',
            options: [
              'Supaya terlihat lebih variatif saja',
              'Untuk mendorong keputusan akhir dengan urgency/testimoni tambahan bagi audiens yang sudah tertarik',
              'Tidak boleh berbeda sama sekali',
              'Karena aturan platform mewajibkan variasi',
            ],
            correctIndex: 1,
            explanation: 'Audiens retargeting sudah kenal brand-nya — pesan bisa lebih persuasif ke arah keputusan akhir (urgency, testimoni) dibanding perkenalan awal.',
          },
        ],
      },
      {
        id: '2.4', title: 'Menerjemahkan Feedback Revisi', icon: 'fa-comment-dots', tag: 'TANTANGAN 2.4', type: 'quiz',
        info: 'Menghubungkan feedback klien ke metrik dan sistem campaign yang relevan.',
        briefLabel: 'Brief via WhatsApp:',
        briefBody: '"Iklannya udah oke tapi CTR-nya kayaknya kurang \'nendang\'. Terus creative-nya kurang related sama gaya klinik kita." — Owner Klinik Kecantikan Glow, revisi ronde 1',
        materi: {
          intro: 'Feedback campaign iklan juga sering berupa perasaan — sekarang kita hubungkan ke metrik dan sistem yang sudah dipelajari.',
          points: [
            '"CTR kurang nendang" berarti headline/visual utama belum cukup menarik perhatian saat scroll — perlu diperkuat hook visual/copy.',
            '"Kurang related sama gaya klinik" berarti creative menyimpang dari branding yang sudah disepakati — cek kembali ke guideline visual klinik.',
          ],
        },
        aiIntro: 'Feedback campaign juga sering berupa perasaan, Rina — sekarang kita hubungkan ke metrik dan sistem yang relevan.',
        suggests: [{ id: 'faq-2.4-1', text: 'CTR itu apa dan kenapa penting?', answer: 'CTR (Click-Through Rate) adalah persentase orang yang klik iklan dari total yang melihatnya — CTR rendah biasanya tanda hook visual/headline belum cukup menarik perhatian.' }],
        questions: [
          {
            question: 'Feedback "CTR kurang nendang" pada iklan paling sering berakar dari apa?',
            options: [
              'Warna latar belakang website',
              'Headline/visual utama yang belum cukup menarik perhatian saat scroll',
              'Jumlah kata dalam disclaimer',
              'Waktu campaign berjalan',
            ],
            correctIndex: 1,
            explanation: 'CTR rendah biasanya tanda hook visual atau headline belum cukup kuat menahan perhatian saat orang scroll melewati iklan.',
          },
          {
            question: '"Kurang related sama gaya klinik" mengacu ke elemen apa yang perlu dicek ulang?',
            options: [
              'Jumlah budget campaign',
              'Branding/guideline visual yang sudah disepakati sebelumnya',
              'Platform iklan yang digunakan',
              'Jam tayang iklan',
            ],
            correctIndex: 1,
            explanation: 'Kalau creative terasa "bukan gaya klinik", itu tanda sudah menyimpang dari guideline visual/branding yang sudah ditetapkan — perlu dicek ulang ke acuan brand.',
          },
        ],
      },
      {
        id: 'checkpoint-2', title: 'Kastil Checkpoint 2', icon: 'fa-fort-awesome', tag: 'UJIAN REVISI', type: 'checkpoint',
        info: 'Ujian mandiri: optimasi campaign Klinik Kecantikan Glow yang teruji dan terarah!',
        briefLabel: 'Brief Mandatori Proyek Komersial:',
        briefBullets: [
          { strong: 'Wajib Rencana A/B Test:', rest: ' 2 versi creative untuk 1 treatment beserta metrik yang akan dibandingkan.' },
          { strong: 'Rencana Retargeting:', rest: ' strategi menjangkau audiens yang sudah klik tapi belum booking.' },
          { strong: 'Monitoring Budget:', rest: ' rencana evaluasi cost per booking setelah masa belajar campaign.' },
        ],
        materi: {
          intro: 'Ini adalah ujian Checkpoint Unit 2 — gabungan dari semua yang sudah kamu pelajari soal optimasi campaign.',
          points: [
            'Kamu akan direview lewat quiz singkat yang merangkum 4 topik Unit 2.',
            'Setelah lulus quiz, kamu masuk ke Tantangan Nyata: menyusun rencana optimasi untuk Klinik Kecantikan Glow dengan deadline 7 hari.',
            'Tantangan dinilai 100% oleh human reviewer, bukan skor otomatis.',
          ],
        },
        aiIntro: 'Checkpoint kedua, Rina! Kali ini kamu diuji menyusun SISTEM optimasi campaign, bukan cuma 1 iklan bagus.',
        suggests: [{ id: 'faq-cp-2', text: 'Apa yang paling dinilai reviewer di checkpoint ini?', answer: 'Apakah rencana A/B testing dan retargeting benar-benar terukur dan berdasarkan metrik yang selaras dengan tujuan bisnis (booking), bukan asumsi semata.' }],
        instruction: 'Kumpulkan 1 dokumen optimasi campaign (A/B test + retargeting + monitoring budget) untuk Klinik Kecantikan Glow sesuai brief di atas.',
        deadlineText: '7 hari',
        checklist: [
          'Rencana A/B testing creative dengan metrik yang jelas',
          'Strategi retargeting audiens yang sudah berinteraksi',
          'Rencana monitoring & evaluasi budget disertakan',
          'Creative tetap sesuai branding & etika iklan kecantikan',
        ],
      },

      // ── UNIT 3 — Resto Steak Rumahan: proyek akhir (Mahir) ─────────────────
      {
        id: '3.1', title: 'Riset Kompetitor & Positioning Campaign', icon: 'fa-magnifying-glass', tag: 'TANTANGAN 3.1', type: 'quiz',
        info: 'Menentukan diferensiasi campaign lewat riset kompetitor sebelum eksekusi.',
        briefLabel: 'Client Mini-Brief:',
        briefBody: '"Resto Steak Rumahan mau buka cabang baru dan butuh campaign iklan yang bikin kita beda dari resto steak lain di area situ."',
        materi: {
          intro: 'Sebelum setup campaign, riset kompetitor membantu menemukan celah diferensiasi — supaya iklan tidak terasa generik seperti resto steak lainnya.',
          points: [
            'Riset iklan kompetitor sejenis membantu menemukan pola yang sudah "biasa" dan mencari sudut pandang yang belum banyak dipakai.',
            'Positioning yang jelas (mis. "steak rumahan harga terjangkau" vs "steak premium") menentukan seluruh arah campaign — dari visual sampai copy.',
          ],
        },
        aiIntro: 'Ini proyek akhir Unit 3, Rina — sebelum setup campaign, kita riset kompetitor dulu supaya iklan Resto Steak Rumahan tidak terasa generik.',
        suggests: [{ id: 'faq-3.1-1', text: 'Kenapa riset kompetitor penting sebelum bikin iklan?', answer: 'Riset membantu menemukan pola yang sudah "biasa" dipakai kompetitor, supaya campaign kita bisa mengambil sudut pandang berbeda dan lebih menonjol di antara iklan sejenis.' }],
        questions: [
          {
            question: 'Resto Steak Rumahan mau buka cabang baru dan butuh diferensiasi dari kompetitor. Langkah pertama?',
            options: [
              'Langsung setup campaign tanpa riset',
              'Riset iklan kompetitor sejenis + tentukan positioning yang jelas',
              'Menyalin persis strategi kompetitor terbesar',
              'Menunggu kompetitor gagal dulu',
            ],
            correctIndex: 1,
            explanation: 'Riset kompetitor dan positioning yang jelas jadi fondasi sebelum eksekusi campaign yang benar-benar diferensiatif.',
          },
          {
            question: 'Apa fungsi "positioning" dalam campaign Resto Steak Rumahan?',
            options: [
              'Menentukan lokasi cabang baru',
              'Menentukan arah seluruh campaign dari visual sampai copy berdasarkan diferensiasi brand',
              'Menentukan jam operasional resto',
              'Menentukan menu yang akan dijual',
            ],
            correctIndex: 1,
            explanation: 'Positioning yang jelas jadi acuan konsisten untuk semua elemen campaign — visual, copy, dan targeting — supaya diferensiasinya konsisten.',
          },
        ],
      },
      {
        id: '3.2', title: 'Setup Campaign Multi-Channel', icon: 'fa-diagram-project', tag: 'TANTANGAN 3.2', type: 'quiz',
        info: 'Menjalankan campaign di Meta & TikTok Ads sekaligus dengan penyesuaian tiap platform.',
        briefLabel: 'Client Mini-Brief:',
        briefBody: '"Kita mau coba pasang iklan di Meta DAN TikTok Ads sekaligus buat launching cabang baru. Perlu disamain semua settingnya?"',
        materi: {
          intro: 'Multi-channel campaign butuh koordinasi — pesan inti sama, tapi setup teknis (format, targeting) disesuaikan kebiasaan tiap platform.',
          points: [
            'Format iklan yang optimal di Meta (feed/story) berbeda dari TikTok (native short video) — creative perlu disesuaikan, bukan disamakan persis.',
            'Budget dan targeting dialokasikan berdasarkan platform mana yang paling relevan dengan audiens target (usia, kebiasaan platform).',
          ],
        },
        aiIntro: 'Multi-channel campaign butuh koordinasi, Rina — pesan inti sama, tapi setup teknis disesuaikan kebiasaan tiap platform.',
        suggests: [{ id: 'faq-3.2-1', text: 'Apa yang perlu disesuaikan antara campaign Meta dan TikTok?', answer: 'Format creative (Meta lebih fleksibel foto/video, TikTok mengutamakan video native short) dan alokasi budget berdasarkan platform mana yang lebih relevan dengan audiens target.' }],
        questions: [
          {
            question: 'Campaign dijalankan di Meta dan TikTok sekaligus. Pendekatan setup yang tepat?',
            options: [
              'Gunakan format iklan yang benar-benar identik di kedua platform',
              'Pesan inti sama, tapi format creative & alokasi budget disesuaikan kebiasaan tiap platform',
              'Fokus 1 platform saja, platform lain diabaikan',
              'Budget dibagi rata tanpa mempertimbangkan audiens',
            ],
            correctIndex: 1,
            explanation: 'Multi-channel campaign efektif ketika pesan inti konsisten tapi eksekusi teknisnya disesuaikan dengan kebiasaan masing-masing platform.',
          },
          {
            question: 'Kenapa format iklan Meta dan TikTok sebaiknya tidak disamakan persis?',
            options: [
              'Karena kedua platform tidak mendukung format sama sekali',
              'Karena kebiasaan konsumsi konten berbeda — TikTok mengutamakan video native, Meta lebih fleksibel',
              'Karena biaya iklan selalu sama di kedua platform',
              'Tidak ada alasan khusus',
            ],
            correctIndex: 1,
            explanation: 'Kebiasaan audiens berbeda di tiap platform — menyesuaikan format sesuai kebiasaan itu meningkatkan efektivitas iklan dibanding memaksakan format yang sama.',
          },
        ],
      },
      {
        id: '3.3', title: 'Analisis Data & Optimasi Berkelanjutan', icon: 'fa-chart-line', tag: 'TANTANGAN 3.3', type: 'quiz',
        info: 'Mengevaluasi & mengoptimasi campaign secara berkala, bukan hanya di akhir.',
        briefLabel: 'Client Mini-Brief:',
        briefBody: '"Campaign udah jalan 2 minggu. Owner nanya apa yang udah dipelajari dari datanya sejauh ini?"',
        materi: {
          intro: 'Campaign jangka panjang butuh evaluasi berkala — bukan cuma di akhir, tapi terus-menerus selama campaign berjalan untuk optimasi.',
          points: [
            'Bandingkan performa antar ad set/platform secara berkala untuk tahu mana yang perlu dinaikkan atau diturunkan budgetnya.',
            'Optimasi berkelanjutan berarti membuat keputusan kecil rutin (geser budget, matikan yang kurang efektif) berdasarkan data terbaru, bukan menunggu campaign selesai baru dievaluasi.',
          ],
        },
        aiIntro: 'Campaign jangka panjang butuh evaluasi berkala, Rina — bukan cuma dievaluasi sekali di akhir.',
        suggests: [{ id: 'faq-3.3-1', text: 'Apa beda evaluasi berkala dengan evaluasi di akhir campaign saja?', answer: 'Evaluasi berkala memungkinkan optimasi lebih awal (geser budget ke yang efektif, matikan yang boros) — kalau menunggu sampai akhir, kesempatan memperbaiki performa selama campaign berjalan sudah hilang.' }],
        questions: [
          {
            question: 'Campaign sudah jalan 2 minggu. Apa yang seharusnya dilakukan secara berkala?',
            options: [
              'Menunggu sampai campaign selesai baru dievaluasi',
              'Bandingkan performa ad set/platform secara berkala + optimasi kecil rutin',
              'Hentikan campaign di tengah jalan tanpa alasan',
              'Tidak perlu evaluasi apapun selama budget masih ada',
            ],
            correctIndex: 1,
            explanation: 'Evaluasi berkala memungkinkan optimasi dilakukan lebih awal, memaksimalkan performa selama campaign masih berjalan.',
          },
          {
            question: 'Kenapa optimasi berkelanjutan lebih baik dibanding menunggu evaluasi di akhir?',
            options: [
              'Karena lebih mudah dilakukan',
              'Karena memberi kesempatan memperbaiki performa selagi campaign masih berjalan',
              'Tidak ada bedanya sama sekali',
              'Karena platform mewajibkan evaluasi rutin',
            ],
            correctIndex: 1,
            explanation: 'Optimasi berkelanjutan memanfaatkan data yang masuk secara real-time untuk memperbaiki performa selagi masih ada waktu, bukan setelah budget habis.',
          },
        ],
      },
      {
        id: '3.4', title: 'Presentasi Hasil & Rekomendasi ke Klien', icon: 'fa-file-signature', tag: 'TANTANGAN 3.4', type: 'quiz',
        info: 'Menghubungkan data campaign ke tujuan bisnis klien dalam presentasi hasil.',
        briefLabel: 'Brief via WhatsApp:',
        briefBody: '"Boleh dijelasin nggak hasil campaign 2 minggu ini gimana, dan rencana ke depan buat cabang baru kita?" — Owner Resto Steak Rumahan',
        materi: {
          intro: 'Proyek besar butuh presentasi hasil yang menghubungkan data campaign ke tujuan bisnis klien (mis. booking cabang baru), bukan sekadar melaporkan angka.',
          points: [
            'Presentasi hasil menjawab "apakah tujuan bisnis tercapai" (mis. jumlah booking cabang baru), bukan cuma metrik iklan mentah.',
            'Rekomendasi lanjutan harus konkret dan actionable (mis. "naikkan budget ad set X karena cost per booking paling efisien").',
          ],
        },
        aiIntro: 'Presentasi hasil yang baik menghubungkan data campaign ke tujuan bisnis klien, Rina — bukan sekadar melaporkan angka mentah.',
        suggests: [{ id: 'faq-3.4-1', text: 'Apa beda laporan angka mentah dengan presentasi hasil yang baik?', answer: 'Presentasi yang baik menjawab apakah tujuan bisnis (booking cabang baru) tercapai, dan memberi rekomendasi actionable — bukan sekadar menumpuk angka reach/klik tanpa makna bisnis.' }],
        questions: [
          {
            question: 'Owner mau tau hasil campaign 2 minggu untuk cabang baru. Elemen paling penting dalam presentasi?',
            options: [
              'Jumlah warna yang dipakai di iklan',
              'Apakah tujuan bisnis (booking cabang baru) tercapai + rekomendasi actionable',
              'Nama-nama platform yang dipakai saja',
              'Jumlah karyawan yang terlibat',
            ],
            correctIndex: 1,
            explanation: 'Presentasi hasil yang baik fokus menjawab pencapaian tujuan bisnis dan memberi rekomendasi konkret, bukan sekadar melaporkan metrik teknis.',
          },
          {
            question: 'Rekomendasi "naikkan budget ad set X" seharusnya didasarkan pada apa?',
            options: [
              'Ad set yang paling disukai secara pribadi',
              'Data cost per booking yang paling efisien dari ad set tersebut',
              'Ad set yang paling baru dibuat',
              'Warna visual yang paling menarik',
            ],
            correctIndex: 1,
            explanation: 'Rekomendasi budget yang kredibel harus berdasarkan data efisiensi (cost per booking) yang terbukti, bukan preferensi subjektif.',
          },
        ],
      },
      {
        id: 'checkpoint-3', title: 'Gerbang Akhir: Proyek Sertifikasi', icon: 'fa-graduation-cap', tag: 'PROYEK AKHIR', type: 'checkpoint',
        isFinalProject: true,
        info: 'Proyek akhir Skill Map Digital Marketing — kelulusan di sini menerbitkan Sertifikat Kompetensi WADAH-mu!',
        briefLabel: 'Brief Mandatori Proyek Akhir:',
        briefBullets: [
          { strong: 'Wajib Riset & Positioning:', rest: ' analisis kompetitor + positioning yang jelas untuk campaign cabang baru.' },
          { strong: 'Setup Multi-Channel:', rest: ' rencana campaign untuk Meta Ads dan TikTok Ads dengan penyesuaian format tiap platform.' },
          { strong: 'Rencana Optimasi Berkala:', rest: ' jadwal evaluasi & optimasi selama campaign berjalan.' },
          { strong: 'Presentasi Hasil:', rest: ' ringkasan pencapaian tujuan bisnis + rekomendasi lanjutan.' },
        ],
        materi: {
          intro: 'Ini adalah Gerbang Akhir Skill Map Digital Marketing — proyek paling kompleks yang pernah kamu kerjakan di WADAH.',
          points: [
            'Kamu akan direview lewat quiz singkat yang merangkum seluruh Unit 3.',
            'Setelah lulus quiz, kamu masuk ke Proyek Akhir: menyusun strategi campaign multi-channel untuk Resto Steak Rumahan dengan deadline 10 hari.',
            'Proyek ini dinilai 100% oleh human reviewer WADAH — kelulusan di sini menerbitkan Sertifikat Kompetensi Digital Marketing-mu, lengkap dengan nomor verifikasi resmi.',
          ],
        },
        aiIntro: 'Selamat sampai di gerbang terakhir, Rina! Ini bukan sekadar checkpoint biasa — approval di sini menerbitkan sertifikat kompetensi resmi WADAH-mu. Kerjakan sebaik yang kamu bisa.',
        suggests: [{ id: 'faq-cp-3', text: 'Apa yang terjadi setelah proyek akhir ini disetujui?', answer: 'Kamu akan mendapatkan Sertifikat Kompetensi Digital Marketing resmi dari WADAH — punya nomor verifikasi unik yang bisa dicek siapa saja, dan langsung masuk ke profil publikmu.' }],
        instruction: 'Kumpulkan 1 dokumen strategi campaign multi-channel untuk Resto Steak Rumahan sesuai brief di atas.',
        deadlineText: '10 hari',
        checklist: [
          'Riset kompetitor & positioning campaign tersusun',
          'Setup campaign Meta Ads & TikTok Ads dengan penyesuaian format',
          'Jadwal evaluasi & optimasi berkala disertakan',
          'Presentasi hasil & rekomendasi lanjutan disertakan',
        ],
      },
    ],
  },

  // ── UGC CREATOR — Skincare Lokal Alami (node 1.1 diberi bobot penuh sesuai brief user) ──
  ugc: {
    mapTitle: 'Peta Misi: UGC Creator',
    unitNotes: [
      'Unit 1: Fondasi Autentisitas & Kepatuhan Brief (Tingkat Pemula)',
      'Unit 2: Konsistensi Karakter & Kerja Sama Brand (Tingkat Menengah)',
      'Unit 3: Kampanye Multi-Konten & Sertifikasi (Tingkat Mahir)',
    ],
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
        checklist: [
          'Label kerja sama/iklan tercantum jelas',
          'Gaya bicara natural, bukan skrip kaku',
          'Struktur cerita: masalah → proses → hasil',
          'Before/after ditunjukkan jujur',
        ],
      },

      // ── UNIT 2 — Skincare Lokal Alami: kerja sama jangka panjang (Menengah) ─
      {
        id: '2.1', title: 'Menjaga Karakter Konsisten', icon: 'fa-user', tag: 'TANTANGAN 2.1', type: 'quiz',
        info: 'Membangun kepribadian konten yang konsisten untuk kerja sama jangka panjang.',
        briefLabel: 'Client Mini-Brief:',
        briefBody: '"Brand Alami mau kerja sama jangka panjang, bukan cuma 1 video. Tapi kepribadian di kontenmu harus tetep \'kamu banget\' tiap video, jangan berubah-ubah."',
        materi: {
          intro: 'Kerja sama jangka panjang butuh karakter/personality yang konsisten — audiens harus tetap mengenali "ini kamu" di setiap konten, walau topiknya beda-beda.',
          points: [
            'Karakter (cara bicara, energi, humor) adalah "brand pribadi" kreator — konsisten menjaga ini membangun kepercayaan audiens dalam jangka panjang.',
            'Konsistensi karakter BUKAN berarti kaku/monoton — tetap boleh spontan, asal "nada dasarnya" (misal ceria & jujur) tetap sama.',
          ],
        },
        aiIntro: 'Kerja sama jangka panjang butuh karakter yang konsisten, Rina — audiens harus tetap kenali "ini kamu" di setiap konten.',
        suggests: [{ id: 'faq-2.1-1', text: 'Apa bedanya konsisten karakter dengan jadi kaku/monoton?', answer: 'Konsisten karakter itu soal "nada dasar" (misal selalu ceria dan jujur), bukan soal mengulang gerakan/kalimat yang sama persis — kamu tetap boleh spontan asal nada dasarnya sama.' }],
        questions: [
          {
            question: 'Brand Alami mau kerja sama jangka panjang dan minta karakter kontenmu konsisten. Maksudnya?',
            options: [
              'Harus pakai kalimat dan gerakan yang sama persis tiap video',
              'Nada dasar kepribadian (cara bicara, energi) tetap sama meski topik video beda-beda',
              'Harus selalu terlihat sangat formal',
              'Tidak perlu konsisten sama sekali',
            ],
            correctIndex: 1,
            explanation: 'Konsistensi karakter berarti audiens tetap mengenali kepribadian dasar kreator di setiap konten, bukan mengulang skrip yang identik.',
          },
          {
            question: 'Kenapa konsistensi karakter penting untuk kerja sama jangka panjang?',
            options: [
              'Supaya brand bisa menghemat biaya produksi',
              'Membangun kepercayaan audiens karena mereka mengenal "sosok" yang konsisten dari waktu ke waktu',
              'Tidak ada hubungannya dengan kepercayaan audiens',
              'Supaya video selalu terlihat sama persis',
            ],
            correctIndex: 1,
            explanation: 'Audiens membangun kepercayaan pada kreator yang konsisten kepribadiannya — ini yang membuat endorsement mereka terasa lebih kredibel dari waktu ke waktu.',
          },
        ],
      },
      {
        id: '2.2', title: 'Membaca Kontrak Kerja Sama Dasar', icon: 'fa-file-contract', tag: 'TANTANGAN 2.2', type: 'quiz',
        info: 'Memahami poin-poin dasar kontrak endorsement sebelum menyetujui kerja sama.',
        briefLabel: 'Client Mini-Brief:',
        briefBody: '"Sebelum lanjut kerja sama jangka panjang, brand Alami kirim draft kontrak sederhana. Ini yang perlu diperhatiin apa aja ya?"',
        materi: {
          intro: 'Sebagai kreator profesional, memahami poin-poin dasar kontrak kerja sama itu penting — supaya hak dan kewajiban jelas dari awal.',
          points: [
            'Perhatikan scope kerja (berapa video, platform mana, periode kerja sama) supaya tidak ada kesalahpahaman di tengah jalan.',
            'Perhatikan juga hak penggunaan konten (apakah brand boleh repost/gunakan ulang selamanya, atau ada batas waktu) — ini sering terlewat tapi penting.',
          ],
        },
        aiIntro: 'Sebagai kreator profesional, memahami poin dasar kontrak itu penting, Rina — supaya hak dan kewajiban jelas dari awal.',
        suggests: [{ id: 'faq-2.2-1', text: 'Kenapa hak penggunaan konten penting diperhatikan di kontrak?', answer: 'Kalau tidak jelas, brand bisa memakai kontenmu selamanya tanpa batas atau kompensasi tambahan — poin ini sering terlewat tapi berdampak besar ke depannya.' }],
        questions: [
          {
            question: 'Menerima draft kontrak kerja sama jangka panjang. Poin apa yang paling penting diperhatikan?',
            options: [
              'Warna logo brand di kontrak',
              'Scope kerja (jumlah video, platform, periode) dan hak penggunaan konten',
              'Font yang dipakai di dokumen kontrak',
              'Jumlah halaman kontrak',
            ],
            correctIndex: 1,
            explanation: 'Scope kerja dan hak penggunaan konten adalah dua poin dasar yang paling menentukan kejelasan kerja sama dan mencegah kesalahpahaman.',
          },
          {
            question: 'Kenapa penting mengecek "hak penggunaan konten" sebelum tanda tangan kontrak?',
            options: [
              'Karena tidak ada pengaruhnya sama sekali',
              'Supaya jelas apakah brand boleh memakai ulang konten tanpa batas waktu atau kompensasi tambahan',
              'Karena itu wajib menurut hukum di semua kasus',
              'Hanya formalitas belaka',
            ],
            correctIndex: 1,
            explanation: 'Tanpa kejelasan ini, brand bisa menggunakan konten tanpa batas tanpa kompensasi tambahan bagi kreator — penting dipahami sebelum menyetujui kontrak.',
          },
        ],
      },
      {
        id: '2.3', title: 'Jadwal Posting Sesuai Kesepakatan', icon: 'fa-calendar-check', tag: 'TANTANGAN 2.3', type: 'quiz',
        info: 'Menjaga komitmen jadwal posting sebagai bagian dari profesionalisme kreator.',
        briefLabel: 'Client Mini-Brief:',
        briefBody: '"Kita udah sepakat video harus tayang tiap Jumat, tapi kadang aku lupa atau telat. Brand jadi nanya-nanya terus."',
        materi: {
          intro: 'Konsistensi jadwal posting sesuai kesepakatan adalah bagian dari profesionalisme kreator — brand mengandalkan jadwal ini untuk strategi mereka sendiri.',
          points: [
            'Buat kalender pribadi/reminder untuk deadline kerja sama — jangan andalkan ingatan saja.',
            'Kalau terpaksa telat, komunikasikan LEBIH AWAL ke brand daripada diam dan telat tanpa kabar.',
          ],
        },
        aiIntro: 'Konsistensi jadwal posting itu bagian dari profesionalisme kreator, Rina — brand mengandalkan jadwal ini untuk strategi mereka.',
        suggests: [{ id: 'faq-2.3-1', text: 'Gimana kalau memang bakal telat posting?', answer: 'Komunikasikan ke brand SESEGERA MUNGKIN begitu tahu akan telat — jauh lebih profesional dibanding diam dan brand baru tahu setelah deadline lewat.' }],
        questions: [
          {
            question: 'Sering lupa/telat posting sesuai jadwal yang disepakati brand. Solusi paling tepat?',
            options: [
              'Tidak perlu khawatir, brand pasti maklum',
              'Buat kalender/reminder pribadi untuk deadline kerja sama',
              'Berhenti kerja sama karena terlalu merepotkan',
              'Posting kapan saja tanpa memberi tahu brand',
            ],
            correctIndex: 1,
            explanation: 'Kalender/reminder pribadi membantu menjaga komitmen jadwal yang sudah disepakati — ini bagian dari profesionalisme kerja sama jangka panjang.',
          },
          {
            question: 'Kalau terpaksa akan telat posting, apa yang paling tepat dilakukan?',
            options: [
              'Diam saja dan berharap brand tidak sadar',
              'Komunikasikan ke brand sesegera mungkin begitu tahu akan telat',
              'Batalkan kerja sama secara sepihak',
              'Posting konten asal-asalan supaya cepat selesai',
            ],
            correctIndex: 1,
            explanation: 'Komunikasi lebih awal menunjukkan profesionalisme dan memberi brand waktu menyesuaikan rencana mereka, jauh lebih baik daripada diam.',
          },
        ],
      },
      {
        id: '2.4', title: 'Menerjemahkan Feedback Revisi dari Brand', icon: 'fa-comment-dots', tag: 'TANTANGAN 2.4', type: 'quiz',
        info: 'Menerjemahkan feedback brand sambil tetap menjaga keaslian karakter kreator.',
        briefLabel: 'Brief via WhatsApp:',
        briefBody: '"Videonya udah oke tapi kayaknya kurang \'related\' sama campaign kita kali ini. Terus energinya kurang \'nendang\' di awal." — Tim Brand Alami, revisi ronde 1',
        materi: {
          intro: 'Sama seperti konten lain, feedback dari brand juga sering berupa perasaan — kita terjemahkan sambil tetap menjaga keaslian karaktermu.',
          points: [
            '"Kurang related sama campaign" berarti pesan konten belum cukup menghubungkan ke tema campaign spesifik brand saat ini.',
            '"Energi kurang nendang di awal" tetap soal hook — tapi ingat, perbaikannya harus tetap dalam karakter aslimu, bukan meniru gaya kreator lain.',
          ],
        },
        aiIntro: 'Feedback dari brand juga sering berupa perasaan, Rina — kita terjemahkan sambil tetap menjaga keaslian karaktermu.',
        suggests: [{ id: 'faq-2.4-1', text: 'Gimana caranya perbaiki hook tanpa kehilangan karakter asli?', answer: 'Perkuat energi di detik-detik awal dengan caramu sendiri (bukan meniru gaya orang lain) — misal reaksi yang lebih ekspresif tapi tetap dalam gaya bicara khasmu.' }],
        questions: [
          {
            question: 'Feedback "kurang related sama campaign" dari brand berarti apa?',
            options: [
              'Kualitas video kurang bagus secara teknis',
              'Pesan konten belum cukup menghubungkan ke tema campaign spesifik brand saat ini',
              'Durasi video terlalu panjang',
              'Warna video kurang menarik',
            ],
            correctIndex: 1,
            explanation: '"Kurang related" biasanya berarti kontennya belum cukup terhubung dengan tema/campaign spesifik yang sedang dijalankan brand saat itu.',
          },
          {
            question: 'Saat memperbaiki hook berdasarkan feedback, apa yang harus tetap dijaga?',
            options: [
              'Meniru gaya kreator lain yang lebih populer',
              'Karakter/personality asli kreator itu sendiri',
              'Mengganti total gaya bicara supaya beda',
              'Tidak perlu menjaga apapun',
            ],
            correctIndex: 1,
            explanation: 'Perbaikan hook harus tetap dalam karakter asli kreator — itu yang membuat konten UGC tetap terasa autentik meski direvisi.',
          },
        ],
      },
      {
        id: 'checkpoint-2', title: 'Kastil Checkpoint 2', icon: 'fa-fort-awesome', tag: 'UJIAN REVISI', type: 'checkpoint',
        info: 'Ujian mandiri: rangkaian 3 video review Skincare Lokal Alami dengan karakter konsisten & kepatuhan kontrak!',
        briefLabel: 'Brief Mandatori Proyek Komersial:',
        briefBullets: [
          { strong: 'Wajib 3 Video Konsisten Karakter:', rest: ' kepribadian yang sama terasa di ketiga video meski topik produk berbeda.' },
          { strong: 'Kalender Posting Disertakan:', rest: ' jadwal 3 minggu sesuai kesepakatan brand.' },
          { strong: 'Paham Poin Kontrak:', rest: ' sertakan ringkasan scope kerja & hak penggunaan konten yang dipahami.' },
        ],
        materi: {
          intro: 'Ini adalah ujian Checkpoint Unit 2 — gabungan dari semua yang sudah kamu pelajari soal kerja sama jangka panjang.',
          points: [
            'Kamu akan direview lewat quiz singkat yang merangkum 4 topik Unit 2.',
            'Setelah lulus quiz, kamu masuk ke Tantangan Nyata: menyusun 1 set (3 video) untuk Skincare Lokal Alami dengan deadline 7 hari.',
            'Tantangan dinilai 100% oleh human reviewer, bukan skor otomatis.',
          ],
        },
        aiIntro: 'Checkpoint kedua, Rina! Kali ini kamu diuji menjaga konsistensi karakter di beberapa video, bukan cuma 1 video bagus.',
        suggests: [{ id: 'faq-cp-2', text: 'Apa yang paling dinilai reviewer di checkpoint ini?', answer: 'Konsistensi karakter/personality antar video dan pemahaman terhadap poin dasar kontrak kerja sama — bukan cuma kualitas video secara individual.' }],
        instruction: 'Kumpulkan 1 set (3 video review/naskah) untuk Skincare Lokal Alami sesuai brief di atas.',
        deadlineText: '7 hari',
        checklist: [
          'Karakter/personality konsisten di ketiga video',
          'Kalender posting 3 minggu disertakan',
          'Ringkasan pemahaman scope kerja & hak konten disertakan',
          'Feedback revisi sebelumnya sudah diterapkan',
        ],
      },

      // ── UNIT 3 — Suplemen Herbal Sehat Alami: proyek akhir (Mahir) ─────────
      {
        id: '3.1', title: 'Riset Produk Mendalam Sebelum Syuting', icon: 'fa-magnifying-glass', tag: 'TANTANGAN 3.1', type: 'quiz',
        info: 'Memahami kandungan & klaim resmi produk kesehatan sebelum membuat konten.',
        briefLabel: 'Client Mini-Brief:',
        briefBody: '"Suplemen Herbal Sehat Alami ini produk kesehatan, jadi kita butuh kreator yang bener-bener paham produknya sebelum review, bukan asal coba doang."',
        materi: {
          intro: 'Produk kesehatan butuh riset lebih dalam dari produk skincare biasa — klaim yang salah bisa berakibat serius, bukan cuma soal estetika.',
          points: [
            'Pahami kandungan, cara pakai, dan klaim resmi produk dari brand SEBELUM membuat konten — supaya tidak asal bicara.',
            'Riset juga pengalaman pribadi yang genuine (bukan settingan) supaya cerita produk terasa jujur dan kredibel.',
          ],
        },
        aiIntro: 'Ini proyek akhir Unit 3, Rina — produk kesehatan butuh riset lebih dalam sebelum syuting, bukan asal coba doang.',
        suggests: [{ id: 'faq-3.1-1', text: 'Kenapa riset produk kesehatan lebih penting dari produk skincare biasa?', answer: 'Klaim yang salah soal produk kesehatan bisa berakibat serius bagi audiens yang mempercayainya — beda dengan produk skincare yang risikonya lebih terbatas pada estetika.' }],
        questions: [
          {
            question: 'Suplemen Herbal Sehat Alami adalah produk kesehatan. Kenapa risetnya perlu lebih mendalam dari produk skincare biasa?',
            options: [
              'Karena produk kesehatan selalu lebih mahal',
              'Klaim yang salah soal produk kesehatan bisa berakibat serius bagi audiens',
              'Tidak ada bedanya sama sekali',
              'Karena produk kesehatan lebih sulit difoto',
            ],
            correctIndex: 1,
            explanation: 'Produk kesehatan menyangkut keputusan yang berdampak pada tubuh audiens — klaim yang keliru bisa berakibat lebih serius dibanding produk kecantikan biasa.',
          },
          {
            question: 'Apa yang perlu dipahami kreator SEBELUM membuat konten review produk kesehatan?',
            options: [
              'Hanya warna kemasan produk',
              'Kandungan, cara pakai, dan klaim resmi dari brand',
              'Harga produk di semua toko',
              'Jumlah followers brand di media sosial',
            ],
            correctIndex: 1,
            explanation: 'Memahami kandungan, cara pakai, dan klaim resmi mencegah kreator menyampaikan informasi yang salah atau menyesatkan audiens.',
          },
        ],
      },
      {
        id: '3.2', title: 'Storytelling Personal yang Autentik', icon: 'fa-heart', tag: 'TANTANGAN 3.2', type: 'quiz',
        info: 'Menyeimbangkan pesan brand dengan pengalaman personal yang genuine.',
        briefLabel: 'Client Mini-Brief:',
        briefBody: '"Kita pengen ceritanya beneran personal, bukan kayak baca dari brief brand. Gimana caranya biar tetep autentik tapi menyampaikan pesan yang tepat?"',
        materi: {
          intro: 'Storytelling personal yang kuat menyeimbangkan dua hal: pesan yang perlu disampaikan brand DAN pengalaman asli yang relate dengan audiens.',
          points: [
            'Mulai dari pengalaman/masalah personal yang genuine, baru hubungkan ke produk — bukan sebaliknya (mulai dari produk lalu dipaksakan jadi cerita).',
            'Detail kecil yang spesifik (bukan generik) membuat cerita terasa lebih personal dan believable.',
          ],
        },
        aiIntro: 'Storytelling personal yang kuat itu menyeimbangkan pesan brand dengan pengalaman aslimu, Rina.',
        suggests: [{ id: 'faq-3.2-1', text: 'Gimana caranya storytelling tidak terasa "baca brief"?', answer: 'Mulai dari pengalaman/masalah personal yang genuine dulu, baru hubungkan ke produk di bagian tengah cerita — bukan mulai dari pesan produk lalu dipaksakan jadi cerita.' }],
        questions: [
          {
            question: 'Brand minta cerita yang "beneran personal", bukan kayak baca brief. Pendekatan yang tepat?',
            options: [
              'Membaca poin-poin brief secara langsung ke kamera',
              'Mulai dari pengalaman/masalah personal genuine, baru hubungkan ke produk',
              'Menghafal skrip yang disiapkan brand kata per kata',
              'Fokus hanya pada fitur produk secara teknis',
            ],
            correctIndex: 1,
            explanation: 'Storytelling yang dimulai dari pengalaman personal genuine terasa lebih autentik dibanding memaksakan pesan brand jadi cerita.',
          },
          {
            question: 'Apa yang membuat sebuah cerita personal terasa lebih believable bagi audiens?',
            options: [
              'Menggunakan istilah teknis yang rumit',
              'Detail kecil yang spesifik, bukan pernyataan generik',
              'Durasi cerita yang sangat panjang',
              'Menggunakan banyak musik latar',
            ],
            correctIndex: 1,
            explanation: 'Detail spesifik (bukan generik) membuat cerita terasa nyata dialami, bukan template yang bisa dipakai siapa saja.',
          },
        ],
      },
      {
        id: '3.3', title: 'Paket Konten Multi-Platform', icon: 'fa-layer-group', tag: 'TANTANGAN 3.3', type: 'quiz',
        info: 'Mengadaptasi 1 konsep konten ke TikTok, Instagram, dan YouTube Shorts sekaligus.',
        briefLabel: 'Client Mini-Brief:',
        briefBody: '"Kita mau hasil kerja samamu ini muncul di TikTok, Instagram, DAN YouTube Shorts sekaligus. Perlu bikin beda-beda?"',
        materi: {
          intro: 'Sama seperti kreator video pada umumnya, satu konsep bisa diadaptasi ke berbagai platform tanpa perlu produksi dari nol berkali-kali.',
          points: [
            'Rekam materi mentah yang cukup fleksibel (variasi angle & durasi) supaya bisa di-edit ulang untuk kebutuhan durasi tiap platform.',
            'Caption dan hook teks perlu disesuaikan gaya tiap platform meski inti pesannya sama.',
          ],
        },
        aiIntro: 'Satu konsep bisa diadaptasi ke berbagai platform, Rina — tidak perlu produksi dari nol berkali-kali.',
        suggests: [{ id: 'faq-3.3-1', text: 'Apa yang perlu disiapkan saat syuting supaya mudah diadaptasi ke banyak platform?', answer: 'Rekam materi mentah dengan variasi angle dan durasi yang cukup fleksibel — supaya saat proses edit, kamu punya cukup bahan untuk menyesuaikan durasi ideal tiap platform.' }],
        questions: [
          {
            question: 'Konten yang sama diminta tayang di TikTok, Instagram, dan YouTube Shorts. Persiapan syuting yang tepat?',
            options: [
              'Syuting terpisah total untuk tiap platform',
              'Rekam materi mentah dengan variasi angle & durasi yang fleksibel untuk diedit ulang',
              'Hanya syuting durasi terpendek saja',
              'Tidak perlu persiapan khusus',
            ],
            correctIndex: 1,
            explanation: 'Materi mentah yang fleksibel memudahkan proses edit ulang untuk menyesuaikan durasi ideal tiap platform tanpa syuting berkali-kali.',
          },
          {
            question: 'Apa yang tetap perlu disesuaikan meski intinya 1 konsep untuk banyak platform?',
            options: [
              'Tidak ada yang perlu disesuaikan sama sekali',
              'Caption dan hook teks disesuaikan gaya tiap platform',
              'Produk yang direview harus berbeda di tiap platform',
              'Nama kreator harus diganti-ganti',
            ],
            correctIndex: 1,
            explanation: 'Meski konsep inti sama, caption dan hook teks tetap perlu disesuaikan gaya masing-masing platform supaya terasa native, bukan asal re-upload.',
          },
        ],
      },
      {
        id: '3.4', title: 'Etika & Compliance Endorsement Kesehatan', icon: 'fa-shield-halved', tag: 'TANTANGAN 3.4', type: 'quiz',
        info: 'Menyampaikan endorsement produk kesehatan tanpa klaim medis berlebihan.',
        briefLabel: 'Brief via WhatsApp:',
        briefBody: '"Karena ini produk kesehatan, kita harus lebih hati-hati soal klaim ya. Ada aturan khusus yang perlu diikuti?" — Tim Brand Suplemen Herbal Sehat Alami',
        materi: {
          intro: 'Endorsement produk kesehatan punya aturan etika lebih ketat dibanding produk umum — klaim berlebihan bisa menyesatkan dan berisiko hukum.',
          points: [
            'Hindari klaim medis berlebihan (mis. "menyembuhkan penyakit X") kecuali benar-benar didukung bukti resmi dari brand/BPOM.',
            'Sampaikan hasil sebagai pengalaman pribadi ("bagi saya membantu...") bukan klaim mutlak untuk semua orang ("pasti sembuh").',
          ],
        },
        aiIntro: 'Endorsement produk kesehatan punya aturan etika lebih ketat, Rina — klaim berlebihan bisa menyesatkan dan berisiko.',
        suggests: [{ id: 'faq-3.4-1', text: 'Kenapa harus hindari klaim medis mutlak seperti "pasti sembuh"?', answer: 'Klaim mutlak untuk semua orang berisiko menyesatkan karena hasil bisa berbeda tiap individu — lebih aman dan etis menyampaikan sebagai pengalaman pribadi yang genuine.' }],
        questions: [
          {
            question: 'Membuat konten review produk kesehatan. Klaim seperti apa yang harus dihindari?',
            options: [
              'Menyebutkan pengalaman pribadi menggunakan produk',
              'Klaim medis berlebihan/mutlak seperti "menyembuhkan penyakit X" tanpa bukti resmi',
              'Menyebutkan nama produk dengan jelas',
              'Menunjukkan cara pemakaian produk',
            ],
            correctIndex: 1,
            explanation: 'Klaim medis berlebihan tanpa bukti resmi berisiko menyesatkan audiens dan bisa berakibat hukum bagi brand maupun kreator.',
          },
          {
            question: 'Cara paling etis menyampaikan hasil pemakaian produk kesehatan dalam konten?',
            options: [
              'Menyatakan sebagai fakta mutlak untuk semua orang',
              'Menyampaikan sebagai pengalaman pribadi, bukan klaim mutlak berlaku untuk semua orang',
              'Tidak perlu menyebutkan hasil sama sekali',
              'Melebih-lebihkan hasil supaya lebih menarik',
            ],
            correctIndex: 1,
            explanation: 'Menyampaikan sebagai pengalaman pribadi lebih jujur dan etis dibanding klaim mutlak, karena hasil pemakaian produk kesehatan bisa berbeda-beda tiap individu.',
          },
        ],
      },
      {
        id: 'checkpoint-3', title: 'Gerbang Akhir: Proyek Sertifikasi', icon: 'fa-graduation-cap', tag: 'PROYEK AKHIR', type: 'checkpoint',
        isFinalProject: true,
        info: 'Proyek akhir Skill Map UGC Creator — kelulusan di sini menerbitkan Sertifikat Kompetensi WADAH-mu!',
        briefLabel: 'Brief Mandatori Proyek Akhir:',
        briefBullets: [
          { strong: 'Wajib Riset Produk Mendalam:', rest: ' pahami kandungan & klaim resmi sebelum membuat konten.' },
          { strong: 'Storytelling Personal Autentik:', rest: ' cerita dimulai dari pengalaman genuine, bukan template brief.' },
          { strong: 'Siap Multi-Platform:', rest: ' materi mentah cukup fleksibel untuk diadaptasi ke TikTok, IG, dan YouTube Shorts.' },
          { strong: 'Etika Endorsement Kesehatan:', rest: ' tanpa klaim medis berlebihan, disampaikan sebagai pengalaman pribadi.' },
        ],
        materi: {
          intro: 'Ini adalah Gerbang Akhir Skill Map UGC Creator — proyek paling kompleks yang pernah kamu kerjakan di WADAH.',
          points: [
            'Kamu akan direview lewat quiz singkat yang merangkum seluruh Unit 3.',
            'Setelah lulus quiz, kamu masuk ke Proyek Akhir: menyusun 3 video review untuk Suplemen Herbal Sehat Alami dengan deadline 10 hari.',
            'Proyek ini dinilai 100% oleh human reviewer WADAH — kelulusan di sini menerbitkan Sertifikat Kompetensi UGC Creator-mu, lengkap dengan nomor verifikasi resmi.',
          ],
        },
        aiIntro: 'Selamat sampai di gerbang terakhir, Rina! Ini bukan sekadar checkpoint biasa — approval di sini menerbitkan sertifikat kompetensi resmi WADAH-mu. Kerjakan sebaik yang kamu bisa.',
        suggests: [{ id: 'faq-cp-3', text: 'Apa yang terjadi setelah proyek akhir ini disetujui?', answer: 'Kamu akan mendapatkan Sertifikat Kompetensi UGC Creator resmi dari WADAH — punya nomor verifikasi unik yang bisa dicek siapa saja, dan langsung masuk ke profil publikmu.' }],
        instruction: 'Kumpulkan 1 set (3 video review/naskah) untuk Suplemen Herbal Sehat Alami sesuai brief di atas.',
        deadlineText: '10 hari',
        checklist: [
          'Riset kandungan & klaim resmi produk diterapkan',
          'Storytelling personal terasa autentik, bukan template',
          'Materi siap diadaptasi ke TikTok/IG/YouTube Shorts',
          'Tanpa klaim medis berlebihan, disampaikan sebagai pengalaman pribadi',
        ],
      },
    ],
  },
};
