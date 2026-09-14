/* ═══════════════════════════════════════
   SOUNDS.JS — Web Audio API Sound Effects
   Барлық дыбыстар браузерде генерацияланады
   (сыртқы файл жоқ)
═══════════════════════════════════════ */

let _audioCtx = null;
let _muted = false;
let _vol = 0.55;

function getAudioCtx() {
  if (!_audioCtx) {
    try { _audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch(e) { return null; }
  }
  if (_audioCtx.state === 'suspended') _audioCtx.resume();
  return _audioCtx;
}

function sfx(type) {
  if (_muted) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    switch(type) {
      case 'correct':  playCorrect(ctx);  break;
      case 'wrong':    playWrong(ctx);    break;
      case 'click':    playClick(ctx);    break;
      case 'open':     playOpen(ctx);     break;
      case 'bonus':    playBonus(ctx);    break;
      case 'timeout':  playTimeout(ctx);  break;
      case 'streak':   playStreak(ctx);   break;
      case 'crit':     playCrit(ctx);     break;
      case 'monster_hit': playMonsterHit(ctx); break;
      case 'monster_atk': playMonsterAtk(ctx); break;
      case 'victory':  playVictory(ctx);  break;
      case 'defeat':   playDefeat(ctx);   break;
      case 'spin':     playSpin(ctx);     break;
      case 'tick':     playTick(ctx);     break;
      case 'levelup':  playLevelUp(ctx);  break;
    }
  } catch(e) {}
}

/* ── helpers ── */
function osc(ctx, type, freq, gainVal, start, dur, endFreq) {
  const g = ctx.createGain();
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freq, ctx.currentTime + start);
  if (endFreq !== undefined) o.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + start + dur);
  g.gain.setValueAtTime(gainVal * _vol, ctx.currentTime + start);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
  o.connect(g); g.connect(ctx.destination);
  o.start(ctx.currentTime + start);
  o.stop(ctx.currentTime + start + dur + 0.01);
}

function noise(ctx, gainVal, start, dur, filterFreq=2000) {
  const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i=0;i<data.length;i++) data[i] = (Math.random()*2-1);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filt = ctx.createBiquadFilter();
  filt.type = 'bandpass'; filt.frequency.value = filterFreq; filt.Q.value = 1.5;
  const g = ctx.createGain();
  g.gain.setValueAtTime(gainVal * _vol, ctx.currentTime + start);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
  src.connect(filt); filt.connect(g); g.connect(ctx.destination);
  src.start(ctx.currentTime + start);
  src.stop(ctx.currentTime + start + dur + 0.02);
}

/* ── CORRECT ✅ — жоғары, шаттық ── */
function playCorrect(ctx) {
  osc(ctx,'sine', 440, .35, 0,   .12);
  osc(ctx,'sine', 554, .35, .1,  .12);
  osc(ctx,'sine', 660, .35, .2,  .15);
  osc(ctx,'sine', 880, .28, .3,  .22);
  // sparkle
  osc(ctx,'sine',1200, .15, .32, .18);
  osc(ctx,'sine',1600, .1,  .4,  .15);
}

/* ── WRONG ❌ — төмен, ауыр ── */
function playWrong(ctx) {
  osc(ctx,'sawtooth', 300, .3, 0,   .18, 180);
  osc(ctx,'sawtooth', 220, .3, .12, .22, 120);
  osc(ctx,'square',   150, .2, .28, .18);
  noise(ctx, .15, 0, .3, 400);
}

/* ── CLICK 🖱 — карточка басу ── */
function playClick(ctx) {
  osc(ctx,'sine', 800, .25, 0, .06);
  osc(ctx,'sine', 600, .15, .04, .05);
}

/* ── OPEN — сұрақ ашылу ── */
function playOpen(ctx) {
  osc(ctx,'sine', 520, .2, 0,   .08);
  osc(ctx,'sine', 650, .2, .07, .08);
  osc(ctx,'sine', 780, .2, .14, .1);
}

/* ── BONUS ⭐ — жұлдыз дыбысы ── */
function playBonus(ctx) {
  [0, .08, .16, .24, .32].forEach((t, i) => {
    osc(ctx, 'sine', 600 + i*180, .28, t, .12);
  });
  osc(ctx,'sine',1800,.1,.3,.2);
}

