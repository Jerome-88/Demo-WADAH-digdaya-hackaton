import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Upload, CheckCircle, X, Sparkles } from 'lucide-react';
import StepIndicator from '../../components/StepIndicator';
import { useApp } from '../../context/AppContext';
import { TASK_DATA } from '../../data/mockData';

const SKILL_OPTIONS = [
  { id: 'social',   label: 'Social Media',    emoji: '📱', desc: 'Strategi & konten sosmed' },
  { id: 'copy',     label: 'Copywriting',     emoji: '✍️', desc: 'Teks marketing & artikel' },
  { id: 'desain',   label: 'Desain Grafis',   emoji: '🎨', desc: 'Visual, branding, poster' },
  { id: 'ecommerce',label: 'E-Commerce',      emoji: '🛒', desc: 'Marketplace & toko online' },
  { id: 'webdev',   label: 'Web Dev',         emoji: '💻', desc: 'Frontend & website' },
  { id: 'data',     label: 'Data Analytics',  emoji: '📊', desc: 'Analisis & visualisasi data' },
];

const SKILL_LABEL_MAP = {
  social: 'Social Media',
  copy: 'Copywriting',
  desain: 'Desain Grafis',
  ecommerce: 'E-Commerce',
  webdev: 'Web Dev',
  data: 'Data Analytics',
};

