import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { getTalentBySlug, formatRupiah } from '../../data/jasaData';

const BLUE = '#2b6fff';
const GREEN = '#00c897';
const ORANGE = '#f37219';

const PROTECTIONS = [
  'Semua komunikasi via platform WADAH',
  'Dana escrow dikunci per bulan',
  'Dispute resolution tersedia 24/7',
  'Tidak ada transaksi di luar app',
];

const PAYMENT_METHODS = [
  { id: 'bank', label: 'Transfer Bank', icon: 'fa-building-columns' },
  { id: 'qris', label: 'QRIS', icon: 'fa-qrcode' },
  { id: 'va', label: 'Virtual Account', icon: 'fa-wallet' },
];

function parseBulanCount(durasi) {
  const match = /^(\d+)\s*Bulan$/.exec(durasi || '');
  return match ? Number(match[1]) : 1;
}

export default function KontrakFinalPage() {
  const navigate = useNavigate();
  const { talentSlug } = useParams();
  const { activeProject, setActiveProject } = useApp();
  const talent = getTalentBySlug(talentSlug);

  const [phase, setPhase] = useState('review'); // review | paying | signing | celebrating | active
  const [paymentMethod, setPaymentMethod] = useState('bank');

  // Escrow status once the contract is active — held (money sits with WADAH)
  // → submitted (talent sent work, via chat) → released (UMKM approved,
  // explicit click required; this is the one step that must never be
  // automatic — see handleApproveWork).
  const [escrowStatus, setEscrowStatus] = useState('held'); // held | submitted | released
  const [releaseInfo, setReleaseInfo] = useState(null); // { txId, timestamp }

  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    if (!talent) navigate('/jasa', { replace: true });
  }, [talent, navigate]);

  // Chat is reachable the moment the contract goes active — it's a support
  // channel alongside the escrow flow, not a gate at the end of it.
  useEffect(() => {
    if (chatOpen && chatMessages.length === 0) {
      const t = setTimeout(() => {
        setChatMessages([{ role: 'talent', text: 'Halo! Makasih udah setuju kerja sama 🙌 Aku mulai kerjain proyeknya sekarang ya.' }]);
      }, 500);
      return () => clearTimeout(t);
    }
  }, [chatOpen, chatMessages.length]);

  if (!talent) return null;

  const budget = activeProject.budgetNegotiated ?? activeProject.budget;
  const bulanCount = parseBulanCount(activeProject.durasi);
  const total = budget * bulanCount;

  // Escrow covers one month at a time (matches the "Dana escrow bulan
  // pertama terkunci" copy already shown once the contract goes active) —
  // not the full contract total upfront.
  function handlePayEscrow() {
    setPhase('paying');
    setTimeout(() => {
      setPhase('signing');
      setTimeout(() => {
        setPhase('celebrating');
        setTimeout(() => {
          setActiveProject(prev => ({ ...prev, status: 'matched' }));
          setPhase('active');
        }, 2000);
      }, 1200);
    }, 1500);
  }

  function handleSendChat() {
    if (!chatInput.trim()) return;
    const text = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text }]);
  }

  // Demo-only trigger standing in for the talent's own submission action
  // (there's no separate talent-side view wired into this flow) — what
  // matters for the escrow mechanism is that *some* event flips
  // held → submitted before the UMKM can approve.
  function handleTalentSubmitWork() {
    setChatMessages(prev => [...prev, { role: 'talent', text: 'Hasil kerja bulan ini udah aku kirim ✅ — cek file terlampir ya!', file: true }]);
    setEscrowStatus('submitted');
  }

  // The one step in this whole flow that must stay an explicit UMKM click —
  // dana never auto-releases just because work was submitted.
  function handleApproveWork() {
    const txId = `ESC-${Date.now().toString(36).toUpperCase()}`;
    const timestamp = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
    setReleaseInfo({ txId, timestamp });
    setEscrowStatus('released');
    setChatMessages(prev => [...prev, { role: 'user', text: '✓ Hasil kerja diterima — dana escrow udah aku lepas ke kamu. Makasih ya!' }]);
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-30 h-14 flex items-center px-4 md:px-6" style={{ background: BLUE }}>
        {phase === 'review' && (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white hover:text-white/80 text-sm font-bold font-inter transition-colors bg-transparent border-0 cursor-pointer"
          >
            <i className="fa-solid fa-arrow-left"></i>
            <span>Kembali</span>
          </button>
        )}
        <h1 className="text-white text-xs sm:text-sm font-bold font-sora truncate absolute left-1/2 -translate-x-1/2 max-w-[55%] text-center">
          Kontrak Final
        </h1>
      </header>

      <main className="max-w-[680px] mx-auto px-4 py-10 pb-16">
        {(phase === 'review' || phase === 'paying' || phase === 'signing') && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold font-inter uppercase tracking-wide" style={{ color: BLUE }}>Kontrak Final</span>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full font-inter border-2" style={{ color: BLUE, borderColor: BLUE, background: '#eef2fe' }}>
                Menunggu Tanda Tangan
              </span>
            </div>

            <div className="bg-white border-2 rounded-2xl p-6" style={{ borderColor: BLUE }}>
              <div className="space-y-3 text-sm font-inter">
                <div className="flex justify-between"><span className="text-gray-400">Talent</span><span className="font-semibold" style={{ color: '#1a1a1a' }}>{talent.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">UMKM</span><span className="font-semibold" style={{ color: '#1a1a1a' }}>{activeProject.umkm}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Skill</span><span className="font-semibold" style={{ color: '#1a1a1a' }}>{activeProject.skill}</span></div>
                <div className="flex flex-col gap-1"><span className="text-gray-400">Scope</span><span className="font-semibold" style={{ color: '#1a1a1a' }}>{activeProject.desc}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Budget</span><span className="font-bold" style={{ color: GREEN }}>{formatRupiah(budget)} / bulan</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Durasi</span><span className="font-bold" style={{ color: GREEN }}>{activeProject.durasi}</span></div>
                <div className="flex justify-between pt-3 border-t" style={{ borderColor: '#e5e9f0' }}><span className="font-semibold text-gray-500">Total</span><span className="font-sora font-extrabold text-lg" style={{ color: BLUE }}>{formatRupiah(total)}</span></div>
              </div>

              <div className="mt-5 pt-5 border-t" style={{ borderColor: '#e5e9f0' }}>
                <h3 className="text-xs font-bold font-inter uppercase tracking-wide mb-3" style={{ color: ORANGE }}>Perlindungan WADAH</h3>
                <div className="space-y-2">
                  {PROTECTIONS.map(p => (
                    <div key={p} className="flex items-center gap-2 text-sm font-inter text-gray-600">
                      <i className="fa-solid fa-circle-check text-xs" style={{ color: GREEN }}></i>
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {phase === 'review' && (
              <div className="bg-white border-2 rounded-2xl p-6 flex flex-col gap-4" style={{ borderColor: GREEN }}>
                <div className="text-center">
                  <div className="text-xs font-inter font-bold uppercase tracking-wide mb-1" style={{ color: GREEN }}>Setor Dana Escrow Bulan Pertama</div>
                  <div className="font-sora font-extrabold text-2xl" style={{ color: GREEN }}>{formatRupiah(budget)}</div>
                  <div className="text-xs font-inter text-gray-500 mt-1">Ditahan WADAH, dicairkan ke talent setelah hasil kerja disetujui</div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_METHODS.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id)}
                      className="flex flex-col items-center gap-1.5 rounded-xl p-3 border-2 cursor-pointer transition-all"
                      style={paymentMethod === m.id ? { borderColor: GREEN, background: '#e3faf0' } : { borderColor: '#e5e9f0', background: '#fff' }}
                    >
                      <i className={`fa-solid ${m.icon} text-base`} style={{ color: paymentMethod === m.id ? GREEN : '#9ca3af' }}></i>
                      <span className="text-[10px] font-inter font-semibold text-center" style={{ color: paymentMethod === m.id ? GREEN : '#6b7280' }}>{m.label}</span>
                    </button>
                  ))}
                </div>

                <div className="rounded-xl p-3 border-2" style={{ background: '#fff', borderColor: '#e5e9f0' }}>
                  <div className="text-gray-400 text-[10px] font-inter font-bold uppercase tracking-wide mb-1">⚡ Demo Mode</div>
                  <p className="text-gray-500 text-xs font-inter">Pembayaran ini simulasi untuk keperluan demo — tidak ada transaksi nyata yang terjadi.</p>
                </div>

                <button onClick={handlePayEscrow} className="mx-auto text-white font-bold py-3.5 px-10 rounded-full transition-all text-sm cursor-pointer border-0 hover:brightness-110" style={{ background: GREEN }}>
                  Bayar Escrow & Tanda Tangani
                </button>
              </div>
            )}

            {phase === 'paying' && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-2 py-4">
                <div className="w-8 h-8 border-2 rounded-full animate-spin-fast" style={{ borderColor: GREEN, borderTopColor: 'transparent' }} />
                <p className="text-sm font-inter text-gray-400">Memproses pembayaran escrow...</p>
              </motion.div>
            )}

            {phase === 'signing' && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-2 py-4">
                <div className="text-3xl">✍️</div>
                <p className="text-sm font-inter text-gray-400">Menandatangani kontrak...</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {phase === 'active' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
            <div className="rounded-2xl p-6 border-2" style={{ background: '#e3faf0', borderColor: GREEN }}>
              <div className="font-sora font-extrabold text-base mb-2" style={{ color: GREEN }}>KONTRAK AKTIF ✓</div>
              <div className="font-sora font-bold text-lg mb-1" style={{ color: '#1a1a1a' }}>{activeProject.umkm} × {talent.name}</div>
              <div className="text-sm font-inter text-gray-600">Budget: {formatRupiah(budget)}/bulan · Durasi: {activeProject.durasi}</div>
            </div>

            <div className="rounded-2xl p-6 border-2" style={{ borderColor: escrowStatus === 'released' ? GREEN : ORANGE, background: escrowStatus === 'released' ? '#e3faf0' : '#fff7ee' }}>
              <div className="flex items-center gap-2 mb-2">
                <i className={`fa-solid ${escrowStatus === 'held' ? 'fa-lock' : escrowStatus === 'submitted' ? 'fa-box-open' : 'fa-circle-check'} text-sm`} style={{ color: escrowStatus === 'released' ? GREEN : ORANGE }}></i>
                <span className="text-[11px] font-bold font-inter uppercase tracking-wide" style={{ color: escrowStatus === 'released' ? GREEN : ORANGE }}>
                  {escrowStatus === 'held' && 'Dana Ditahan Platform'}
                  {escrowStatus === 'submitted' && 'Hasil Kerja Diterima — Menunggu Persetujuan'}
                  {escrowStatus === 'released' && 'Dana Dilepas ke Talent'}
                </span>
              </div>

              <div className="font-sora font-extrabold text-2xl mb-2" style={{ color: '#1a1a1a' }}>{formatRupiah(budget)}</div>

              {escrowStatus === 'held' && (
                <p className="text-sm font-inter text-gray-600">Ditahan WADAH — akan dilepas ke {talent.name.split(' ')[0]} setelah kamu terima hasil kerja bulan ini.</p>
              )}

              {escrowStatus === 'submitted' && (
                <>
                  <p className="text-sm font-inter text-gray-600 mb-4">{talent.name.split(' ')[0]} udah kirim hasil kerja lewat chat. Cek hasilnya, baru setujui biar dananya dilepas.</p>
                  <button onClick={handleApproveWork} className="w-full text-white font-bold py-3 rounded-full transition-all text-sm cursor-pointer border-0 hover:brightness-110" style={{ background: GREEN }}>
                    ✓ Terima Hasil Kerja &amp; Lepas Dana
                  </button>
                </>
              )}

              {escrowStatus === 'released' && releaseInfo && (
                <div className="text-sm font-inter text-gray-600">
                  <p className="mb-2">Dana udah cair ke {talent.name.split(' ')[0]}.</p>
                  <div className="rounded-xl p-3" style={{ background: '#fff' }}>
                    <div className="flex justify-between text-xs"><span className="text-gray-400">ID Transaksi</span><span className="font-mono font-semibold" style={{ color: '#1a1a1a' }}>{releaseInfo.txId}</span></div>
                    <div className="flex justify-between text-xs mt-1"><span className="text-gray-400">Waktu</span><span className="font-semibold" style={{ color: '#1a1a1a' }}>{releaseInfo.timestamp}</span></div>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-2xl border-2 overflow-hidden" style={{ borderColor: BLUE }}>
              <button onClick={() => setChatOpen(o => !o)} className="w-full flex items-center justify-between px-5 py-4 border-0 cursor-pointer" style={{ background: '#eef2fe' }}>
                <span className="text-sm font-bold font-inter flex items-center gap-2" style={{ color: BLUE }}>
                  <i className="fa-solid fa-comment-dots"></i> Chat dengan {talent.name.split(' ')[0]}
                </span>
                <i className={`fa-solid fa-chevron-${chatOpen ? 'up' : 'down'} text-xs`} style={{ color: BLUE }}></i>
              </button>

              <AnimatePresence initial={false}>
                {chatOpen && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="flex flex-col gap-3 px-4 py-4" style={{ background: '#f5f8fb', maxHeight: 320, overflowY: 'auto' }}>
                      {chatMessages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className="max-w-[85%] rounded-2xl px-4 py-3 text-sm font-inter leading-relaxed"
                            style={msg.role === 'user'
                              ? { background: BLUE, color: '#fff', borderTopRightRadius: 4 }
                              : { background: '#fff', color: '#1a1a1a', borderTopLeftRadius: 4, border: '1px solid #e5e9f0' }}
                          >
                            {msg.file ? (
                              <span className="flex items-center gap-2"><i className="fa-solid fa-file-arrow-down"></i>{msg.text}</span>
                            ) : msg.text}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t p-3 flex flex-col gap-2" style={{ borderColor: '#e5e9f0' }}>
                      <div className="flex gap-2">
                        <input
                          value={chatInput}
                          onChange={e => setChatInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                          placeholder={`Kirim pesan ke ${talent.name.split(' ')[0]}...`}
                          className="flex-1 rounded-full px-4 py-2 text-sm font-inter focus:outline-none border-2"
                          style={{ background: '#f5f8fb', borderColor: '#e5e9f0', color: '#1a1a1a' }}
                        />
                        <button onClick={handleSendChat} disabled={!chatInput.trim()} className="w-10 h-10 rounded-full flex items-center justify-center text-white disabled:opacity-40 cursor-pointer border-0 shrink-0" style={{ background: BLUE }}>
                          <i className="fa-solid fa-paper-plane text-xs"></i>
                        </button>
                      </div>
                      {escrowStatus === 'held' && (
                        <button onClick={handleTalentSubmitWork} className="text-xs font-inter text-gray-400 hover:text-gray-600 bg-transparent border-0 cursor-pointer underline text-left">
                          ⚡ Demo: simulasikan {talent.name.split(' ')[0]} kirim hasil kerja
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button onClick={() => navigate('/')} className="w-full text-white font-bold py-3.5 rounded-full transition-all text-sm cursor-pointer border-0 hover:brightness-110" style={{ background: GREEN }}>
              Kembali ke Beranda
            </button>
          </motion.div>
        )}
      </main>

      {/* ── CELEBRATION OVERLAY ── */}
      <AnimatePresence>
        {phase === 'celebrating' && (
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
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="font-sora font-extrabold text-4xl" style={{ color: GREEN }}>Kontrak Aktif!</h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
