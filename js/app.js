// ===== NAVIGATION =====
function goHome(){
  document.querySelectorAll('.page').forEach(p=>p.classList.add('hidden'));
  document.getElementById('page-landing').classList.remove('hidden');
  document.getElementById('nav-back').classList.add('hidden');
  sbStep=0; quizQ=0;
  document.getElementById('sandbox-window').innerHTML='<div class="sandbox-meta">// WADAH CAREER SANDBOX v1.0 · Social Media Simulation · Toko Kopi Abadi</div>';
  document.getElementById('sandbox-btn').textContent='🚀 Mulai Simulasi';
  document.getElementById('sandbox-btn').disabled=false;
  document.getElementById('sandbox-btn').style.opacity='1';
}
 
function goPath(path){
  document.querySelectorAll('.page').forEach(p=>p.classList.add('hidden'));
  document.getElementById('nav-back').classList.remove('hidden');
  if(path==='jasa'){
    document.getElementById('page-jasa').classList.remove('hidden');
    showJasaStep(1);
  } else {
    document.getElementById('page-talenta').classList.remove('hidden');
    showTalStep(1);
    renderQuiz();
  }
}
 
// ===== SELECT CARDS =====
function selectCard(el, group){
  document.querySelectorAll(`[onclick*="${group}"]`).forEach(c=>{
    c.classList.remove('selected','selected-green');
  });
  el.classList.add(group.startsWith('jasa') ? 'selected' : 'selected-green');
}
 
 
// ===== JASA STEPS =====
function showJasaStep(n){
  [1,2,3].forEach(i=>document.getElementById('jasa-step'+i).classList.add('hidden'));
  document.getElementById('jasa-step'+n).classList.remove('hidden');
}
function jasaNextStep(n){ showJasaStep(n); window.scrollTo({top:0,behavior:'smooth'}); }
 
// ===== AI CHAT (JASA STEP 2) =====
const aiResponses=[
  "Bagus! Dengan SOP brand voice yang jelas, talenta bisa langsung menyesuaikan konten. Satu lagi: apakah kamu lebih suka talenta yang berpengalaman dengan tools seperti Buffer atau Later untuk scheduling?",
  "Mengerti! Saya sudah merekam preferensimu. Sekarang AI kami akan mencarikan talenta yang paling cocok berdasarkan semua informasi ini. Klik 'Temukan Talenta' ya!"
];
let aiChatCount=0;
function sendAiMsg(){
  const inp=document.getElementById('ai-user-input');
  const val=inp.value.trim(); if(!val) return;
  const msgs=document.getElementById('ai-chat-msgs');
  // user msg
  const um=document.createElement('div'); um.className='ai-msg user';
  um.innerHTML=`<div class="ai-msg-ic user-ic">👤</div><div class="ai-msg-bubble">${val}</div>`;
  msgs.appendChild(um);
  inp.value='';
  // ai response
  setTimeout(()=>{
    const am=document.createElement('div'); am.className='ai-msg ai';
    am.innerHTML=`<div class="ai-msg-ic ai-ic">🤖</div><div class="ai-msg-bubble">${aiResponses[Math.min(aiChatCount,aiResponses.length-1)]}</div>`;
    msgs.appendChild(am);
    msgs.scrollTop=msgs.scrollHeight;
    aiChatCount++;
  },700);
  msgs.scrollTop=msgs.scrollHeight;
}
 
// ===== TALENTA STEPS =====
function showTalStep(n){
  [1,2,3,4].forEach(i=>document.getElementById('tal-step'+i).classList.add('hidden'));
  document.getElementById('tal-step'+n).classList.remove('hidden');
}
function talNextStep(n){ showTalStep(n); window.scrollTo({top:0,behavior:'smooth'}); }
 
