import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AIMentorWidget from '../../components/AIMentorWidget';
import { showToast } from '../../utils/toast';
import { useApp } from '../../context/AppContext';
import { SKILL_MAPS, DEFAULT_SKILL, getSkillMeta, getNodeUnit } from '../../data/skillMaps';

const BLUE = '#2b6fff';
const GREEN = '#00c897';
const ORANGE = '#f37219';
const RED = '#e5484d';

const MAX_REVISIONS = 2;
const XP_TABLE = { 0: 150, 1: 120, 2: 100 };
// Deterministic demo script: verdict for the Nth submission (index = revisionCount).
// First submission always comes back "perlu revisi"; the revision after that is approved.
const VERDICT_SCRIPT = ['revisi', 'approved'];

// Reviewer feedback per skill, nested by checkpoint id — Desain Grafis is the
// golden path with all 3 checkpoints authored, the other 5 skills only have
// checkpoint-1 (their Skill Maps stop there for now).
const REVIEW_FEEDBACK = {
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

export default function RinaSubmit() {
  const navigate = useNavigate();
  const { checkpointId } = useParams();
  const { selectedSkill, addExp, setCompletedNodeIds, setVerificationSubmitted, issueCertificate } = useApp();
  const skillId = selectedSkill || DEFAULT_SKILL;
  const skillMap = SKILL_MAPS[skillId] || SKILL_MAPS[DEFAULT_SKILL];
  const skillMeta = getSkillMeta(skillId);
  const checkpointNode = skillMap.nodes.find(n => n.id === checkpointId) || skillMap.nodes.find(n => n.type === 'checkpoint');
  const checklist = checkpointNode?.checklist || skillMap.checklist;
  const feedback = REVIEW_FEEDBACK[skillId]?.[checkpointNode?.id]
    || REVIEW_FEEDBACK[skillId]?.['checkpoint-1']
    || REVIEW_FEEDBACK[DEFAULT_SKILL]['checkpoint-1'];
  const isFinalProject = !!checkpointNode?.isFinalProject;

  // 'form' | 'submitted' | 'revision-feedback' | 'revision-form' | 'approved-celebrating' | 'approved-result' | 'failed'
  const [view, setView] = useState('form');
  const [revisionCount, setRevisionCount] = useState(0);
  const [uploaded, setUploaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [checkedItems, setCheckedItems] = useState(new Set());
  const [revisionReminders, setRevisionReminders] = useState(new Set());
  const [briefExpanded, setBriefExpanded] = useState(false);
  const [showPrevSubmission, setShowPrevSubmission] = useState(false);

  const allChecked = checkedItems.size === checklist.length;

  function simUploadFile() {
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setUploaded(true);
    }, 1800);
  }

  function toggleCheck(i) {
    setCheckedItems(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  function toggleReminder(i) {
    setRevisionReminders(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  function nsKey() {
    return `${skillId}:${checkpointNode.id}`;
  }

  function handleFirstSubmit() {
    setView('submitted');
  }

  function handleStartRevision() {
    setUploaded(false);
    setUploading(false);
    setView('revision-form');
  }

  function handleSubmitRevision() {
    setRevisionCount(c => c + 1);
    setUploaded(false);
    setView('submitted');
  }

  function triggerApproved() {
    const xpAmount = XP_TABLE[revisionCount] ?? XP_TABLE[MAX_REVISIONS];
    addExp(xpAmount);
    setCompletedNodeIds(prev => [...prev, nsKey()]);
    setVerificationSubmitted(true);
    if (isFinalProject) issueCertificate(skillId);
    setView('approved-celebrating');
    setTimeout(() => setView('approved-result'), 2000);
  }

  function handleSimulateReview() {
    const verdict = VERDICT_SCRIPT[revisionCount] ?? 'approved';
    if (verdict === 'approved') {
      triggerApproved();
    } else if (revisionCount + 1 >= MAX_REVISIONS) {
      setView('failed');
    } else {
      setView('revision-feedback');
    }
  }

  function handleTryAgain() {
    setView('form');
    setRevisionCount(0);
    setUploaded(false);
    setCheckedItems(new Set());
    setRevisionReminders(new Set());
  }

  const xpAmount = XP_TABLE[revisionCount] ?? XP_TABLE[MAX_REVISIONS];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ── TOP BAR ── */}
      <header className="sticky top-0 z-30 h-14 flex items-center px-4 md:px-6 flex-shrink-0" style={{ background: BLUE }}>
        <button
          onClick={() => navigate('/rina/task')}
          className="flex items-center gap-2 text-white hover:text-white/80 text-sm font-bold font-inter transition-colors bg-transparent border-0 cursor-pointer"
        >
          <i className="fa-solid fa-arrow-left"></i>
          <span>Peta Misi</span>
        </button>
        <h1 className="text-white text-xs sm:text-sm font-bold font-sora truncate absolute left-1/2 -translate-x-1/2 max-w-[55%] text-center">
          {skillMeta.label} - Node {checkpointNode?.id} - Tantangan Checkpoint
        </h1>
        <div className="flex items-center gap-0.5 bg-white border border-rose-300 py-1.5 px-2.5 rounded-full ml-auto">
          {[...Array(5)].map((_, i) => (
            <i key={i} className="fa-solid fa-heart text-xs" style={{ color: i < 4 ? '#f43f5e' : '#e5e7eb' }}></i>
          ))}
        </div>
      </header>

      <main className="flex-1 w-full max-w-[720px] mx-auto px-4 py-8 pb-16">
        {/* ── FORM: initial submission ── */}
        {view === 'form' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
            <div>
              <h2 className="font-sora font-bold text-xl mb-1" style={{ color: BLUE }}>Kumpulkan Hasil Kerja</h2>
              <p className="text-sm font-inter font-medium" style={{ color: BLUE }}>Pastikan hasil checkpoint-mu untuk {skillMeta.label} sudah memenuhi semua ketentuan sebelum dikirim ke reviewer.</p>
            </div>

            <div className="rounded-3xl p-6" style={{ background: '#f5f8fb' }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: GREEN }}>
                  <i className="fa-solid fa-file-lines text-white text-xs"></i>
                </div>
                <h3 className="font-sora font-bold text-sm" style={{ color: ORANGE }}>Checklist Sebelum Submit</h3>
              </div>
              <div className="space-y-3">
                {checklist.map((item, i) => (
                  <label key={i} className="flex items-start gap-3 cursor-pointer group">
                    <div
                      onClick={() => toggleCheck(i)}
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border-2 transition-all"
                      style={checkedItems.has(i) ? { borderColor: GREEN, color: GREEN } : { borderColor: BLUE }}
                    >
                      {checkedItems.has(i) && <i className="fa-solid fa-check text-[9px]" style={{ color: GREEN }}></i>}
                    </div>
                    <span
                      className="text-sm font-inter font-medium leading-relaxed"
                      style={checkedItems.has(i) ? { color: GREEN, textDecoration: 'line-through' } : { color: BLUE }}
                    >
                      {item}
                    </span>
                  </label>
                ))}
              </div>
              {allChecked && (
                <div className="mt-4 flex items-center gap-2 text-sm font-semibold font-inter" style={{ color: GREEN }}>
                  <i className="fa-solid fa-circle-check"></i>
                  Semua checklist terpenuhi!
                </div>
              )}
            </div>

            <div>
              <h3 className="font-sora font-bold text-sm mb-3" style={{ color: ORANGE }}>Upload File Hasil Kerja</h3>

              {!uploaded && !uploading && (
                <div
                  onClick={simUploadFile}
                  className="rounded-2xl p-10 text-center transition-all cursor-pointer border-[3px] border-dashed"
                  style={{ background: '#cfddfb', borderColor: '#0052ff' }}
                >
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: '#fff' }}>
                    <i className="fa-solid fa-upload text-lg" style={{ color: '#0052ff' }}></i>
                  </div>
                  <div className="font-semibold font-inter mb-1" style={{ color: '#0052ff' }}>Drag & drop atau klik untuk upload</div>
                  <div className="text-sm font-inter" style={{ color: '#5b7bb8' }}>Dokumen, gambar, atau video hasil checkpoint</div>
                  <div className="mt-4 inline-block text-white text-xs px-4 py-2 rounded-full font-inter font-semibold" style={{ background: '#0052ff' }}>
                    Pilih File
                  </div>
                </div>
              )}

              {uploading && (
                <div className="rounded-2xl p-10 text-center border-[3px] border-dashed" style={{ background: '#cfddfb', borderColor: '#0052ff' }}>
                  <div className="w-12 h-12 border-4 rounded-full animate-spin-fast mx-auto mb-4" style={{ borderColor: '#0052ff', borderTopColor: 'transparent' }} />
                  <div className="font-semibold font-inter" style={{ color: '#0052ff' }}>Mengupload file…</div>
                  <div className="text-sm font-inter mt-1" style={{ color: '#5b7bb8' }}>Mohon tunggu</div>
                </div>
              )}

              {uploaded && (
                <div className="rounded-2xl p-8 text-center border-2 border-dashed" style={{ background: GREEN, borderColor: GREEN }}>
                  <div className="text-white font-bold font-inter">Your Submission has been Uploaded</div>
                  <div className="text-white/90 text-sm font-inter mt-1">Checkpoint_{skillId}_final.zip</div>
                </div>
              )}
            </div>

            {uploaded && (
              <div className="flex flex-col gap-4">
                <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: '#f5f8fb' }}>
                  <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0">
                    <i className="fa-solid fa-user text-gray-400"></i>
                  </div>
                  <div>
                    <div className="font-semibold font-inter text-sm" style={{ color: BLUE }}>Dinilai human reviewer</div>
                    <div className="text-gray-500 text-xs font-inter">Praktisi industri berpengalaman akan review karyamu dan kasih feedback langsung.</div>
                  </div>
                </div>
                <button
                  onClick={handleFirstSubmit}
                  className="mx-auto text-white font-bold py-3.5 px-10 rounded-full transition-all text-sm cursor-pointer border-0 hover:brightness-110"
                  style={{ background: GREEN }}
                >
                  Kumpulkan Sekarang
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* ── STATE 1: SUBMITTED ── */}
        {view === 'submitted' && (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center gap-4 py-10">
            <div className="text-5xl">📬</div>
            <h2 className="font-sora font-bold text-xl" style={{ color: BLUE }}>
              {revisionCount === 0 ? 'Tantanganmu Sudah Dikirim!' : 'Revisimu Sudah Dikirim!'}
            </h2>
            <p className="text-gray-500 text-sm font-inter">Human reviewer akan memeriksa karyamu</p>

            <div className="w-full rounded-2xl p-5 text-left space-y-2.5 mt-2" style={{ background: '#f5f8fb' }}>
              <div className="flex items-start gap-2.5 text-sm font-inter" style={{ color: '#1a1a1a' }}>
                <span>⏱</span> Estimasi review: 1 hari kerja
              </div>
              <div className="flex items-start gap-2.5 text-sm font-inter" style={{ color: '#1a1a1a' }}>
                <span>👤</span> Direview oleh praktisi industri berpengalaman
              </div>
              <div className="flex items-start gap-2.5 text-sm font-inter" style={{ color: '#1a1a1a' }}>
                <span>🔔</span> Kamu akan dapat notifikasi setelah review selesai
              </div>
            </div>

            <div className="w-full rounded-xl p-4 text-left border-2" style={{ background: '#eef2fe', borderColor: BLUE }}>
              <p className="text-sm font-inter leading-relaxed" style={{ color: BLUE }}>
                ❄️ Streak kamu di-freeze selama menunggu review. Tenang, streak tidak akan putus.
              </p>
            </div>

            <div className="w-full rounded-xl p-4 mt-2 border-2" style={{ background: '#fff', borderColor: '#e5e9f0' }}>
              <div className="text-gray-400 text-[11px] font-inter font-bold uppercase tracking-wide mb-2">⚡ Demo Mode</div>
              <p className="text-gray-500 text-xs font-inter mb-3">Dalam demo ini, kita bisa langsung simulasikan hasil review reviewer tanpa menunggu.</p>
              <button
                onClick={handleSimulateReview}
                className="w-full text-white font-bold py-3 rounded-full transition-all text-sm cursor-pointer border-0 hover:brightness-110"
                style={{ background: ORANGE }}
              >
                Simulasikan Keputusan Reviewer
              </button>
            </div>

            <button
              onClick={() => navigate('/rina/task')}
              className="w-full font-semibold py-3 rounded-full transition-all text-sm cursor-pointer bg-transparent mt-1 border-2"
              style={{ color: BLUE, borderColor: BLUE }}
            >
              Kembali ke Peta Misi
            </button>
          </motion.div>
        )}

        {/* ── STATE 2A: REVISION REQUESTED ── */}
        {view === 'revision-feedback' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <img src="/reviewer.jpg" alt="Reviewer" className="w-10 h-10 rounded-full object-cover shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-bold font-inter" style={{ color: BLUE }}>Reviewer - {skillMeta.label} Specialist</div>
                <div className="italic text-xs font-inter font-semibold" style={{ color: BLUE }}>1 hari yang lalu</div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full font-inter shrink-0 border-2" style={{ color: RED, borderColor: RED, background: '#fdecec' }}>PERLU REVISI</span>
            </div>

            <div className="rounded-2xl p-5" style={{ background: '#f5f8fb' }}>
              <h3 className="font-sora font-bold text-sm mb-3" style={{ color: ORANGE }}>Feedback dari Reviewer:</h3>
              <p className="text-sm font-inter leading-relaxed mb-3 text-gray-600">{feedback.intro}</p>
              <ul className="space-y-2">
                {feedback.points.map((p, i) => (
                  <li key={i} className="text-sm font-inter leading-relaxed flex gap-2">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: BLUE }}></span>
                    <span className="text-gray-600"><strong style={{ color: BLUE }}>{p.title}</strong> - {p.detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl p-5 space-y-2" style={{ background: '#f5f8fb' }}>
              <div className="text-sm font-bold font-inter" style={{ color: GREEN }}>Revisi ke {revisionCount + 1} dari maksimal {MAX_REVISIONS}</div>
              <div className="flex items-center gap-2 text-sm font-inter" style={{ color: GREEN }}>
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: GREEN }}></span> Selesaikan dalam 3 hari
              </div>
              <div className="flex items-center gap-2 text-sm font-inter" style={{ color: GREEN }}>
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: GREEN }}></span> Masih bisa dapat +{XP_TABLE[revisionCount + 1] ?? XP_TABLE[MAX_REVISIONS]} XP kalau approved di revisi ini
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleStartRevision}
                className="w-full text-white font-bold py-3.5 rounded-full transition-all text-sm cursor-pointer border-0 hover:brightness-110"
                style={{ background: ORANGE }}
              >
                Mulai Revisi
              </button>
              <button
                onClick={() => setShowPrevSubmission(v => !v)}
                className="w-full text-white font-semibold py-3 rounded-full transition-all text-sm cursor-pointer border-0 hover:brightness-110"
                style={{ background: GREEN }}
              >
                Lihat Submission Sebelumnya
              </button>
            </div>

            {showPrevSubmission && (
              <div className="rounded-2xl overflow-hidden border-2" style={{ borderColor: '#e5e9f0' }}>
                <div className="h-32 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${BLUE}, ${GREEN})` }}>
                  <div className="text-center">
                    <div className="text-4xl mb-1">{skillMeta.emoji}</div>
                    <div className="text-white/90 text-xs font-inter">{checkpointNode?.title}</div>
                  </div>
                </div>
                <div className="p-3 text-xs text-gray-400 font-inter" style={{ background: '#f5f8fb' }}>checkpoint_{skillId}_final (submission awal)</div>
              </div>
            )}
          </motion.div>
        )}

        {/* ── STATE 2B: REVISION FORM ── */}
        {view === 'revision-form' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5">
            <div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full font-inter border-2" style={{ color: BLUE, borderColor: BLUE, background: '#eef2fe' }}>
                SUBMISSION REVISI KE-{revisionCount + 1}
              </span>
            </div>

            {/* Collapsed brief, expandable */}
            <div className="rounded-2xl overflow-hidden border-2" style={{ borderColor: BLUE, background: '#fff' }}>
              <button
                onClick={() => setBriefExpanded(v => !v)}
                className="w-full flex items-center justify-between p-4 bg-transparent border-0 cursor-pointer"
              >
                <span className="text-sm font-semibold font-inter" style={{ color: BLUE }}>{checkpointNode?.briefLabel}</span>
                <i className={`fa-solid fa-chevron-down text-xs transition-transform ${briefExpanded ? 'rotate-180' : ''}`} style={{ color: BLUE }}></i>
              </button>
              {briefExpanded && checkpointNode?.briefBullets && (
                <ul className="px-4 pb-4 space-y-1.5 text-xs text-gray-500 list-disc pl-8 leading-relaxed font-inter">
                  {checkpointNode.briefBullets.map((b, i) => (
                    <li key={i}><strong style={{ color: '#1a1a1a' }}>{b.strong}</strong>{b.rest}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Reviewer feedback, always visible */}
            <div className="rounded-2xl p-5" style={{ background: '#f5f8fb' }}>
              <h3 className="font-sora font-bold text-sm mb-3" style={{ color: ORANGE }}>Feedback dari Reviewer:</h3>
              <p className="text-sm font-inter leading-relaxed mb-3 text-gray-600">{feedback.intro}</p>
              <ul className="space-y-2">
                {feedback.points.map((p, i) => (
                  <li key={i} className="text-sm font-inter leading-relaxed flex gap-2">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: BLUE }}></span>
                    <span className="text-gray-600"><strong style={{ color: BLUE }}>{p.title}</strong> - {p.detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Reminder checklist (non-mandatory) */}
            <div className="rounded-2xl p-5" style={{ background: '#f5f8fb' }}>
              <h3 className="font-sora font-bold text-xs mb-3 uppercase tracking-wide" style={{ color: ORANGE }}>Reminder Revisi</h3>
              <div className="space-y-2.5">
                {feedback.checklist.map((item, i) => (
                  <label key={i} className="flex items-start gap-3 cursor-pointer group">
                    <div
                      onClick={() => toggleReminder(i)}
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border-2 transition-all"
                      style={revisionReminders.has(i) ? { borderColor: GREEN } : { borderColor: BLUE }}
                    >
                      {revisionReminders.has(i) && <i className="fa-solid fa-check text-[9px]" style={{ color: GREEN }}></i>}
                    </div>
                    <span
                      className="text-sm font-inter font-medium leading-relaxed"
                      style={revisionReminders.has(i) ? { color: GREEN, textDecoration: 'line-through' } : { color: BLUE }}
                    >
                      {item}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Upload area — same as first submission */}
            <div>
              <h3 className="font-sora font-bold text-sm mb-3" style={{ color: ORANGE }}>Upload File Hasil Revisi</h3>

              {!uploaded && !uploading && (
                <div
                  onClick={simUploadFile}
                  className="rounded-2xl p-10 text-center transition-all cursor-pointer border-[3px] border-dashed"
                  style={{ background: '#cfddfb', borderColor: '#0052ff' }}
                >
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-white">
                    <i className="fa-solid fa-upload text-lg" style={{ color: '#0052ff' }}></i>
                  </div>
                  <div className="font-semibold font-inter mb-1" style={{ color: '#0052ff' }}>Drag & drop atau klik untuk upload</div>
                  <div className="text-sm font-inter" style={{ color: '#5b7bb8' }}>Versi revisi dari hasil checkpoint-mu</div>
                  <div className="mt-4 inline-block text-white text-xs px-4 py-2 rounded-full font-inter font-semibold" style={{ background: '#0052ff' }}>
                    Pilih File
                  </div>
                </div>
              )}

              {uploading && (
                <div className="rounded-2xl p-10 text-center border-[3px] border-dashed" style={{ background: '#cfddfb', borderColor: '#0052ff' }}>
                  <div className="w-12 h-12 border-4 rounded-full animate-spin-fast mx-auto mb-4" style={{ borderColor: '#0052ff', borderTopColor: 'transparent' }} />
                  <div className="font-semibold font-inter" style={{ color: '#0052ff' }}>Mengupload file…</div>
                </div>
              )}

              {uploaded && (
                <div className="rounded-2xl p-8 text-center border-2 border-dashed" style={{ background: GREEN, borderColor: GREEN }}>
                  <div className="text-white font-bold font-inter">Your Submission has been Uploaded</div>
                  <div className="text-white/90 text-sm font-inter mt-1">checkpoint_{skillId}_revisi{revisionCount + 1}.zip</div>
                </div>
              )}
            </div>

            {uploaded && (
              <button
                onClick={handleSubmitRevision}
                className="mx-auto text-white font-bold py-3.5 px-10 rounded-full transition-all text-sm cursor-pointer border-0 hover:brightness-110"
                style={{ background: GREEN }}
              >
                Submit Revisi
              </button>
            )}
          </motion.div>
        )}

        {/* ── STATE 3: APPROVED RESULT ── */}
        {view === 'approved-result' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5">
            <div className="flex flex-col items-center text-center gap-2 py-4">
              <div className="text-5xl mb-1">{isFinalProject ? '🎓' : '✅'}</div>
              <h2 className="font-sora font-bold text-2xl" style={{ color: BLUE }}>{isFinalProject ? 'Proyek Akhir Selesai!' : 'Tantangan Selesai!'}</h2>
              {isFinalProject && (
                <p className="text-sm font-inter font-semibold" style={{ color: GREEN }}>Sertifikat Kompetensi {skillMeta.label}-mu sudah terbit 🎉</p>
              )}
            </div>

            <div className="rounded-2xl p-4 flex items-center gap-4 border-2" style={{ background: '#eef2fe', borderColor: BLUE }}>
              <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 bg-white">
                <i className="fa-solid fa-bolt" style={{ color: ORANGE }}></i>
              </div>
              <div>
                <div className="font-sora font-bold text-base" style={{ color: BLUE }}>
                  +{xpAmount} XP {revisionCount === 0 ? '(approved langsung)' : `(approved setelah ${revisionCount} revisi)`}
                </div>
                <div className="text-gray-500 text-xs font-inter">Kerja bagus menyelesaikan checkpoint ini!</div>
              </div>
            </div>

            <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: `linear-gradient(135deg, ${BLUE}, ${GREEN})` }}>
              <span className="text-2xl">{skillMeta.emoji}</span>
              <div className="font-sora font-bold text-sm text-white">
                {skillMeta.label} — {isFinalProject ? 'Sertifikasi Selesai' : `Unit ${getNodeUnit(checkpointNode.id)} Complete`}
              </div>
            </div>

            {revisionCount > 0 && (
              <div className="rounded-2xl p-5" style={{ background: '#f5f8fb' }}>
                <div className="flex items-center gap-3 mb-3">
                  <img src="/reviewer.jpg" alt="Reviewer" className="w-9 h-9 rounded-full object-cover shrink-0" />
                  <div>
                    <div className="text-sm font-bold font-inter" style={{ color: BLUE }}>Reviewer - {skillMeta.label} Specialist</div>
                    <div className="italic text-xs font-inter font-semibold" style={{ color: BLUE }}>Baru saja</div>
                  </div>
                </div>
                <p className="text-sm font-inter leading-relaxed italic text-gray-600">"{feedback.approvedComment}"</p>
              </div>
            )}

            <div className="rounded-2xl p-5" style={{ background: '#f5f8fb' }}>
              <div className="flex items-center gap-2 text-sm font-semibold font-inter mb-3" style={{ color: GREEN }}>
                <i className="fa-solid fa-circle-check"></i>
                Ditambahkan ke Verified Portfolio kamu
              </div>
              <div className="flex items-center gap-3 rounded-xl p-3 bg-white">
                <div className="w-11 h-11 rounded-lg flex items-center justify-center text-xl shrink-0" style={{ background: '#e1e8f2' }}>{skillMeta.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold font-inter truncate" style={{ color: '#1a1a1a' }}>{checkpointNode?.title}</div>
                  <div className="text-gray-400 text-[11px] font-inter">{skillMeta.label} · Human Reviewed</div>
                </div>
                <i className="fa-solid fa-circle-check" style={{ color: GREEN }}></i>
              </div>
            </div>

            {isFinalProject ? (
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => navigate(`/rina/sertifikat/${skillId}`)}
                  className="w-full text-white font-bold py-3.5 rounded-full transition-all text-sm cursor-pointer border-0 hover:brightness-110"
                  style={{ background: `linear-gradient(90deg, ${BLUE}, ${GREEN})` }}
                >
                  🎓 Lihat Sertifikatmu
                </button>
                <button
                  onClick={() => navigate('/rina/task')}
                  className="w-full font-semibold py-3 rounded-full transition-all text-sm cursor-pointer bg-transparent border-2"
                  style={{ color: BLUE, borderColor: BLUE }}
                >
                  Kembali ke Peta Misi
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/rina/task')}
                className="w-full text-white font-bold py-3.5 rounded-full transition-all text-sm cursor-pointer border-0 hover:brightness-110"
                style={{ background: GREEN }}
              >
                Lanjut ke Peta Misi
              </button>
            )}
          </motion.div>
        )}

        {/* ── STATE 4: GAGAL / MAX REVISIONS ── */}
        {view === 'failed' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5">
            <div className="flex flex-col items-center text-center gap-2 py-4">
              <div className="text-5xl mb-1">🔄</div>
              <h2 className="font-sora font-bold text-xl" style={{ color: BLUE }}>Ulangi Tantangan Ini</h2>
              <p className="text-gray-500 text-sm font-inter">Tidak apa-apa — ini bagian dari proses belajar</p>
            </div>

            <div className="rounded-2xl p-5" style={{ background: '#f5f8fb' }}>
              <h3 className="font-sora font-bold text-sm mb-3" style={{ color: ORANGE }}>Feedback Final dari Reviewer:</h3>
              <p className="text-sm font-inter leading-relaxed mb-3 text-gray-600">{feedback.intro}</p>
              <ul className="space-y-2">
                {feedback.points.map((p, i) => (
                  <li key={i} className="text-sm font-inter leading-relaxed flex gap-2">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: BLUE }}></span>
                    <span className="text-gray-600"><strong style={{ color: BLUE }}>{p.title}</strong> - {p.detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl p-4" style={{ background: '#f5f8fb' }}>
              <p className="text-sm font-inter leading-relaxed text-gray-600">
                Kamu sudah mencapai batas {MAX_REVISIONS} revisi untuk tantangan ini. Pelajari feedback di atas dan coba lagi dari awal.
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleTryAgain}
                className="w-full text-white font-bold py-3.5 rounded-full transition-all text-sm cursor-pointer border-0 hover:brightness-110"
                style={{ background: GREEN }}
              >
                Coba Lagi
              </button>
              <button
                onClick={() => showToast('💬 Yuk, tanya di AI Mentor pojok kanan bawah', 'fa-robot')}
                className="w-full font-semibold py-3 rounded-full transition-all text-sm cursor-pointer bg-transparent border-2"
                style={{ color: BLUE, borderColor: BLUE }}
              >
                Tanya AI Mentor tentang feedback ini
              </button>
            </div>
          </motion.div>
        )}
      </main>

      {/* ── AI MENTOR FLOATING WIDGET ── */}
      <AIMentorWidget node={checkpointNode} stage="tantangan" skillLabel={skillMeta.label} light />

      {/* ── APPROVED CELEBRATION OVERLAY ── */}
      <AnimatePresence>
        {view === 'approved-celebrating' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/95 backdrop-blur-md z-[70] flex items-center justify-center overflow-hidden"
          >
            {['🎉', '✨', '🎊', '⭐', '💚', '🎉', '✨', '🎊'].map((emoji, i) => (
              <motion.span
                key={i}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0.6 }}
                animate={{
                  x: Math.cos((i / 8) * Math.PI * 2) * 180,
                  y: Math.sin((i / 8) * Math.PI * 2) * 180 - 40,
                  opacity: 0,
                  scale: 1.2,
                }}
                transition={{ duration: 1.6, ease: 'easeOut' }}
                className="absolute text-3xl"
              >
                {emoji}
              </motion.span>
            ))}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="text-center"
            >
              <div className="text-6xl mb-4">✓</div>
              <h2 className="font-sora font-extrabold text-4xl" style={{ color: GREEN }}>DISETUJUI! ✓</h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
