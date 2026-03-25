/* ============================================================
   WADAH — AI Career Platform
   jasa-flow.js: Pengguna Jasa path logic
   Steps: 1. Kebutuhan → 2. Klarifikasi AI → 3. Hasil Matching
   Depends on: data.js
   ============================================================ */

/* ===== STEP NAVIGATION ===== */
function showJasaStep(n) {
    [1, 2, 3].forEach(i => {
      document.getElementById('jasa-step' + i).classList.add('hidden');
    });
    document.getElementById('jasa-step' + n).classList.remove('hidden');
  }
  
  function jasaNextStep(n) {
    showJasaStep(n);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  /* ===== CATEGORY CARD SELECTION ===== */
  function selectCard(el, group) {
    document.querySelectorAll(`[onclick*="${group}"]`).forEach(c => {
      c.classList.remove('selected', 'selected-green');
    });
    el.classList.add(group.startsWith('jasa') ? 'selected' : 'selected-green');
  }
  
  /* ===== AI CLARIFICATION CHAT (Step 2) ===== */
  function sendAiMsg() {
    const inp = document.getElementById('ai-user-input');
    const val = inp.value.trim();
    if (!val) return;
  
    const msgs = document.getElementById('ai-chat-msgs');
  
    // Append user message
    const userDiv       = document.createElement('div');
    userDiv.className   = 'ai-msg user';
    userDiv.innerHTML   = `
      <div class="ai-msg-ic user-ic">👤</div>
      <div class="ai-msg-bubble">${val}</div>`;
    msgs.appendChild(userDiv);
    inp.value = '';
    msgs.scrollTop = msgs.scrollHeight;
  
    // AI response after short delay
    const reply = AI_JASA_RESPONSES[Math.min(aiChatCount, AI_JASA_RESPONSES.length - 1)];
    aiChatCount++;
  
    setTimeout(() => {
      const aiDiv     = document.createElement('div');
      aiDiv.className = 'ai-msg ai';
      aiDiv.innerHTML = `
        <div class="ai-msg-ic ai-ic">🤖</div>
        <div class="ai-msg-bubble">${reply}</div>`;
      msgs.appendChild(aiDiv);
      msgs.scrollTop = msgs.scrollHeight;
    }, 700);
  }
  
  // Allow sending with Enter key
  document.addEventListener('DOMContentLoaded', () => {
    const inp = document.getElementById('ai-user-input');
    if (inp) {
      inp.addEventListener('keydown', e => {
        if (e.key === 'Enter') sendAiMsg();
      });
    }
  });