// ===== QUIZ =====
const QUIZ=[
  { q:"Saat menghadapi deadline ketat, kamu lebih suka...", opts:[{i:"⚡",t:"Langsung kerjakan bagian terpenting dulu"},{i:"📋",t:"Buat checklist terstruktur sebelum mulai"},{i:"🤝",t:"Diskusi dulu dengan tim atau mentor"},{i:"🎯",t:"Fokus pada kualitas meski makan waktu lebih"}] },
  { q:"Gaya belajarmu yang paling efektif adalah...", opts:[{i:"🎥",t:"Tonton video tutorial, langsung praktik"},{i:"📖",t:"Baca dokumentasi atau panduan tertulis"},{i:"🧪",t:"Trial & error sampai berhasil sendiri"},{i:"👥",t:"Belajar dari orang yang sudah berpengalaman"}] },
  { q:"Ketika mendapat feedback kritik dari klien...", opts:[{i:"💪",t:"Jadikan motivasi untuk lebih baik"},{i:"🔍",t:"Analisis dulu sebelum merespons"},{i:"💬",t:"Diskusikan untuk klarifikasi"},{i:"✏️",t:"Langsung revisi tanpa banyak tanya"}] },
];
let quizQ=0; let quizAns=[];
function renderQuiz(){
  quizQ=0; quizAns=[];
  showQuizQ();
}
function showQuizQ(){
  const area=document.getElementById('quiz-area');
  const q=QUIZ[quizQ];
  document.getElementById('quiz-progress').style.width=((quizQ+1)/QUIZ.length*100)+'%';
  area.innerHTML=`<p style="font-size:15px;font-weight:600;color:var(--deep);margin-bottom:16px;">${quizQ+1}. ${q.q}</p>`+
    q.opts.map((o,i)=>`<div class="quiz-opt" onclick="selectQuiz(this,${i})"><span class="quiz-opt-icon">${o.i}</span>${o.t}</div>`).join('');
}
function selectQuiz(el,i){
  document.querySelectorAll('.quiz-opt').forEach(o=>o.classList.remove('selected'));
  el.classList.add('selected');
  quizAns[quizQ]=i;
}
function quizNext(){
  if(quizAns[quizQ]===undefined){ alert('Pilih salah satu dulu ya!'); return; }
  quizQ++;
  if(quizQ<QUIZ.length){ showQuizQ(); }
  else { talNextStep(3); }
}
 
