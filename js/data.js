/* ═══════════════════════════════════════
   DATA.JS — Constants, Questions, Monsters
═══════════════════════════════════════ */

// ── ADMIN DEFAULTS ──
const ADMIN_DEFAULT = { login: 'ERS', pass: '0525' };

// ── TEAM CONFIGS ──
const TEAM_COLORS = [
  { bg:'#7c3aed', border:'#a855f7', light:'rgba(124,58,237,.2)', glow:'rgba(124,58,237,.5)' },
  { bg:'#f72585', border:'#ff5ca1', light:'rgba(247,37,133,.2)', glow:'rgba(247,37,133,.5)' },
  { bg:'#00b4d8', border:'#66d9f5', light:'rgba(0,180,216,.2)', glow:'rgba(0,180,216,.5)' },
  { bg:'#fb5607', border:'#fc8d5a', light:'rgba(251,86,7,.2)', glow:'rgba(251,86,7,.5)' },
];
const TEAM_EMOJIS = ['🦁','🐯','🦊','🦅','🐲','🤖','🦄','🐺'];
const TEAM_DEFAULT_NAMES = ['Арыстан','Жолбарыс','Түлкі','Қасқыр'];
const AVATAR_OPTIONS = ['🦁','🐯','🦊','🦅','🐲','🤖','🦄','🐺','🦈','🔥','⚡','🌟','💎','🎯','🚀','👾'];

// ── GAME MODES ──
const GAME_MODES = [
  { id:'bamboozle', name:'BilimBattle', ico:'🃏', desc:'Карточка таңдап, командалық жауап', color:'#7c3aed', badge:'Классик', teams:true },
  { id:'kahoot',    name:'Kahoot',      ico:'⚡', desc:'Жылдам жеке жауап, таймер ойыны', color:'#f72585', badge:'Жылдам', teams:false },
  { id:'monster',   name:'Monster Raid',ico:'👾', desc:'Boss монстрға қарсы бүкіл сынып', color:'#fb5607', badge:'Эпик', teams:true },
  { id:'roulette',  name:'Рулетка',     ico:'🎰', desc:'Кездейсоқ сұрақ + бонус', color:'#00b4d8', badge:'Кездейсоқ', teams:true },
];

