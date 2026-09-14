/* ═══════════════════════════════════════
   AUTH.JS — Login, Register, Logout
═══════════════════════════════════════ */

function switchAuthTab(tab) {
  document.getElementById('auth-login').style.display = tab==='login' ? 'block' : 'none';
  document.getElementById('auth-reg').style.display = tab==='register' ? 'block' : 'none';
  document.getElementById('tab-login').classList.toggle('on', tab==='login');
  document.getElementById('tab-reg').classList.toggle('on', tab==='register');
}

function doLogin() {
  const user = document.getElementById('l-user').value.trim();
  const pass = document.getElementById('l-pass').value;
  if (!user || !pass) { toast('Логин мен пароль енгізіңіз', 'err'); return; }

  // Admin check
  const adminCreds = lsGet('admin_creds', ADMIN_DEFAULT);
  if (user === adminCreds.login && pass === adminCreds.pass) {
    lsSet('session', { role:'admin', username: user });
    toast('Admin ретінде кірдіңіз! ⚡', 'warn');
    showScr('scr-admin');
    loadAdminPanel();
    return;
  }

  // Teacher check
  const teachers = lsGet('teachers', []);
  const teacher = teachers.find(t => t.username === user && t.pass === pass);
  if (!teacher) { toast('Логин немесе пароль қате', 'err'); return; }
  if (teacher.disabled) { toast('Аккаунтыңыз бұғатталған. Adminге хабарласыңыз.', 'err'); return; }

  lsSet('session', { role:'teacher', username: user });
  toast(`Қош келдіңіз, ${teacher.name}! 🎉`, 'ok');
  showScr('scr-dash');
  loadDashboard();
}

function doRegister() {
  const username = document.getElementById('r-user').value.trim();
  const name = document.getElementById('r-name').value.trim();
  const school = document.getElementById('r-school').value.trim();
  const pass = document.getElementById('r-pass').value;
  const pass2 = document.getElementById('r-pass2').value;

  if (!username) { toast('Никнейм міндетті!', 'err'); return; }
  if (!/^[a-zA-Z0-9_а-яёА-ЯЁәіңғүұқөһӘІҢҒҮҰҚӨҺ]+$/i.test(username)) {
    toast('Никнейм: тек әріп, цифр, _ таңбасы', 'err'); return;
  }
  if (!name) { toast('Аты-жөні міндетті!', 'err'); return; }
  if (pass.length < 4) { toast('Пароль кем дегенде 4 таңба', 'err'); return; }
  if (pass !== pass2) { toast('Парольдер сәйкес келмейді', 'err'); return; }

  // Check uniqueness
  const teachers = lsGet('teachers', []);
  const adminCreds = lsGet('admin_creds', ADMIN_DEFAULT);
  if (username === adminCreds.login) { toast('Бұл никнейм қолданылған', 'err'); return; }
  if (teachers.find(t => t.username === username)) { toast('Бұл никнейм бос емес!', 'err'); return; }

  const newTeacher = {
    id: genId(), username, name, school: school || 'Мектеп', pass,
    avatar: '👨‍🏫', createdAt: Date.now(), disabled: false,
    quizCount: 0, gameCount: 0
  };
  teachers.push(newTeacher);
  lsSet('teachers', teachers);

  lsSet('session', { role:'teacher', username });
  toast('Тіркелу сәтті! 🎉', 'ok');
  showScr('scr-dash');
  loadDashboard();
}

function doLogout() {
  lsSet('session', null);
  showScr('scr-land');
  toast('Сәтті шықтыңыз', 'info');
}

function getSession() { return lsGet('session'); }

function getCurrentTeacher() {
  const s = getSession();
  if (!s || s.role !== 'teacher') return null;
  const teachers = lsGet('teachers', []);
  return teachers.find(t => t.username === s.username) || null;
}

function saveCurrentTeacher(updated) {
  const teachers = lsGet('teachers', []);
  const idx = teachers.findIndex(t => t.username === updated.username);
  if (idx >= 0) { teachers[idx] = updated; lsSet('teachers', teachers); }
}

function saveProfile() {
  const teacher = getCurrentTeacher();
  if (!teacher) return;
  const name = document.getElementById('p-name').value.trim();
  const school = document.getElementById('p-school').value.trim();
  const pass = document.getElementById('p-pass').value;
  if (!name) { toast('Аты-жөні бос болмасын', 'err'); return; }
  teacher.name = name;
  teacher.school = school;
  if (pass) { if (pass.length < 4) { toast('Пароль кем дегенде 4 таңба', 'err'); return; } teacher.pass = pass; }
  saveCurrentTeacher(teacher);
  toast('Профиль сақталды ✅', 'ok');
  updateSidebarUser();
}
