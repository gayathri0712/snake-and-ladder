/* ====================================================
   SNAKES & LADDERS — PREMIUM GAME ENGINE
   ==================================================== */

// ===== GAME DATA =====
const ladders = { 4: 25, 13: 46, 33: 49, 42: 63, 50: 69, 62: 81, 74: 92, 88: 98 };
const snakes  = { 99: 78, 95: 75, 93: 73, 64: 60, 59: 22, 52: 11, 48: 26, 45: 7, 29: 9, 18: 6 };

const playerColors = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];
const playerNames  = ['Nova', 'Atlas', 'Mira', 'Orion', 'Sage', 'Lumen'];

// ===== GAME STATE =====
const game = {
  mode: 'local',
  count: 4,
  players: [],
  colors: [...playerColors],
  current: 0,
  moves: 0,
  busy: false,
  active: false,
  sound: localStorage.getItem('snakesSound') !== 'off',
  motion: localStorage.getItem('snakesMotion') !== 'off',
  theme: localStorage.getItem('snakesTheme') || 'light',
};

// ===== UTILITIES =====
const $ = (id) => document.getElementById(id);
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 3D Dice rotation map
const diceRotations = {
  0: 'rotateX(-20deg) rotateY(25deg)',      // neutral / idle
  1: 'rotateX(0deg) rotateY(0deg)',          // front face
  2: 'rotateX(0deg) rotateY(-90deg)',        // right face
  3: 'rotateX(90deg) rotateY(0deg)',         // top face
  4: 'rotateX(-90deg) rotateY(0deg)',        // bottom face
  5: 'rotateX(0deg) rotateY(90deg)',         // left face
  6: 'rotateX(0deg) rotateY(180deg)',        // back face
};

// ===== INITIALIZATION =====
function init() {
  // Apply saved theme
  document.body.classList.toggle('dark', game.theme === 'dark');
  
  // Apply saved settings
  $('soundSetting').checked = game.sound;
  $('motionSetting').checked = game.motion;
  
  // Build UI
  buildPlayerConfig();
  createPreview();
  createParticles();
  
  // Bind all events
  bindEvents();
  updateSoundUI();
  showDice(0);
}

// ===== PARTICLE SYSTEM =====
function createParticles() {
  const container = $('particles');
  if (!container) return;
  container.innerHTML = '';
  
  for (let i = 0; i < 25; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.cssText = `
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      width: ${2 + Math.random() * 3}px;
      height: ${2 + Math.random() * 3}px;
      animation-delay: ${Math.random() * 20}s;
      animation-duration: ${18 + Math.random() * 20}s;
      opacity: ${0.08 + Math.random() * 0.15};
    `;
    container.appendChild(particle);
  }
}

// ===== 3D DICE =====
function showDice(value) {
  const cube = $('diceCube');
  if (!cube) return;
  cube.classList.remove('rolling');
  cube.style.transform = diceRotations[value] || diceRotations[0];
}

function startDiceRoll() {
  const cube = $('diceCube');
  if (!cube) return;
  cube.classList.add('rolling');
}

function stopDiceRoll(value) {
  const cube = $('diceCube');
  if (!cube) return;
  cube.classList.remove('rolling');
  
  // Add extra rotations for dramatic effect
  const baseRotation = diceRotations[value];
  const extraSpins = 'rotateX(720deg) rotateY(720deg) ';
  cube.style.transform = baseRotation;
}

// ===== CONFETTI ENGINE =====
function createConfetti() {
  const container = $('confettiContainer');
  if (!container) return;
  container.innerHTML = '';
  
  const colors = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#fb7185', '#fff', '#a78bfa', '#22d3ee'];
  
  for (let i = 0; i < 120; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    const size = 4 + Math.random() * 8;
    piece.style.cssText = `
      left: ${Math.random() * 100}%;
      width: ${size}px;
      height: ${size * (0.4 + Math.random() * 0.8)}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      animation-delay: ${Math.random() * 2.5}s;
      animation-duration: ${2 + Math.random() * 3}s;
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
    `;
    container.appendChild(piece);
  }
}

