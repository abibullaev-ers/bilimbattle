/* ═══════════════════════════════════════
   GAME-CORE.JS — Setup & Shared State
═══════════════════════════════════════ */

// ── GAME STATE ──
let G = {
  mode: null,
  quiz: null,
  questions: [],
  teams: [],
  teamCount: 2,
  timerEnabled: true,
  timerSec: 20,
  monsterDiff: 'normal',
  curTeam: 0,
  curQ: 0,
  gameOver: false,
};

// ── SETUP ──
function startSetup(modeId) {
  const quizId = document.getElementById('play-quiz-select')?.value;
  if (!quizId) { toast('Тест таңдаңыз!', 'err'); return; }

  const all = lsGet('quizzes', []);
  const quiz = all.find(q => q.id === quizId);
  if (!quiz || !quiz.questions?.length) { toast('Тест немесе сұрақ жоқ', 'err'); return; }

  G.mode = modeId;
  G.quiz = quiz;
  G.questions = shuffle(quiz.questions);
  G.teamCount = 2;
  G.timerEnabled = true;
  G.timerSec = 20;
  G.monsterDiff = 'normal';

  // Mode title
  const mode = GAME_MODES.find(m => m.id === modeId);
  document.getElementById('setup-mode-title').textContent = `${mode?.ico||'🎮'} ${mode?.name||'Ойын'} Баптауы`;
  document.getElementById('setup-mode-badge').textContent = mode?.badge||'';

  // Monster section
  document.getElementById('setup-monster-section').style.display = modeId==='monster' ? 'block' : 'none';

  // Teams section: kahoot hides team names for individual play
  const teamsSection = document.getElementById('setup-teams-section');
  teamsSection.style.display = 'block';

  renderTeamSetup(G.teamCount);
  showScr('scr-setup');

  // Default chip
  document.querySelectorAll('#team-count-chips .chip').forEach((c,i)=>c.classList.toggle('on',i===1));
  document.querySelectorAll('#timer-secs-wrap .chip').forEach((c,i)=>c.classList.toggle('on',i===1));
  document.getElementById('timer-tog').checked = true;
  document.getElementById('timer-tog-lbl').textContent = 'Қосулы';
  document.getElementById('timer-secs-wrap').style.opacity='1';
  document.getElementById('timer-secs-wrap').style.pointerEvents='all';
}

function setTeamCount(n) {
  G.teamCount = n;
  document.querySelectorAll('#team-count-chips .chip').forEach((c,i)=>c.classList.toggle('on',i===n-1));
  renderTeamSetup(n);
}

function renderTeamSetup(n) {
  const wrap = document.getElementById('team-names-wrap');
  wrap.innerHTML = '';
  for (let i = 0; i < n; i++) {
    const color = TEAM_COLORS[i];
    const emoji = TEAM_EMOJIS[i];
    const defName = TEAM_DEFAULT_NAMES[i];
    const div = document.createElement('div');
    div.style.cssText = `background:${color.light};border:2px solid ${color.border}40;border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:8px;`;
    div.innerHTML = `
      <div style="font-weight:800;font-size:.88rem;color:${color.bg};">${emoji} ${i+1}-топ</div>
      <input class="inp" id="team-name-${i}" value="${defName}" placeholder="${defName}" 
        style="border-color:${color.border}40;background:rgba(255,255,255,.05);">
      <div style="display:flex;gap:6px;flex-wrap:wrap;" id="team-avatar-${i}">
        ${AVATAR_OPTIONS.slice(0,8).map(av => `<span onclick="pickAvatar(${i},'${av}')" 
          style="font-size:1.3rem;cursor:pointer;padding:3px;border-radius:6px;transition:.15s;border:2px solid transparent;"
          class="av-opt-${i}" data-av="${av}">${av}</span>`).join('')}
      </div>`;
    wrap.appendChild(div);
    // Pick default avatar
    setTimeout(() => pickAvatar(i, emoji), 50);
  }
}

function pickAvatar(teamIdx, av) {
  document.querySelectorAll(`.av-opt-${teamIdx}`).forEach(el => {
    el.style.borderColor = el.dataset.av === av ? TEAM_COLORS[teamIdx].border : 'transparent';
    el.style.background = el.dataset.av === av ? TEAM_COLORS[teamIdx].light : 'transparent';
  });
}

function getPickedAvatar(teamIdx) {
  const selected = document.querySelector(`.av-opt-${teamIdx}[style*="solid"]`);
  return selected?.textContent || TEAM_EMOJIS[teamIdx];
}

