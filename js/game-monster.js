/* ═══════════════════════════════════════
   GAME-MONSTER.JS — Monster Raid Boss Battle
   All 3 modes: Boss Raid + PvP teams + Solo
═══════════════════════════════════════ */

let MR = {
  monster: null,
  monsterHp: 500,
  monsterMaxHp: 500,
  curQ: 0,
  answered: false,
  timerId: null,
  phase: 'question', // question | result
};

function startMonsterRaid() {
  showScr('scr-monster');
  G._correctCount = 0;

  // Pick a random monster
  MR.monster = MONSTERS[Math.floor(Math.random() * MONSTERS.length)];
  MR.monsterMaxHp = MR.monster.hp[G.monsterDiff] || 500;
  MR.monsterHp = MR.monsterMaxHp;
  MR.curQ = 0;
  MR.answered = false;

  // Init team HP
  G.teams.forEach(t => { t.hp = 100; t.maxHp = 100; t.score = 0; t.streak = 0; });

  buildTopbar('mr-topbar', G.teams, G.timerEnabled, G.timerSec);
  updateTopbar(G.teams);

  // Render monster SVG
  document.getElementById('mr-monster-svg').innerHTML = MR.monster.svg;
  document.getElementById('mr-monster-name').textContent = MR.monster.name;
  document.getElementById('mr-monster-level').textContent = MR.monster.level;

  updateMonsterHPBar();
  renderTeamsHP();
  renderMRQuestion();
}

function updateMonsterHPBar() {
  const pct = Math.max(0, MR.monsterHp / MR.monsterMaxHp * 100);
  const fill = document.getElementById('mr-hp-fill');
  fill.style.width = pct + '%';
  fill.className = 'monster-hp-fill ' + (pct > 50 ? 'hp-high' : pct > 25 ? 'hp-mid' : 'hp-low');
  document.getElementById('mr-hp-text').textContent = `${MR.monsterHp} / ${MR.monsterMaxHp} HP`;
}

function renderTeamsHP() {
  const row = document.getElementById('mr-teams-hp');
  row.innerHTML = G.teams.map((t, i) => `
    <div class="team-hp-chip ${G.curTeam===i?'cur':''}" id="thc-${i}">
      <div class="thc-name">${t.emoji} ${t.name}</div>
      <div class="thc-hp-bar"><div class="thc-hp-fill" id="thc-fill-${i}" style="width:${t.hp}%;"></div></div>
      <div class="thc-score" id="thc-score-${i}">${t.score} ұп</div>
    </div>`).join('');
}

function renderMRQuestion() {
  if (MR.curQ >= G.questions.length) {
    // Show results
    showMRVictory();
    return;
  }
  if (MR.monsterHp <= 0) { showMRVictory(); return; }
  if (G.teams.every(t => t.hp <= 0)) { showMRDefeat(); return; }

  MR.answered = false;
  const q = G.questions[MR.curQ];
  const teamIdx = G.curTeam;

  document.getElementById('mr-q-text').textContent = q.formula ? `${q.q} — ${q.formula}` : q.q;

  const opts = document.getElementById('mr-opts');
  const letters = ['A','B','C','D'];
  opts.innerHTML = (q.opts||[]).filter(Boolean).map((opt, i) => `
    <button class="mr-opt" onclick="selectMROpt(${i}, ${q.ans})" id="mr-opt-${i}">
      <span class="mr-ltr">${letters[i]}</span> ${opt}
    </button>`).join('');

  // Highlight active team
  G.teams.forEach((t,i) => {
    const chip = document.getElementById(`thc-${i}`);
    if (chip) chip.classList.toggle('cur', i === teamIdx);
  });

  if (G.timerEnabled) {
    clearInterval(MR.timerId);
    let timeLeft = G.timerSec;
    const tbadge = document.getElementById('game-timer');
    MR.timerId = setInterval(() => {
      if (MR.answered) { clearInterval(MR.timerId); return; }
      timeLeft--;
      if (tbadge) { tbadge.textContent = timeLeft; tbadge.classList.toggle('hot', timeLeft<=5); }
      if (timeLeft <= 0) {
        clearInterval(MR.timerId);
        if (!MR.answered) handleMRTimeout();
      }
    }, 1000);
  }
}

function selectMROpt(idx, correctIdx) {
  if (MR.answered) return;
  MR.answered = true;
  clearInterval(MR.timerId);

  const isCorrect = idx === correctIdx;
  const q = G.questions[MR.curQ];
  const team = G.teams[G.curTeam];

  // Visual feedback
  document.querySelectorAll('.mr-opt').forEach((btn, i) => {
    btn.disabled = true;
    if (i === correctIdx) btn.classList.add('correct');
    else if (i === idx && !isCorrect) btn.classList.add('wrong');
  });

  if (isCorrect) {
    team.streak = (team.streak||0)+1;
    G._correctCount = (G._correctCount||0)+1;

    // Calculate damage
    let baseDmg = Math.ceil((q.pts||10) * 2);
    let isCrit = team.streak >= 3;
    if (isCrit) {
      baseDmg = baseDmg * 2;
      showCritText();
    }
    team.score += q.pts||10;

    // Damage monster
    MR.monsterHp = Math.max(0, MR.monsterHp - baseDmg);
    spawnDamageNum(baseDmg, true);
    hitMonster();
    updateMonsterHPBar();

    if (STREAK_MSGS[team.streak]) toast(STREAK_MSGS[team.streak], 'ok', 1500);
    spawnScoreFly(q.pts||10, true);

    if (MR.monsterHp <= 0) {
      setTimeout(() => showMRVictory(), 1400);
      return;
    }
  } else {
    team.streak = 0;
    // Monster attacks this team
    const dmgToTeam = MR.monster.dmgToTeam[G.monsterDiff] || 25;
    team.hp = Math.max(0, team.hp - dmgToTeam);
    monsterAttack();
    spawnDamageNum(dmgToTeam, false);
    updateTeamHPChip(G.curTeam);

    if (G.teams.every(t => t.hp <= 0)) {
      setTimeout(() => showMRDefeat(), 1400);
      return;
    }
  }

  updateTopbar(G.teams);

  // Advance turn
  setTimeout(() => {
    MR.curQ++;
    G.teams[G.curTeam]._active = false;
    G.curTeam = (G.curTeam + 1) % G.teams.length;
    G.teams[G.curTeam]._active = true;
    updateTopbar(G.teams);
    renderTeamsHP();
    renderMRQuestion();
  }, 1200);
}