// ===== SANDBOX =====
const SB_MSGS=[
  {type:'ai', text:'Halo! Selamat datang di Career Sandbox WADAH. Hari ini kita simulasi <strong>Admin Media Sosial Toko Kopi Abadi</strong>. SOP mereka: nada hangat, lokal, autentik. Siap?'},
  {type:'user', text:'Siap Mentor! Sudah baca SOP-nya.'},
  {type:'ai', text:'Bagus! <strong>Tugas 1:</strong> Toko Kopi Abadi baru rilis menu <em>"Es Kopi Gula Aren Special"</em>. Buat 1 caption Instagram yang menonjolkan <em>rasa autentik</em> sesuai SOP. Tuliskan jawabanmu!'},
  {type:'user', text:'"Satu tegukan, seribu cerita ☕🍃 Es Kopi Gula Aren Special kami hadir dari ladang aren pilihan — manisnya alami, rasanya tak terlupakan. Mampir yuk! #KopiAbadi #GulaAren #KopiLokal"'},
  {type:'eval', text:'✅ <strong>Tugas 1 Selesai — Skor: 9/10</strong><br>Relevansi SOP ✓ · Kreativitas ✓ · CTA & Hashtag ✓<br><br><strong>Tugas 2:</strong> Ada komentar negatif di postingan kopi: <em>"Kopinya kemarin pahit banget, kecewa."</em><br>Buat respons profesional sesuai nada bicara SOP!'},
  {type:'user', text:'"Halo Kak, terima kasih sudah mampir dan berbagi pengalaman ya! 🙏 Kami mohon maaf kopi kemarin kurang memuaskan. Setiap cangkir kami ingin sempurna — boleh Kak DM kami? Kami siapkan yang terbaik untuk kunjungan berikutnya ☕❤️"'},
];
let sbStep=0;
function sandboxNext(){
  const win=document.getElementById('sandbox-window');
  const btn=document.getElementById('sandbox-btn');
  if(sbStep<SB_MSGS.length){
    const m=SB_MSGS[sbStep];
    const div=document.createElement('div');
    div.className='sb-msg'+(m.type==='user'?' sb-user':'');
    const iconClass=m.type==='user'?'user-sb':'ai-sb';
    const iconEmoji=m.type==='user'?'👤':'🤖';
    const bubClass=m.type==='eval'?'sb-eval':m.type==='user'?'sb-user':'sb-ai';
    const lblClass=m.type==='eval'?'lbl-eval':m.type==='user'?'lbl-user':'lbl-ai';
    const lblText=m.type==='eval'?'AI MENTOR (EVALUASI)':m.type==='user'?'KAMU':'AI MENTOR';
    div.innerHTML=`<div class="sb-icon ${iconClass}">${iconEmoji}</div><div class="sb-bubble ${bubClass}"><div class="sb-lbl ${lblClass}">${lblText}</div>${m.text}</div>`;
    if(m.type==='user') div.innerHTML=`<div class="sb-bubble ${bubClass}"><div class="sb-lbl ${lblClass}">${lblText}</div>${m.text}</div><div class="sb-icon ${iconClass}">${iconEmoji}</div>`;
    win.appendChild(div);
    win.scrollTop=win.scrollHeight;
    sbStep++;
    const labels=['Mulai Simulasi','Balas Mentor','Kirim Jawaban 1','Lanjut Tugas 2','Kirim Jawaban 2','Lihat Hasil Akhir'];
    btn.textContent=labels[sbStep]||'Lanjut';
  } else {
    // Final score
    const sc=document.createElement('div');
    sc.className='score-final';
    sc.innerHTML=`
      <div style="font-size:12px;opacity:.7;font-family:'Sora',sans-serif;margin-bottom:8px;letter-spacing:1px;">SKOR KOMPETENSI AKHIR</div>
      <div class="score-num">88</div>
      <div style="font-size:13px;opacity:.75;margin-top:4px;">/ 100 — Verified Portfolio Badge Diraih! 🎉</div>
      <div class="score-dims">
        <div class="score-dim"><div class="score-dim-val">9.0</div><div class="score-dim-lbl">Relevansi SOP</div></div>
        <div class="score-dim"><div class="score-dim-val">8.5</div><div class="score-dim-lbl">Kreativitas</div></div>
        <div class="score-dim"><div class="score-dim-val">8.8</div><div class="score-dim-lbl">Profesionalisme</div></div>
      </div>
      <div style="margin-top:20px;font-size:13px;opacity:.8;line-height:1.6;">Kamu sudah siap dimatching dengan UMKM yang membutuhkan Social Media Specialist!</div>
      <button onclick="goPath('jasa')" style="margin-top:16px;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3);color:#fff;padding:10px 20px;border-radius:8px;font-size:12px;cursor:pointer;font-family:'Inter',sans-serif;">Lihat pengalaman dari sisi Pengguna Jasa →</button>
    `;
    win.appendChild(sc);
    win.scrollTop=win.scrollHeight;
    btn.textContent='✓ Simulasi Selesai';
    btn.disabled=true;
    btn.style.opacity='.4';
    btn.style.cursor='default';
  }
}
 
// ===== DASHBOARD =====
function goDashboard(){
  document.querySelectorAll('.page').forEach(p=>{p.classList.add('hidden');p.style.display='';});
  const dash = document.getElementById('page-dashboard');
  dash.classList.remove('hidden');
  dash.style.display='flex';
  document.getElementById('nav-back').classList.remove('hidden');
  mentorMsgCount = 0;
}
 
