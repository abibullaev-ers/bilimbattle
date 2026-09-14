/* ═══════════════════════════════════════
   EDITOR.JS — Quiz editor
═══════════════════════════════════════ */

let _editingQuiz = null;

function openEditor(quizId) {
  if (quizId) {
    const all = lsGet('quizzes', []);
    _editingQuiz = all.find(q => q.id === quizId) || null;
  } else {
    _editingQuiz = null;
  }
  renderEditor();
}

function renderEditor() {
  const q = _editingQuiz;
  document.getElementById('editor-title').textContent = q ? '✏️ Тест өңдеу' : '✏️ Жаңа тест';
  document.getElementById('ed-title').value = q?.title || '';
  document.getElementById('ed-subject').value = q?.subject || '';
  document.getElementById('ed-grade').value = q?.grade || '9';
  document.getElementById('ed-lang').value = q?.lang || 'kk';
  renderQList(q?.questions || []);
}

// ── QUESTION LIST ──
let _questions = [];

function renderQList(questions) {
  _questions = questions ? [...questions] : [];
  updateQList();
}

function updateQList() {
  const el = document.getElementById('q-list');
  document.getElementById('q-count-label').textContent = `${_questions.length} сұрақ`;
  if (_questions.length === 0) {
    el.innerHTML = `<div style="text-align:center;color:var(--dim);padding:20px;font-size:.9rem;">
      Сұрақ жоқ. AI генераторын пайдаланыңыз немесе қолмен қосыңыз.</div>`;
    return;
  }
  el.innerHTML = _questions.map((q, i) => `
    <div class="q-item" id="qi-${i}">
      <div class="q-item-hdr">
        <span class="q-drag-handle">⠿</span>
        <span class="q-num">${i+1}</span>
        <div style="flex:1;">
          <input class="inp" style="margin-bottom:0;" value="${escHtml(q.q||'')}"
            oninput="updateQ(${i},'q',this.value)" placeholder="Сұрақ мәтіні">
        </div>
        <input class="inp q-pts-inp" type="number" value="${q.pts||10}" min="5" max="100"
          oninput="updateQ(${i},'pts',+this.value)" title="Ұпай">
        <button class="q-remove" onclick="removeQ(${i})">✕</button>
      </div>
      ${q.formula !== undefined ? `<input class="inp" value="${escHtml(q.formula||'')}"
        oninput="updateQ(${i},'formula',this.value)" placeholder="Формула / қосымша мәтін (міндетті емес)"
        style="margin-bottom:8px;font-family:'Fredoka One',cursive;color:var(--y);">` : ''}
      <div class="opts-2">
        ${[0,1,2,3].map(j => `
          <div class="opt-row">
            <div class="opt-radio ${q.ans===j?'on':''}" onclick="setAns(${i},${j})" title="Дұрыс жауап">
              ${q.ans===j?'✓':['A','B','C','D'][j]}
            </div>
            <input class="inp" value="${escHtml(q.opts&&q.opts[j]?q.opts[j]:'')}"
              oninput="updateOpt(${i},${j},this.value)" placeholder="${['A','B','C','D'][j]} нұсқасы">
          </div>`).join('')}
      </div>
      <input class="inp" value="${escHtml(q.hint||'')}"
        oninput="updateQ(${i},'hint',this.value)" placeholder="💡 Кеңес (міндетті емес)"
        style="margin-top:6px;font-size:.84rem;color:var(--dim);background:rgba(124,58,237,.06);">
    </div>`).join('');
}

function updateQ(i, key, val) { _questions[i][key] = val; }
function updateOpt(i, j, val) { if (!_questions[i].opts) _questions[i].opts=['',' ','','']; _questions[i].opts[j] = val; }
function setAns(i, j) { _questions[i].ans = j; updateQList(); }
function removeQ(i) { _questions.splice(i,1); updateQList(); }

function addQuestion() {
  _questions.push({ q:'', formula:'', opts:['','','',''], ans:0, pts:10, hint:'' });
  updateQList();
  setTimeout(() => {
    const items = document.querySelectorAll('.q-item');
    if (items.length) items[items.length-1].scrollIntoView({ behavior:'smooth' });
  }, 100);
}

