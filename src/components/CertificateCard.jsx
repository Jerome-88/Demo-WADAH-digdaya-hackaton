import { useState, useRef, useLayoutEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Maximize2, Download, X } from 'lucide-react';
import { formatCertDate } from '../data/certificates';

// The certificate is a FIXED artifact drawn at a constant 1000×704 canvas so it
// renders pixel-identical everywhere — it never reflows to fit its container or
// inherits page styles (e.g. text-align). Pages show it as a scaled-down
// preview; clicking opens the full-size view with a print-to-PDF download.
const ART_W = 1000;
const ART_H = 704;

// ── The fixed artifact (never scaled here; the wrapper handles scaling) ──
function CertificateArtifact({ cert, issuedDate, validUntilDate, verificationUrl }) {
  return (
    <div
      style={{
        width: ART_W, height: ART_H, containerType: 'inline-size', textAlign: 'left',
        background: 'linear-gradient(158deg, #28225F 0%, #1E1B4B 46%, #120F30 100%)',
        padding: '2.6cqw', boxSizing: 'border-box', borderRadius: 8,
      }}
    >
      {/* paper */}
      <div className="w-full h-full bg-white relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 80% 40%, rgba(30,27,75,0.05), rgba(30,27,75,0) 58%), repeating-radial-gradient(circle at 80% 40%, rgba(30,27,75,0.03) 0 1px, transparent 1px 11px), repeating-linear-gradient(45deg, rgba(30,27,75,0.02) 0 1px, transparent 1px 9px)' }}
        />
        <div className="absolute pointer-events-none" style={{ inset: '1.4cqw', border: '1px solid rgba(30,27,75,0.18)' }} />

        <div className="absolute flex flex-col" style={{ inset: '3.3cqw', zIndex: 2 }}>
          {/* header */}
          <div className="flex items-center" style={{ gap: '1.1cqw' }}>
            <div className="rounded-lg overflow-hidden shrink-0" style={{ width: '4.6cqw', height: '4.6cqw' }}>
              <img src="/logo.png" alt="WADAH" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col" style={{ gap: '0.2cqw' }}>
              <div className="font-sora font-extrabold leading-none" style={{ fontSize: '2.4cqw', letterSpacing: '0.04em', color: '#1E1B4B' }}>WADAH</div>
              <div className="font-sora font-semibold uppercase" style={{ fontSize: '0.68cqw', letterSpacing: '0.2em', color: '#8E88AC' }}>Work-Simulation · AI-Driven Augmented Hiring</div>
            </div>
          </div>

          {/* cert number pill */}
          <div style={{ marginTop: '1.6cqw' }}>
            <span className="inline-flex items-center font-sora font-semibold text-white rounded-full" style={{ gap: '0.5cqw', background: '#1E1B4B', fontSize: '0.7cqw', letterSpacing: '0.1em', padding: '0.5cqw 1cqw' }}>
              <span className="rounded-full shrink-0" style={{ width: '0.5cqw', height: '0.5cqw', background: '#D97706' }} />
              NO. {cert.certId}
            </span>
          </div>

          {/* body */}
          <div className="flex-1 flex flex-col justify-center" style={{ maxWidth: '62%', paddingRight: '1.5cqw' }}>
            <div className="font-sora font-bold uppercase" style={{ fontSize: '0.78cqw', letterSpacing: '0.28em', color: '#9691B0', marginBottom: '0.6cqw' }}>Diberikan kepada</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '4.4cqw', lineHeight: 1.05, color: '#1B1849', marginBottom: '0.55cqw' }}>{cert.holderName}</div>
            <div className="font-sora font-medium" style={{ fontSize: '0.92cqw', color: '#4D4770', marginBottom: '0.8cqw' }}>atas keberhasilan menyelesaikan seluruh Skill Map</div>
            <div className="font-sora font-bold" style={{ fontSize: '2.1cqw', lineHeight: 1.1, color: '#7C3AED' }}>{cert.skillLabel}</div>
            <div className="rounded-full" style={{ width: '4cqw', height: '0.18cqw', marginTop: '0.6cqw', background: '#7C3AED' }} />
            <div className="font-sora font-medium" style={{ fontSize: '0.72cqw', color: '#8E88AC', marginTop: '0.9cqw' }}>
              Proyek akhir: {cert.finalProjectTitle}
            </div>
          </div>

          {/* footer */}
          <div className="flex justify-between items-end" style={{ gap: '1.6cqw' }}>
            <div className="flex flex-col">
              <div className="font-sora font-bold uppercase" style={{ fontSize: '0.62cqw', letterSpacing: '0.22em', color: '#9691B0', marginBottom: '0.25cqw' }}>Diterbitkan pada</div>
              <div className="font-sora font-semibold" style={{ fontSize: '0.88cqw', color: '#2E2A66', marginBottom: '1cqw' }}>{formatCertDate(issuedDate)}</div>
              <div style={{ fontFamily: "'Sacramento', cursive", fontSize: '2.6cqw', lineHeight: 0.7, color: '#1E1B4B' }}>WADAH</div>
              <div style={{ width: '10.5cqw', height: 1, background: '#2E2A66', margin: '0.4cqw 0' }} />
              <div className="font-sora font-bold" style={{ fontSize: '0.78cqw', color: '#1E1B4B' }}>{cert.verifierName}</div>
              <div className="font-sora font-medium" style={{ fontSize: '0.62cqw', color: '#8E88AC', marginTop: '0.15cqw' }}>Divalidasi oleh Human Reviewer</div>
            </div>
            <div className="flex items-end" style={{ gap: '1cqw' }}>
              <div className="flex flex-col items-end text-right">
                <div className="font-sora font-bold uppercase" style={{ fontSize: '0.62cqw', letterSpacing: '0.2em', color: '#9691B0', marginBottom: '0.3cqw' }}>Verifikasi Sertifikat</div>
                <div className="font-sora font-semibold whitespace-nowrap" style={{ fontSize: '0.74cqw', color: '#7C3AED' }}>{verificationUrl.replace(/^https?:\/\//, '')}</div>
                <div className="font-sora font-medium whitespace-nowrap" style={{ fontSize: '0.66cqw', color: '#8E88AC', marginTop: '0.25cqw' }}>Berlaku hingga {formatCertDate(validUntilDate)}</div>
              </div>
              <div className="bg-white rounded shrink-0" style={{ padding: '0.4cqw', border: '1px solid rgba(30,27,75,0.14)' }}>
                <div style={{ width: '5.4cqw', height: '5.4cqw' }}>
                  <QRCodeSVG value={verificationUrl} size={140} level="M" style={{ width: '100%', height: '100%', display: 'block' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* corner ribbon + seal */}
      <div
        className="absolute flex flex-col items-center"
        style={{
          top: '-2.6cqw', right: '7cqw', width: '14cqw', height: '27cqw',
          background: 'linear-gradient(180deg, #2A2570 0%, #1E1B4B 58%, #14113A 100%)',
          borderTop: '0.24cqw solid #D97706',
          boxShadow: '0 1cqw 2cqw rgba(9,14,28,0.42)',
          clipPath: 'polygon(0 0, 100% 0, 100% 88%, 50% 100%, 0 88%)',
          padding: '3cqw 1cqw 0', boxSizing: 'border-box', zIndex: 5,
        }}
      >
        <div style={{ width: '1.6cqw', height: '0.12cqw', background: '#D97706', marginBottom: '0.9cqw' }} />
        <div className="font-sora font-extrabold text-center text-white" style={{ fontSize: '1.25cqw', letterSpacing: '0.12em', lineHeight: 1.25 }}>SERTIFIKAT<br />KOMPETENSI</div>
        <div className="font-sora font-semibold" style={{ fontSize: '0.6cqw', letterSpacing: '0.32em', color: 'rgba(251,191,36,0.92)', marginTop: '0.5cqw' }}>KELULUSAN</div>
        <div style={{ width: '9.4cqw', height: '9.4cqw', marginTop: '1.3cqw' }}>
          <svg viewBox="0 0 220 220" style={{ width: '100%', height: '100%', display: 'block' }}>
            <circle cx="110" cy="110" r="104" style={{ fill: 'none', stroke: '#D97706', strokeWidth: 1.4 }} />
            <circle cx="110" cy="110" r="97" style={{ fill: 'none', stroke: '#D97706', strokeWidth: 3 }} />
            <circle cx="110" cy="110" r="66" style={{ fill: 'none', stroke: 'rgba(245,158,11,0.55)', strokeWidth: 1 }} />
            <circle cx="110" cy="110" r="80" style={{ fill: 'none', stroke: '#F59E0B', strokeWidth: 4.5, strokeDasharray: '2 8.4' }} />
            <rect x="9" y="105" width="10" height="10" transform="rotate(45 14 110)" style={{ fill: '#D97706' }} />
            <rect x="201" y="105" width="10" height="10" transform="rotate(45 206 110)" style={{ fill: '#D97706' }} />
            <rect x="105" y="9" width="10" height="10" transform="rotate(45 110 14)" style={{ fill: '#D97706' }} />
            <rect x="105" y="201" width="10" height="10" transform="rotate(45 110 206)" style={{ fill: '#D97706' }} />
            <polygon points="110,80 137,96 137,128 110,144 83,128 83,96" style={{ fill: 'rgba(30,27,75,0.45)', stroke: '#D97706', strokeWidth: 2 }} />
            <polygon points="110,88 130,100 130,124 110,136 90,124 90,100" style={{ fill: 'none', stroke: 'rgba(245,158,11,0.5)', strokeWidth: 1 }} />
            <text x="110" y="126" style={{ fill: '#FCD34D', fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 34 }} textAnchor="middle">W</text>
            <text x="110" y="164" style={{ fill: '#F59E0B', fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: 4 }} textAnchor="middle">WADAH</text>
            <rect x="83" y="156.5" width="6" height="6" transform="rotate(45 86 159.5)" style={{ fill: '#D97706' }} />
            <rect x="131" y="156.5" width="6" height="6" transform="rotate(45 134 159.5)" style={{ fill: '#D97706' }} />
          </svg>
        </div>
      </div>
    </div>
  );
}

// ── Scales the fixed artifact down to fit its container width (never up past
// 1:1). Reserves the correct box height so surrounding layout stays intact. ──
function ScaledCertificate({ maxWidth, ...artifactProps }) {
  const wrapRef = useRef(null);
  const [scale, setScale] = useState(0.5);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => {
      const avail = Math.min(el.clientWidth, maxWidth ?? Infinity);
      setScale(Math.min(avail / ART_W, 1));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [maxWidth]);

  return (
    <div ref={wrapRef} style={{ width: '100%' }}>
      <div style={{ position: 'relative', width: ART_W * scale, height: ART_H * scale, margin: '0 auto' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          <CertificateArtifact {...artifactProps} />
        </div>
      </div>
    </div>
  );
}

// ── Full-size lightbox + print-to-PDF ──
function CertificateModal({ onClose, ...artifactProps }) {
  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(15,15,26,0.94)' }}
      onClick={onClose}
    >
      <div className="w-full max-w-4xl" onClick={e => e.stopPropagation()}>
        <ScaledCertificate maxWidth={920} {...artifactProps} />
        <div className="flex justify-center gap-3 mt-5">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-purple hover:brightness-110 text-white font-bold text-sm px-5 py-3 rounded-xl transition-all cursor-pointer border-0"
          >
            <Download size={16} /> Unduh PDF
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-2 border border-white/20 text-white/70 hover:bg-white/10 font-semibold text-sm px-5 py-3 rounded-xl transition-all cursor-pointer bg-transparent"
          >
            <X size={16} /> Tutup
          </button>
        </div>
        <p className="text-center text-white/40 text-xs font-inter mt-3">Tips: pilih "Save as PDF" di dialog cetak untuk menyimpan sertifikat.</p>
      </div>

      {/* Natural-size copy used only by the print stylesheet (off-screen otherwise) */}
      <div id="cert-print" className="cert-print-only" aria-hidden="true">
        <CertificateArtifact {...artifactProps} />
      </div>
    </div>
  );
}

// ── Public: an inline preview that opens the full-size view on click ──
export default function CertificateCard({ cert, issuedDate, validUntilDate, verificationUrl, interactive = true }) {
  const [open, setOpen] = useState(false);
  const artifactProps = { cert, issuedDate, validUntilDate, verificationUrl };

  return (
    <>
      <div
        className={`relative rounded-lg overflow-hidden ${interactive ? 'cursor-pointer group' : ''}`}
        onClick={interactive ? () => setOpen(true) : undefined}
      >
        <ScaledCertificate {...artifactProps} />
        {interactive && (
          <div
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: 'rgba(15,15,26,0.45)' }}
          >
            <span className="flex items-center gap-2 text-white font-inter font-bold text-sm bg-black/40 px-4 py-2 rounded-full">
              <Maximize2 size={15} /> Klik untuk lihat ukuran penuh
            </span>
          </div>
        )}
      </div>
      {open && <CertificateModal onClose={() => setOpen(false)} {...artifactProps} />}
    </>
  );
}
