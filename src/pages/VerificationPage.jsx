import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ShieldX, ArrowLeft, Check, Copy } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getCertificateById, formatCertDate } from '../data/certificates';
import CertificateCard from '../components/CertificateCard';

const BLUE = '#2b6fff';
const GREEN = '#00c897';
const ORANGE = '#f37219';

// Public, session-independent certificate lookup — reachable by anyone who
// scans the QR on a certificate or opens the credential URL from LinkedIn
// (README's "portofolio bisa diverifikasi siapapun"), regardless of whether
// their own browser ever earned anything.
export default function VerificationPage() {
  const { certId } = useParams();
  const { certificateEarnedAt } = useApp();
  const [copied, setCopied] = useState(false);
  const cert = getCertificateById(certId);

  if (!cert) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white rounded-2xl border-2 p-8 text-center" style={{ borderColor: BLUE }}>
          <ShieldX size={40} className="mx-auto mb-4" style={{ color: '#e5484d' }} />
          <h1 className="font-sora font-bold text-[#1a1a1a] text-xl mb-2">Sertifikat Tidak Ditemukan</h1>
          <p className="text-gray-500 font-inter text-sm mb-6">Nomor sertifikat "{certId}" tidak terdaftar di sistem WADAH.</p>
          <Link to="/" className="inline-flex items-center gap-2 font-semibold font-inter text-sm" style={{ color: BLUE }}>
            <ArrowLeft size={15} /> Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  // If verified from the same session/tab that earned it, show the real
  // earned timestamp; otherwise (a recruiter opening it on their own device)
  // fall back to "now" so the page still resolves consistently either way.
  const earnedAt = certificateEarnedAt[cert.skillId] || new Date().toISOString();
  const issuedDate = new Date(earnedAt);
  const validUntilDate = new Date(issuedDate);
  validUntilDate.setFullYear(validUntilDate.getFullYear() + cert.validityYears);
  const expired = new Date() > validUntilDate;
  const verificationUrl = `${window.location.origin}/verifikasi/${cert.certId}`;

  function handleCopy() {
    navigator.clipboard?.writeText(verificationUrl)
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); })
      .catch(() => {});
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 h-14 flex items-center justify-center px-4 md:px-6 relative" style={{ background: BLUE }}>
        <Link to="/rina/task" className="absolute left-4 flex items-center gap-2 text-white/90 hover:text-white text-sm font-bold font-inter transition-colors">
          <ArrowLeft size={16} /> Peta Misi
        </Link>
        <h1 className="text-white font-sora font-bold text-base">Verifikasi</h1>
      </header>

      {/* ── HERO: status verifikasi + preview sertifikat ── */}
      <section className="px-4 pt-10 pb-8 text-center bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="text-[11px] font-inter font-bold uppercase tracking-[0.18em] mb-3" style={{ color: BLUE }}>Verifikasi Kredensial Digital</div>

          <div className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 border font-inter font-bold text-sm ${
            expired ? 'bg-amber-50 border-amber-200 text-amber-600' : ''
          }`} style={expired ? undefined : { background: 'rgba(0,200,151,0.08)', borderColor: GREEN, color: GREEN }}>
            {expired
              ? <ShieldX size={16} />
              : <span className="w-4 h-4 rounded-full text-white inline-flex items-center justify-center" style={{ background: GREEN }}><Check size={11} strokeWidth={3} /></span>}
            {expired ? 'Sertifikat Kedaluwarsa' : 'Terverifikasi & Asli'}
          </div>

          <CertificateCard
            cert={cert}
            issuedDate={issuedDate}
            validUntilDate={validUntilDate}
            verificationUrl={verificationUrl}
          />

          <p className="text-xs font-inter mt-3" style={{ color: ORANGE }}>Diverifikasi oleh sistem WADAH · {formatCertDate(new Date())}</p>
        </div>
      </section>

      {/* ── CONTENT ── */}
      <div className="max-w-2xl mx-auto px-4 pb-16 space-y-4">
        {/* Ringkasan penerima */}
        <div className="bg-white border-2 rounded-2xl p-4 flex items-center gap-4" style={{ borderColor: BLUE }}>
          <img src="/rina.jpg" alt={cert.holderName} className="rounded-full object-cover shrink-0" style={{ width: 52, height: 52 }} />
          <div className="flex-1 min-w-0">
            <div className="font-sora font-bold text-[#1a1a1a] text-base md:text-lg truncate">{cert.holderName}</div>
            <div className="font-inter font-semibold italic text-xs md:text-sm" style={{ color: BLUE }}>Kompetensi {cert.skillLabel} · Human Reviewed</div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[#1a1a1a] text-[10px] font-inter font-bold uppercase tracking-wide">No. Sertifikat</div>
            <div className="text-xs font-mono font-bold mt-0.5" style={{ color: ORANGE }}>{cert.certId}</div>
          </div>
        </div>

        {/* Tentang Sertifikasi Ini */}
        <div className="bg-white border-2 rounded-2xl p-5" style={{ borderColor: BLUE }}>
          <h2 className="font-sora font-bold text-sm mb-2.5" style={{ color: BLUE }}>Tentang Sertifikasi ini</h2>
          <p className="text-sm font-inter italic leading-relaxed" style={{ color: BLUE }}>{cert.description}</p>
        </div>

        {/* Kompetensi yang Dikuasai */}
        {cert.competencies?.length > 0 && (
          <div className="bg-white border-2 rounded-2xl p-5" style={{ borderColor: BLUE }}>
            <h2 className="font-sora font-bold text-sm mb-3.5" style={{ color: BLUE }}>Kompetensi yang Dikuasai</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2.5">
              {cert.competencies.map(item => (
                <div key={item} className="flex items-center gap-2.5 text-sm text-[#1a1a1a] font-inter">
                  <span className="w-4 h-4 rounded-full text-white flex items-center justify-center shrink-0" style={{ background: GREEN }}>
                    <Check size={10} strokeWidth={3} />
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detail penerbitan */}
        <div className="bg-white border-2 rounded-2xl p-5 grid grid-cols-2 gap-4" style={{ borderColor: BLUE }}>
          <div>
            <div className="text-[10px] font-inter font-bold uppercase tracking-wide" style={{ color: BLUE }}>Diterbitkan</div>
            <div className="text-[#1a1a1a] text-sm font-inter font-semibold mt-0.5">{formatCertDate(issuedDate)}</div>
          </div>
          <div>
            <div className="text-[10px] font-inter font-bold uppercase tracking-wide" style={{ color: BLUE }}>Berlaku Hingga</div>
            <div className="text-[#1a1a1a] text-sm font-inter font-semibold mt-0.5">{formatCertDate(validUntilDate)}</div>
          </div>
          <div>
            <div className="text-[10px] font-inter font-bold uppercase tracking-wide" style={{ color: BLUE }}>Ditandatangani</div>
            <div className="text-[#1a1a1a] text-sm font-inter font-semibold mt-0.5">{cert.verifierName}</div>
          </div>
          <div>
            <div className="text-[10px] font-inter font-bold uppercase tracking-wide" style={{ color: BLUE }}>Penerbit</div>
            <div className="text-[#1a1a1a] text-sm font-inter font-semibold mt-0.5">WADAH</div>
          </div>
        </div>

        {/* Bagikan verifikasi */}
        <div className="bg-white border-2 rounded-2xl p-4 flex items-center gap-3" style={{ borderColor: BLUE }}>
          <div className="flex-1 min-w-0">
            <div className="text-[#1a1a1a] text-sm font-inter font-semibold">Bagikan Verifikasi ini</div>
            <div className="text-gray-400 text-[11px] font-mono truncate">{verificationUrl.replace(/^https?:\/\//, '')}</div>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 font-inter font-bold text-xs px-4 py-2.5 rounded-full transition-all shrink-0 cursor-pointer border-0 text-white hover:brightness-110"
            style={{ background: copied ? GREEN : ORANGE }}
          >
            {copied ? <><Check size={14} /> Tersalin</> : <><Copy size={14} /> Salin Tautan</>}
          </button>
        </div>

        <p className="text-center text-xs font-inter pt-2" style={{ color: ORANGE }}>
          Data simulasi untuk keperluan demo Hackathon DIGDAYA X 2026 — bukan sertifikat resmi berkekuatan hukum.
        </p>
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 font-semibold font-inter text-sm" style={{ color: BLUE }}>
            <ArrowLeft size={15} /> Kembali ke Beranda WADAH
          </Link>
        </div>
      </div>
    </div>
  );
}
