import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, ExternalLink } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getCertificateBySkill } from '../../data/certificates';
import CertificateCard from '../../components/CertificateCard';

export default function CertificatePage() {
  const navigate = useNavigate();
  const { skillId } = useParams();
  const { certificateEarnedAt } = useApp();

  const cert = getCertificateBySkill(skillId);
  const earnedAt = certificateEarnedAt[skillId];

  // Guard against direct URL visits for a skill that hasn't been certified
  // this session, or a skill with no certificate content authored yet.
  useEffect(() => {
    if (!cert || !earnedAt) navigate('/rina/task', { replace: true });
  }, [cert, earnedAt, navigate]);

  if (!cert || !earnedAt) return null;

  const issuedDate = new Date(earnedAt);
  const validUntilDate = new Date(issuedDate);
  validUntilDate.setFullYear(validUntilDate.getFullYear() + cert.validityYears);
  const verificationUrl = `${window.location.origin}/verifikasi/${cert.certId}`;

  return (
    <div className="min-h-screen bg-[#0F0F1A]">
      <header className="sticky top-0 z-30 h-14 flex items-center px-4 md:px-6 bg-[#1A1A2E]/95 backdrop-blur border-b border-white/5">
        <button
          onClick={() => navigate('/rina/profile')}
          className="flex items-center gap-2 text-white/60 hover:text-white text-sm font-inter transition-colors bg-transparent border-0 cursor-pointer"
        >
          <ArrowLeft size={16} />
          Kembali ke Profil
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 md:py-14">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center gap-2 mb-8">
          <div className="text-5xl mb-1">🎓</div>
          <h1 className="text-white font-sora font-extrabold text-2xl">Sertifikat Kompetensi</h1>
          <p className="text-white/50 font-inter text-sm">Diterbitkan resmi oleh WADAH setelah proyek akhir disetujui human reviewer</p>
        </motion.div>

        {/* ── THE CERTIFICATE — shared component, dipakai juga di halaman verifikasi ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="mb-6"
        >
          <CertificateCard cert={cert} issuedDate={issuedDate} validUntilDate={validUntilDate} verificationUrl={verificationUrl} />
        </motion.div>

        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 mb-5 flex items-start gap-2.5">
          <ShieldCheck size={16} className="text-green-400 shrink-0 mt-0.5" />
          <p className="text-white/50 text-xs font-inter leading-relaxed">
            Sertifikat ini punya nomor verifikasi unik dan bisa dicek keasliannya oleh siapa saja lewat QR di atas atau tautan verifikasi publik.
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => navigate(`/verifikasi/${cert.certId}`)}
            className="w-full flex items-center justify-center gap-2 bg-purple hover:brightness-110 text-white font-bold py-3.5 rounded-xl transition-all text-sm cursor-pointer border-0"
          >
            <ExternalLink size={16} />
            Buka Halaman Verifikasi
          </button>
          <button
            onClick={() => navigate('/rina/profile')}
            className="w-full border border-white/15 text-white/60 hover:bg-white/5 font-semibold py-3 rounded-xl transition-all text-sm cursor-pointer bg-transparent"
          >
            Kembali ke Profil
          </button>
        </div>

        <p className="text-center text-white/20 text-[10px] font-inter mt-6">
          Data simulasi untuk keperluan demo — bukan sertifikat resmi berkekuatan hukum.
        </p>
      </main>
    </div>
  );
}