// ===== EVENT BINDING =====
function bindEvents() {
  // Mode selection
  document.querySelectorAll('[data-mode]').forEach((button) => {
    button.addEventListener('click', () => {
      game.mode = button.dataset.mode;
      document.querySelectorAll('[data-mode]').forEach((item) => {
        item.classList.toggle('is-selected', item === button);
      });
      buildPlayerConfig();
    });
  });
  
  // Player count
  document.querySelectorAll('[data-count]').forEach((button) => {
    button.addEventListener('click', () => {
      game.count = +button.dataset.count;
      document.querySelectorAll('[data-count]').forEach((item) => {
        item.classList.toggle('is-selected', item === button);
      });
      buildPlayerConfig();
    });
  });
  
  // Game controls
  $('startButton').addEventListener('click', startGame);
  $('randomButton').addEventListener('click', randomSetup);
  $('rollButton').addEventListener('click', rollDice);
  
  // Exit flow
  $('exitButton').addEventListener('click', () => $('exitModal').hidden = false);
  $('cancelExitButton').addEventListener('click', () => $('exitModal').hidden = true);
  $('confirmExitButton').addEventListener('click', resetToSetup);
  
  // Winner flow
  $('winnerSetupButton').addEventListener('click', resetToSetup);
  $('playAgainButton').addEventListener('click', playAgain);
  
  // Settings
  $('themeButton').addEventListener('click', toggleTheme);
  $('soundButton').addEventListener('click', toggleSound);
  $('settingsButton').addEventListener('click', () => $('settingsModal').hidden = false);
  $('closeSettingsButton').addEventListener('click', () => $('settingsModal').hidden = true);
  
  $('soundSetting').addEventListener('change', (e) => setSound(e.target.checked));
  $('motionSetting').addEventListener('change', (e) => {
    game.motion = e.target.checked;
    localStorage.setItem('snakesMotion', game.motion ? 'on' : 'off');
  });
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      ['settingsModal', 'exitModal', 'winnerModal'].forEach((id) => $(id).hidden = true);
    }
    if (e.code === 'Space' && !$('gameScreen').hidden) {
      e.preventDefault();
      rollDice();
    }
  });
}

// ===== PLAYER CONFIG =====
function buildPlayerConfig(values) {
  const saved = values || [...document.querySelectorAll('.player-name')].map((input) => input.value);
  $('playerConfig').innerHTML = '';
  
  for (let i = 0; i < game.count; i++) {
    const card = document.createElement('article');
    card.className = 'player-card';
    card.style.setProperty('--player-color', game.colors[i]);
    
    const isAI = game.mode === 'ai' && i > 0;
    
    card.innerHTML = `
      <div class="player-card-top">
        <span class="avatar" style="background:${game.colors[i]}">${i + 1}</span>
        <input class="player-name" aria-label="Player ${i + 1} name"
               value="${saved[i] || `Player ${i + 1}`}" maxlength="18">
      </div>
      <div class="player-controls">
        <label class="ai-toggle">
          <input class="ai-check" type="checkbox" ${isAI ? 'checked' : ''}
                 ${game.mode === 'tournament' ? 'disabled' : ''}>
          ${isAI ? 'AI PLAYER' : 'HUMAN'}
        </label>
        <select class="difficulty" aria-label="Player ${i + 1} difficulty">
          <option>Easy</option>
          <option selected>Normal</option>
          <option>Hard</option>
          <option>Expert</option>
        </select>
      </div>
    `;
    
    $('playerConfig').appendChild(card);
    
    // Toggle AI/Human label
    const check = card.querySelector('.ai-check');
    const select = card.querySelector('.difficulty');
    select.disabled = !check.checked;
    
    check.addEventListener('change', () => {
      select.disabled = !check.checked;
      card.querySelector('.ai-toggle').lastChild.textContent = check.checked ? ' AI PLAYER' : ' HUMAN';
    });
  }
}

// ===== RANDOM SETUP =====
function randomSetup() {
  game.colors = [...playerColors].sort(() => Math.random() - 0.5);
  const shuffledNames = [...playerNames].sort(() => Math.random() - 0.5);
  const values = Array.from({ length: game.count }, (_, i) =>
    shuffledNames[i] + ' ' + (10 + Math.floor(Math.random() * 89))
  );
  
  buildPlayerConfig(values);
  
  document.querySelectorAll('.ai-check').forEach((check, i) => {
    check.checked = game.mode === 'ai' ? i > 0 : Math.random() > 0.6;
    check.dispatchEvent(new Event('change'));
  });
  
  document.querySelectorAll('.difficulty').forEach((select) => {
    select.value = ['Easy', 'Normal', 'Hard', 'Expert'][Math.floor(Math.random() * 4)];
  });
  
  toast('Fresh players and colors are ready.');
}

// ===== PREVIEW BOARD =====
function createPreview() {
  const preview = $('previewBoard');
  if (!preview) return;
  preview.innerHTML = '';
  
  for (let n = 100; n >= 1; n--) {
    const cell = document.createElement('span');
    cell.className = 'preview-cell';
    cell.textContent = n;
    if (ladders[n]) cell.classList.add('ladder');
    if (snakes[n]) cell.classList.add('snake');
    preview.appendChild(cell);
  }
}

// ===== START GAME =====
function startGame() {
  game.players = [...document.querySelectorAll('.player-card')].map((card, i) => ({
    id: i + 1,
    name: card.querySelector('.player-name').value.trim() || `Player ${i + 1}`,
    color: game.colors[i],
    position: 1,
    isAI: card.querySelector('.ai-check').checked,
    difficulty: card.querySelector('.difficulty').value,
    // Stats tracking
    ladders: 0,
    snakeBites: 0,
    rolls: [],
  }));
  
  game.current = 0;
  game.moves = 0;
  game.active = true;
  game.busy = false;
  
  $('setupScreen').hidden = true;
  $('gameScreen').hidden = false;
  
  createBoard();
  renderPlayerList();
  renderLog(`Match started. ${game.players[0].name} rolls first.`);
  updateUI();
  showDice(0);
  maybeAI();
}