// ── MONSTER DEFINITIONS ──
const MONSTERS = [
  {
    id:'dragon', name:'Сан Айдаһары', level:'Математика Демоны',
    hp: { easy:300, normal:500, hard:800, legend:1200 },
    dmgToTeam: { easy:15, normal:25, hard:40, legend:60 },
    color:'#f72585', glow:'rgba(247,37,133,.6)',
    svg: `<svg class="m-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <style>.m-eye{animation:eyeGlow 2s ease-in-out infinite alternate}</style>
      <!-- Body -->
      <ellipse cx="100" cy="120" rx="55" ry="45" fill="#8b0000"/>
      <ellipse cx="100" cy="120" rx="50" ry="40" fill="#c0392b"/>
      <!-- Neck -->
      <ellipse cx="100" cy="78" rx="22" ry="28" fill="#c0392b"/>
      <!-- Head -->
      <ellipse cx="100" cy="55" rx="35" ry="28" fill="#e74c3c"/>
      <!-- Horns -->
      <polygon points="82,30 76,5 88,28" fill="#8b0000"/>
      <polygon points="118,30 124,5 112,28" fill="#8b0000"/>
      <!-- Snout -->
      <ellipse cx="100" cy="68" rx="18" ry="10" fill="#c0392b"/>
      <!-- Nostrils -->
      <circle cx="94" cy="68" r="3" fill="#8b0000"/>
      <circle cx="106" cy="68" r="3" fill="#8b0000"/>
      <!-- Eyes -->
      <circle cx="88" cy="50" r="8" fill="#fff" class="m-eye"/>
      <circle cx="112" cy="50" r="8" fill="#fff" class="m-eye"/>
      <circle cx="90" cy="50" r="5" fill="#f72585"/>
      <circle cx="114" cy="50" r="5" fill="#f72585"/>
      <circle cx="91" cy="49" r="2.5" fill="#000"/>
      <circle cx="115" cy="49" r="2.5" fill="#000"/>
      <circle cx="92" cy="48" r="1" fill="#fff"/>
      <circle cx="116" cy="48" r="1" fill="#fff"/>
      <!-- Wings -->
      <path d="M55,100 L15,55 L45,95 Z" fill="#8b0000" opacity=".9"/>
      <path d="M145,100 L185,55 L155,95 Z" fill="#8b0000" opacity=".9"/>
      <!-- Tail -->
      <path d="M145,140 Q175,160 165,180 Q150,170 145,155 Z" fill="#c0392b"/>
      <!-- Claws -->
      <path d="M72,158 L65,175 M80,162 L76,178 M88,164 L86,180" stroke="#8b0000" stroke-width="3" stroke-linecap="round"/>
      <path d="M128,158 L135,175 M120,162 L124,178 M112,164 L114,180" stroke="#8b0000" stroke-width="3" stroke-linecap="round"/>
      <!-- Math symbols on body -->
      <text x="88" y="125" fill="rgba(255,255,255,.3)" font-size="12" font-weight="bold">√x²</text>
      <!-- Fire breath hint -->
      <circle cx="115" cy="70" r="4" fill="#ffd60a" opacity=".7"/>
      <circle cx="122" cy="66" r="3" fill="#fb5607" opacity=".6"/>
    </svg>`
  },
  {
    id:'slime', name:'Физика Шайтаны', level:'Энергия Жыланы',
    hp: { easy:300, normal:500, hard:800, legend:1200 },
    dmgToTeam: { easy:12, normal:22, hard:35, legend:55 },
    color:'#00b4d8', glow:'rgba(0,180,216,.6)',
    svg: `<svg class="m-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <!-- Body blob -->
      <ellipse cx="100" cy="130" rx="60" ry="50" fill="#0077b6"/>
      <ellipse cx="100" cy="125" rx="55" ry="45" fill="#00b4d8"/>
      <!-- Drips -->
      <ellipse cx="55" cy="168" rx="10" ry="14" fill="#0077b6"/>
      <ellipse cx="145" cy="168" rx="10" ry="14" fill="#0077b6"/>
      <ellipse cx="80" cy="175" rx="8" ry="12" fill="#0077b6"/>
      <ellipse cx="120" cy="175" rx="8" ry="12" fill="#0077b6"/>
      <!-- Head -->
      <ellipse cx="100" cy="80" rx="40" ry="38" fill="#00b4d8"/>
      <!-- Highlight -->
      <ellipse cx="88" cy="68" rx="15" ry="10" fill="rgba(255,255,255,.15)"/>
      <!-- Eyes -->
      <circle cx="86" cy="76" r="10" fill="#fff" class="m-eye"/>
      <circle cx="114" cy="76" r="10" fill="#fff" class="m-eye"/>
      <circle cx="88" cy="76" r="6" fill="#0077b6"/>
      <circle cx="116" cy="76" r="6" fill="#0077b6"/>
      <circle cx="89" cy="75" r="3" fill="#000"/>
      <circle cx="117" cy="75" r="3" fill="#000"/>
      <circle cx="90" cy="74" r="1.2" fill="#fff"/>
      <circle cx="118" cy="74" r="1.2" fill="#fff"/>
      <!-- Mouth -->
      <path d="M86,96 Q100,108 114,96" stroke="#0077b6" stroke-width="3" fill="none" stroke-linecap="round"/>
      <!-- Arms -->
      <ellipse cx="52" cy="120" rx="15" ry="12" fill="#00b4d8"/>
      <ellipse cx="148" cy="120" rx="15" ry="12" fill="#00b4d8"/>
      <!-- Physics symbol -->
      <text x="86" y="138" fill="rgba(255,255,255,.3)" font-size="11" font-weight="bold">E=mc²</text>
      <!-- Antenna -->
      <line x1="100" y1="42" x2="100" y2="25" stroke="#00b4d8" stroke-width="2"/>
      <circle cx="100" cy="22" r="5" fill="#00f5ff" opacity=".8"/>
    </svg>`
  },
  {
    id:'skull', name:'Тарих Перісі', level:'Ескі Дүние Рухы',
    hp: { easy:300, normal:500, hard:800, legend:1200 },
    dmgToTeam: { easy:18, normal:28, hard:45, legend:65 },
    color:'#a855f7', glow:'rgba(168,85,247,.6)',
    svg: `<svg class="m-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <!-- Robe -->
      <path d="M60,120 L40,190 L160,190 L140,120 Z" fill="#2d1b69"/>
      <path d="M65,118 L45,188 L155,188 L135,118 Z" fill="#3d2b7f"/>
      <!-- Hood -->
      <path d="M55,80 Q50,40 100,35 Q150,40 145,80 L145,120 L55,120 Z" fill="#2d1b69"/>
      <!-- Head -->
      <ellipse cx="100" cy="80" rx="38" ry="42" fill="#e8e8e8"/>
      <!-- Skull cracks -->
      <path d="M80,55 L85,70" stroke="#ccc" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M115,52 L110,68" stroke="#ccc" stroke-width="1.5" stroke-linecap="round"/>
      <!-- Eye sockets -->
      <ellipse cx="85" cy="78" rx="11" ry="13" fill="#1a0040"/>
      <ellipse cx="115" cy="78" rx="11" ry="13" fill="#1a0040"/>
      <!-- Glowing eyes -->
      <ellipse cx="85" cy="78" rx="7" ry="9" fill="#a855f7" class="m-eye"/>
      <ellipse cx="115" cy="78" rx="7" ry="9" fill="#a855f7" class="m-eye"/>
      <circle cx="85" cy="78" r="4" fill="#7c3aed"/>
      <circle cx="115" cy="78" r="4" fill="#7c3aed"/>
      <!-- Nose hole -->
      <path d="M96,92 L100,100 L104,92" fill="#ccc"/>
      <!-- Teeth -->
      <rect x="84" y="103" width="6" height="9" rx="2" fill="#f0f0f0"/>
      <rect x="92" y="103" width="6" height="9" rx="2" fill="#f0f0f0"/>
      <rect x="100" y="103" width="6" height="9" rx="2" fill="#f0f0f0"/>
      <rect x="108" y="103" width="6" height="9" rx="2" fill="#f0f0f0"/>
      <!-- Crown -->
      <path d="M70,55 L75,38 L85,50 L100,36 L115,50 L125,38 L130,55 Z" fill="#ffd60a"/>
      <!-- Staff -->
      <line x1="160" y1="80" x2="160" y2="188" stroke="#4a3080" stroke-width="4"/>
      <circle cx="160" cy="74" r="10" fill="#a855f7" opacity=".8"/>
      <!-- History symbol -->
      <text x="80" y="148" fill="rgba(255,255,255,.25)" font-size="9">1241 жыл</text>
    </svg>`
  },
  {
    id:'robot', name:'Химия Зомбиі', level:'Токсин Жыланы',
    hp: { easy:300, normal:500, hard:800, legend:1200 },
    dmgToTeam: { easy:14, normal:24, hard:38, legend:58 },
    color:'#06d6a0', glow:'rgba(6,214,160,.6)',
    svg: `<svg class="m-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <!-- Body -->
      <rect x="55" y="100" width="90" height="80" rx="10" fill="#1a4a2e"/>
      <rect x="60" y="105" width="80" height="70" rx="8" fill="#27ae60"/>
      <!-- Toxic bubbles -->
      <circle cx="75" cy="125" r="8" fill="#2ecc71" opacity=".6"/>
      <circle cx="100" cy="120" r="6" fill="#00b894" opacity=".5"/>
      <circle cx="125" cy="128" r="9" fill="#27ae60" opacity=".7"/>
      <!-- Head -->
      <rect x="62" y="50" width="76" height="58" rx="12" fill="#1a4a2e"/>
      <rect x="66" y="54" width="68" height="50" rx="10" fill="#27ae60"/>
      <!-- Eyes -->
      <rect x="73" y="63" width="18" height="14" rx="4" fill="#000"/>
      <rect x="109" y="63" width="18" height="14" rx="4" fill="#000"/>
      <rect x="75" y="65" width="14" height="10" rx="3" fill="#06d6a0" class="m-eye"/>
      <rect x="111" y="65" width="14" height="10" rx="3" fill="#06d6a0" class="m-eye"/>
      <line x1="82" y1="63" x2="82" y2="77" stroke="#000" stroke-width="1.5"/>
      <line x1="118" y1="63" x2="118" y2="77" stroke="#000" stroke-width="1.5"/>
      <!-- Mouth grille -->
      <rect x="80" y="86" width="40" height="12" rx="3" fill="#1a4a2e"/>
      <line x1="85" y1="86" x2="85" y2="98" stroke="#27ae60" stroke-width="1.5"/>
      <line x1="92" y1="86" x2="92" y2="98" stroke="#27ae60" stroke-width="1.5"/>
      <line x1="99" y1="86" x2="99" y2="98" stroke="#27ae60" stroke-width="1.5"/>
      <line x1="106" y1="86" x2="106" y2="98" stroke="#27ae60" stroke-width="1.5"/>
      <line x1="113" y1="86" x2="113" y2="98" stroke="#27ae60" stroke-width="1.5"/>
      <!-- Antenna -->
      <line x1="100" y1="50" x2="100" y2="35" stroke="#1a4a2e" stroke-width="3"/>
      <circle cx="100" cy="30" r="7" fill="#06d6a0" opacity=".9"/>
      <!-- Arms -->
      <rect x="30" y="105" width="22" height="55" rx="8" fill="#27ae60"/>
      <rect x="148" y="105" width="22" height="55" rx="8" fill="#27ae60"/>
      <!-- Claws -->
      <path d="M32,158 L28,172 M40,160 L38,174 M48,158 L50,172" stroke="#1a4a2e" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M168,158 L172,172 M160,160 L162,174 M152,158 L150,172" stroke="#1a4a2e" stroke-width="2.5" stroke-linecap="round"/>
      <!-- Chem formula -->
      <text x="74" y="135" fill="rgba(255,255,255,.25)" font-size="9" font-weight="bold">H₂SO₄</text>
      <!-- Toxic drips -->
      <ellipse cx="80" cy="182" rx="6" ry="8" fill="#06d6a0" opacity=".5"/>
      <ellipse cx="120" cy="184" rx="5" ry="7" fill="#06d6a0" opacity=".4"/>
    </svg>`
  },
  {
    id:'alien', name:'Биология Мутанты', level:'Жабайы Ағза',
    hp: { easy:300, normal:500, hard:800, legend:1200 },
    dmgToTeam: { easy:16, normal:26, hard:42, legend:62 },
    color:'#ffd60a', glow:'rgba(255,214,10,.6)',
    svg: `<svg class="m-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <!-- Body -->
      <ellipse cx="100" cy="135" rx="42" ry="45" fill="#5a3e00"/>
      <ellipse cx="100" cy="130" rx="38" ry="40" fill="#b8860b"/>
      <!-- Spots -->
      <circle cx="85" cy="118" r="7" fill="#8b6914" opacity=".7"/>
      <circle cx="112" cy="128" r="5" fill="#8b6914" opacity=".7"/>
      <circle cx="95" cy="142" r="6" fill="#8b6914" opacity=".6"/>
      <!-- Head -->
      <ellipse cx="100" cy="72" rx="44" ry="48" fill="#b8860b"/>
      <!-- Large eyes (alien-like) -->
      <ellipse cx="82" cy="65" rx="16" ry="20" fill="#000"/>
      <ellipse cx="118" cy="65" rx="16" ry="20" fill="#000"/>
      <ellipse cx="82" cy="65" rx="11" ry="14" fill="#ffd60a" class="m-eye"/>
      <ellipse cx="118" cy="65" rx="11" ry="14" fill="#ffd60a" class="m-eye"/>
      <circle cx="82" cy="65" r="6" fill="#fb8500"/>
      <circle cx="118" cy="65" r="6" fill="#fb8500"/>
      <circle cx="83" cy="64" r="3" fill="#000"/>
      <circle cx="119" cy="64" r="3" fill="#000"/>
      <circle cx="84" cy="63" r="1.2" fill="#fff"/>
      <circle cx="120" cy="63" r="1.2" fill="#fff"/>
      <!-- Mouth tentacles -->
      <path d="M86,96 Q100,106 114,96" stroke="#5a3e00" stroke-width="2.5" fill="none"/>
      <path d="M90,100 L88,112" stroke="#5a3e00" stroke-width="2" stroke-linecap="round"/>
      <path d="M100,103 L100,115" stroke="#5a3e00" stroke-width="2" stroke-linecap="round"/>
      <path d="M110,100 L112,112" stroke="#5a3e00" stroke-width="2" stroke-linecap="round"/>
      <!-- Head bumps -->
      <ellipse cx="70" cy="40" rx="10" ry="8" fill="#b8860b"/>
      <ellipse cx="100" cy="28" rx="10" ry="8" fill="#b8860b"/>
      <ellipse cx="130" cy="40" rx="10" ry="8" fill="#b8860b"/>
      <!-- Legs -->
      <rect x="72" y="170" width="16" height="22" rx="6" fill="#b8860b"/>
      <rect x="112" y="170" width="16" height="22" rx="6" fill="#b8860b"/>
      <!-- DNA symbol -->
      <text x="84" y="138" fill="rgba(255,255,255,.2)" font-size="9">DNA🧬</text>
    </svg>`
  },
];

