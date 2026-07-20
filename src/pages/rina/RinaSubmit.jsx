import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { showToast } from '../../utils/toast';
import { useApp } from '../../context/AppContext';
import { SKILL_MAPS, DEFAULT_SKILL, getSkillMeta } from '../../data/skillMaps';

const MAX_REVISIONS = 2;
const XP_TABLE = { 0: 150, 1: 120, 2: 100 };
// Deterministic demo script: verdict for the Nth submission (index = revisionCount).
// First submission always comes back "perlu revisi"; the revision after that is approved.
const VERDICT_SCRIPT = ['revisi', 'approved'];

// Reviewer feedback per skill — Desain Grafis gets the full authored pass,
// the other 5 get a lighter but coherent pass tied to their checkpoint brief.
const REVIEW_FEEDBACK = {
  social: {
    intro: 'Kontennya sudah oke buat Warung Kopi Abadi, tapi ada dua hal yang bikin efeknya belum maksimal:',
    points: [
      { title: 'Hook di 2 detik pertama masih kurang kuat', detail: 'kalimat pembukanya generic, belum langsung menonjolkan menu baru Es Kopi Gula Aren.' },
      { title: 'CTA di akhir caption kurang konkret', detail: '"yuk dicoba" terlalu umum — ganti dengan ajakan spesifik seperti "Mampir & tag kita di story-mu!"' },
    ],
    checklist: ['Perkuat hook di 2 detik pertama', 'Ganti CTA jadi lebih konkret'],
    approvedComment: 'Hook-nya sekarang jauh lebih nendang dan CTA-nya jelas ngajak orang bertindak. Nice improvement!',
  },
  video: {
    intro: 'Videonya udah niat banget, tapi masih ada dua hal yang bikin retention-nya belum optimal:',
    points: [
      { title: 'Hook belum muncul di detik 0', detail: 'masih ada intro logo ~2 detik di depan — penonton keburu skip sebelum lihat produknya.' },
      { title: 'Teks overlay harga & lokasi kurang kebaca', detail: 'ukurannya kekecilan dan warnanya nyaris menyatu dengan background video.' },
    ],
    checklist: ['Pindahkan hook ke detik 0', 'Perbesar & perjelas teks overlay harga/lokasi'],
    approvedComment: 'Hook-nya sekarang langsung nonjok di detik 0 dan teks overlay-nya jauh lebih kebaca. Mantap!',
  },
  desain: {
    intro: 'Feed Instagram-mu sudah rapi dan warna-nya sesuai brief. Tapi ada dua hal yang perlu diperbaiki:',
    points: [
      { title: 'Hierarchy visual belum jelas', detail: 'mata tidak tahu harus lihat ke mana dulu. Nama produk perlu lebih dominan dari elemen dekoratif.' },
      { title: 'Font yang dipakai di caption terlalu tipis', detail: 'terlalu tipis untuk dibaca di ukuran mobile. Coba ganti ke weight yang lebih tebal atau ukuran minimal 14pt.' },
    ],
    checklist: ['Perbaiki hierarchy visual', 'Ganti font ke weight lebih tebal'],
    approvedComment: 'Revisi kamu sudah jauh lebih baik. Hierarchy visualnya sekarang jelas dan font-nya lebih readable di mobile. Good job!',
  },
  ecommerce: {
    intro: 'Listing-nya udah rapi, tapi ada dua hal yang masih bikin calon pembeli ragu:',
    points: [
      { title: 'Size chart belum lengkap', detail: 'cuma ada ukuran EU, padahal pembeli lokal biasanya cari ukuran dalam cm juga.' },
      { title: 'Kebijakan retur terlalu tersembunyi', detail: 'ditulis singkat di bagian paling bawah — pindahkan ke posisi yang lebih menonjol biar pembeli baru lebih yakin checkout.' },
    ],
    checklist: ['Lengkapi size chart dengan ukuran cm', 'Pindahkan kebijakan retur ke posisi lebih menonjol'],
    approvedComment: 'Size chart-nya sekarang lengkap dan kebijakan retur-nya gampang ketemu. Listing-nya jauh lebih meyakinkan sekarang!',
  },
  marketing: {
    intro: 'Campaign-nya udah punya arah yang bagus, tapi ada dua hal yang perlu disesuaikan sebelum jalan:',
    points: [
      { title: 'CTA masih pakai "Pelajari Lebih Lanjut"', detail: 'padahal objective-nya booking konsultasi — CTA harus langsung arahkan ke form booking.' },
      { title: 'Visual before/after belum ada disclaimer', detail: 'perlu keterangan "hasil bisa bervariasi tiap orang" — penting buat etika iklan kecantikan.' },
    ],
    checklist: ['Ganti CTA agar arahkan langsung ke booking', 'Tambahkan disclaimer hasil bisa bervariasi'],
    approvedComment: 'CTA-nya sekarang tepat sasaran ke booking dan disclaimer-nya sudah ada. Campaign ini siap jalan!',
  },
  ugc: {
    intro: 'Videonya kerasa natural, tapi ada dua hal yang perlu dibenerin sebelum bisa tayang:',
    points: [
      { title: 'Label kerja sama kurang jelas', detail: 'ditaruh di akhir video pakai teks kecil, padahal harus tercantum jelas di awal konten.' },
      { title: 'Bagian before/after terasa dilebih-lebihkan', detail: 'coba tunjukkan hasil apa adanya biar tetap kerasa jujur dan autentik.' },
    ],
    checklist: ['Pindahkan label kerja sama ke awal video', 'Tunjukkan before/after apa adanya'],
    approvedComment: 'Disclosure-nya sekarang jelas dari awal dan before/after-nya kerasa lebih jujur. Ini baru konten yang autentik!',
  },
};

