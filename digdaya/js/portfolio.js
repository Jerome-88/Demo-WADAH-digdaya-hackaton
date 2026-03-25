/* ============================================================
   WADAH — AI Career Platform
   portfolio.js: Verified Portfolio page logic
   Opens when user clicks a talent card in matching results.
   Depends on: data.js, jasa-flow.js
   ============================================================ */

/* ===== TALENT PORTFOLIO DATA ===== */
const PORTFOLIO_DATA = {
    siti: {
      initials:  'SA',
      name:      'Siti Aminah',
      role:      'Social Media Specialist',
      avatarBg:  'linear-gradient(135deg, #4338CA, #6366F1)',
      overall:   '9.2',
      sims:      '3',
      match:     '97%',
      scores: [
        { label: 'Social Media Management', val: 9.4, pct: 94 },
        { label: 'Copywriting & Caption',   val: 9.1, pct: 91 },
        { label: 'Community Management',    val: 9.0, pct: 90 },
        { label: 'Analisis Konten',         val: 8.8, pct: 88 },
      ],
      simHistory: [
        { icon: '☕', title: 'Admin Sosmed — Toko Kopi Abadi',   company: 'UMKM Kuliner · Bandung',    score: '9.2' },
        { icon: '👗', title: 'Konten Kreator — Batik Nusantara', company: 'UMKM Fashion · Yogyakarta', score: '9.0' },
        { icon: '🌿', title: 'Social Media — Herbal Sejati',     company: 'UMKM Kesehatan · Surabaya', score: '9.4' },
      ],
      skills: ['Instagram', 'TikTok', 'Copywriting', 'Content Planning', 'Community Management', 'Canva'],
    },
  
    rizky: {
      initials:  'RA',
      name:      'Rizky Aulia',
      role:      'Content Creator UMKM',
      avatarBg:  'linear-gradient(135deg, #6D28D9, #8B5CF6)',
      overall:   '8.8',
      sims:      '2',
      match:     '91%',
      scores: [
        { label: 'Content Strategy',    val: 9.0, pct: 90 },
        { label: 'Copywriting',         val: 8.8, pct: 88 },
        { label: 'Visual Storytelling', val: 8.6, pct: 86 },
        { label: 'SEO Writing',         val: 8.5, pct: 85 },
      ],
      simHistory: [
        { icon: '🍜', title: 'Content Creator — Warung Bu Sari', company: 'UMKM Kuliner · Jakarta', score: '8.9' },
        { icon: '🧴', title: 'Copywriter — Skincare Glow.id',    company: 'UMKM Beauty · Jakarta',  score: '8.7' },
      ],
      skills: ['Content Writing', 'SEO', 'Blog', 'Instagram Caption', 'Brand Voice', 'Storytelling'],
    },
  
    dewi: {
      initials:  'DW',
      name:      'Dewi Wulandari',
      role:      'Digital Marketing Ops',
      avatarBg:  'linear-gradient(135deg, #0F766E, #14B8A6)',
      overall:   '8.5',
      sims:      '2',
      match:     '88%',
      scores: [
        { label: 'Campaign Strategy', val: 8.7, pct: 87 },
        { label: 'TikTok & Reels',    val: 8.5, pct: 85 },
        { label: 'Paid Ads Basic',    val: 8.3, pct: 83 },
        { label: 'Analytics',         val: 8.2, pct: 82 },
      ],
      simHistory: [
        { icon: '🛒', title: 'Digital Marketing — Toko Online Maju', company: 'UMKM Retail · Bandung',  score: '8.6' },
        { icon: '🎨', title: 'Campaign Ops — Kriya Lokal',           company: 'UMKM Kreatif · Bandung', score: '8.4' },
      ],
      skills: ['TikTok Ads', 'Meta Ads', 'Campaign Planning', 'Reels', 'Analytics', 'A/B Testing'],
    },
  
    fajar: {
      initials:  'FA',
      name:      'Fajar Aditya',
      role:      'Brand & Visual Identity',
      avatarBg:  'linear-gradient(135deg, #C2410C, #F97316)',
      overall:   '8.3',
      sims:      '2',
      match:     '84%',
      scores: [
        { label: 'Visual Design',  val: 8.5, pct: 85 },
        { label: 'Brand Identity', val: 8.3, pct: 83 },
        { label: 'Typography',     val: 8.2, pct: 82 },
        { label: 'Color Theory',   val: 8.1, pct: 81 },
      ],
      simHistory: [
        { icon: '☕', title: 'Desainer Visual — Kopi Senja', company: 'UMKM Kuliner · Malang', score: '8.4' },
        { icon: '🧵', title: 'Brand Identity — Tenun Asri', company: 'UMKM Fashion · NTT',    score: '8.2' },
      ],
      skills: ['Canva', 'Figma', 'Logo Design', 'Brand Guidelines', 'Social Media Assets', 'Poster'],
    },
  };
  
  // Color pairs [bg, text] for skill tags
  const PORTFOLIO_TAG_COLORS = [
    ['#EEF2FF', '#4F46E5'],
    ['#ECFDF5', '#059669'],
    ['#FEF3C7', '#D97706'],
    ['#FDF2F8', '#9D174D'],
    ['#EFF6FF', '#1D4ED8'],
    ['#F0FDF4', '#15803D'],
  ];
  
  /* ===== OPEN PORTFOLIO PAGE ===== */
  function openPortfolio(id) {
    const d = PORTFOLIO_DATA[id];
    if (!d) return;
    const hiw = document.getElementById('how-it-works');
    if (hiw) hiw.style.display = 'none';
  
    // Hide all pages, show portfolio
    document.querySelectorAll('.page').forEach(p => {
      p.classList.add('hidden');
      p.style.display = '';
    });
    document.getElementById('page-portfolio').classList.remove('hidden');
    document.getElementById('nav-back').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  
    // ── Hero ──
    const avatar         = document.getElementById('portfolio-avatar');
    avatar.textContent   = d.initials;
    avatar.style.background = d.avatarBg;
  
    document.getElementById('portfolio-name').textContent    = d.name;
    document.getElementById('portfolio-role').textContent    = d.role;
    document.getElementById('portfolio-overall').textContent = d.overall;
    document.getElementById('portfolio-sims').textContent    = d.sims;
    document.getElementById('portfolio-match').textContent   = d.match;
  
    // ── Score bars (animate in) ──
    const scoresEl      = document.getElementById('portfolio-scores');
    scoresEl.innerHTML  = d.scores.map(s => `
      <div class="score-bar-row">
        <div class="score-bar-label">${s.label}</div>
        <div class="score-bar-track">
          <div class="score-bar-fill green" style="width:0%" data-target="${s.pct}"></div>
        </div>
        <div class="score-bar-val">${s.val}</div>
      </div>`).join('');
  
    // Trigger animation after paint
    requestAnimationFrame(() => {
      setTimeout(() => {
        document.querySelectorAll('.score-bar-fill[data-target]').forEach(bar => {
          bar.style.width = bar.dataset.target + '%';
        });
      }, 80);
    });
  
    // ── Simulation history ──
    const simsEl       = document.getElementById('portfolio-sims-list');
    simsEl.innerHTML   = d.simHistory.map(s => `
      <div class="sim-card">
        <div class="sim-icon">${s.icon}</div>
        <div class="sim-info">
          <div class="sim-title">${s.title}</div>
          <div class="sim-company">${s.company}</div>
        </div>
        <div class="sim-score">${s.score}<span>/10</span></div>
      </div>`).join('');
  
    // ── Skill tags ──
    const skillsEl     = document.getElementById('portfolio-skills');
    skillsEl.innerHTML = d.skills.map((sk, i) => {
      const [bg, col] = PORTFOLIO_TAG_COLORS[i % PORTFOLIO_TAG_COLORS.length];
      return `<span style="
        background:${bg};
        color:${col};
        font-size:12px;
        font-weight:600;
        padding:5px 14px;
        border-radius:20px;">${sk}</span>`;
    }).join('');
  }
  
  /* ===== BACK TO MATCHING RESULTS ===== */
  function backToMatching() {
    document.querySelectorAll('.page').forEach(p => {
      p.classList.add('hidden');
      p.style.display = '';
    });
    document.getElementById('page-jasa').classList.remove('hidden');
    document.getElementById('nav-back').classList.remove('hidden');
    showJasaStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  /* ===== CONTACT TALENT ===== */
  function contactTalent() {
    const name = document.getElementById('portfolio-name').textContent;
    alert(
      '✅ Permintaan dikirim ke ' + name + '!\n\n' +
      'Dalam sistem nyata, notifikasi akan dikirim ke talenta ' +
      'dan kamu bisa mulai diskusi proyek langsung.'
    );
  }