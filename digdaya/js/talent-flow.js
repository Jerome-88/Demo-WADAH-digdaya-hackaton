
/* ===== STEP NAVIGATION ===== */
function showTalStep(n) {
    [1, 2, 3, 4].forEach(i => {
      document.getElementById('tal-step' + i).classList.add('hidden');
    });
    document.getElementById('tal-step' + n).classList.remove('hidden');
  
    // Auto-render task preview when step 3 is shown
    if (n === 3) setTimeout(renderTaskPreview, 100);
  }
  
  function talNextStep(n) {
    showTalStep(n);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  /* ===== MULTI-SELECT SKILL CARDS (max 3) ===== */
  function toggleSkill(el, skill) {
    if (el.classList.contains('selected-green')) {
      // Deselect
      el.classList.remove('selected-green');
      selectedSkills = selectedSkills.filter(s => s !== skill);
    } else {
      // Max 3 skills
      if (selectedSkills.length >= 3) return;
      el.classList.add('selected-green');
      selectedSkills.push(skill);
    }
  
    // Update counter display
    const counter = document.getElementById('skill-counter');
    if (counter) {
      counter.textContent = selectedSkills.length + ' / 3 dipilih';
      counter.className   = selectedSkills.length === 3 ? 'counter-full' : '';
    }
  
    // Disable unchosen cards when max reached
    document.querySelectorAll('.skill-card').forEach(card => {
      if (!card.classList.contains('selected-green')) {
        card.classList.toggle('disabled', selectedSkills.length >= 3);
      }
    });
  }
  
  /* ===== UPLOAD EXPERIENCE ===== */
  function triggerUpload(id) {
    document.getElementById(id).click();
  }
  
  function handleUpload(input, type) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
  
    const boxId = type === 'cv' ? 'cv-upload-box' : 'portfolio-upload-box';
    const box   = document.getElementById(boxId);
  
    // Show uploaded confirmation on the box
    const borderColor = type === 'cv' ? 'var(--indigo)' : 'var(--green)';
    const bgColor     = type === 'cv' ? '#F5F3FF'       : '#F0FDF4';
    const icon        = type === 'cv' ? '📄'            : '🗂️';
    const accentColor = type === 'cv' ? 'var(--indigo)'  : 'var(--green)';
  
    box.style.borderStyle = 'solid';
    box.style.borderColor = borderColor;
    box.style.background  = bgColor;
    box.innerHTML = `
      <div style="font-size:28px;margin-bottom:8px;">${icon}</div>
      <div style="font-size:13px;font-weight:600;color:var(--deep);margin-bottom:3px;">${file.name}</div>
      <div style="font-size:11px;color:${accentColor};">✓ Berhasil diunggah</div>`;
    box.onclick = null;
  
    // Trigger AI analysis after short delay
    setTimeout(() => simulateAnalysis(false), 600);
  }
  
  /* ===== AI ANALYSIS ANIMATION ===== */
  function simulateAnalysis(skipped) {
    // Hide upload area and button row
    document.getElementById('upload-area').style.display   = 'none';
    document.getElementById('upload-btn-row').style.display = 'none';
    document.getElementById('analyzing-state').style.display = 'block';
  
    // Cycle through analyzing labels
    const labels = [
      ['AI sedang membaca dokumenmu...',      'Mendeteksi skill dan pengalaman'],
      ['Mengidentifikasi kompetensi...',       'Mencocokkan dengan database industri'],
      ['Menyiapkan rekomendasi simulasi...',   'Hampir selesai!'],
    ];
  
    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      if (idx < labels.length) {
        document.getElementById('analyze-label').textContent = labels[idx][0];
        document.getElementById('analyze-sub').textContent   = labels[idx][1];
      } else {
        clearInterval(interval);
        showDetectedSkills(skipped);
      }
    }, 900);
  }
  
  /* ===== SKILL DETECTION REVEAL ===== */
  function showDetectedSkills(skipped) {
    // Fade out spinner
    document.getElementById('analyze-spinner').style.display = 'none';
    document.getElementById('analyze-label').textContent     = 'Analisis selesai!';
    document.getElementById('analyze-sub').textContent       = '';
  
    setTimeout(() => {
      document.getElementById('analyzing-state').style.display = 'none';
      document.getElementById('detected-state').style.display  = 'block';
  
      // Build detected skills from selected skills
      let allSkills = [];
      selectedSkills.forEach(s => {
        if (SKILL_MAPS[s]) allSkills = allSkills.concat(SKILL_MAPS[s].slice(0, 2));
      });
  
      // Fallback if no skill selected
      if (allSkills.length === 0) {
        allSkills = ['Social Media Management', 'Content Planning', 'Copywriting'];
      }
  
      // Add extras if file was uploaded (not skipped)
      if (!skipped) allSkills.push('Organisasi Kampus', 'Microsoft Office');
  
      // Deduplicate and limit to 6 tags
      allSkills = [...new Set(allSkills)].slice(0, 6);
  
      // Render tags with staggered animation
      const container = document.getElementById('detected-skills');
      container.innerHTML = '';
  
      allSkills.forEach((skill, i) => {
        const [bg, color] = DETECTED_COLORS[i % DETECTED_COLORS.length].split(',');
        const tag         = document.createElement('span');
        tag.style.cssText = `
          background: ${bg};
          color: ${color};
          font-size: 12px;
          font-weight: 600;
          padding: 5px 12px;
          border-radius: 20px;
          display: inline-block;
          animation: fadeIn .3s ease both;
          animation-delay: ${i * 0.1}s`;
        tag.textContent = skill;
        container.appendChild(tag);
      });
    }, 300);
  }
  
  /* ===== RESET UPLOAD ===== */
  function resetUpload() {
    const uploadArea  = document.getElementById('upload-area');
    const btnRow      = document.getElementById('upload-btn-row');
    const analyzing   = document.getElementById('analyzing-state');
    const detected    = document.getElementById('detected-state');
    const spinner     = document.getElementById('analyze-spinner');
    const analyzeLabel = document.getElementById('analyze-label');
    const analyzeSub   = document.getElementById('analyze-sub');
  
    if (uploadArea)  uploadArea.style.display   = 'flex';
    if (btnRow)      btnRow.style.display       = 'flex';
    if (analyzing)   analyzing.style.display    = 'none';
    if (detected)    detected.style.display     = 'none';
    if (spinner)     spinner.style.display      = 'block';
    if (analyzeLabel) analyzeLabel.textContent  = 'AI sedang membaca dokumenmu...';
    if (analyzeSub)   analyzeSub.textContent    = 'Mendeteksi skill dan pengalaman';
  
    // Reset CV upload box
    const cvBox = document.getElementById('cv-upload-box');
    if (cvBox) {
      cvBox.style.cssText = `
        border: 2px dashed var(--g200);
        border-radius: 14px;
        padding: 28px;
        text-align: center;
        cursor: pointer;
        transition: all .2s;
        background: var(--white);`;
      cvBox.innerHTML = `
        <div style="font-size:32px;margin-bottom:10px;">📄</div>
        <div style="font-size:14px;font-weight:600;color:var(--deep);margin-bottom:4px;">Upload CV / Resume</div>
        <div style="font-size:12px;color:var(--g400);">PDF, DOCX — maks. 5MB</div>
        <input type="file" id="cv-input" accept=".pdf,.doc,.docx"
               style="display:none" onchange="handleUpload(this,'cv')"/>`;
      cvBox.onclick = () => triggerUpload('cv-input');
    }
  
    // Reset Portfolio upload box
    const pfBox = document.getElementById('portfolio-upload-box');
    if (pfBox) {
      pfBox.style.cssText = `
        border: 2px dashed var(--g200);
        border-radius: 14px;
        padding: 28px;
        text-align: center;
        cursor: pointer;
        transition: all .2s;
        background: var(--white);`;
      pfBox.innerHTML = `
        <div style="font-size:32px;margin-bottom:10px;">🗂️</div>
        <div style="font-size:14px;font-weight:600;color:var(--deep);margin-bottom:4px;">Upload Portofolio / Karya</div>
        <div style="font-size:12px;color:var(--g400);">PDF, PNG, JPG — maks. 10MB</div>
        <input type="file" id="portfolio-input" accept=".pdf,.png,.jpg,.jpeg"
               style="display:none" onchange="handleUpload(this,'portfolio')"/>`;
      pfBox.onclick = () => triggerUpload('portfolio-input');
    }
  }
  
  /* ===== DYNAMIC TASK PREVIEW ===== */
  // Renders the task card in step 3 based on first selected skill
  function renderTaskPreview() {
    const container = document.getElementById('dynamic-task-preview');
    if (!container) return;
  
    const skill = selectedSkills[0] || 'Social Media';
    const t     = TASK_DATA[skill] || TASK_DATA['Social Media'];
  
    container.innerHTML = `
      <div class="task-preview">
        <div class="task-header">
          <div>
            <div class="task-tag">${t.tag}</div>
            <div style="height:10px;"></div>
            <div class="task-title">${t.title}</div>
            <div class="task-company">${t.company}</div>
          </div>
        </div>
        <div class="task-desc">${t.desc}</div>
        <div class="task-metas">
          <span class="task-meta-item">⏱ Estimasi: ${t.time}</span>
          <span class="task-meta-item">📋 ${t.tasks}</span>
          <span class="task-meta-item">🎯 ${t.skill}</span>
          <span class="task-meta-item">💰 ${t.match}</span>
        </div>
      </div>`;
  }