// ===== BOARD CREATION =====
function createBoard() {
  const cells = $('cells');
  cells.innerHTML = '';
  
  for (let row = 9; row >= 0; row--) {
    const forward = row % 2 === 1;
    for (let col = 0; col < 10; col++) {
      const number = row * 10 + (forward ? col + 1 : 10 - col);
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.square = number;
      cell.setAttribute('role', 'gridcell');
      cell.setAttribute('aria-label', `Square ${number}`);
      cell.textContent = number;
      
      if (ladders[number]) cell.classList.add('ladder');
      if (snakes[number]) cell.classList.add('snake');
      
      cells.appendChild(cell);
    }
  }
  
  drawVisualLayer();
  renderPieces();
}

// ===== COORDINATE MAPPING =====
function point(square) {
  const row = Math.floor((square - 1) / 10);
  const col = (square - 1) % 10;
  return {
    x: (row % 2 ? col : 9 - col) * 100 + 50,
    y: (9 - row) * 100 + 50,
  };
}

// ===== VISUAL LAYER (SVG) — REALISTIC SNAKES & LADDERS =====
function drawVisualLayer() {
  const svg = $('visualLayer');

  // Snake color palettes — each snake gets a unique look
  const snakeStyles = [
    { body: '#16a34a', belly: '#86efac', pattern: '#15803d', head: '#166534', eye: '#fde047', tongue: '#ef4444' },
    { body: '#dc2626', belly: '#fca5a5', pattern: '#991b1b', head: '#7f1d1d', eye: '#fde047', tongue: '#dc2626' },
    { body: '#7c3aed', belly: '#c4b5fd', pattern: '#5b21b6', head: '#4c1d95', eye: '#fde047', tongue: '#f472b6' },
    { body: '#ea580c', belly: '#fdba74', pattern: '#c2410c', head: '#9a3412', eye: '#fde047', tongue: '#ef4444' },
    { body: '#0891b2', belly: '#67e8f9', pattern: '#0e7490', head: '#155e75', eye: '#fde047', tongue: '#f472b6' },
    { body: '#c026d3', belly: '#f0abfc', pattern: '#a21caf', head: '#86198f', eye: '#fde047', tongue: '#ef4444' },
    { body: '#059669', belly: '#6ee7b7', pattern: '#047857', head: '#064e3b', eye: '#fde047', tongue: '#ef4444' },
    { body: '#e11d48', belly: '#fda4af', pattern: '#be123c', head: '#9f1239', eye: '#fde047', tongue: '#dc2626' },
    { body: '#ca8a04', belly: '#fef08a', pattern: '#a16207', head: '#854d0e', eye: '#fff', tongue: '#ef4444' },
    { body: '#4f46e5', belly: '#a5b4fc', pattern: '#3730a3', head: '#312e81', eye: '#fde047', tongue: '#f472b6' },
  ];

  // Build all defs — gradients per snake + ladder wood
  let defs = `<defs>
    <!-- Ladder wood gradients -->
    <linearGradient id="woodRail" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#d4a056"/>
      <stop offset="30%" stop-color="#b8860b"/>
      <stop offset="60%" stop-color="#a0722a"/>
      <stop offset="100%" stop-color="#8B6914"/>
    </linearGradient>
    <linearGradient id="woodRung" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#deb887"/>
      <stop offset="50%" stop-color="#c8a26a"/>
      <stop offset="100%" stop-color="#a0844a"/>
    </linearGradient>
    <linearGradient id="woodHighlight" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(255,255,255,0.35)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </linearGradient>
    <filter id="ladderShadow">
      <feDropShadow dx="3" dy="4" stdDeviation="3" flood-color="rgba(0,0,0,0.35)"/>
    </filter>
    <filter id="snakeShadow">
      <feDropShadow dx="2" dy="3" stdDeviation="4" flood-color="rgba(0,0,0,0.4)"/>
    </filter>
    <filter id="softGlow">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>`;

  // Per-snake gradients
  Object.entries(snakes).forEach(([from, to], i) => {
    const s = snakeStyles[i % snakeStyles.length];
    defs += `
    <linearGradient id="snakeBody${i}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${s.body}"/>
      <stop offset="50%" stop-color="${s.belly}"/>
      <stop offset="100%" stop-color="${s.body}"/>
    </linearGradient>
    <radialGradient id="snakeHead${i}">
      <stop offset="0%" stop-color="${s.body}"/>
      <stop offset="100%" stop-color="${s.head}"/>
    </radialGradient>`;
  });

  defs += '</defs>';
  svg.innerHTML = defs;

  // ====== DRAW LADDERS (realistic wooden) ======
  Object.entries(ladders).forEach(([from, to]) => {
    const a = point(+from);
    const b = point(to);
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy);
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

    const railW = 8;
    const railGap = 36;   // distance between inner edges of rails
    const rungSpacing = 28;
    const rungThick = 6;

    let html = `<g transform="translate(${a.x} ${a.y}) rotate(${angle})" filter="url(#ladderShadow)">`;

    // Shadow rails (offset for 3D depth)
    html += `<line x1="3" y1="${-railGap / 2 + 2}" x2="${len + 3}" y2="${-railGap / 2 + 2}" stroke="rgba(80,50,10,0.25)" stroke-width="${railW + 2}" stroke-linecap="round"/>`;
    html += `<line x1="3" y1="${railGap / 2 + 2}" x2="${len + 3}" y2="${railGap / 2 + 2}" stroke="rgba(80,50,10,0.25)" stroke-width="${railW + 2}" stroke-linecap="round"/>`;

    // Left rail (main)
    html += `<line x1="0" y1="${-railGap / 2}" x2="${len}" y2="${-railGap / 2}" stroke="url(#woodRail)" stroke-width="${railW}" stroke-linecap="round"/>`;
    // Left rail highlight
    html += `<line x1="0" y1="${-railGap / 2 - 2}" x2="${len}" y2="${-railGap / 2 - 2}" stroke="rgba(255,235,180,0.4)" stroke-width="2" stroke-linecap="round"/>`;

    // Right rail (main)
    html += `<line x1="0" y1="${railGap / 2}" x2="${len}" y2="${railGap / 2}" stroke="url(#woodRail)" stroke-width="${railW}" stroke-linecap="round"/>`;
    // Right rail highlight
    html += `<line x1="0" y1="${railGap / 2 - 2}" x2="${len}" y2="${railGap / 2 - 2}" stroke="rgba(255,235,180,0.4)" stroke-width="2" stroke-linecap="round"/>`;

    // Rungs
    for (let x = 16; x < len - 8; x += rungSpacing) {
      // Rung shadow
      html += `<line x1="${x + 2}" y1="${-railGap / 2 + 2}" x2="${x + 2}" y2="${railGap / 2 + 2}" stroke="rgba(80,50,10,0.2)" stroke-width="${rungThick + 1}" stroke-linecap="round"/>`;
      // Main rung
      html += `<line x1="${x}" y1="${-railGap / 2}" x2="${x}" y2="${railGap / 2}" stroke="url(#woodRung)" stroke-width="${rungThick}" stroke-linecap="round"/>`;
      // Rung highlight
      html += `<line x1="${x}" y1="${-railGap / 2}" x2="${x}" y2="${railGap / 2 - 4}" stroke="rgba(255,248,220,0.3)" stroke-width="2" stroke-linecap="round"/>`;
      // Rung bolts (tiny circles at connections)
      html += `<circle cx="${x}" cy="${-railGap / 2}" r="2.5" fill="#8B6914" stroke="#6b5310" stroke-width="0.5"/>`;
      html += `<circle cx="${x}" cy="${railGap / 2}" r="2.5" fill="#8B6914" stroke="#6b5310" stroke-width="0.5"/>`;
    }

    // Wood grain lines on rails (subtle)
    for (let x = 8; x < len - 5; x += 12) {
      html += `<line x1="${x}" y1="${-railGap / 2 - 1}" x2="${x + 6}" y2="${-railGap / 2 + 1}" stroke="rgba(120,80,20,0.15)" stroke-width="1"/>`;
      html += `<line x1="${x + 3}" y1="${railGap / 2 - 1}" x2="${x + 9}" y2="${railGap / 2 + 1}" stroke="rgba(120,80,20,0.15)" stroke-width="1"/>`;
    }

    html += '</g>';
    svg.innerHTML += html;
  });

  // ====== DRAW SNAKES (realistic with sinuous body) ======
  Object.entries(snakes).forEach(([from, to], idx) => {
    const a = point(+from);  // head position
    const b = point(to);     // tail position
    const s = snakeStyles[idx % snakeStyles.length];

    // Create sinuous path with multiple cubic bezier curves
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.hypot(dx, dy);
    const segments = Math.max(3, Math.round(dist / 120));

    // Build control points for a winding body
    const points = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const baseX = a.x + dx * t;
      const baseY = a.y + dy * t;
      // Perpendicular offset for sinuous shape
      const perpX = -dy / dist;
      const perpY = dx / dist;
      const waveAmp = (35 + Math.sin(idx * 2.1) * 15) * Math.sin(t * Math.PI); // taper at ends
      const wave = Math.sin(t * Math.PI * (2 + (idx % 2))) * waveAmp;
      points.push({
        x: baseX + perpX * wave,
        y: baseY + perpY * wave,
      });
    }

    // Build smooth cubic bezier path through all points
    let bodyPath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpX = (prev.x + curr.x) / 2;
      const cpY = (prev.y + curr.y) / 2;
      bodyPath += ` Q ${prev.x + (curr.x - prev.x) * 0.5 + (Math.sin(i * 1.7 + idx) * 18)} ${prev.y + (curr.y - prev.y) * 0.5 + (Math.cos(i * 1.3 + idx) * 18)} ${curr.x} ${curr.y}`;
    }

    // Calculate head angle from first 2 points
    const headAngle = Math.atan2(points[1].y - points[0].y, points[1].x - points[0].x);
    const headDeg = (headAngle * 180) / Math.PI;

    // Calculate tail angle from last 2 points
    const tailPt = points[points.length - 1];
    const preTailPt = points[points.length - 2];
    const tailAngle = Math.atan2(tailPt.y - preTailPt.y, tailPt.x - preTailPt.x);

    // Body thickness tapering: thick at head, thin at tail
    const bodyWidth = 22;
    const tailWidth = 6;

    let html = `<g filter="url(#snakeShadow)">`;

    // === BODY ===
    // Shadow body
    html += `<path d="${bodyPath}" fill="none" stroke="rgba(0,0,0,0.3)" stroke-width="${bodyWidth + 6}" stroke-linecap="round" stroke-linejoin="round"/>`;

    // Main body (outer color)
    html += `<path d="${bodyPath}" fill="none" stroke="${s.body}" stroke-width="${bodyWidth}" stroke-linecap="round" stroke-linejoin="round"/>`;

    // Belly stripe (lighter center)
    html += `<path d="${bodyPath}" fill="none" stroke="${s.belly}" stroke-width="${bodyWidth * 0.45}" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/>`;

    // Diamond/scale pattern along body
    const patternSize = 14;
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const segDx = p2.x - p1.x;
      const segDy = p2.y - p1.y;
      const segLen = Math.hypot(segDx, segDy);
      const numDiamonds = Math.floor(segLen / patternSize);

      for (let j = 0; j < numDiamonds; j++) {
        const t = (j + 0.5) / numDiamonds;
        const cx = p1.x + segDx * t;
        const cy = p1.y + segDy * t;
        const segAngle = Math.atan2(segDy, segDx);
        const dSize = 5 + (1 - i / points.length) * 3; // bigger near head

        // Diamond shape rotated to follow body
        const cos = Math.cos(segAngle);
        const sin = Math.sin(segAngle);
        const d = dSize;
        const diamond = `M ${cx + cos * d} ${cy + sin * d} L ${cx - sin * d * 0.6} ${cy + cos * d * 0.6} L ${cx - cos * d} ${cy - sin * d} L ${cx + sin * d * 0.6} ${cy - cos * d * 0.6} Z`;
        html += `<path d="${diamond}" fill="${s.pattern}" opacity="0.4"/>`;
      }
    }

    // Body highlight (shiny streak)
    html += `<path d="${bodyPath}" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="3" stroke-linecap="round" stroke-dasharray="8 16"/>`;

    // === TAIL (tapered end) ===
    const tail = points[points.length - 1];
    const tailEndX = tail.x + Math.cos(tailAngle) * 18;
    const tailEndY = tail.y + Math.sin(tailAngle) * 18;
    html += `<line x1="${tail.x}" y1="${tail.y}" x2="${tailEndX}" y2="${tailEndY}" stroke="${s.body}" stroke-width="${tailWidth}" stroke-linecap="round"/>`;
    // Tail tip curl
    const curlX = tailEndX + Math.cos(tailAngle + 1.2) * 10;
    const curlY = tailEndY + Math.sin(tailAngle + 1.2) * 10;
    html += `<path d="M ${tailEndX} ${tailEndY} Q ${tailEndX + Math.cos(tailAngle) * 6} ${tailEndY + Math.sin(tailAngle) * 6} ${curlX} ${curlY}" fill="none" stroke="${s.body}" stroke-width="3" stroke-linecap="round"/>`;

    // === HEAD (detailed, anatomical) ===
    const hx = a.x;
    const hy = a.y;
    const hCos = Math.cos(headAngle);
    const hSin = Math.sin(headAngle);

    // Head shape (elongated, slightly triangular)
    const headLen = 24;
    const headWid = 16;
    // Snout tip
    const snoutX = hx - hCos * headLen * 0.3;
    const snoutY = hy - hSin * headLen * 0.3;

    // Head ellipse (rotated to face direction of body)
    html += `<g transform="translate(${hx} ${hy}) rotate(${headDeg})">`;

    // Head shadow
    html += `<ellipse cx="3" cy="3" rx="${headLen}" ry="${headWid}" fill="rgba(0,0,0,0.2)"/>`;

    // Head base
    html += `<ellipse cx="0" cy="0" rx="${headLen}" ry="${headWid}" fill="url(#snakeHead${idx})"/>`;

    // Head top highlight
    html += `<ellipse cx="-2" cy="-3" rx="${headLen * 0.7}" ry="${headWid * 0.5}" fill="${s.body}" opacity="0.6"/>`;

    // Brow ridges
    html += `<ellipse cx="-4" cy="-6" rx="8" ry="3" fill="rgba(0,0,0,0.15)" transform="rotate(-10)"/>`;
    html += `<ellipse cx="-4" cy="6" rx="8" ry="3" fill="rgba(0,0,0,0.15)" transform="rotate(10)"/>`;

    // --- EYES (slit pupil, realistic) ---
    // Left eye
    html += `<ellipse cx="-6" cy="-8" rx="5.5" ry="5" fill="${s.eye}"/>`;
    html += `<ellipse cx="-6" cy="-8" rx="5" ry="4.5" fill="${s.eye}" stroke="${s.head}" stroke-width="0.8"/>`;
    // Slit pupil
    html += `<ellipse cx="-6" cy="-8" rx="1.5" ry="4" fill="#0f172a"/>`;
    // Eye glint
    html += `<circle cx="-7.5" cy="-9.5" r="1.5" fill="#fff" opacity="0.9"/>`;

    // Right eye
    html += `<ellipse cx="-6" cy="8" rx="5.5" ry="5" fill="${s.eye}"/>`;
    html += `<ellipse cx="-6" cy="8" rx="5" ry="4.5" fill="${s.eye}" stroke="${s.head}" stroke-width="0.8"/>`;
    // Slit pupil
    html += `<ellipse cx="-6" cy="8" rx="1.5" ry="4" fill="#0f172a"/>`;
    // Eye glint
    html += `<circle cx="-7.5" cy="6.5" r="1.5" fill="#fff" opacity="0.9"/>`;

    // --- NOSTRILS ---
    html += `<circle cx="-18" cy="-4" r="1.8" fill="${s.head}"/>`;
    html += `<circle cx="-18" cy="4" r="1.8" fill="${s.head}"/>`;
    html += `<circle cx="-18" cy="-4" r="1" fill="rgba(0,0,0,0.6)"/>`;
    html += `<circle cx="-18" cy="4" r="1" fill="rgba(0,0,0,0.6)"/>`;

    // --- MOUTH LINE ---
    html += `<path d="M -${headLen - 2} 0 Q -${headLen + 4} -3 -${headLen + 10} 2" fill="none" stroke="${s.head}" stroke-width="1.5" opacity="0.6"/>`;
    html += `<path d="M -${headLen - 2} 0 Q -${headLen + 4} 3 -${headLen + 10} -2" fill="none" stroke="${s.head}" stroke-width="1.5" opacity="0.6"/>`;

    // --- FORKED TONGUE ---
    const tongueBase = -headLen - 2;
    html += `<g class="snake-tongue" style="animation: tongueDart 1.${idx + 2}s ease-in-out infinite">`;
    html += `<line x1="${tongueBase}" y1="0" x2="${tongueBase - 16}" y2="0" stroke="${s.tongue}" stroke-width="2" stroke-linecap="round"/>`;
    // Fork
    html += `<line x1="${tongueBase - 14}" y1="0" x2="${tongueBase - 22}" y2="-5" stroke="${s.tongue}" stroke-width="1.5" stroke-linecap="round"/>`;
    html += `<line x1="${tongueBase - 14}" y1="0" x2="${tongueBase - 22}" y2="5" stroke="${s.tongue}" stroke-width="1.5" stroke-linecap="round"/>`;
    html += `</g>`;

    // Head scales (tiny texture)
    for (let r = 0; r < 3; r++) {
      for (let c = -1; c <= 1; c++) {
        const sx = 4 + r * 6;
        const sy = c * 5;
        html += `<path d="M ${sx - 2} ${sy} Q ${sx} ${sy - 2.5} ${sx + 2} ${sy} Q ${sx} ${sy + 2.5} ${sx - 2} ${sy}" fill="${s.pattern}" opacity="0.2"/>`;
      }
    }

    html += '</g>'; // close head transform

    html += '</g>'; // close snake group
    svg.innerHTML += html;
  });
}

