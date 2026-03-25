/* ============================================================
   WADAH — AI Career Platform
   dashboard.js: AI Mentor chat, score animation,
                 sidebar auto-update after sandbox complete
   Depends on: data.js
   ============================================================ */

/* ===== AI MENTOR CHAT ===== */
function sendMentorMsg() {
    const inp = document.getElementById('mentor-input');
    const val = inp.value.trim();
    if (!val) return;
  
    const msgs = document.getElementById('mentor-msgs');
  
    // Append user message
    const userDiv       = document.createElement('div');
    userDiv.style.cssText = 'display:flex;gap:12px;align-items:flex-start;flex-direction:row-reverse;';
    userDiv.innerHTML   = `
      <div style="
        width:32px;height:32px;border-radius:50%;
        background:linear-gradient(135deg,#4F46E5,#7C3AED);
        display:flex;align-items:center;justify-content:center;
        flex-shrink:0;font-weight:800;font-size:14px;
        color:#fff;font-family:'Sora',sans-serif;"
        class="dash-avatar-initial">J
      </div>
      <div style="max-width:75%;">
        <div style="
          font-size:10px;font-weight:700;color:#A78BFA;
          letter-spacing:.4px;margin-bottom:5px;text-align:right;">KAMU</div>
        <div style="
          background:#EEF2FF;border-radius:14px 4px 14px 14px;
          padding:14px 16px;font-size:14px;color:var(--indigo-dark);
          line-height:1.7;">${val}</div>
      </div>`;
    msgs.appendChild(userDiv);
  
    // Clear input and reset height
    inp.value        = '';
    inp.style.height = '52px';
    msgs.scrollTop   = msgs.scrollHeight;
  
    // Find matching response from flows
    const lower = val.toLowerCase();
    let reply   = null;
  
    for (const flow of MENTOR_FLOWS) {
      if (flow.triggers.some(t => lower.includes(t))) {
        reply = flow.reply;
        break;
      }
    }
  
    // Fall back to default responses
    if (!reply) {
      reply      = MENTOR_DEFAULT[defaultIdx % MENTOR_DEFAULT.length];
      defaultIdx++;
    }
  
    // Show typing indicator
    const typing       = document.createElement('div');
    typing.style.cssText = 'display:flex;gap:12px;align-items:flex-start;';
    typing.id          = 'typing-indicator';
    typing.innerHTML   = `
      <div style="
        width:32px;height:32px;border-radius:50%;background:#EEF2FF;
        display:flex;align-items:center;justify-content:center;
        flex-shrink:0;font-size:16px;"><img src="assets/bot.png" alt="AI Mentor" style="width:32px;height:32px;object-fit:contain;"/></div>
      <div style="
        background:var(--white);border:1px solid var(--g200);
        border-radius:4px 14px 14px 14px;
        padding:14px 16px;font-size:14px;color:var(--g400);">
        Mentor sedang mengetik…
      </div>`;
    msgs.appendChild(typing);
    msgs.scrollTop = msgs.scrollHeight;
  
    // Replace typing indicator with actual reply
    setTimeout(() => {
      const indicator = document.getElementById('typing-indicator');
      if (indicator) msgs.removeChild(indicator);
  
      const aiDiv       = document.createElement('div');
      aiDiv.style.cssText = 'display:flex;gap:12px;align-items:flex-start;';
      aiDiv.innerHTML   = `
        <div style="
          width:32px;height:32px;border-radius:50%;background:#EEF2FF;
          display:flex;align-items:center;justify-content:center;
          flex-shrink:0;font-size:16px;"><img src="assets/bot.png" alt="AI Mentor" style="width:32px;height:32px;object-fit:contain;"/></div>
        <div style="max-width:75%;">
          <div style="
            font-size:10px;font-weight:700;color:#818CF8;
            letter-spacing:.4px;margin-bottom:5px;">AI MENTOR</div>
          <div style="
            background:var(--white);border:1px solid var(--g200);
            border-radius:4px 14px 14px 14px;
            padding:14px 16px;font-size:14px;color:var(--g800);
            line-height:1.7;">${reply}</div>
        </div>`;
      msgs.appendChild(aiDiv);
      msgs.scrollTop = msgs.scrollHeight;
      mentorMsgCount++;
  
      // Check if this reply contains the final score trigger
      if (reply.includes('Simulasi Selesai')) {
        setTimeout(showFinalScore, 600);
      }
    }, 1200);
  }
  
  /* ===== FINAL SCORE CARD ===== */
  function showFinalScore() {
    const msgs = document.getElementById('mentor-msgs');
  
    const scoreCard       = document.createElement('div');
    scoreCard.className   = 'score-final';
    scoreCard.innerHTML   = `
      <div style="font-size:12px;opacity:.7;font-family:'Sora',sans-serif;
        margin-bottom:8px;letter-spacing:1px;">SKOR KOMPETENSI AKHIR</div>
      <div class="score-num">88</div>
      <div style="font-size:13px;opacity:.75;margin-top:4px;">
        / 100 — Verified Portfolio Badge Diraih! 🎉
      </div>
      <div class="score-dims">
        <div class="score-dim">
          <div class="score-dim-val">9.0</div>
          <div class="score-dim-lbl">Relevansi SOP</div>
        </div>
        <div class="score-dim">
          <div class="score-dim-val">8.5</div>
          <div class="score-dim-lbl">Kreativitas</div>
        </div>
        <div class="score-dim">
          <div class="score-dim-val">8.8</div>
          <div class="score-dim-lbl">Profesionalisme</div>
        </div>
      </div>
      <div style="margin-top:20px;font-size:13px;opacity:.8;line-height:1.6;">
        Kamu sudah siap dimatching dengan UMKM yang membutuhkan Social Media Specialist!
      </div>
      <button
        onclick="goPath('jasa')"
        style="
          margin-top:16px;background:rgba(255,255,255,.15);
          border:1px solid rgba(255,255,255,.3);color:#fff;
          padding:10px 20px;border-radius:8px;font-size:12px;
          cursor:pointer;font-family:'Inter',sans-serif;">
        Lihat pengalaman dari sisi Pengguna Jasa →
      </button>`;
  
    msgs.appendChild(scoreCard);
    msgs.scrollTop = msgs.scrollHeight;
  
    // Auto-update sidebar after score is revealed
    setTimeout(updateSidebarAfterComplete, 800);
  }
  
  /* ===== SIDEBAR AUTO-UPDATE AFTER COMPLETION ===== */
  function updateSidebarAfterComplete() {
    // 1. Animate score counter in sidebar
    animateScore();
  
    // 2. Update List Kerjaan nav card
    const navTasks = document.getElementById('nav-tasks');
    if (!navTasks) return;
  
    // Update badge: "2 baru" → "1 baru"
    const badge = navTasks.querySelector('span[style*="EF4444"]');
    if (badge) badge.textContent = '1 baru';
  
    // Update task preview list in sidebar
    const taskPreview = navTasks.querySelector('div[style*="rgba(0,0,0,.25)"]');
    if (taskPreview) {
      taskPreview.innerHTML = `
        <div style="display:flex;align-items:center;gap:7px;">
          <div style="width:6px;height:6px;border-radius:50%;background:#6B7280;flex-shrink:0;"></div>
          <div style="font-size:12px;font-weight:700;color:#9CA3AF;text-decoration:line-through;">
            Toko Kopi Abadi
          </div>
          <div style="font-size:11px;color:#6B7280;margin-left:auto;">selesai ✓</div>
        </div>
        <div style="display:flex;align-items:center;gap:7px;">
          <div style="width:6px;height:6px;border-radius:50%;background:#34D399;flex-shrink:0;"></div>
          <div style="font-size:12px;font-weight:700;color:#fff;">Warung Bu Sari</div>
          <div style="font-size:11px;color:#6EE7B7;margin-left:auto;">baru</div>
        </div>`;
    }
  
    // Flash the tasks card green to draw attention
    navTasks.style.borderColor  = 'rgba(52,211,153,.9)';
    navTasks.style.background   = 'rgba(5,150,105,.35)';
    setTimeout(() => {
      navTasks.style.borderColor = 'rgba(52,211,153,.5)';
      navTasks.style.background  = 'rgba(5,150,105,.2)';
    }, 2000);
  }
  
  /* ===== SCORE ANIMATION ===== */
  function animateScore() {
    const scoreEl = document.getElementById('sidebar-score');
    const barEl   = document.getElementById('sidebar-score-bar');
    const hintEl  = document.getElementById('sidebar-score-hint');
  
    if (!scoreEl || !barEl) return;
  
    // Show score color and hide hint
    scoreEl.style.color = '#34D399';
    if (hintEl) hintEl.style.display = 'none';
  
    // Count up from 0 to 88
    let current    = 0;
    const target   = 88;
    const timer    = setInterval(() => {
      current = Math.min(current + 3, target);
      scoreEl.innerHTML = current +
        '<span style="font-size:14px;font-weight:400;opacity:.55;">/100</span>';
      barEl.style.width = current + '%';
      if (current >= target) clearInterval(timer);
    }, 40);
  }
  
  /* ===== ENTER KEY SUPPORT FOR MENTOR INPUT ===== */
  document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('mentor-input');
    if (!input) return;
  
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMentorMsg();
      }
    });
  
    // Auto-resize textarea as user types
    input.addEventListener('input', () => {
      input.style.height = '52px';
      input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    });
  });