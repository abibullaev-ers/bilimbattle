/* ═══════════════════════════════════════
   MAIN.JS — App initialization
═══════════════════════════════════════ */

// ── INIT ──
window.addEventListener('DOMContentLoaded', () => {
  // Check existing session
  const session = getSession();
  if (session) {
    if (session.role === 'admin') {
      showScr('scr-admin');
      loadAdminPanel();
    } else if (session.role === 'teacher') {
      const teacher = getCurrentTeacher();
      if (teacher && !teacher.disabled) {
        showScr('scr-dash');
        loadDashboard();
      } else {
        lsSet('session', null);
        showScr('scr-land');
        if (teacher?.disabled) toast('Аккаунтыңыз бұғатталған', 'err');
      }
    } else {
      showScr('scr-land');
    }
  } else {
    showScr('scr-land');
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      // Close any open modal
      document.querySelectorAll('.modal-overlay:not(.hide)').forEach(m => {
        if (m.id !== 'q-modal') closeModal(m.id);
      });
    }
    if (e.key === 'F11') {
      e.preventDefault();
      toggleFullscreen();
    }
  });

  // Prevent context menu in game
  document.addEventListener('contextmenu', e => {
    const scr = document.querySelector('.scr.on');
    if (scr && ['scr-bamboozle','scr-kahoot','scr-monster','scr-roulette'].includes(scr.id)) {
      e.preventDefault();
    }
  });

  // Demo data: add a sample quiz if none exists
  setTimeout(addDemoDataIfEmpty, 500);
});

function addDemoDataIfEmpty() {
  const quizzes = lsGet('quizzes', []);
  const teachers = lsGet('teachers', []);
  // Only add demo if there's at least one teacher and no quizzes
  if (teachers.length > 0 && quizzes.length === 0) {
    const t = teachers[0];
    const demo = {
      id: genId(),
      ownerId: t.id,
      ownerName: t.name,
      title: 'Демо: Квадрат түбір',
      subject: 'Математика',
      grade: '9',
      lang: 'kk',
      questions: SAMPLE_QUESTIONS.map(q => ({ ...q })),
      createdAt: Date.now(),
    };
    quizzes.push(demo);
    lsSet('quizzes', quizzes);
  }
}

// ── GLOBAL ERROR HANDLER ──
window.addEventListener('error', e => {
  console.error('BilimBattle error:', e.message, e.filename, e.lineno);
});

// ── DEBUG HELPER (dev only) ──
window.bb_reset = () => {
  ['session','teachers','quizzes','admin_creds'].forEach(k => localStorage.removeItem('bb_'+k));
  toast('Барлық деректер тазаланды', 'warn');
  setTimeout(() => location.reload(), 800);
};
window.bb_info = () => {
  console.table({
    teachers: (lsGet('teachers')||[]).length,
    quizzes: (lsGet('quizzes')||[]).length,
    session: lsGet('session'),
  });
};
