import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DAILY_LIMIT = 10;
const QUIZ_REFUSAL = 'Gw bisa bantu jelasin konsepnya, tapi jawaban quiz harus kamu temuin sendiri ya 😊';
const GREETING = 'Halo! Saya AI Mentor-mu. Tanya apapun soal materi, atau minta saran arah kalau lagi ngerjain checkpoint 😊';

export default function AIMentorWidget({ node, stage, skillLabel }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messageCount, setMessageCount] = useState(0);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const contextLabel = node
    ? `Konteks: Unit ${node.id} — ${node.title}`
    : `Konteks: Peta Misi ${skillLabel || ''}`;

  const limitReached = messageCount >= DAILY_LIMIT;

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
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-[360px] h-[480px] bg-[#1A1A2E] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div>
                <div className="text-white text-xs font-bold font-sora flex items-center gap-1.5">
                  <i className="fa-solid fa-robot text-purple"></i> AI Mentor Co-Pilot
                </div>
                <div className="text-white/40 text-[10px] font-inter mt-0.5 truncate max-w-[280px]">{contextLabel}</div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-6 h-6 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors bg-transparent border-0 cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-xs"></i>
              </button>
            </div>

            {/* Chat area */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2 items-start text-xs ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'ai' && (
                    <div className="w-5 h-5 rounded-md bg-purple text-white flex items-center justify-center font-bold text-[9px] shrink-0">AI</div>
                  )}
                  <div className={`leading-relaxed font-inter px-2.5 py-2 rounded-xl max-w-[240px] ${
                    msg.role === 'ai' ? 'bg-purple/10 text-white/80 border border-purple/15' : 'bg-white/10 text-white/70'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-2 items-start text-xs">
                  <div className="w-5 h-5 rounded-md bg-purple text-white flex items-center justify-center font-bold text-[9px] shrink-0">AI</div>
                  <div className="text-white/40 italic font-inter px-2.5 py-2">mengetik...</div>
                </div>
              )}
              {limitReached && (
                <div className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-2 font-inter">
                  Limit harian tercapai. Upgrade Premium untuk chat unlimited.
                </div>
              )}
            </div>

            {/* Suggested chips */}
            {node?.suggests?.length > 0 && !limitReached && (
              <div className="flex flex-wrap gap-1.5 px-3 pb-2 border-t border-white/10 pt-2">
                {node.suggests.map(chip => (
                  <button
                    key={chip.id}
                    onClick={() => handleChip(chip)}
                    className="text-[10px] bg-white/5 hover:bg-white/10 text-purple border border-purple/20 rounded-lg px-2 py-1 font-inter text-left transition-colors cursor-pointer"
                  >
                    {chip.text}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-2.5 border-t border-white/10 flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                disabled={limitReached}
                placeholder="Tanya apapun..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 font-inter focus:outline-none focus:border-purple/50 disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || limitReached}
                className="w-8 h-8 rounded-lg bg-purple flex items-center justify-center text-white disabled:opacity-40 cursor-pointer border-0 shrink-0"
              >
                <i className="fa-solid fa-paper-plane text-xs"></i>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating trigger button */}
      <motion.button
        onClick={toggleOpen}
        whileTap={{ scale: 0.92 }}
        className="relative w-14 h-14 rounded-full bg-purple text-white flex items-center justify-center shadow-2xl shadow-purple/30 border-0 cursor-pointer"
      >
        {!open && (
          <span className="absolute inset-0 rounded-full bg-purple animate-ping opacity-40"></span>
        )}
        <i className={`fa-solid ${open ? 'fa-xmark' : 'fa-robot'} text-lg relative`}></i>
      </motion.button>
    </div>
  );
}