// ===== RENDER PIECES =====
function renderPieces() {
  const layer = $('piecesLayer');
  layer.innerHTML = '';
  
  const occupied = {};
  
  game.players.forEach((player) => {
    const p = point(player.position);
    const same = occupied[player.position] || 0;
    occupied[player.position] = (same || 0) + 1;
    const offset = same ? ((same % 3) - 1) * 16 : 0;
    
    const piece = document.createElement('span');
    piece.className = 'piece';
    piece.style.left = `calc(${p.x / 10}% + ${offset}px)`;
    piece.style.top = `calc(${p.y / 10}% + ${offset}px)`;
    piece.style.background = player.color;
    piece.style.color = '#fff';
    piece.textContent = player.id;
    piece.title = player.name;
    piece.setAttribute('aria-label', player.name);
    layer.appendChild(piece);
  });
}

// ===== UPDATE UI =====
function updateUI() {
  const p = game.players[game.current];
  if (!p) return;
  
  $('turnAvatar').textContent = p.id;
  $('turnAvatar').style.background = p.color;
  $('turnName').textContent = p.name;
  $('turnStatus').textContent = p.isAI
    ? (game.busy ? 'AI IS THINKING...' : 'AI TURN')
    : 'Ready to roll?';
  $('turnHeadline').textContent = `${p.name}'s turn. Roll the dice and make your move.`;
  $('turnPosition').textContent = `${p.position} / 100`;
  $('rollButton').disabled = game.busy || p.isAI || !game.active;
  $('moveCount').textContent = `${game.moves} moves`;
  
  // Update player rows
  document.querySelectorAll('.player-row').forEach((row) => {
    const item = game.players.find((pl) => pl.id == row.dataset.id);
    if (!item) return;
    row.classList.toggle('active', item.id === p.id);
    row.querySelector('.position').textContent = `${item.position} / 100`;
    row.querySelector('.progress span').style.width = `${item.position}%`;
    
    const statsEl = row.querySelector('.player-stats-inline');
    if (statsEl) {
      statsEl.innerHTML = `
        <span>🪜 ${item.ladders}</span>
        <span>🐍 ${item.snakeBites}</span>
      `;
    }
  });
}

