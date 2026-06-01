import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Bot, Send, X, Star, MapPin, Clock, Briefcase, CheckCircle } from 'lucide-react';
import StepIndicator from '../../components/StepIndicator';
import { JASA_AI_RESPONSES, PORTFOLIO_DATA } from '../../data/mockData';

const CATEGORIES = [
  { id: 'desain', label: 'Desain Grafis', emoji: '🎨', desc: 'Konten visual, branding, logo' },
  { id: 'social', label: 'Social Media', emoji: '📱', desc: 'Manajemen akun, konten, strategi' },
  { id: 'copy',   label: 'Copywriting',  emoji: '✍️', desc: 'Caption, artikel, copy iklan' },
  { id: 'video',  label: 'Videografi',   emoji: '🎬', desc: 'Edit video, motion graphic' },
  { id: 'photo',  label: 'Fotografi',    emoji: '📸', desc: 'Product photo, lifestyle shoot' },
  { id: 'web',    label: 'Web Dev',      emoji: '💻', desc: 'Landing page, website toko' },
];

const MATCH_COLORS = { 97: 'text-green border-green/30 bg-green/5', 91: 'text-indigo border-indigo/30 bg-indigo/5', 88: 'text-amber border-amber/30 bg-amber/5' };

export default function JasaFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selectedCat, setSelectedCat] = useState(null);
  const [description, setDescription] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatPhase, setChatPhase] = useState(0); // 0=initial, 1=q1, 2=replied1, 3=q2, 4=replied2, 5=done
  const [isTyping, setIsTyping] = useState(false);
  const [selectedTalent, setSelectedTalent] = useState(null);

  const steps = ['Deskripsi Proyek', 'Klarifikasi AI', 'Pilih Talenta'];
  const doneSet = new Set(Array.from({ length: step }, (_, i) => i));

  // Step 1: send to AI
  function handleClarify() {
    if (!selectedCat || !description.trim()) return;
    setStep(1);
    setIsTyping(true);
    setTimeout(() => {
      setChatMessages([{ role: 'ai', text: JASA_AI_RESPONSES[0].question }]);
      setChatPhase(1);
      setIsTyping(false);
    }, 1200);
  }

  // Step 2: user replies in chat
  function handleChatReply(replyText) {
    const newMsgs = [...chatMessages, { role: 'user', text: replyText }];
    setChatMessages(newMsgs);
    setIsTyping(true);

    if (chatPhase === 1) {
      setTimeout(() => {
        setChatMessages([...newMsgs, { role: 'ai', text: JASA_AI_RESPONSES[1].question }]);
        setChatPhase(3);
        setIsTyping(false);
      }, 1000);
    } else if (chatPhase === 3) {
      setTimeout(() => {
        setChatMessages([...newMsgs, {
          role: 'ai',
          text: '✅ Sempurna! Saya sudah memiliki semua informasi yang diperlukan.\n\n**Ringkasan proyek Anda:**\n- Kategori: Desain Grafis (Instagram Feed)\n- Frekuensi: 3 post/minggu\n- Brand: Logo + warna merah-kuning, gaya bersih & hangat\n\nSistem WADAH sekarang akan mencarikan talenta terbaik yang sesuai dengan kebutuhan Anda. Klik **Temukan Talenta** untuk melihat hasilnya! 🎯',
        }]);
        setChatPhase(5);
        setIsTyping(false);
      }, 1000);
    }
  }

  const [inputVal, setInputVal] = useState('');

  function handleSend() {
    if (!inputVal.trim() || chatPhase === 5) return;
    handleChatReply(inputVal);
    setInputVal('');
  }

  function usePreset(text) {
    handleChatReply(text);
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-sora font-bold text-deep text-3xl mb-2">Cari Talenta untuk Proyekmu</h1>
        <p className="text-gray-500 font-inter">AI akan membantu mencocokkan talenta terbaik sesuai kebutuhanmu</p>
      </div>

      {/* Step Indicator */}
      <div className="flex justify-center mb-10">
        <StepIndicator steps={steps} current={step} done={doneSet} />
      </div>

      {/* ── STEP 0: Deskripsi ── */}
      {step === 0 && (
        <div className="animate-fade-in space-y-6">
          <div>
            <h2 className="font-sora font-bold text-deep text-xl mb-4">Pilih Kategori Jasa</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCat(cat.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedCat === cat.id
                      ? 'border-indigo bg-indigo/5 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-indigo/40'
                  }`}
                >
                  <div className="text-2xl mb-2">{cat.emoji}</div>
                  <div className="font-semibold text-gray-800 font-inter text-sm">{cat.label}</div>
                  <div className="text-gray-400 text-xs font-inter mt-0.5">{cat.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-sora font-bold text-deep text-xl mb-3">Deskripsikan Proyek</h2>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Contoh: Saya punya warung makan dan butuh konten Instagram yang menarik untuk promosi menu spesial. Saya ingin gaya yang hangat dan tradisional..."
              className="w-full h-36 border-2 border-gray-200 rounded-xl p-4 font-inter text-sm text-gray-700 focus:outline-none focus:border-indigo resize-none transition-colors"
            />
            <div className="text-right text-xs text-gray-400 font-inter mt-1">{description.length}/500</div>
          </div>

          {/* Quick fill */}
          <button
            onClick={() => {
              setSelectedCat('desain');
              setDescription('Saya punya warung makan Pak Budi dan butuh 3 konten Instagram per minggu untuk promosi menu spesial. Gaya hangat dan keluarga, warna merah dan kuning sesuai brand.');
            }}
            className="text-xs text-indigo font-inter underline"
          >
            💡 Isi contoh cepat (demo)
          </button>

          <div className="flex justify-end">
            <button
              onClick={handleClarify}
              disabled={!selectedCat || !description.trim()}
              className="flex items-center gap-2 bg-indigo text-white font-bold px-7 py-3 rounded-xl hover:bg-indigo-dark transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 font-inter"
            >
              <Bot size={17} />
              Klarifikasi dengan AI
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 1: Chat ── */}
      {step === 1 && (
        <div className="animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Chat header */}
            <div className="bg-gradient-to-r from-indigo to-purple px-5 py-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <Bot size={18} className="text-white" />
              </div>
              <div>
                <div className="text-white font-semibold font-inter text-sm">WADAH AI Assistant</div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green animate-pulse-dot" />
                  <span className="text-white/70 text-xs font-inter">Online</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="h-80 overflow-y-auto p-5 space-y-4 bg-gray-50">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'ai' && (
                    <div className="w-7 h-7 rounded-full bg-indigo/10 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                      <Bot size={13} className="text-indigo" />
                    </div>
                  )}
                  <div
                    className={`max-w-xs sm:max-w-sm rounded-2xl px-4 py-3 text-sm font-inter leading-relaxed whitespace-pre-line ${
                      msg.role === 'user'
                        ? 'bg-indigo text-white rounded-tr-sm'
                        : 'bg-white text-gray-700 rounded-tl-sm shadow-sm border border-gray-100'
                    }`}
                    dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                  />
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="w-7 h-7 rounded-full bg-indigo/10 flex items-center justify-center mr-2 flex-shrink-0">
                    <Bot size={13} className="text-indigo" />
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100">
                    <div className="flex gap-1">
                      {[0,1,2].map(i => (
                        <div key={i} className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick reply presets */}
            {chatPhase === 1 && !isTyping && (
              <div className="px-5 pt-3 pb-1 flex gap-2 flex-wrap border-t border-gray-100 bg-white">
                <button
                  onClick={() => usePreset(JASA_AI_RESPONSES[0].userReply)}
                  className="text-xs bg-indigo/10 text-indigo px-3 py-1.5 rounded-full font-inter hover:bg-indigo/20 transition-colors"
                >
                  💬 {JASA_AI_RESPONSES[0].userReply}
                </button>
              </div>
            )}
            {chatPhase === 3 && !isTyping && (
              <div className="px-5 pt-3 pb-1 flex gap-2 flex-wrap border-t border-gray-100 bg-white">
                <button
                  onClick={() => usePreset(JASA_AI_RESPONSES[1].userReply)}
                  className="text-xs bg-indigo/10 text-indigo px-3 py-1.5 rounded-full font-inter hover:bg-indigo/20 transition-colors"
                >
                  💬 {JASA_AI_RESPONSES[1].userReply}
                </button>
              </div>
            )}

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="flex gap-2">
                <input
                  value={inputVal}
                  onChange={e => setInputVal(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder={chatPhase === 5 ? 'Klarifikasi selesai...' : 'Ketik jawaban...'}
                  disabled={chatPhase === 5 || isTyping}
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-inter focus:outline-none focus:border-indigo disabled:bg-gray-50 disabled:text-gray-400"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputVal.trim() || chatPhase === 5 || isTyping}
                  className="w-10 h-10 bg-indigo rounded-xl flex items-center justify-center hover:bg-indigo-dark transition-colors disabled:opacity-40"
                >
                  <Send size={15} className="text-white" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button onClick={() => setStep(0)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-inter text-sm">
              <ArrowLeft size={16} /> Kembali
            </button>
            <button
              onClick={() => setStep(2)}
              disabled={chatPhase < 5}
              className="flex items-center gap-2 bg-green text-white font-bold px-6 py-3 rounded-xl hover:bg-green-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 font-inter"
            >
              Temukan Talenta ✨
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: Talent Matching ── */}
      {step === 2 && (
        <div className="animate-fade-in space-y-5">
          <div className="bg-green/10 border border-green/30 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle size={20} className="text-green" />
            <div>
              <div className="font-semibold text-green font-inter text-sm">3 Talenta Cocok Ditemukan!</div>
              <div className="text-gray-600 text-xs font-inter">Berdasarkan brief + preferensi yang Anda berikan ke AI</div>
            </div>
          </div>

          <div className="space-y-4">
            {PORTFOLIO_DATA.map(talent => (
              <div
                key={talent.id}
                onClick={() => setSelectedTalent(talent)}
                className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md hover:border-indigo/30 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo to-purple flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-sora font-bold">{talent.initials}</span>
                    </div>
                    <div>
                      <div className="font-sora font-bold text-deep">{talent.name}</div>
                      <div className="text-xs text-gray-400 font-inter">{talent.level}</div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 font-inter">
                        <span className="flex items-center gap-1"><MapPin size={11} />{talent.location}</span>
                        <span className="flex items-center gap-1"><Clock size={11} />{talent.responseTime}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`text-center px-3 py-2 rounded-xl border font-bold font-sora text-xl ${MATCH_COLORS[talent.match] || 'text-gray-600 border-gray-200'}`}>
                    {talent.match}%
                    <div className="text-xs font-inter font-normal">match</div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="text-xs font-semibold text-gray-400 font-inter uppercase tracking-wide mb-2">COCOK KARENA</div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 font-inter">
                    <CheckCircle size={13} className="text-green flex-shrink-0" />
                    {talent.matchReason}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {talent.skills.slice(0,3).map(s => (
                    <span key={s} className="text-xs bg-indigo/10 text-indigo px-2.5 py-1 rounded-full font-inter">{s}</span>
                  ))}
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={e => { e.stopPropagation(); setSelectedTalent(talent); }}
                    className="flex-1 border border-indigo/40 text-indigo text-sm font-semibold py-2 rounded-xl hover:bg-indigo/5 transition-colors font-inter"
                  >
                    Lihat Portofolio
                  </button>
                  <button
                    onClick={e => e.stopPropagation()}
                    className="flex-1 bg-green text-white text-sm font-semibold py-2 rounded-xl hover:bg-green-600 transition-colors font-inter"
                  >
                    Hubungi
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('/')}
            className="w-full border border-gray-200 text-gray-500 py-3 rounded-xl hover:bg-gray-50 font-inter text-sm transition-colors"
          >
            ← Kembali ke Beranda
          </button>
        </div>
      )}

      {/* ── Talent Modal ── */}
      {selectedTalent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setSelectedTalent(null)}>
          <div
            className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto animate-pop"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo to-purple flex items-center justify-center">
                  <span className="text-white font-sora font-bold text-sm">{selectedTalent.initials}</span>
                </div>
                <div>
                  <div className="font-sora font-bold text-deep">{selectedTalent.name}</div>
                  <div className="text-xs text-gray-400 font-inter">{selectedTalent.level}</div>
                </div>
              </div>
              <button onClick={() => setSelectedTalent(null)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                <X size={15} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <p className="text-gray-600 font-inter text-sm leading-relaxed">{selectedTalent.bio}</p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center bg-indigo/5 rounded-xl p-3">
                  <div className="font-sora font-bold text-indigo text-lg">{selectedTalent.avgScore}%</div>
                  <div className="text-xs text-gray-400 font-inter">Skor Avg</div>
                </div>
                <div className="text-center bg-green/5 rounded-xl p-3">
                  <div className="font-sora font-bold text-green text-lg">{selectedTalent.completedProjects}</div>
                  <div className="text-xs text-gray-400 font-inter">Proyek</div>
                </div>
                <div className="text-center bg-amber/5 rounded-xl p-3">
                  <div className="font-sora font-bold text-amber text-lg">{selectedTalent.responseTime}</div>
                  <div className="text-xs text-gray-400 font-inter">Respons</div>
                </div>
              </div>

              {/* Portfolio */}
              <div>
                <div className="text-xs font-semibold text-gray-400 font-inter uppercase tracking-wide mb-3">Portofolio Terverifikasi</div>
                <div className="space-y-2">
                  {selectedTalent.portfolio.map(p => (
                    <div key={p.title} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <div className="text-sm font-semibold text-gray-700 font-inter">{p.title}</div>
                        <div className="text-xs text-gray-400 font-inter">{p.category}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star size={12} className="text-amber fill-amber" />
                        <span className="text-sm font-bold text-gray-700 font-inter">{p.score}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div>
                <div className="text-xs font-semibold text-gray-400 font-inter uppercase tracking-wide mb-2">Skills</div>
                <div className="flex flex-wrap gap-2">
                  {selectedTalent.skills.map(s => (
                    <span key={s} className="text-xs bg-indigo/10 text-indigo px-3 py-1 rounded-full font-inter">{s}</span>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <button className="w-full bg-green text-white font-bold py-3.5 rounded-xl hover:bg-green-600 transition-all active:scale-95 font-inter">
                Hubungi {selectedTalent.name.split(' ')[0]}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
