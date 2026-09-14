/* ═══════════════════════════════════════
   GAME-BAMBOOZLE.JS — Bamboozle card mode
═══════════════════════════════════════ */

let BB = { done: [], bonusIdx: -1, trapIdx: -1, freezeIdx: -1 };

function startBamboozle() {
  showScr('scr-bamboozle');
  G._correctCount = 0;
  BB.done = [];
  // Assign special cards
  const n = G.questions.length;
  const pool = shuffle([...Array(n).keys()]);
  BB.bonusIdx = pool[0];
  BB.trapIdx = pool[1];
  BB.freezeIdx = n >= 5 ? pool[2] : -1;

  buildTopbar('bb-topbar', G.teams, false, 0);
  updateTopbar(G.teams);
  renderBBGrid();
  updateCurTeamStrip();
}

function renderBBGrid() {
  const grid = document.getElementById('bb-grid');
  const n = G.questions.length;
  // Responsive columns
  let cols = n <= 6 ? 3 : n <= 12 ? 4 : n <= 16 ? 4 : 5;
  grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  grid.style.padding = '0 16px';

  grid.innerHTML = G.questions.map((q, i) => {
    const isDone = BB.done.includes(i);
    const isBonus = i === BB.bonusIdx;
    const isTrap = i === BB.trapIdx;
    const isFreeze = i === BB.freezeIdx;
    const grad = CARD_GRADS[i % CARD_GRADS.length];
    let badge = '';
    if (isBonus && !isDone) badge = `<div class="cbadge cbadge-bonus">⭐ БОНУС</div>`;
    if (isTrap && !isDone) badge = `<div class="cbadge cbadge-trap">💀 ТҰЗАҚ</div>`;
    if (isFreeze && !isDone) badge = `<div class="cbadge cbadge-freeze">❄️ ТОҢ</div>`;
    return `<div class="qcard ${grad} ${isDone?'done':''}" onclick="${isDone?'':  `pickBBCard(${i})`}">
      ${badge}
      <span class="cn">${i+1}</span>
      <span class="cpb">${q.pts||10} ұп</span>
    </div>`;
  }).join('');
}

function pickBBCard(idx) {
  if (BB.done.includes(idx)) return;
  sfx('card');
  const q = G.questions[idx];
  const isBonus = idx === BB.bonusIdx;
  const isTrap = idx === BB.trapIdx;
  const isFreeze = idx === BB.freezeIdx;
  const teamIdx = G.curTeam;

  if (isBonus) {
    const btype = BONUS_TYPES[Math.floor(Math.random()*BONUS_TYPES.length)];
    showBonusPopup(btype, () => {
      openQuestionModal(q, teamIdx, (correct, pts, timeout) => {
        handleBBResult(idx, teamIdx, correct, pts + (correct ? btype.pts : 0), isTrap, isFreeze);
      }, true, btype.pts);
    });
  } else if (isTrap) {
    // Tell the team it's a trap AFTER they answer
    openQuestionModal(q, teamIdx, (correct, pts, timeout) => {
      if (!correct && !timeout) {
        // Extra penalty
        G.teams[teamIdx].score = Math.max(0, G.teams[teamIdx].score - 15);
        toast(`💀 ТҰЗАҚ! ${G.teams[teamIdx].name} -15 ұпай!`, 'err');
      }
      handleBBResult(idx, teamIdx, correct, pts, isTrap, isFreeze);
    });
  } else {
    openQuestionModal(q, teamIdx, (correct, pts, timeout) => {
      handleBBResult(idx, teamIdx, correct, pts, false, isFreeze);
    });
  }
}

function handleBBResult(cardIdx, teamIdx, correct, pts, isTrap, isFreeze) {
  BB.done.push(cardIdx);
  const team = G.teams[teamIdx];

  if (correct) {
    team.score += pts;
    team.streak = (team.streak||0) + 1;
    G._correctCount = (G._correctCount||0)+1;
    if (team.streak >= 3 && STREAK_MSGS[team.streak]) {
      toast(STREAK_MSGS[team.streak], 'ok', 2000);
      sfx('streak');
    }
    spawnScoreFly(pts, true);
  } else {
    team.streak = 0;
  }

  // Freeze: skip next team's turn
  if (isFreeze && correct) {
    const nextTeam = (teamIdx + 1) % G.teams.length;
    G.teams[nextTeam]._frozen = true;
    toast(`❄️ ${G.teams[nextTeam].name} бір тур тоңып қалды!`, 'info');
  }

  // Advance team
  advanceBBTeam();
  updateTopbar(G.teams);
  renderBBGrid();
  updateCurTeamStrip();

  // Check if all done
  if (BB.done.length >= G.questions.length) {
    setTimeout(() => showResults(), 1200);
  }
}

function advanceBBTeam() {
  G.teams[G.curTeam]._active = false;
  G.curTeam = (G.curTeam + 1) % G.teams.length;
  // Skip frozen team
  if (G.teams[G.curTeam]._frozen) {
    G.teams[G.curTeam]._frozen = false;
    G.curTeam = (G.curTeam + 1) % G.teams.length;
  }
  G.teams[G.curTeam]._active = true;
}

function updateCurTeamStrip() {
  const t = G.teams[G.curTeam];
  const strip = document.getElementById('bb-cur-team');
  strip.textContent = `${t.emoji} ${t.name} кезегі`;
  strip.style.background = t.color.light;
  strip.style.borderColor = t.color.border;
  strip.style.color = t.color.bg;
}
