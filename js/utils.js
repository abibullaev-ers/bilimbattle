/* ═══════════════════════════════════════
   UTILS.JS — Helper functions
═══════════════════════════════════════ */

// ── SCREEN ──
function showScr(id) {
  document.querySelectorAll('.scr').forEach(s => { s.style.display='none'; s.classList.remove('on'); });
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = 'flex';
  requestAnimationFrame(() => el.classList.add('on'));
}

// ── TOAST ──
function toast(msg, type='ok', duration=2800) {
  const wrap = document.getElementById('toast-wrap');
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => {
    el.classList.add('out');
    setTimeout(() => el.remove(), 300);
  }, duration);
}

// ── MODAL ──
function openModal(id) { const m = document.getElementById(id); if (m) { m.classList.remove('hide'); m.style.display='flex'; } }
function closeModal(id) { const m = document.getElementById(id); if (m) { m.classList.add('hide'); m.style.display=''; } }

// ── LOCAL STORAGE HELPERS ──
function lsGet(key, def=null) {
  try { const v = localStorage.getItem('bb_'+key); return v ? JSON.parse(v) : def; }
  catch(e) { return def; }
}
function lsSet(key, val) {
  try { localStorage.setItem('bb_'+key, JSON.stringify(val)); } catch(e) {}
}

// ── SHUFFLE ──
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length-1; i > 0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── ID GENERATOR ──
function genId() { return Date.now().toString(36) + Math.random().toString(36).substr(2, 5); }

// ── DATE FORMAT ──
function fmtDate(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleDateString('kk-KZ', { day:'2-digit', month:'short', year:'numeric' });
}

// ── CONFETTI ──
function spawnConfetti(n=40) {
  const colors = ['#f72585','#ffd60a','#06d6a0','#00b4d8','#7c3aed','#fb5607','#fff'];
  for (let i = 0; i < n; i++) {
    const el = document.createElement('div');
    el.className = 'cfp';
    el.style.setProperty('--dur', (1+Math.random()*1.5)+'s');
    el.style.setProperty('--del', (Math.random()*0.8)+'s');
    el.style.setProperty('--rot', (Math.random()*720-360)+'deg');
    el.style.left = Math.random()*100+'%';
    el.style.top = '-20px';
    el.style.width = (6+Math.random()*8)+'px';
    el.style.height = (6+Math.random()*8)+'px';
    el.style.background = colors[Math.floor(Math.random()*colors.length)];
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }
}

// ── PARTICLES ──
function spawnParticles(x, y) {
  const cx = x || window.innerWidth/2, cy = y || window.innerHeight/2;
  const colors = ['#06d6a0','#00b4d8','#ffd60a','#f72585'];
  for (let i = 0; i < 14; i++) {
    const el = document.createElement('div');
    el.className = 'particle';
    const angle = (i/14)*Math.PI*2;
    const dist = 70 + Math.random()*90;
    el.style.setProperty('--dx', Math.cos(angle)*dist+'px');
    el.style.setProperty('--dy', Math.sin(angle)*dist-80+'px');
    el.style.left = cx+'px'; el.style.top = cy+'px';
    el.style.width = el.style.height = (7+Math.random()*7)+'px';
    el.style.background = colors[Math.floor(Math.random()*colors.length)];
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 900);
  }
}

// ── SCORE FLY ──
function spawnScoreFly(pts, positive=true) {
  const el = document.createElement('div');
  el.className = 'score-fly';
  el.textContent = (positive ? '+' : '') + pts;
  el.style.color = positive ? '#06d6a0' : '#f72585';
  el.style.left = (25+Math.random()*50)+'%';
  el.style.top = (35+Math.random()*20)+'%';
  document.getElementById('score-fly-wrap').appendChild(el);
  setTimeout(() => el.remove(), 1400);
}

// ── FULLSCREEN ──
function toggleFullscreen() {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(()=>{});
  else document.exitFullscreen();
}

