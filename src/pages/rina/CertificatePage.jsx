import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, GraduationCap, ShieldCheck, ExternalLink } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getCertificateBySkill } from '../../data/certificates';
import CertificateCard from '../../components/CertificateCard';

const BLUE = '#2b6fff';
const GREEN = '#00c897';
const ORANGE = '#f37219';

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
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-30 h-14 flex items-center px-4 md:px-6" style={{ background: BLUE }}>
        <button
          onClick={() => navigate('/rina/profile')}
          className="flex items-center gap-2 text-white hover:text-white/80 text-sm font-bold font-inter transition-colors bg-transparent border-0 cursor-pointer"
        >
          <ArrowLeft size={16} />
          Kembali ke Profil
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 md:py-14">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center gap-2 mb-8">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mb-1" style={{ background: '#eef2fe' }}>
            <GraduationCap size={26} style={{ color: BLUE }} />
          </div>
          <h1 className="font-sora font-extrabold text-2xl" style={{ color: BLUE }}>Sertifikat Kompetensi</h1>
          <p className="text-gray-500 font-inter text-sm">Diterbitkan resmi oleh WADAH setelah proyek akhir disetujui human reviewer</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="mb-6"
        >
          <CertificateCard cert={cert} issuedDate={issuedDate} validUntilDate={validUntilDate} verificationUrl={verificationUrl} />
        </motion.div>

        <div className="bg-white border-2 rounded-xl p-4 mb-5 flex items-start gap-2.5" style={{ borderColor: BLUE }}>
          <ShieldCheck size={16} style={{ color: GREEN }} className="shrink-0 mt-0.5" />
          <p className="text-gray-500 text-xs font-inter leading-relaxed">
            Sertifikat ini punya nomor verifikasi unik dan bisa dicek keasliannya oleh siapa saja lewat QR di atas atau tautan verifikasi publik.
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => navigate(`/verifikasi/${cert.certId}`)}
            className="w-full flex items-center justify-center gap-2 text-white font-bold py-3.5 rounded-xl transition-all text-sm cursor-pointer border-0 hover:brightness-110"
            style={{ background: ORANGE }}
          >
            <ExternalLink size={16} />
            Buka Halaman Verifikasi
          </button>
          <button
            onClick={() => navigate('/rina/profile')}
            className="w-full font-semibold py-3 rounded-xl transition-all text-sm cursor-pointer bg-transparent border-2"
            style={{ color: BLUE, borderColor: BLUE }}
          >
            Kembali ke Profil
          </button>
        </div>

        <p className="text-center text-gray-400 text-[10px] font-inter mt-6">
          Data simulasi untuk keperluan demo — bukan sertifikat resmi berkekuatan hukum.
        </p>
      </main>
    </div>
  );
}
