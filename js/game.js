(() => {
  'use strict';

  const TILE = 16, W = 320, H = 240;
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const $ = (id) => document.getElementById(id);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const fill = (s) => String(s ?? '')
    .replace(/\{name\}/g, GIFT.name).replace(/\{dog\}/g, GIFT.dogName)
    .replace(/\{friend\}/g, GIFT.friendName).replace(/\{from\}/g, GIFT.from);
  const wait = (sec) => new Promise((r) => setTimeout(r, sec * 1000));
  const rand = (a, b) => a + Math.random() * (b - a);

  const THEMES = {
    music: { bg: '#0d0a14', floorA: '#2b2140', floorB: '#30264a', wallTop: '#5d275d', wallFace: '#3a1a3d', trim: '#ffcd75', detail: '#4a1f4a', carpet: '#6b2440', minion: 'note' },
    rock:  { bg: '#15110c', floorA: '#6b5138', floorB: '#735940', wallTop: '#8a9bb0', wallFace: '#566c86', trim: '#c2d0dc', detail: '#6f8196', carpet: '#8a6a48', minion: 'pebble' },
    chess: { bg: '#120c08', floorA: '#b8a888', floorB: '#6a6070', wallTop: '#7a4a2a', wallFace: '#4f2e1a', trim: '#c89b5e', detail: '#6b3f22', carpet: '#7a2a2a', minion: 'pawn' },
    bedroom: { bg: '#120e0c', floorA: '#8a5a3a', floorB: '#744a2e', wallTop: '#b9a98c', wallFace: '#e6dcc4', trim: '#6e4428', detail: '#a8977a', carpet: '#d9c29a', minion: 'note', planks: true, shag: true },
    dorm: { bg: '#120e0c', floorA: '#b8ae9a', floorB: '#aea48f', wallTop: '#b9a98c', wallFace: '#e6dcc4', trim: '#6e4428', detail: '#a8977a', carpet: '#7a2a3a', minion: 'note' },
    campus: { bg: '#1c2a1c', floorA: '#5c9a48', floorB: '#599645', wallTop: '#2f6a32', wallFace: '#24552a', trim: '#3f7a3a', detail: '#24552a', carpet: '#5c9a48', minion: 'note', outdoor: true },
    climb: { bg: '#101418', floorA: '#9a9488', floorB: '#948e82', wallTop: '#c8ccd6', wallFace: '#2b3550', trim: '#1a1c2c', detail: '#a8aebb', carpet: '#2b3550', minion: 'pebble', holds: true },
    court: { bg: '#0c1020', floorA: '#c98f52', floorB: '#bf8649', wallTop: '#2f4f9e', wallFace: '#223a78', trim: '#f4f4f4', detail: '#284690', carpet: '#e07a3a', minion: 'vball' },
    roblegym: { bg: '#1a140c', floorA: '#e6c48e', floorB: '#d9b57e', wallTop: '#e9d7a8', wallFace: '#dcc690', trim: '#b08a50', detail: '#d6c090', carpet: '#3b5dc9', minion: 'note', planks: true, sun: true },
    party: { bg: '#0d0e17', floorA: '#b9794a', floorB: '#a5673c', wallTop: '#f0d8e0', wallFace: '#e4b8c8', trim: '#b13e53', detail: '#e8c8d4', carpet: '#b13e53', minion: 'note', ground: 'party', edge: 'party', pillar: 'balloons' },
    garden: { bg: '#1c2a1c', floorA: '#5c9a48', floorB: '#599645', wallTop: '#2f6a32', wallFace: '#24552a', trim: '#3f7a3a', detail: '#24552a', carpet: '#cfc9bd', minion: 'note', ground: 'garden', edge: 'hedge', pillar: 'tree' },
    beach: { bg: '#0c1a2a', floorA: '#ecd9a6', floorB: '#e4cf98', wallTop: '#d8c08a', wallFace: '#c4a870', trim: '#f4f4f4', detail: '#c4a870', carpet: '#ef7d57', minion: 'vball', ground: 'sand', edge: 'beach', pillar: 'palm' },
    chessgarden: { bg: '#1c2a1c', floorA: '#6aa650', floorB: '#64a04a', wallTop: '#2f6a32', wallFace: '#24552a', trim: '#3f7a3a', detail: '#24552a', carpet: '#7a4a2a', minion: 'pawn', ground: 'plaza', edge: 'hedge', pillar: 'statue' },
    crag: { bg: '#15110c', floorA: '#8a6a48', floorB: '#7f6040', wallTop: '#7a808a', wallFace: '#4a4f58', trim: '#9aa0aa', detail: '#5a606a', carpet: '#8a6a48', minion: 'pebble', ground: 'dirt', edge: 'cliff', pillar: 'boulder' },
  };
  const CONFETTI = ['#ffcd75', '#ef7d57', '#b13e53', '#a7f070', '#41a6f6', '#73eff7', '#f4a3c4', '#f4f4f4'];
  const DIRV = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const isDoorCh = (c) => c >= '1' && c <= '9';
  // Solid map tiles: walls, windows, dorm doors, building, hedges, tree trunks.
  const isWallCh = (c) => c === '#' || c === 'N' || c === 'w' || c === 'q' || c === 'o' || c === 'R' || c === 'h' || c === 'T';
  // Furniture map letters -> [kind, width, height] in tiles.
  const FURNITURE = { k: ['bike', 1, 1], u: ['piano', 3, 1], b: ['bed', 2, 3], n: ['nightstand', 1, 1], d: ['desk', 2, 1], x: ['dresser', 2, 1], p: ['plant', 1, 1], a: ['airbed', 3, 2], g: ['grand', 3, 3], M: ['mats', 3, 1], U: ['umbrella', 1, 1], t: ['chesstable', 1, 1], L: ['lamp', 1, 1], j: ['gifts', 2, 1] };

  // Chests that must be opened before a world's boss gate opens (boss rewards don't count).
  const WORLD_CHESTS = {};
  for (const r of Object.values(ROOMS)) if (!r.boss) for (const id of r.chests || []) (WORLD_CHESTS[r.world] ||= []).push(id);

  // ------------------------------------------------------------------ save
  const SAVE_KEY = 'birthday-quest-v2';
  const freshSave = () => ({ room: 'bedroom', pos: null, level: 1, opened: {}, beaten: {}, cleared: {}, hasDog: false, started: false, seen: {} });
  let save = (() => {
    try { return Object.assign(freshSave(), JSON.parse(localStorage.getItem(SAVE_KEY) || '{}')); } catch (e) { return freshSave(); }
  })();
  if (!ROOMS[save.room]) { save.room = 'bedroom'; save.pos = null; }
  const persist = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) { /* no storage */ } };
  const maxHP = () => 3 + Math.floor((save.level - 1) / 2);
  const bulletDmg = () => 1 + 0.3 * (save.level - 1);
  const worldChestsLeft = (w) => (WORLD_CHESTS[w] || []).filter((id) => !save.opened[id]).length;

  // ------------------------------------------------------------------ input
  const keys = new Set();
  const MOVE = { ArrowUp: 1, ArrowDown: 1, ArrowLeft: 1, ArrowRight: 1, KeyW: 1, KeyA: 1, KeyS: 1, KeyD: 1, KeyJ: 1 };
  const mouse = { sx: W / 2, sy: H / 2, down: false, seen: false };
  let actionQueued = false, rollQueued = false;

  const JUMP_KEYS = ['Space'];
  function primary() {
    SFX.unlock();
    if (dlg.active) return advanceDialog();
    if (modalResolve) return closeModal();
    if (scene === 'title') return startGame(false);
    if (scene === 'ending') return closeCelebrate();
    if (scene === 'memories') { const v = $('memories-video'); if (v.paused) v.play().catch(() => {}); return; }   // not skippable
    if (scene === 'climb' || scene === 'volley' || scene === 'piano') return;
    if (inCombat()) rollQueued = true;
    else actionQueued = true;
  }
  addEventListener('keydown', (e) => {
    if (scene === 'climb' && climb && JUMP_KEYS.includes(e.code) && !e.repeat && !uiOpen()) climb.p.buf = 0.12;
    if (scene === 'volley' && volley && JUMP_KEYS.includes(e.code) && !e.repeat && !uiOpen()) volley.jumpBuf = 0.12;
    if (scene === 'piano' && recital) {
      const lane = PIANO_LANES.findIndex((ks) => ks.includes(e.code));
      if (lane >= 0) { e.preventDefault(); if (!e.repeat) pianoHit(lane); return; }
    }
    if (MOVE[e.code]) { e.preventDefault(); keys.add(e.code); return; }
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') { if (inCombat()) rollQueued = true; return; }
    if (['Space', 'Enter', 'KeyE', 'KeyZ'].includes(e.code)) {
      if (e.target.tagName === 'BUTTON' && scene === 'title') return;
      e.preventDefault();
      if (!e.repeat) primary();
    }
  });
  addEventListener('keyup', (e) => {
    keys.delete(e.code);
    if (climb && JUMP_KEYS.includes(e.code) && climb.p.vy < -120) climb.p.vy *= 0.55; // short hop
  });
  addEventListener('blur', () => { keys.clear(); mouse.down = false; });
  addEventListener('mousemove', (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.sx = ((e.clientX - r.left) / r.width) * W;
    mouse.sy = ((e.clientY - r.top) / r.height) * H;
    mouse.seen = true;
  });
  addEventListener('mousedown', (e) => {
    if (e.target.tagName === 'BUTTON') return;
    if (e.button === 2) { if (inCombat()) rollQueued = true; return; }
    if (e.button !== 0) return;
    if (dlg.active) return advanceDialog();
    if (modalResolve) return closeModal();
    if (scene === 'ending') return closeCelebrate();
    if (scene === 'memories') return;
    mouse.down = true;
  });
  addEventListener('mouseup', (e) => { if (e.button === 0) mouse.down = false; });
  addEventListener('contextmenu', (e) => e.preventDefault());
  const pressed = (...codes) => codes.some((c) => keys.has(c));

  // ------------------------------------------------------------------ layout
  function resize() {
    const s = Math.min(innerWidth / W, innerHeight / H);
    const wrap = $('wrap');
    wrap.style.width = W * s + 'px';
    wrap.style.height = H * s + 'px';
    wrap.style.setProperty('--u', s + 'px');
  }
  addEventListener('resize', resize);
  resize();

  // ------------------------------------------------------------------ Undertale-style dialog
  const dlg = { active: false, lines: [], i: 0, shown: 0, resolve: null, voice: 1, startedAt: 0 };
  // "Abe: hello" shows Abe's portrait and voice. opts.speaker sets a default speaker for unprefixed lines.
  const speakers = () => ({
    [GIFT.name.toLowerCase()]: { portrait: 'jadon', voice: 1 },
    [GIFT.friendName.toLowerCase()]: { portrait: 'abe', voice: 0.8 },
    [GIFT.dogName.toLowerCase()]: { voice: 1.7 },
  });
  function parseLine(raw, opts) {
    let text = fill(raw), who = opts.speaker ? fill(opts.speaker).toLowerCase() : null;
    const m = text.match(/^([A-Za-z]+):\s*([\s\S]*)$/);
    if (m && speakers()[m[1].toLowerCase()]) { who = m[1].toLowerCase(); if (speakers()[who].portrait) text = m[2]; }
    const sp = speakers()[who] || {};
    const big = text.startsWith('!');
    if (big) text = text.slice(1);
    return {
      big,
      text: text.startsWith('*') || big ? text : '* ' + text,
      icon: opts.icon || (sp.portrait ? SPR.portraitURL(sp.portrait) : null),
      voice: opts.voice || sp.voice || 1,
    };
  }
  function say(lines, opts = {}) {
    lines = (Array.isArray(lines) ? lines : [lines]).filter(Boolean).map((l) => parseLine(l, opts));
    if (!lines.length) return Promise.resolve();
    return new Promise((resolve) => {
      Object.assign(dlg, { active: true, lines, i: 0, shown: 0, resolve, startedAt: performance.now() });
      $('dialog').classList.toggle('top', player.y - camY > 150);
      $('dialog').classList.remove('hidden');
      renderDialog();
    });
  }
  function renderDialog() {
    const line = dlg.lines[dlg.i], icon = $('dialog-icon');
    if (line.icon) { if (icon.getAttribute('src') !== line.icon) icon.src = line.icon; icon.classList.remove('hidden'); }
    else icon.classList.add('hidden');
    $('dialog').classList.toggle('big', !!line.big);
    $('dialog-text').textContent = line.text.slice(0, Math.floor(dlg.shown)).replace(/\|/g, '');
  }
  function updateDialog(dt) {
    if (!dlg.active) return;
    const full = dlg.lines[dlg.i].text;
    if (dlg.shown >= full.length) return;
    if (dlg.pause > 0) { dlg.pause -= dt; return; }
    const before = Math.floor(dlg.shown);
    dlg.shown = Math.min(full.length, dlg.shown + dt * (dlg.lines[dlg.i].big ? 14 : 45));
    const now = Math.floor(dlg.shown);
    if (full.slice(before, now).includes('|')) dlg.pause = 0.8;
    if (now !== before) {
      if (now % 2 === 0 && full[now - 1] !== ' ') SFX.blip(dlg.lines[dlg.i].voice);
      renderDialog();
    }
  }
  function advanceDialog() {
    if (performance.now() - dlg.startedAt < 120) return;
    if (dlg.shown < dlg.lines[dlg.i].text.length) { dlg.shown = dlg.lines[dlg.i].text.length; renderDialog(); return; }
    dlg.i++;
    dlg.startedAt = performance.now();
    if (dlg.i < dlg.lines.length) { dlg.shown = 0; renderDialog(); return; }
    dlg.active = false;
    $('dialog').classList.add('hidden');
    const r = dlg.resolve;
    dlg.resolve = null;
    r();
  }

  // ------------------------------------------------------------------ note / photo card
  let modalResolve = null, modalAt = 0;
  function showModal({ title = '', text = '', img = null, chart = null, kind = '' } = {}) {
    return new Promise((resolve) => {
      $('modal-title').textContent = fill(title);
      $('modal-text').textContent = fill(text);
      const media = $('modal-media');
      media.innerHTML = '';
      if (img) {
        const el = new Image();
        el.onerror = () => {
          media.innerHTML = '';
          const d = document.createElement('div');
          d.className = 'photo-missing';
          d.textContent = 'Photo goes here: ' + img;
          media.appendChild(d);
        };
        el.src = img;
        media.appendChild(el);
      }
      if (chart) media.appendChild(drawPoll(chart));
      $('modal').className = 'modal ' + kind;
      modalAt = performance.now();
      modalResolve = resolve;
    });
  }
  function closeModal() {
    if (!modalResolve || performance.now() - modalAt < 300) return;
    $('modal').className = 'modal hidden';
    const r = modalResolve;
    modalResolve = null;
    r();
  }
  const uiOpen = () => dlg.active || !!modalResolve;

  let toastTimer;
  function toast(msg, ms = 2200) {
    const t = $('toast');
    t.textContent = fill(msg);
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), ms);
  }

  function updateHUD() {
    const hearts = $('hud-hearts');
    hearts.innerHTML = '';
    for (let i = 0; i < maxHP(); i++) {
      const im = new Image();
      im.src = i < player.hp ? SPR.heartURL : SPR.heartEmptyURL;
      hearts.appendChild(im);
    }
    $('hud-level').textContent = 'LV ' + save.level;
    const w = room?.world;
    $('hud-area').textContent = room?.name || WORLDS[w]?.name || '';
    const all = WORLD_CHESTS[w] || [];
    $('hud-chests').textContent = all.length ? `CHESTS ${all.length - worldChestsLeft(w)}/${all.length}` : '';
    const showBoss = boss && boss.active && !boss.dead;
    $('bossbar').classList.toggle('hidden', !showBoss);
    if (showBoss) $('bossname').textContent = boss.def.name;
    updateBossBar();
  }
  function updateBossBar() {
    if (boss) $('bosshpfill').style.width = (100 * Math.max(0, boss.hp) / boss.max) + '%';
  }

  // ------------------------------------------------------------------ world state
  let scene = 'title', roomId = null, room = null, theme = THEMES.party, lastWorld = null;
  let map = [], mapW = 0, mapH = 0, doors = {};
  let facade = null, trees = [];
  let chests = [], npcs = [], stars = [], signs = [], pillars = [], furniture = [], enemies = [], boss = null, bossSpot = null;
  let pBullets = [], eBullets = [], hazards = [], pickups = [], particles = [], floaters = [], timers = [], confetti = [];
  let entryPos = [0, 0], busy = false, shake = 0, time = 0, camX = 0, camY = 0, gateMsgCd = 0, hadEnemies = false, hitSfxCd = 0, rockRainT = 1;
  const player = { x: 0, y: 0, dir: 'down', hp: 3, inv: 0, roll: null, rollCd: 0, fireCd: 0, walkT: 0, moving: false, aim: 0 };
  const dog = { x: 0, y: 0, flip: false, moving: false, idle: 0 };
  let trail = [];

  // ------------------------------------------------------------------ collision
  const inCombat = () => enemies.length > 0 || (!!boss && !boss.dead);
  function doorLocked(ch) {
    const d = doors[ch];
    if (!d || !d.to) return true;
    if (inCombat()) return true;
    return !!d.gate && worldChestsLeft(room.world) > 0;
  }
  const covers = (e, tx, ty) => tx >= e.tx && tx < e.tx + (e.w || 1) && ty >= e.ty && ty < e.ty + (e.h || 1);
  const entityAt = (list, tx, ty) => list.find((e) => covers(e, tx, ty));
  function tileSolid(tx, ty) {
    if (tx < 0 || ty < 0 || tx >= mapW || ty >= mapH) return true;
    const c = map[ty][tx];
    if (isWallCh(c) || c === 'O') return true;
    if (isDoorCh(c)) return doorLocked(c);
    return !!(entityAt(chests, tx, ty) || entityAt(npcs, tx, ty) || entityAt(stars, tx, ty) || entityAt(signs, tx, ty) || entityAt(furniture, tx, ty));
  }
  function bulletBlocked(x, y) {
    const tx = Math.floor(x / TILE), ty = Math.floor(y / TILE);
    if (tx < 0 || ty < 0 || tx >= mapW || ty >= mapH) return true;
    const c = map[ty][tx];
    return isWallCh(c) || c === 'O' || (isDoorCh(c) && doorLocked(c));
  }
  function boxHits(x, y, hw = 5, hh = 4) {
    const x0 = Math.floor((x - hw) / TILE), x1 = Math.floor((x + hw - 0.01) / TILE);
    const y0 = Math.floor((y - hh) / TILE), y1 = Math.floor((y + hh - 0.01) / TILE);
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (tileSolid(tx, ty)) return true;
    return false;
  }
  // Moves a body, sliding around corners so 1-tile gaps are easy to enter.
  function moveBody(b, dx, dy, hw = 5, hh = 4) {
    if (dx) {
      if (!boxHits(b.x + dx, b.y, hw, hh)) b.x += dx;
      else if (!dy) {
        for (let n = 1; n <= 7; n++) {
          if (!boxHits(b.x + dx, b.y - n, hw, hh)) { if (!boxHits(b.x, b.y - 1, hw, hh)) b.y -= 1; break; }
          if (!boxHits(b.x + dx, b.y + n, hw, hh)) { if (!boxHits(b.x, b.y + 1, hw, hh)) b.y += 1; break; }
        }
      }
    }
    if (dy) {
      if (!boxHits(b.x, b.y + dy, hw, hh)) b.y += dy;
      else if (!dx) {
        for (let n = 1; n <= 7; n++) {
          if (!boxHits(b.x - n, b.y + dy, hw, hh)) { if (!boxHits(b.x - 1, b.y, hw, hh)) b.x -= 1; break; }
          if (!boxHits(b.x + n, b.y + dy, hw, hh)) { if (!boxHits(b.x + 1, b.y, hw, hh)) b.x += 1; break; }
        }
      }
    }
  }

  // ------------------------------------------------------------------ boss helper API (see bosses.js)
  const api = {
    arena: { x0: 16, y0: 32, x1: 304, y1: 224 },
    sfx: SFX,
    player: () => [player.x, player.y - 6],
    aim: (x, y) => Math.atan2(player.y - 6 - y, player.x - x),
    shake: (n) => { shake = Math.max(shake, n); },
    after: (sec, fn) => timers.push({ t: sec, fn }),
    shoot: (x, y, ang, spd, style = 'orb', o = {}) => {
      eBullets.push({ x, y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, style, r: o.r || (style === 'pawn' ? 5 : 3), life: o.life || 12 });
    },
    ring: (x, y, n, spd, style, off = 0) => { for (let i = 0; i < n; i++) api.shoot(x, y, ((i + off) / n) * Math.PI * 2, spd, style); },
    hazardCircle: (x, y, r, o = {}) => hazards.push({ shape: 'circle', x, y, r, warn: o.warn ?? 1, active: o.active ?? 0.3, style: o.style || 'impact', t: 0, fired: false }),
    hazardRect: (x, y, w, h, o = {}) => hazards.push({ shape: 'rect', x, y, w, h, warn: o.warn ?? 1, active: o.active ?? 0.3, style: o.style || 'impact', t: 0, fired: false }),
  };

  // ------------------------------------------------------------------ rooms
  const mazeCache = {};
  function buildMazeMap(r) {
    const [cw, ch] = r.size || [6, 4];
    const m = generateMaze(cw, ch, r.seed || 1, r.loops ?? 0.04, r.rooms ?? 1);
    // Cells become 2x2 tiles, walls stay 1 tile thick.
    const f = (i) => (i >> 1) * 3 + (i & 1), sz = (i) => (i & 1 ? 2 : 1);
    const TW = 3 * cw + 1, TH = 3 * ch + 1;
    const t = Array.from({ length: TH }, () => Array(TW).fill('#'));
    for (let gy = 0; gy < m.H; gy++) {
      for (let gx = 0; gx < m.W; gx++) {
        if (m.grid[gy][gx] !== '.') continue;
        for (let dy = 0; dy < sz(gy); dy++) for (let dx = 0; dx < sz(gx); dx++) t[f(gy) + dy][f(gx) + dx] = '.';
      }
    }
    t[1][0] = t[2][0] = '1';
    const lastGX = 2 * (cw - 1) + 1;
    let best = null;
    for (let cy = 0; cy < ch; cy++) {
      const gy = 2 * cy + 1, d = m.dist[gy][lastGX];
      if (!best || d > best.d) best = { gy, d };
    }
    t[f(best.gy)][TW - 1] = t[f(best.gy) + 1][TW - 1] = '2';

    const ids = r.chests || [];
    const ends = m.deadEnds.filter(([x, y]) => !(x === lastGX && y === best.gy));
    const picks = [];
    if (ids.length >= ends.length) picks.push(...ends);
    else for (let i = 0; i < ids.length; i++) picks.push(ends[Math.floor(((i + 0.5) * ends.length) / ids.length)]);
    const spare = m.cells.filter(([x, y]) => m.dist[y][x] > 4 && !picks.some((p) => p[0] === x && p[1] === y));
    while (picks.length < ids.length && spare.length) picks.push(spare.splice(Math.floor(m.rnd() * spare.length), 1)[0]);
    return { rows: t.map((row) => row.join('')), chests: picks.map(([gx, gy], i) => [f(gx), f(gy), ids[i]]) };
  }

  function makeEnemy(tx, ty) {
    return { x: tx * TILE + 8, y: ty * TILE + 12, hp: 6, kind: theme.minion, t: rand(0.6, 1.4), vx: 0, vy: 0, moveT: 0, shootT: rand(1.2, 2.5), hurt: 0, phase: rand(0, 6) };
  }

  function loadRoom(id) {
    roomId = id;
    room = ROOMS[id];
    theme = THEMES[room.theme] || THEMES.music;
    chests = []; npcs = []; stars = []; signs = []; pillars = []; furniture = []; trees = []; facade = null; enemies = []; boss = null; bossSpot = null;
    pBullets = []; eBullets = []; hazards = []; pickups = []; particles = []; floaters = []; timers = [];

    let rows = room.map, extra = [];
    if (room.type === 'maze') {
      const m = (mazeCache[id] ||= buildMazeMap(room));
      rows = m.rows; extra = m.chests;
    }
    mapH = rows.length;
    mapW = Math.max(...rows.map((r) => r.length));
    map = rows.map((r) => r.padEnd(mapW, '#').split(''));

    let ci = 0, startP = null;
    for (let y = 0; y < mapH; y++) {
      for (let x = 0; x < mapW; x++) {
        const c = map[y][x];
        const at = { tx: x, ty: y };
        if (c === 'C') { const cid = (room.chests || [])[ci++]; if (cid) chests.push({ ...at, id: cid }); }
        else if (c === '*') stars.push(at);
        else if (c === 'S') signs.push(at);
        else if (c === 'D') { if (!save.hasDog) npcs.push({ ...at, kind: 'dog' }); }
        else if (c === 'F') npcs.push({ ...at, kind: 'friend' });
        else if (c === 'Y') npcs.push({ ...at, kind: 'person', variant: npcs.filter((n) => n.kind === 'person').length % SPR.people.length });
        else if (c === 'K') npcs.push({ ...at, kind: 'cake', w: 2, h: 2 });
        else if (c === 'e') { if (!save.cleared[id]) enemies.push(makeEnemy(x, y)); }
        else if (c === 'B') bossSpot = [x, y];
        else if (c === 'P') startP = [x, y];
        else if (c === 'O') { pillars.push(at); continue; }
        else if (c === 'T') { trees.push(at); continue; }
        else if (FURNITURE[c]) {
          // one piece per block of repeated letters, anchored at its top-left tile
          if (rows[y][x - 1] !== c && rows[y - 1]?.[x] !== c) {
            const [kind, w, h] = FURNITURE[c];
            furniture.push({ ...at, kind, w, h });
          }
          map[y][x] = '.';
          continue;
        }
        else continue;
        // markers sitting on a rug keep the rug underneath
        map[y][x] = rows[y][x - 1] === '~' || rows[y][x + 1] === '~' ? '~' : '.';
      }
    }
    for (const [x, y, cid] of extra) chests.push({ tx: x, ty: y, id: cid });

    doors = {};
    for (let y = 0; y < mapH; y++) {
      for (let x = 0; x < mapW; x++) {
        const c = map[y][x];
        if (!isDoorCh(c)) continue;
        if (!doors[c]) {
          const [to, toDoor, gate] = (room.doors || {})[c] || [];
          doors[c] = { tiles: [], to, toDoor: String(toDoor), gate: gate === 'gate' };
        }
        doors[c].tiles.push([x, y]);
      }
    }

    facade = room.theme === 'roblegym' ? buildGymWall() : buildFacade();

    if (room.boss && bossSpot) {
      if (!save.beaten[id]) {
        const def = BOSSES[room.boss];
        boss = { def, x: bossSpot[0] * TILE + 8, y: (bossSpot[1] + 1) * TILE, hp: def.hp, max: def.hp, hurt: 0, cool: 1.5, atk: 0, t: 0, active: false, dead: false, phase2: false, lift: 0, hard: !!room.hardFirst && !save.revived?.[id] };
        def.init?.(boss, api);
      } else spawnRewards();
    }
    hadEnemies = enemies.length > 0;
    return startP;
  }

  function spawnRewards() {
    const ids = room.rewards || [];
    ids.forEach((cid, i) => chests.push({ tx: bossSpot[0] + (i - (ids.length - 1) / 2) * 2 | 0, ty: bossSpot[1] + 2, id: cid }));
  }

  function placeAtDoor(digit) {
    const d = doors[digit];
    if (!d) return false;
    let sx = 0, sy = 0, ix = 0, iy = 0, n = 0;
    for (const [x, y] of d.tiles) {
      for (const [dx, dy] of Object.values(DIRV)) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= mapW || ny >= mapH) continue;
        const c = map[ny][nx];
        if (isDoorCh(c) || isWallCh(c) || c === 'O') continue;
        sx += nx; sy += ny; ix += dx; iy += dy; n++;
      }
    }
    if (!n) return false;
    player.x = (sx / n) * TILE + 8;
    player.y = (sy / n) * TILE + 8;
    player.dir = Math.abs(ix) > Math.abs(iy) ? (ix > 0 ? 'right' : 'left') : (iy > 0 ? 'down' : 'up');
    return true;
  }

  async function gotoRoom(id, digit) {
    busy = true;
    $('fade').classList.add('on');
    stopMusic(0.25);
    await wait(0.25);
    const startP = loadRoom(id);
    if (!(digit && placeAtDoor(digit))) {
      if (save.pos && save.room === id) [player.x, player.y] = save.pos;
      else if (startP) { player.x = startP[0] * TILE + 8; player.y = startP[1] * TILE + 8; }
      else { player.x = (mapW * TILE) / 2; player.y = (mapH * TILE) / 2; }
    }
    player.roll = null;
    entryPos = [player.x, player.y];
    dog.x = player.x; dog.y = player.y; trail = [];
    save.room = id;
    save.pos = [player.x, player.y];
    persist();
    updateCamera();
    updateHUD();
    $('fade').classList.remove('on');
    await wait(0.2);
    busy = false;

    if (SCENES[id] && !save.seen[id]) {
      busy = true;
      await runScene(SCENES[id]);
      save.seen[id] = true;
      persist();
      busy = false;
    }
    if (boss && !boss.active) {
      busy = true;
      if (room.music) playMusic(room.music);
      await say(BOSS_TEXT[room.boss]?.intro || []);
      busy = false;
      boss.active = true;
      updateHUD();
    } else if (enemies.length) toast('Clear the room!');
    else if ((room.name || WORLDS[room.world]?.name) !== lastWorld) toast(room.name || WORLDS[room.world]?.name || '');
    lastWorld = room.name || WORLDS[room.world]?.name;
  }

  // Looping background music for some boss fights (room.music).
  const music = new Audio();
  music.loop = true;
  let musicFade = null;
  function playMusic(src) {
    clearInterval(musicFade);
    if (!music.src.endsWith(src)) music.src = src;
    music.volume = 0.5;
    music.currentTime = 0;
    music.play().catch(() => {});
  }
  function stopMusic(sec = 1) {
    if (music.paused) return;
    clearInterval(musicFade);
    const v0 = music.volume, t0 = performance.now();
    musicFade = setInterval(() => {
      const k = Math.min(1, (performance.now() - t0) / (sec * 1000));
      music.volume = v0 * (1 - k);
      if (k >= 1) { clearInterval(musicFade); music.pause(); }
    }, 50);
  }

  // Scenes mix dialog lines with actions like { climb: 'v4' } or { wait: 1 }.
  async function runScene(steps) {
    let lines = [];
    const flush = async () => { if (lines.length) { await say(lines); lines = []; } };
    for (const st of steps) {
      if (typeof st === 'string') { lines.push(st); continue; }
      await flush();
      if (st.climb) await runClimb(st.climb);
      if (st.volley) await runVolley(st.volley);
      if (st.piano) await runPiano(st.piano);
      if (st.video) await playVideo(st.video, st.caption);
      if (st.wait) await wait(st.wait);
    }
    await flush();
  }

  // ------------------------------------------------------------------ scenery for the outdoor-ish themes
  const FLOWER_COLORS = ['#f4f4f4', '#ffcd75', '#f4a3c4', '#ef7d57', '#e05a8a', '#73eff7'];
  function drawFlower(px, py, hh) {
    const x = px + 2 + (hh % 11), y = py + 2 + ((hh >>> 6) % 11), col = FLOWER_COLORS[(hh >>> 3) % FLOWER_COLORS.length];
    ctx.fillStyle = '#2f6a32'; ctx.fillRect(x + 1, y + 2, 1, 3);
    ctx.fillStyle = col; ctx.fillRect(x, y + 1, 3, 1); ctx.fillRect(x + 1, y, 1, 3);
    ctx.fillStyle = '#ffcd75'; ctx.fillRect(x + 1, y + 1, 1, 1);
  }
  function drawGround(px, py, x, y, c) {
    const g = theme.ground, hh = hash(x, y);
    const R = (col, ox, oy, w, h) => { ctx.fillStyle = col; ctx.fillRect(px + ox, py + oy, w, h); };
    if (c === '=') return drawPavement(px, py, x, y);
    if (g === 'garden' || g === 'plaza') {
      if (c === '~' && g === 'plaza') {
        // chessboard square with a wooden frame on the outer edge
        R((x + y) & 1 ? '#6e4428' : '#f0e0c0', 0, 0, TILE, TILE);
        R((x + y) & 1 ? '#5a3219' : '#e0cca8', 0, 14, TILE, 2);
        R('#3a2414', 0, 0, map[y - 1]?.[x] !== '~' ? TILE : 0, 2); R('#3a2414', 0, 14, map[y + 1]?.[x] !== '~' ? TILE : 0, 2);
        R('#3a2414', 0, 0, map[y][x - 1] !== '~' ? 2 : 0, TILE); R('#3a2414', 14, 0, map[y][x + 1] !== '~' ? 2 : 0, TILE);
        return;
      }
      if (c === '~') return drawPavement(px, py, x, y);
      drawGrass(px, py, x, y);
      if (hh % (g === 'garden' ? 6 : 11) === 0) drawFlower(px, py, hh);
      if (hh % 17 === 3) { R('#7ab85e', 3 + (hh % 9), 5, 1, 3); R('#7ab85e', 5 + (hh % 9), 4, 1, 4); }
      return;
    }
    if (g === 'sand') {
      R(theme.floorA, 0, 0, TILE, TILE);
      for (let i = 0; i < 5; i++) { const h2 = hash(x * 7 + i, y * 5 + i * 11); R(h2 % 2 ? '#dcc38c' : '#f6e8c2', h2 % 15, (h2 >>> 5) % 15, 1, 1); }
      if (c === '~') {
        // striped beach towel, colors per towel
        const tid = hash(x >> 2, y >> 3) % 3, cols = [['#ef7d57', '#f4f4f4'], ['#41a6f6', '#ffcd75'], ['#a7f070', '#f4a3c4']][tid];
        const top = map[y - 1]?.[x] !== '~', bot = map[y + 1]?.[x] !== '~';
        R(cols[0], 1, top ? 2 : 0, 14, TILE - (top ? 2 : 0) - (bot ? 2 : 0));
        for (let i = 0; i < 16; i += 6) R(cols[1], 1, i + 1, 14, 2);
        if (top) for (let i = 1; i < 15; i += 2) R(cols[1], i, 0, 1, 2);
        if (bot) for (let i = 1; i < 15; i += 2) R(cols[1], i, 14, 1, 2);
        return;
      }
      if (hh % 23 === 0) { R('#f4c8c8', 5 + (hh % 7), 7, 3, 2); R('#fff4f4', 5 + (hh % 7), 7, 1, 1); }
      if (hh % 29 === 5) { R('#b89868', 3, 9, 2, 1); R('#b89868', 8, 5, 2, 1); }                 // footprints
      return;
    }
    if (g === 'dirt') {
      R(theme.floorA, 0, 0, TILE, TILE);
      if (hash(x >> 1, y >> 1) % 3 === 0) R(theme.floorB, 0, 0, TILE, TILE);                     // soft darker patches
      for (let i = 0; i < 4; i++) { const h2 = hash(x * 3 + i, y * 13 + i); R(h2 % 3 ? '#7a5c3e' : '#9a7a56', h2 % 14, (h2 >>> 4) % 14, 2, 1); }
      const nearWall = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => map[y + dy]?.[x + dx] === '#');
      if (nearWall && hh % 2) { R('#5c8a3c', 0, 0, TILE, 3); for (let i = 0; i < 16; i += 3) R('#7ab85e', i + (hh % 2), 2, 1, 3); }
      if (hh % 19 === 0) { R('#1a1c2c', 4 + (hh % 8), 8, 5, 4); R('#8a8f99', 5 + (hh % 8), 8, 3, 3); R('#b5bac4', 5 + (hh % 8), 8, 1, 1); }
      if (hh % 13 === 2) { R('#5c8a3c', 2 + (hh % 10), 6, 1, 3); R('#7ab85e', 3 + (hh % 10), 5, 1, 4); R('#5c8a3c', 4 + (hh % 10), 7, 1, 2); }
      return;
    }
    if (g === 'party') {
      R(theme.floorB, 0, 0, TILE, TILE);
      for (let i = 0; i < 3; i++) {
        R(theme.floorA, 0, i * 5 + 1, TILE, 4);
        if (hash(x, y * 3 + i) % 3 === 0) R(theme.floorB, (hash(x, y * 3 + i) % 14) + 1, i * 5 + 1, 1, 4);
      }
      if (c === '~') {
        R(theme.carpet, 0, 0, TILE, TILE);
        R('#ffcd75', 0, 1, map[y - 1]?.[x] !== '~' ? TILE : 0, 1); R('#ffcd75', 0, 14, map[y + 1]?.[x] !== '~' ? TILE : 0, 1);
        R('#ffcd75', 1, 0, map[y][x - 1] !== '~' ? 1 : 0, TILE); R('#ffcd75', 14, 0, map[y][x + 1] !== '~' ? 1 : 0, TILE);
        if ((x + y) % 2 === 0) R('#c84e63', 6, 6, 4, 4);
        return;
      }
      if (hh % 4 === 0) R(CONFETTI[hh % CONFETTI.length], 2 + (hh % 12), 3 + ((hh >>> 4) % 10), 2, 1);
    }
  }
  function drawEdge(px, py, x, y) {
    const below = map[y + 1]?.[x], open = below !== undefined && !isWallCh(below) && !isDoorCh(below);
    const R = (col, ox, oy, w, h) => { ctx.fillStyle = col; ctx.fillRect(px + ox, py + oy, w, h); };
    const hh = hash(x, y);
    if (theme.edge === 'hedge') {
      drawHedge(px, py, x, y, !open);
      if (open && hh % 3 === 0) { const col = FLOWER_COLORS[hh % FLOWER_COLORS.length]; R(col, 3 + (hh % 9), 6, 2, 2); R(col, 7 + (hh % 5), 10, 2, 2); }
      return;
    }
    if (theme.edge === 'beach') {
      if (y <= 1) {
        // ocean with rolling wave lines and foam where it meets the sand
        R(y === 0 ? '#2a6fb0' : '#3b8ec9', 0, 0, TILE, TILE);
        for (let i = 0; i < 2; i++) {
          const wx = ((x * 16 + i * 9 + Math.floor(time * 10) + y * 5) % 24) - 4;
          R('#6fb8e6', wx, 3 + i * 7, 7, 1);
        }
        if (open) {
          const f = Math.round(Math.sin(time * 2 + x * 0.7) * 1.5);
          R('#bfe3f5', 0, 11 + f, TILE, 2); R('#f4f4f4', 0, 13 + f, TILE, 3 - f);
          R('#f4f4f4', (x * 5) % 12, 12 + f, 3, 1);
        }
        return;
      }
      // sand dunes with beach grass on the other sides
      R('#d8c08a', 0, 0, TILE, TILE);
      for (let i = 0; i < 3; i++) { const h2 = hash(x * 5 + i, y * 3 + i); R(h2 % 2 ? '#8aa05a' : '#6f8a4a', h2 % 14, 2 + ((h2 >>> 4) % 10), 1, 3); }
      if (open) { R('#c4a870', 0, 11, TILE, 5); R('#b09460', 0, 15, TILE, 1); }
      return;
    }
    if (theme.edge === 'cliff') {
      R(theme.wallTop, 0, 0, TILE, TILE);
      R(theme.detail, 0, 7, TILE, 1); R(theme.detail, (hh % 8) + 3, 0, 1, 7); R(theme.detail, (hh % 6) + 7, 8, 1, 8);
      R(theme.trim, 1, 1, 5, 1); R(theme.trim, 9, 9, 4, 1);
      if (hh % 4 === 0) { R('#5c8a3c', hh % 12, 0, 4, 2); R('#7ab85e', (hh % 12) + 1, 0, 2, 1); }
      if (open) { R(theme.wallFace, 0, 9, TILE, 7); R('#3a3f48', 0, 15, TILE, 1); R('#5a606a', (hh % 10) + 2, 10, 3, 1); }
      return;
    }
    if (theme.edge === 'party') {
      R(theme.wallTop, 0, 0, TILE, TILE);
      R(theme.detail, (x % 2) * 8, 0, 4, TILE);                                                   // wallpaper stripes
      R(theme.detail, (x % 2) * 8 + 8, 0, 4, TILE);
      if (open) {
        R(theme.wallFace, 0, 8, TILE, 8); R(theme.trim, 0, 15, TILE, 1);
        // bunting flags + string lights along the wall
        R('#1a1c2c', 0, 3, TILE, 1);
        for (let i = 0; i < 2; i++) {
          ctx.fillStyle = CONFETTI[(x * 2 + i) % CONFETTI.length];
          ctx.beginPath(); ctx.moveTo(px + i * 8, py + 4); ctx.lineTo(px + i * 8 + 7, py + 4); ctx.lineTo(px + i * 8 + 3.5, py + 10); ctx.closePath(); ctx.fill();
        }
        const on = Math.floor(time * 2 + x) % 2;
        R(on ? '#fff2b0' : '#ffcd75', 3, 1, 2, 2); R(on ? '#ffcd75' : '#fff2b0', 11, 1, 2, 2);
      }
    }
  }
  function drawDoorPath(px, py, x, y) {
    if (theme.ground === 'sand') {
      ctx.fillStyle = '#8a5a36'; ctx.fillRect(px, py, TILE, TILE);                                  // boardwalk
      ctx.fillStyle = '#a0703e'; for (let i = 0; i < 16; i += 4) ctx.fillRect(px, py + i, TILE, 3);
    } else if (theme.ground === 'party') {
      ctx.fillStyle = '#07070c'; ctx.fillRect(px, py, TILE, TILE);
      return;
    } else if (theme.ground === 'dirt') {
      drawGround(px, py, x, y, '.');
    } else drawPavement(px, py, x, y);
    // fade out at the edge of the map so it reads as an exit
    const g = ctx.createLinearGradient(px, py, px + (x === 0 ? -TILE : x === mapW - 1 ? TILE : 0), py + (y === 0 ? -TILE : y === mapH - 1 ? TILE : 0));
    g.addColorStop(0, 'rgba(7,7,12,0)'); g.addColorStop(1, 'rgba(7,7,12,.7)');
    ctx.fillStyle = g; ctx.fillRect(px, py, TILE, TILE);
  }
  function drawPalm(p) {
    const px = p.tx * TILE, py = p.ty * TILE, K = '#1a1c2c';
    ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse(px + 12, py + 14, 14, 4, 0, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 8; i++) {
      const tx = px + 5 + Math.round(Math.sin(i / 3) * 4), ty = py + 11 - i * 4;
      ctx.fillStyle = K; ctx.fillRect(tx - 1, ty - 1, 7, 6);
      ctx.fillStyle = i % 2 ? '#8a5a36' : '#a0703e'; ctx.fillRect(tx, ty, 5, 4);
    }
    const topX = px + 5 + Math.round(Math.sin(7 / 3) * 4) + 2, topY = py - 18;
    const sway = Math.sin(time * 1.5 + p.tx) * 1.5;
    ctx.lineCap = 'round';
    for (const [dx, dy, w] of [[-16, 6, 4], [16, 7, 4], [-12, -8, 4], [13, -8, 4], [2, -13, 4], [-7, 10, 3], [9, 11, 3]]) {
      ctx.strokeStyle = K; ctx.lineWidth = w + 2;
      ctx.beginPath(); ctx.moveTo(topX, topY); ctx.quadraticCurveTo(topX + dx * 0.6, topY + dy - 6, topX + dx + sway, topY + dy + 2); ctx.stroke();
      ctx.strokeStyle = dy < 0 ? '#4f9a44' : '#38803a'; ctx.lineWidth = w;
      ctx.beginPath(); ctx.moveTo(topX, topY); ctx.quadraticCurveTo(topX + dx * 0.6, topY + dy - 6, topX + dx + sway, topY + dy + 2); ctx.stroke();
    }
    ctx.lineCap = 'butt';
    ctx.fillStyle = '#5a3219'; ctx.fillRect(topX - 3, topY + 1, 3, 3); ctx.fillRect(topX + 1, topY + 2, 3, 3);
  }
  function drawStatue(p) {
    const px = p.tx * TILE, py = p.ty * TILE, hh = hash(p.tx, p.ty), K = '#1a1c2c';
    const white = (p.tx + p.ty) % 2 === 0, body = white ? '#f0e6d2' : '#2e2e3a', hi = white ? '#ffffff' : '#555566', sh = white ? '#c8b8a0' : '#1e1e28';
    const R = (c, x, y, w, h) => { ctx.fillStyle = c; ctx.fillRect(px + x, py + y, w, h); };
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(px, py + 13, 17, 4);
    R(K, 0, 5, 16, 11); R('#b5ae9f', 1, 6, 14, 9); R('#d8d2c6', 1, 6, 14, 2); R('#9a9384', 1, 13, 14, 2);   // pedestal
    const piece = hh % 4;
    const out = (x, y, w, h) => R(K, x - 1, y - 1, w + 2, h + 2);
    // base + body shared by all pieces
    out(2, 1, 12, 4); out(4, -10, 8, 11);
    R(body, 2, 1, 12, 4); R(body, 4, -10, 8, 11); R(sh, 9, -10, 3, 15); R(hi, 5, -9, 1, 9);
    if (piece === 0) {                         // pawn
      out(3, -18, 10, 8); R(body, 3, -18, 10, 8); R(hi, 5, -17, 2, 3); R(sh, 10, -17, 3, 7);
    } else if (piece === 1) {                  // rook
      out(3, -17, 10, 7); R(body, 3, -17, 10, 7); R(K, 5, -17, 2, 3); R(K, 9, -17, 2, 3); R(sh, 10, -14, 3, 4);
    } else if (piece === 2) {                  // bishop
      out(4, -21, 8, 11); R(body, 4, -21, 8, 11); R(K, 8, -19, 1, 5); R(hi, 5, -19, 1, 4); out(7, -25, 2, 3); R(body, 7, -25, 2, 3);
    } else {                                   // king
      out(3, -19, 10, 9); R(body, 3, -19, 10, 9); R(sh, 10, -18, 3, 8);
      out(7, -27, 2, 8); out(5, -24, 6, 2); R(body, 7, -27, 2, 8); R(body, 5, -24, 6, 2);
    }
  }
  function drawBoulder(p) {
    const px = p.tx * TILE, py = p.ty * TILE;
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(px + 8, py + 14, 11, 4, 0, 0, Math.PI * 2); ctx.fill();
    const blob = (x, y, r, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(px + x, py + y, r, 0, Math.PI * 2); ctx.fill(); };
    blob(8, 5, 11, '#1a1c2c'); blob(3, 9, 7, '#1a1c2c'); blob(13, 9, 7, '#1a1c2c');
    blob(8, 5, 10, '#6f7580'); blob(3, 9, 6, '#6f7580'); blob(13, 9, 6, '#5a606a');
    blob(6, 2, 5, '#8a909a'); blob(5, 0, 2, '#a8aeb8');
    ctx.fillStyle = '#5c8a3c'; ctx.fillRect(px + 2, py - 5, 6, 2); ctx.fillStyle = '#7ab85e'; ctx.fillRect(px + 3, py - 6, 3, 1);
  }
  function drawBalloons(p) {
    const px = p.tx * TILE, py = p.ty * TILE, K = '#1a1c2c';
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(px + 1, py + 12, 14, 4);
    ctx.fillStyle = K; ctx.fillRect(px + 2, py + 4, 12, 11); ctx.fillStyle = '#3b5dc9'; ctx.fillRect(px + 3, py + 5, 10, 9);
    ctx.fillStyle = '#ffcd75'; ctx.fillRect(px + 7, py + 5, 2, 9); ctx.fillRect(px + 3, py + 8, 10, 2);
    const cols = ['#b13e53', '#ffcd75', '#41a6f6', '#a7f070', '#f4a3c4'];
    const k = hash(p.tx, p.ty);
    for (let i = 0; i < 3; i++) {
      const bx = px + 3 + i * 5 + Math.sin(time * 1.6 + i * 2 + p.tx) * 1.5, by = py - 22 - (i % 2) * 7 + Math.sin(time * 2 + i) * 1;
      ctx.strokeStyle = '#f4f4f4'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(px + 8, py + 5); ctx.lineTo(bx, by + 6); ctx.stroke();
      ctx.fillStyle = K; ctx.beginPath(); ctx.ellipse(bx, by, 5, 6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = cols[(k + i) % cols.length]; ctx.beginPath(); ctx.ellipse(bx, by, 4, 5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.fillRect(Math.round(bx) - 2, Math.round(by) - 3, 1, 2);
    }
  }

  // ------------------------------------------------------------------ Roble Gym (top-down back wall + sunlight)
  function archPath(g, x, y, w, h) {
    g.beginPath(); g.moveTo(x, y + h); g.lineTo(x, y + w / 2); g.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); g.lineTo(x + w, y + h); g.closePath();
  }
  function drawArchWindow(g, x, y, w, h) {
    g.fillStyle = '#2f4a3a'; archPath(g, x - 1, y - 1, w + 2, h + 2); g.fill();
    g.fillStyle = '#bfe3f5'; archPath(g, x, y, w, h); g.fill();
    g.fillStyle = '#e6f5fb'; g.fillRect(x + 2, y + w / 2, 3, h - w / 2 - 6);
    g.fillStyle = '#5c8a4a'; g.fillRect(x, y + h - 7, w, 7);
    g.fillStyle = '#4a7a3c'; for (let i = 0; i < w; i += 5) g.fillRect(x + i, y + h - 9 - (i % 3), 4, 3);
    g.fillStyle = '#2f4a3a';
    for (let i = 1; i < 4; i++) g.fillRect(x + Math.round((w * i) / 4), y + 2, 1, h - 2);
    for (let yy = y + w / 2; yy < y + h; yy += 6) g.fillRect(x, yy, w, 1);
  }
  function drawChandelier(g, x, y, s = 1) {
    g.fillStyle = '#1a1c2c'; g.fillRect(x, 0, 1, y);
    g.fillRect(x - 10 * s, y + 6 * s, 21 * s, 2); g.fillRect(x - 8 * s, y + 8 * s, 17 * s, 1);
    for (let i = -2; i <= 2; i++) g.fillRect(x + i * 4 * s, y, 1, 7 * s);
    for (let i = -2; i <= 2; i++) { g.fillStyle = '#f4f0e0'; g.fillRect(x + i * 4 * s, y + 3 * s, 1, 3); g.fillStyle = '#ffcd75'; g.fillRect(x + i * 4 * s, y + 1 * s, 1, 2); }
  }
  function buildGymWall() {
    let rows = 0;
    while (rows < mapH && map[rows].every((c) => c === '#')) rows++;
    if (!rows) return null;
    const W2 = mapW * TILE, H2 = rows * TILE;
    const c = document.createElement('canvas'); c.width = W2; c.height = H2;
    const g = c.getContext('2d');
    const R = (col, x, y, w, h) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
    R('#efe0b4', 0, 0, W2, H2);
    R('#e2cf9c', 0, 0, W2, 9);                                                   // ceiling beams
    for (let x = 6; x < W2; x += 36) { R('#d4bf8a', x, 0, 7, 9); R('#c9b27a', x, 9, 7, 3); }
    R('#d9c490', 0, 9, W2, 1);
    const balconyX = W2 * 0.68;
    for (let i = 0; i < 5; i++) {                                                // big arched windows
      const wx = 18 + i * 50;
      if (wx + 34 > balconyX) break;
      drawArchWindow(g, wx, 14, 34, H2 - 24);
      R('#1a1c2c', wx + 40, 20, 2, 18); for (const yy of [22, 28, 34]) { R('#1a1c2c', wx + 38, yy, 6, 3); R('#8a8f99', wx + 39, yy + 1, 1, 1); }  // light rack
    }
    // balcony with railing + staircase on the right
    R('#e9d7a8', balconyX, 30, W2 - balconyX, 14); R('#d6c090', balconyX, 42, W2 - balconyX, 2);
    R('#1a1c2c', balconyX, 20, W2 - balconyX, 1); for (let x = balconyX; x < W2; x += 3) R('#1a1c2c', x, 20, 1, 10);
    R('#1a1c2c', balconyX, 29, W2 - balconyX, 1);
    for (let i = 0; i < 7; i++) { R('#8a5a36', balconyX - 4 - i * 4, 30 + i * 4, 6, 3); R('#5a3219', balconyX - 4 - i * 4, 32 + i * 4, 6, 1); }
    g.strokeStyle = '#1a1c2c'; g.beginPath(); g.moveTo(balconyX + 1, 22); g.lineTo(balconyX - 28, H2 - 4); g.stroke();
    R('#1a1c2c', balconyX + 18, 46, 30, H2 - 46); R('#2a1a2a', balconyX + 19, 47, 28, H2 - 47);     // stage curtain
    R('#38b764', balconyX - 60, 38, 10, 5); R('#1a1c2c', balconyX - 60, 38, 10, 1);                    // exit sign
    // chandeliers hanging in front of the wall
    for (let x = 60; x < W2; x += 110) drawChandelier(g, x, 12 + (x % 3) * 3);
    R('#c9b27a', 0, H2 - 3, W2, 3); R('#a8894e', 0, H2 - 1, W2, 1);              // baseboard
    return { img: c, x: 0, y: 0 };
  }
  function drawSunlight() {
    ctx.fillStyle = 'rgba(255, 246, 214, 0.22)';
    for (let i = 0; i < 4; i++) {
      const x = 18 + i * 50, y = 64;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 34, y); ctx.lineTo(x + 34 + 60, y + 150); ctx.lineTo(x + 60, y + 150); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = 'rgba(255, 246, 214, 0.12)';
    for (let i = 0; i < 4; i++) for (let k = 1; k < 4; k++) ctx.fillRect(18 + i * 50 + 24 + k * 12 + k * 6, 64 + k * 36, 36, 1);
  }

  // ------------------------------------------------------------------ piano recitals (side view)
  const KB = { lo: 36, hi: 96, x0: 16, kw: 8, y: 202 };
  const PIANO_LANES = [['KeyD', 'ArrowLeft'], ['KeyF', 'ArrowDown'], ['KeyJ', 'ArrowUp'], ['KeyK', 'ArrowRight']];
  const LANE_COLORS = ['#ef7d57', '#ffcd75', '#a7f070', '#41a6f6'];
  const HW = { x: 214, w: 96, top: 16, hit: 170, speed: 115, win: 0.17 };
  const WHITE_OF = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6], IS_BLACK = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0];
  let recital = null;

  function keyRect(m) {
    const o = Math.floor((m - KB.lo) / 12), pc = (m - KB.lo) % 12, wi = o * 7 + WHITE_OF[pc];
    if (IS_BLACK[pc]) return { x: KB.x0 + (wi + 1) * KB.kw - 3, w: 5, black: true };
    return { x: KB.x0 + wi * KB.kw, w: KB.kw, black: false };
  }

  function runPiano(id) {
    return new Promise(async (resolve) => {
      $('fade').classList.add('on');
      await wait(0.3);
      const def = SONGS[id];
      const lead = def.rhythm ? 2.4 : 1.0;
      const t0 = SFX.now() + lead;
      const r = { def, resolve, t0, played: [], sparks: [], hits: 0, misses: 0, total: 0, result: null, done: false, bob: 0, laneFlash: [0, 0, 0, 0] };
      const notes = def.notes.map((n) => ({ ...n }));
      if (def.rhythm) {
        // left hand + final chord play by themselves, right hand is split into chunks to hit
        const rh = notes.filter((n) => n.hand === 'r' && !n.final);
        r.gems = [];
        for (let i = 0; i < rh.length; i += def.chunk) {
          const part = rh.slice(i, i + def.chunk), avg = part.reduce((a, n) => a + n.m, 0) / part.length;
          r.gems.push({ t: part[0].t, notes: part, lane: clamp(Math.round((avg - 70) / 6), 0, 3) });
        }
        const fin = notes.filter((n) => n.final);
        r.gems.push({ t: fin[0].t, notes: fin, lane: 1, big: true });
        r.total = r.gems.length;
        for (const n of notes) if (n.hand === 'l') schedule(r, n, 0);
      } else {
        for (const n of notes) schedule(r, n, 0);
      }
      r.end = Math.max(...notes.map((n) => n.t + (n.d || 0))) + 1.2;
      recital = r;
      scene = 'piano';
      $('hud-area').textContent = def.title;
      $('hud-chests').textContent = '';
      $('fade').classList.remove('on');
    });
  }

  function schedule(r, n, shift) {
    const at = r.t0 + n.t + shift;
    if (n.m != null) SFX.pnote(n.m, at, n.d, 0.045 * (n.v || 1));
    r.played.push({ ...n, at });
  }

  function pianoHit(lane) {
    const r = recital;
    if (!r?.gems || r.result) return;
    r.laneFlash[lane] = 0.12;
    const now = SFX.now() - r.t0;
    const gem = r.gems.find((g) => !g.done && g.lane === lane && Math.abs(g.t - now) <= HW.win);
    if (!gem) return;
    gem.done = 'hit';
    r.hits++;
    const late = Math.max(0, now - gem.t);
    for (const n of gem.notes) schedule(r, n, late);
    const perfect = Math.abs(gem.t - now) < 0.07;
    floaters.push({ x: HW.x + lane * 24 + 12, y: HW.hit - 10, text: perfect ? 'PERFECT' : 'GOOD', life: 0.6, color: perfect ? '#ffcd75' : '#a7f070' });
    for (let i = 0; i < 6; i++) particles.push({ x: HW.x + lane * 24 + 12, y: HW.hit, vx: rand(-40, 40), vy: rand(-80, -20), life: rand(0.3, 0.6), color: LANE_COLORS[lane] });
  }

  function updatePiano(dt) {
    const r = recital, now = SFX.now() - r.t0;
    r.laneFlash = r.laneFlash.map((f) => Math.max(0, f - dt));
    // effects when scheduled notes actually sound
    let sounding = 0;
    for (const n of r.played) {
      const t = n.at - r.t0;
      if (t <= now && t + Math.max(0.12, Math.min(n.d, 0.3)) > now && n.m != null) sounding++;
      if (n.fx || t > now) continue;
      n.fx = true;
      if (n.what === 'wrong') { floaters.push({ x: 150, y: 110, text: '?!', life: 0.9, color: '#ff4d6d' }); SFX.blip(0.5); }
      if (n.what === 'pause') floaters.push({ x: 150, y: 110, text: '...', life: 1.2, color: '#f4f4f4' });
      if (n.what === 'smash') { shake = 8; floaters.push({ x: 150, y: 100, text: '*BLAM*', life: 1.6, color: '#ff4d6d' }); }
      if (n.m != null && (n.hand === 'r' || Math.random() < 0.3) && Math.random() < 0.6) {
        r.sparks.push({ x: rand(110, 190), y: 128, vx: rand(-10, 10), vy: rand(-40, -25), life: 1.4, color: n.what === 'wrong' || n.what === 'smash' ? '#ff4d6d' : CONFETTI[(n.m * 7) % CONFETTI.length] });
      }
      if (n.final) { for (let i = 0; i < 60; i++) burst(160, 110, 1, CONFETTI[i % CONFETTI.length], 150); shake = 3; }
    }
    r.bob = sounding ? Math.min(1, r.bob + dt * 12) : Math.max(0, r.bob - dt * 6);
    r.sparks = r.sparks.filter((p) => { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; return p.life > 0; });
    if (r.gems) {
      for (const g of r.gems) {
        if (!g.done && now > g.t + HW.win) {
          g.done = 'miss'; r.misses++;
          floaters.push({ x: HW.x + g.lane * 24 + 12, y: HW.hit - 10, text: 'MISS', life: 0.6, color: '#ff4d6d' });
        }
      }
      if (!r.result && now > r.end - 0.6) {
        const acc = Math.round((100 * r.hits) / r.total);
        r.result = { acc, grade: acc >= 95 ? 'VIRTUOSO!!' : acc >= 80 ? 'BRAVO!' : acc >= 50 ? 'NICE!' : 'NICE TRY!' };
        SFX.victory();
      }
    }
    if (!r.done && now > r.end + (r.gems ? 2.2 : 0)) {
      r.done = true;
      (async () => {
        $('fade').classList.add('on');
        await wait(0.35);
        recital = null; scene = 'play'; particles = []; floaters = []; shake = 0;
        updateHUD();
        $('fade').classList.remove('on');
        await wait(0.2);
        r.resolve();
      })();
    }
  }

  function drawPixelNote(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y + 4, 3, 2); ctx.fillRect(x + 2, y - 2, 1, 6); ctx.fillRect(x + 3, y - 2, 2, 1); ctx.fillRect(x + 4, y - 1, 1, 1);
  }

  function renderPiano() {
    const r = recital, now = SFX.now() - r.t0;
    const R = (c, x, y, w, h) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
    const K = '#1a1c2c';
    ctx.save();
    if (shake > 0) ctx.translate(rand(-0.5, 0.5) * shake, rand(-0.5, 0.5) * shake);
    // hall: wall, windows, chandelier, floor with sunlight
    R('#efe0b4', -10, -10, W + 20, 170);
    R('#e2cf9c', -10, -10, W + 20, 20); for (let x = 0; x < W; x += 48) { R('#d4bf8a', x, -10, 8, 20); R('#c9b27a', x, 10, 8, 3); }
    drawArchWindow(ctx, 14, 28, 50, 104);
    drawArchWindow(ctx, 256, 28, 50, 104);
    drawChandelier(ctx, 160, 22, 2);
    R('#c9b27a', -10, 146, W + 20, 4);
    R('#e6c48e', -10, 150, W + 20, 50);
    for (let y = 154; y < 200; y += 6) R('#d9b57e', -10, y, W + 20, 1);
    ctx.fillStyle = 'rgba(255, 246, 214, 0.25)';
    for (const x of [14, 256]) { ctx.beginPath(); ctx.moveTo(x, 150); ctx.lineTo(x + 50, 150); ctx.lineTo(x + 90, 200); ctx.lineTo(x + 40, 200); ctx.closePath(); ctx.fill(); }
    // grand piano (side view), keyboard end on the left
    ctx.fillStyle = '#2a2a36';
    ctx.beginPath(); ctx.moveTo(100, 144); ctx.lineTo(206, 144); ctx.lineTo(198, 96); ctx.lineTo(116, 124); ctx.closePath(); ctx.fill();  // lid
    R(K, 176, 108, 2, 36);                                                                                                          // lid prop
    R(K, 88, 142, 122, 18); R('#23232d', 89, 143, 120, 16); R('#4a4a5a', 89, 143, 120, 2);                                           // body
    R(K, 98, 130, 8, 14); R('#f4f4f4', 99, 131, 6, 11);                                                                             // music stand
    for (const x of [96, 196]) { R(K, x, 160, 6, 26); R('#23232d', x + 1, 160, 4, 25); }
    R(K, 150, 180, 16, 4);                                                                                                          // pedals
    // performer + watcher
    const perf = r.def.player === 'abe' ? SPR.friend : SPR.player, watch = r.def.player === 'abe' ? SPR.player : SPR.friend;
    const wx = r.gems ? 30 : 262;
    drawSprite(ctx, watch.side[0], wx - 8, 186 - 16, { scale: 2, flip: !r.gems });
    const bob = Math.round(r.bob * Math.sin(time * 18) * 1.2);
    drawSprite(ctx, perf.side[0], 64 - 8, 182 - 16 + bob, { scale: 2 });
    R(K, 46, 166, 34, 7); R('#5a3219', 47, 167, 32, 5); R('#7a4a2a', 47, 167, 32, 2);                                                // bench
    for (const x of [48, 74]) R(K, x, 173, 4, 13);
    R(K, 80, 148, 14, 5); R('#f4f4f4', 80, 149, 13, 2);                                                                             // keys
    for (const p of r.sparks) { ctx.globalAlpha = Math.min(1, p.life); drawPixelNote(Math.round(p.x), Math.round(p.y), p.color); }
    ctx.globalAlpha = 1;
    // keyboard at the bottom, lit keys follow what is sounding
    const lit = new Map();
    for (const n of r.played) {
      const t = n.at - r.t0;
      if (n.m == null || t > now || t + Math.max(0.1, Math.min(n.d, 0.35)) < now) continue;
      lit.set(n.m, n.what === 'wrong' || n.what === 'smash' ? '#ff4d6d' : n.hand === 'l' ? '#41a6f6' : '#a7f070');
    }
    R(K, KB.x0 - 2, KB.y - 2, 36 * KB.kw + 4, 40);
    for (let m = KB.lo; m <= KB.hi; m++) {
      const k = keyRect(m);
      if (k.black) continue;
      R(lit.get(m) || '#f4f4f4', k.x, KB.y, k.w - 1, 34); R('rgba(0,0,0,.12)', k.x, KB.y + 30, k.w - 1, 4);
    }
    for (let m = KB.lo; m <= KB.hi; m++) {
      const k = keyRect(m);
      if (k.black) R(lit.get(m) || K, k.x, KB.y, k.w, 20);
    }
    R('#b13e53', KB.x0 - 2, KB.y - 2, 36 * KB.kw + 4, 2);
    // rhythm highway
    if (r.gems) {
      R('rgba(10, 10, 22, 0.78)', HW.x, HW.top, HW.w, HW.hit - HW.top + 22);
      for (let i = 0; i < 4; i++) {
        if (r.laneFlash[i] > 0) R('rgba(255,255,255,.14)', HW.x + i * 24, HW.top, 24, HW.hit - HW.top);
        if (i) R('rgba(255,255,255,.12)', HW.x + i * 24, HW.top, 1, HW.hit - HW.top + 22);
      }
      for (const g of r.gems) {
        if (g.done === 'hit') continue;
        const y = HW.hit - (g.t - now) * HW.speed;
        if (y < HW.top - 8 || y > HW.hit + 20) continue;
        const gx = g.big ? HW.x + 2 : HW.x + g.lane * 24 + 2, gw = g.big ? HW.w - 4 : 20;
        R(K, gx - 1, y - 4, gw + 2, 8); R(g.done === 'miss' ? '#566c86' : g.big ? '#f4f4f4' : LANE_COLORS[g.lane], gx, y - 3, gw, 6); R('rgba(255,255,255,.5)', gx + 1, y - 3, gw - 2, 1);
      }
      R('#f4f4f4', HW.x, HW.hit, HW.w, 2);
      ctx.font = '8px "Press Start 2P", monospace'; ctx.textAlign = 'center';
      'DFJK'.split('').forEach((ch, i) => { ctx.fillStyle = r.laneFlash[i] > 0 ? LANE_COLORS[i] : '#94b0c2'; ctx.fillText(ch, HW.x + i * 24 + 12, HW.hit + 15); });
      if (now < 0) { ctx.fillStyle = '#ffcd75'; ctx.fillText(now < -1.2 ? 'READY' : 'GO!', HW.x + HW.w / 2, 90); }
    }
    for (const pt of particles) { ctx.fillStyle = pt.color; ctx.fillRect(Math.round(pt.x), Math.round(pt.y), 2, 2); }
    ctx.font = '8px "Press Start 2P", monospace'; ctx.textAlign = 'center';
    for (const f of floaters) {
      ctx.fillStyle = '#000'; ctx.fillText(f.text, Math.round(f.x) + 1, Math.round(f.y) + 1);
      ctx.fillStyle = f.color; ctx.fillText(f.text, Math.round(f.x), Math.round(f.y));
    }
    ctx.restore();
    // title + result
    ctx.font = '6px "Press Start 2P", monospace'; ctx.textAlign = 'center';
    const tx = 108;
    if (r.gems && now < 1.5) { ctx.fillStyle = '#1a1c2c'; ctx.fillText('HIT D F J K (OR ARROWS)', tx + 1, 37); ctx.fillStyle = '#b13e53'; ctx.fillText('HIT D F J K (OR ARROWS)', tx, 36); }
    if (r.result) {
      R('rgba(10,10,22,.85)', 70, 70, 180, 50);
      ctx.font = '12px "Press Start 2P", monospace'; ctx.fillStyle = '#ffcd75'; ctx.fillText(r.result.grade, W / 2, 94);
      ctx.font = '8px "Press Start 2P", monospace'; ctx.fillStyle = '#f4f4f4'; ctx.fillText(r.result.acc + '% OF NOTES HIT', W / 2, 110);
    }
    ctx.textAlign = 'left';
  }

  // ------------------------------------------------------------------ volleyball (side-view 2v2)
  const VB = { floor: 206, netX: 160, netTop: 134, g: 900, jump: 340, ballG: 330, r: 5 };
  let volley = null;

  function runVolley(id) {
    return new Promise(async (resolve) => {
      $('fade').classList.add('on');
      await wait(0.3);
      const def = VOLLEYS[id];
      const mk = (team, x, set, human, zone, speed) => ({ team, x, y: VB.floor, vx: 0, vy: 0, home: x, set, human, zone, speed, onGround: true, walkT: 0, hitCd: 0, err: 0 });
      volley = {
        def, resolve, score: [0, 0], t: 0, jumpBuf: 0, done: false, pause: 1.2, serveTeam: 0,
        players: [
          mk(0, 60, SPR.player, true, [14, 150], 115),
          mk(0, 125, SPR.friend, false, [80, 150], 105),
          mk(1, 195, SPR.people[0], false, [168, 232], 72),
          mk(1, 265, SPR.people[1], false, [220, 306], 72),
        ],
        ball: { x: 60, y: 70, vx: 0, vy: 0 },
      };
      scene = 'volley';
      $('hud-area').textContent = def.title;
      $('hud-chests').textContent = '';
      $('fade').classList.remove('on');
      toast(def.title + ' - first to ' + def.to, 2600);
    });
  }

  function serve(team) {
    const v = volley;
    v.serveTeam = team;
    v.ball = { x: team === 0 ? 60 : 260, y: 60, vx: 0, vy: 0 };
    v.pause = 1.0;
  }

  async function volleyPoint(team) {
    const v = volley;
    v.score[team]++;
    SFX[team === 0 ? 'hit' : 'hurt']();
    floaters.push({ x: v.ball.x, y: VB.floor - 20, text: team === 0 ? 'POINT!' : 'THEIR POINT', life: 1.2, color: team === 0 ? '#a7f070' : '#ff4d6d' });
    if (v.score[team] >= v.def.to) {
      if (team === 0) {
        v.done = true;
        SFX.victory();
        for (let i = 0; i < 80; i++) burst(W / 2, 100, 1, CONFETTI[i % CONFETTI.length], 170);
        toast('YOU WIN!', 2200);
        await wait(2.2);
        $('fade').classList.add('on');
        await wait(0.35);
        volley = null; scene = 'play'; particles = [];
        updateHUD();
        $('fade').classList.remove('on');
        await wait(0.2);
        v.resolve();
        return;
      }
      toast('They won this one... REMATCH!', 2200);
      v.score = [0, 0];
    }
    serve(team);
  }

  function updateVolley(dt) {
    const v = volley, b = v.ball;
    v.t += dt;
    v.jumpBuf -= dt;
    for (const p of v.players) {
      const side = p.team === 0 ? 1 : -1;
      let mx = 0;
      if (v.done) mx = 0;
      else if (p.human) {
        mx = pressed('ArrowRight', 'KeyD') - pressed('ArrowLeft', 'KeyA');
        if (v.jumpBuf > 0 && p.onGround) { p.vy = -VB.jump; p.onGround = false; v.jumpBuf = 0; }
      } else {
        const mine = p.team === 0 ? b.x < VB.netX : b.x > VB.netX;
        const coming = p.team === 0 ? b.vx < 0 : b.vx > 0;
        let tx = p.home;
        if ((mine || coming) && b.x > p.zone[0] - 30 && b.x < p.zone[1] + 30) tx = b.x - side * 7 + p.err;
        tx = clamp(tx, p.zone[0], p.zone[1]);
        if (Math.abs(tx - p.x) > 3) mx = Math.sign(tx - p.x);
        const dx = Math.abs(b.x - p.x), above = p.y - 40 - b.y;
        if (p.onGround && mine && dx < 26 && above > 10 && above < 70 && b.vy > 0 && v.pause <= 0) { p.vy = -VB.jump * 0.9; p.onGround = false; }
      }
      p.x = clamp(p.x + mx * p.speed * dt, p.team === 0 ? 14 : VB.netX + 12, p.team === 0 ? VB.netX - 12 : 306);
      p.walkT = mx && p.onGround ? p.walkT + dt : 0;
      p.vy += VB.g * dt;
      p.y += p.vy * dt;
      if (p.y >= VB.floor) { p.y = VB.floor; p.vy = 0; p.onGround = true; }
      p.hitCd -= dt;
    }
    if (v.done) return;
    if (v.pause > 0) { v.pause -= dt; return; }
    const prevY = b.y;
    b.vy += VB.ballG * dt;
    b.x += b.vx * dt; b.y += b.vy * dt;
    if (b.x < VB.r + 4) { b.x = VB.r + 4; b.vx = Math.abs(b.vx); }
    if (b.x > W - VB.r - 4) { b.x = W - VB.r - 4; b.vx = -Math.abs(b.vx); }
    if (b.y < 24) { b.y = 24; b.vy = Math.abs(b.vy); }
    // net: bounce off the tape on top, or off the sides
    if (b.y + VB.r > VB.netTop && Math.abs(b.x - VB.netX) < VB.r + 3) {
      if (prevY + VB.r <= VB.netTop + 2) { b.y = VB.netTop - VB.r; b.vy = -Math.abs(b.vy) * 0.6; }
      else { b.x = b.vx > 0 ? VB.netX - VB.r - 3 : VB.netX + VB.r + 3; b.vx = -b.vx * 0.6; }
    }
    // players bump the ball (auto-aimed over the net; jumping near the net spikes)
    for (const p of v.players) {
      const cx = p.x, cy = p.y - 32, dx = b.x - cx, dy = b.y - cy, d = Math.hypot(dx, dy);
      if (d > 20 || p.hitCd > 0) continue;
      const side = p.team === 0 ? 1 : -1;
      const nx = dx / (d || 1), ny = dy / (d || 1);
      if (!p.onGround && b.y < cy && Math.abs(p.x - VB.netX) < 55) { b.vx = side * 290; b.vy = 40; SFX.thud(); }
      else {
        b.vx = nx * 150 + side * (70 + Math.abs(VB.netX - p.x) * 0.9);
        b.vy = Math.min(ny * 200 - 250, -230);
        SFX.hit();
      }
      b.x = cx + nx * 21; b.y = cy + ny * 21;
      p.hitCd = 0.25;
      if (!p.human) p.err = rand(-10, 10) * (p.team === 1 ? 2.2 : 0.5);
      burst(b.x, b.y, 4, '#f4f4f4', 40);
    }
    if (b.y >= VB.floor - VB.r) {
      b.y = VB.floor - VB.r;
      volleyPoint(b.x < VB.netX ? 1 : 0);
    }
  }

  function renderVolley() {
    const v = volley, b = v.ball;
    // gym: back wall, banner, bleachers, wood floor
    ctx.fillStyle = '#2f4f9e'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#284690'; for (let x = 0; x < W; x += 32) ctx.fillRect(x, 0, 2, VB.floor);
    ctx.fillStyle = '#223a78'; ctx.fillRect(0, VB.floor - 44, W, 44);
    for (let i = 0; i < 3; i++) { ctx.fillStyle = i % 2 ? '#3a5aab' : '#2a4a98'; ctx.fillRect(0, VB.floor - 44 + i * 14, W, 7); }
    ctx.fillStyle = '#c98f52'; ctx.fillRect(0, VB.floor, W, H - VB.floor);
    ctx.fillStyle = '#b37d45'; for (let y = VB.floor + 5; y < H; y += 6) ctx.fillRect(0, y, W, 1);
    ctx.fillStyle = '#f4f4f4'; ctx.fillRect(12, VB.floor, W - 24, 2);
    // net
    ctx.fillStyle = '#1a1c2c'; ctx.fillRect(VB.netX - 3, VB.netTop - 4, 6, VB.floor - VB.netTop + 4);
    ctx.fillStyle = '#94b0c2'; ctx.fillRect(VB.netX - 2, VB.netTop - 3, 4, VB.floor - VB.netTop + 3);
    ctx.fillStyle = 'rgba(244,244,244,.85)';
    for (let y = VB.netTop + 3; y < VB.netTop + 40; y += 4) ctx.fillRect(VB.netX - 6, y, 12, 1);
    for (let x = -6; x <= 6; x += 4) ctx.fillRect(VB.netX + x, VB.netTop, 1, 40);
    ctx.fillStyle = '#f4f4f4'; ctx.fillRect(VB.netX - 7, VB.netTop - 1, 14, 3);
    // ball shadow
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(Math.round(b.x) - 5, VB.floor - 1, 10, 2);
    // players (2x), facing the net
    for (const p of v.players) {
      const f = !p.onGround ? p.set.side[1] : p.walkT > 0 ? p.set.side[Math.floor(p.walkT * 8) % 4] : p.set.side[0];
      drawSprite(ctx, f, Math.round(p.x) - 8, Math.round(p.y) - 16, { scale: 2, flip: p.team === 1 });
    }
    drawBall(Math.round(b.x), Math.round(b.y));
    for (const pt of particles) { ctx.fillStyle = pt.color; ctx.fillRect(Math.round(pt.x), Math.round(pt.y), 2, 2); }
    ctx.font = '8px "Press Start 2P", monospace'; ctx.textAlign = 'center';
    for (const f of floaters) {
      ctx.fillStyle = '#000'; ctx.fillText(f.text, Math.round(f.x) + 1, Math.round(f.y) + 1);
      ctx.fillStyle = f.color; ctx.fillText(f.text, Math.round(f.x), Math.round(f.y));
    }
    // scoreboard
    ctx.fillStyle = '#1a1c2c'; ctx.fillRect(W / 2 - 34, 26, 68, 18);
    ctx.fillStyle = '#ffcd75'; ctx.fillText(v.score[0] + ' : ' + v.score[1], W / 2, 39);
    ctx.font = '5px "Press Start 2P", monospace';
    ctx.fillStyle = '#f4f4f4'; ctx.fillText(v.def.us, W / 4, 38); ctx.fillText(v.def.them, (W * 3) / 4, 38);
    ctx.fillText('A/D MOVE  -  SPACE JUMP (NEAR THE NET TO SPIKE)', W / 2, H - 4);
    ctx.textAlign = 'left';
  }

  // ------------------------------------------------------------------ climbing (side-view parkour)
  const CL = { g: 820, jump: 310, speed: 95 };
  let climb = null;

  function runClimb(id) {
    return new Promise(async (resolve) => {
      $('fade').classList.add('on');
      await wait(0.3);
      const def = CLIMBS[id], rows = def.map;
      const h = rows.length, w = Math.max(...rows.map((r) => r.length));
      const grid = rows.map((r) => r.padEnd(w, '.').split(''));
      const c = { id, def, grid, w, h, movers: [], crumbs: {}, checkpoints: [], abe: null, t: 0, done: false, resolve, colors: {} };
      let start = [40, (h - 1) * TILE];
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const ch = rows[y][x], at = [x * TILE + 8, (y + 1) * TILE];
          if (ch === 'P') { start = at; grid[y][x] = '.'; }
          else if (ch === 'A') { c.abe = at; grid[y][x] = '.'; }
          else if (ch === '*') { c.checkpoints.push({ x: at[0], y: at[1], on: false }); grid[y][x] = '.'; }
          else if (ch === 'm') {
            if (rows[y][x - 1] !== 'm') {
              let len = 0;
              while (rows[y][x + len] === 'm') len++;
              c.movers.push({ x0: x * TILE, x: x * TILE, y: y * TILE, w: len * TILE, dx: 0, phase: c.movers.length * 1.9 });
            }
            grid[y][x] = '.';
          } else if (ch === '-') c.crumbs[x + ',' + y] = { t: 0, gone: 0 };
          if ((ch === '=' || ch === '-') && rows[y][x - 1] !== ch) c.colors[y] = c.colors[y] || {};
          if (ch === '=' || ch === '-') {
            let sx = x; while (rows[y][sx - 1] === ch) sx--;
            (c.colors[y] ||= {})[x] = HOLD_COLORS[hash(sx, y) % HOLD_COLORS.length];
          }
        }
      }
      c.p = { x: start[0], y: start[1], vx: 0, vy: 0, onGround: true, coyote: 0, buf: 0, face: 1, walkT: 0, on: null };
      c.respawn = [...start];
      c.camY = Math.max(0, h * TILE - H);
      climb = c;
      scene = 'climb';
      $('hud-area').textContent = def.name;
      $('hud-chests').textContent = '';
      $('fade').classList.remove('on');
      toast(def.title || def.name, 2800);
    });
  }

  async function finishClimb() {
    const c = climb;
    c.done = true;
    SFX.victory();
    for (let i = 0; i < 60; i++) burst(c.p.x, c.p.y - 12, 1, CONFETTI[i % CONFETTI.length], 150);
    toast('SENT IT!', 2000);
    await wait(1.8);
    $('fade').classList.add('on');
    await wait(0.35);
    climb = null;
    scene = 'play';
    particles = [];
    updateHUD();
    $('fade').classList.remove('on');
    await wait(0.2);
    c.resolve();
  }

  const climbTile = (c, tx, ty) => (tx < 0 || tx >= c.w || ty < 0 || ty >= c.h ? '#' : c.grid[ty][tx]);
  function climbSolid(c, x, y) {
    const x0 = Math.floor((x - 5) / TILE), x1 = Math.floor((x + 4.99) / TILE);
    const y0 = Math.floor((y - 20) / TILE), y1 = Math.floor((y - 0.01) / TILE);
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (climbTile(c, tx, ty) === '#') return true;
    return false;
  }
  // Finds a surface to land on between feet heights y0 -> y1 (one-way holds, crumbling holds, movers, floor).
  function climbLanding(c, x, y0, y1) {
    for (let ty = Math.floor(y0 / TILE); ty <= Math.floor(y1 / TILE); ty++) {
      const top = ty * TILE;
      if (y0 > top + 0.01 || y1 < top) continue;
      for (let tx = Math.floor((x - 4) / TILE); tx <= Math.floor((x + 3.99) / TILE); tx++) {
        const ch = climbTile(c, tx, ty);
        if (ch === '=' || ch === '#') return { y: top, ref: null };
        if (ch === '-') { const cr = c.crumbs[tx + ',' + ty]; if (!cr.gone) return { y: top, ref: cr }; }
      }
    }
    for (const m of c.movers) {
      if (y0 <= m.y + 0.01 && y1 >= m.y && x + 4 > m.x && x - 4 < m.x + m.w) return { y: m.y, ref: { mover: m } };
    }
    return null;
  }

  function updateClimb(dt) {
    const c = climb, p = c.p;
    c.t += dt;
    for (const m of c.movers) {
      const nx = m.x0 + Math.sin(c.t * (c.def.moverSpeed || 1.3) + m.phase) * (c.def.moverAmp || 40);
      m.dx = nx - m.x; m.x = nx;
    }
    if (p.on?.mover && !climbSolid(c, p.x + p.on.mover.dx, p.y)) p.x += p.on.mover.dx;
    for (const [k, cr] of Object.entries(c.crumbs)) {
      if (cr.gone > 0) { cr.gone -= dt; if (cr.gone <= 0) { cr.gone = 0; cr.t = 0; } }
      else if (cr.t > 0) {
        cr.t += dt;
        if (cr.t > 0.55) {
          cr.gone = 2.2; cr.t = 0;
          const [tx, ty] = k.split(',').map(Number);
          burst(tx * TILE + 8, ty * TILE + 3, 8, '#a0826a', 50);
          SFX.thud();
        }
      }
    }
    const mx = c.done ? 0 : pressed('ArrowRight', 'KeyD') - pressed('ArrowLeft', 'KeyA');
    p.vx = mx * CL.speed;
    if (mx) p.face = mx;
    p.buf -= dt; p.coyote -= dt;
    if (!c.done && p.buf > 0 && (p.onGround || p.coyote > 0)) {
      p.vy = -CL.jump; p.onGround = false; p.coyote = 0; p.buf = 0; p.on = null;
      SFX.roll();
      for (let i = 0; i < 5; i++) particles.push({ x: p.x + rand(-4, 4), y: p.y, vx: rand(-20, 20), vy: rand(-10, 10), life: 0.4, color: '#f4f4f4', noGrav: true });
    }
    const nx = p.x + p.vx * dt;
    if (!climbSolid(c, nx, p.y)) p.x = nx;
    p.vy = Math.min(p.vy + CL.g * dt, 420);
    const wasGround = p.onGround;
    let ny = p.y + p.vy * dt;
    p.onGround = false; p.on = null;
    if (p.vy >= 0) {
      const land = climbLanding(c, p.x, p.y, ny);
      if (land) {
        ny = land.y; p.vy = 0; p.onGround = true; p.on = land.ref;
        if (land.ref && 't' in land.ref && !land.ref.t) land.ref.t = 0.0001;
      }
    } else if (climbSolid(c, p.x, ny)) { ny = p.y; p.vy = 0; }
    p.y = ny;
    if (wasGround && !p.onGround && p.vy >= 0) p.coyote = 0.1;
    p.walkT = p.onGround && mx ? p.walkT + dt : 0;

    for (const cp of c.checkpoints) {
      if (!cp.on && Math.abs(cp.x - p.x) < 12 && Math.abs(cp.y - p.y) < 20) {
        cp.on = true; c.respawn = [cp.x, cp.y];
        SFX.save(); toast('Checkpoint!', 1200);
        burst(cp.x, cp.y - 6, 14, '#f4f4f4', 50);
      }
    }
    if (!c.done && p.y > c.respawn[1] + 110) {
      p.x = c.respawn[0]; p.y = c.respawn[1]; p.vx = p.vy = 0;
      floaters.push({ x: p.x, y: p.y - 28, text: 'whoops', life: 1, color: '#f4f4f4' });
    }
    const tx = Math.floor(p.x / TILE), ty = Math.floor((p.y - 10) / TILE);
    if (!c.done && (climbTile(c, tx, ty) === 'G' || climbTile(c, tx, ty - 1) === 'G')) finishClimb();

    const target = clamp(p.y - 140, 0, Math.max(0, c.h * TILE - H));
    c.camY += (target - c.camY) * Math.min(1, dt * 6);
  }

  function renderClimb() {
    const c = climb, p = c.p;
    ctx.fillStyle = '#101418';
    ctx.fillRect(0, 0, W, H);
    const cx = Math.round((c.w * TILE - W) / 2), cy = Math.round(c.camY);
    ctx.save();
    ctx.translate(-cx, -cy);
    const y0 = Math.max(0, Math.floor(cy / TILE)), y1 = Math.min(c.h - 1, Math.floor((cy + H) / TILE) + 1);
    for (let y = y0; y <= y1; y++) {
      for (let x = 0; x < c.w; x++) {
        const px = x * TILE, py = y * TILE, ch = c.grid[y][x];
        if (ch === '#') {
          ctx.fillStyle = y === c.h - 1 ? '#2b3550' : '#3a3f4c';
          ctx.fillRect(px, py, TILE, TILE);
          ctx.fillStyle = '#4a5064'; ctx.fillRect(px, py, TILE, 1);
          continue;
        }
        ctx.fillStyle = '#c8ccd6'; ctx.fillRect(px, py, TILE, TILE);
        ctx.fillStyle = '#b4b9c6'; ctx.fillRect(px + 15, py, 1, TILE);
        if (y % 3 === 0) ctx.fillRect(px, py, TILE, 1);
        const hh = hash(x * 7, y * 11);
        if (hh % 4 === 0) { ctx.fillStyle = HOLD_COLORS[hh % HOLD_COLORS.length] + '66'; ctx.fillRect(px + (hh % 11) + 2, py + ((hh >>> 4) % 10) + 3, 3, 2); }
        if (ch === '=' || ch === '-') {
          const cr = ch === '-' ? c.crumbs[x + ',' + y] : null;
          if (cr && cr.gone) continue;
          const shakeX = cr && cr.t > 0 ? Math.round(rand(-1, 1)) : 0;
          const col = ch === '-' ? '#a0826a' : c.colors[y]?.[x] || '#e84a5f';
          const left = c.grid[y][x - 1] !== ch, right = c.grid[y][x + 1] !== ch;
          ctx.fillStyle = '#1a1c2c'; ctx.fillRect(px + shakeX + (left ? 1 : 0), py - 1, TILE - (left ? 1 : 0) - (right ? 1 : 0), 8);
          ctx.fillStyle = col; ctx.fillRect(px + shakeX + (left ? 2 : 0), py, TILE - (left ? 2 : 0) - (right ? 2 : 0), 6);
          ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(px + shakeX + (left ? 2 : 0), py, TILE - (left ? 2 : 0) - (right ? 2 : 0), 1);
          ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(px + shakeX + (left ? 2 : 0), py + 4, TILE - (left ? 2 : 0) - (right ? 2 : 0), 2);
          if (ch === '-') { ctx.fillStyle = '#5a3a22'; ctx.fillRect(px + shakeX + 5, py + 1, 1, 3); ctx.fillRect(px + shakeX + 9, py + 2, 2, 1); }
        } else if (ch === 'G') {
          const bob = Math.round(Math.sin(time * 4) * 1.5);
          ctx.fillStyle = '#1a1c2c'; ctx.fillRect(px + 3, py + 3 + bob, 10, 11);
          ctx.fillStyle = '#ffcd75'; ctx.fillRect(px + 4, py + 4 + bob, 8, 9);
          ctx.fillStyle = '#fff2b0'; ctx.fillRect(px + 5, py + 5 + bob, 2, 3);
          ctx.fillStyle = '#1a1c2c'; ctx.fillRect(px + 7, py + 13 + bob, 2, 2);
        }
      }
    }
    for (const m of c.movers) {
      const x = Math.round(m.x);
      ctx.fillStyle = '#1a1c2c'; ctx.fillRect(x, m.y - 1, m.w, 8);
      ctx.fillStyle = '#41a6f6'; ctx.fillRect(x + 1, m.y, m.w - 2, 6);
      ctx.fillStyle = '#f4f4f4'; ctx.fillRect(x + 3, m.y + 2, 3, 1); ctx.fillRect(x + m.w - 6, m.y + 2, 3, 1);
    }
    for (const cp of c.checkpoints) {
      ctx.fillStyle = '#1a1c2c'; ctx.fillRect(cp.x - 5, cp.y - 9, 10, 9);
      ctx.fillStyle = cp.on ? '#f4f4f4' : '#94b0c2'; ctx.fillRect(cp.x - 4, cp.y - 8, 8, 8);
      ctx.fillStyle = '#e84a5f'; ctx.fillRect(cp.x - 4, cp.y - 8, 8, 2);
    }
    if (c.abe) drawSprite(ctx, SPR.friend.down[0], c.abe[0] - 8, c.abe[1] - 16);
    const set = SPR.player.side;
    const frame = !p.onGround ? set[1] : p.walkT > 0 ? set[Math.floor(p.walkT * 8) % 4] : set[0];
    drawSprite(ctx, frame, p.x - 8, p.y - 16, { flip: p.face < 0 });
    for (const pt of particles) { ctx.fillStyle = pt.color; ctx.fillRect(Math.round(pt.x), Math.round(pt.y), 2, 2); }
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    for (const f of floaters) {
      ctx.fillStyle = '#000'; ctx.fillText(f.text, Math.round(f.x) + 1, Math.round(f.y) + 1);
      ctx.fillStyle = f.color; ctx.fillText(f.text, Math.round(f.x), Math.round(f.y));
    }
    ctx.restore();
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#000'; ctx.fillText(c.def.title || c.def.name, W / 2 + 1, H - 9);
    ctx.fillStyle = '#ffcd75'; ctx.fillText(c.def.title || c.def.name, W / 2, H - 10);
    ctx.font = '5px "Press Start 2P", monospace';
    ctx.fillStyle = '#f4f4f4'; ctx.fillText('A/D MOVE  -  SPACE JUMP', W / 2, H - 3);
    ctx.textAlign = 'left';
  }

  // ------------------------------------------------------------------ interactions
  function frontTile() {
    const [fx, fy] = DIRV[player.dir];
    return [Math.floor((player.x + fx * 12) / TILE), Math.floor((player.y + fy * 11) / TILE)];
  }

  async function interact() {
    const [tx, ty] = frontTile();
    const c = entityAt(chests, tx, ty);
    if (c && !save.opened[c.id]) return openChest(c);
    const n = entityAt(npcs, tx, ty);
    if (n) return talk(n);
    if (entityAt(stars, tx, ty)) return useStar();
    const f = entityAt(furniture, tx, ty);
    if (f) {
      if (f.kind === 'bed') return useStar(EXAMINE.bed);
      if (f.kind === 'piano') return playPiano(f);
      if (f.kind === 'grand') { SFX.chord(false); floaters.push({ x: (f.tx + 1.5) * TILE, y: f.ty * TILE - 8, text: '\u266A', life: 1.1, color: '#ffcd75' }); }
      busy = true; await say(EXAMINE[f.kind] || ['(Nothing interesting.)']); busy = false; return;
    }
    if (entityAt(signs, tx, ty)) { busy = true; await say(SIGNS[roomId] || ['(It says nothing.)']); busy = false; return; }
    const ch = map[ty]?.[tx];
    if (ch === 'q') {
      busy = true;
      for (const poll of WHITEBOARD) await showModal({ title: poll.question, chart: poll, text: poll.note || '', kind: 'whiteboard' });
      busy = false;
      return;
    }
    if (isDoorCh(ch) && doorLocked(ch)) gateMessage(ch);
  }

  async function gateMessage(ch) {
    if (!doors[ch]?.gate || inCombat()) return;
    const left = worldChestsLeft(room.world);
    gateMsgCd = 4;
    busy = true;
    await say(DIALOGUE.gate.replace('{left}', left).replace('{s}', left === 1 ? '' : 's').replace('{are}', left === 1 ? 'is' : 'are'));
    busy = false;
  }

  async function openChest(c) {
    if (save.opened[c.id]) return;
    save.opened[c.id] = true;
    persist();
    SFX.chest();
    burst(c.tx * TILE + 8, c.ty * TILE + 8, 24);
    updateHUD();
    busy = true;
    const it = CHESTS[c.id] || { type: 'note', title: '???', text: `(This chest is empty. Add "${c.id}" to CHESTS in content.js.)` };
    if (it.type === 'photo') await showModal({ title: it.title || 'A memory!', text: it.caption, img: it.src, kind: 'photo' });
    else if (it.type === 'gear') {
      await say([it.found || `You found the ${it.name}!`, it.text], { icon: SPR.iconURL(it.icon) });
      if (it.photo) await showModal({ title: it.photoTitle || 'A memory!', text: it.caption || '', img: it.photo, kind: 'photo' });
      levelUp();
    } else await showModal({ title: it.title || 'A note', text: it.text, kind: 'note' });
    busy = false;
    updateHUD();
    if (worldChestsLeft(room.world) === 0 && (WORLD_CHESTS[room.world] || []).includes(c.id) && room.world !== 'party') {
      toast('All chests found! The seal is broken.');
      SFX.door();
    }
    if (room.finale && chests.every((ch) => save.opened[ch.id])) { await wait(0.6); celebrate(); }
  }

  function levelUp() {
    save.level++;
    persist();
    player.hp = maxHP();
    SFX.levelUp();
    floaters.push({ x: player.x, y: player.y - 22, text: 'LV UP!', life: 1.6, color: '#a7f070' });
    toast(`LV ${save.level}! Max HP ${maxHP()}`);
    updateHUD();
  }

  async function talk(n) {
    busy = true;
    if (n.kind === 'dog') {
      SFX.woof();
      await say(DIALOGUE.dog, { voice: 1.7 });
      npcs.splice(npcs.indexOf(n), 1);
      save.hasDog = true;
      persist();
      dog.x = n.tx * TILE + 8; dog.y = n.ty * TILE + 12; trail = [];
      toast(DIALOGUE.dogJoined);
    } else if (n.kind === 'friend') {
      await say(DIALOGUE[room.friend] || ['...'], { speaker: GIFT.friendName });
    } else if (n.kind === 'person') {
      await say([DIALOGUE.people[n.variant % DIALOGUE.people.length]]);
    } else if (n.kind === 'cake') {
      // first: make a wish, then every press takes a bite; the last bite shows the final message
      if (!n.bites) {
        SFX.puff(); SFX.save();   // blow out the candles (the song plays once, on the final message)
        for (let i = 0; i < 80; i++) spawnConfetti();
        await say(EXAMINE.cakeWish);
        n.bites = 1;
      } else {
        n.bites++;
        SFX.pop();
        floaters.push({ x: n.tx * TILE + 16 + rand(-6, 6), y: n.ty * TILE - 4, text: 'NOM', life: 0.8, color: '#f4a3c4' });
        burst(n.tx * TILE + 16, n.ty * TILE + 14, 8, '#f4e2c0', 50);
        if (n.bites > CAKE_BITES) {
          npcs.splice(npcs.indexOf(n), 1);
          await wait(0.4);
          await say(EXAMINE.cakeDone);
          busy = false;
          await wait(0.4);
          celebrate();
          return;
        }
      }
    }
    busy = false;
  }

  const CAKE_BITES = 4;

  // Each press plays the next note of Happy Birthday.
  let pianoNote = 0;
  async function playPiano(f) {
    SFX.hbNote(pianoNote);
    floaters.push({ x: (f.tx + 1.5) * TILE + rand(-8, 8), y: f.ty * TILE - 20, text: '\u266A', life: 1.1, color: CONFETTI[pianoNote % CONFETTI.length] });
    pianoNote++;
    if (pianoNote < SFX.hbLength) return;
    pianoNote = 0;
    burst((f.tx + 1.5) * TILE, f.ty * TILE - 10, 40);
    busy = true;
    await wait(0.6);
    await say(EXAMINE.piano || []);
    busy = false;
  }

  async function useStar(lines = DIALOGUE.save) {
    busy = true;
    SFX.save();
    player.hp = maxHP();
    save.room = roomId;
    save.pos = [player.x, player.y];
    persist();
    updateHUD();
    await say(lines);
    busy = false;
  }

  function hurt() {
    if (player.inv > 0 || player.roll || busy) return;
    player.hp--;
    player.inv = 1.2;
    if (!boss?.hard) eBullets = []; // easy mode: getting hit clears the screen (not in the brutal first Crimp attempt)
    SFX.hurt();
    shake = 5;
    floaters.push({ x: player.x, y: player.y - 20, text: '-1', life: 0.8, color: '#ff4d6d' });
    updateHUD();
    if (player.hp <= 0) faint();
  }

  async function faint() {
    busy = true;
    eBullets = []; hazards = []; timers = [];
    if (boss?.hard) {
      // the brutal first attempt is over: Thatcher always comes to the rescue, then it's a normal fight
      boss.hard = false;
      (save.revived ||= {})[roomId] = true;
      if (!save.hasDog) {
        await say(DIALOGUE.dogRescue);
        save.hasDog = true;
        toast(fill(DIALOGUE.dogJoined));
      } else await say(DIALOGUE.faint);
      persist();
    } else await say(save.hasDog ? DIALOGUE.faint : DIALOGUE.faintNoDog);
    player.hp = maxHP();
    player.inv = 1.5;
    [player.x, player.y] = entryPos;
    dog.x = player.x; dog.y = player.y; trail = [];
    if (boss) { boss.cool = 2; }
    updateHUD();
    busy = false;
  }

  function damageBoss(n, x, y) {
    boss.hp -= boss.hard ? n * 0.5 : n;
    if (boss.hard) boss.hp = Math.max(boss.hp, boss.max * 0.35);   // can't be beaten on the brutal first attempt
    boss.hurt = 0.08;
    burst(x, y, 3, '#fff2b0', 40);
    if (hitSfxCd <= 0) { SFX.hit(); hitSfxCd = 0.09; }
    updateBossBar();
    if (boss.hp <= 0) defeatBoss();
  }

  async function defeatBoss() {
    boss.dead = true;
    stopMusic(2.5);
    eBullets = []; hazards = []; timers = [];
    save.beaten[roomId] = true;
    persist();
    SFX.victory();
    shake = 8;
    const [cx, cy] = boss.def.center(boss);
    for (let i = 0; i < 100; i++) burst(cx, cy, 1, CONFETTI[i % CONFETTI.length], 160);
    updateHUD();
    busy = true;
    await wait(1.2);
    await say(BOSS_TEXT[room.boss]?.defeat || []);
    boss = null;
    spawnRewards();
    pickups.push({ x: bossSpot[0] * TILE + 8, y: (bossSpot[1] + 4) * TILE, t: 0 });
    busy = false;
    SFX.door();
    toast('The way forward is open!');
    updateHUD();
  }

  async function celebrate() {
    scene = 'ending';
    $('cele-name').textContent = fill(GIFT.name) + '!';
    $('cele-text').textContent = fill(GIFT.ending);
    $('cele-from').textContent = '- ' + fill(GIFT.from);
    $('celebrate').classList.remove('hidden');
    SFX.birthday();
  }
  function closeCelebrate() {
    $('celebrate').classList.add('hidden');
    scene = 'play';
    if (GIFT.video && !memoriesShown) playMemories();
  }

  // Full-window videos (can't be skipped): scene steps { video: '...' } and the ending montage.
  function playVideo(src, caption = '') {
    return new Promise((resolve) => {
      $('memories-caption').textContent = fill(caption);
      $('memories-caption').classList.toggle('hidden', !caption);
      document.body.appendChild($('memories'));   // out of the scaled game frame, so it can fill the window
      const v = $('memories-video'), prev = scene;
      const done = () => {
        v.onended = v.onerror = null;
        v.pause();
        $('memories').classList.add('hidden');
        scene = prev;
        resolve();
      };
      v.onended = done;
      v.onerror = done;
      v.src = src;
      scene = 'memories';
      $('memories').classList.remove('hidden');
      v.play().catch(() => {});
    });
  }

  // The clip montage after the final message.
  let memoriesShown = false;
  async function playMemories() {
    memoriesShown = true;
    await playVideo(GIFT.video);
    SFX.victory();
    for (let i = 0; i < 80; i++) spawnConfetti();
  }

  // ------------------------------------------------------------------ fx
  function burst(x, y, n, color = null, speed = 70) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = speed * rand(0.3, 1);
      particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 30, life: rand(0.5, 1.1), color: color || CONFETTI[Math.floor(Math.random() * CONFETTI.length)] });
    }
  }
  function spawnConfetti() {
    confetti.push({ x: Math.random() * W, y: rand(-65, -5), vx: rand(-15, 15), vy: rand(30, 70), w: rand(2, 4), color: CONFETTI[Math.floor(Math.random() * CONFETTI.length)], spin: rand(0, 6) });
  }

  // ------------------------------------------------------------------ update
  function nearestTarget() {
    let best = null, bd = Infinity;
    const consider = (x, y) => { const d = Math.hypot(x - player.x, y - player.y); if (d < bd) { bd = d; best = [x, y]; } };
    enemies.forEach((e) => consider(e.x, e.y - 6));
    if (boss && boss.active && !boss.dead) consider(...boss.def.center(boss));
    return best;
  }

  function updatePlayer(dt) {
    player.inv = Math.max(0, player.inv - dt);
    player.rollCd -= dt;
    player.fireCd -= dt;
    const combat = inCombat() && (!boss || boss.active);
    const mx = pressed('ArrowRight', 'KeyD') - pressed('ArrowLeft', 'KeyA');
    const my = pressed('ArrowDown', 'KeyS') - pressed('ArrowUp', 'KeyW');
    const autoAim = keys.has('KeyJ');

    if (combat) {
      const tgt = autoAim ? nearestTarget() : null;
      const [ax, ay] = tgt || [mouse.sx + camX, mouse.sy + camY];
      player.aim = Math.atan2(ay - (player.y - 6), ax - player.x);
    }

    if (rollQueued) {
      rollQueued = false;
      if (combat && !player.roll && player.rollCd <= 0) {
        let dx = mx, dy = my;
        if (!dx && !dy) [dx, dy] = DIRV[player.dir];
        const l = Math.hypot(dx, dy);
        player.roll = { t: 0.36, dur: 0.36, dx: dx / l, dy: dy / l };
        SFX.roll();
      }
    }

    const ox = player.x, oy = player.y;
    if (player.roll) {
      const r = player.roll;
      r.t -= dt;
      moveBody(player, r.dx * 165 * dt, r.dy * 165 * dt);
      if (r.t <= 0) { player.roll = null; player.rollCd = 0.15; }
    } else if (mx || my) {
      const l = Math.hypot(mx, my);
      moveBody(player, (mx / l) * 78 * dt, (my / l) * 78 * dt);
      const h = mx > 0 ? 'right' : mx < 0 ? 'left' : null, v = my > 0 ? 'down' : my < 0 ? 'up' : null;
      if (h && v) { if (player.dir !== h && player.dir !== v) player.dir = v; } else player.dir = h || v;
    }
    player.moving = player.x !== ox || player.y !== oy;
    player.walkT = player.moving ? player.walkT + dt : 0;
    if (player.moving) { trail.push([player.x, player.y]); if (trail.length > 40) trail.shift(); }

    if (combat) {
      const a = player.aim;
      player.dir = Math.abs(Math.cos(a)) > 0.7 ? (Math.cos(a) > 0 ? 'right' : 'left') : (Math.sin(a) > 0 ? 'down' : 'up');
      if (!player.roll && (mouse.down || autoAim) && player.fireCd <= 0) {
        player.fireCd = 0.16;
        const sx = player.x + Math.cos(a) * 9, sy = player.y - 6 + Math.sin(a) * 9;
        pBullets.push({ x: sx, y: sy, vx: Math.cos(a) * 240, vy: Math.sin(a) * 240, life: 1.2, color: CONFETTI[Math.floor(Math.random() * 6)] });
        SFX.shoot();
      }
    }

    if (actionQueued) { actionQueued = false; if (!inCombat()) { interact(); return; } }

    // Nudge the player about sealed doors they walk into.
    if ((mx || my) && gateMsgCd <= 0 && !player.moving) {
      const [tx, ty] = frontTile();
      const ch = map[ty]?.[tx];
      if (isDoorCh(ch) && doorLocked(ch) && doors[ch]?.gate) { gateMessage(ch); return; }
    }

    const tc = map[Math.floor(player.y / TILE)]?.[Math.floor(player.x / TILE)];
    if (isDoorCh(tc) && !doorLocked(tc)) {
      const d = doors[tc];
      gotoRoom(d.to, d.toDoor);
    }
  }

  function updateDog(dt) {
    if (!save.hasDog) return;
    dog.idle = player.moving ? 0 : dog.idle + dt;
    const tgt = trail.length > 14 ? trail[trail.length - 15] : null;
    dog.moving = false;
    if (!tgt) return;
    if (Math.abs(tgt[0] - dog.x) > 0.3) dog.flip = tgt[0] < dog.x;
    dog.moving = dog.x !== tgt[0] || dog.y !== tgt[1];
    dog.x = tgt[0]; dog.y = tgt[1];
  }

  function updateEnemies(dt) {
    for (const e of enemies) {
      e.hurt -= dt;
      e.t -= dt;
      if (e.t > 0) continue;
      e.moveT -= dt;
      if (e.moveT <= 0) {
        e.moveT = rand(0.8, 2);
        const toP = Math.atan2(player.y - e.y, player.x - e.x);
        const a = Math.random() < 0.6 ? toP + rand(-0.8, 0.8) : rand(0, Math.PI * 2);
        const sp = Math.random() < 0.25 ? 0 : 24;
        e.vx = Math.cos(a) * sp; e.vy = Math.sin(a) * sp;
      }
      moveBody(e, e.vx * dt, e.vy * dt);
      e.shootT -= dt;
      if (e.shootT <= 0) {
        e.shootT = rand(2.2, 3.6);
        const a = api.aim(e.x, e.y - 6);
        if (e.kind === 'note') for (let i = -1; i <= 1; i++) api.shoot(e.x, e.y - 6, a + i * 0.28, 60, 'note');
        else if (e.kind === 'pebble') api.ring(e.x, e.y - 6, 8, 45, 'pebble', Math.random());
        else if (e.kind === 'vball') for (let i = 0; i < 2; i++) api.after(i * 0.3, () => api.shoot(e.x, e.y - 6, api.aim(e.x, e.y - 6), 75, 'ball', { r: 4 }));
        else api.shoot(e.x, e.y - 6, a, 70, 'orb');
      }
      if (Math.hypot(e.x - player.x, e.y - player.y) < 11) hurt();
    }
  }

  function updateBoss(dt) {
    if (!boss || boss.dead || !boss.active) return;
    boss.t += dt;
    boss.hurt = Math.max(0, boss.hurt - dt);
    boss.phase2 = boss.hp < boss.max / 2;
    boss.def.move?.(boss, dt, api);
    boss.cool -= dt * (boss.phase2 ? 1.3 : 1) * (boss.hard ? 1.9 + boss.t / 25 : 1);   // hard mode keeps speeding up
    if (boss.cool <= 0) {
      const atks = boss.def.attacks;
      boss.cool = (atks[boss.atk++ % atks.length](boss, api) || 1) + boss.def.rest;
    }
    if (boss.def.hit(boss, player.x, player.y - 6)) hurt();
  }

  // Rooms with `rockRain` drop small rocks during fights (some aimed near the player).
  function updateRockRain(dt) {
    if (!room.rockRain || !inCombat() || (boss && !boss.active)) return;
    rockRainT -= dt;
    if (rockRainT > 0) return;
    rockRainT = rand(0.25, 0.5) / (boss?.phase2 ? 1.4 : 1) / (boss?.hard ? 2.2 : 1);
    let spot = null;
    if (Math.random() < 0.3) spot = [player.x + rand(-28, 28), player.y + rand(-24, 24)];
    else {
      for (let i = 0; i < 20 && !spot; i++) {
        const tx = Math.floor(rand(1, mapW - 1)), ty = Math.floor(rand(2, mapH - 1));
        if (map[ty][tx] === '.') spot = [tx * TILE + rand(3, 13), ty * TILE + rand(3, 13)];
      }
    }
    if (spot && !bulletBlocked(spot[0], spot[1])) api.hazardCircle(spot[0], spot[1], 8, { warn: 1.0, active: 0.2, style: 'pebble' });
  }

  function inHazard(h, x, y) {
    return h.shape === 'circle' ? Math.hypot(x - h.x, y - h.y) < h.r : x >= h.x && x < h.x + h.w && y >= h.y && y < h.y + h.h;
  }
  function updateHazards(dt) {
    for (const h of hazards) {
      h.t += dt;
      if (!h.fired && h.t >= h.warn) {
        h.fired = true;
        if (h.style === 'rock' || h.style === 'pebble') burst(h.x, h.y, h.style === 'rock' ? 6 : 3, '#8a8f99', 40);
      }
      if (h.fired && h.t < h.warn + h.active && inHazard(h, player.x, player.y - 2)) hurt();
    }
    hazards = hazards.filter((h) => h.t < h.warn + h.active + 0.3);
  }

  function updateBullets(dt) {
    const dmg = bulletDmg();
    pBullets = pBullets.filter((b) => {
      b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
      if (b.life <= 0) return false;
      if (bulletBlocked(b.x, b.y)) { burst(b.x, b.y, 2, b.color, 30); return false; }
      for (const e of enemies) {
        if (e.hp > 0 && Math.hypot(b.x - e.x, b.y - (e.y - 6)) < 8) {
          e.hp -= dmg; e.hurt = 0.1;
          burst(b.x, b.y, 2, '#fff2b0', 30);
          if (e.hp <= 0) {
            SFX.pop();
            burst(e.x, e.y - 6, 18);
            if (Math.random() < 0.3) pickups.push({ x: e.x, y: e.y, t: 0 });
          }
          return false;
        }
      }
      if (boss && boss.active && !boss.dead && boss.def.hit(boss, b.x, b.y)) { damageBoss(dmg, b.x, b.y); return false; }
      return true;
    });
    enemies = enemies.filter((e) => e.hp > 0);

    eBullets = eBullets.filter((b) => {
      b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
      if (b.life <= 0 || bulletBlocked(b.x, b.y)) return false;
      if (!player.roll && player.inv <= 0 && Math.hypot(b.x - player.x, b.y - (player.y - 5)) < b.r + 3) { hurt(); return false; }
      return true;
    });
  }

  function updatePickups(dt) {
    pickups = pickups.filter((p) => {
      p.t += dt;
      if (player.hp < maxHP() && Math.hypot(p.x - player.x, p.y - player.y) < 12) {
        player.hp++;
        SFX.pickup();
        floaters.push({ x: p.x, y: p.y - 12, text: '+1', life: 0.8, color: '#a7f070' });
        updateHUD();
        return false;
      }
      return true;
    });
  }

  function updateTimers(dt) {
    const due = [];
    timers = timers.filter((t) => { t.t -= dt; if (t.t <= 0) { due.push(t.fn); return false; } return true; });
    due.forEach((fn) => fn());
  }

  function update(dt) {
    gateMsgCd -= dt;
    hitSfxCd -= dt;
    updatePlayer(dt);
    if (uiOpen() || busy) return;
    updateDog(dt);
    updateTimers(dt);
    updateEnemies(dt);
    updateBoss(dt);
    updateHazards(dt);
    updateBullets(dt);
    updatePickups(dt);
    updateRockRain(dt);
    if (hadEnemies && !enemies.length && !save.cleared[roomId]) {
      save.cleared[roomId] = true;
      persist();
      eBullets = [];
      SFX.door();
      toast('Room cleared!');
    }
  }

  function updateFx(dt) {
    shake = Math.max(0, shake - dt * 20);
    particles = particles.filter((p) => { p.x += p.vx * dt; p.y += p.vy * dt; if (!p.noGrav) p.vy += 160 * dt; p.life -= dt; return p.life > 0; });
    floaters = floaters.filter((f) => { f.y -= 18 * dt; f.life -= dt; return f.life > 0; });
    if (scene === 'ending' && Math.random() < 0.6) spawnConfetti();
    confetti = confetti.filter((c) => { c.x += c.vx * dt + Math.sin(time * 3 + c.spin) * 0.3; c.y += c.vy * dt; return c.y < H + 5; });
  }

  // ------------------------------------------------------------------ render
  const hash = (x, y) => ((x * 73856093) ^ (y * 19349663)) >>> 0;

  function updateCamera() {
    const mw = mapW * TILE, mh = mapH * TILE;
    camX = mw <= W ? (mw - W) / 2 : clamp(player.x - W / 2, 0, mw - W);
    camY = mh <= H ? (mh - H) / 2 : clamp(player.y - 8 - H / 2, 0, mh - H);
  }

  function drawTiles(cx, cy) {
    const x0 = Math.max(0, Math.floor(cx / TILE)), y0 = Math.max(0, Math.floor(cy / TILE));
    const x1 = Math.min(mapW - 1, Math.floor((cx + W) / TILE)), y1 = Math.min(mapH - 1, Math.floor((cy + H) / TILE));
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const px = x * TILE, py = y * TILE, h = hash(x, y), c = map[y][x];
        if (theme.ground) {
          if (c === '#') { drawEdge(px, py, x, y); continue; }
          if (!isWallCh(c) && !isDoorCh(c)) { drawGround(px, py, x, y, c); continue; }
          if (isDoorCh(c) && !doorLocked(c)) { drawDoorPath(px, py, x, y); continue; }
        }
        if (c === 'N') {
          ctx.fillStyle = theme.carpet; ctx.fillRect(px, py, TILE, TILE);
          ctx.fillStyle = '#1a1c2c'; ctx.fillRect(px + 6, py, 4, TILE);
          ctx.fillStyle = '#f4f4f4'; ctx.fillRect(px + 7, py, 2, TILE);
          ctx.fillStyle = '#94b0c2'; for (let i = 1; i < 16; i += 3) ctx.fillRect(px + 7, py + i, 2, 1);
          if (map[y - 1]?.[x] !== 'N') { ctx.fillStyle = '#566c86'; ctx.fillRect(px + 5, py - 6, 6, 8); }
        } else if (c === 'R' || c === 'T') {
          drawGrass(px, py, x, y);
        } else if (c === 'h' || (theme.outdoor && c === '#')) {
          drawHedge(px, py, x, y, c === '#');
        } else if (theme.holds && isWallCh(c) && [1, 2, 3, 4].some((k) => map[y + k] && !isWallCh(map[y + k][x]) && !isDoorCh(map[y + k][x]))) {
          drawClimbWall(px, py, x, y);
        } else if (isWallCh(c)) {
          ctx.fillStyle = theme.wallTop;
          ctx.fillRect(px, py, TILE, TILE);
          ctx.fillStyle = theme.detail;
          if (h % 3 === 0) ctx.fillRect(px + (h % 11), py + 2 + (h % 7), 4, 1);
          if (h % 5 === 0) ctx.fillRect(px + 2 + (h % 9), py + 1 + (h % 5), 1, 3);
          const below = y + 1 < mapH ? map[y + 1][x] : '#';
          if (!isWallCh(below) && !isDoorCh(below)) {
            ctx.fillStyle = theme.wallFace;
            ctx.fillRect(px, py + 8, TILE, 8);
            ctx.fillStyle = theme.trim;
            ctx.fillRect(px, py + (theme.planks ? 15 : 8), TILE, 1);
          }
          if (c === 'w') drawWindow(px, py);
          if (c === 'o') drawDormDoor(px, py);
          if (c === 'q') drawWhiteboardTile(px, py, map[y][x - 1] !== 'q');
        } else if (isDoorCh(c)) {
          if (doorLocked(c)) {
            ctx.fillStyle = theme.wallFace;
            ctx.fillRect(px, py, TILE, TILE);
            ctx.fillStyle = '#94b0c2';
            for (let i = 2; i < 16; i += 4) ctx.fillRect(px + i, py, 2, TILE);
            if (doors[c]?.gate) {
              ctx.fillStyle = '#ffcd75'; ctx.fillRect(px + 5, py + 7, 6, 5);
              ctx.fillStyle = '#1a1c2c'; ctx.fillRect(px + 7, py + 9, 2, 2);
            }
          } else {
            ctx.fillStyle = '#07070c';
            ctx.fillRect(px, py, TILE, TILE);
          }
        } else {
          if (c === '=') { drawPavement(px, py, x, y); continue; }
          if (theme.outdoor) { drawGrass(px, py, x, y); continue; }
          ctx.fillStyle = (x + y) & 1 && !theme.planks ? theme.floorA : theme.floorB;
          ctx.fillRect(px, py, TILE, TILE);
          if (theme.planks && c !== '~') {
            ctx.fillStyle = theme.floorA;
            for (let i = 0; i < 3; i++) {
              ctx.fillRect(px, py + i * 5 + 1, TILE, 4);
              if (hash(x, y * 3 + i) % 3 === 0) { ctx.fillStyle = theme.floorB; ctx.fillRect(px + (hash(x, y * 3 + i) % 14) + 1, py + i * 5 + 1, 1, 4); ctx.fillStyle = theme.floorA; }
            }
          }
          if (c === '~' && theme.shag) {
            ctx.fillStyle = theme.carpet;
            ctx.fillRect(px, py, TILE, TILE);
            for (let i = 0; i < 10; i++) {
              const hh = hash(x * 16 + i, y * 16 + i * 7);
              ctx.fillStyle = hh % 2 ? '#ebd9b4' : '#c2a67a';
              ctx.fillRect(px + (hh % 15), py + ((hh >>> 4) % 15), 1, 2);
            }
          } else if (c === '~') {
            ctx.fillStyle = theme.carpet;
            ctx.fillRect(px, py, TILE, TILE);
            ctx.fillStyle = theme.trim;
            if (map[y - 1]?.[x] !== '~') ctx.fillRect(px, py + 1, TILE, 1);
            if (map[y + 1]?.[x] !== '~') ctx.fillRect(px, py + 14, TILE, 1);
            if (map[y][x - 1] !== '~') ctx.fillRect(px + 1, py, 1, TILE);
            if (map[y][x + 1] !== '~') ctx.fillRect(px + 14, py, 1, TILE);
          } else if (room.theme !== 'chess' && !theme.planks && h % 7 === 0) {
            ctx.fillStyle = 'rgba(0,0,0,.12)';
            ctx.fillRect(px + (h % 13), py + (h % 11), 2, 1);
          }
        }
      }
    }
  }

  const drawAt = (spr, x, feetY, o = {}) => drawSprite(ctx, spr, x - 8, feetY - 16, o);

  function drawRock(x, y) {
    ctx.fillStyle = '#1a1c2c'; ctx.fillRect(x - 6, y - 5, 12, 11);
    ctx.fillStyle = '#8a8f99'; ctx.fillRect(x - 5, y - 4, 10, 9);
    ctx.fillStyle = '#b5bac4'; ctx.fillRect(x - 4, y - 3, 4, 3);
  }
  function drawPebble(x, y) {
    ctx.fillStyle = '#1a1c2c'; ctx.fillRect(x - 3, y - 3, 7, 6);
    ctx.fillStyle = '#8a8f99'; ctx.fillRect(x - 2, y - 2, 5, 4);
    ctx.fillStyle = '#b5bac4'; ctx.fillRect(x - 2, y - 2, 2, 1);
  }
  function drawBall(x, y) {
    ctx.fillStyle = '#1a1c2c'; ctx.fillRect(x - 4, y - 5, 9, 11); ctx.fillRect(x - 5, y - 4, 11, 9);
    ctx.fillStyle = '#f4f4f4'; ctx.fillRect(x - 3, y - 4, 7, 9); ctx.fillRect(x - 4, y - 3, 9, 7);
    ctx.fillStyle = '#3b5dc9'; ctx.fillRect(x - 4, y - 1, 9, 2);
    ctx.fillStyle = '#ffcd75'; ctx.fillRect(x + 1, y - 4, 2, 9);
  }
  const falls = (h) => h.style === 'rock' || h.style === 'pebble' || h.style === 'vball';
  const fallDraw = (h) => (h.style === 'rock' ? drawRock : h.style === 'vball' ? drawBall : drawPebble);
  function drawHazard(h) {
    const p = Math.min(1, h.t / h.warn);
    if (!h.fired) {
      const a = 0.15 + 0.25 * p * (0.5 + 0.5 * Math.sin(time * 22)) + 0.1 * p;
      ctx.fillStyle = `rgba(255,50,80,${a})`;
      ctx.strokeStyle = 'rgba(255,80,110,.8)';
      if (h.shape === 'circle') {
        ctx.beginPath(); ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        if (falls(h)) {
          const r = (h.style === 'rock' ? 3 : 1.5) + p * (h.style === 'rock' ? 7 : 3.5);
          ctx.fillStyle = 'rgba(0,0,0,.4)';
          ctx.fillRect(h.x - r, h.y - r / 3, r * 2, (r * 2) / 3);
        }
      } else {
        ctx.fillRect(h.x + 1, h.y, h.w - 2, h.h);
      }
    }
  }
  function drawHazardTop(h) {
    const p = Math.min(1, h.t / h.warn);
    if (!h.fired) {
      if (falls(h) && p > 0.55) fallDraw(h)(h.x, h.y - ((1 - p) / 0.45) * 90);
      return;
    }
    const k = 1 - (h.t - h.warn) / (h.active + 0.3);
    if (h.style === 'key') {
      ctx.fillStyle = '#1a1c2c'; ctx.fillRect(h.x + 1, h.y, h.w - 2, h.h);
      ctx.fillStyle = '#f4f4f4'; ctx.fillRect(h.x + 2, h.y, h.w - 4, h.h);
      ctx.fillStyle = '#c2d0dc'; ctx.fillRect(h.x + h.w - 5, h.y, 3, h.h);
    } else if (h.style === 'rock') {
      drawRock(h.x, h.y);
    } else if (h.style === 'pebble' || h.style === 'vball') {
      fallDraw(h)(h.x, h.y);
    } else {
      ctx.fillStyle = `rgba(255,205,117,${0.85 * k})`;
      if (h.shape === 'circle') { ctx.beginPath(); ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2); ctx.fill(); }
      else ctx.fillRect(h.x, h.y, h.w, h.h);
    }
  }

  function drawEBullet(b) {
    const x = Math.round(b.x), y = Math.round(b.y);
    if (b.style === 'note') {
      ctx.fillStyle = '#1a1c2c'; ctx.fillRect(x - 4, y - 1, 6, 5); ctx.fillRect(x + 1, y - 8, 2, 8);
      ctx.fillStyle = '#ff4d6d'; ctx.fillRect(x - 3, y, 4, 3); ctx.fillRect(x + 3, y - 8, 3, 2);
    } else if (b.style === 'chalk') {
      ctx.fillStyle = 'rgba(244,244,244,.95)'; ctx.fillRect(x - 3, y - 3, 6, 6);
      ctx.fillStyle = 'rgba(244,244,244,.5)'; ctx.fillRect(x - 4, y - 2, 8, 4);
    } else if (b.style === 'pebble') {
      ctx.fillStyle = '#1a1c2c'; ctx.fillRect(x - 3, y - 3, 7, 6);
      ctx.fillStyle = '#b5bac4'; ctx.fillRect(x - 2, y - 2, 5, 4);
    } else if (b.style === 'ball') {
      drawBall(x, y);
    } else if (b.style === 'pawn') {
      drawSprite(ctx, SPR.pawn, x - 8, y - 11);
    } else {
      ctx.fillStyle = '#1a1c2c'; ctx.fillRect(x - 3, y - 4, 7, 9); ctx.fillRect(x - 4, y - 3, 9, 7);
      ctx.fillStyle = '#ff4d6d'; ctx.fillRect(x - 2, y - 3, 5, 7); ctx.fillRect(x - 3, y - 2, 7, 5);
      ctx.fillStyle = '#fff'; ctx.fillRect(x - 1, y - 1, 2, 2);
    }
  }

  function drawPlayer() {
    if (player.inv > 0 && !player.roll && Math.floor(time * 16) % 2) return;
    const set = player.dir === 'up' ? SPR.player.up : player.dir === 'down' ? SPR.player.down : SPR.player.side;
    const frame = player.moving ? set[Math.floor(player.walkT * 8) % 4] : set[0];
    const combat = inCombat() && (!boss || boss.active);
    const drawGun = () => {
      if (!combat || player.roll) return;
      ctx.save();
      ctx.translate(Math.round(player.x), Math.round(player.y - 5));
      ctx.rotate(player.aim);
      ctx.fillStyle = '#1a1c2c'; ctx.fillRect(3, -2, 9, 4);
      ctx.fillStyle = '#f4a3c4'; ctx.fillRect(4, -1, 7, 2);
      ctx.fillStyle = '#ffcd75'; ctx.fillRect(10, -1, 1, 2);
      ctx.restore();
    };
    if (player.roll) {
      const p = 1 - player.roll.t / player.roll.dur;
      ctx.save();
      ctx.translate(Math.round(player.x), Math.round(player.y - 4));
      ctx.rotate(p * Math.PI * 2 * (player.roll.dx < 0 ? -1 : 1));
      ctx.drawImage(frame, -8, -8);
      ctx.restore();
      return;
    }
    const gunBehind = combat && Math.sin(player.aim) < -0.2;
    if (gunBehind) drawGun();
    drawAt(frame, player.x, player.y + 4, { flip: player.dir === 'left' });
    if (!gunBehind) drawGun();
  }

  // ---- outdoor + special tiles
  function drawGrass(px, py, x, y) {
    ctx.fillStyle = theme.floorA;
    ctx.fillRect(px, py, TILE, TILE);
    for (let i = 0; i < 4; i++) {
      const hh = hash(x * 5 + i, y * 9 + i * 3);
      ctx.fillStyle = hh % 3 ? '#4c8a3c' : '#7ab85e';
      ctx.fillRect(px + (hh % 15), py + ((hh >>> 5) % 14), 1, 2);
    }
  }
  function drawPavement(px, py, x, y) {
    ctx.fillStyle = '#cfc9bd'; ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = '#b5ae9f'; ctx.fillRect(px + 15, py, 1, TILE); ctx.fillRect(px, py + 15, TILE, 1);
    const hh = hash(x, y);
    if (hh % 4 === 0) { ctx.fillStyle = '#bdb6a8'; ctx.fillRect(px + (hh % 12) + 2, py + ((hh >>> 4) % 12) + 2, 2, 1); }
  }
  function drawHedge(px, py, x, y, dark) {
    ctx.fillStyle = dark ? '#1f4a24' : '#2f6a32'; ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = dark ? '#2a5c2e' : '#3f8a3e';
    for (let i = 0; i < 4; i++) ctx.fillRect(px + i * 4, py + 1 + ((x + i) % 2), 4, 4);
    for (let i = 0; i < 3; i++) { const hh = hash(x * 3 + i, y * 7); ctx.fillRect(px + (hh % 13), py + 5 + ((hh >>> 4) % 8), 3, 2); }
    ctx.fillStyle = '#6fbf5a';
    const hh = hash(x, y);
    ctx.fillRect(px + (hh % 12) + 2, py + 2, 1, 1);
    if (!dark) { ctx.fillStyle = '#1a3a1e'; ctx.fillRect(px, py + 14, TILE, 2); }
  }
  function drawTree(t) {
    const px = t.tx * TILE, py = t.ty * TILE, hh = hash(t.tx, t.ty);
    const [dk, md, hi] = [['#2f6a32', '#3f8a3a', '#6fbf5a'], ['#8a2430', '#b8323c', '#e05a4a'], ['#a8581e', '#d9822b', '#f2b04a']][hh % 3];
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(px - 4, py + 12, 24, 4);
    ctx.fillStyle = '#1a1c2c'; ctx.fillRect(px + 5, py - 8, 6, 24);
    ctx.fillStyle = '#6b4226'; ctx.fillRect(px + 6, py - 8, 4, 23);
    const blob = (x, y, r, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(px + x, py + y, r, 0, Math.PI * 2); ctx.fill(); };
    blob(8, -16, 15, '#1a1c2c'); blob(-1, -9, 10, '#1a1c2c'); blob(17, -9, 10, '#1a1c2c');
    blob(8, -16, 14, dk); blob(-1, -9, 9, dk); blob(17, -9, 9, dk);
    blob(7, -18, 10, md); blob(1, -11, 6, md); blob(15, -11, 6, md);
    blob(4, -22, 4, hi); blob(12, -15, 3, hi);
  }
  function drawWhiteboardTile(px, py, left) {
    const R = (c, x, y, w, h) => { ctx.fillStyle = c; ctx.fillRect(px + x, py + y, w, h); };
    R('#1a1c2c', left ? 0 : -1, -7, left ? 17 : 17, 19);
    R('#c2c8d0', left ? 1 : 0, -6, 16, 17);
    R('#fbfbf8', left ? 2 : 0, -5, left ? 14 : 15, 14);
    if (left) { for (const [x, h] of [[4, 4], [7, 7], [10, 5], [13, 9]]) R('#2b5fd9', x, 7 - h, 2, h); R('#222', 3, 8, 12, 1); }
    else { for (const [x, y] of [[2, 1], [5, 3], [8, 0], [10, 4], [12, 2], [4, 5]]) R('#d93a3a', x, y, 2, 2); R('#222', 1, 8, 13, 1); R('#222', 1, -4, 1, 13); }
    R('#94b0c2', left ? 3 : 0, 11, left ? 13 : 13, 2);
  }

  // Hand-drawn whiteboard charts for the polls.
  function drawPoll(poll) {
    const cv = document.createElement('canvas');
    cv.width = 420; cv.height = 240;
    const g = cv.getContext('2d');
    let seed = 7;
    const jit = () => { seed = (seed * 9301 + 49297) % 233280; return (seed / 233280 - 0.5) * 2.4; };
    const line = (x0, y0, x1, y1, col, w = 3) => {
      g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round';
      g.beginPath(); g.moveTo(x0 + jit(), y0 + jit());
      g.quadraticCurveTo((x0 + x1) / 2 + jit(), (y0 + y1) / 2 + jit(), x1 + jit(), y1 + jit());
      g.stroke();
    };
    g.fillStyle = '#fbfbf8'; g.fillRect(0, 0, cv.width, cv.height);
    g.font = '22px VT323, monospace'; g.textAlign = 'center'; g.fillStyle = '#222';
    const L = 60, B = 195, R = 400, T = 20;
    line(L, B, R, B, '#222'); line(L, B, L, T, '#222');
    if (poll.type === 'histogram') {
      const n = poll.counts.length, max = Math.max(...poll.counts), bw = (R - L - 20) / n;
      poll.counts.forEach((v, i) => {
        const x = L + 12 + i * bw, h = (v / max) * (B - T - 25), top = B - h;
        line(x, B, x, top, '#2b5fd9'); line(x, top, x + bw - 14, top, '#2b5fd9'); line(x + bw - 14, top, x + bw - 14, B, '#2b5fd9');
        for (let yy = B - 8; yy > top + 4; yy -= 9) line(x + 3, yy, x + bw - 17, yy - 6, '#6f95ea', 2);
        g.fillStyle = '#222'; g.fillText(poll.labels[i], x + (bw - 14) / 2, B + 24);
        g.fillStyle = '#d93a3a'; g.fillText(String(v), x + (bw - 14) / 2, top - 6);
      });
      g.save(); g.translate(22, (B + T) / 2); g.rotate(-Math.PI / 2); g.fillStyle = '#222'; g.fillText('# of people', 0, 0); g.restore();
    } else {
      const sx = (v) => L + 10 + (v / poll.xMax) * (R - L - 20), sy = (v) => B - 10 - (v / poll.yMax) * (B - T - 20);
      for (const [x, y] of poll.points) {
        const px = sx(x), py = sy(y);
        line(px - 5, py - 5, px + 5, py + 5, '#d93a3a', 3); line(px - 5, py + 5, px + 5, py - 5, '#d93a3a', 3);
      }
      for (let v = 0; v <= poll.xMax; v += 2) { g.fillStyle = '#222'; g.fillText(String(v), sx(v), B + 20); }
      for (let v = 0; v <= poll.yMax; v += 2) { g.fillText(String(v), L - 16, sy(v) + 6); }
      g.fillText(poll.x, (L + R) / 2, B + 42 > cv.height ? cv.height - 2 : B + 40);
      g.save(); g.translate(18, (B + T) / 2); g.rotate(-Math.PI / 2); g.fillText(poll.y, 0, 0); g.restore();
    }
    cv.className = 'chart';
    return cv;
  }

  function drawDormDoor(px, py) {
    const R = (c, x, y, w, h) => { ctx.fillStyle = c; ctx.fillRect(px + x, py + y, w, h); };
    R('#1a1c2c', 2, -6, 12, 22); R('#8a5a36', 3, -5, 10, 21); R('#7a4a2a', 4, -3, 8, 7); R('#7a4a2a', 4, 6, 8, 8);
    R('#f4f4f4', 6, -4, 4, 2); R('#ffcd75', 11, 5, 1, 2);
  }
  const HOLD_COLORS = ['#e84a5f', '#f7b32b', '#2bb3f7', '#6fcf5a', '#b76cf2', '#ff8c42', '#ff5fa2'];
  function drawClimbWall(px, py, x, y) {
    ctx.fillStyle = theme.wallTop; ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = theme.detail; ctx.fillRect(px + 15, py, 1, TILE);
    if (y % 2 === 0) ctx.fillRect(px, py, TILE, 1);
    for (let i = 0; i < 2; i++) {
      const hh = hash(x * 13 + i * 5, y * 17 + i);
      if (hh % 3 === 0 && i) continue;
      const hx = px + 2 + (hh % 10), hy = py + 2 + ((hh >>> 4) % 10), w = 3 + (hh % 2), c = HOLD_COLORS[(hh >>> 8) % HOLD_COLORS.length];
      ctx.fillStyle = '#1a1c2c'; ctx.fillRect(hx - 1, hy - 1, w + 2, 5);
      ctx.fillStyle = c; ctx.fillRect(hx, hy, w, 3);
      ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(hx, hy, 1, 1);
    }
    const below = map[y + 1]?.[x];
    if (below && !isWallCh(below) && !isDoorCh(below)) {
      ctx.fillStyle = theme.wallFace; ctx.fillRect(px, py + 12, TILE, 4);
    }
  }

  // Roble Hall: ivy-covered facade, windows, portico, arched entrance. Pre-rendered once per room.
  function buildFacade() {
    let x0 = Infinity, y0 = Infinity, x1 = -1, y1 = -1;
    for (let y = 0; y < mapH; y++) for (let x = 0; x < mapW; x++) {
      if (map[y][x] !== 'R' && !(isDoorCh(map[y][x]) && map[y - 1]?.[x] === 'R')) continue;
      x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
    }
    if (x1 < 0) return null;
    const W2 = (x1 - x0 + 1) * TILE, H2 = (y1 - y0 + 1) * TILE;
    const c = document.createElement('canvas'); c.width = W2; c.height = H2 + 14;
    const g = c.getContext('2d');
    const R = (col, x, y, w, h) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
    const doorTiles = Object.values(doors).flatMap((d) => d.tiles).filter(([x, y]) => y === y1 && x >= x0 && x <= x1);
    const cx = doorTiles.length ? (doorTiles.reduce((a, [x]) => a + x, 0) / doorTiles.length - x0) * TILE + 8 : W2 / 2;
    // roof + stucco wall
    R('#3e3a44', 0, 0, W2, 9); R('#57525e', 0, 7, W2, 2);
    R('#c7a58c', 0, 9, W2, H2 - 9); R('#e0cbb6', 0, 9, W2, 2);
    for (let i = 0; i < 400; i++) { const hh = hash(i, 91); R(hh % 2 ? '#b8967e' : '#d2b39b', hh % W2, 11 + ((hh >>> 7) % (H2 - 12)), 2, 1); }
    // ivy (green, with autumn red toward the edges)
    for (let y = 11; y < H2 - 2; y += 3) {
      for (let x = 0; x < W2; x += 3) {
        const hh = hash(x * 7 + 3, y * 13 + 5), fx = x / W2;
        const nearDoor = Math.abs(x - cx) < 34;
        const dens = nearDoor ? 10 : fx < 0.35 ? 70 - fx * 60 : fx > 0.7 ? 55 : 35 + (y / H2) * 25;
        if (hh % 100 >= dens) continue;
        const red = (fx < 0.18 || fx > 0.78) && hh % 3 === 0;
        R(red ? ['#8e2230', '#b8323c', '#d9544c'][hh % 3] : ['#2f6a32', '#3f7a3a', '#4f9a44'][hh % 3], x, y, 3, 3);
      }
    }
    // windows (three floors), lit ones glow warm
    for (const wy of [16, 42, 68]) {
      for (let wx = 10; wx < W2 - 16; wx += 28) {
        if (Math.abs(wx + 6 - cx) < 40) continue;
        const lit = hash(wx, wy) % 3 === 0;
        R('#1a1c2c', wx - 1, wy - 1, 14, 18); R('#f4f4f4', wx, wy, 12, 16);
        R(lit ? '#ffd27a' : '#3d4c5c', wx + 1, wy + 1, 10, 14);
        R('#f4f4f4', wx + 5, wy + 1, 2, 14); R('#f4f4f4', wx + 1, wy + 7, 10, 1);
      }
    }
    // center: windows above the portico
    for (const wy of [14, 40]) { R('#1a1c2c', cx - 8, wy - 1, 16, 18); R('#f4f4f4', cx - 7, wy, 14, 16); R('#ffd27a', cx - 6, wy + 1, 12, 14); R('#f4f4f4', cx - 1, wy + 1, 2, 14); }
    // portico: columns, balcony, arch
    const stone = '#e3d2bf', shade = '#c9b39c';
    R(stone, cx - 34, 58, 68, 5); R(shade, cx - 34, 62, 68, 1);
    for (let i = 0; i < 16; i++) R(shade, cx - 31 + i * 4, 52, 2, 6);
    R(stone, cx - 34, 50, 68, 2);
    for (const px of [cx - 30, cx + 22]) { R('#1a1c2c', px - 1, 63, 10, H2 - 63); R(stone, px, 63, 8, H2 - 63); R(shade, px + 6, 63, 2, H2 - 63); }
    R(stone, cx - 20, 63, 40, H2 - 63);
    R('#ffcd75', cx - 18, 64, 36, 7); R('#7a4a2a', cx - 17, 65, 34, 5);
    g.font = '5px "Press Start 2P", monospace'; g.fillStyle = '#ffcd75'; g.textAlign = 'center'; g.fillText('ROBLE HALL', cx, 70);
    for (let i = 0; i < 6; i++) R('#ffcd75', cx - 12 + i * 2, 72 + (i < 3 ? 3 - i : i - 2), 24 - i * 4 > 0 ? 24 - i * 4 : 2, 1);
    R('#1a1c2c', cx - 14, 74, 28, H2 - 74); R('#f4f0e8', cx - 13, 75, 26, H2 - 75);
    for (let yy = 77; yy < H2 - 2; yy += 5) for (const xx of [cx - 11, cx - 5, cx + 1, cx + 7]) R('#ffe3a3', xx, yy, 4, 3);
    R('#c9b39c', cx - 1, 75, 2, H2 - 75);
    // steps + white railings below the door
    for (let i = 0; i < 3; i++) { R('#d8d2c6', cx - 18, H2 + i * 4, 36, 4); R('#b5ae9f', cx - 18, H2 + i * 4 + 3, 36, 1); }
    R('#f4f4f4', cx - 20, H2 - 2, 1, 14); R('#f4f4f4', cx + 19, H2 - 2, 1, 14);
    R('#f4f4f4', cx - 20, H2 - 2, 3, 1); R('#f4f4f4', cx + 17, H2 - 2, 3, 1);
    return { img: c, x: x0 * TILE, y: y0 * TILE };
  }

  function drawZ(x, y) {
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = '#f4f4f4';
    const zt = (time * 0.8) % 1;
    ctx.globalAlpha = 1 - zt;
    ctx.fillText('z', x + zt * 4, y - zt * 10);
    ctx.globalAlpha = 1;
  }

  function drawWindow(px, py) {
    const R = (c, x, y, w, h) => { ctx.fillStyle = c; ctx.fillRect(px + x, py + y, w, h); };
    R('#1a1c2c', 1, 1, 14, 14); R('#f4f4f4', 2, 2, 12, 12); R('#8fc8ee', 3, 3, 10, 10);
    R('#c9e6f7', 4, 4, 3, 2); R('#f4f4f4', 7, 3, 2, 10); R('#f4f4f4', 3, 7, 10, 1);
  }

  function drawFurniture(f) {
    const px = f.tx * TILE, py = f.ty * TILE;
    const R = (c, x, y, w, h) => { ctx.fillStyle = c; ctx.fillRect(px + x, py + y, w, h); };
    const K = '#1a1c2c', wood = '#8a5a36', dark = '#5a3219', mid = '#6e4428';
    if (f.kind === 'bike') {
      ctx.strokeStyle = K; ctx.lineWidth = 1.5;
      for (const wx of [2, 14]) { ctx.beginPath(); ctx.arc(px + wx, py + 10, 5, 0, Math.PI * 2); ctx.stroke(); }
      R('#3b5dc9', 2, 9, 12, 1); R('#3b5dc9', 7, 4, 1, 6); R('#3b5dc9', 5, 4, 5, 1); R('#3b5dc9', 12, 3, 1, 7);
      R(K, 11, 2, 4, 1); R(K, 6, 3, 3, 1);
    } else if (f.kind === 'piano') {
      R(K, 0, -19, 48, 35); R('#5a3219', 1, -18, 46, 33); R('#7a4a2a', 3, -16, 42, 13);   // body + panel
      R(K, 16, -14, 16, 8); R('#f4f4f4', 17, -13, 14, 6);                                   // sheet music
      for (const y of [-11, -9]) R('#94b0c2', 18, y, 12, 1);
      R(K, 1, 0, 46, 8); R('#f4f4f4', 2, 1, 44, 6);                                          // keyboard
      for (let i = 0; i < 14; i++) { R('#c2d0dc', 4 + i * 3, 1, 1, 6); if (i % 7 !== 2 && i % 7 !== 6) R(K, 5 + i * 3, 1, 2, 3); }
      R(K, 3, 8, 4, 8); R('#5a3219', 4, 8, 2, 7); R(K, 41, 8, 4, 8); R('#5a3219', 42, 8, 2, 7); // legs
    } else if (f.kind === 'bed') {
      R(K, 0, -9, 32, 57); R(dark, 1, -8, 30, 11); R(wood, 2, -7, 28, 8);             // headboard
      R(wood, 1, 3, 30, 44); R('#efe9df', 3, 3, 26, 40);                               // frame + sheet
      R(K, 6, 4, 20, 9); R('#ffffff', 7, 5, 18, 7); R('#e2ddd3', 7, 10, 18, 2);         // pillow
      R(K, 3, 15, 26, 29); R('#b9b6aa', 3, 16, 26, 28);                                 // plaid blanket
      for (const x of [7, 15, 23]) R('#8f8d84', x, 16, 3, 28);
      for (const y of [21, 31]) R('#8f8d84', 3, y, 26, 3);
      for (const x of [11, 19]) R('#dcd8cc', x, 16, 1, 28);
      R('#dcd8cc', 3, 27, 26, 1); R('#dcd8cc', 3, 38, 26, 1);
      R(dark, 1, 44, 30, 4);                                                             // footboard
    } else if (f.kind === 'nightstand') {
      R(K, 1, -4, 14, 20); R(wood, 2, -3, 12, 18); R(mid, 2, -3, 12, 2);
      R(dark, 3, 5, 10, 1); R('#ffcd75', 7, 8, 2, 1);
      R(K, 6, -9, 4, 6); R('#94b0c2', 7, -8, 2, 5);                                      // lamp base
      R(K, 3, -15, 10, 7); R('#ffcd75', 4, -14, 8, 5); R('#fff2b0', 5, -13, 3, 2);       // shade
    } else if (f.kind === 'desk') {
      R(K, 0, -7, 32, 5); R(wood, 1, -6, 30, 3);                                         // top
      R(K, 1, -3, 5, 19); R(mid, 2, -3, 3, 18); R(K, 26, -3, 5, 19); R(mid, 27, -3, 3, 18);
      R(K, 16, -3, 11, 10); R(wood, 17, -3, 9, 9); R('#ffcd75', 20, 1, 3, 1);            // drawer
      R(K, 7, -13, 16, 7); R('#94b0c2', 8, -12, 14, 5); R('#41a6f6', 9, -11, 12, 3);     // laptop
      R(K, 5, -7, 20, 1);
    } else if (f.kind === 'dresser') {
      R(K, 0, -16, 32, 32); R(wood, 1, -15, 30, 30); R(mid, 1, -15, 30, 2);
      for (const y of [-6, 2, 9]) R(dark, 3, y, 26, 1);
      for (const y of [-10, -2, 5]) { R('#ffcd75', 9, y, 3, 1); R('#ffcd75', 20, y, 3, 1); }
    } else if (f.kind === 'grand') {
      // grand piano from above: keyboard facing down, curved side on the right, lid propped open
      ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(px + 2, py + 40, 46, 8);
      ctx.fillStyle = K;
      ctx.beginPath(); ctx.moveTo(px + 1, py + 44); ctx.lineTo(px + 1, py - 10); ctx.quadraticCurveTo(px + 14, py - 16, px + 24, py - 4);
      ctx.quadraticCurveTo(px + 30, py + 8, px + 47, py + 18); ctx.lineTo(px + 47, py + 44); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#23232d';
      ctx.beginPath(); ctx.moveTo(px + 3, py + 34); ctx.lineTo(px + 3, py - 8); ctx.quadraticCurveTo(px + 14, py - 13, px + 22, py - 3);
      ctx.quadraticCurveTo(px + 29, py + 10, px + 45, py + 20); ctx.lineTo(px + 45, py + 34); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#3a3a48';                                                       // propped lid
      ctx.beginPath(); ctx.moveTo(px + 3, py - 8); ctx.lineTo(px - 6, py + 2); ctx.lineTo(px - 6, py + 26); ctx.lineTo(px + 3, py + 32); ctx.closePath(); ctx.fill();
      R('#5a5a6a', 5, -4, 1, 30); R('#5a5a6a', 12, -9, 6, 1);                           // shine
      R('#b08a50', 14, 12, 18, 10); R('#8a6a3a', 15, 13, 16, 8);                         // strings/soundboard glimpse
      for (let i = 0; i < 6; i++) R('#d8c080', 16 + i * 3, 13, 1, 8);
      R(K, 10, 26, 28, 6); R('#f4f4f4', 11, 27, 26, 4);                                  // music stand
      R(K, 1, 34, 46, 10); R('#f4f4f4', 2, 35, 44, 8);                                   // keyboard
      for (let i = 0; i < 15; i++) { R('#c2d0dc', 2 + i * 3, 35, 1, 8); if (i % 7 !== 2 && i % 7 !== 6) R(K, 3 + i * 3, 35, 2, 4); }
      R(K, 12, 47, 24, 6); R('#3a2a1e', 13, 48, 22, 4);                                  // bench
    } else if (f.kind === 'airbed') {
      // a sad, flat air mattress: sagging outline, wrinkles, a pillow and a kicked-off blanket
      ctx.fillStyle = K;
      ctx.beginPath(); ctx.moveTo(px + 2, py + 4); ctx.lineTo(px + 44, py + 2); ctx.lineTo(px + 47, py + 14); ctx.lineTo(px + 45, py + 29);
      ctx.lineTo(px + 24, py + 31); ctx.lineTo(px + 3, py + 28); ctx.lineTo(px + 1, py + 16); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#3b5a8a';
      ctx.beginPath(); ctx.moveTo(px + 3, py + 5); ctx.lineTo(px + 43, py + 3); ctx.lineTo(px + 46, py + 14); ctx.lineTo(px + 44, py + 28);
      ctx.lineTo(px + 24, py + 30); ctx.lineTo(px + 4, py + 27); ctx.lineTo(px + 2, py + 16); ctx.closePath(); ctx.fill();
      for (const [x, y, w] of [[6, 9, 14], [20, 14, 18], [8, 20, 12], [26, 23, 14], [31, 7, 10]]) { R('#2c4470', x, y, w, 1); R('#5a7ab0', x + 1, y - 1, w - 3, 1); }
      R('#2c4470', 16, 4, 1, 24); R('#2c4470', 33, 4, 1, 25);
      R(K, 40, 24, 4, 3); R('#8a8f99', 41, 25, 2, 1);                                       // valve
      R(K, 4, 6, 12, 8); R('#e8e4da', 5, 7, 10, 6); R('#cfc9bd', 5, 11, 10, 2);           // pillow
      R(K, 22, 17, 20, 12); R('#b13e53', 23, 18, 18, 10); R('#8e2230', 23, 23, 18, 2); R('#c84e63', 25, 19, 8, 1);   // blanket
    } else if (f.kind === 'umbrella') {
      ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(px + 12, py + 13, 14, 5, 0, 0, Math.PI * 2); ctx.fill();
      R(K, 7, -14, 3, 30); R('#f4f4f4', 8, -14, 1, 29);
      const cols = hash(f.tx, f.ty) % 2 ? ['#ef7d57', '#f4f4f4'] : ['#41a6f6', '#ffcd75'];
      for (let i = 0; i < 6; i++) {
        ctx.fillStyle = cols[i % 2];
        ctx.beginPath(); ctx.moveTo(px + 8, py - 12); ctx.arc(px + 8, py - 12, 14, Math.PI + (i * Math.PI) / 6, Math.PI + ((i + 1) * Math.PI) / 6); ctx.closePath(); ctx.fill();
      }
      ctx.strokeStyle = K; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(px + 8, py - 12, 14, Math.PI, 0); ctx.stroke();
      R(K, 7, -26, 3, 3);
    } else if (f.kind === 'chesstable') {
      ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(px - 3, py + 12, 22, 4);
      for (const sx of [-5, 16]) { R(K, sx, 4, 5, 9); R('#8a5a36', sx + 1, 5, 3, 7); }            // stools
      R(K, 6, 2, 4, 14); R('#6e4428', 7, 2, 2, 13);                                                 // leg
      R(K, 0, -4, 16, 9); R('#b9a98c', 1, -3, 14, 7);
      for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) if ((i + j) % 2) R('#5a3219', 2 + i * 3, -2 + j * 2, 3, 2); else R('#f0e0c0', 2 + i * 3, -2 + j * 2, 3, 2);
      R('#f4f4f4', 4, -6, 2, 3); R('#1a1c2c', 11, -6, 2, 3); R(K, 8, -5, 2, 2);                    // pieces
    } else if (f.kind === 'lamp') {
      ctx.fillStyle = 'rgba(255,220,140,.12)'; ctx.beginPath(); ctx.arc(px + 8, py + 12, 16, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(px + 3, py + 13, 10, 3);
      R(K, 5, 10, 6, 5); R('#3a3a48', 6, 11, 4, 3);
      R(K, 7, -12, 2, 23);
      R(K, 3, -20, 10, 9); R('#ffcd75', 4, -19, 8, 7); R('#fff2b0', 6, -18, 3, 4); R(K, 2, -21, 12, 2); R(K, 7, -23, 2, 2);
    } else if (f.kind === 'gifts') {
      R(K, 0, -4, 32, 6); R('#8a5a36', 1, -3, 30, 4); R(K, 2, 2, 3, 14); R(K, 27, 2, 3, 14);        // table
      const box = (x, y, w, h, c, rb) => { R(K, x - 1, y - 1, w + 2, h + 2); R(c, x, y, w, h); R(rb, x + (w >> 1), y, 2, h); R(rb, x, y + (h >> 1), w, 1); R(rb, x + (w >> 1) - 2, y - 3, 2, 2); R(rb, x + (w >> 1) + 2, y - 3, 2, 2); };
      box(2, -12, 10, 8, '#41a6f6', '#ffcd75'); box(14, -16, 8, 12, '#b13e53', '#f4f4f4'); box(24, -10, 7, 6, '#a7f070', '#b13e53'); box(16, -24, 6, 6, '#ffcd75', '#3b5dc9');
    } else if (f.kind === 'mats') {
      for (let i = 0; i < 3; i++) { R(K, 0, 2 - i * 4, 48, 8); R(i % 2 ? '#2c4fb8' : '#3b5dc9', 1, 3 - i * 4, 46, 6); R('#6f8ee6', 1, 3 - i * 4, 46, 1); }
      for (const x of [15, 31]) R('#223a78', x, -6, 1, 14);
    } else if (f.kind === 'plant') {
      R(K, 3, 5, 10, 11); R('#b13e53', 4, 6, 8, 9); R('#7a2238', 4, 6, 8, 2);           // pot
      R('#1f5c3a', 7, -2, 2, 8);
      for (const [x, y, w, h] of [[2, -6, 5, 5], [9, -8, 5, 6], [4, -12, 6, 6], [1, 0, 5, 4], [10, -1, 5, 4]]) {
        R(K, x - 1, y - 1, w + 2, h + 2);
      }
      for (const [x, y, w, h] of [[2, -6, 5, 5], [9, -8, 5, 6], [4, -12, 6, 6], [1, 0, 5, 4], [10, -1, 5, 4]]) {
        R('#38b764', x, y, w, h); R('#a7f070', x + 1, y + 1, 2, 1);
      }
    }
  }

  function drawPillar(p) {
    if (theme.pillar === 'tree') return drawTree(p);
    if (theme.pillar === 'palm') return drawPalm(p);
    if (theme.pillar === 'statue') return drawStatue(p);
    if (theme.pillar === 'boulder') return drawBoulder(p);
    if (theme.pillar === 'balloons') return drawBalloons(p);
    const px = p.tx * TILE, py = p.ty * TILE;
    ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(px + 1, py + 12, 15, 4);
    ctx.fillStyle = '#1a1c2c'; ctx.fillRect(px + 2, py - 13, 12, 29);
    ctx.fillStyle = theme.wallTop; ctx.fillRect(px + 3, py - 12, 10, 27);
    ctx.fillStyle = theme.wallFace; ctx.fillRect(px + 9, py - 12, 4, 27);
    ctx.fillStyle = theme.trim; ctx.fillRect(px + 1, py - 15, 14, 3); ctx.fillRect(px + 1, py + 12, 14, 3);
  }

  function render() {
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, W, H);
    if (!room) return;
    updateCamera();
    let cx = camX, cy = camY;
    if (shake > 0) { cx += rand(-0.5, 0.5) * shake; cy += rand(-0.5, 0.5) * shake; }
    cx = Math.round(cx); cy = Math.round(cy);

    ctx.save();
    ctx.translate(-cx, -cy);
    drawTiles(cx, cy);
    if (facade) ctx.drawImage(facade.img, facade.x, facade.y);
    if (theme.sun) drawSunlight();
    hazards.forEach(drawHazard);

    for (const p of pickups) drawSprite(ctx, SPR.heart, p.x - 6, p.y - 12 + Math.sin(time * 5 + p.t) * 1.5, { scale: 0.75 });

    const actors = [];
    for (const c of chests) {
      actors.push([c.ty * TILE + 15, () => {
        const opened = !!save.opened[c.id];
        drawSprite(ctx, opened ? SPR.chestOpen : SPR.chest, c.tx * TILE, c.ty * TILE);
        if (!opened && Math.floor(time * 2 + c.tx) % 3 === 0) {
          ctx.fillStyle = '#fff2b0';
          ctx.fillRect(c.tx * TILE + 3 + (hash(c.tx, c.ty) % 10), c.ty * TILE + 2, 1, 1);
        }
      }]);
    }
    for (const s of stars) {
      actors.push([s.ty * TILE + 15, () => {
        const g = 0.5 + 0.5 * Math.sin(time * 4);
        ctx.fillStyle = `rgba(255,205,117,${0.15 + g * 0.2})`;
        ctx.beginPath(); ctx.arc(s.tx * TILE + 8, s.ty * TILE + 8, 10, 0, Math.PI * 2); ctx.fill();
        drawSprite(ctx, SPR.icons.star, s.tx * TILE, s.ty * TILE, { oy: Math.round(Math.sin(time * 3) * 2) - 2 });
      }]);
    }
    for (const s of signs) actors.push([s.ty * TILE + 15, () => drawSprite(ctx, SPR.sign, s.tx * TILE, s.ty * TILE)]);
    for (const p of pillars) actors.push([p.ty * TILE + 15, () => drawPillar(p)]);
    for (const t of trees) actors.push([t.ty * TILE + 15, () => drawTree(t)]);
    for (const f of furniture) actors.push([(f.ty + f.h) * TILE - 1, () => drawFurniture(f)]);
    for (const n of npcs) {
      actors.push([(n.ty + (n.h || 1)) * TILE - 1, () => {
        const px = n.tx * TILE, py = n.ty * TILE;
        if (n.kind === 'dog') {
          drawSprite(ctx, SPR.dogLie, px, py);
          drawZ(px + 14, py + 4);
        } else if (n.kind === 'person') {
          drawSprite(ctx, SPR.people[n.variant].down[0], px, py, { oy: Math.round(Math.sin(time * 3 + n.tx) * 0.8) });
        } else if (n.kind === 'friend') {
          drawSprite(ctx, SPR.friend.down[0], px, py, { oy: Math.round(Math.sin(time * 3) * 0.8) });
        } else if (n.kind === 'cake') {
          // candles until the wish, then the cake gets eaten from the right, bite by bite
          const left = n.bites ? 1 - (n.bites - 1) / CAKE_BITES : 1, sw = Math.max(1, Math.round(14 * left));
          ctx.drawImage(SPR.cake, 0, 13, 16, 3, px, py + 26, 32, 6);
          ctx.drawImage(SPR.cake, 0, 5, 1 + sw, 8, px, py + 10, (1 + sw) * 2, 16);
          if (left < 1) { ctx.fillStyle = '#1a1c2c'; ctx.fillRect(px + (1 + sw) * 2, py + 10, 2, 16); }
          if (!n.bites) ctx.drawImage(SPR.cake, 0, 0, 16, 5, px, py, 32, 10);
        }
      }]);
    }
    for (const e of enemies) {
      actors.push([e.y, () => {
        if (e.hurt > 0 && Math.floor(time * 30) % 2) return;
        if (e.t > 0) ctx.globalAlpha = clamp(1 - e.t, 0.2, 1);
        drawAt(SPR[e.kind], e.x, e.y + 4 - Math.abs(Math.round(Math.sin(time * 8 + e.phase) * 2)), { flip: e.vx < 0 });
        ctx.globalAlpha = 1;
      }]);
    }
    if (save.hasDog) {
      actors.push([dog.y + 3.9, () => {
        if (dog.idle > 3) {
          drawAt(SPR.dogLie, dog.x, dog.y + 4, { flip: dog.flip });
          if (dog.idle > 8) drawZ(dog.x + (dog.flip ? -10 : 6), dog.y - 8);
        } else drawAt(SPR.dog, dog.x, dog.y + 4 - (dog.moving ? Math.abs(Math.round(Math.sin(time * 14) * 1.5)) : 0), { flip: dog.flip });
      }]);
    }
    actors.push([player.y + 4, drawPlayer]);
    if (boss && !boss.dead) actors.push([boss.y, () => boss.def.draw(ctx, boss, time, api)]);
    actors.sort((a, b) => a[0] - b[0]).forEach((a) => a[1]());

    hazards.forEach(drawHazardTop);
    eBullets.forEach(drawEBullet);
    for (const b of pBullets) {
      ctx.fillStyle = '#1a1c2c'; ctx.fillRect(Math.round(b.x) - 2, Math.round(b.y) - 2, 5, 5);
      ctx.fillStyle = b.color; ctx.fillRect(Math.round(b.x) - 1, Math.round(b.y) - 1, 3, 3);
    }
    for (const p of particles) { ctx.fillStyle = p.color; ctx.fillRect(Math.round(p.x), Math.round(p.y), 2, 2); }
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    for (const f of floaters) {
      ctx.fillStyle = '#000'; ctx.fillText(f.text, Math.round(f.x) + 1, Math.round(f.y) + 1);
      ctx.fillStyle = f.color; ctx.fillText(f.text, Math.round(f.x), Math.round(f.y));
    }
    ctx.textAlign = 'left';
    ctx.restore();

    if (inCombat() && mouse.seen && !uiOpen()) {
      const x = Math.round(mouse.sx), y = Math.round(mouse.sy);
      for (const [c, o] of [['#1a1c2c', 1], ['#f4f4f4', 0]]) {
        ctx.fillStyle = c;
        ctx.fillRect(x - 6 + o, y + o, 4, 1); ctx.fillRect(x + 3 + o, y + o, 4, 1);
        ctx.fillRect(x + o, y - 6 + o, 1, 4); ctx.fillRect(x + o, y + 3 + o, 1, 4);
      }
    }
    for (const c of confetti) {
      ctx.fillStyle = c.color;
      ctx.fillRect(Math.round(c.x), Math.round(c.y), c.w, Math.abs(Math.sin(time * 5 + c.spin)) * 3 + 1);
    }
  }

  // Title screen: the bedroom, dimmed, with confetti falling.
  let titleReady = false;
  function renderTitle() {
    if (!titleReady) {
      titleReady = true;
      const [sx, sy] = loadRoom('bedroom');
      player.x = sx * TILE + 8; player.y = sy * TILE + 8; player.dir = 'down';
      dog.x = 8 * TILE + 8; dog.y = 7 * TILE + 8; dog.idle = 99; dog.flip = true;
    }
    render();
    ctx.fillStyle = 'rgba(13,14,23,.5)';
    ctx.fillRect(0, 0, W, H);
    if (Math.random() < 0.3) spawnConfetti();
    for (const c of confetti) {
      ctx.fillStyle = c.color;
      ctx.fillRect(Math.round(c.x), Math.round(c.y), c.w, Math.abs(Math.sin(time * 5 + c.spin)) * 3 + 1);
    }
  }

  // ------------------------------------------------------------------ boot
  async function startGame(fresh) {
    if (scene !== 'title') return;
    SFX.unlock();
    if (fresh) {
      // ask with the button itself (browser confirm() popups can be blocked)
      const btn = $('btn-new');
      if (save.started && !btn.dataset.armed) {
        btn.dataset.armed = '1';
        btn.textContent = 'SURE? CLICK AGAIN';
        setTimeout(() => { delete btn.dataset.armed; btn.textContent = 'NEW GAME'; }, 4000);
        return;
      }
      save = freshSave();
      persist();
    }
    scene = 'play';
    confetti = [];
    $('title').classList.add('hidden');
    $('hud').classList.remove('hidden');
    const first = !save.started;
    save.started = true;
    player.hp = maxHP();
    if (first) {
      busy = true;
      $('fade').classList.add('on');
      await say(GIFT.intro);
    }
    await gotoRoom(save.room, null);
  }

  $('title-name').textContent = fill(GIFT.name);
  document.title = fill(GIFT.name) + "'s Birthday Quest";
  if (save.started) {
    $('btn-start').textContent = 'CONTINUE';
    $('btn-new').classList.remove('hidden');
  }
  $('btn-start').addEventListener('click', () => startGame(false));
  $('btn-new').addEventListener('click', () => startGame(true));
  $('modal').addEventListener('pointerdown', () => closeModal());

  function step(dt) {
    time += dt;
    if (scene === 'title') { updateFx(dt); renderTitle(); return; }
    updateDialog(dt);
    if (scene === 'piano' && recital) {
      updatePiano(dt);
      updateFx(dt);
      renderPiano();
      return;
    }
    if (scene === 'volley' && volley) {
      if (!uiOpen()) updateVolley(dt);
      updateFx(dt);
      renderVolley();
      return;
    }
    if (scene === 'climb' && climb) {
      if (!uiOpen()) updateClimb(dt);
      updateFx(dt);
      renderClimb();
      return;
    }
    if (!uiOpen() && !busy && scene === 'play') update(dt);
    updateFx(dt);
    render();
    $('wrap').classList.toggle('combat', inCombat() && !uiOpen());
  }
  let last = performance.now();
  function frame(now) {
    step(clamp((now - last) / 1000, 0, 0.05));
    last = now;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // Debug helpers (browser console): bq.goto('w1-boss'), bq.level(5), bq.reset()
  window.bq = {
    goto: (id, door = null) => { scene = 'play'; $('title').classList.add('hidden'); $('hud').classList.remove('hidden'); return gotoRoom(id, door); },
    level: (n) => { save.level = n; persist(); player.hp = maxHP(); updateHUD(); },
    reset: () => { localStorage.removeItem(SAVE_KEY); location.reload(); },
    tp: (tx, ty) => { player.x = tx * TILE + 8; player.y = ty * TILE + 8; },
    face: (d) => { player.dir = d; },
    hitBoss: (n = 9999) => { if (boss) damageBoss(n, boss.x, boss.y); },
    killAll: () => { enemies.forEach((e) => { e.hp = 0; }); enemies = []; },
    god: () => { player.inv = 99999; },
    openAll: () => { for (const id of Object.keys(CHESTS)) save.opened[id] = true; persist(); updateHUD(); },
    poll: (i) => showModal({ title: WHITEBOARD[i].question, chart: WHITEBOARD[i], kind: 'whiteboard' }),
    climb: (id) => runClimb(id),
    volley: (id = 'match') => runVolley(id),
    vb: () => volley,
    piano: (id) => runPiano(id),
    video: (src, caption) => playVideo(src, caption),
    rec: () => recital && { now: SFX.now() - recital.t0, gems: recital.gems, hits: recital.hits, misses: recital.misses, result: recital.result },
    ctp: (tx, ty) => { if (climb) { climb.p.x = tx * TILE + 8; climb.p.y = ty * TILE; climb.p.vy = 0; } },
    tick: (sec) => { for (let i = 0; i < sec * 60; i++) step(1 / 60); },
    get state() {
      return {
        room: roomId, save, player: { x: player.x, y: player.y, hp: player.hp, dir: player.dir },
        boss: boss && { hp: boss.hp, x: boss.x, y: boss.y, active: boss.active },
        enemies: enemies.length, eBullets: eBullets.length, doors: Object.fromEntries(Object.entries(doors).map(([k, d]) => [k, { ...d, locked: doorLocked(k) }])),
        chests: chests.map((c) => [c.tx, c.ty, c.id, !!save.opened[c.id]]), ui: uiOpen(), busy, dialog: dlg.active ? dlg.lines[dlg.i].text : null, climb: climb && { x: climb.p.x, y: climb.p.y, ground: climb.p.onGround, done: climb.done },
        volley: volley && { score: volley.score, ball: { ...volley.ball }, jadon: volley.players[0].x },
      };
    },
  };
})();
