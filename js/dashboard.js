/* ═══════════════════════════════════════
   DASHBOARD.JS — Teacher dashboard
═══════════════════════════════════════ */

function loadDashboard() {
  const teacher = getCurrentTeacher();
  if (!teacher) { showScr('scr-land'); return; }
  updateSidebarUser();
  dashPage('home');
}

function updateSidebarUser() {
  const t = getCurrentTeacher();
  if (!t) return;
  document.getElementById('sb-username').textContent = `${t.avatar||'👨‍🏫'} ${t.name}`;
  document.getElementById('sb-school').textContent = t.school || '';
  document.getElementById('home-username').textContent = `${t.name}! 👋`;
}

function dashPage(page) {
  document.querySelectorAll('.page-sec').forEach(s => s.classList.remove('on'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('on'));
  const sec = document.getElementById(`dp-${page}`);
  const nav = document.getElementById(`ni-${page}`);
  if (sec) sec.classList.add('on');
  if (nav) nav.classList.add('on');

  if (page === 'home') renderHome();
  if (page === 'quizzes') renderMyQuizzes();
  if (page === 'play') renderPlayPage();
  if (page === 'stats') renderMyStats();
  if (page === 'profile') loadProfile();
}

// ── HOME ──
function renderHome() {
  const t = getCurrentTeacher();
  const quizzes = getMyQuizzes();
  const history = lsGet('game_history_'+t.username, []);

  const statsEl = document.getElementById('home-stats');
  statsEl.innerHTML = `
    <div class="stat-card"><div class="si">📝</div><div class="sv" style="color:var(--p)">${quizzes.length}</div><div class="sl">Тесттер</div></div>
    <div class="stat-card"><div class="si">🎮</div><div class="sv" style="color:var(--g)">${history.length}</div><div class="sl">Ойындар</div></div>
    <div class="stat-card"><div class="si">❓</div><div class="sv" style="color:var(--b)">${quizzes.reduce((a,q)=>a+(q.questions||[]).length,0)}</div><div class="sl">Сұрақтар</div></div>
    <div class="stat-card"><div class="si">🏆</div><div class="sv" style="color:var(--y)">${history.reduce((a,g)=>a+(g.totalScore||0),0)}</div><div class="sl">Жалпы ұпай</div></div>
  `;

  // Recent quizzes
  const recentEl = document.getElementById('recent-quizzes');
  const recent = quizzes.slice(-6).reverse();
  if (recent.length === 0) {
    recentEl.innerHTML = `<div style="color:var(--dim);font-size:.9rem;grid-column:1/-1;padding:20px;text-align:center;">
      Әлі тест жасалмаған. <span class="link" onclick="dashPage('create');openEditor(null)">Бірінші тест жасаңыз!</span></div>`;
  } else {
    recentEl.innerHTML = recent.map(q => quizCardHTML(q)).join('');
  }

  // Modes
  document.getElementById('modes-grid').innerHTML = GAME_MODES.map(m => `
    <div class="mode-card" onclick="dashPage('play')" style="border-color:${m.color}20;">
      <div class="mode-ico">${m.ico}</div>
      <div class="mode-name">${m.name}</div>
      <div class="mode-desc">${m.desc}</div>
    </div>`).join('');
}

// ── MY QUIZZES ──
function getMyQuizzes() {
  const t = getCurrentTeacher();
  const all = lsGet('quizzes', []);
  return all.filter(q => q.ownerId === t.id);
}

function renderMyQuizzes() {
  const search = (document.getElementById('quiz-search')?.value || '').toLowerCase();
  const quizzes = getMyQuizzes().filter(q =>
    !search || q.title.toLowerCase().includes(search) || (q.subject||'').toLowerCase().includes(search)
  ).reverse();
  const el = document.getElementById('my-quizzes');
  if (quizzes.length === 0) {
    el.innerHTML = `<div style="grid-column:1/-1;color:var(--dim);text-align:center;padding:24px;">
      ${search ? 'Ештеңе табылмады' : 'Тест жоқ. <span class="link" onclick="dashPage(\'create\');openEditor(null)">Жасаңыз!</span>'}</div>`;
    return;
  }
  el.innerHTML = quizzes.map(q => quizCardHTML(q)).join('');
}

function quizCardHTML(q) {
  const icon = getSubjectIcon(q.subject);
  const colors = ['var(--p)','var(--r)','var(--b)','var(--g)','var(--o)','var(--y)'];
  const color = colors[Math.abs(q.id?.charCodeAt(0)||0) % colors.length];
  return `<div class="quiz-card">
    <div class="qc-top">
      <div class="qc-icon" style="background:${color}20;">${icon}</div>
      <div class="qc-info">
        <div class="qc-title">${q.title||'Атаусыз тест'}</div>
        <div class="qc-sub">${q.subject||'—'} · ${q.grade ? q.grade+'-сынып' : ''} · ${fmtDate(q.createdAt)}</div>
      </div>
    </div>
    <div class="qc-meta">
      <span class="badge badge-p">❓ ${(q.questions||[]).length} сұрақ</span>
      <span class="badge badge-g">${q.lang==='kk'?'🇰🇿 Қазақша':q.lang==='ru'?'🇷🇺 Орысша':'🇬🇧 Ағылшын'}</span>
    </div>
    <div class="qc-actions">
      <button class="btn btn-ghost btn-sm" onclick="openEditor('${q.id}')">✏️ Өңдеу</button>
      <button class="btn btn-p btn-sm" onclick="quickPlay('${q.id}')">▶ Ойнату</button>
      <button class="btn btn-sm" style="background:var(--r2);color:var(--r);border:1px solid rgba(247,37,133,.2);" onclick="deleteQuiz('${q.id}')">🗑</button>
    </div>
  </div>`;
}

function deleteQuiz(id) {
  showConfirm('Тестті өшіру', 'Бұл тест толығымен өшіріледі. Жалғастырасыз ба?', () => {
    let quizzes = lsGet('quizzes', []);
    quizzes = quizzes.filter(q => q.id !== id);
    lsSet('quizzes', quizzes);
    toast('Тест өшірілді', 'warn');
    renderMyQuizzes();
    renderHome();
  });
}

// ── PLAY PAGE ──
function renderPlayPage() {
  const quizzes = getMyQuizzes();
  const sel = document.getElementById('play-quiz-select');
  sel.innerHTML = '<option value="">— Тест таңдаңыз —</option>';
  quizzes.reverse().forEach(q => {
    sel.innerHTML += `<option value="${q.id}">${q.title} (${(q.questions||[]).length} сұрақ)</option>`;
  });
  renderModesBig();
}

function renderModesBig() {
  const quizSelected = document.getElementById('play-quiz-select')?.value;
  const grid = document.getElementById('modes-big-grid');
  grid.innerHTML = GAME_MODES.map(m => `
    <div class="mode-big-card ${!quizSelected ? 'disabled' : ''}" 
      onclick="${quizSelected ? `startSetup('${m.id}')` : 'toast(\"Алдымен тест таңдаңыз\",\"err\")'}"
      style="border-color:${m.color}30;">
      <div class="mode-big-card-bg" style="background:${m.color}08;position:absolute;inset:0;border-radius:18px;"></div>
      <span class="mode-big-ico">${m.ico}</span>
      <div class="mode-big-name">${m.name}</div>
      <div class="mode-big-desc">${m.desc}</div>
      <span class="mode-big-badge" style="background:${m.color}20;color:${m.color};border:1px solid ${m.color}40;">${m.badge}</span>
    </div>`).join('');
}

function updatePlayQuiz() { renderModesBig(); }

function quickPlay(quizId) {
  dashPage('play');
  setTimeout(() => {
    document.getElementById('play-quiz-select').value = quizId;
    renderModesBig();
  }, 100);
}

// ── STATS ──
function renderMyStats() {
  const t = getCurrentTeacher();
  const history = lsGet('game_history_'+t.username, []);
  const quizzes = getMyQuizzes();

  document.getElementById('my-stats-grid').innerHTML = `
    <div class="stat-card"><div class="si">🎮</div><div class="sv" style="color:var(--p)">${history.length}</div><div class="sl">Ойындар</div></div>
    <div class="stat-card"><div class="si">📝</div><div class="sv" style="color:var(--g)">${quizzes.length}</div><div class="sl">Тесттер</div></div>
    <div class="stat-card"><div class="si">✅</div><div class="sv" style="color:var(--b)">${history.reduce((a,g)=>a+(g.correctCount||0),0)}</div><div class="sl">Дұрыс жауап</div></div>
    <div class="stat-card"><div class="si">🏆</div><div class="sv" style="color:var(--y)">${history.reduce((a,g)=>a+(g.totalScore||0),0)}</div><div class="sl">Жалпы ұпай</div></div>
  `;

  const histEl = document.getElementById('game-history');
  if (history.length === 0) {
    histEl.innerHTML = `<div style="color:var(--dim);text-align:center;padding:20px;">Ойын тарихы жоқ</div>`;
    return;
  }
  histEl.innerHTML = history.slice().reverse().map(g => `
    <div class="history-item">
      <div class="history-mode">${GAME_MODES.find(m=>m.id===g.mode)?.ico||'🎮'}</div>
      <div class="history-info">
        <div class="history-title">${g.quizTitle||'Тест'}</div>
        <div class="history-meta">${GAME_MODES.find(m=>m.id===g.mode)?.name||'Ойын'} · ${fmtDate(g.playedAt)} · ${g.teams?.map(t=>t.name).join(', ')||''}</div>
      </div>
      <div class="history-score">${g.totalScore||0} ұп</div>
    </div>`).join('');
}

function saveGameHistory(record) {
  const t = getCurrentTeacher();
  if (!t) return;
  const history = lsGet('game_history_'+t.username, []);
  history.push({ ...record, playedAt: Date.now() });
  lsSet('game_history_'+t.username, history);
  // update teacher stats
  t.gameCount = (t.gameCount||0) + 1;
  saveCurrentTeacher(t);
}

// ── PROFILE ──
function loadProfile() {
  const t = getCurrentTeacher();
  if (!t) return;
  document.getElementById('p-name').value = t.name||'';
  document.getElementById('p-school').value = t.school||'';
  document.getElementById('p-pass').value = '';
  document.getElementById('profile-name-disp').textContent = t.name||'';
  document.getElementById('profile-nick-disp').textContent = '@'+t.username;
  document.getElementById('profile-av').textContent = t.avatar||'👨‍🏫';
}