// ── SAVE QUIZ ──
function saveQuiz() {
  const title = document.getElementById('ed-title').value.trim();
  const subject = document.getElementById('ed-subject').value.trim();
  const grade = document.getElementById('ed-grade').value;
  const lang = document.getElementById('ed-lang').value;

  if (!title) { toast('Тест атауын енгізіңіз!', 'err'); return; }
  if (_questions.length === 0) { toast('Кем дегенде 1 сұрақ қосыңыз!', 'err'); return; }

  // Validate questions
  for (let i = 0; i < _questions.length; i++) {
    const q = _questions[i];
    if (!q.q && !q.formula) { toast(`${i+1}-сұрақ мәтіні бос!`, 'err'); return; }
    if (!q.opts || q.opts.filter(Boolean).length < 2) { toast(`${i+1}-сұрақта кем дегенде 2 жауап нұсқасы болуы тиіс`, 'err'); return; }
  }

  const t = getCurrentTeacher();
  const all = lsGet('quizzes', []);

  if (_editingQuiz) {
    const idx = all.findIndex(q => q.id === _editingQuiz.id);
    if (idx >= 0) {
      all[idx] = { ...all[idx], title, subject, grade, lang, questions: [..._questions], updatedAt: Date.now() };
      _editingQuiz = all[idx];
    }
  } else {
    const newQ = { id: genId(), ownerId: t.id, ownerName: t.name, title, subject, grade, lang,
      questions: [..._questions], createdAt: Date.now() };
    all.push(newQ);
    _editingQuiz = newQ;
    // Update teacher quiz count
    t.quizCount = (t.quizCount||0)+1;
    saveCurrentTeacher(t);
  }
  lsSet('quizzes', all);
  toast('Тест сақталды! ✅', 'ok');
  document.getElementById('editor-title').textContent = '✏️ Тест өңдеу';
}

function previewQuiz() {
  if (_questions.length === 0) { toast('Сұрақ жоқ', 'err'); return; }
  toast(`Тест алдын ала көру: ${_questions.length} сұрақ`, 'info');
}

// ── FILE DRAG/DROP ──
function handleDragOver(e) { e.preventDefault(); document.getElementById('file-zone').classList.add('drag'); }
function handleDragLeave(e) { document.getElementById('file-zone').classList.remove('drag'); }
function handleFileDrop(e) {
  e.preventDefault();
  document.getElementById('file-zone').classList.remove('drag');
  const file = e.dataTransfer?.files?.[0];
  if (file) processFile(file);
}
function handleFileImport(e) {
  const file = e.target.files?.[0];
  if (file) processFile(file);
}

function processFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  if (ext === 'txt') {
    const reader = new FileReader();
    reader.onload = e => parseTxtQuestions(e.target.result, file.name);
    reader.readAsText(file, 'UTF-8');
  } else {
    toast(`${ext.toUpperCase()} форматы қолдайды, бірақ браузерде толық парсер жоқ. TXT форматын қолданыңыз.`, 'warn', 4000);
    showFileParseTip();
  }
}

function parseTxtQuestions(text, filename) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const parsed = [];
  let cur = null;

  for (const line of lines) {
    if (/^\d+[.)]\s/.test(line) || (line.length > 10 && !line.match(/^[A-Dа-дabcd][.)]/i))) {
      if (cur && cur.opts.filter(Boolean).length >= 2) parsed.push(cur);
      cur = { q: line.replace(/^\d+[.)]\s/,''), opts:['','','',''], ans:0, pts:10 };
    } else if (cur && /^[A-Dа-дabcd][.)]/i.test(line)) {
      const idx = 'abcd'.indexOf(line[0].toLowerCase());
      if (idx >= 0) {
        const text = line.slice(2).trim();
        const isCorrect = text.startsWith('*');
        cur.opts[idx] = isCorrect ? text.slice(1).trim() : text;
        if (isCorrect) cur.ans = idx;
      }
    }
  }
  if (cur && cur.opts.filter(Boolean).length >= 2) parsed.push(cur);

  if (parsed.length === 0) { toast('Сұрақтар табылмады. Форматты тексеріңіз.', 'err'); showFileParseTip(); return; }

  _questions = [..._questions, ...parsed];
  updateQList();
  toast(`✅ ${parsed.length} сұрақ импортталды!`, 'ok');

  const prev = document.getElementById('file-preview');
  prev.classList.add('show');
  prev.innerHTML = `<strong>📂 ${filename}</strong> → ${parsed.length} сұрақ табылды`;
}

function showFileParseTip() {
  const prev = document.getElementById('file-preview');
  prev.classList.add('show');
  prev.innerHTML = `<strong>Дұрыс TXT формат:</strong><br>
    1. Сұрақ мәтіні<br>A) Жауап нұсқасы<br>B) *Дұрыс жауап (жұлдызша)<br>C) Жауап<br>D) Жауап<br><br>
    2. Келесі сұрақ...`;
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