// ── MEMES ──
const MEMES_CORRECT = [
  { emoji:'🔥', title:'ЖАРАЙСЫҢ!', sub:'That\'s correct!', kaz:'Бұл математик туған! 🧠', color:'#06d6a0', border:'#06d6a0' },
  { emoji:'😎', title:'GENIUS!', sub:'Big brain energy!', kaz:'Миы бар адам екен! 💪', color:'#00b4d8', border:'#00b4d8' },
  { emoji:'🚀', title:'TO THE MOON!', sub:'Einstein would be proud!', kaz:'Эйнштейн мақтан тұтар! 🌙', color:'#ffd60a', border:'#ffd60a' },
  { emoji:'⚡', title:'LIGHTNING!', sub:'Too fast bro!', kaz:'Суперкомпьютер ме бұл?! 🤯', color:'#a855f7', border:'#a855f7' },
  { emoji:'🏆', title:'CHAMPION!', sub:'Top tier answer!', kaz:'Бірінші орын сенікі! 🥇', color:'#fb5607', border:'#fb5607' },
  { emoji:'🎯', title:'BULLSEYE!', sub:'Perfect!', kaz:'Дәл ортасына тиді! 🎪', color:'#f72585', border:'#f72585' },
  { emoji:'💎', title:'DIAMOND!', sub:'Flawless victory!', kaz:'Мінсіз жауап! 💫', color:'#00f5ff', border:'#00f5ff' },
];
const MEMES_WRONG = [
  { emoji:'😂', title:'ОЙ-ОЙ...', sub:'GG no re', kaz:'Сабаққа бармаған-ба? 😅', color:'#f72585', border:'#f72585' },
  { emoji:'🤡', title:'CLOWN!', sub:'Nope, try again', kaz:'Мектеп партасын жылытқан... 🎪', color:'#f72585', border:'#f72585' },
  { emoji:'💀', title:'RIP POINTS', sub:'F in the chat', kaz:'Ата-анаңа не дейсің? 😬', color:'#a855f7', border:'#a855f7' },
  { emoji:'🤦', title:'FACEPALM', sub:'Bro studied something else', kaz:'Сабақта не оқыдың? 📚', color:'#fb5607', border:'#fb5607' },
  { emoji:'😤', title:'NEXT TIME!', sub:'You\'ll get it!', kaz:'Қайталау — оқудың анасы! 💪', color:'#00b4d8', border:'#00b4d8' },
];
const MEMES_TIMEOUT = [
  { emoji:'⏰', title:'УАҚЫТ!', sub:'Time\'s up!', kaz:'Секундтар аяусыз... ⌛', color:'#ffd60a', border:'#ffd60a' },
  { emoji:'🏃', title:'ТЕЗ БОЛ!', sub:'Too slow!', kaz:'Жылдам болмасаң болмайды! 😤', color:'#fb5607', border:'#fb5607' },
];