export default function TalentaFlow() {
  const navigate = useNavigate();
  const { selectedSkills, setSelectedSkills } = useApp();

  const [step, setStep] = useState(0);
  const [localSkills, setLocalSkills] = useState([]);
  const [uploadState, setUploadState] = useState('idle'); // idle | analyzing | done
  const [uploadedFile, setUploadedFile] = useState(null);
  const [detectedTags, setDetectedTags] = useState([]);

  const steps = ['Pilih Skill', 'Upload CV/Portfolio', 'Preview Tugas'];
  const doneSet = new Set(Array.from({ length: step }, (_, i) => i));

  function toggleSkill(id) {
    setLocalSkills(prev => {
      if (prev.includes(id)) return prev.filter(s => s !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }

  function handleStep1Next() {
    const labels = localSkills.map(id => SKILL_LABEL_MAP[id]);
    setSelectedSkills(labels);
    setStep(1);
  }

  function simulateUpload(file) {
    setUploadedFile(file ? file.name : 'portfolio_saya.pdf');
    setUploadState('analyzing');
    setTimeout(() => {
      const skillLabels = localSkills.map(id => SKILL_LABEL_MAP[id]);
      const extraTags = ['Bahasa Indonesia (C2)', 'Kerja Mandiri', 'Deadline-Oriented'];
      setDetectedTags([...skillLabels, ...extraTags]);
      setUploadState('done');
    }, 2200);
  }

  function handleFileDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer?.files[0] || e.target?.files?.[0];
    if (file) simulateUpload(file);
  }

  // Task preview
  const primarySkill = localSkills[0] ? SKILL_LABEL_MAP[localSkills[0]] : 'Desain Grafis';
  const taskKey = Object.keys(TASK_DATA).find(k => k === primarySkill) || 'Desain Grafis';
  const task = TASK_DATA[taskKey];

  function handleStartDashboard() {
    navigate(primarySkill === 'Desain Grafis' ? '/rina/level' : '/rina/dashboard');
  }

  return (
    <div className="animate-fade-in max-w-3xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="font-sora font-bold text-deep text-3xl mb-2">Mulai Perjalanan Kariermu</h1>
        <p className="text-gray-500 font-inter">3 langkah untuk membangun portofolio terverifikasi pertamamu</p>
      </div>

      <div className="flex justify-center mb-10">
        <StepIndicator steps={steps} current={step} done={doneSet} />
      </div>

      {/* ── STEP 0: Pilih Skill ── */}
      {step === 0 && (
        <div className="animate-fade-in space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-sora font-bold text-deep text-xl">Pilih Skill Utamamu</h2>
            <span className="text-sm text-gray-400 font-inter">Pilih maksimal 3</span>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {SKILL_OPTIONS.map(skill => {
              const sel = localSkills.includes(skill.id);
              const disabled = !sel && localSkills.length >= 3;
              return (
                <button
                  key={skill.id}
                  onClick={() => !disabled && toggleSkill(skill.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all relative ${
                    sel
                      ? 'border-indigo bg-indigo/5'
                      : disabled
                      ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                      : 'border-gray-200 bg-white hover:border-indigo/40'
                  }`}
                >
                  {sel && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-indigo rounded-full flex items-center justify-center">
                      <CheckCircle size={12} className="text-white" />
                    </div>
                  )}
                  <div className="text-2xl mb-2">{skill.emoji}</div>
                  <div className="font-semibold text-gray-800 font-inter text-sm">{skill.label}</div>
                  <div className="text-gray-400 text-xs font-inter mt-0.5">{skill.desc}</div>
                </button>
              );
            })}
          </div>

          {localSkills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {localSkills.map(id => (
                <span key={id} className="flex items-center gap-1.5 bg-indigo/10 text-indigo text-sm px-3 py-1.5 rounded-full font-inter">
                  {SKILL_LABEL_MAP[id]}
                  <button onClick={() => toggleSkill(id)}><X size={12} /></button>
                </span>
              ))}
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleStep1Next}
              disabled={localSkills.length === 0}
              className="flex items-center gap-2 bg-indigo text-white font-bold px-7 py-3 rounded-xl hover:bg-indigo-dark transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 font-inter"
            >
              Lanjut <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 1: Upload ── */}
      {step === 1 && (
        <div className="animate-fade-in space-y-6">
          <h2 className="font-sora font-bold text-deep text-xl">Upload CV & Portofolio</h2>
          <p className="text-gray-500 font-inter text-sm">AI akan menganalisis pengalamanmu secara otomatis (opsional)</p>

          {uploadState === 'idle' && (
            <div
              onDrop={handleFileDrop}
              onDragOver={e => e.preventDefault()}
              className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center hover:border-indigo/50 transition-colors cursor-pointer"
              onClick={() => document.getElementById('file-upload').click()}
            >
              <input id="file-upload" type="file" className="hidden" onChange={handleFileDrop} />
              <div className="w-14 h-14 bg-indigo/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Upload size={26} className="text-indigo" />
              </div>
              <div className="font-semibold text-gray-700 font-inter mb-1">Drag & drop atau klik untuk upload</div>
              <div className="text-gray-400 text-sm font-inter">PDF, JPG, PNG — maks 10MB</div>
              <button
                onClick={e => { e.stopPropagation(); simulateUpload(null); }}
                className="mt-4 text-xs text-indigo underline font-inter"
              >
                💡 Simulasikan upload (demo)
              </button>
            </div>
          )}

          {uploadState === 'analyzing' && (
            <div className="border-2 border-indigo/30 rounded-2xl p-10 text-center bg-indigo/5">
              <div className="w-12 h-12 border-4 border-indigo border-t-transparent rounded-full animate-spin-fast mx-auto mb-4" />
              <div className="font-semibold text-indigo font-inter">AI Menganalisis Dokumenmu…</div>
              <div className="text-gray-500 text-sm font-inter mt-1">Mendeteksi skill & pengalaman</div>
            </div>
          )}

          {uploadState === 'done' && (
            <div className="border-2 border-green/30 rounded-2xl p-6 bg-green/5 animate-pop">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green rounded-full flex items-center justify-center">
                  <CheckCircle size={18} className="text-white" />
                </div>
                <div>
                  <div className="font-semibold text-green font-inter">{uploadedFile} — Berhasil dianalisis!</div>
                  <div className="text-gray-500 text-sm font-inter">Skill berikut terdeteksi:</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {detectedTags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 bg-white border border-green/30 text-green text-xs px-3 py-1 rounded-full font-inter">
                    <Sparkles size={10} /> {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between">
            <button onClick={() => setStep(0)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-inter text-sm">
              <ArrowLeft size={16} /> Kembali
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="text-gray-400 hover:text-gray-600 font-inter text-sm transition-colors"
              >
                Lewati
              </button>
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-2 bg-indigo text-white font-bold px-6 py-3 rounded-xl hover:bg-indigo-dark transition-all active:scale-95 font-inter"
              >
                Lanjut <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 2: Task Preview ── */}
      {step === 2 && (
        <div className="animate-fade-in space-y-5">
          <div>
            <div className="inline-flex items-center gap-2 bg-amber/10 border border-amber/30 rounded-full px-3 py-1 mb-3">
              <span className="text-amber text-xs font-semibold font-inter">Tugas Pertama Untukmu</span>
            </div>
            <h2 className="font-sora font-bold text-deep text-2xl">{task.title}</h2>
            <p className="text-gray-500 font-inter mt-1">{task.client}</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <p className="text-gray-600 font-inter leading-relaxed text-sm">{task.description}</p>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-indigo/5 rounded-xl p-3 text-center">
                <div className="font-sora font-bold text-indigo">{task.reward}</div>
                <div className="text-xs text-gray-400 font-inter">Reward</div>
              </div>
              <div className="bg-amber/5 rounded-xl p-3 text-center">
                <div className="font-sora font-bold text-amber">{task.deadline}</div>
                <div className="text-xs text-gray-400 font-inter">Deadline</div>
              </div>
              <div className="bg-green/5 rounded-xl p-3 text-center">
                <div className="font-sora font-bold text-green">{task.level}</div>
                <div className="text-xs text-gray-400 font-inter">Level</div>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-400 font-inter uppercase tracking-wide mb-2">Ketentuan</div>
              <ul className="space-y-2">
                {task.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600 font-inter">
                    <CheckCircle size={14} className="text-green mt-0.5 flex-shrink-0" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-amber/5 border border-amber/20 rounded-xl p-3">
              <div className="text-xs font-semibold text-amber font-inter mb-1">💡 Tips</div>
              <p className="text-sm text-gray-600 font-inter">{task.tips}</p>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button onClick={() => setStep(1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-inter text-sm">
              <ArrowLeft size={16} /> Kembali
            </button>
            <button
              onClick={handleStartDashboard}
              className="flex items-center gap-2 bg-green text-white font-bold px-7 py-3.5 rounded-xl hover:bg-green-600 transition-all active:scale-95 font-inter"
            >
              Masuk Dashboard Karier
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
