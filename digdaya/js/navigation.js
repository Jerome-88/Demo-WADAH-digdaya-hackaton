document.addEventListener('DOMContentLoaded', () => {
    const mentorMsgs = document.getElementById('mentor-msgs');
    if (mentorMsgs) MENTOR_INITIAL = mentorMsgs.innerHTML;
  });
  
  // Reset entire app to landing page state
  function goHome() {
    // Hide dashboard
    const dash = document.getElementById('page-dashboard');
    dash.classList.add('hidden');
    dash.style.display = 'none';
    
    const hiw = document.getElementById('how-it-works');
  if (hiw) hiw.style.display = 'block';
  
    // Hide all pages, show landing
    document.querySelectorAll('.page').forEach(p => {
      p.classList.add('hidden');
      p.style.display = '';
    });
    document.getElementById('page-landing').classList.remove('hidden');
    document.getElementById('nav-back').classList.add('hidden');
  
    // Reset all state
    sbStep         = 0;
    quizQ          = 0;
    mentorMsgCount = 0;
    defaultIdx     = 0;
    aiChatCount    = 0;
    selectedSkills = [];
  
    // Reset skill counter UI
    const counter = document.getElementById('skill-counter');
    if (counter) {
      counter.textContent = '0 / 3 dipilih';
      counter.className   = '';
    }
  
    // Re-enable all skill cards
    document.querySelectorAll('.skill-card').forEach(card => {
      card.classList.remove('selected-green', 'disabled');
    });
  
    // Reset sidebar score
    const scoreEl = document.getElementById('sidebar-score');
    const barEl   = document.getElementById('sidebar-score-bar');
    const hintEl  = document.getElementById('sidebar-score-hint');
    if (scoreEl) {
      scoreEl.style.color = 'rgba(255,255,255,.3)';
      scoreEl.innerHTML   = '—<span style="font-size:14px;font-weight:400;opacity:.55;">/100</span>';
    }
    if (barEl)  barEl.style.width   = '0%';
    if (hintEl) hintEl.style.display = 'block';
  
    // Reset avatar and name to defaults
    document.querySelectorAll('.dash-avatar-initial').forEach(el => el.textContent = 'J');
    document.querySelectorAll('.dash-user-name').forEach(el => el.textContent = 'Jerome M.');
  
    // Reset AI mentor chat to initial greeting
    const mentorMsgs = document.getElementById('mentor-msgs');
    if (mentorMsgs && MENTOR_INITIAL) mentorMsgs.innerHTML = MENTOR_INITIAL;
  
    // Reset jasa AI chat
    const jasaMsgs = document.getElementById('ai-chat-msgs');
    if (jasaMsgs) {
      jasaMsgs.innerHTML = `
        <div class="ai-msg ai">
          <div class="ai-msg-ic ai-ic">🤖</div>
          <div class="ai-msg-bubble">
            Halo! Saya sudah membaca deskripsi proyekmu. Untuk matching yang lebih
            akurat, satu pertanyaan: <strong>Apakah kamu punya panduan brand voice
            atau nada bicara khusus untuk bisnismu?</strong>
            (Misalnya: santai &amp; akrab, formal &amp; profesional, dll.)
          </div>
        </div>`;
    }
  
    // Reset jasa steps
    showJasaStep(1);
  
    // Reset talenta steps
    showTalStep(1);
  
    // Reset upload area
    resetUpload();
  
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  // Route user to either jasa or talenta flow
  function goPath(path) {
    const hiw = document.getElementById('how-it-works');
    if (hiw) hiw.style.display = 'none';
    const navCta = document.getElementById('nav-cta');
    const navBc  = document.getElementById('nav-breadcrumb');
    if (navCta) navCta.classList.add('hidden');
    if (navBc)  navBc.classList.remove('hidden');
    document.querySelectorAll('.page').forEach(p => {
      p.classList.add('hidden');
      p.style.display = '';
    });
    document.getElementById('nav-back').classList.remove('hidden');
  
    if (path === 'jasa') {
      document.getElementById('page-jasa').classList.remove('hidden');
      showJasaStep(1);
    } else {
      document.getElementById('page-talenta').classList.remove('hidden');
      showTalStep(1);
    }
  
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Transition from talent flow into the main dashboard
  function goDashboard() {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => {
      p.classList.add('hidden');
      p.style.display = '';
    });

    const hiw = document.getElementById('how-it-works');
    if (hiw) hiw.style.display = 'none';   // ← tambah ini

    const dash = document.getElementById('page-dashboard');
    dash.classList.remove('hidden');
    dash.style.display = 'flex';
    hideNav();
  
    // Show dashboard
    dash.classList.remove('hidden');
    dash.style.display = 'flex';
  
    // Hide top nav-back — sidebar handles navigation inside dashboard
    document.getElementById('nav-back').classList.add('hidden');
  
    // Reset mentor message counter
    mentorMsgCount = 0;
  
    // Default to AI Mentor panel
    switchDash('mentor');
  
    // Render task preview based on selected skills
    renderTaskPreview();
  
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  

  function switchDash(panel) {
    const mc = document.getElementById('nav-mentor');
    const tc = document.getElementById('nav-tasks');
  
    if (panel === 'mentor') {
      if (mc) { mc.style.background = 'rgba(49,46,129,.9)'; mc.style.borderColor = '#6366F1'; }
      if (tc) { tc.style.background = 'rgba(6,78,59,.6)';   tc.style.borderColor = '#10B981'; }
    } else {
      if (tc) { tc.style.background = 'rgba(6,78,59,.9)';   tc.style.borderColor = '#10B981'; }
      if (mc) { mc.style.background = 'rgba(49,46,129,.6)'; mc.style.borderColor = '#6366F1'; }
    }
  
    document.getElementById('dash-mentor').style.display = panel === 'mentor' ? 'flex'  : 'none';
    document.getElementById('dash-tasks').style.display  = panel === 'tasks'  ? 'block' : 'none';
  
    document.getElementById('dash-header-title').textContent = panel === 'mentor' ? 'AI Mentor'    : 'List Kerjaan';
    document.getElementById('dash-header-sub').textContent   = panel === 'mentor'
      ? 'Simulasi aktif: Admin Sosial Media — Toko Kopi Abadi'
      : 'Tugas dialokasikan otomatis berdasarkan skor kompetensi AI';
  }