// ── BONUS TYPES ──
const BONUS_TYPES = [
  { star:'⭐', pts:20, desc:'Жолдама бонусы!' },
  { star:'🌟', pts:35, desc:'Мега бонус!' },
  { star:'💎', pts:50, desc:'АЛМАС бонус!' },
  { star:'🔥', pts:30, desc:'Від бонус!' },
  { star:'🎯', pts:25, desc:'Нақты бонус!' },
  { star:'🚀', pts:40, desc:'Ракета бонус!' },
];

// ── ROULETTE SEGMENTS ──
const ROULETTE_SEGS = [
  { label:'❓ Сұрақ', type:'question', pts:10, color:'#667eea' },
  { label:'⭐ +20', type:'bonus', pts:20, color:'#ffd60a' },
  { label:'❓ Сұрақ', type:'question', pts:15, color:'#f093fb' },
  { label:'💀 -10', type:'trap', pts:-10, color:'#f72585' },
  { label:'❓ Сұрақ', type:'question', pts:10, color:'#4facfe' },
  { label:'🔥 +30', type:'bonus', pts:30, color:'#fb5607' },
  { label:'❓ Сұрақ', type:'question', pts:20, color:'#43e97b' },
  { label:'❄️ Стоп', type:'freeze', pts:0, color:'#00b4d8' },
  { label:'❓ Сұрақ', type:'question', pts:10, color:'#a18cd1' },
  { label:'💎 +50', type:'bonus', pts:50, color:'#00f5ff' },
];