function switchDash(panel){
  // nav highlight
  document.querySelectorAll('.dash-nav-item').forEach(n=>n.classList.remove('active-nav'));
  document.getElementById('nav-'+panel).classList.add('active-nav');
  // panels
  document.getElementById('dash-mentor').style.display = panel==='mentor' ? 'flex' : 'none';
  document.getElementById('dash-tasks').style.display  = panel==='tasks'  ? 'block' : 'none';
  // header
  const titles = { mentor:'AI Mentor', tasks:'List Kerjaan' };
  const subs   = { mentor:'Simulasi aktif: Admin Sosial Media — Toko Kopi Abadi', tasks:'Tugas dialokasikan otomatis berdasarkan skor kompetensi AI' };
  document.getElementById('dash-header-title').textContent = titles[panel];
  document.getElementById('dash-header-sub').textContent   = subs[panel];
}
 
// Override goHome to also hide dashboard
const _origGoHome = goHome;
function goHome(){
  const dash = document.getElementById('page-dashboard');
  dash.classList.add('hidden');
  dash.style.display='none';
  document.querySelectorAll('.page').forEach(p=>p.classList.add('hidden'));
  document.getElementById('page-landing').classList.remove('hidden');
  document.getElementById('nav-back').classList.add('hidden');
  sbStep=0; quizQ=0; mentorMsgCount=0;
  document.getElementById('mentor-msgs').innerHTML = MENTOR_INITIAL;
}
 
const MENTOR_INITIAL = document.getElementById('mentor-msgs') ? document.getElementById('mentor-msgs').innerHTML : '';
 
// ===== AI MENTOR SMART MOCK =====
let mentorMsgCount = 0;
 
const MENTOR_FLOWS = [
  // after user says siap / apa saja
  { triggers:['siap','oke','ok','mulai','yuk','gas'], reply:`Oke! Tugas pertama nih 🎯<br><br><strong>Tugas 1 dari 2:</strong> Toko Kopi Abadi baru rilis menu <em>"Es Kopi Gula Aren Special"</em>. Buat 1 caption Instagram yang menonjolkan <strong>rasa autentik</strong> sesuai nada bicara SOP mereka.<br><br>Tuliskan caption kamu di bawah ini. Sertakan emoji dan hashtag juga ya!` },
  // after user writes a caption (long-ish response)
  { triggers:['kopi','caption','instagram','#','☕','🍃','satu tegukan','rasa','mampir'], reply:`Evaluasi AI Mentor:<br><br>✅ <strong>Relevansi SOP: 9/10</strong> — Nada bicara hangat dan lokal sangat terasa<br>✅ <strong>Kreativitas: 8.5/10</strong> — Caption original dan engaging<br>✅ <strong>Kelengkapan: 9/10</strong> — Hashtag relevan, ada CTA yang jelas<br><br>Skor tugas ini: <strong style="color:#059669;font-size:16px;">9/10</strong> 🎉<br><br>Lanjut ke <strong>Tugas 2!</strong> Ada komentar negatif masuk: <em>"Kopinya kemarin pahit banget, kecewa."</em> — Buat respons profesional yang tetap hangat sesuai SOP!` },
  // after user writes a response to complaint
  { triggers:['maaf','mohon','terima kasih','halo kak','kak','dm','kunjungan','terbaik','mampir lagi'], reply:`Sempurna! Evaluasi Tugas 2:<br><br>✅ <strong>Empati: 9.5/10</strong> — Respons sangat hangat dan tidak defensif<br>✅ <strong>Profesionalisme: 9/10</strong> — Solusi konkret ditawarkan<br>✅ <strong>Brand Voice: 10/10</strong> — 100% sesuai nada SOP<br><br><strong style="color:#059669;font-size:18px;">Simulasi Selesai! 🏆</strong><br><br>Skor akhirmu: <strong style="font-size:20px;color:#059669;">88/100</strong><br>Verified Portfolio Badge: <strong>Social Media Specialist</strong> berhasil diraih!<br><br>Cek tab <strong>List Kerjaan</strong> — ada 1 tugas baru yang masuk dari sistem!` },
];
 
