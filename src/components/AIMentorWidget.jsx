import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DAILY_LIMIT = 10;
const QUIZ_REFUSAL = 'Gw bisa bantu jelasin konsepnya, tapi jawaban quiz harus kamu temuin sendiri ya 😊';
const GREETING = 'Halo! Saya WADDY, AI Mentor-mu. Tanya apapun soal **materi**, atau minta **saran arah** kalau lagi ngerjain checkpoint 😊';

// Shown when the widget is opened from the Skill Map itself (node === null)
// instead of from a specific unit — general "tentang WADAH" questions rather
// than materi-specific ones.
const MAP_SUGGESTS = [
  {
    id: 'faq-map-premium',
    text: 'Apa bedanya WADAH Free & Premium?',
    answer: 'Di **Free** kamu dapat **5 lives/hari**. Di Premium, lives naik jadi **15/hari**, **limit chat** sama gw nambah, kamu bisa **review draft** task ke gw dulu sebelum submit ke reviewer, plus **analytics skill yang lebih detail** dan **badge "Premium Talent"** yang keliatan ke UMKM dan masih banyak lagi. Worth it kalau kamu mau ngebut selesain journey 🚀',
  },
  {
    id: 'faq-map-sertifikasi',
    text: 'Sertifikasi WADAH itu apa?',
    answer: 'Setelah semua unit selesai, kamu bisa ambil **ujian live 60 menit** bareng examiner praktisi industri. Jika lulus, kamu akan mendapatkan **sertifikasi** yang bisa kalian masukan di CV atau LinkedIn. Tapi ini opsional ya — bukan syarat buat dapat proyek di WADAH 😊',
  },
];

// Splits "**bold**" markers out of a reply and highlights them in the
// widget's accent color — mirrors the emphasis style from the reference design.
function renderRich(text, accentColor) {
  return text.split('**').map((part, i) =>
    i % 2 === 1 ? <strong key={i} style={{ color: accentColor }}>{part}</strong> : part
  );
}

