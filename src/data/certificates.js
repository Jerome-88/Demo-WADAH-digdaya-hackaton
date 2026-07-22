// ── CERTIFICATE REGISTRY (dummy data — simulasi demo, bukan sertifikat resmi) ──
// Canonical certificate content, independent of session state, so the public
// /verifikasi/:certId page resolves the same way no matter who opens it or on
// which device — exactly what "verified by anyone" (README) needs to hold up.
// AppContext.issueCertificate() only tracks WHICH skillIds were earned in the
// current session; the actual certificate content always comes from here.
export const CERTIFICATE_REGISTRY = {
  desain: {
    certId: 'WADAH-DSN-2026-0742',
    skillId: 'desain',
    skillLabel: 'Desain Grafis',
    holderName: 'Rina Kusumawati',
    verifierName: 'Tim Human Reviewer WADAH',
    finalProjectTitle: 'Kampanye Instagram Feed — Toko Batik Nusantara',
    validityYears: 3,
    // Narrative shown on the public verification page — describes what
    // completing this Skill Map certifies (no numeric score by design).
    description:
      'Sertifikat Kompetensi Desain Grafis diberikan kepada talenta yang telah menuntaskan seluruh Skill Map Desain Grafis di WADAH — dari fondasi estetika, sistem visual brand, hingga proyek kampanye nyata untuk UMKM. Berbeda dari sertifikat berbasis ujian teori, kredensial ini divalidasi lewat simulasi kerja: setiap hasil diperiksa langsung oleh human reviewer berpengalaman industri sebelum diluluskan.',
    competencies: [
      'Kanvas & safe zone konten feed',
      'Tipografi & hierarki visual',
      'Psikologi warna sesuai brand',
      'Interpretasi brief klien',
      'Konsistensi sistem visual multi-aset',
      'Adaptasi desain lintas format',
    ],
  },
  social: {
    certId: 'WADAH-SOC-2026-0815',
    skillId: 'social',
    skillLabel: 'Social Media',
    holderName: 'Rina Kusumawati',
    verifierName: 'Tim Human Reviewer WADAH',
    finalProjectTitle: 'Strategi Konten Bulanan — Roti Bakar Kenangan',
    validityYears: 3,
    description:
      'Sertifikat Kompetensi Social Media diberikan kepada talenta yang telah menuntaskan seluruh Skill Map Social Media di WADAH — dari fondasi konten & hook, sistem konten mingguan, hingga strategi kampanye bulanan multi-platform untuk UMKM. Berbeda dari sertifikat berbasis ujian teori, kredensial ini divalidasi lewat simulasi kerja: setiap hasil diperiksa langsung oleh human reviewer berpengalaman industri sebelum diluluskan.',
    competencies: [
      'Format & hook konten short-video',
      'Copywriting caption & CTA',
      'Pilar konten & kalender editorial',
      'Konsistensi tone of voice brand',
      'Community management & respons cepat',
      'Strategi kampanye bulanan multi-platform',
    ],
  },
  video: {
    certId: 'WADAH-VID-2026-0623',
    skillId: 'video',
    skillLabel: 'Video & Reels',
    holderName: 'Rina Kusumawati',
    verifierName: 'Tim Human Reviewer WADAH',
    finalProjectTitle: 'Kampanye Video Launching Menu — Kopi Kilat Ekspres',
    validityYears: 3,
    description:
      'Sertifikat Kompetensi Video & Reels diberikan kepada talenta yang telah menuntaskan seluruh Skill Map Video & Reels di WADAH — dari fondasi hook & format, konsistensi series video, hingga proyek kampanye multi-video untuk UMKM. Berbeda dari sertifikat berbasis ujian teori, kredensial ini divalidasi lewat simulasi kerja: setiap hasil diperiksa langsung oleh human reviewer berpengalaman industri sebelum diluluskan.',
    competencies: [
      'Rasio & durasi video short-form',
      'Hook visual & retention viewer',
      'Storyboard & perencanaan produksi',
      'Konsistensi gaya edit & musik',
      'Adaptasi konten lintas platform',
      'Directing talent & koordinasi produksi',
    ],
  },
  ecommerce: {
    certId: 'WADAH-ECM-2026-0491',
    skillId: 'ecommerce',
    skillLabel: 'E-Commerce',
    holderName: 'Rina Kusumawati',
    verifierName: 'Tim Human Reviewer WADAH',
    finalProjectTitle: 'Audit & Optimasi Toko — Toko Elektronik Rumahan Jaya',
    validityYears: 3,
    description:
      'Sertifikat Kompetensi E-Commerce diberikan kepada talenta yang telah menuntaskan seluruh Skill Map E-Commerce di WADAH — dari fondasi listing marketplace, optimasi multi-listing, hingga audit dan strategi toko menyeluruh untuk UMKM. Berbeda dari sertifikat berbasis ujian teori, kredensial ini divalidasi lewat simulasi kerja: setiap hasil diperiksa langsung oleh human reviewer berpengalaman industri sebelum diluluskan.',
    competencies: [
      'Optimasi judul listing untuk pencarian',
      'Elemen kepercayaan pembeli (foto & deskripsi)',
      'Konsistensi branding multi-listing',
      'A/B testing & iklan marketplace',
      'Manajemen stok & respons pelanggan',
      'Audit toko & strategi promo',
    ],
  },
  marketing: {
    certId: 'WADAH-MKT-2026-0958',
    skillId: 'marketing',
    skillLabel: 'Digital Marketing',
    holderName: 'Rina Kusumawati',
    verifierName: 'Tim Human Reviewer WADAH',
    finalProjectTitle: 'Campaign Multi-Channel Cabang Baru — Resto Steak Rumahan',
    validityYears: 3,
    description:
      'Sertifikat Kompetensi Digital Marketing diberikan kepada talenta yang telah menuntaskan seluruh Skill Map Digital Marketing di WADAH — dari fondasi campaign iklan, optimasi budget & targeting, hingga strategi campaign multi-channel untuk UMKM. Berbeda dari sertifikat berbasis ujian teori, kredensial ini divalidasi lewat simulasi kerja: setiap hasil diperiksa langsung oleh human reviewer berpengalaman industri sebelum diluluskan.',
    competencies: [
      'Penentuan objective campaign',
      'Audience targeting & efisiensi budget',
      'Copywriting ad & CTA persuasif',
      'A/B testing & optimasi budget iklan',
      'Retargeting audiens',
      'Setup campaign multi-channel',
    ],
  },
  ugc: {
    certId: 'WADAH-UGC-2026-0367',
    skillId: 'ugc',
    skillLabel: 'UGC Creator',
    holderName: 'Rina Kusumawati',
    verifierName: 'Tim Human Reviewer WADAH',
    finalProjectTitle: 'Kampanye Video Review — Suplemen Herbal Sehat Alami',
    validityYears: 3,
    description:
      'Sertifikat Kompetensi UGC Creator diberikan kepada talenta yang telah menuntaskan seluruh Skill Map UGC Creator di WADAH — dari fondasi autentisitas konten, konsistensi karakter & kerja sama brand, hingga proyek kampanye multi-konten untuk UMKM. Berbeda dari sertifikat berbasis ujian teori, kredensial ini divalidasi lewat simulasi kerja: setiap hasil diperiksa langsung oleh human reviewer berpengalaman industri sebelum diluluskan.',
    competencies: [
      'Gaya konten autentik & natural',
      'Struktur storytelling review produk',
      'Etika disclosure & keaslian konten',
      'Konsistensi karakter kreator',
      'Pemahaman kontrak kerja sama dasar',
      'Storytelling personal & compliance endorsement',
    ],
  },
};

export function getCertificateBySkill(skillId) {
  return CERTIFICATE_REGISTRY[skillId] || null;
}

export function getCertificateById(certId) {
  return Object.values(CERTIFICATE_REGISTRY).find(c => c.certId === certId) || null;
}

export function formatCertDate(isoOrDate) {
  const d = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate;
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}