const MENTOR_DEFAULT = [
  'Pertanyaan bagus! Berdasarkan SOP Toko Kopi Abadi, nada bicara mereka sangat personal — hindari bahasa formal yang kaku. Gunakan "Kak" dan sapaan hangat. Ada yang ingin ditanyakan lagi?',
  'Betul! Dan jangan lupa — setiap konten harus terasa seperti ditulis oleh manusia, bukan mesin. Autentisitas adalah kunci brand Toko Kopi Abadi. Siap lanjut ke tugas?',
  'Good thinking! Untuk UMKM kuliner lokal, konten terbaik biasanya yang menampilkan "behind the scene" atau cerita di balik produk. Coba tulis caption dengan angle itu!'
];
let defaultIdx = 0;
 
function sendMentorMsg(){
  const inp = document.getElementById('mentor-input');
  const val = inp.value.trim();
  if(!val) return;
 
  const msgs = document.getElementById('mentor-msgs');
 
  // Append user message
  const userDiv = document.createElement('div');
  userDiv.style.cssText = 'display:flex;gap:12px;align-items:flex-start;flex-direction:row-reverse;';
  userDiv.innerHTML = `
    <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#4F46E5,#7C3AED);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-weight:800;font-size:14px;color:#fff;font-family:'Sora',sans-serif;">J</div>
    <div style="max-width:75%;">
      <div style="font-size:10px;font-weight:700;color:#A78BFA;letter-spacing:.4px;margin-bottom:5px;text-align:right;">KAMU</div>
      <div style="background:#EEF2FF;border-radius:14px 4px 14px 14px;padding:14px 16px;font-size:14px;color:var(--indigo-dark);line-height:1.7;">${val}</div>
    </div>`;
  msgs.appendChild(userDiv);
  inp.value='';
  inp.style.height='52px';
  msgs.scrollTop = msgs.scrollHeight;
 
  // Find matching response
  const lower = val.toLowerCase();
  let reply = null;
  for(const flow of MENTOR_FLOWS){
    if(flow.triggers.some(t => lower.includes(t))){
      reply = flow.reply;
      break;
    }
  }
  if(!reply){
    reply = MENTOR_DEFAULT[defaultIdx % MENTOR_DEFAULT.length];
    defaultIdx++;
  }
 
  // Typing indicator
  const typing = document.createElement('div');
  typing.style.cssText = 'display:flex;gap:12px;align-items:flex-start;';
  typing.innerHTML = `<div style="width:32px;height:32px;border-radius:50%;background:#EEF2FF;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:16px;">🤖</div><div style="background:var(--white);border:1px solid var(--g200);border-radius:4px 14px 14px 14px;padding:14px 16px;font-size:14px;color:var(--g400);">Mentor sedang mengetik<span id="typing-dots">...</span></div>`;
  msgs.appendChild(typing);
  msgs.scrollTop = msgs.scrollHeight;
 
  setTimeout(()=>{
    msgs.removeChild(typing);
    const aiDiv = document.createElement('div');
    aiDiv.style.cssText = 'display:flex;gap:12px;align-items:flex-start;';
    aiDiv.innerHTML = `
      <div style="width:32px;height:32px;border-radius:50%;background:#EEF2FF;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:16px;">🤖</div>
      <div style="max-width:75%;">
        <div style="font-size:10px;font-weight:700;color:#818CF8;letter-spacing:.4px;margin-bottom:5px;">AI MENTOR</div>
        <div style="background:var(--white);border:1px solid var(--g200);border-radius:4px 14px 14px 14px;padding:14px 16px;font-size:14px;color:var(--g800);line-height:1.7;">${reply}</div>
      </div>`;
    msgs.appendChild(aiDiv);
    msgs.scrollTop = msgs.scrollHeight;
    mentorMsgCount++;
  }, 1200);
}
