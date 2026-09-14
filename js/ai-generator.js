/* ═══════════════════════════════════════
   AI-GENERATOR.JS — AI Quiz Generator
   Claude claude-sonnet-4-20250514 API
═══════════════════════════════════════ */

function toggleApiKeyVis() {
  const inp = document.getElementById('ai-apikey');
  const btn = document.getElementById('ai-key-toggle');
  if (inp.type === 'password') { inp.type = 'text'; btn.textContent = '🙈 Жасыру'; }
  else { inp.type = 'password'; btn.textContent = '👁 Көру'; }
}

function getApiKey() {
  const inp = document.getElementById('ai-apikey');
  const val = (inp?.value || '').trim();
  if (val) { lsSet('ai_key', val); return val; }
  return lsGet('ai_key', '');
}

// Load saved key on page load
window.addEventListener('DOMContentLoaded', () => {
  const saved = lsGet('ai_key', '');
  if (saved) { const inp = document.getElementById('ai-apikey'); if (inp) inp.value = saved; }
});

async function generateAI() {
  const topic   = document.getElementById('ai-topic').value.trim();
  const grade   = document.getElementById('ai-grade').value;
  const lang    = document.getElementById('ai-lang').value;
  const count   = Math.min(20, Math.max(3, +document.getElementById('ai-count').value || 10));
  const apiKey  = getApiKey();

  if (!topic)  { toast('Тақырып енгізіңіз!', 'err'); return; }
  if (!apiKey) {
    toast('API кілтін енгізіңіз! console.anthropic.com-дан алыңыз', 'err', 5000);
    document.getElementById('ai-apikey')?.focus();
    return;
  }

  const btn = document.getElementById('ai-btn');
  const progress = document.getElementById('ai-progress');
  const bar = document.getElementById('ai-bar-fill');
  const barText = document.getElementById('ai-bar-text');

  btn.disabled = true; btn.textContent = '⏳ Жасалуда...';
  progress.classList.add('show');
  bar.style.width = '10%';
  barText.textContent = 'AI-ға жіберілуде...';

  const langNames = { kk:'қазақ тілінде', ru:'орыс тілінде', en:'ағылшын тілінде' };
  const prompt = `Мұғалімге сұрақтар жасайтын AI асистентсің.
Тақырып: "${topic}"
Сынып: ${grade}
Тіл: ${langNames[lang]||'қазақ тілінде'}
Сұрақ саны: ${count}

ТІКЕЛЕЙ JSON қайтар (markdown жоқ, тек JSON):
{"questions":[{"q":"сұрақ мәтіні","formula":"формула (бос болуы мүмкін)","opts":["A жауап","B жауап","C жауап","D жауап"],"ans":0,"pts":10,"hint":"кеңес"}]}

Ережелер:
- ans = 0,1,2,3 — кезекпен өзгертіп тұр, барлығы 0 болмасын
- pts: 10 оңай, 15 орта, 20 қиын
- formula: формула/термин немесе бос
- Тек JSON, басқа ештеңе жоқ`;

  try {
    bar.style.width = '30%'; barText.textContent = 'Claude жауап беруде...';

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    bar.style.width = '70%'; barText.textContent = 'Жауап өңделуде...';

    if (!response.ok) {
      const errData = await response.json().catch(()=>({}));
      throw new Error(errData?.error?.message || 'HTTP ' + response.status);
    }

    const data = await response.json();
    let rawText = (data.content||[]).map(c=>c.text||'').join('').trim();
    rawText = rawText.replace(/```json\s*/gi,'').replace(/```\s*/g,'').trim();
    const s = rawText.indexOf('{'), e = rawText.lastIndexOf('}');
    if (s>=0 && e>s) rawText = rawText.slice(s, e+1);

    let parsed;
    try { parsed = JSON.parse(rawText); }
    catch(err2) {
      rawText = rawText.replace(/[\u0000-\u001F\u007F]/g,' ').replace(/,\s*}/g,'}').replace(/,\s*]/g,']');
      parsed = JSON.parse(rawText);
    }

    const qs = parsed.questions || parsed;
    if (!Array.isArray(qs)||qs.length===0) throw new Error('Сұрақтар табылмады');

    const normalized = qs.map((q,i)=>({
      q: String(q.q||q.question||'Сұрақ '+(i+1)).trim(),
      formula: String(q.formula||'').trim(),
      opts: Array.isArray(q.opts) ? q.opts.slice(0,4).map(String) : ['A','B','C','D'],
      ans: typeof q.ans==='number'?q.ans:typeof q.answer==='number'?q.answer:0,
      pts: Number(q.pts||10),
      hint: String(q.hint||'').trim()
    }));

    bar.style.width = '100%'; barText.textContent = `✅ ${normalized.length} сұрақ жасалды!`;
    _questions = [..._questions, ...normalized];
    updateQList();
    sfx('correct'); spawnConfetti(20);
    toast(`🤖 ${normalized.length} сұрақ AI жасады!`, 'ok');
    if (!document.getElementById('ed-title').value.trim())
      document.getElementById('ed-title').value = `${topic} тесті`;

    setTimeout(()=>{ progress.classList.remove('show'); bar.style.width='0%'; btn.disabled=false; btn.textContent='✨ Жасау'; }, 2000);

  } catch(err) {
    console.error('AI қатесі:', err);
    const msg = String(err.message||'');
    let hint = 'Қате шықты';
    if (msg.includes('401')||msg.toLowerCase().includes('unauthorized')||msg.includes('invalid x-api-key')) {
      hint = 'API кілті жарамсыз — console.anthropic.com-дан жаңасын алыңыз';
      lsSet('ai_key','');
      const ki = document.getElementById('ai-apikey'); if(ki){ki.value='';ki.focus();}
    } else if (msg.includes('403')) hint = 'Кілтке рұқсат жоқ';
    else if (msg.includes('429')) hint = 'Тым жиі, 30 сек күтіңіз';
    else if (msg.toLowerCase().includes('failed to fetch')||msg.includes('network')) hint = 'Интернет жоқ немесе CORS';
    else if (msg.includes('JSON')||msg.includes('parse')) hint = 'Жауап форматы дұрыс емес, қайталаңыз';
    else if (msg.length < 120) hint = msg;

    toast('❌ AI қатесі: ' + hint, 'err', 6000);
    sfx('wrong');
    progress.classList.remove('show'); bar.style.width='0%'; btn.disabled=false; btn.textContent='✨ Жасау';
  }
}
