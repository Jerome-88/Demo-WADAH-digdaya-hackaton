// Reviewer feedback per skill, nested by checkpoint id — Desain Grafis is the
// golden path with all 3 checkpoints authored, the other 5 skills only have
// checkpoint-1 (their Skill Maps stop there for now).
// Shared by RinaSubmit (regular checkpoint review) and RinaCertification
// (the paid certification exam reuses the checkpoint-3 feedback content).
export const REVIEW_FEEDBACK = {
  social: {
    'checkpoint-1': {
      intro: 'Kontennya sudah oke buat Warung Kopi Abadi, tapi ada dua hal yang bikin efeknya belum maksimal:',
      points: [
        { title: 'Hook di 2 detik pertama masih kurang kuat', detail: 'kalimat pembukanya generic, belum langsung menonjolkan menu baru Es Kopi Gula Aren.' },
        { title: 'CTA di akhir caption kurang konkret', detail: '"yuk dicoba" terlalu umum — ganti dengan ajakan spesifik seperti "Mampir & tag kita di story-mu!"' },
      ],
      checklist: ['Perkuat hook di 2 detik pertama', 'Ganti CTA jadi lebih konkret'],
      approvedComment: 'Hook-nya sekarang jauh lebih nendang dan CTA-nya jelas ngajak orang bertindak. Nice improvement!',
    },
    'checkpoint-2': {
      intro: 'Set 3 kontenmu sudah oke satu-satu, tapi sebagai SATU sistem konten mingguan masih ada dua hal yang kurang nyambung:',
      points: [
        { title: 'Tone of voice masih naik-turun antar konten', detail: 'konten promo terasa formal, tapi konten testimoni terasa terlalu santai — belum konsisten sesuai kata sifat acuan brand.' },
        { title: 'Kalender posting belum menyebutkan jam spesifik', detail: 'baru ada hari, padahal jam posting yang konsisten juga penting supaya followers "belajar" kapan harus cek akun.' },
      ],
      checklist: ['Samakan tone of voice di ketiga konten', 'Tambahkan jam posting spesifik di kalender'],
      approvedComment: 'Sekarang tone-nya konsisten di ketiga konten dan kalendernya lengkap dengan jam posting. Ini yang bikin sistem konten kerasa profesional!',
    },
    'checkpoint-3': {
      intro: 'Strategi bulanan untuk Roti Bakar Kenangan sudah komprehensif, tapi ada dua hal sebelum siap dijalankan:',
      points: [
        { title: 'Rencana respons komentar negatif masih terlalu umum', detail: 'perlu contoh kalimat konkret, bukan cuma "akan direspons dengan tenang" — reviewer butuh lihat calon kalimat aslinya.' },
        { title: 'Laporan belum menyebutkan rekomendasi spesifik', detail: 'baru ada "akan dievaluasi", padahal perlu rekomendasi konkret seperti pilar konten mana yang perlu diperbanyak.' },
      ],
      checklist: ['Tambahkan contoh kalimat respons komentar negatif', 'Buat rekomendasi lanjutan lebih spesifik dan konkret'],
      approvedComment: 'Sekarang rencana respons dan rekomendasinya sudah konkret dan actionable. Strategi ini siap dieksekusi untuk Roti Bakar Kenangan — level kerja yang layak dapat sertifikat kompetensi!',
    },
  },
  video: {
    'checkpoint-1': {
      intro: 'Videonya udah niat banget, tapi masih ada dua hal yang bikin retention-nya belum optimal:',
      points: [
        { title: 'Hook belum muncul di detik 0', detail: 'masih ada intro logo ~2 detik di depan — penonton keburu skip sebelum lihat produknya.' },
        { title: 'Teks overlay harga & lokasi kurang kebaca', detail: 'ukurannya kekecilan dan warnanya nyaris menyatu dengan background video.' },
      ],
      checklist: ['Pindahkan hook ke detik 0', 'Perbesar & perjelas teks overlay harga/lokasi'],
      approvedComment: 'Hook-nya sekarang langsung nonjok di detik 0 dan teks overlay-nya jauh lebih kebaca. Mantap!',
    },
    'checkpoint-2': {
      intro: 'Ketiga storyboard sudah punya cerita yang oke, tapi sebagai SATU series masih ada dua hal yang kurang nyambung:',
      points: [
        { title: 'Gaya transisi antar video belum seragam', detail: 'storyboard 1 dan 2 pakai transisi cepat, tapi storyboard 3 rencananya pakai transisi lambat — belum konsisten sebagai satu series.' },
        { title: 'Mood musik belum disebutkan konsisten', detail: 'baru 1 dari 3 storyboard yang menyebutkan referensi musik — lengkapi ketiganya dengan genre/mood yang senada.' },
      ],
      checklist: ['Samakan gaya transisi di ketiga storyboard', 'Lengkapi referensi mood musik di semua storyboard'],
      approvedComment: 'Sekarang gaya transisi dan mood musiknya konsisten di ketiga storyboard. Series ini sekarang benar-benar kerasa satu identitas!',
    },
    'checkpoint-3': {
      intro: '3 storyboard untuk Kopi Kilat Ekspres sudah punya hook yang kuat, tapi ada dua hal sebelum siap produksi:',
      points: [
        { title: 'Ketiga hook masih pakai pendekatan yang mirip', detail: 'semuanya pakai "pertanyaan provokatif" — coba variasikan minimal 1 video dengan pendekatan visual mengejutkan supaya tidak terasa formula yang diulang.' },
        { title: 'Rasional konsep belum menjelaskan alasan platform', detail: 'perlu 1-2 kalimat kenapa storyboard ini juga cocok diadaptasi ke YouTube Shorts, bukan cuma TikTok/Reels.' },
      ],
      checklist: ['Variasikan pendekatan hook di minimal 1 video', 'Tambahkan alasan kesiapan adaptasi ke YouTube Shorts di rasional konsep'],
      approvedComment: 'Sekarang variasi hook-nya lebih segar dan rasional adaptasi platformnya jelas. Konsep ini siap produksi untuk Kopi Kilat Ekspres — level kerja yang layak dapat sertifikat kompetensi!',
    },
  },
  desain: {
    'checkpoint-1': {
      intro: 'Feed Instagram-mu sudah rapi dan warna-nya sesuai brief. Tapi ada dua hal yang perlu diperbaiki:',
      points: [
        { title: 'Hierarchy visual belum jelas', detail: 'mata tidak tahu harus lihat ke mana dulu. Nama produk perlu lebih dominan dari elemen dekoratif.' },
        { title: 'Font yang dipakai di caption terlalu tipis', detail: 'terlalu tipis untuk dibaca di ukuran mobile. Coba ganti ke weight yang lebih tebal atau ukuran minimal 14pt.' },
      ],
      checklist: ['Perbaiki hierarchy visual', 'Ganti font ke weight lebih tebal'],
      approvedComment: 'Revisi kamu sudah jauh lebih baik. Hierarchy visualnya sekarang jelas dan font-nya lebih readable di mobile. Good job!',
    },
    'checkpoint-2': {
      intro: 'Set 3 desainmu sudah cakep satu-satu, tapi sebagai SATU sistem masih ada dua hal yang kurang nyambung:',
      points: [
        { title: 'Margin & grid tidak konsisten antar desain', detail: 'desain testimoni marginnya lebih sempit dibanding dua desain lain — kelihatan begitu ketiganya dijajarkan di grid feed.' },
        { title: 'Posisi logo berpindah-pindah', detail: 'di desain promo logo ada di kanan atas, tapi di desain produk baru pindah ke kiri bawah — brand guideline mini belum diikuti konsisten.' },
      ],
      checklist: ['Samakan margin/grid di ketiga desain', 'Kunci posisi logo di satu titik baku'],
      approvedComment: 'Sekarang ketiga desain benar-benar kerasa satu sistem — margin konsisten dan logo di posisi yang sama. Ini yang bikin sebuah brand kelihatan profesional!',
    },
    'checkpoint-3': {
      intro: 'Kelima konten untuk Toko Batik Nusantara punya arah visual yang kuat, tapi ada dua hal sebelum siap dipresentasikan ke klien:',
      points: [
        { title: 'Adaptasi ke Story terlihat dipaksa', detail: 'beberapa elemen headline di versi Story terlihat kepotong — perlu safe margin ekstra di layout aslinya supaya adaptasi 9:16 lebih mulus.' },
        { title: 'Rasional desain belum tertulis', detail: 'klien butuh 2-3 kalimat kenapa palet warna & tipografi ini dipilih, supaya ia percaya diri approve dan bisa jelaskan ke timnya sendiri.' },
      ],
      checklist: ['Tambah safe margin supaya adaptasi Story tidak kepotong', 'Sertakan rasional desain singkat per keputusan besar'],
      approvedComment: 'Sekarang seluruh set benar-benar siap dipresentasikan — adaptasi Story mulus dan rasionalnya jelas. Ini level kerja yang layak dapat sertifikat kompetensi!',
    },
  },
  ecommerce: {
    'checkpoint-1': {
      intro: 'Listing-nya udah rapi, tapi ada dua hal yang masih bikin calon pembeli ragu:',
      points: [
        { title: 'Size chart belum lengkap', detail: 'cuma ada ukuran EU, padahal pembeli lokal biasanya cari ukuran dalam cm juga.' },
        { title: 'Kebijakan retur terlalu tersembunyi', detail: 'ditulis singkat di bagian paling bawah — pindahkan ke posisi yang lebih menonjol biar pembeli baru lebih yakin checkout.' },
      ],
      checklist: ['Lengkapi size chart dengan ukuran cm', 'Pindahkan kebijakan retur ke posisi lebih menonjol'],
      approvedComment: 'Size chart-nya sekarang lengkap dan kebijakan retur-nya gampang ketemu. Listing-nya jauh lebih meyakinkan sekarang!',
    },
    'checkpoint-2': {
      intro: 'Ketiga listing sudah dioptimasi dengan baik, tapi sebagai SATU identitas toko masih ada dua hal yang kurang nyambung:',
      points: [
        { title: 'Watermark tidak konsisten di ketiga listing', detail: 'listing 1 dan 2 pakai watermark di pojok kanan bawah, tapi listing 3 di tengah foto — samakan posisinya.' },
        { title: 'Rencana A/B testing belum menyebutkan durasi pengujian', detail: 'perlu tentukan berapa lama pengujian berjalan (mis. 1 minggu) sebelum menyimpulkan hasilnya.' },
      ],
      checklist: ['Samakan posisi watermark di ketiga listing', 'Tentukan durasi pengujian A/B testing'],
      approvedComment: 'Sekarang watermarknya konsisten dan rencana A/B testingnya sudah punya durasi jelas. Listing ini sekarang benar-benar kerasa satu toko yang profesional!',
    },
    'checkpoint-3': {
      intro: 'Audit toko untuk Toko Elektronik Rumahan Jaya sudah menyeluruh, tapi ada dua hal sebelum siap dieksekusi:',
      points: [
        { title: 'Reorder point belum disebutkan angkanya', detail: 'baru ada "akan dipantau", padahal reviewer butuh contoh angka konkret (mis. "restock saat stok tersisa 10 unit").' },
        { title: 'Laporan sebelum-sesudah belum ada pembandingnya', detail: 'perlu data "sebelum" sebagai baseline supaya perbandingan dampak perbaikannya jelas terlihat.' },
      ],
      checklist: ['Tentukan angka reorder point yang konkret', 'Sertakan data baseline "sebelum" di laporan perbandingan'],
      approvedComment: 'Sekarang reorder point-nya konkret dan laporan perbandingannya lengkap dengan baseline. Audit ini siap dieksekusi untuk Toko Elektronik Rumahan Jaya — level kerja yang layak dapat sertifikat kompetensi!',
    },
  },
  marketing: {
    'checkpoint-1': {
      intro: 'Campaign-nya udah punya arah yang bagus, tapi ada dua hal yang perlu disesuaikan sebelum jalan:',
      points: [
        { title: 'CTA masih pakai "Pelajari Lebih Lanjut"', detail: 'padahal objective-nya booking konsultasi — CTA harus langsung arahkan ke form booking.' },
        { title: 'Visual before/after belum ada disclaimer', detail: 'perlu keterangan "hasil bisa bervariasi tiap orang" — penting buat etika iklan kecantikan.' },
      ],
      checklist: ['Ganti CTA agar arahkan langsung ke booking', 'Tambahkan disclaimer hasil bisa bervariasi'],
      approvedComment: 'CTA-nya sekarang tepat sasaran ke booking dan disclaimer-nya sudah ada. Campaign ini siap jalan!',
    },
    'checkpoint-2': {
      intro: 'Rencana optimasi campaign-mu sudah punya arah yang bagus, tapi ada dua hal sebelum siap dijalankan:',
      points: [
        { title: 'Metrik A/B testing belum spesifik', detail: 'baru disebut "akan dibandingkan performanya" — sebutkan metrik konkret seperti jumlah booking atau cost per booking.' },
        { title: 'Rencana retargeting belum menyebutkan pesan yang berbeda', detail: 'perlu contoh copy retargeting yang beda dari iklan awal (mis. tambahan urgency) supaya benar-benar mendorong keputusan akhir.' },
      ],
      checklist: ['Sebutkan metrik konkret untuk A/B testing', 'Tambahkan contoh copy retargeting yang berbeda dari iklan awal'],
      approvedComment: 'Sekarang metrik dan copy retargeting-nya sudah konkret. Rencana optimasi ini siap dijalankan untuk Klinik Kecantikan Glow!',
    },
    'checkpoint-3': {
      intro: 'Strategi campaign multi-channel untuk Resto Steak Rumahan sudah komprehensif, tapi ada dua hal sebelum siap dieksekusi:',
      points: [
        { title: 'Positioning belum dikaitkan jelas ke format iklan', detail: 'perlu jelaskan bagaimana positioning "steak rumahan harga terjangkau" tercermin di visual/copy tiap platform.' },
        { title: 'Jadwal evaluasi berkala belum menyebutkan frekuensinya', detail: 'perlu tentukan seberapa sering evaluasi dilakukan (mis. tiap 3 hari) selama campaign berjalan.' },
      ],
      checklist: ['Kaitkan positioning secara eksplisit ke visual/copy tiap platform', 'Tentukan frekuensi evaluasi berkala yang konkret'],
      approvedComment: 'Sekarang positioning-nya konsisten tercermin di semua platform dan jadwal evaluasinya jelas. Strategi ini siap dieksekusi untuk Resto Steak Rumahan — level kerja yang layak dapat sertifikat kompetensi!',
    },
  },
  ugc: {
    'checkpoint-1': {
      intro: 'Videonya kerasa natural, tapi ada dua hal yang perlu dibenerin sebelum bisa tayang:',
      points: [
        { title: 'Label kerja sama kurang jelas', detail: 'ditaruh di akhir video pakai teks kecil, padahal harus tercantum jelas di awal konten.' },
        { title: 'Bagian before/after terasa dilebih-lebihkan', detail: 'coba tunjukkan hasil apa adanya biar tetap kerasa jujur dan autentik.' },
      ],
      checklist: ['Pindahkan label kerja sama ke awal video', 'Tunjukkan before/after apa adanya'],
      approvedComment: 'Disclosure-nya sekarang jelas dari awal dan before/after-nya kerasa lebih jujur. Ini baru konten yang autentik!',
    },
    'checkpoint-2': {
      intro: 'Ketiga video review-mu sudah bagus satu-satu, tapi sebagai SATU rangkaian kerja sama masih ada dua hal yang kurang nyambung:',
      points: [
        { title: 'Energi/karakter sedikit berbeda di video ketiga', detail: 'video 1 dan 2 terasa santai dan hangat, tapi video 3 terasa lebih formal — jaga nada dasarnya tetap sama.' },
        { title: 'Ringkasan pemahaman kontrak masih terlalu singkat', detail: 'perlu jelaskan lebih detail soal hak penggunaan konten yang dipahami, bukan cuma 1 kalimat umum.' },
      ],
      checklist: ['Samakan energi/karakter di ketiga video', 'Lengkapi ringkasan pemahaman hak penggunaan konten'],
      approvedComment: 'Sekarang karaktermu konsisten di ketiga video dan pemahaman kontraknya lebih lengkap. Ini yang bikin kerja sama jangka panjang terasa profesional!',
    },
    'checkpoint-3': {
      intro: '3 video review untuk Suplemen Herbal Sehat Alami sudah terasa personal, tapi ada dua hal sebelum siap tayang:',
      points: [
        { title: 'Salah satu klaim masih terlalu kuat', detail: 'kalimat "pasti membantu semua orang" perlu diubah jadi pengalaman pribadi seperti "bagi saya cukup membantu" — supaya sesuai etika endorsement kesehatan.' },
        { title: 'Riset kandungan belum tercermin di narasi', detail: 'sebutkan minimal 1 kandungan spesifik dan manfaatnya secara singkat supaya audiens merasa reviewnya benar-benar diriset, bukan asal coba.' },
      ],
      checklist: ['Ubah klaim mutlak jadi pengalaman pribadi', 'Sebutkan minimal 1 kandungan spesifik dalam narasi'],
      approvedComment: 'Sekarang klaimnya sudah etis dan narasinya menunjukkan riset yang mendalam. Video ini siap tayang untuk Suplemen Herbal Sehat Alami — level kerja yang layak dapat sertifikat kompetensi!',
    },
  },
};