/* ── TIMEOUT ⏰ ── */
function playTimeout(ctx) {
  osc(ctx,'square', 440, .3, 0,   .15, 330);
  osc(ctx,'square', 330, .3, .15, .15, 220);
  osc(ctx,'square', 220, .2, .3,  .2,  150);
}

/* ── STREAK 🔥 — 3+ қатарынан ── */
function playStreak(ctx) {
  osc(ctx,'sine', 523, .3,  0,   .1);
  osc(ctx,'sine', 659, .3,  .1,  .1);
  osc(ctx,'sine', 784, .3,  .2,  .1);
  osc(ctx,'sine', 1047,.28, .3,  .15);
  osc(ctx,'sine', 1318,.22, .42, .2);
  noise(ctx,.1,.28,.25,1000);
}

/* ── CRIT ⚡ — критикалық соққы ── */
function playCrit(ctx) {
  noise(ctx,.4, 0, .08, 3000);
  osc(ctx,'sawtooth',180,.4,0,.25,80);
  osc(ctx,'square',  400,.3,.05,.2);
  osc(ctx,'sine',    900,.2,.1,.25,400);
  noise(ctx,.2,.05,.25,600);
}

/* ── MONSTER HIT — монстрға соққы ── */
function playMonsterHit(ctx) {
  noise(ctx,.5,0,.08,2500);
  osc(ctx,'sawtooth',120,.4,0,.3,60);
  osc(ctx,'square',  300,.25,.05,.2);
}

/* ── MONSTER ATTACK — монстр шабуыл ── */
function playMonsterAtk(ctx) {
  osc(ctx,'sawtooth',80,.5,0,.4,40);
  noise(ctx,.4,0,.15,300);
  osc(ctx,'square',  200,.3,.1,.3);
  osc(ctx,'sine',    60,.4,.2,.35,30);
}

/* ── VICTORY 🏆 ── */
function playVictory(ctx) {
  const melody = [523,659,784,1047,784,1047,1319];
  const times  = [0,.12,.22,.32,.44,.54,.64];
  melody.forEach((f,i)=> osc(ctx,'sine',f,.35,times[i],.25));
  // Fanfare chord
  osc(ctx,'sine', 523,.25,.8,.5);
  osc(ctx,'sine', 659,.25,.8,.5);
  osc(ctx,'sine', 784,.25,.8,.5);
  osc(ctx,'sine',1047,.2, .8,.5);
}

/* ── DEFEAT 💀 ── */
function playDefeat(ctx) {
  osc(ctx,'sawtooth',392,.35,0,.3,330);
  osc(ctx,'sawtooth',330,.35,.25,.3,277);
  osc(ctx,'sawtooth',277,.3,.5,.35,220);
  osc(ctx,'sawtooth',220,.3,.8,.5,165);
  noise(ctx,.2,0,.8,200);
}

/* ── SPIN 🎰 — рулетка ── */
function playSpin(ctx) {
  // Ascending ticks
  for (let i=0;i<8;i++) osc(ctx,'square',400+i*60,.2,i*.05,.04);
}

/* ── TICK ⏱ — таймер соңғы секундтар ── */
function playTick(ctx) {
  osc(ctx,'square',880,.18,0,.06);
}

/* ── LEVEL UP — деңгей асу ── */
function playLevelUp(ctx) {
  const notes = [523,659,784,880,1047,1319];
  notes.forEach((f,i)=> osc(ctx,'sine',f,.3,i*.1,.2));
}

/* ── MUTE TOGGLE ── */
function toggleMute() {
  _muted = !_muted;
  lsSet('muted', _muted);
  const btn = document.getElementById('mute-btn');
  if (btn) btn.textContent = _muted ? '🔇' : '🔊';
  if (!_muted) sfx('click');
}

/* ── LOAD MUTE STATE ── */
window.addEventListener('DOMContentLoaded', () => {
  _muted = lsGet('muted', false);
});

/* ── AUTO-SFX HOOKS — ойын событиелерімен байланыстыру ── */
// These are called from other game files via sfx('type')

// Alias for topbar button
function toggleSfx() {
  toggleMute();
  const btn = document.getElementById('sfx-toggle');
  if (btn) btn.textContent = _muted ? '🔇' : '🔊';
}