export default function AIMentorWidget({ node, stage, skillLabel, light = false }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messageCount, setMessageCount] = useState(0);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const contextLabel = node
    ? `Konteks: Unit ${node.id} — ${node.title}`
    : `Konteks: Peta Misi ${skillLabel || ''}`;

  const limitReached = messageCount >= DAILY_LIMIT;
  const chips = node ? (node.suggests || []) : MAP_SUGGESTS;

  function ensureGreeting() {
    setMessages(prev => (prev.length === 0 ? [{ role: 'ai', text: GREETING }] : prev));
  }

  function toggleOpen() {
    setOpen(prev => {
      if (!prev) ensureGreeting();
      return !prev;
    });
  }

  function respondTo(text, { fromChip, chipAnswer } = {}) {
    setMessages(prev => [...prev, { role: 'user', text }]);
    setMessageCount(prev => prev + 1);
    setIsTyping(true);

    setTimeout(() => {
      let reply;
      if (stage === 'quiz' && !fromChip) {
        reply = QUIZ_REFUSAL;
      } else if (fromChip && chipAnswer) {
        reply = chipAnswer;
      } else {
        reply = 'Sip! Coba lebih spesifik pertanyaannya ya, atau pilih salah satu chip saran di atas biar saya bisa bantu lebih akurat.';
      }
      setIsTyping(false);
      setMessages(prev => [...prev, { role: 'ai', text: reply }]);
    }, 900);
  }

  function handleSend() {
    if (!input.trim() || limitReached) return;
    respondTo(input.trim());
    setInput('');
  }

  function handleChip(chip) {
    if (limitReached) return;
    respondTo(chip.text, { fromChip: true, chipAnswer: chip.answer });
  }

  return (
    <div className="fixed bottom-6 right-20 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`w-[360px] h-[480px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border ${
              light ? 'bg-white border-gray-200' : 'bg-[#1A1A2E] border-white/10'
            }`}
          >
            {/* Header */}
            <div
              className={`px-4 py-3 border-b flex items-center justify-between gap-2 ${light ? 'border-transparent' : 'border-white/10 bg-white/[0.02]'}`}
              style={light ? { background: '#2b6fff' } : undefined}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {light && (
                  <img src="/mascot-hero.png" alt="" className="w-9 h-9 rounded-full object-cover border-2 border-white/40 shrink-0" style={{ objectPosition: '50% 15%' }} />
                )}
                <div className="min-w-0">
                  <div className={`text-xs font-bold font-sora flex items-center gap-1.5 ${light ? 'text-white' : 'text-white'}`}>
                    {!light && <i className="fa-solid fa-robot"></i>}
                    {light ? 'WADDY AI Mentor Co-Pilot' : 'AI Mentor Co-Pilot'}
                  </div>
                  {light ? (
                    <div className="text-[10px] font-inter mt-0.5 text-white/80 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#00c897' }}></span> Online
                    </div>
                  ) : (
                    <div className="text-[10px] font-inter mt-0.5 truncate max-w-[280px] text-white/40">{contextLabel}</div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors bg-transparent border-0 cursor-pointer shrink-0 ${
                  light ? 'text-white/80 hover:text-white hover:bg-white/15' : 'text-white/50 hover:text-white hover:bg-white/10'
                }`}
              >
                <i className="fa-solid fa-xmark text-xs"></i>
              </button>
            </div>

            {/* Chat area */}
            <div className={`flex-1 overflow-y-auto px-3 py-3 space-y-2.5 ${light ? '' : ''}`} style={light ? { background: '#eef1f8' } : undefined}>
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2 items-start text-xs ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'ai' && (
                    light ? (
                      <img src="/mascot-hero.png" alt="" className="w-6 h-6 rounded-full object-cover shrink-0" style={{ objectPosition: '50% 15%' }} />
                    ) : (
                      <div className="w-5 h-5 rounded-md text-white flex items-center justify-center font-bold text-[9px] shrink-0 bg-purple">AI</div>
                    )
                  )}
                  <div className={`leading-relaxed font-inter px-2.5 py-2 rounded-2xl max-w-[240px] ${
                    light
                      ? 'bg-white text-[#1a1a1a] shadow-sm'
                      : msg.role === 'ai' ? 'bg-purple/10 text-white/80 border border-purple/15' : 'bg-white/10 text-white/70'
                  }`}>
                    {renderRich(msg.text, light ? '#2b6fff' : '#c4b5fd')}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-2 items-start text-xs">
                  {light ? (
                    <img src="/mascot-hero.png" alt="" className="w-6 h-6 rounded-full object-cover shrink-0" style={{ objectPosition: '50% 15%' }} />
                  ) : (
                    <div className="w-5 h-5 rounded-md text-white flex items-center justify-center font-bold text-[9px] shrink-0 bg-purple">AI</div>
                  )}
                  <div className={`italic font-inter px-2.5 py-2 ${light ? 'text-gray-400' : 'text-white/40'}`}>mengetik...</div>
                </div>
              )}
              {limitReached && (
                <div className={`text-[10px] rounded-lg px-2.5 py-2 font-inter ${
                  light ? 'text-[#f37219] bg-white border border-[#f37219]/30' : 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                }`}>
                  Limit harian tercapai. Upgrade Premium untuk chat unlimited.
                </div>
              )}
            </div>

            {/* Suggested chips */}
            {chips.length > 0 && !limitReached && (
              <div className={`flex flex-wrap gap-1.5 px-3 pb-2 border-t pt-2 ${light ? 'border-gray-100' : 'border-white/10'}`}>
                {chips.map(chip => (
                  <button
                    key={chip.id}
                    onClick={() => handleChip(chip)}
                    className={`text-[10px] rounded-full px-2.5 py-1 font-inter text-left transition-colors cursor-pointer ${
                      light ? 'bg-white hover:bg-[#eef2fe] text-[#2b6fff] border border-[#2b6fff]/30' : 'bg-white/5 hover:bg-white/10 text-purple border border-purple/20'
                    }`}
                  >
                    {chip.text}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className={`p-2.5 border-t flex gap-2 items-center ${light ? 'border-gray-100' : 'border-white/10'}`}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                disabled={limitReached}
                placeholder="Tanya apapun..."
                className={`flex-1 px-3.5 py-2.5 text-xs font-inter focus:outline-none disabled:opacity-50 ${
                  light
                    ? 'rounded-full bg-white border border-gray-200 text-[#1a1a1a] placeholder:text-gray-400 focus:border-[#2b6fff]'
                    : 'rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-purple/50'
                }`}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || limitReached}
                className={`w-9 h-9 flex items-center justify-center text-white disabled:opacity-40 cursor-pointer border-0 shrink-0 ${light ? 'rounded-full' : 'rounded-lg bg-purple'}`}
                style={light ? { background: '#2b6fff' } : undefined}
              >
                <i className={`fa-solid ${light ? 'fa-arrow-right' : 'fa-paper-plane'} text-xs`}></i>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating trigger button — in light mode (closed) this IS Wady: no
          flat icon disc, just the mascot floating so the speech bubble above
          reads as Wady talking, not a generic chatbot button. */}
      <motion.button
        onClick={toggleOpen}
        whileTap={{ scale: 0.92 }}
        animate={light && !open ? { y: [0, -8, 0] } : {}}
        transition={light && !open ? { duration: 3, repeat: Infinity, ease: 'easeInOut' } : {}}
        className={`relative flex items-center justify-center border-0 cursor-pointer ${
          light && !open
            ? 'w-16 h-16 sm:w-28 sm:h-28 rounded-full bg-transparent shadow-none'
            : `w-14 h-14 rounded-full text-white shadow-2xl ${light ? 'shadow-[#00c897]/30' : 'bg-purple shadow-purple/30'}`
        }`}
        style={{ background: light && open ? '#00c897' : light ? undefined : undefined }}
      >
        {!open && (
          <span className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ background: light ? '#00c897' : '#7C3AED' }}></span>
        )}
        {light && !open ? (
          <img
            src="/mascot-hero.png"
            alt="Wady"
            className="w-full h-full object-contain drop-shadow-xl relative pointer-events-none select-none"
          />
        ) : (
          <i className={`fa-solid ${open ? 'fa-xmark' : 'fa-robot'} text-lg relative`}></i>
        )}
      </motion.button>
    </div>
  );
}
