/* ═══════════════════════════════════════
   GAME-ROULETTE.JS — Roulette wheel mode
═══════════════════════════════════════ */

let RL = {
  spinning: false,
  curAngle: 0,
  usedQs: [],
};

function startRoulette() {
  showScr('scr-roulette');
  G._correctCount = 0;
  RL.spinning = false;
  RL.curAngle = 0;
  RL.usedQs = [];
  G.teams.forEach(t => { t.score=0; t.streak=0; });

  buildTopbar('rl-topbar', G.teams, false, 0);
  updateTopbar(G.teams);

  drawRouletteWheel(RL.curAngle);
  renderRLScores();
  document.getElementById('rl-q-wrap').style.display = 'none';
  document.getElementById('spin-btn').disabled = false;
  updateCurTeamHint();
}

function updateCurTeamHint() {
  const t = G.teams[G.curTeam];
  const btn = document.getElementById('spin-btn');
  if (btn) btn.textContent = `${t.emoji} ${t.name} айналдырады!`;
}

function drawRouletteWheel(startAngle) {
  const canvas = document.getElementById('roulette-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const n = ROULETTE_SEGS.length;
  const arc = (2 * Math.PI) / n;
  const cx = canvas.width / 2, cy = canvas.height / 2, r = cx - 8;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Outer ring
  ctx.beginPath(); ctx.arc(cx,cy,r+6,0,2*Math.PI);
  ctx.strokeStyle = 'rgba(124,58,237,.4)'; ctx.lineWidth = 12; ctx.stroke();

  ROULETTE_SEGS.forEach((seg, i) => {
    const start = startAngle + i * arc - Math.PI/2;
    const end = start + arc;

    // Segment
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, end);
    ctx.closePath();
    ctx.fillStyle = seg.color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.3)';
    ctx.lineWidth = 2; ctx.stroke();

    // Label
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(start + arc/2);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${r > 160 ? 12 : 10}px Nunito, sans-serif`;
    ctx.shadowColor = 'rgba(0,0,0,.5)';
    ctx.shadowBlur = 4;
    ctx.fillText(seg.label, r - 14, 5);
    ctx.restore();
  });

  // Center circle
  ctx.beginPath(); ctx.arc(cx, cy, 20, 0, 2*Math.PI);
  const grad = ctx.createRadialGradient(cx,cy,0,cx,cy,20);
  grad.addColorStop(0,'#a855f7'); grad.addColorStop(1,'#7c3aed');
  ctx.fillStyle = grad; ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px Fredoka One, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('🎰', cx, cy);
}

function spinRoulette() {
  sfx('spin');
  if (RL.spinning) return;
  RL.spinning = true;
  document.getElementById('spin-btn').disabled = true;
  document.getElementById('rl-q-wrap').style.display = 'none';

  // Random spin: 4-10 full rotations + random stop
  const extraRot = (Math.PI * 2 * (4 + Math.random() * 6));
  const targetAngle = RL.curAngle + extraRot;
  const duration = 4000;
  const startTime = performance.now();
  const startAngle = RL.curAngle;

  function animate(now) {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / duration);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    RL.curAngle = startAngle + extraRot * eased;
    drawRouletteWheel(RL.curAngle);
    if (progress < 1) { requestAnimationFrame(animate); }
    else {
      RL.spinning = false;
      const result = getRouletteResult(RL.curAngle);
      handleRLResult(result);
    }
  }
  requestAnimationFrame(animate);
}

function getRouletteResult(angle) {
  const n = ROULETTE_SEGS.length;
  const arc = (2 * Math.PI) / n;
  // Pointer is at top (-PI/2). Normalize angle.
  let norm = (-angle - Math.PI/2) % (2 * Math.PI);
  if (norm < 0) norm += 2 * Math.PI;
  const idx = Math.floor(norm / arc) % n;
  return ROULETTE_SEGS[idx];
}

function handleRLResult(seg) {
  const team = G.teams[G.curTeam];

  if (seg.type === 'bonus') {
    toast(`🎉 ${team.emoji} ${team.name}: +${seg.pts} ұпай бонус!`, 'ok', 2500);
    team.score += seg.pts;
    spawnScoreFly(seg.pts, true);
    spawnConfetti(25);
    updateTopbar(G.teams);
    renderRLScores();
    advanceRLTeam();
    document.getElementById('spin-btn').disabled = false;
    updateCurTeamHint();
  } else if (seg.type === 'trap') {
    sfx('wrong');
    toast(`💀 ${team.emoji} ${team.name}: ${seg.pts} ұпай! ТҰЗАҚ!`, 'err', 2500);
    team.score = Math.max(0, team.score + seg.pts);
    spawnScoreFly(seg.pts, false);
    updateTopbar(G.teams);
    renderRLScores();
    advanceRLTeam();
    document.getElementById('spin-btn').disabled = false;
    updateCurTeamHint();
  } else if (seg.type === 'freeze') {
    toast(`❄️ ${team.emoji} ${team.name} тоңып қалды! Кезек өтеді.`, 'info', 2500);
    advanceRLTeam();
    document.getElementById('spin-btn').disabled = false;
    updateCurTeamHint();
  } else {
    // Question
    showRLQuestion(seg.pts);
  }
}

function showRLQuestion(bonusPts) {
  const available = G.questions.filter((_, i) => !RL.usedQs.includes(i));
  if (available.length === 0) {
    toast('Барлық сұрақтар тауысылды! Нәтиже...', 'info');
    setTimeout(showResults, 1500);
    return;
  }
  const qObj = available[Math.floor(Math.random() * available.length)];
  const qIdx = G.questions.indexOf(qObj);
  RL.usedQs.push(qIdx);

  const wrap = document.getElementById('rl-q-wrap');
  wrap.style.display = 'block';

  const letters = ['A','B','C','D'];
  wrap.innerHTML = `
    <div style="font-size:.78rem;font-weight:800;letter-spacing:2px;color:var(--g);margin-bottom:8px;">
      ❓ СҰРАҚ · ${qObj.pts||10}${bonusPts > 10 ? ' (бонус)' : ''} ұпай</div>
    <div class="rl-q-text">${qObj.q||''}</div>
    ${qObj.formula ? `<div class="rl-formula">${qObj.formula}</div>` : ''}
    <div class="rl-opts-grid">
      ${(qObj.opts||[]).filter(Boolean).map((opt, i) => `
        <button class="rl-opt" onclick="selectRLOpt(${i}, ${qObj.ans}, ${qObj.pts||10})" id="rl-opt-${i}">
          <span class="opt-l">${letters[i]}</span> ${opt}
        </button>`).join('')}
    </div>`;

  if (G.timerEnabled) {
    startTimer(G.timerSec, null, () => {
      document.querySelectorAll('.rl-opt').forEach((b,i) => {
        b.disabled=true; if(i===qObj.ans) b.classList.add('correct');
      });
      toast('⏰ Уақыт бітті!', 'warn');
      setTimeout(() => {
        advanceRLTeam();
        document.getElementById('spin-btn').disabled = false;
        updateCurTeamHint();
      }, 1200);
    });
  }
}

function selectRLOpt(idx, correctIdx, pts) {
  stopTimer();
  const isCorrect = idx === correctIdx;
  const team = G.teams[G.curTeam];

  document.querySelectorAll('.rl-opt').forEach((b, i) => {
    b.disabled = true;
    if (i === correctIdx) b.classList.add('correct');
    else if (i === idx && !isCorrect) b.classList.add('wrong');
  });

  setTimeout(() => {
    if (isCorrect) {
    sfx('correct');
      team.score += pts;
      team.streak = (team.streak||0)+1;
      G._correctCount = (G._correctCount||0)+1;
      spawnScoreFly(pts, true);
      spawnConfetti(20);
    } else {
      team.streak = 0;
    }
    updateTopbar(G.teams);
    renderRLScores();

    setTimeout(() => {
      advanceRLTeam();
      document.getElementById('spin-btn').disabled = false;
      updateCurTeamHint();
      // End check
      if (RL.usedQs.length >= G.questions.length) {
        setTimeout(showResults, 800);
      }
    }, 700);
  }, 600);
}

function advanceRLTeam() {
  G.teams[G.curTeam]._active = false;
  G.curTeam = (G.curTeam + 1) % G.teams.length;
  G.teams[G.curTeam]._active = true;
  updateTopbar(G.teams);
}

function renderRLScores() {
  const sorted = [...G.teams].sort((a,b) => b.score-a.score);
  const el = document.getElementById('roulette-scores');
  el.innerHTML = `<div class="rl-scores-title">🏆 Ұпайлар</div>` +
    sorted.map((t,i) => `
      <div class="rl-score-row">
        <span style="font-size:1.1rem;">${['🥇','🥈','🥉'][i]||''}</span>
        <span style="font-size:1rem;">${t.emoji}</span>
        <span class="rl-score-name">${t.name}</span>
        <span class="rl-score-val" style="color:${t.color.bg};">${t.score}</span>
      </div>`).join('');
}
