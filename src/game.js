/* ─────────────────────────────────────────────────────────────
   RODE RUNNER — Game Engine
   Exposed on window.__gameState for Playwright testing
   ───────────────────────────────────────────────────────────── */

// ─── CANVAS SETUP ────────────────────────────────────────────────────────────
const C   = document.getElementById('gameCanvas');
const ctx = C.getContext('2d');
const W   = C.width;
const H   = C.height;
const GROUND = H - 70;

// ─── STATE ───────────────────────────────────────────────────────────────────
let state     = 'idle'; // idle | playing | dead
let score     = 0;
let coins     = 0;
let highScore = 0;
let speed     = 5;
let frame     = 0;
let spawnTimer = 0, coinTimer = 0, puTimer = 0;
let animId;
let x2Active  = 0;

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const POWERUP_DURATION = 8; // seconds

// ─── PLAYER ──────────────────────────────────────────────────────────────────
const PLAYER = {
  x: 120, y: GROUND, w: 38, h: 60,
  vy: 0, jumps: 0, maxJumps: 2,
  ducking: false,
  duckH: 34, standH: 60,
  invincible: 0,
  shield: 0,
  magnet: 0,
  speedBoost: 0,
  lives: 3,
  runFrame: 0, runTimer: 0,

  get hitbox() {
    const h = this.ducking ? this.duckH : this.standH;
    return { x: this.x + 6, y: this.y + (this.standH - h), w: this.w - 12, h: h - 4 };
  },

  jump() {
    if (this.ducking) return;
    if (this.jumps < this.maxJumps) {
      this.vy = -16;
      this.jumps++;
    }
  },

  duck(on) {
    if (on && this.y >= GROUND) {
      this.ducking = true;
    } else if (!on) {
      this.ducking = false;
    }
  },

  update() {
    this.vy += 0.75;
    this.y  += this.vy;
    if (this.y >= GROUND) {
      this.y     = GROUND;
      this.vy    = 0;
      this.jumps = 0;
    }
    if (this.ducking && this.y < GROUND) this.ducking = false;

    if (this.invincible > 0) this.invincible--;
    if (this.shield    > 0) this.shield--;
    if (this.magnet    > 0) this.magnet--;
    if (this.speedBoost > 0) this.speedBoost--;

    if (this.y >= GROUND) {
      this.runTimer++;
      if (this.runTimer > 6) {
        this.runFrame = (this.runFrame + 1) % 4;
        this.runTimer = 0;
      }
    }
  },

  draw() {
    const h    = this.ducking ? this.duckH : this.standH;
    const yTop = this.y + (this.standH - h);
    const blink = this.invincible > 0 && Math.floor(this.invincible / 4) % 2 === 0;
    if (blink) return;

    ctx.save();

    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(this.x + this.w / 2, GROUND + this.standH - 4, 22, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // shield aura
    if (this.shield > 0) {
      ctx.strokeStyle = `rgba(80,200,255,${0.4 + 0.4 * Math.sin(frame * 0.15)})`;
      ctx.lineWidth   = 3;
      ctx.beginPath();
      ctx.ellipse(this.x + this.w / 2, yTop + h / 2, 30, 36, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // magnet aura
    if (this.magnet > 0) {
      ctx.strokeStyle = `rgba(255,215,0,${0.5 + 0.3 * Math.sin(frame * 0.2)})`;
      ctx.lineWidth   = 2;
      ctx.beginPath();
      ctx.ellipse(this.x + this.w / 2, yTop + h / 2, 60, 66, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // animated legs
    const legPhase   = this.runFrame;
    const legColors  = ['#e07040', '#c05030'];
    const legOffsets = [[0, 8], [8, 0], [0, -8], [-8, 0]];
    if (!this.ducking) {
      ctx.fillStyle = legColors[0];
      ctx.fillRect(this.x + 8  + legOffsets[legPhase][0],             this.y + this.standH - 24, 9, 22);
      ctx.fillStyle = legColors[1];
      ctx.fillRect(this.x + 20 + legOffsets[(legPhase + 2) % 4][1], this.y + this.standH - 24, 9, 22);
    }

    // body
    const bodyGrad = ctx.createLinearGradient(this.x, yTop, this.x + this.w, yTop);
    bodyGrad.addColorStop(0, '#ff8c42');
    bodyGrad.addColorStop(1, '#e05020');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.roundRect(
      this.x + (this.ducking ? 0   : 4),
      yTop,
      this.ducking ? this.w + 10 : this.w - 8,
      this.ducking ? h - 6       : h - 24,
      8
    );
    ctx.fill();

    // shirt stripe
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(this.x + (this.ducking ? 4 : 6), yTop + 6, this.ducking ? this.w : this.w - 14, 5);

    if (!this.ducking) {
      // head
      ctx.fillStyle = '#ffd0a0';
      ctx.beginPath();
      ctx.ellipse(this.x + this.w / 2 - 2, yTop - 10, 14, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      // hair
      ctx.fillStyle = '#4a2800';
      ctx.beginPath();
      ctx.ellipse(this.x + this.w / 2 - 2, yTop - 20, 14, 7, 0, 0, Math.PI);
      ctx.fill();
      // eye
      ctx.fillStyle = '#222';
      ctx.beginPath();
      ctx.arc(this.x + this.w / 2 + 5, yTop - 12, 3, 0, Math.PI * 2);
      ctx.fill();
      // eye shine
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(this.x + this.w / 2 + 6.5, yTop - 13, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
};

// ─── WORLD OBJECTS ───────────────────────────────────────────────────────────
let obstacles = [], coinItems = [], powerups = [], particles = [];

// ─── BACKGROUND LAYERS ───────────────────────────────────────────────────────
const bgLayers = [
  { stars:     generateStars(80, W, H * 0.6), speed: 0   },
  { clouds:    generateClouds(6),              speed: 0.4 },
  { mountains: generateMountains(),            speed: 0.8 },
];
let bgOffsets = [0, 0, 0];

function generateStars(n, w, h) {
  return Array.from({ length: n }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: Math.random() * 1.5 + 0.5,
    bright: Math.random()
  }));
}

function generateClouds(n) {
  return Array.from({ length: n }, () => ({
    x: Math.random() * W * 1.5,
    y: 40 + Math.random() * 80,
    w: 80  + Math.random() * 120,
    h: 30  + Math.random() * 30,
    alpha: 0.15 + Math.random() * 0.2
  }));
}

function generateMountains() {
  const pts = [];
  let x = 0;
  while (x < W * 2) {
    pts.push({ x, y: 120 + Math.random() * 120 });
    x += 60 + Math.random() * 80;
  }
  return pts;
}

// ─── DRAW BACKGROUND ──────────────────────────────────────────────────────────
function drawBackground() {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0,   '#0a0020');
  sky.addColorStop(0.6, '#1a0840');
  sky.addColorStop(1,   '#2a1060');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // stars
  bgLayers[0].stars.forEach(s => {
    const twinkle = 0.5 + 0.5 * Math.sin(frame * 0.03 + s.bright * 10);
    ctx.fillStyle  = `rgba(255,255,255,${twinkle * 0.9})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // moon
  ctx.save();
  ctx.fillStyle   = '#ffe8b0';
  ctx.shadowColor = '#ffe8b0';
  ctx.shadowBlur  = 30;
  ctx.beginPath();
  ctx.arc(800, 55, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1a0840';
  ctx.beginPath();
  ctx.arc(812, 50, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // clouds
  ctx.save();
  ctx.translate(-bgOffsets[1] % (W * 1.5), 0);
  bgLayers[1].clouds.forEach(c => {
    const cx = ((c.x - bgOffsets[1] * 0.3) % (W + c.w * 2) + W + c.w * 2) % (W + c.w * 2) - c.w;
    ctx.fillStyle = `rgba(180,160,255,${c.alpha})`;
    ctx.beginPath();
    ctx.ellipse(cx, c.y, c.w, c.h, 0, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  // mountains
  const mpts = bgLayers[2].mountains;
  const moff  = bgOffsets[2] % (W * 2);
  ctx.save();
  ctx.fillStyle = 'rgba(60,20,100,0.6)';
  ctx.beginPath();
  ctx.moveTo(0, H);
  mpts.forEach(p => {
    const px = (p.x - moff % (W * 2) + W * 2) % (W * 2) - (W * 2 - W);
    ctx.lineTo(px, p.y);
  });
  ctx.lineTo(W, H);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // ground
  const groundGrad = ctx.createLinearGradient(0, GROUND + PLAYER.standH - 6, 0, H);
  groundGrad.addColorStop(0,   '#1e0a40');
  groundGrad.addColorStop(0.3, '#2a1260');
  groundGrad.addColorStop(1,   '#0a0020');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, GROUND + PLAYER.standH - 6, W, H - (GROUND + PLAYER.standH - 6));

  // ground glow line
  ctx.strokeStyle = 'rgba(160,100,255,0.7)';
  ctx.lineWidth   = 2;
  ctx.shadowColor = 'rgba(160,100,255,0.9)';
  ctx.shadowBlur  = 10;
  ctx.beginPath();
  ctx.moveTo(0, GROUND + PLAYER.standH - 6);
  ctx.lineTo(W, GROUND + PLAYER.standH - 6);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // speed grid lines
  ctx.strokeStyle = 'rgba(120,60,200,0.2)';
  ctx.lineWidth   = 1;
  const lineSpacing = 60;
  const lineOff     = bgOffsets[2] % lineSpacing;
  for (let x = -lineOff; x < W; x += lineSpacing) {
    ctx.beginPath();
    ctx.moveTo(x, GROUND + PLAYER.standH - 6);
    ctx.lineTo(x - 30, H);
    ctx.stroke();
  }
}

// ─── OBSTACLE TYPES ───────────────────────────────────────────────────────────
const OBS_TYPES = [
  { w: 28, h: 55, duck: false, color: '#ff3a3a', accent: '#ff8080', label: '🚧' },
  { w: 55, h: 35, duck: true,  color: '#ff6600', accent: '#ffaa44', label: '─'  },
  { w: 22, h: 80, duck: false, color: '#cc0044', accent: '#ff88aa', label: '🗿' },
  { w: 20, h: 55, duck: false, color: '#dd2200', accent: '#ff7755', label: '||', double: true },
];

function spawnObstacle() {
  const t   = OBS_TYPES[Math.floor(Math.random() * OBS_TYPES.length)];
  const gap = t.double ? 40 : 0;
  const obs = {
    x: W + 40,
    y: GROUND + PLAYER.standH - t.h,
    w: t.w, h: t.h,
    color: t.color, accent: t.accent, label: t.label,
    duck: t.duck
  };
  obstacles.push(obs);
  if (t.double) {
    obstacles.push({ ...obs, x: W + 40 + t.w + gap });
  }
}

// ─── COIN SPAWNING ────────────────────────────────────────────────────────────
function spawnCoin() {
  const baseY   = GROUND + PLAYER.standH - 28;
  const pattern = Math.floor(Math.random() * 3);
  if (pattern === 0) {
    for (let i = 0; i < 6; i++) {
      coinItems.push({
        x: W + 60 + i * 40,
        y: baseY - Math.sin(i / 5 * Math.PI) * 90,
        r: 10, collected: false, anim: 0
      });
    }
  } else if (pattern === 1) {
    for (let i = 0; i < 5; i++) {
      coinItems.push({ x: W + 60 + i * 40, y: baseY, r: 10, collected: false, anim: 0 });
    }
  } else {
    for (let i = 0; i < 6; i++) {
      coinItems.push({
        x: W + 60 + i * 38,
        y: baseY - (i % 2 === 0 ? 0 : 55),
        r: 10, collected: false, anim: 0
      });
    }
  }
}

// ─── POWER-UP TYPES ───────────────────────────────────────────────────────────
const PU_TYPES = [
  { id: 'shield',     label: '🛡️ Shield',  color: '#44aaff', glow: '#88ccff' },
  { id: 'magnet',     label: '🧲 Magnet',  color: '#ffd700', glow: '#ffee88' },
  { id: 'x2',         label: '✖️2 Score',  color: '#ff44ff', glow: '#ff88ff' },
  { id: 'speedBoost', label: '⚡ Boost',   color: '#44ff88', glow: '#88ffaa' },
];

function spawnPowerup() {
  const t = PU_TYPES[Math.floor(Math.random() * PU_TYPES.length)];
  powerups.push({
    x: W + 40,
    y: GROUND + PLAYER.standH - 55 - Math.random() * 80,
    r: 16, type: t, collected: false, anim: 0
  });
}

// ─── PARTICLES ───────────────────────────────────────────────────────────────
function burst(x, y, color, n = 10) {
  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * 2 / n) * i + Math.random() * 0.5;
    const spd   = 2 + Math.random() * 4;
    particles.push({
      x, y,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd - 2,
      life: 1, decay: 0.04 + Math.random() * 0.03,
      r: 3 + Math.random() * 4,
      color
    });
  }
}

function updateParticles() {
  particles = particles.filter(p => p.life > 0);
  particles.forEach(p => {
    p.x  += p.vx;
    p.y  += p.vy;
    p.vy += 0.15;
    p.life -= p.decay;
    p.r    *= 0.97;
  });
}

function drawParticles() {
  particles.forEach(p => {
    ctx.save();
    ctx.globalAlpha  = p.life;
    ctx.fillStyle    = p.color;
    ctx.shadowColor  = p.color;
    ctx.shadowBlur   = 8;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x &&
         a.y < b.y + b.h && a.y + a.h > b.y;
}

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// ─── DRAW OBSTACLES ───────────────────────────────────────────────────────────
function drawObstacles() {
  obstacles.forEach(o => {
    ctx.save();
    ctx.shadowColor = o.color;
    ctx.shadowBlur  = 14;
    const g = ctx.createLinearGradient(o.x, o.y, o.x + o.w, o.y + o.h);
    g.addColorStop(0, o.accent);
    g.addColorStop(1, o.color);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.roundRect(o.x, o.y, o.w, o.h, 5);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    for (let sy = o.y + 8; sy < o.y + o.h - 8; sy += 14) {
      ctx.fillRect(o.x + 3, sy, o.w - 6, 6);
    }
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.roundRect(o.x - 3, o.y - 5, o.w + 6, 10, 3);
    ctx.fill();
    ctx.restore();
  });
}

// ─── DRAW COINS ───────────────────────────────────────────────────────────────
function drawCoins() {
  coinItems.forEach(c => {
    if (c.collected) return;
    const bob = Math.sin(frame * 0.08 + c.x * 0.05) * 4;
    ctx.save();
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur  = 12;
    ctx.strokeStyle = '#ffee44';
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.arc(c.x, c.y + bob, c.r + 2, 0, Math.PI * 2);
    ctx.stroke();
    const cg = ctx.createRadialGradient(c.x - 3, c.y + bob - 3, 1, c.x, c.y + bob, c.r);
    cg.addColorStop(0,   '#fff7a0');
    cg.addColorStop(0.5, '#ffd700');
    cg.addColorStop(1,   '#b8860b');
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.arc(c.x, c.y + bob, c.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle    = '#b8860b';
    ctx.font         = 'bold 11px Arial';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('₹', c.x, c.y + bob);
    ctx.restore();
  });
}

// ─── DRAW POWERUPS ───────────────────────────────────────────────────────────
function drawPowerups() {
  powerups.forEach(p => {
    if (p.collected) return;
    const bob   = Math.sin(frame * 0.07 + p.x * 0.03) * 5;
    const pulse = 1 + 0.08 * Math.sin(frame * 0.1);
    ctx.save();
    ctx.shadowColor = p.type.glow;
    ctx.shadowBlur  = 20;
    ctx.translate(p.x, p.y + bob);
    ctx.scale(pulse, pulse);
    ctx.strokeStyle = p.type.color;
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.arc(0, 0, p.r + 4, 0, Math.PI * 2);
    ctx.stroke();
    const pg = ctx.createRadialGradient(-4, -4, 1, 0, 0, p.r);
    pg.addColorStop(0,   '#fff');
    pg.addColorStop(0.4, p.type.glow);
    pg.addColorStop(1,   p.type.color);
    ctx.fillStyle = pg;
    ctx.beginPath();
    ctx.arc(0, 0, p.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.font         = '16px Arial';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    const icon = { shield: '🛡', magnet: '🧲', x2: '×2', speedBoost: '⚡' }[p.type.id] || '?';
    ctx.fillText(icon, 0, 1);
    ctx.restore();
  });
}

// ─── HUD UPDATE ───────────────────────────────────────────────────────────────
function updateHUD() {
  document.getElementById('scoreDisplay').textContent = score;
  document.getElementById('coinDisplay').textContent  = '🪙 ' + coins;
  document.getElementById('bestDisplay').textContent  = highScore;

  const pd = document.getElementById('powerupDisplay');
  pd.innerHTML = '';
  const addBadge = (icon, label, timeLeft) => {
    const b = document.createElement('div');
    b.className = 'pu-badge';
    b.setAttribute('data-testid', `badge-${label.toLowerCase()}`);
    b.innerHTML = `${icon} ${label} <span style="color:#aaa;margin-left:4px">${timeLeft}s</span>`;
    pd.appendChild(b);
  };
  if (PLAYER.shield    > 0) addBadge('🛡️', 'Shield',     Math.ceil(PLAYER.shield    / 60));
  if (PLAYER.magnet    > 0) addBadge('🧲', 'Magnet',     Math.ceil(PLAYER.magnet    / 60));
  if (x2Active         > 0) addBadge('×2', 'Score',      Math.ceil(x2Active         / 60));
  if (PLAYER.speedBoost > 0) addBadge('⚡', 'Boost',     Math.ceil(PLAYER.speedBoost / 60));
}

// ─── DRAW LIVES ───────────────────────────────────────────────────────────────
function drawLives() {
  ctx.font         = '20px Arial';
  ctx.textBaseline = 'top';
  for (let i = 0; i < 3; i++) {
    ctx.globalAlpha = i < PLAYER.lives ? 1 : 0.25;
    ctx.fillText('❤️', W - 110 + i * 30, H - 40);
  }
  ctx.globalAlpha = 1;
}

// ─── APPLY POWER-UP ──────────────────────────────────────────────────────────
function applyPowerup(id) {
  const dur = POWERUP_DURATION * 60;
  if      (id === 'shield')     PLAYER.shield     = dur;
  else if (id === 'magnet')     PLAYER.magnet     = dur;
  else if (id === 'x2')         x2Active          = dur;
  else if (id === 'speedBoost') PLAYER.speedBoost = dur;
}

// ─── MAIN GAME LOOP ───────────────────────────────────────────────────────────
function gameLoop() {
  frame++;
  const effectiveSpeed = speed * (PLAYER.speedBoost > 0 ? 1.6 : 1);

  bgOffsets[1] += effectiveSpeed * 0.3;
  bgOffsets[2] += effectiveSpeed * 0.8;

  if (frame % 600 === 0) speed = Math.min(speed + 0.4, 14);
  if (x2Active > 0) x2Active--;

  if (frame % 6 === 0) {
    score += x2Active > 0 ? 2 : 1;
    if (score > highScore) highScore = score;
  }

  // spawn
  const minGap = Math.max(80, 160 - score / 50);
  spawnTimer++;
  if (spawnTimer > minGap + Math.random() * 60) { spawnObstacle(); spawnTimer = 0; }
  coinTimer++;
  if (coinTimer > 90  + Math.random() * 60)  { spawnCoin();    coinTimer = 0; }
  puTimer++;
  if (puTimer   > 400 + Math.random() * 200) { spawnPowerup(); puTimer   = 0; }

  // move
  obstacles.forEach(o => o.x -= effectiveSpeed);
  coinItems.forEach(c => { if (!c.collected) c.x -= effectiveSpeed; });
  powerups.forEach(p  => { if (!p.collected) p.x -= effectiveSpeed; });

  // cleanup
  obstacles = obstacles.filter(o => o.x + o.w > -20);
  coinItems = coinItems.filter(c => (c.x + c.r > -20) && (!c.collected || c.anim < 1));
  powerups  = powerups.filter(p  => (p.x + p.r > -20) && (!p.collected || p.anim < 1));

  PLAYER.update();

  // ── obstacle collisions ──
  const ph = PLAYER.hitbox;
  if (PLAYER.invincible === 0) {
    for (const o of obstacles) {
      if (rectsOverlap(ph, o)) {
        if (PLAYER.shield > 0) {
          PLAYER.shield     = 0;
          PLAYER.invincible = 90;
          burst(PLAYER.x + PLAYER.w / 2, PLAYER.y, '#44aaff', 20);
          obstacles.splice(obstacles.indexOf(o), 1);
        } else {
          PLAYER.lives--;
          PLAYER.invincible = 100;
          burst(PLAYER.x + PLAYER.w / 2, PLAYER.y, '#ff4444', 18);
          obstacles.splice(obstacles.indexOf(o), 1);
          if (PLAYER.lives <= 0) { endGame(); return; }
        }
        break;
      }
    }
  }

  // ── coin collisions ──
  coinItems.forEach(c => {
    if (c.collected) return;
    const magnetRadius = PLAYER.magnet > 0 ? 120 : 22;
    const centerX = PLAYER.x + PLAYER.w / 2;
    const centerY = PLAYER.y + PLAYER.standH / 2;
    if (dist({ x: c.x, y: c.y }, { x: centerX, y: centerY }) < magnetRadius + c.r) {
      if (PLAYER.magnet > 0) {
        const dx = centerX - c.x, dy = centerY - c.y;
        const d  = Math.hypot(dx, dy);
        if (d < 25) {
          c.collected = true; coins++; score += x2Active > 0 ? 10 : 5;
          burst(c.x, c.y, '#ffd700', 7);
        } else {
          c.x += dx / d * 6; c.y += dy / d * 6;
        }
      } else {
        c.collected = true; coins++; score += x2Active > 0 ? 10 : 5;
        burst(c.x, c.y, '#ffd700', 7);
      }
    }
  });

  // ── power-up collisions ──
  powerups.forEach(p => {
    if (p.collected) return;
    const centerX = PLAYER.x + PLAYER.w / 2;
    const centerY = PLAYER.y + PLAYER.standH / 2;
    if (dist({ x: p.x, y: p.y }, { x: centerX, y: centerY }) < p.r + 20) {
      p.collected = true;
      burst(p.x, p.y, p.type.glow, 15);
      applyPowerup(p.type.id);
    }
  });

  // ── render ──
  ctx.clearRect(0, 0, W, H);
  drawBackground();
  drawObstacles();
  drawCoins();
  drawPowerups();
  PLAYER.draw();
  drawParticles();
  updateParticles();
  drawLives();
  updateHUD();

  animId = requestAnimationFrame(gameLoop);
}

// ─── GAME CONTROL ─────────────────────────────────────────────────────────────
function startGame() {
  Object.assign(PLAYER, {
    x: 120, y: GROUND, vy: 0, jumps: 0,
    ducking: false, invincible: 0,
    shield: 0, magnet: 0, speedBoost: 0, lives: 3,
    runFrame: 0, runTimer: 0
  });
  obstacles = []; coinItems = []; powerups = []; particles = [];
  score = 0; coins = 0; speed = 5; frame = 0;
  spawnTimer = 0; coinTimer = 0; puTimer = 0; x2Active = 0;
  bgOffsets = [0, 0, 0];

  document.getElementById('overlay').style.display = 'none';
  state = 'playing';
  if (animId) cancelAnimationFrame(animId);
  gameLoop();
}

function endGame() {
  state = 'dead';
  cancelAnimationFrame(animId);
  if (score > highScore) highScore = score;

  const ov = document.getElementById('overlay');
  ov.setAttribute('data-game-state', 'dead');
  ov.innerHTML = `
    <h1 style="font-size:42px;text-shadow:0 0 30px #ff0040" data-testid="gameover-title">GAME OVER</h1>
    <div class="subtitle">You ran far, but the road ended...</div>
    <div class="final-score" data-testid="final-score">Score: ${score} &nbsp;|&nbsp; 🪙 ${coins}</div>
    <div class="highscore" data-testid="highscore-display">${score >= highScore ? '🏆 New High Score!' : 'Best: ' + highScore}</div>
    <button data-testid="replay-button" onclick="startGame()">🔄 PLAY AGAIN</button>
    <div class="controls-hint" style="margin-top:12px">SPACE/↑ Jump &nbsp;|&nbsp; ↓/S Duck &nbsp;|&nbsp; Double-tap to Double Jump</div>
  `;
  ov.style.display = 'flex';
}

// ─── INPUT ────────────────────────────────────────────────────────────────────
let keys = {};

document.addEventListener('keydown', e => {
  if (state !== 'playing') return;
  if ((e.code === 'Space' || e.code === 'ArrowUp' || e.key === 'w' || e.key === 'W') && !keys[e.code]) {
    PLAYER.jump();
  }
  if (e.code === 'ArrowDown' || e.key === 's' || e.key === 'S') {
    PLAYER.duck(true);
  }
  keys[e.code] = true;
});

document.addEventListener('keyup', e => {
  keys[e.code] = false;
  if (e.code === 'ArrowDown' || e.key === 's' || e.key === 'S') {
    PLAYER.duck(false);
  }
});

C.addEventListener('touchstart', e => {
  e.preventDefault();
  if (state !== 'playing') return;
  const touch  = e.touches[0];
  const rect   = C.getBoundingClientRect();
  const touchX = touch.clientX - rect.left;
  if (touchX > W / 2) PLAYER.jump();
  else PLAYER.duck(true);
});

C.addEventListener('touchend', () => PLAYER.duck(false));

// ─── IDLE ANIMATION (title screen) ───────────────────────────────────────────
function idleLoop() {
  frame++;
  bgOffsets[1] += 0.4;
  bgOffsets[2] += 0.8;
  ctx.clearRect(0, 0, W, H);
  drawBackground();
  animId = requestAnimationFrame(idleLoop);
}
idleLoop();

// ─── TEST SURFACE (window.__gameState) ───────────────────────────────────────
// Exposes internal state for Playwright automation tests.
// Do NOT use in production logic.
window.__gameState = {
  getState:     () => state,
  getScore:     () => score,
  getCoins:     () => coins,
  getHighScore: () => highScore,
  getLives:     () => PLAYER.lives,
  getSpeed:     () => speed,
  getFrame:     () => frame,
  isPlaying:    () => state === 'playing',
  isDead:       () => state === 'dead',
  isIdle:       () => state === 'idle',
  getPlayerY:   () => PLAYER.y,
  isDucking:    () => PLAYER.ducking,
  hasShield:    () => PLAYER.shield > 0,
  hasMagnet:    () => PLAYER.magnet > 0,
  hasX2:        () => x2Active > 0,
  hasSpeedBoost:() => PLAYER.speedBoost > 0,
  getObstacleCount: () => obstacles.length,
  getCoinCount:     () => coinItems.filter(c => !c.collected).length,
  // Programmatic control for tests
  triggerStartGame: () => startGame(),
  triggerEndGame:   () => endGame(),
  setLives:         (n) => { PLAYER.lives = n; },
  forceGameOver:    () => { PLAYER.lives = 0; endGame(); },
};
