import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ShieldX, ArrowLeft, Check, Copy } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getCertificateById, formatCertDate } from '../data/certificates';
import CertificateCard from '../components/CertificateCard';

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
      <div className="min-h-screen bg-bg flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white rounded-2xl border-2 border-gray-100 p-8 text-center">
          <ShieldX size={40} className="text-rose-500 mx-auto mb-4" />
          <h1 className="font-sora font-bold text-deep text-xl mb-2">Sertifikat Tidak Ditemukan</h1>
          <p className="text-gray-500 font-inter text-sm mb-6">Nomor sertifikat "{certId}" tidak terdaftar di sistem WADAH.</p>
          <Link to="/" className="inline-flex items-center gap-2 text-indigo font-semibold font-inter text-sm">
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
  const initials = cert.holderName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

  function handleCopy() {
    navigator.clipboard?.writeText(verificationUrl)
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); })
      .catch(() => {});
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* ── HERO: status verifikasi + preview sertifikat ── */}
      <section className="px-4 pt-10 pb-8 text-center" style={{ background: 'linear-gradient(180deg, #F0EEFF 0%, #F8F7FF 100%)' }}>
        <div className="max-w-2xl mx-auto">
          <div className="text-purple text-[11px] font-inter font-bold uppercase tracking-[0.18em] mb-3">Verifikasi Kredensial Digital</div>

          <div className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 border font-inter font-bold text-sm ${
            expired ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-green/5 border-green/40 text-green'
          }`}>
            {expired
              ? <ShieldX size={16} />
              : <span className="w-4 h-4 rounded-full bg-green text-white inline-flex items-center justify-center"><Check size={11} strokeWidth={3} /></span>}
            {expired ? 'Sertifikat Kedaluwarsa' : 'Terverifikasi & Asli'}
          </div>

          <CertificateCard
            cert={cert}
            issuedDate={issuedDate}
            validUntilDate={validUntilDate}
            verificationUrl={verificationUrl}
          />

          <p className="text-gray-400 text-xs font-inter mt-3">Diverifikasi oleh sistem WADAH · {formatCertDate(new Date())}</p>
        </div>
      </section>

      {/* ── CONTENT ── */}
      <div className="max-w-2xl mx-auto px-4 pb-16 space-y-4 -mt-2">
        {/* Ringkasan penerima */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-4">
          <div className="rounded-full bg-purple text-white flex items-center justify-center font-sora font-bold text-lg shrink-0" style={{ width: 52, height: 52 }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-sora font-bold text-deep text-base md:text-lg truncate">{cert.holderName}</div>
            <div className="text-indigo font-inter font-semibold text-xs md:text-sm">Kompetensi {cert.skillLabel} · Human Reviewed</div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-gray-400 text-[10px] font-inter uppercase tracking-wide">No. Sertifikat</div>
            <div className="text-deep text-xs font-mono">{cert.certId}</div>
          </div>
        </div>

        {/* Tentang Sertifikasi Ini */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h2 className="font-sora font-bold text-deep text-sm mb-2.5">Tentang Sertifikasi Ini</h2>
          <p className="text-gray-600 text-sm font-inter leading-relaxed">{cert.description}</p>
        </div>

        {/* Kompetensi yang Dikuasai */}
        {cert.competencies?.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h2 className="font-sora font-bold text-deep text-sm mb-3.5">Kompetensi yang Dikuasai</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2.5">
              {cert.competencies.map(item => (
                <div key={item} className="flex items-start gap-2.5 text-sm text-gray-600 font-inter">
                  <Check size={15} className="text-green mt-0.5 shrink-0" strokeWidth={2.5} />
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detail penerbitan */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 grid grid-cols-2 gap-4">
          <div>
            <div className="text-gray-400 text-[10px] font-inter font-bold uppercase tracking-wide">Diterbitkan</div>
            <div className="text-deep text-sm font-inter font-semibold mt-0.5">{formatCertDate(issuedDate)}</div>
          </div>
          <div>
            <div className="text-gray-400 text-[10px] font-inter font-bold uppercase tracking-wide">Berlaku Hingga</div>
            <div className="text-deep text-sm font-inter font-semibold mt-0.5">{formatCertDate(validUntilDate)}</div>
          </div>
          <div>
            <div className="text-gray-400 text-[10px] font-inter font-bold uppercase tracking-wide">Ditandatangani</div>
            <div className="text-deep text-sm font-inter font-semibold mt-0.5">{cert.verifierName}</div>
          </div>
          <div>
            <div className="text-gray-400 text-[10px] font-inter font-bold uppercase tracking-wide">Penerbit</div>
            <div className="text-deep text-sm font-inter font-semibold mt-0.5">WADAH</div>
          </div>
        </div>

        {/* Bagikan verifikasi */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-deep text-sm font-inter font-semibold">Bagikan verifikasi ini</div>
            <div className="text-gray-400 text-[11px] font-mono truncate">{verificationUrl.replace(/^https?:\/\//, '')}</div>
          </div>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 font-inter font-bold text-xs px-4 py-2.5 rounded-xl transition-all shrink-0 cursor-pointer border-0 ${
              copied ? 'bg-green text-white' : 'bg-indigo text-white hover:brightness-110'
            }`}
          >
            {copied ? <><Check size={14} /> Tersalin</> : <><Copy size={14} /> Salin tautan</>}
          </button>
        </div>

        <p className="text-center text-gray-400 text-xs font-inter pt-2">
          Data simulasi untuk keperluan demo Hackathon DIGDAYA X 2026 — bukan sertifikat resmi berkekuatan hukum.
        </p>
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-indigo font-semibold font-inter text-sm">
            <ArrowLeft size={15} /> Kembali ke Beranda WADAH
          </Link>
        </div>
      </div>
    </div>
  );
}