// ===== RENDER PLAYER LIST =====
function renderPlayerList() {
  $('playersList').innerHTML = game.players.map((p) => `
    <div class="player-row" data-id="${p.id}">
      <span class="avatar" style="background:${p.color}">${p.id}</span>
      <div class="player-info">
        <strong>${p.name} <small>${p.isAI ? 'AI' : 'HUMAN'}</small></strong>
        <span class="position">${p.position} / 100</span>
        <div class="player-stats-inline">
          <span>🪜 ${p.ladders}</span>
          <span>🐍 ${p.snakeBites}</span>
        </div>
        <div class="progress">
          <span style="width:${p.position}%;background:${p.color}"></span>
        </div>
      </div>
    </div>
  `).join('');
}

// ===== RENDER LOG =====
function renderLog(message) {
  const log = $('gameLog');
  const item = document.createElement('div');
  item.className = 'log-entry';
  item.innerHTML = message;
  log.prepend(item);
  
  while (log.children.length > 6) {
    log.lastChild.remove();
  }
}

// ===== ROLL DICE =====
async function rollDice() {
  if (!game.active || game.busy || game.players[game.current].isAI) return;
  
  game.busy = true;
  updateUI();
  
  const value = 1 + Math.floor(Math.random() * 6);
  
  // Start 3D dice rolling animation
  startDiceRoll();
  playSound('roll');
  
  // Wait for the spin
  await wait(650);
  
  // Stop and show result
  stopDiceRoll(value);
  
  // Track roll
  game.players[game.current].rolls.push(value);
  
  await wait(200);
  await movePlayer(value);
}