function setTimerSec(n) {
  G.timerSec = n;
  document.querySelectorAll('#timer-secs-wrap .chip').forEach(c => c.classList.toggle('on', c.textContent === n+'с'));
}

function toggleTimerSetup() {
  G.timerEnabled = document.getElementById('timer-tog').checked;
  document.getElementById('timer-tog-lbl').textContent = G.timerEnabled ? 'Қосулы' : 'Өшірулі';
  document.getElementById('timer-secs-wrap').style.opacity = G.timerEnabled ? '1' : '.4';
  document.getElementById('timer-secs-wrap').style.pointerEvents = G.timerEnabled ? 'all' : 'none';
}

function setMonsterDiff(d) {
  G.monsterDiff = d;
  document.querySelectorAll('#monster-diff-chips .chip').forEach(c => c.classList.remove('on'));
  event.target.classList.add('on');
}

// ── LAUNCH GAME ──
function launchGame() {
  // Build teams
  G.teams = [];
  for (let i = 0; i < G.teamCount; i++) {
    const name = document.getElementById(`team-name-${i}`)?.value.trim() || TEAM_DEFAULT_NAMES[i];
    const emoji = getPickedAvatar(i);
    G.teams.push({
      id: i, name, emoji,
      score: 0, streak: 0,
      hp: 100, maxHp: 100,
      color: TEAM_COLORS[i],
      _active: false,
    });
  }
  G.curTeam = 0;
  G.curQ = 0;
  G.gameOver = false;
  G.teams[0]._active = true;

  if (G.mode === 'bamboozle') startBamboozle();
  else if (G.mode === 'kahoot') startKahoot();
  else if (G.mode === 'monster') startMonsterRaid();
  else if (G.mode === 'roulette') startRoulette();
  else toast('Белгісіз режим', 'err');
}

// ── QUESTION MODAL (shared for Bamboozle) ──
let _qModalCb = null;
let _qBonus = false;
let _qBonusPts = 0;

function openQuestionModal(q, teamIdx, onResult, isBonus=false, bonusPts=0) {
  _qModalCb = onResult;
  _qBonus = isBonus;
  _qBonusPts = bonusPts;

  const team = G.teams[teamIdx];
  const teamTag = document.getElementById('mod-team-tag');
  teamTag.textContent = `${team.emoji} ${team.name}`;
  teamTag.style.background = team.color.light;
  teamTag.style.borderColor = team.color.border;
  teamTag.style.color = team.color.bg;

  document.getElementById('mod-meta').textContent =
    `Сұрақ ${G.curQ+1}/${G.questions.length} · ${q.pts+(isBonus?bonusPts:0)} ұпай`;

  document.getElementById('mod-q').textContent = q.q || '';
  document.getElementById('mod-formula').textContent = q.formula || '';

  // Options
  const optsEl = document.getElementById('mod-opts');
  const letters = ['A','B','C','D'];
  optsEl.innerHTML = (q.opts||[]).filter(Boolean).map((opt, i) => `
    <button class="mopt" onclick="selectQOpt(${i},${q.ans})" data-idx="${i}">
      <span class="ltr">${letters[i]}</span> ${opt}
    </button>`).join('');

  // Hint
  document.getElementById('mod-hint').classList.remove('show');
  document.getElementById('mod-hint').textContent = q.hint ? `💡 ${q.hint}` : '';
  document.getElementById('hint-btn').style.display = q.hint ? 'inline-flex' : 'none';

  // Timer
  const timerBar = document.getElementById('mod-timer-bar');
  if (G.timerEnabled) {
    timerBar.style.display = 'block';
    document.getElementById('mod-timer-fill').style.width = '100%';
    startTimer(G.timerSec, null, () => {
      closeModal('q-modal');
      showMeme(false, 0, () => _qModalCb && _qModalCb(false, 0, true), true);
    });
  } else {
    timerBar.style.display = 'none';
  }

  openModal('q-modal');
}

function selectQOpt(idx, correctIdx) {
  stopTimer();
  const buttons = document.querySelectorAll('.mopt');
  buttons.forEach(b => {
    b.disabled = true;
    if (+b.dataset.idx === correctIdx) b.classList.add('correct');
    else if (+b.dataset.idx === idx && idx !== correctIdx) b.classList.add('wrong');
  });

  const isCorrect = idx === correctIdx;
  setTimeout(() => {
    closeModal('q-modal');
    const pts = isCorrect ? (G.questions[G.curQ]?.pts||10) + (_qBonus ? _qBonusPts : 0) : 0;
    showMeme(isCorrect, pts, () => _qModalCb && _qModalCb(isCorrect, pts, false));
  }, 800);
}

