import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AIMentorWidget from '../../components/AIMentorWidget';
import { showToast } from '../../utils/toast';
import { useApp } from '../../context/AppContext';
import { SKILL_MAPS, DEFAULT_SKILL, getSkillMeta, getNodeUnit, toBackendUnitId } from '../../data/skillMaps';
import { REVIEW_FEEDBACK } from '../../data/reviewFeedback';
import { resolveCheckpointBrief, resolveCheckpointFeedback } from '../../utils/checkpointVariant';

const BLUE = '#2b6fff';
const GREEN = '#00c897';
const ORANGE = '#f37219';
const RED = '#e5484d';

const MAX_REVISIONS = 2;
const XP_TABLE = { 0: 150, 1: 120, 2: 100 };
// Deterministic demo script: verdict for the Nth submission (index = revisionCount).
// First submission always comes back "perlu revisi"; the revision after that is approved.
const VERDICT_SCRIPT = ['revisi', 'approved'];

export default function RinaSubmit() {
  const navigate = useNavigate();
  const { checkpointId } = useParams();
  const {
    selectedSkill, addExp, setCompletedNodeIds, setVerificationSubmitted, checkpointVariantIndex,
    mode, submitCheckpoint, refreshSubmissions, refreshUser,
  } = useApp();
  const isReal = mode === 'real';
  const skillId = selectedSkill || DEFAULT_SKILL;
  const skillMap = SKILL_MAPS[skillId] || SKILL_MAPS[DEFAULT_SKILL];
  const skillMeta = getSkillMeta(skillId);
  const checkpointNode = skillMap.nodes.find(n => n.id === checkpointId) || skillMap.nodes.find(n => n.type === 'checkpoint');
  const variantIdx = checkpointVariantIndex[`${skillId}:${checkpointNode?.id}`] ?? 0;
  const brief = resolveCheckpointBrief(skillId, checkpointNode?.id, variantIdx, {
    info: checkpointNode?.info, instruction: checkpointNode?.instruction, briefBullets: checkpointNode?.briefBullets, checklist: checkpointNode?.checklist,
  });
  const checklist = brief.checklist || skillMap.checklist;

  // 'form' | 'submitted' | 'revision-feedback' | 'revision-form' | 'approved-celebrating' | 'approved-result' | 'failed'
  const [view, setView] = useState('form');
  const [revisionCount, setRevisionCount] = useState(0);
  const [uploaded, setUploaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [checkedItems, setCheckedItems] = useState(new Set());
  const [revisionReminders, setRevisionReminders] = useState(new Set());
  const [briefExpanded, setBriefExpanded] = useState(false);
  const [showPrevSubmission, setShowPrevSubmission] = useState(false);

  // Real mode only — the demo's fake-review state machine below never
  // touches these.
  const [selectedFile, setSelectedFile] = useState(null);
  const [contentText, setContentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [realSubmission, setRealSubmission] = useState(null); // latest GET /submission/my row for this checkpoint
  const fileInputRef = useRef(null);

  // Real mode's single free-text reviewer_notes field replaces the canned
  // REVIEW_FEEDBACK copy — same shape (`intro`/`points`/`checklist`/
  // `approvedComment`) so every existing bit of JSX below renders unchanged
  // regardless of which one is active.
  const feedback = isReal
    ? { intro: realSubmission?.reviewer_notes || 'Reviewer belum menuliskan catatan.', points: [], checklist: [], approvedComment: null }
    : resolveCheckpointFeedback(skillId, checkpointNode?.id, variantIdx,
        REVIEW_FEEDBACK[skillId]?.[checkpointNode?.id]
          || REVIEW_FEEDBACK[skillId]?.['checkpoint-1']
          || REVIEW_FEEDBACK[DEFAULT_SKILL]['checkpoint-1']);

  const allChecked = checkedItems.size === checklist.length;

  function simUploadFile() {
    if (isReal) {
      fileInputRef.current?.click();
      return;
    }
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setUploaded(true);
    }, 1800);
  }

  // Real mode only — nothing has actually been uploaded yet at this point,
  // just chosen; the real network call happens on submit.
  function handleFilePicked(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setUploaded(true);
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

  async function submitReal() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await submitCheckpoint(skillId, checkpointNode.id, contentText, selectedFile);
      setRealSubmission(res);
      setRevisionCount(res.revision_count);
      setUploaded(false);
      setSelectedFile(null);
      setView('submitted');
    } catch (err) {
      // The backend auto-flips the previous row to 'failed' server-side and
      // 400s with this exact message once max revisions is hit — that's a
      // real terminal state, not a generic error to retry.
      if (err.message === 'Maksimal revisi tercapai — ulangi unit dari awal') {
        setView('failed');
      } else {
        setSubmitError(err.message || 'Gagal mengirim submission');
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleFirstSubmit() {
    if (isReal) { submitReal(); return; }
    setView('submitted');
  }

  function handleStartRevision() {
    setUploaded(false);
    setUploading(false);
    setSelectedFile(null);
    setView('revision-form');
  }

  function handleSubmitRevision() {
    if (isReal) { submitReal(); return; }
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

  // Real mode only — there's no reviewer-approval API by design (a human
  // flips the row's status directly in Supabase Studio), so this polls
  // GET /submission/my instead of picking a scripted verdict.
  async function handleCheckStatus() {
    setCheckingStatus(true);
    try {
      const rows = await refreshSubmissions();
      const backendUnitId = toBackendUnitId(skillId, checkpointNode.id);
      const row = rows.find(r => r.unit_id === backendUnitId);
      if (!row) return;
      setRealSubmission(row);
      setRevisionCount(row.revision_count);
      if (row.status === 'pending') {
        showToast('Masih dalam review — cek lagi nanti', 'fa-hourglass-half');
      } else if (row.status === 'revision_requested') {
        setView('revision-feedback');
      } else if (row.status === 'approved') {
        await refreshUser(); // syncs XP — the DB trigger already credited it
        setCompletedNodeIds(prev => (prev.includes(nsKey()) ? prev : [...prev, nsKey()]));
        setVerificationSubmitted(true);
        setView('approved-celebrating');
        setTimeout(() => setView('approved-result'), 2000);
      } else if (row.status === 'failed') {
        setView('failed');
      }
    } catch (err) {
      showToast(`Gagal cek status: ${err.message}`, 'fa-triangle-exclamation');
    } finally {
      setCheckingStatus(false);
    }
  }

  // Real mode: check once on landing on 'submitted' in case review already
  // happened elsewhere in the meantime (not full polling, just avoids a
  // stale screen after navigating away and back).
  useEffect(() => {
    if (!(isReal && view === 'submitted')) return;
    const t = setTimeout(() => { handleCheckStatus(); }, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  function handleTryAgain() {
    setView('form');
    setRevisionCount(0);
    setUploaded(false);
    setSelectedFile(null);
    setContentText('');
    setCheckedItems(new Set());
    setRevisionReminders(new Set());
  }

  const xpAmount = isReal && realSubmission?.xp_earned != null
    ? realSubmission.xp_earned
    : XP_TABLE[revisionCount] ?? XP_TABLE[MAX_REVISIONS];

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
        {/* Hidden real-file input — shared by the 'form' and 'revision-form'
            upload dropzones below, both of which just call simUploadFile()
            which .click()s this in real mode instead of faking a delay. */}
        <input ref={fileInputRef} type="file" onChange={handleFilePicked} className="hidden" />

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

            {isReal && (
              <div>
                <h3 className="font-sora font-bold text-sm mb-3" style={{ color: ORANGE }}>Catatan untuk Reviewer (opsional)</h3>
                <textarea
                  value={contentText}
                  onChange={e => setContentText(e.target.value)}
                  placeholder="Ceritakan pendekatan atau konteks tambahan soal hasil kerjamu..."
                  className="w-full rounded-2xl p-4 text-sm font-inter resize-none border-2 focus:outline-none"
                  style={{ borderColor: BLUE, minHeight: 90 }}
                />
              </div>
            )}

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
                  <div className="text-white/90 text-sm font-inter mt-1">{isReal && selectedFile ? selectedFile.name : `Checkpoint_${skillId}_final.zip`}</div>
                </div>
              )}
            </div>

            {submitError && (
              <div className="rounded-xl p-3 text-sm font-inter font-semibold text-center" style={{ background: '#fdecec', color: RED }}>
                {submitError}
              </div>
            )}

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
                  disabled={submitting}
                  className="mx-auto text-white font-bold py-3.5 px-10 rounded-full transition-all text-sm cursor-pointer border-0 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                  style={{ background: GREEN }}
                >
                  {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin-fast" />}
                  {submitting ? 'Mengirim...' : 'Kumpulkan Sekarang'}
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

            {isReal ? (
              <div className="w-full rounded-xl p-4 mt-2 border-2" style={{ background: '#fff', borderColor: '#e5e9f0' }}>
                <div className="text-gray-400 text-[11px] font-inter font-bold uppercase tracking-wide mb-2">Review Sungguhan</div>
                <p className="text-gray-500 text-xs font-inter mb-3">Reviewer manusia perlu buka Supabase Studio dan ubah status submission ini secara manual — belum ada tombol approve otomatis. Cek lagi setelah itu terjadi.</p>
                <button
                  onClick={handleCheckStatus}
                  disabled={checkingStatus}
                  className="w-full text-white font-bold py-3 rounded-full transition-all text-sm cursor-pointer border-0 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ background: ORANGE }}
                >
                  {checkingStatus && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin-fast" />}
                  {checkingStatus ? 'Mengecek...' : 'Cek Status Review'}
                </button>
              </div>
            ) : (
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
            )}

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
              {briefExpanded && brief.briefBullets && (
                <ul className="px-4 pb-4 space-y-1.5 text-xs text-gray-500 list-disc pl-8 leading-relaxed font-inter">
                  {brief.briefBullets.map((b, i) => (
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
                  <div className="text-white/90 text-sm font-inter mt-1">
                    {isReal && selectedFile ? selectedFile.name : `checkpoint_${skillId}_revisi${revisionCount + 1}.zip`}
                  </div>
                </div>
              )}
            </div>

            {submitError && (
              <div className="rounded-xl p-3 text-sm font-inter font-semibold text-center" style={{ background: '#fdecec', color: RED }}>
                {submitError}
              </div>
            )}

            {uploaded && (
              <button
                onClick={handleSubmitRevision}
                disabled={submitting}
                className="mx-auto text-white font-bold py-3.5 px-10 rounded-full transition-all text-sm cursor-pointer border-0 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                style={{ background: GREEN }}
              >
                {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin-fast" />}
                {submitting ? 'Mengirim...' : 'Submit Revisi'}
              </button>
            )}
          </motion.div>
        )}

        {/* ── STATE 3: APPROVED RESULT ── */}
        {view === 'approved-result' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5">
            <div className="flex flex-col items-center text-center gap-2 py-4">
              <div className="text-5xl mb-1">✅</div>
              <h2 className="font-sora font-bold text-2xl" style={{ color: BLUE }}>Tantangan Selesai!</h2>
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
                {skillMeta.label} — Unit {getNodeUnit(checkpointNode.id)} Complete
              </div>
            </div>

            {/* Smart Matching unlock — only fires once, right when the skill map's
                final project checkpoint gets approved (not every checkpoint). */}
            {checkpointNode?.isFinalProject && (
              <motion.button
                onClick={() => navigate('/rina/match')}
                initial={{ opacity: 0, scale: 0.9, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.4, type: 'spring', bounce: 0.45 }}
                className="w-full text-left rounded-2xl p-4 flex items-center gap-4 border-2 cursor-pointer transition-all hover:brightness-105"
                style={{ background: 'rgba(0,200,151,0.08)', borderColor: GREEN }}
              >
                <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 bg-white text-xl">🎯</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-sora font-bold text-sm" style={{ color: GREEN }}>Smart Matching Terbuka!</span>
                    <span className="text-[9px] font-extrabold tracking-wide px-2 py-0.5 rounded-full text-white" style={{ background: GREEN }}>BARU</span>
                  </div>
                  <div className="text-gray-500 text-xs font-inter mt-0.5">
                    Skill map {skillMeta.label} kamu selesai — profilmu sekarang bisa di-match otomatis ke proyek UMKM yang cocok.
                  </div>
                </div>
                <i className="fa-solid fa-chevron-right text-sm shrink-0" style={{ color: GREEN }}></i>
              </motion.button>
            )}

            {revisionCount > 0 && feedback.approvedComment && (
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

            <button
              onClick={() => navigate('/rina/task')}
              className="w-full text-white font-bold py-3.5 rounded-full transition-all text-sm cursor-pointer border-0 hover:brightness-110"
              style={{ background: GREEN }}
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
      <AIMentorWidget node={checkpointNode} stage="tantangan" skillLabel={skillMeta.label} skillId={skillId} light />

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
