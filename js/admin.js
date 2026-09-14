/* ═══════════════════════════════════════
   ADMIN.JS — Admin panel
═══════════════════════════════════════ */

function loadAdminPanel() {
  adminPage('teachers');
}

function adminPage(page) {
  document.querySelectorAll('.page-sec').forEach(s => s.classList.remove('on'));
  document.querySelectorAll('.admin-nav').forEach(n => n.classList.remove('on'));
  const sec = document.getElementById(`ap-${page}`);
  const nav = document.getElementById(`an-${page}`);
  if (sec) sec.classList.add('on');
  if (nav) nav.classList.add('on');

  if (page === 'teachers') renderTeacherList();
  if (page === 'quizzes') renderAdminQuizzes();
  if (page === 'stats') renderAdminStats();
}

function renderTeacherList() {
  const search = (document.getElementById('admin-search')?.value||'').toLowerCase();
  const teachers = lsGet('teachers', []);
  const filtered = teachers.filter(t =>
    !search || t.name?.toLowerCase().includes(search) ||
    t.username?.toLowerCase().includes(search) ||
    t.school?.toLowerCase().includes(search)
  );
  document.getElementById('teachers-count').textContent = `${filtered.length} мұғалім`;

  const el = document.getElementById('teacher-list');
  if (filtered.length === 0) {
    el.innerHTML = `<div style="color:var(--dim);text-align:center;padding:20px;">Мұғалімдер жоқ</div>`;
    return;
  }
  el.innerHTML = filtered.map(t => `
    <div class="teacher-row">
      <div class="teacher-av">${t.avatar||'👨‍🏫'}</div>
      <div class="teacher-info">
        <div class="teacher-name">${t.name||'Аты жоқ'} <span style="color:var(--dim);font-size:.8rem;">@${t.username}</span></div>
        <div class="teacher-meta">🏫 ${t.school||'—'} · 📝 ${t.quizCount||0} тест · 🎮 ${t.gameCount||0} ойын · ${fmtDate(t.createdAt)}</div>
      </div>
      <div class="teacher-actions">
        <span class="badge ${t.disabled ? 'badge-r' : 'badge-g'}">${t.disabled ? '🚫 Бұғат' : '✅ Белсенді'}</span>
        <button class="btn btn-ghost btn-sm" onclick="toggleTeacherDisable('${t.username}')">
          ${t.disabled ? '🔓 Ашу' : '🔒 Бұғат'}
        </button>
        <button class="btn btn-sm" style="background:var(--r2);color:var(--r);border:1px solid rgba(247,37,133,.2);"
          onclick="deleteTeacher('${t.username}')">🗑</button>
      </div>
    </div>`).join('');
}

function toggleTeacherDisable(username) {
  const teachers = lsGet('teachers', []);
  const idx = teachers.findIndex(t => t.username === username);
  if (idx >= 0) {
    teachers[idx].disabled = !teachers[idx].disabled;
    lsSet('teachers', teachers);
    toast(teachers[idx].disabled ? `@${username} бұғатталды` : `@${username} белсендірілді`, 'warn');
    renderTeacherList();
  }
}

function deleteTeacher(username) {
  showConfirm(`@${username} өшіру`, 'Мұғалімнің барлық деректері жойылады!', () => {
    let teachers = lsGet('teachers', []);
    teachers = teachers.filter(t => t.username !== username);
    lsSet('teachers', teachers);
    // Also delete their quizzes
    let quizzes = lsGet('quizzes', []);
    const teacher = teachers.find(t => t.username === username);
    if (teacher) quizzes = quizzes.filter(q => q.ownerId !== teacher.id);
    lsSet('quizzes', quizzes);
    toast(`@${username} өшірілді`, 'ok');
    renderTeacherList();
  });
}

function renderAdminQuizzes() {
  const quizzes = lsGet('quizzes', []);
  const el = document.getElementById('admin-quiz-list');
  if (quizzes.length === 0) { el.innerHTML = `<div style="color:var(--dim);text-align:center;padding:20px;grid-column:1/-1;">Тест жоқ</div>`; return; }
  el.innerHTML = quizzes.reverse().map(q => `
    <div class="quiz-card">
      <div class="qc-top">
        <div class="qc-icon" style="background:var(--p3);">${getSubjectIcon(q.subject)}</div>
        <div class="qc-info">
          <div class="qc-title">${q.title||'—'}</div>
          <div class="qc-sub">👨‍🏫 ${q.ownerName||q.ownerId||'—'} · ${q.subject||'—'} · ${fmtDate(q.createdAt)}</div>
        </div>
      </div>
      <div class="qc-meta"><span class="badge badge-p">❓ ${(q.questions||[]).length} сұрақ</span></div>
    </div>`).join('');
}

function renderAdminStats() {
  const teachers = lsGet('teachers', []);
  const quizzes = lsGet('quizzes', []);
  document.getElementById('admin-stats-grid').innerHTML = `
    <div class="stat-card"><div class="si">👨‍🏫</div><div class="sv" style="color:var(--p)">${teachers.length}</div><div class="sl">Мұғалімдер</div></div>
    <div class="stat-card"><div class="si">📝</div><div class="sv" style="color:var(--g)">${quizzes.length}</div><div class="sl">Тесттер</div></div>
    <div class="stat-card"><div class="si">❓</div><div class="sv" style="color:var(--b)">${quizzes.reduce((a,q)=>a+(q.questions||[]).length,0)}</div><div class="sl">Сұрақтар</div></div>
    <div class="stat-card"><div class="si">🚫</div><div class="sv" style="color:var(--r)">${teachers.filter(t=>t.disabled).length}</div><div class="sl">Бұғатталған</div></div>
  `;
}

function saveAdminCreds() {
  const login = document.getElementById('admin-new-login').value.trim();
  const pass = document.getElementById('admin-new-pass').value;
  if (!login || !pass) { toast('Логин мен пароль міндетті', 'err'); return; }
  lsSet('admin_creds', { login, pass });
  lsSet('session', { role:'admin', username: login });
  toast('Admin деректері сақталды ✅', 'ok');
}