export default function RinaSubmit() {
  const navigate = useNavigate();
  const { selectedSkill, addExp, setCompletedNodeIds, setVerificationSubmitted } = useApp();
  const skillId = selectedSkill || DEFAULT_SKILL;
  const skillMap = SKILL_MAPS[skillId] || SKILL_MAPS[DEFAULT_SKILL];
  const skillMeta = getSkillMeta(skillId);
  const checklist = skillMap.checklist;
  const checkpointNode = skillMap.nodes.find(n => n.type === 'checkpoint');
  const feedback = REVIEW_FEEDBACK[skillId] || REVIEW_FEEDBACK[DEFAULT_SKILL];

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
    <div className="min-h-screen bg-[#0F0F1A] flex flex-col">
      {/* ── TOP BAR ── */}
      <header className="sticky top-0 z-30 h-14 flex items-center px-4 md:px-6 bg-[#1A1A2E]/95 backdrop-blur border-b border-white/5 flex-shrink-0">
        <button
          onClick={() => navigate('/rina/task')}
          className="flex items-center gap-2 text-white/60 hover:text-white text-sm font-inter transition-colors bg-transparent border-0 cursor-pointer"
        >
          <i className="fa-solid fa-arrow-left"></i>
          <span>Peta Misi</span>
        </button>
        <h1 className="text-white text-xs sm:text-sm font-bold font-sora truncate absolute left-1/2 -translate-x-1/2 max-w-[55%] text-center">
          {skillMeta.label} · Tantangan Checkpoint
        </h1>
      </header>

      <main className="flex-1 w-full max-w-[680px] mx-auto px-4 py-10 pb-16">
        {/* ── FORM: initial submission ── */}
        {view === 'form' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
            <div>
              <h2 className="text-white font-sora font-bold text-xl mb-1">Kumpulkan Hasil Kerja</h2>
              <p className="text-white/50 text-sm font-inter">Pastikan hasil checkpoint-mu untuk {skillMeta.label} sudah memenuhi semua ketentuan sebelum dikirim ke reviewer.</p>
            </div>

            <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <i className="fa-solid fa-file-lines text-purple"></i>
                <h3 className="text-white font-sora font-bold text-sm">Checklist Sebelum Submit</h3>
              </div>
              <div className="space-y-3">
                {checklist.map((item, i) => (
                  <label key={i} className="flex items-start gap-3 cursor-pointer group">
                    <div
                      onClick={() => toggleCheck(i)}
                      className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 border-2 transition-all ${
                        checkedItems.has(i) ? 'bg-purple border-purple' : 'border-white/20 group-hover:border-purple/60'
                      }`}
                    >
                      {checkedItems.has(i) && <i className="fa-solid fa-check text-white text-[9px]"></i>}
                    </div>
                    <span className={`text-sm font-inter leading-relaxed ${checkedItems.has(i) ? 'text-white/30 line-through' : 'text-white/70'}`}>
                      {item}
                    </span>
                  </label>
                ))}
              </div>
              {allChecked && (
                <div className="mt-4 flex items-center gap-2 text-green-400 text-sm font-semibold font-inter">
                  <i className="fa-solid fa-circle-check"></i>
                  Semua checklist terpenuhi!
                </div>
              )}
            </div>

            <div>
              <h3 className="text-white font-sora font-bold text-sm mb-3">Upload File Hasil Kerja</h3>

              {!uploaded && !uploading && (
                <div
                  onClick={simUploadFile}
                  className="border-2 border-dashed border-white/15 rounded-2xl p-10 text-center hover:border-purple/50 hover:bg-purple/[0.03] transition-all cursor-pointer group"
                >
                  <div className="w-14 h-14 bg-purple/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-purple/20 transition-colors">
                    <i className="fa-solid fa-upload text-purple text-lg"></i>
                  </div>
                  <div className="font-semibold text-white/80 font-inter mb-1">Drag & drop atau klik untuk upload</div>
                  <div className="text-white/30 text-sm font-inter">Dokumen, gambar, atau video hasil checkpoint</div>
                  <div className="mt-4 inline-block bg-purple/15 text-purple text-xs px-4 py-2 rounded-full font-inter font-semibold">
                    Pilih File
                  </div>
                </div>
              )}

              {uploading && (
                <div className="border-2 border-purple/30 rounded-2xl p-10 text-center bg-purple/5">
                  <div className="w-12 h-12 border-4 border-purple border-t-transparent rounded-full animate-spin-fast mx-auto mb-4" />
                  <div className="font-semibold text-purple font-inter">Mengupload file…</div>
                  <div className="text-white/30 text-sm font-inter mt-1">Mohon tunggu</div>
                </div>
              )}

              {uploaded && (
                <div className="border-2 border-green-500/30 rounded-2xl overflow-hidden">
                  <div className="bg-gradient-to-br from-indigo to-purple h-40 flex items-center justify-center relative">
                    <div className="text-center">
                      <div className="text-5xl mb-2">{skillMeta.emoji}</div>
                      <div className="text-white font-sora font-bold text-lg">{checkpointNode?.title || 'Checkpoint Task'}</div>
                      <div className="text-white/70 text-xs font-inter mt-1">{skillMeta.label}</div>
                    </div>
                    <div className="absolute top-3 right-3 bg-green-500/90 rounded-full px-2.5 py-1 flex items-center gap-1">
                      <i className="fa-solid fa-check text-white text-[10px]"></i>
                      <span className="text-white text-xs font-semibold font-inter">Uploaded</span>
                    </div>
                  </div>
                  <div className="bg-[#1A1A2E] p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                      <i className="fa-solid fa-image text-green-400"></i>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white/80 font-inter text-sm">checkpoint_{skillId}_final</div>
                      <div className="text-xs text-white/30 font-inter mt-0.5">Siap dikirim ke reviewer</div>
                    </div>
                    <div className="flex items-center gap-1 text-green-400 text-xs font-semibold font-inter">
                      <i className="fa-solid fa-check"></i>
                      Siap
                    </div>
                  </div>
                </div>
              )}
            </div>

            {uploaded && (
              <div className="flex flex-col gap-4">
                <div className="bg-purple/10 border border-purple/30 rounded-xl p-4 flex items-center gap-3">
                  <i className="fa-solid fa-user-check text-purple text-lg"></i>
                  <div>
                    <div className="font-semibold text-purple font-inter text-sm">Dinilai human reviewer</div>
                    <div className="text-white/50 text-xs font-inter">Praktisi industri berpengalaman akan review karyamu dan kasih feedback langsung.</div>
                  </div>
                </div>
                <button
                  onClick={handleFirstSubmit}
                  className="w-full bg-purple hover:brightness-110 text-white font-bold py-3.5 rounded-xl transition-all text-sm cursor-pointer border-0"
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
            <h2 className="text-white font-sora font-bold text-xl">
              {revisionCount === 0 ? 'Tantanganmu Sudah Dikirim!' : 'Revisimu Sudah Dikirim!'}
            </h2>
            <p className="text-white/50 text-sm font-inter">Human reviewer akan memeriksa karyamu</p>

            <div className="w-full bg-[#1A1A2E] border border-white/10 rounded-2xl p-5 text-left space-y-2.5 mt-2">
              <div className="flex items-start gap-2.5 text-sm text-white/70 font-inter">
                <span>⏱</span> Estimasi review: 1 hari kerja
              </div>
              <div className="flex items-start gap-2.5 text-sm text-white/70 font-inter">
                <span>👤</span> Direview oleh praktisi industri berpengalaman
              </div>
              <div className="flex items-start gap-2.5 text-sm text-white/70 font-inter">
                <span>🔔</span> Kamu akan dapat notifikasi setelah review selesai
              </div>
            </div>

            <div className="w-full bg-sky-500/10 border border-sky-500/20 rounded-xl p-4 text-left">
              <p className="text-sky-300 text-sm font-inter leading-relaxed">
                ❄️ Streak kamu di-freeze selama menunggu review. Tenang, streak tidak akan putus.
              </p>
            </div>

            <div className="w-full bg-white/[0.02] border border-white/10 rounded-xl p-4 mt-2">
              <div className="text-white/40 text-[11px] font-inter font-bold uppercase tracking-wide mb-2">⚡ Demo Mode</div>
              <p className="text-white/50 text-xs font-inter mb-3">Dalam demo ini, kita bisa langsung simulasikan hasil review reviewer tanpa menunggu.</p>
              <button
                onClick={handleSimulateReview}
                className="w-full bg-amber-500 hover:brightness-110 text-white font-bold py-3 rounded-xl transition-all text-sm cursor-pointer border-0"
              >
                Simulasikan Keputusan Reviewer
              </button>
            </div>

            <button
              onClick={() => navigate('/rina/task')}
              className="w-full border border-white/15 text-white/70 hover:bg-white/5 font-semibold py-3 rounded-xl transition-all text-sm cursor-pointer bg-transparent mt-1"
            >
              Kembali ke Peta Misi
            </button>
          </motion.div>
        )}

        {/* ── STATE 2A: REVISION REQUESTED ── */}
        {view === 'revision-feedback' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple/15 border border-purple/30 flex items-center justify-center text-purple font-bold text-xs font-sora shrink-0">RV</div>
              <div className="flex-1">
                <div className="text-white text-sm font-semibold font-inter">Reviewer · {skillMeta.label} Specialist</div>
                <div className="text-white/30 text-xs font-inter">1 hari yang lalu</div>
              </div>
              <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2.5 py-1 rounded-full font-inter shrink-0">PERLU REVISI</span>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/25 rounded-2xl p-5">
              <h3 className="text-amber-300 font-sora font-bold text-sm mb-3">Feedback dari Reviewer:</h3>
              <p className="text-white/70 text-sm font-inter leading-relaxed mb-3">{feedback.intro}</p>
              <ol className="space-y-3">
                {feedback.points.map((p, i) => (
                  <li key={i} className="text-sm text-white/70 font-inter leading-relaxed flex gap-2">
                    <span className="text-amber-400 font-bold shrink-0">{i + 1}.</span>
                    <span><strong className="text-white/90">{p.title}</strong> — {p.detail}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-2.5 text-sm text-white/70 font-inter">
                <span>📝</span> Revisi ke-{revisionCount + 1} dari maksimal {MAX_REVISIONS}
              </div>
              <div className="flex items-center gap-2.5 text-sm text-white/70 font-inter">
                <span>⏱</span> Selesaikan dalam 3 hari
              </div>
              <div className="flex items-center gap-2.5 text-sm text-white/70 font-inter">
                <span>✨</span> Masih bisa dapat +{XP_TABLE[revisionCount + 1] ?? XP_TABLE[MAX_REVISIONS]} XP kalau approved di revisi ini
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleStartRevision}
                className="w-full bg-purple hover:brightness-110 text-white font-bold py-3.5 rounded-xl transition-all text-sm cursor-pointer border-0"
              >
                Mulai Revisi
              </button>
              <button
                onClick={() => setShowPrevSubmission(v => !v)}
                className="w-full border border-white/15 text-white/60 hover:bg-white/5 font-semibold py-3 rounded-xl transition-all text-sm cursor-pointer bg-transparent"
              >
                Lihat Submission Sebelumnya
              </button>
            </div>

            {showPrevSubmission && (
              <div className="border-2 border-white/10 rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-br from-indigo to-purple h-32 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-1">{skillMeta.emoji}</div>
                    <div className="text-white/70 text-xs font-inter">{checkpointNode?.title}</div>
                  </div>
                </div>
                <div className="bg-[#1A1A2E] p-3 text-xs text-white/40 font-inter">checkpoint_{skillId}_final (submission awal)</div>
              </div>
            )}
          </motion.div>
        )}

        {/* ── STATE 2B: REVISION FORM ── */}
        {view === 'revision-form' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5">
            <div>
              <span className="text-[10px] font-bold text-purple bg-purple/15 border border-purple/30 px-2.5 py-1 rounded-full font-inter">
                SUBMISSION REVISI KE-{revisionCount + 1}
              </span>
            </div>

            {/* Collapsed brief, expandable */}
            <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl overflow-hidden">
              <button
                onClick={() => setBriefExpanded(v => !v)}
                className="w-full flex items-center justify-between p-4 bg-transparent border-0 cursor-pointer"
              >
                <span className="text-white text-sm font-semibold font-inter">{checkpointNode?.briefLabel}</span>
                <i className={`fa-solid fa-chevron-down text-white/40 text-xs transition-transform ${briefExpanded ? 'rotate-180' : ''}`}></i>
              </button>
              {briefExpanded && checkpointNode?.briefBullets && (
                <ul className="px-4 pb-4 space-y-1.5 text-xs text-white/50 list-disc pl-8 leading-relaxed font-inter">
                  {checkpointNode.briefBullets.map((b, i) => (
                    <li key={i}><strong className="text-white/70">{b.strong}</strong>{b.rest}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Reviewer feedback, always visible */}
            <div className="bg-amber-500/5 border border-amber-500/25 rounded-2xl p-5">
              <h3 className="text-amber-300 font-sora font-bold text-sm mb-3">Feedback dari Reviewer:</h3>
              <p className="text-white/70 text-sm font-inter leading-relaxed mb-3">{feedback.intro}</p>
              <ol className="space-y-3">
                {feedback.points.map((p, i) => (
                  <li key={i} className="text-sm text-white/70 font-inter leading-relaxed flex gap-2">
                    <span className="text-amber-400 font-bold shrink-0">{i + 1}.</span>
                    <span><strong className="text-white/90">{p.title}</strong> — {p.detail}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Reminder checklist (non-mandatory) */}
            <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl p-5">
              <h3 className="text-white/70 font-sora font-bold text-xs mb-3 uppercase tracking-wide">Reminder Revisi</h3>
              <div className="space-y-2.5">
                {feedback.checklist.map((item, i) => (
                  <label key={i} className="flex items-start gap-3 cursor-pointer group">
                    <div
                      onClick={() => toggleReminder(i)}
                      className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 border-2 transition-all ${
                        revisionReminders.has(i) ? 'bg-purple border-purple' : 'border-white/20 group-hover:border-purple/60'
                      }`}
                    >
                      {revisionReminders.has(i) && <i className="fa-solid fa-check text-white text-[9px]"></i>}
                    </div>
                    <span className={`text-sm font-inter leading-relaxed ${revisionReminders.has(i) ? 'text-white/30 line-through' : 'text-white/70'}`}>
                      {item}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Upload area — same as first submission */}
            <div>
              <h3 className="text-white font-sora font-bold text-sm mb-3">Upload File Hasil Revisi</h3>

              {!uploaded && !uploading && (
                <div
                  onClick={simUploadFile}
                  className="border-2 border-dashed border-white/15 rounded-2xl p-10 text-center hover:border-purple/50 hover:bg-purple/[0.03] transition-all cursor-pointer group"
                >
                  <div className="w-14 h-14 bg-purple/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-purple/20 transition-colors">
                    <i className="fa-solid fa-upload text-purple text-lg"></i>
                  </div>
                  <div className="font-semibold text-white/80 font-inter mb-1">Drag & drop atau klik untuk upload</div>
                  <div className="text-white/30 text-sm font-inter">Versi revisi dari hasil checkpoint-mu</div>
                  <div className="mt-4 inline-block bg-purple/15 text-purple text-xs px-4 py-2 rounded-full font-inter font-semibold">
                    Pilih File
                  </div>
                </div>
              )}

              {uploading && (
                <div className="border-2 border-purple/30 rounded-2xl p-10 text-center bg-purple/5">
                  <div className="w-12 h-12 border-4 border-purple border-t-transparent rounded-full animate-spin-fast mx-auto mb-4" />
                  <div className="font-semibold text-purple font-inter">Mengupload file…</div>
                </div>
              )}

              {uploaded && (
                <div className="border-2 border-green-500/30 rounded-2xl p-4 flex items-center gap-3 bg-[#1A1A2E]">
                  <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center shrink-0">
                    <i className="fa-solid fa-image text-green-400"></i>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-white/80 font-inter text-sm">checkpoint_{skillId}_revisi{revisionCount + 1}</div>
                    <div className="text-xs text-white/30 font-inter mt-0.5">Siap dikirim ke reviewer</div>
                  </div>
                  <i className="fa-solid fa-check text-green-400"></i>
                </div>
              )}
            </div>

            {uploaded && (
              <button
                onClick={handleSubmitRevision}
                className="w-full bg-purple hover:brightness-110 text-white font-bold py-3.5 rounded-xl transition-all text-sm cursor-pointer border-0"
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
              <div className="text-5xl mb-1">✅</div>
              <h2 className="text-white font-sora font-bold text-2xl">Tantangan Selesai!</h2>
            </div>

            <div className="bg-purple/10 border border-purple/30 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-11 h-11 bg-purple/20 rounded-full flex items-center justify-center shrink-0">
                <i className="fa-solid fa-bolt text-purple"></i>
              </div>
              <div>
                <div className="font-sora font-bold text-purple text-base">
                  +{xpAmount} XP {revisionCount === 0 ? '(approved langsung)' : `(approved setelah ${revisionCount} revisi)`}
                </div>
                <div className="text-white/50 text-xs font-inter">Kerja bagus menyelesaikan checkpoint ini!</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple/20 to-indigo/20 border border-purple/30 rounded-2xl p-4 flex items-center gap-3">
              <span className="text-2xl">{skillMeta.emoji}</span>
              <div className="text-white font-sora font-bold text-sm">{skillMeta.label} — Level 1 Complete</div>
            </div>

            {revisionCount > 0 && (
              <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-purple/15 border border-purple/30 flex items-center justify-center text-purple font-bold text-xs font-sora shrink-0">RV</div>
                  <div>
                    <div className="text-white text-sm font-semibold font-inter">Reviewer · {skillMeta.label} Specialist</div>
                    <div className="text-white/30 text-xs font-inter">Baru saja</div>
                  </div>
                </div>
                <p className="text-white/70 text-sm font-inter leading-relaxed italic">"{feedback.approvedComment}"</p>
              </div>
            )}

            <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-green-400 text-sm font-semibold font-inter mb-3">
                <i className="fa-solid fa-circle-check"></i>
                Ditambahkan ke Verified Portfolio kamu
              </div>
              <div className="flex items-center gap-3 bg-white/[0.03] border border-white/5 rounded-xl p-3">
                <div className="w-11 h-11 rounded-lg bg-white/5 flex items-center justify-center text-xl shrink-0">{skillMeta.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-xs font-semibold font-inter truncate">{checkpointNode?.title}</div>
                  <div className="text-white/40 text-[11px] font-inter">{skillMeta.label} · Human Reviewed</div>
                </div>
                <i className="fa-solid fa-circle-check text-green-400"></i>
              </div>
            </div>

            <button
              onClick={() => navigate('/rina/task')}
              className="w-full bg-purple hover:brightness-110 text-white font-bold py-3.5 rounded-xl transition-all text-sm cursor-pointer border-0"
            >
              Lanjut ke Peta Misi
            </button>
          </motion.div>
        )}

        {/* ── STATE 4: GAGAL / MAX REVISIONS ── */}
        {view === 'failed' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5">
            <div className="flex flex-col items-center text-center gap-2 py-4">
              <div className="text-5xl mb-1">🔄</div>
              <h2 className="text-white font-sora font-bold text-xl">Ulangi Tantangan Ini</h2>
              <p className="text-white/50 text-sm font-inter">Tidak apa-apa — ini bagian dari proses belajar</p>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/25 rounded-2xl p-5">
              <h3 className="text-amber-300 font-sora font-bold text-sm mb-3">Feedback Final dari Reviewer:</h3>
              <p className="text-white/70 text-sm font-inter leading-relaxed mb-3">{feedback.intro}</p>
              <ol className="space-y-3">
                {feedback.points.map((p, i) => (
                  <li key={i} className="text-sm text-white/70 font-inter leading-relaxed flex gap-2">
                    <span className="text-amber-400 font-bold shrink-0">{i + 1}.</span>
                    <span><strong className="text-white/90">{p.title}</strong> — {p.detail}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl p-4">
              <p className="text-white/60 text-sm font-inter leading-relaxed">
                Kamu sudah mencapai batas {MAX_REVISIONS} revisi untuk tantangan ini. Pelajari feedback di atas dan coba lagi dari awal.
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleTryAgain}
                className="w-full bg-purple hover:brightness-110 text-white font-bold py-3.5 rounded-xl transition-all text-sm cursor-pointer border-0"
              >
                Coba Lagi
              </button>
              <button
                onClick={() => showToast('💬 Yuk, tanya di AI Mentor pojok kanan bawah', 'fa-robot')}
                className="w-full border border-white/15 text-white/60 hover:bg-white/5 font-semibold py-3 rounded-xl transition-all text-sm cursor-pointer bg-transparent"
              >
                Tanya AI Mentor tentang feedback ini
              </button>
            </div>
          </motion.div>
        )}
      </main>

      {/* ── APPROVED CELEBRATION OVERLAY ── */}
      <AnimatePresence>
        {view === 'approved-celebrating' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0F0F1A]/95 backdrop-blur-md z-[70] flex items-center justify-center overflow-hidden"
          >
            {['🎉', '✨', '🎊', '⭐', '💜', '🎉', '✨', '🎊'].map((emoji, i) => (
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
              <h2 className="text-white font-sora font-extrabold text-4xl">DISETUJUI! ✓</h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