// ── QR CODE (simple canvas-based) ──
function drawSimpleQR(canvasEl, text, size=200) {
  // Simple visual QR-like grid (decorative)
  const ctx = canvasEl.getContext('2d');
  canvasEl.width = canvasEl.height = size;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#07071a';
  // Use a deterministic hash to generate QR-like pattern
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) | 0;
  const modules = 21;
  const mSize = size / modules;
  // Draw modules
  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      // Finder patterns
      const inFinder = (r<7&&c<7)||(r<7&&c>=modules-7)||(r>=modules-7&&c<7);
      let dark = inFinder ? ((r===0||r===6||c===0||c===6)&&(r<7&&c<7)) ||
                             ((r===0||r===6||c===modules-7||c===modules-1)&&(r<7&&c>=modules-7)) ||
                             ((r===modules-7||r===modules-1||c===0||c===6)&&(r>=modules-7&&c<7)) : false;
      if (!dark && !inFinder) {
        const bit = ((hash >> ((r*modules+c) % 32)) & 1) === 1;
        dark = bit;
      }
      if (dark) {
        ctx.fillRect(c*mSize+1, r*mSize+1, mSize-1, mSize-1);
      }
    }
  }
  // Finder pattern fills
  const fp = [[0,0],[0,modules-7],[modules-7,0]];
  fp.forEach(([rr,cc]) => {
    ctx.fillStyle = '#fff';
    ctx.fillRect((cc+1)*mSize+1,(rr+1)*mSize+1,5*mSize-1,5*mSize-1);
    ctx.fillStyle = '#07071a';
    ctx.fillRect((cc+2)*mSize+1,(rr+2)*mSize+1,3*mSize-1,3*mSize-1);
  });
}

// ── MEME SHOW/CLOSE ──
let _onMemeClose = null;
function showMeme(correct, pts, onClose, isTimeout=false) {
  let meme;
  if (isTimeout) meme = MEMES_TIMEOUT[Math.floor(Math.random()*MEMES_TIMEOUT.length)];
  else if (correct) meme = MEMES_CORRECT[Math.floor(Math.random()*MEMES_CORRECT.length)];
  else meme = MEMES_WRONG[Math.floor(Math.random()*MEMES_WRONG.length)];

  document.getElementById('meme-emoji').textContent = meme.emoji;
  document.getElementById('meme-title').textContent = meme.title;
  document.getElementById('meme-title').style.color = meme.color;
  document.getElementById('meme-sub').textContent = meme.sub;
  document.getElementById('meme-kaz').textContent = meme.kaz;
  document.getElementById('meme-pts').textContent = pts > 0 ? `+${pts} ұпай 🎉` : (isTimeout ? 'Уақыт бітті' : 'Ұпай жоқ 😬');
  document.getElementById('meme-pts').style.color = pts > 0 ? meme.color : '#f72585';

  const card = document.getElementById('meme-card');
  const isGood = correct && !isTimeout;
  card.style.background = isGood ? 'linear-gradient(145deg,#0a2d1a,#051a10)' : 'linear-gradient(145deg,#2d0a15,#200010)';
  card.style.border = `3px solid ${meme.border}`;
  card.style.boxShadow = `0 0 60px ${meme.border}40`;

  const btn = document.getElementById('meme-btn');
  btn.className = `btn btn-full ${isGood ? 'btn-g' : 'btn-r'}`;

  _onMemeClose = onClose;
  openModal('meme-modal');
  if (correct && !isTimeout) { spawnConfetti(40); spawnParticles(); sfx('correct'); }
  else if (isTimeout) { sfx('timeout'); }
  else { sfx('wrong'); }
}

function closeMeme() {
  closeModal('meme-modal');
  if (_onMemeClose) { const cb = _onMemeClose; _onMemeClose = null; cb(); }
}

// ── BONUS POPUP ──
let _onBonusClose = null;
function showBonusPopup(btype, onClose) {
  document.getElementById('bonus-star').textContent = btype.star;
  document.getElementById('bonus-pts').textContent = `+${btype.pts}`;
  document.getElementById('bonus-desc').textContent = btype.desc;
  _onBonusClose = onClose;
  openModal('bonus-modal');
  sfx('bonus');
}
function closeBonus() {
  closeModal('bonus-modal');
  if (_onBonusClose) { const cb = _onBonusClose; _onBonusClose = null; cb(); }
}