// ===== MOVE PLAYER =====
async function movePlayer(value) {
  const player = game.players[game.current];
  renderLog(`<strong>${player.name}</strong> rolled <strong>${value}</strong>`);
  
  const target = player.position + value;
  
  // Check if move exceeds 100
  if (target > 100) {
    toast(`${player.name} needs an exact roll to finish.`, 'warning');
    renderLog('Exact roll needed to reach 100.');
    await wait(450);
    nextTurn();
    return;
  }
  
  // Animate step by step
  for (let square = player.position + 1; square <= target; square++) {
    player.position = square;
    renderPieces();
    updateUI();
    playSound('move');
    await wait(game.motion ? 130 : 15);
  }
  
  game.moves++;
  
  // Check for ladder
  const ladder = ladders[player.position];
  if (ladder) {
    player.ladders++;
    renderLog(`<strong>${player.name}</strong> climbed a ladder to <strong>${ladder}</strong>! 🪜`);
    toast('LADDER! Climbing higher! 🪜');
    await wait(350);
    player.position = ladder;
    renderPieces();
    updateUI();
    playSound('ladder');
    await wait(500);
  }
  
  // Check for snake
  const snake = snakes[player.position];
  if (snake) {
    player.snakeBites++;
    renderLog(`<strong>${player.name}</strong> got bitten! Slid to <strong>${snake}</strong> 🐍`);
    toast('SNAKE! Watch your step! 🐍', 'warning');
    await wait(350);
    player.position = snake;
    renderPieces();
    updateUI();
    playSound('snake');
    await wait(500);
  }
  
  // Check win
  if (player.position === 100) {
    finish(player);
    return;
  }
  
  nextTurn();
}

