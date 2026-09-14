/* ═══════════════════════════════════════
   GAME-KAHOOT.JS — Kahoot style speed game
═══════════════════════════════════════ */

let KH = { timerId: null, answered: false, streak: 0 };

function startKahoot() {
  showScr('scr-kahoot');
  G._correctCount = 0;
  KH.streak = 0;
  G.teams.forEach(t => { t.score=0; t.streak=0; });
  G.curQ = 0;

  buildTopbar('kh-topbar', G.teams, true, G.timerSec);
  updateTopbar(G.teams);
  renderKHQuestion();
}

function renderKHQuestion() {
  if (G.curQ >= G.questions.length) { showResults(); return; }
  KH.answered = false;

  const q = G.questions[G.curQ];
  const body = document.getElementById('kh-body');

  // Question number
  const numEl = document.getElementById('kh-q-num') || document.createElement('div');

  body.innerHTML = `
    <div class="kh-q-num">${G.curQ+1} / ${G.questions.length} сұрақ · ${q.pts||10} ұпай</div>
    ${G.timerEnabled ? `
    <div class="timer-ring-wrap">
      <svg class="kh-timer-svg" width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="7"/>
        <circle cx="40" cy="40" r="34" fill="none" stroke="#06d6a0" stroke-width="7"
          stroke-dasharray="${2*Math.PI*34}" stroke-dashoffset="0" id="kh-timer-arc"
          style="transition:stroke-dashoffset 1s linear;"/>
        <text class="kh-timer-num" x="40" y="46" text-anchor="middle" id="kh-timer-num">${G.timerSec}</text>
      </svg>
    </div>` : ''}
    <div class="kh-q-text">${q.q||''}</div>
    ${q.formula ? `<div class="kh-formula">${q.formula}</div>` : ''}
    <div class="kh-opts-grid">
      ${(q.opts||[]).filter(Boolean).map((opt, i) => `
        <button class="kh-opt kh-opt-${['a','b','c','d'][i]}" onclick="selectKHOpt(${i}, ${q.ans}, ${q.pts||10})" id="kh-opt-${i}">
          <span class="kh-letter">${['A','B','C','D'][i]}</span> ${opt}
        </button>`).join('')}
    </div>`;

  if (G.timerEnabled) {
    const totalLen = 2 * Math.PI * 34;
    let timeLeft = G.timerSec;
    clearInterval(KH.timerId);
    KH.timerId = setInterval(() => {
      if (KH.answered) { clearInterval(KH.timerId); return; }
      timeLeft--;
      const arc = document.getElementById('kh-timer-arc');
      const num = document.getElementById('kh-timer-num');
      if (arc) arc.style.strokeDashoffset = totalLen * (1 - timeLeft/G.timerSec);
      if (arc && timeLeft <= 5) arc.style.stroke = '#f72585';
      if (num) { num.textContent = timeLeft; if (timeLeft <= 5) num.style.fill = '#f72585'; }
      const tbadge = document.getElementById('game-timer');
      if (tbadge) { tbadge.textContent = timeLeft; tbadge.classList.toggle('hot', timeLeft<=5); }
      if (timeLeft <= 0) {
        clearInterval(KH.timerId);
        if (!KH.answered) handleKHTimeout(q);
      }
    }, 1000);
  }
}

function selectKHOpt(idx, correctIdx, pts) {
  if (KH.answered) return;
  KH.answered = true;
  clearInterval(KH.timerId);

  const isCorrect = idx === correctIdx;
  sfx(isCorrect ? 'correct' : 'wrong');

  // Reveal all options
  document.querySelectorAll('.kh-opt').forEach((btn, i) => {
    btn.disabled = true;
    if (i === correctIdx) btn.classList.add('correct');
    else if (i === idx && !isCorrect) btn.classList.add('wrong');
  });

  setTimeout(() => {
    if (isCorrect) {
      // Award points to all teams (Kahoot-style: each team picks individually — simplified: apply to all teams)
      // For classroom use: teacher-paced, one answer per question, add pts to active team(s)
      G.teams.forEach(t => {
        t.score += pts;
        t.streak = (t.streak||0)+1;
      });
      G._correctCount = (G._correctCount||0)+1;
      spawnScoreFly(pts);
      const streak = G.teams[0].streak;
      if (STREAK_MSGS[streak]) toast(STREAK_MSGS[streak], 'ok', 2000);
    } else {
      G.teams.forEach(t => t.streak = 0);
    }
    updateTopbar(G.teams);
    showKHScoreboard(isCorrect, pts, () => {
      G.curQ++;
      renderKHQuestion();
    });
  }, 1000);
}

function handleKHTimeout(q) {
  sfx('timeout');
  KH.answered = true;
  document.querySelectorAll('.kh-opt').forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.ans) btn.classList.add('correct');
  });
  G.teams.forEach(t => t.streak = 0);
  updateTopbar(G.teams);
  setTimeout(() => showKHScoreboard(false, 0, () => { G.curQ++; renderKHQuestion(); }), 1200);
}

function showKHScoreboard(correct, pts, onNext) {
  const body = document.getElementById('kh-body');
  const sorted = [...G.teams].sort((a,b) => b.score-a.score);
  const resultIcon = correct ? '✅' : '❌';
  const resultColor = correct ? 'var(--g)' : 'var(--r)';

  body.innerHTML += `
    <div class="kh-scoreboard" style="animation:si .4s ease;">
      <div class="kh-sb-title" style="color:${resultColor};">${resultIcon} ${correct ? `+${pts} ұпай!` : 'Дұрыс жауап жоқ'}</div>
      ${sorted.map((t, i) => `
        <div class="kh-sb-row">
          <span class="kh-sb-rank">${['🥇','🥈','🥉'][i]||i+1}</span>
          <span style="font-size:1.2rem;">${t.emoji}</span>
          <span class="kh-sb-name">${t.name}</span>
          <span class="kh-sb-score">${t.score}</span>
          ${correct ? `<span class="kh-sb-delta">+${pts}</span>` : ''}
        </div>`).join('')}
      <button class="btn btn-p btn-full" style="margin-top:12px;" onclick="(${onNext.toString()})()">
        ${G.curQ+1 >= G.questions.length ? '🏆 Нәтиже' : 'Келесі сұрақ →'}
      </button>
    </div>`;

  body.scrollTo({ top: body.scrollHeight, behavior:'smooth' });
}