function markAns(correct) {
  stopTimer();
  closeModal('q-modal');
  const pts = correct ? (G.questions[G.curQ]?.pts||10) + (_qBonus ? _qBonusPts : 0) : 0;
  showMeme(correct, pts, () => _qModalCb && _qModalCb(correct, pts, false));
}

function skipQ() {
  stopTimer();
  closeModal('q-modal');
  if (_qModalCb) _qModalCb(false, 0, false);
}

// ── RESULTS SCREEN ──
function showResults() {
  const mode = GAME_MODES.find(m => m.id === G.mode);
  document.getElementById('results-mode-lbl').textContent = `${mode?.ico||'🎮'} ${mode?.name||'Ойын'}`;

  const sorted = [...G.teams].sort((a,b) => b.score - a.score);

  // Podium (top 3)
  const podium = document.getElementById('results-podium');
  const medals = ['🥇','🥈','🥉'];
  const podiumOrder = sorted.length >= 3 ? [sorted[1], sorted[0], sorted[2]] : sorted;
  const classes = sorted.length >= 3 ? ['p2nd','p1st','p3rd'] : ['p1st','p2nd','p3rd'];

  if (sorted.length >= 3) {
    podium.innerHTML = podiumOrder.map((t, i) => `
      <div class="podium-place ${classes[i]}" style="animation-delay:${[.4,.2,.35][i]}s;">
        <div class="podium-medal">${medals[sorted.indexOf(t)]}</div>
        <div style="font-size:2rem;">${t.emoji}</div>
        <div class="podium-name">${t.name}</div>
        <div class="podium-score" style="color:${t.color.bg};">${t.score}</div>
      </div>`).join('');
  } else {
    podium.innerHTML = sorted.map((t, i) => `
      <div class="podium-place ${classes[i]||''}">
        <div class="podium-medal">${medals[i]||`${i+1}.`}</div>
        <div style="font-size:2rem;">${t.emoji}</div>
        <div class="podium-name">${t.name}</div>
        <div class="podium-score" style="color:${t.color.bg};">${t.score}</div>
      </div>`).join('');
  }

  // Others (4+)
  const others = document.getElementById('results-others');
  others.innerHTML = sorted.slice(3).map((t, i) => `
    <div style="display:flex;align-items:center;gap:12px;padding:10px 16px;background:var(--gl);border-radius:12px;margin-bottom:8px;">
      <span style="font-family:'Fredoka One',cursive;color:var(--dim);">${i+4}.</span>
      <span style="font-size:1.5rem;">${t.emoji}</span>
      <span style="font-weight:800;flex:1;">${t.name}</span>
      <span style="font-family:'Fredoka One',cursive;font-size:1.2rem;color:${t.color.bg};">${t.score}</span>
    </div>`).join('');

  // Stats
  document.getElementById('results-stats-grid').innerHTML = `
    <div class="stat-card"><div class="si">❓</div><div class="sv" style="color:var(--b)">${G.questions.length}</div><div class="sl">Сұрақтар</div></div>
    <div class="stat-card"><div class="si">👥</div><div class="sv" style="color:var(--p)">${G.teams.length}</div><div class="sl">Топтар</div></div>
    <div class="stat-card"><div class="si">🏆</div><div class="sv" style="color:var(--y)">${sorted[0]?.score||0}</div><div class="sl">Жоғары ұпай</div></div>
  `;

  // Save history
  saveGameHistory({
    mode: G.mode,
    quizTitle: G.quiz?.title || 'Тест',
    teams: G.teams.map(t => ({ name:t.name, score:t.score })),
    totalScore: sorted[0]?.score || 0,
    correctCount: G._correctCount || 0,
  });

  spawnConfetti(60);
  sfx('victory');
  showScr('scr-results');
}

function playAgain() {
  G.curQ = 0; G.gameOver = false;
  G.teams.forEach(t => { t.score=0; t.streak=0; t.hp=t.maxHp; t._active=false; });
  G.teams[0]._active = true;
  G.questions = shuffle(G.quiz.questions);
  G._correctCount = 0;
  if (G.mode === 'bamboozle') startBamboozle();
  else if (G.mode === 'kahoot') startKahoot();
  else if (G.mode === 'monster') startMonsterRaid();
  else if (G.mode === 'roulette') startRoulette();
}