// ===== TURN MANAGEMENT =====
function nextTurn() {
  game.current = (game.current + 1) % game.players.length;
  game.busy = false;
  showDice(0);
  renderPlayerList();
  updateUI();
  maybeAI();
}

function maybeAI() {
  const p = game.players[game.current];
  if (game.active && p.isAI) {
    game.busy = true;
    updateUI();
    
    setTimeout(async () => {
      const value = chooseAI(p);
      renderLog(`<strong>${p.name}</strong> is thinking...`);
      
      startDiceRoll();
      playSound('roll');
      await wait(600);
      
      stopDiceRoll(value);
      p.rolls.push(value);
      
      await wait(250);
      await movePlayer(value);
    }, 700);
  }
}

function chooseAI(p) {
  const valid = [1, 2, 3, 4, 5, 6].filter((n) => p.position + n <= 100);
  
  if (valid.length === 0) return 1 + Math.floor(Math.random() * 6);
  
  if (p.difficulty === 'Easy') {
    return valid[Math.floor(Math.random() * valid.length)];
  }
  
  return valid.reduce((best, n) => {
    const target = p.position + n;
    const score = target
      + (ladders[target] ? 60 : 0)
      - (snakes[target] ? 70 : 0)
      + (p.difficulty === 'Expert' ? target * 0.1 : 0);
    return score > best.score ? { n, score } : best;
  }, { n: valid[0], score: -Infinity }).n;
}

