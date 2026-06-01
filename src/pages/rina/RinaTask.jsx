import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Bot, Upload } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { TASK_DATA, RINA_TUTOR_FLOWS, RINA_TUTOR_DEFAULT } from '../../data/mockData';

const task = TASK_DATA['Desain Grafis'];

const GREETING = `Hai Rina! 👋 Saya **AI Tutor WADAH** — siap membantu kamu mengerjakan tugas Pak Budi.

Tugas kamu: buat **konten Instagram 1080x1080px** untuk promosi **"Nasi Goreng Spesial Rp 25.000"** — gaya hangat, warna merah bata + kuning emas.

Tanya apapun! Coba: *"Bagaimana soal warna?"* atau *"Cek brief-nya"*`;

function matchResponse(input) {
  const lower = input.toLowerCase();
  for (const flow of RINA_TUTOR_FLOWS) {
    if (flow.keywords.some(k => lower.includes(k))) {
      return flow.response;
    }
  }
  return RINA_TUTOR_DEFAULT[Math.floor(Math.random() * RINA_TUTOR_DEFAULT.length)];
}

function ChatBubble({ msg }) {
  const isBot = msg.role === 'ai';
  return (
    <div className={`flex gap-2 ${isBot ? 'justify-start' : 'justify-end'}`}>
      {isBot && (
        <div className="w-7 h-7 rounded-full bg-green/20 flex items-center justify-center flex-shrink-0 mt-1">
           <img src="/bot.png" alt="bot" className="w-full h-full object-cover" />
        </div>
      )}
      <div
        className={`max-w-xs sm:max-w-sm rounded-2xl px-4 py-3 text-sm font-inter leading-relaxed ${
          isBot
            ? 'bg-white text-gray-700 rounded-tl-sm shadow-sm border border-gray-100'
            : 'bg-indigo text-white rounded-tr-sm'
        }`}
        dangerouslySetInnerHTML={{
          __html: msg.text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br/>'),
        }}
      />
    </div>
  );
}

export default function RinaTask() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([{ role: 'ai', text: GREETING }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  function sendMessage(text) {
    if (!text.trim()) return;
    const userMsg = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setTimeout(() => {
      const reply = matchResponse(text);
      setMessages(prev => [...prev, { role: 'ai', text: reply }]);
      setIsTyping(false);
    }, 900 + Math.random() * 500);
  }

  const QUICK_PROMPTS = ['Soal warna brief?', 'Cek keterbacaan teks', 'Tampilkan brief', 'Tips ukuran konten'];

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar activePage="task" />

      <main className="ml-60 flex-1 flex flex-col">
        {/* Split layout */}
        <div className="flex-1 flex overflow-hidden" style={{ height: 'calc(100vh - 80px)' }}>

          {/* ── Brief Panel (40%) ── */}
          <div className="w-2/5 border-r border-gray-200 bg-white overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-lg">🍛</div>
                <div>
                  <div className="font-sora font-bold text-deep text-sm">{task.title}</div>
                  <div className="text-xs text-gray-400 font-inter">{task.client}</div>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-5">
              {/* Client info */}
              <div className="bg-deep/5 rounded-xl p-4">
                <div className="text-xs font-semibold text-gray-400 font-inter uppercase tracking-wide mb-2">KLIEN</div>
                <div className="font-semibold text-deep font-inter">{task.client}</div>
                <div className="text-sm text-gray-500 font-inter mt-0.5">UMKM Kuliner · Jakarta</div>
              </div>

              {/* Description */}
              <div>
                <div className="text-xs font-semibold text-gray-400 font-inter uppercase tracking-wide mb-2">DESKRIPSI</div>
                <p className="text-sm text-gray-600 font-inter leading-relaxed">{task.description}</p>
              </div>

              {/* Requirements */}
              <div>
                <div className="text-xs font-semibold text-gray-400 font-inter uppercase tracking-wide mb-2">KETENTUAN</div>
                <ul className="space-y-2">
                  {task.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-600 font-inter">
                      <div className="w-4 h-4 rounded border border-indigo/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 rounded-sm bg-indigo/30" />
                      </div>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-amber/5 border border-amber/20 rounded-xl p-3">
                  <div className="text-xs text-gray-400 font-inter">Deadline</div>
                  <div className="font-sora font-bold text-amber text-sm">{task.deadline}</div>
                </div>
                <div className="bg-green/5 border border-green/20 rounded-xl p-3">
                  <div className="text-xs text-gray-400 font-inter">Format</div>
                  <div className="font-sora font-bold text-green text-sm">{task.format}</div>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-indigo/5 border border-indigo/20 rounded-xl p-4">
                <div className="text-xs font-semibold text-indigo font-inter mb-1.5">💡 Tips dari WADAH</div>
                <p className="text-xs text-gray-600 font-inter leading-relaxed">{task.tips}</p>
              </div>

              {/* Reward */}
              <div className="text-center py-3 bg-green/5 rounded-xl border border-green/20">
                <div className="font-sora font-bold text-green text-xl">{task.reward}</div>
                <div className="text-xs text-gray-500 font-inter mt-0.5">⚡ XP diperoleh setelah verifikasi</div>
              </div>
            </div>
          </div>

          {/* ── AI Tutor Chat Panel (60%) ── */}
          <div className="flex-1 flex flex-col bg-gray-50">
            {/* Chat header */}
            <div className="bg-gradient-to-r from-green to-teal px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                  <img src="/bot.png" alt="bot" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="text-white font-semibold font-inter text-sm">AI Tutor WADAH</div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-dot" />
                    <span className="text-white/80 text-xs font-inter">Online</span>
                  </div>
                </div>
              </div>
              <span className="text-white/60 text-xs font-inter bg-white/10 px-2.5 py-1 rounded-full">Desain Grafis</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((msg, i) => <ChatBubble key={i} msg={msg} />)}
              {isTyping && (
                <div className="flex gap-2 justify-start">
                  <div className="w-7 h-7 rounded-full bg-green/20 flex items-center justify-center flex-shrink-0">
                    <img src="/bot.png" alt="bot" className="w-full h-full object-cover" />
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Quick prompts */}
            <div className="px-4 pb-2 flex gap-2 flex-wrap">
              {QUICK_PROMPTS.map(p => (
                <button
                  key={p}
                  onClick={() => sendMessage(p)}
                  className="text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full font-inter hover:border-green/40 hover:text-green transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                  placeholder="Tanya AI Tutor tentang desain, warna, tipografi..."
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:border-green transition-colors"
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isTyping}
                  className="w-10 h-10 bg-green rounded-xl flex items-center justify-center hover:bg-green-600 transition-colors disabled:opacity-40"
                >
                  <Send size={15} className="text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky bottom bar */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between z-20">
          <div className="text-sm text-gray-500 font-inter">
            <span className="font-semibold text-deep">Tugas:</span> Konten Instagram Pak Budi
          </div>
          <button
            onClick={() => navigate('/rina/submit')}
            className="flex items-center gap-2 bg-green text-white font-bold px-6 py-3 rounded-xl hover:bg-green-600 transition-all active:scale-95 font-inter shadow-md"
          >
            <Upload size={16} />
            Kumpulkan Hasil     </button>
        </div>
      </main>
    </div>
  );
}