// ── HINT ──
function showHint() {
  const hintEl = document.getElementById('mod-hint');
  hintEl.classList.add('show');
  document.getElementById('hint-btn').style.display = 'none';
}

// ── CONFIRM DIALOG ──
let _onConfirmOk = null;
function showConfirm(title, body, onOk) {
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-body').textContent = body;
  _onConfirmOk = onOk;
  document.getElementById('confirm-ok-btn').onclick = () => { closeModal('confirm-modal'); if (_onConfirmOk) _onConfirmOk(); };
  openModal('confirm-modal');
}

// ── BUILD TOPBAR ──
function buildTopbar(containerId, teams, useTimer, timerSec, onFullscreen) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  teams.forEach((t, i) => {
    const card = document.createElement('div');
    card.className = 'tscore-card';
    card.id = `tsc-${i}`;
    card.style.borderColor = t.color.border+'40';
    card.innerHTML = `
      <div class="tn">${t.emoji} ${t.name}</div>
      <div class="ts" id="ts-${i}" style="color:${t.color.bg}">0</div>
      <div class="streak-fire" id="sf-${i}">🔥${t.streak||0}</div>`;
    container.appendChild(card);
  });
  const end = document.createElement('div');
  end.className = 'topbar-end';
  if (useTimer) end.innerHTML += `<div class="timer-badge" id="game-timer">${timerSec}</div>`;
  end.innerHTML += `<button class="fullscreen-btn" id="sfx-toggle" onclick="toggleSfx()" title="Дыбыс">🔊</button>`;
  end.innerHTML += `<button class="fullscreen-btn" onclick="toggleFullscreen()" title="Толық экран">⛶</button>`;
  container.appendChild(end);
}

function updateTopbar(teams) {
  teams.forEach((t, i) => {
    const sc = document.getElementById(`ts-${i}`);
    if (sc) sc.textContent = t.score;
    const card = document.getElementById(`tsc-${i}`);
    if (card) {
      card.classList.toggle('cur', t._active || false);
      if (t._active) card.style.borderColor = '#ffd60a';
      else card.style.borderColor = t.color.border+'40';
    }
    const sf = document.getElementById(`sf-${i}`);
    if (sf) {
      if (t.streak >= 3) { sf.classList.add('show'); sf.textContent = `🔥${t.streak}`; }
      else sf.classList.remove('show');
    }
  });
}

// ── TIMER ──
let _timerInterval = null;
let _timerLeft = 0;
function startTimer(sec, onTick, onEnd) {
  clearInterval(_timerInterval);
  _timerLeft = sec;
  const el = document.getElementById('game-timer');
  const fillEl = document.getElementById('mod-timer-fill');
  if (fillEl) { fillEl.style.transition='none'; fillEl.style.width='100%'; setTimeout(()=>{ fillEl.style.transition=`width ${sec}s linear`; fillEl.style.width='0%'; },50); }
  if (el) { el.textContent = sec; el.classList.remove('hot'); }
  _timerInterval = setInterval(() => {
    _timerLeft--;
    if (el) { el.textContent = _timerLeft; if (_timerLeft <= 5) { el.classList.add('hot'); sfx('tick'); } }
    if (onTick) onTick(_timerLeft);
    if (_timerLeft <= 0) { stopTimer(); if (onEnd) onEnd(); }
  }, 1000);
}
function stopTimer() { clearInterval(_timerInterval); _timerInterval = null; }

// ── SUBJECT ICONS ──
const SUBJECT_ICONS = {
  'математика':'🔢','биология':'🧬','химия':'⚗️','физика':'⚡','тарих':'📜',
  'geography':'🌍','geography':'🗺️','ағылшын':'🇬🇧','қазақ':'🇰🇿','орыс':'📖',
  'информатика':'💻','музыка':'🎵','дене':'🏃','бейнелеу':'🎨','default':'📚'
};
function getSubjectIcon(subj) {
  if (!subj) return '📚';
  const lower = subj.toLowerCase();
  for (const key of Object.keys(SUBJECT_ICONS)) if (lower.includes(key)) return SUBJECT_ICONS[key];
  return '📚';
}