function handleMRTimeout() {
  MR.answered = true;
  document.querySelectorAll('.mr-opt').forEach((btn, i) => {
    btn.disabled = true;
    if (i === G.questions[MR.curQ]?.ans) btn.classList.add('correct');
  });
  G.teams[G.curTeam].streak = 0;
  const dmg = MR.monster.dmgToTeam[G.monsterDiff] || 25;
  G.teams[G.curTeam].hp = Math.max(0, G.teams[G.curTeam].hp - Math.ceil(dmg*0.5));
  monsterAttack();
  updateTeamHPChip(G.curTeam);
  setTimeout(() => {
    MR.curQ++;
    G.teams[G.curTeam]._active = false;
    G.curTeam = (G.curTeam + 1) % G.teams.length;
    G.teams[G.curTeam]._active = true;
    renderTeamsHP();
    renderMRQuestion();
  }, 1200);
}

function hitMonster() {
  sfx('monster_hit');
  const svg = document.querySelector('.m-svg');
  if (svg) { svg.classList.add('hit'); setTimeout(() => svg.classList.remove('hit'), 500); }
  const flash = document.getElementById('damage-flash');
  if (flash) { flash.classList.add('show'); setTimeout(() => flash.classList.remove('show'), 400); }
}

function monsterAttack() {
  sfx('monster_attack');
  const svg = document.querySelector('.m-svg');
  if (svg) { svg.classList.add('attack'); setTimeout(() => svg.classList.remove('attack'), 600); }
  // Shake arena
  const arena = document.getElementById('monster-arena');
  arena.style.animation = 'arenaShake .4s ease';
  setTimeout(() => arena.style.animation='', 500);
}

function showCritText() {
  sfx('crit');
  const el = document.getElementById('crit-text');
  if (!el) return;
  el.style.display = 'block';
  setTimeout(() => el.style.display='none', 900);
}

function spawnDamageNum(n, isHit) {
  const arena = document.getElementById('monster-arena');
  const el = document.createElement('div');
  el.className = 'dmg-num' + (isHit ? '' : ' heal-num');
  el.textContent = (isHit ? '-' : '-') + n;
  el.style.left = (30 + Math.random()*40)+'%';
  el.style.top = isHit ? '30%' : '60%';
  arena.appendChild(el);
  setTimeout(() => el.remove(), 1300);
}

function updateTeamHPChip(idx) {
  const fill = document.getElementById(`thc-fill-${idx}`);
  const score = document.getElementById(`thc-score-${idx}`);
  if (fill) fill.style.width = Math.max(0, G.teams[idx].hp)+'%';
  if (score) score.textContent = G.teams[idx].score+' ұп';
}

function showMRVictory() {
  sfx('victory');
  spawnConfetti(80);
  // Overlay
  const overlay = document.createElement('div');
  overlay.className = 'monster-end-overlay';
  overlay.innerHTML = `
    <div class="monster-end-card mec-victory">
      <span class="mec-ico">🎉</span>
      <div class="mec-title" style="color:var(--g);">ЖЕҢДІҢІЗ!</div>
      <div class="mec-sub">${MR.monster.name} жеңілді! 🏆</div>
      <div style="display:flex;gap:10px;justify-content:center;margin-top:16px;flex-wrap:wrap;">
        <button class="btn btn-g" onclick="this.closest('.monster-end-overlay').remove();showResults()">🏆 Нәтиже</button>
        <button class="btn btn-ghost" onclick="this.closest('.monster-end-overlay').remove();playAgain()">🔄 Қайта</button>
      </div>
    </div>`;
  document.getElementById('scr-monster').appendChild(overlay);
}

function showMRDefeat() {
  sfx('defeat');
  const overlay = document.createElement('div');
  overlay.className = 'monster-end-overlay';
  overlay.innerHTML = `
    <div class="monster-end-card mec-defeat">
      <span class="mec-ico">💀</span>
      <div class="mec-title" style="color:var(--r);">ЖЕҢІЛДІҢІЗ!</div>
      <div class="mec-sub">${MR.monster.name} жеңіп шықты... 😰</div>
      <div style="display:flex;gap:10px;justify-content:center;margin-top:16px;flex-wrap:wrap;">
        <button class="btn btn-r" onclick="this.closest('.monster-end-overlay').remove();showResults()">📊 Нәтиже</button>
        <button class="btn btn-ghost" onclick="this.closest('.monster-end-overlay').remove();playAgain()">🔄 Қайта</button>
      </div>
    </div>`;
  document.getElementById('scr-monster').appendChild(overlay);
}

// CSS shake animation for arena
document.head.insertAdjacentHTML('beforeend',
  `<style>@keyframes arenaShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}</style>`);