// ===== GAME FINISH =====
function finish(player) {
  game.active = false;
  game.busy = false;
  
  renderLog(`🏆 <strong>${player.name} wins the game!</strong>`);
  
  // Update winner modal
  $('winnerAvatar').textContent = player.id;
  $('winnerAvatar').style.background = player.color;
  $('winnerTitle').textContent = `${player.name} wins!`;
  
  // Update stats
  $('statMoves').textContent = game.moves;
  $('statLadders').textContent = player.ladders;
  $('statSnakes').textContent = player.snakeBites;
  
  // Show modal with confetti
  $('winnerModal').hidden = false;
  createConfetti();
  playSound('win');
}

// ===== PLAY AGAIN & RESET =====
function playAgain() {
  $('winnerModal').hidden = true;
  
  game.players.forEach((p) => {
    p.position = 1;
    p.ladders = 0;
    p.snakeBites = 0;
    p.rolls = [];
  });
  
  game.current = 0;
  game.moves = 0;
  game.active = true;
  
  createBoard();
  renderPlayerList();
  renderLog('New round started. Let\'s go!');
  updateUI();
  showDice(0);
  maybeAI();
}

function resetToSetup() {
  game.active = false;
  $('winnerModal').hidden = true;
  $('exitModal').hidden = true;
  $('gameScreen').hidden = true;
  $('setupScreen').hidden = false;
  buildPlayerConfig(game.players.map((p) => p.name));
}

// ===== THEME & SOUND =====
function toggleTheme() {
  game.theme = game.theme === 'dark' ? 'light' : 'dark';
  document.body.classList.toggle('dark', game.theme === 'dark');
  $('themeButton').setAttribute('aria-label',
    game.theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
  );
  localStorage.setItem('snakesTheme', game.theme);
}

function setSound(enabled) {
  game.sound = enabled;
  localStorage.setItem('snakesSound', enabled ? 'on' : 'off');
  updateSoundUI();
}

function toggleSound() {
  setSound(!game.sound);
}

function updateSoundUI() {
  const btn = $('soundButton');
  const waves = btn.querySelectorAll('.sound-wave');
  waves.forEach((w) => w.style.opacity = game.sound ? '1' : '0.2');
  btn.setAttribute('aria-label', game.sound ? 'Mute sound' : 'Turn on sound');
}

// ===== TOAST NOTIFICATIONS =====
function toast(message, type = 'success') {
  const item = document.createElement('div');
  item.className = `toast ${type}`;
  item.textContent = message;
  $('toastRegion').appendChild(item);
  setTimeout(() => item.remove(), 2800);
}

// ===== ENHANCED SOUND EFFECTS =====
function playSound(type) {
  if (!game.sound) return;
  
  try {
    const ctx = new AudioContext();
    
    if (type === 'win') {
      // Triumphant chord — play 3 notes
      [523, 659, 784].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.04, ctx.currentTime + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.12);
        osc.stop(ctx.currentTime + i * 0.12 + 0.5);
      });
      return;
    }
    
    if (type === 'ladder') {
      // Ascending arpeggio
      [440, 554, 659].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.035, ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.25);
      });
      return;
    }
    
    if (type === 'snake') {
      // Descending slide
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.4);
      osc.type = 'sawtooth';
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
      return;
    }
    
    // Default sounds (move, roll)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const freqs = { move: 380, roll: 300 };
    osc.frequency.value = freqs[type] || 420;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) {
    // Silently fail if AudioContext is not available
  }
}

// ===== BOOT =====
document.addEventListener('DOMContentLoaded', init);