// ── SAMPLE QUESTIONS (fallback if no quiz selected) ──
const SAMPLE_QUESTIONS = [
  { q:'√(a²) = ?', formula:'√(a²) = ?', opts:['|a|','a','a²','-a'], ans:0, pts:10, hint:'a теріс болса не болады?' },
  { q:'Есептеңіз', formula:'√225 = ?', opts:['15','14','16','13'], ans:0, pts:10 },
  { q:'Квадрат түбір көбейту қасиеті:', formula:'√a · √b = ?', opts:['√(ab)','√a+√b','a·b','√(a+b)'], ans:0, pts:15 },
  { q:'Есептеңіз:', formula:'√72 = ?', opts:['6√2','8√3','4√6','9√2'], ans:0, pts:20, hint:'72 = 36·2' },
  { q:'(√7)² = ?', formula:'(√7)² = ?', opts:['7','49','√49','14'], ans:0, pts:10 },
  { q:'Есептеңіз:', formula:'√(64/121) = ?', opts:['8/11','11/8','4/11','8/12'], ans:0, pts:20 },
  { q:'Жеңілдетіңіз (x≥0):', formula:'√(16x⁴) = ?', opts:['4x²','4x⁴','16x²','2x²'], ans:0, pts:20 },
  { q:'Жеңілдетіңіз:', formula:'√2 + √8 = ?', opts:['3√2','2√10','√10','2√2'], ans:0, pts:20, hint:'√8 = 2√2' },
  { q:'Есептеңіз:', formula:'√5 · √20 = ?', opts:['10','√25','5√4','25'], ans:0, pts:15 },
  { q:'ОДЗ:', formula:'√(2x−6) үшін x≥?', opts:['3','6','-3','2'], ans:0, pts:25, hint:'2x-6≥0' },
];

// ── CARD GRADIENTS ──
const CARD_GRADS = ['cg0','cg1','cg2','cg3','cg4','cg5','cg6','cg7','cg8','cg9'];

// ── STREAK MESSAGES ──
const STREAK_MSGS = {
  3: '🔥 3 дұрыс қатарынан!',
  5: '⚡ 5 жолы! ЖАРАЙСЫҢ!',
  7: '💎 7 қатарынан! ЛЕГЕНДА!',
  10:'🚀 10 қатарынан! ТАҢ ҚАЛДЫРДЫҢЫЗ!',
};
