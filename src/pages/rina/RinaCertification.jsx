import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AIMentorWidget from '../../components/AIMentorWidget';
import { useApp } from '../../context/AppContext';
import { SKILL_MAPS, DEFAULT_SKILL, getSkillMeta } from '../../data/skillMaps';
import { formatRupiah } from '../../data/jasaData';
import { REVIEW_FEEDBACK } from '../../data/reviewFeedback';
import { pickVariantIndex, resolveCheckpointBrief, resolveCheckpointFeedback } from '../../utils/checkpointVariant';

const BLUE = '#2b6fff';
const GREEN = '#00c897';
const ORANGE = '#f37219';
const RED = '#e5484d';

const CERT_XP = 200;
const EXAM_FEE_ORIGINAL = 650000;
const EXAM_FEE = 200000;

export default function RinaCertification() {
  const navigate = useNavigate();
  const { skillId: skillIdParam } = useParams();
  const { addExp, completedNodeIds, certificateEarnedAt, issueCertificate, checkpointVariantIndex, setCheckpointVariantIndex } = useApp();
  const skillId = SKILL_MAPS[skillIdParam] ? skillIdParam : DEFAULT_SKILL;
  const skillMap = SKILL_MAPS[skillId];
  const skillMeta = getSkillMeta(skillId);
  const finalCheckpoint = skillMap.nodes.find(n => n.type === 'checkpoint' && n.isFinalProject);

  // The exam gets its own variant slot (separate from the checkpoint's own
  // regular submission) — retaking a failed exam re-rolls it, so a second
  // attempt doesn't feel like a rerun of the exact same brief.
  const variantKey = `${skillId}:exam`;
  const variantIdx = checkpointVariantIndex[variantKey] ?? 0;
  const brief = resolveCheckpointBrief(skillId, finalCheckpoint?.id, variantIdx, {
    info: finalCheckpoint?.info, instruction: finalCheckpoint?.instruction, briefBullets: finalCheckpoint?.briefBullets, checklist: finalCheckpoint?.checklist,
  });
  const checklist = brief.checklist || [];
  const feedback = resolveCheckpointFeedback(skillId, finalCheckpoint?.id, variantIdx,
    REVIEW_FEEDBACK[skillId]?.['checkpoint-3'] || REVIEW_FEEDBACK[DEFAULT_SKILL]['checkpoint-1']);

  const alreadyCertified = !!certificateEarnedAt[skillId];
  // The exam only opens once the skill map's final checkpoint is actually
  // done — this menu shouldn't even be reachable until then. Already-earned
  // certificates just go straight to the certificate itself.
  const eligible = finalCheckpoint && completedNodeIds.includes(`${skillId}:${finalCheckpoint.id}`);

  // 'exam-payment' | 'exam-form' | 'submitted' | 'approved-celebrating' | 'approved-result' | 'exam-failed'
  const [view, setView] = useState('exam-payment');
  const [paying, setPaying] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [checkedItems, setCheckedItems] = useState(new Set());

  // Only gate entry at the initial payment gate. Once the user has started
  // the exam through this page, passing it flips `alreadyCertified` via our
  // own issueCertificate() call — that must not yank them away from the
  // celebration/result screen they're already looking at.
  useEffect(() => {
    if (view !== 'exam-payment') return;
    if (alreadyCertified) { navigate(`/rina/sertifikat/${skillId}`, { replace: true }); return; }
    if (!eligible) navigate('/rina/task', { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alreadyCertified, eligible, view]);

  useEffect(() => {
    if (checkpointVariantIndex[variantKey] === undefined) {
      setCheckpointVariantIndex(prev => ({ ...prev, [variantKey]: pickVariantIndex(skillId, finalCheckpoint?.id) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variantKey]);

  if (view === 'exam-payment' && (!eligible || alreadyCertified)) return null;

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

  function handlePayAndStartExam() {
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      setView('exam-form');
    }, 1500);
  }

  function handleFirstSubmit() {
    setView('submitted');
  }

  function triggerApproved() {
    addExp(CERT_XP);
    issueCertificate(skillId);
    setView('approved-celebrating');
    setTimeout(() => setView('approved-result'), 2000);
  }

  // A real certification exam only has two outcomes — lulus or gagal, no
  // "needs revision" — the presenter picks the outcome directly for the demo.
  function handleExamVerdict(verdict) {
    if (verdict === 'approved') {
      triggerApproved();
    } else {
      setView('exam-failed');
    }
  }

  // Failing the paid exam means retaking it — like a real certification,
  // that means paying the fee again, not just "try again for free".
  function handleRetakeExam() {
    setView('exam-payment');
    setUploaded(false);
    setCheckedItems(new Set());
    setCheckpointVariantIndex(prev => ({ ...prev, [variantKey]: pickVariantIndex(skillId, finalCheckpoint?.id) }));
  }

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
          {skillMeta.label} - Ujian Rekam Kerja Terverifikasi
        </h1>
      </header>

      <main className="flex-1 w-full max-w-[720px] mx-auto px-4 py-8 pb-16">
        {/* ── EXAM GATE: paid certification exam intro ── */}
        {view === 'exam-payment' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
            <div className="flex flex-col items-center text-center gap-2 py-2">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-1" style={{ background: '#eef2fe' }}>
                <i className="fa-solid fa-graduation-cap text-2xl" style={{ color: BLUE }}></i>
              </div>
              <h2 className="font-sora font-bold text-2xl" style={{ color: BLUE }}>Ujian Rekam Kerja Terverifikasi {skillMeta.label}</h2>
              <p className="text-sm font-inter text-gray-500 max-w-md">
                Kamu sudah menyelesaikan semua unit — langkah terakhir adalah ujian yang menguji semua yang sudah kamu pelajari dari <strong style={{ color: '#1a1a1a' }}>Unit 1 sampai Unit 3</strong>. Hasilnya menentukan apakah kamu lulus dan dapat Rekam Kerja Terverifikasi resmi.
              </p>
            </div>

            <div className="rounded-2xl p-5" style={{ background: '#f5f8fb' }}>
              <h3 className="font-sora font-bold text-sm mb-3" style={{ color: ORANGE }}>Yang Kamu Dapat</h3>
              <ul className="space-y-2.5">
                {[
                  'Ujian komprehensif lintas Unit 1–3, bukan materi terakhir saja',
                  'Direview langsung oleh senior specialist, bukan reviewer biasa',
                  'Rekam Kerja Terverifikasi resmi dari WADAH kalau lulus',
                  'Badge "Certified" tampil di profil publikmu ke UMKM',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm font-inter text-gray-600">
                    <i className="fa-solid fa-circle-check mt-0.5" style={{ color: GREEN }}></i>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl p-6 text-center border-2" style={{ background: '#eef2fe', borderColor: BLUE }}>
              <div className="text-xs font-inter font-bold uppercase tracking-wide mb-1" style={{ color: BLUE }}>Biaya Ujian Rekam Kerja Terverifikasi</div>
              <div className="flex items-center justify-center gap-2.5">
                <span className="font-inter text-lg text-gray-400 line-through">{formatRupiah(EXAM_FEE_ORIGINAL)}</span>
                <span className="font-sora font-extrabold text-3xl" style={{ color: BLUE }}>{formatRupiah(EXAM_FEE)}</span>
              </div>
              <div className="text-xs font-inter text-gray-500 mt-1">Sekali bayar per percobaan ujian</div>
            </div>

            <div className="rounded-xl p-4 border-2" style={{ background: '#fff', borderColor: '#e5e9f0' }}>
              <div className="text-gray-400 text-[11px] font-inter font-bold uppercase tracking-wide mb-1.5">⚡ Demo Mode</div>
              <p className="text-gray-500 text-xs font-inter">Pembayaran ini simulasi untuk keperluan demo — tidak ada transaksi nyata yang terjadi.</p>
            </div>

            <button
              onClick={handlePayAndStartExam}
              disabled={paying}
              className="w-full text-white font-bold py-3.5 rounded-full transition-all text-sm cursor-pointer border-0 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: ORANGE }}
            >
              {paying ? (
                <>
                  <span className="w-4 h-4 border-2 rounded-full animate-spin-fast" style={{ borderColor: '#fff', borderTopColor: 'transparent' }} />
                  Memproses pembayaran…
                </>
              ) : (
                <>Bayar & Mulai Ujian</>
              )}
            </button>
            <button
              onClick={() => navigate('/rina/task')}
              className="w-full font-semibold py-3 rounded-full transition-all text-sm cursor-pointer bg-transparent border-2"
              style={{ color: BLUE, borderColor: BLUE }}
            >
              Kembali ke Peta Misi
            </button>
          </motion.div>
        )}

        {/* ── EXAM FORM ── */}
        {view === 'exam-form' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
            <div>
              <h2 className="font-sora font-bold text-xl mb-1" style={{ color: BLUE }}>Kumpulkan Hasil Ujian</h2>
              <p className="text-sm font-inter font-medium" style={{ color: BLUE }}>Pastikan hasil ujian Rekam Kerja Terverifikasi {skillMeta.label}-mu sudah memenuhi semua ketentuan sebelum dikirim ke senior specialist.</p>
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
              <h3 className="font-sora font-bold text-sm mb-3" style={{ color: ORANGE }}>Upload File Hasil Ujian</h3>

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
                  <div className="text-sm font-inter" style={{ color: '#5b7bb8' }}>Dokumen, gambar, atau video hasil ujian</div>
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
                  <div className="text-white/90 text-sm font-inter mt-1">Ujian_{skillId}_final.zip</div>
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
                    <div className="font-semibold font-inter text-sm" style={{ color: BLUE }}>Dinilai senior specialist</div>
                    <div className="text-gray-500 text-xs font-inter">Praktisi industri senior akan review hasil ujianmu dan kasih feedback langsung.</div>
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
            <h2 className="font-sora font-bold text-xl" style={{ color: BLUE }}>Hasil Ujianmu Sudah Dikirim!</h2>
            <p className="text-gray-500 text-sm font-inter">Senior specialist akan memeriksa hasil ujianmu</p>

            <div className="w-full rounded-2xl p-5 text-left space-y-2.5 mt-2" style={{ background: '#f5f8fb' }}>
              <div className="flex items-start gap-2.5 text-sm font-inter" style={{ color: '#1a1a1a' }}>
                <span>⏱</span> Estimasi review: 1 hari kerja
              </div>
              <div className="flex items-start gap-2.5 text-sm font-inter" style={{ color: '#1a1a1a' }}>
                <span>👤</span> Direview oleh senior specialist berpengalaman
              </div>
              <div className="flex items-start gap-2.5 text-sm font-inter" style={{ color: '#1a1a1a' }}>
                <span>🔔</span> Kamu akan dapat notifikasi setelah review selesai
              </div>
            </div>

            <div className="w-full rounded-xl p-4 mt-2 border-2" style={{ background: '#fff', borderColor: '#e5e9f0' }}>
              <div className="text-gray-400 text-[11px] font-inter font-bold uppercase tracking-wide mb-2">⚡ Demo Mode</div>
              <p className="text-gray-500 text-xs font-inter mb-3">Ini ujian Rekam Kerja Terverifikasi — pilih langsung hasilnya buat demo, kayak ujian sertifikasi profesional yang beneran bisa gagal.</p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleExamVerdict('approved')}
                  className="w-full text-white font-bold py-3 rounded-full transition-all text-sm cursor-pointer border-0 hover:brightness-110"
                  style={{ background: GREEN }}
                >
                  Lulus
                </button>
                <button
                  onClick={() => handleExamVerdict('gagal')}
                  className="w-full text-white font-bold py-3 rounded-full transition-all text-sm cursor-pointer border-0 hover:brightness-110"
                  style={{ background: RED }}
                >
                  Gagal Ujian
                </button>
              </div>
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

        {/* ── STATE 3: APPROVED RESULT ── */}
        {view === 'approved-result' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5">
            <div className="flex flex-col items-center text-center gap-2 py-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-1" style={{ background: '#eef2fe' }}>
                <i className="fa-solid fa-graduation-cap text-2xl" style={{ color: BLUE }}></i>
              </div>
              <h2 className="font-sora font-bold text-2xl" style={{ color: BLUE }}>Ujian Rekam Kerja Terverifikasi Lulus!</h2>
              <p className="text-sm font-inter font-semibold" style={{ color: GREEN }}>Rekam Kerja Terverifikasi {skillMeta.label}-mu sudah terbit</p>
            </div>

            <div className="rounded-2xl p-4 flex items-center gap-4 border-2" style={{ background: '#eef2fe', borderColor: BLUE }}>
              <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 bg-white">
                <i className="fa-solid fa-bolt" style={{ color: ORANGE }}></i>
              </div>
              <div>
                <div className="font-sora font-bold text-base" style={{ color: BLUE }}>+{CERT_XP} XP</div>
                <div className="text-gray-500 text-xs font-inter">Kerja bagus menyelesaikan ujian Rekam Kerja Terverifikasi ini!</div>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => navigate(`/rina/sertifikat/${skillId}`)}
                className="w-full text-white font-bold py-3.5 rounded-full transition-all text-sm cursor-pointer border-0 hover:brightness-110"
                style={{ background: `linear-gradient(90deg, ${BLUE}, ${GREEN})` }}
              >
                Lihat Sertifikatmu
              </button>
              <button
                onClick={() => navigate('/rina/task')}
                className="w-full font-semibold py-3 rounded-full transition-all text-sm cursor-pointer bg-transparent border-2"
                style={{ color: BLUE, borderColor: BLUE }}
              >
                Kembali ke Peta Misi
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STATE 4: GAGAL UJIAN SERTIFIKASI ── */}
        {view === 'exam-failed' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5">
            <div className="flex flex-col items-center text-center gap-2 py-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-1" style={{ background: '#fdecec' }}>
                <i className="fa-solid fa-circle-xmark text-2xl" style={{ color: RED }}></i>
              </div>
              <h2 className="font-sora font-bold text-xl" style={{ color: BLUE }}>Belum Lulus Ujian Rekam Kerja Terverifikasi</h2>
              <p className="text-gray-500 text-sm font-inter max-w-sm">Tidak apa-apa — banyak profesional juga nggak lulus di percobaan pertama. Pelajari feedback di bawah, lalu coba lagi.</p>
            </div>

            <div className="rounded-2xl p-5" style={{ background: '#f5f8fb' }}>
              <h3 className="font-sora font-bold text-sm mb-3" style={{ color: ORANGE }}>Feedback dari Senior Specialist:</h3>
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

            <div className="rounded-xl p-4 border-2" style={{ background: '#fdecec', borderColor: RED }}>
              <p className="text-sm font-inter leading-relaxed" style={{ color: RED }}>
                Ujian ulang butuh pembayaran {formatRupiah(EXAM_FEE)} lagi — sama seperti ujian sertifikasi profesional pada umumnya.
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleRetakeExam}
                className="w-full text-white font-bold py-3.5 rounded-full transition-all text-sm cursor-pointer border-0 hover:brightness-110"
                style={{ background: ORANGE }}
              >
                Ambil Ujian Ulang ({formatRupiah(EXAM_FEE)})
              </button>
              <button
                onClick={() => navigate('/rina/task')}
                className="w-full font-semibold py-3 rounded-full transition-all text-sm cursor-pointer bg-transparent border-2"
                style={{ color: BLUE, borderColor: BLUE }}
              >
                Kembali ke Peta Misi
              </button>
            </div>
          </motion.div>
        )}
      </main>

      {/* ── AI MENTOR FLOATING WIDGET ── */}
      <AIMentorWidget node={finalCheckpoint} stage="sertifikasi" skillLabel={skillMeta.label} skillId={skillId} light />

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
              <h2 className="font-sora font-extrabold text-4xl" style={{ color: GREEN }}>LULUS! ✓</h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
