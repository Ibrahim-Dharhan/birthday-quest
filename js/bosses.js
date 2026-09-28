// Gungeon-style bosses.
//   hp        - health. Player bullets do 1 damage at LV1, +0.3 per level.
//   hit(b,x,y)- is the point inside the boss's hitbox?
//   center(b) - where effects/auto-aim point
//   move()    - per-frame movement;  attacks[] - cycled in order, each returns its duration (sec)
//   draw()    - procedural art, so no image files are needed
//
// Helpers (G): player() -> [x,y], aim(x,y) -> angle to player, shoot(x,y,angle,speed,style,opts),
//   ring(x,y,n,speed,style,offset), hazardCircle(x,y,r,opts), hazardRect(x,y,w,h,opts),
//   after(sec,fn), shake(n), sfx, arena {x0,y0,x1,y1} in pixels.
// Bullet styles: note, chalk, pebble, pawn, orb, ball.
// To add a boss: copy one, give it a new key, add text in content.js BOSS_TEXT, and use it in world.js.

const rint = (n) => Math.floor(Math.random() * n);
const TAU = Math.PI * 2;

function blobArt(w, h, blobs, top, bottom) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  const inside = (x, y) => blobs.some(([cx, cy, rx, ry]) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!inside(x, y)) continue;
      const edge = !inside(x + 1, y) || !inside(x - 1, y) || !inside(x, y + 1) || !inside(x, y - 1);
      const shade = !inside(x, y + 5);
      g.fillStyle = edge ? '#1a1c2c' : shade ? bottom : top;
      if (!edge && ((x * 7 + y * 13) % 17 === 0)) g.fillStyle = bottom;
      if (!edge && y < 16 && ((x * 5 + y * 3) % 11 === 0)) g.fillStyle = '#f4f4f4'; // chalk
      g.fillRect(x, y, 1, 1);
    }
  }
  return c;
}

function knightArt() {
  const c = document.createElement('canvas'); c.width = 32; c.height = 48;
  const g = c.getContext('2d');
  g.fillStyle = '#2a2838'; g.strokeStyle = '#c2d0dc'; g.lineWidth = 1;
  const pts = [[9, 37], [11, 27], [5, 25], [2, 21], [3, 16], [10, 9], [12, 4], [14, 7], [16, 2], [18, 7], [24, 11], [28, 20], [28, 30], [25, 37]];
  g.beginPath();
  pts.forEach(([x, y], i) => (i ? g.lineTo(x + 0.5, y + 0.5) : g.moveTo(x + 0.5, y + 0.5)));
  g.closePath(); g.fill(); g.stroke();
  g.fillRect(7, 37, 18, 4); g.strokeRect(7.5, 37.5, 17, 3);
  g.fillRect(4, 41, 24, 6); g.strokeRect(4.5, 41.5, 23, 5);
  g.strokeStyle = '#566c86';
  g.beginPath(); g.moveTo(20, 10); g.lineTo(25, 22); g.moveTo(18, 13); g.lineTo(23, 27); g.stroke();
  g.fillStyle = '#ff4d6d'; g.fillRect(10, 13, 3, 2);
  g.fillStyle = '#1a1c2c'; g.fillRect(4, 19, 2, 1);
  return c;
}

// Giant volleyball: 3 coloured panels with seams, pre-rendered at 8 rotations.
function volleyballArt(r, rot) {
  const d = r * 2 + 2, c = document.createElement('canvas');
  c.width = c.height = d;
  const g = c.getContext('2d');
  const cols = ['#f4f4f4', '#ffcd75', '#3b5dc9'];
  for (let y = 0; y < d; y++) {
    for (let x = 0; x < d; x++) {
      const dx = x - r, dy = y - r, dist = Math.hypot(dx, dy);
      if (dist > r) continue;
      let a = Math.atan2(dy, dx) + rot + dist * 0.06;
      a = ((a % TAU) + TAU) % TAU;
      const sector = Math.floor(a / (TAU / 3)), edge = a % (TAU / 3);
      g.fillStyle = dist > r - 1.2 ? '#1a1c2c'
        : edge < 0.12 && dist > 3 ? '#29366f'
        : dy > r * 0.45 ? (sector === 0 ? '#c2d0dc' : sector === 1 ? '#d9a44f' : '#29366f')
        : cols[sector];
      g.fillRect(x, y, 1, 1);
    }
  }
  return c;
}
const BOSS_ART = {
  hold: blobArt(80, 44, [[40, 24, 36, 18], [22, 16, 18, 13], [58, 18, 18, 14]], '#ef7d57', '#b13e53'),
  knight: knightArt(),
  vball: Array.from({ length: 8 }, (_, i) => volleyballArt(20, (i / 8) * (TAU / 3))),
};

function drawEyes(ctx, G, ox, oy, lx, rx, y, pupil) {
  const [px, py] = G.player();
  const ex = Math.max(-1, Math.min(1, Math.round((px - (ox + 40)) / 40)));
  const ey = Math.max(0, Math.min(2, Math.round((py - (oy + 20)) / 50)));
  ctx.fillStyle = '#f4f4f4';
  ctx.fillRect(lx, y, 12, 8); ctx.fillRect(rx, y, 12, 8);
  ctx.fillStyle = pupil;
  ctx.fillRect(lx + 4 + ex * 2, y + 2 + ey, 4, 4); ctx.fillRect(rx + 4 + ex * 2, y + 2 + ey, 4, 4);
  ctx.fillStyle = '#1a1c2c';
  for (let i = 0; i < 14; i++) {
    ctx.fillRect(lx - 1 + i, y - 3 + Math.floor(i / 4), 1, 2);
    ctx.fillRect(rx + 12 - i, y - 3 + Math.floor(i / 4), 1, 2);
  }
}

const hurtWobble = (b, t) => (b.hurt > 0 ? Math.round(Math.sin(t * 80) * 2) : 0);

const BOSSES = {
  // ================================================================== PIANO
  piano: {
    name: 'THE GRAND PIANO', hp: 140, rest: 0.8,
    init(b) { b.homeX = 160; b.key = 0; b.keyT = 0; },
    move(b, dt) {
      b.x = b.homeX + Math.sin(b.t * (b.phase2 ? 0.8 : 0.5)) * 80;
      b.keyT -= dt;
      if (b.keyT <= 0) { b.key = rint(18); b.keyT = 0.1 + Math.random() * 0.2; }
    },
    hit: (b, x, y) => x > b.x - 38 && x < b.x + 38 && y > b.y - 46 && y < b.y - 2,
    center: (b) => [b.x, b.y - 24],
    attacks: [
      function notes(b, G) {
        const n = b.phase2 ? 7 : 5;
        for (let v = 0; v < 3; v++) {
          G.after(v * 0.55, () => {
            const a = G.aim(b.x, b.y - 6);
            for (let i = 0; i < n; i++) G.shoot(b.x, b.y - 6, a + (i - (n - 1) / 2) * 0.22, 75, 'note');
            G.sfx.pianoKey(7 + v * 4);
          });
        }
        return 1.6;
      },
      function rings(b, G) {
        const n = b.phase2 ? 18 : 14;
        for (let r = 0; r < 3; r++) {
          G.after(r * 0.6, () => { G.ring(b.x, b.y - 2, n, 55, 'note', r * 0.5); G.sfx.chord(r % 2); });
        }
        return 1.9;
      },
      function keys(b, G) {
        for (let k = 0; k < 2; k++) {
          G.after(k * 1.4, () => {
            const cols = new Set([Math.floor(G.player()[0] / 16)]);
            while (cols.size < (b.phase2 ? 6 : 4)) cols.add(1 + rint(18));
            for (const c of cols) G.hazardRect(c * 16, G.arena.y0, 16, G.arena.y1 - G.arena.y0, { warn: 1.1, style: 'key' });
            G.after(1.1, () => { G.sfx.chord(k); G.shake(2); });
          });
        }
        return 3.0;
      },
      function spiral(b, G) {
        const arms = b.phase2 ? 3 : 2, dur = 2.4;
        let a = 0;
        for (let s = 0; s < dur; s += 0.1) {
          G.after(s, () => {
            a += 0.33;
            for (let i = 0; i < arms; i++) G.shoot(b.x, b.y - 2, a + (i * TAU) / arms, 60, 'note');
          });
        }
        return dur + 0.5;
      },
    ],
    draw(ctx, b, t, G) {
      const ox = Math.round(b.x - 40), oy = Math.round(b.y - 48);
      ctx.save();
      ctx.translate(ox + hurtWobble(b, t), oy + Math.round(Math.sin(t * 3)));
      const R = (c, x, y, w, h) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
      R('rgba(0,0,0,.35)', 4, 46, 72, 3);
      R('#0b0b12', 8, 38, 5, 10); R('#0b0b12', 67, 38, 5, 10);
      R('#0b0b12', 2, 2, 76, 34); R('#262838', 3, 3, 74, 32); R('#3d4058', 4, 5, 72, 2);
      R('#0b0b12', 0, 0, 80, 5); R('#4a4e6a', 1, 1, 78, 3);
      drawEyes(ctx, G, ox, oy, 20, 48, 13, '#b13e53');
      R('#0b0b12', 30, 25, 20, 4);
      for (let i = 0; i < 5; i++) R('#f4f4f4', 31 + i * 4, 25, 3, 2);
      R('#0b0b12', 3, 35, 74, 9); R('#f4f4f4', 4, 36, 72, 7);
      for (let k = 0; k < 18; k++) {
        if (k === b.key) R('#ffcd75', 4 + k * 4, 36, 3, 7);
        R('#94b0c2', 7 + k * 4, 36, 1, 7);
        if ([0, 1, 3, 4, 5].includes(k % 7) && k < 17) R('#0b0b12', 6 + k * 4, 36, 3, 4);
      }
      ctx.restore();
    },
  },

  // ================================================================== CLIMBING HOLD
  hold: {
    name: 'THE CRIMP', hp: 220, rest: 0.8,
    init(b) { b.vx = 35; b.vy = 22; b.jump = null; },
    move(b, dt, G) {
      if (b.jump) {
        const j = b.jump;
        j.t += dt / 0.5;
        const e = Math.min(1, j.t);
        b.x = j.fx + (j.tx - j.fx) * e;
        b.y = j.fy + (j.ty - j.fy) * e;
        b.lift = Math.sin(e * Math.PI) * 40;
        if (j.t >= 1) { b.jump = null; b.lift = 0; }
        return;
      }
      const k = b.phase2 ? 1.5 : 1, a = G.arena;
      b.x += b.vx * k * dt; b.y += b.vy * k * dt;
      if (b.x < a.x0 + 40 || b.x > a.x1 - 40) { b.vx *= -1; b.x = Math.max(a.x0 + 40, Math.min(a.x1 - 40, b.x)); }
      if (b.y < a.y0 + 44 || b.y > a.y1 - 60) { b.vy *= -1; b.y = Math.max(a.y0 + 44, Math.min(a.y1 - 60, b.y)); }
    },
    hit: (b, x, y) => ((x - b.x) / 38) ** 2 + ((y - (b.y - 22 - (b.lift || 0))) / 22) ** 2 <= 1,
    center: (b) => [b.x, b.y - 22],
    attacks: [
      function chalk(b, G) {
        for (let r = 0; r < 2; r++) G.after(r * 0.7, () => { G.ring(b.x, b.y - 22, b.phase2 ? 16 : 12, 50, 'chalk', r * 0.5); G.sfx.puff(); });
        return 1.8;
      },
      function rockfall(b, G) {
        const a = G.arena;
        for (let w = 0; w < 2; w++) {
          G.after(w * 1.2, () => {
            const [px, py] = G.player();
            G.hazardCircle(px, py, 16, { warn: 1.2, style: 'rock' });
            for (let i = 0; i < (b.phase2 ? 7 : 5); i++) {
              G.hazardCircle(a.x0 + 16 + Math.random() * (a.x1 - a.x0 - 32), a.y0 + 16 + Math.random() * (a.y1 - a.y0 - 32), 16, { warn: 1.2 + Math.random() * 0.4, style: 'rock' });
            }
            G.after(1.2, () => { G.sfx.thud(); G.shake(2); });
          });
        }
        return 2.9;
      },
      function shotgun(b, G) {
        for (let v = 0; v < 3; v++) {
          G.after(v * 0.5, () => {
            const a = G.aim(b.x, b.y - 22);
            for (let i = -4; i <= 4; i++) G.shoot(b.x, b.y - 22, a + i * 0.14, 70 + Math.random() * 25, 'pebble');
            G.sfx.thud();
          });
        }
        return 1.7;
      },
      function slam(b, G) {
        const [px, py] = G.player();
        const a = G.arena;
        const tx = Math.max(a.x0 + 40, Math.min(a.x1 - 40, px)), ty = Math.max(a.y0 + 44, Math.min(a.y1 - 8, py + 20));
        G.hazardCircle(tx, ty - 20, 34, { warn: 1.2, style: 'impact' });
        G.after(0.7, () => { b.jump = { fx: b.x, fy: b.y, tx, ty, t: 0 }; });
        G.after(1.2, () => { G.ring(tx, ty - 20, b.phase2 ? 20 : 14, 55, 'pebble'); G.sfx.thud(); G.shake(5); });
        return 2.2;
      },
    ],
    draw(ctx, b, t, G) {
      const lift = b.lift || 0;
      const ox = Math.round(b.x - 40), oy = Math.round(b.y - 44);
      ctx.fillStyle = 'rgba(0,0,0,.3)';
      ctx.fillRect(ox + 10, oy + 40, 60, 5);
      const squish = Math.round(Math.sin(t * 2.5) * 1.5);
      ctx.save();
      ctx.translate(ox + hurtWobble(b, t), oy - Math.round(lift));
      ctx.drawImage(BOSS_ART.hold, 0, -squish, 80, 44 + squish);
      drawEyes(ctx, G, ox, oy, 18, 50, 14, '#1a1c2c');
      ctx.fillStyle = '#1a1c2c'; ctx.fillRect(35, 25, 10, 10);
      ctx.fillStyle = '#94b0c2'; ctx.fillRect(36, 26, 8, 8);
      ctx.fillStyle = '#333c57'; ctx.fillRect(38, 28, 4, 4);
      ctx.fillStyle = '#1a1c2c';
      for (let i = 0; i < 12; i++) ctx.fillRect(34 + i, 38 - (i < 3 || i > 8 ? 0 : 1), 1, 1);
      ctx.restore();
    },
  },

  // ================================================================== VOLLEYBALL
  vball: {
    name: 'THE BLOCKER', hp: 260, rest: 0.8,
    init(b) { b.vx = 55; b.vy = 38; b.jump = null; b.lift = 0; b.spin = 0; },
    move(b, dt, G) {
      const a = G.arena;
      if (b.jump) {
        const j = b.jump;
        j.t += dt / 0.7;
        const e = Math.min(1, j.t);
        b.x = j.fx + (j.tx - j.fx) * e;
        b.y = j.fy + (j.ty - j.fy) * e;
        b.lift = Math.sin(e * Math.PI) * 70;
        b.spin += dt * 30;
        if (j.t >= 1) { b.jump = null; b.lift = 0; }
        return;
      }
      const k = b.phase2 ? 1.4 : 1;
      b.x += b.vx * k * dt; b.y += b.vy * k * dt;
      b.spin += dt * 10 * Math.sign(b.vx);
      if (b.x < a.x0 + 24 || b.x > a.x1 - 24) { b.vx *= -1; b.x = Math.max(a.x0 + 24, Math.min(a.x1 - 24, b.x)); }
      if (b.y < a.y0 + 44 || b.y > a.y1 - 8) { b.vy *= -1; b.y = Math.max(a.y0 + 44, Math.min(a.y1 - 8, b.y)); }
    },
    hit: (b, x, y) => Math.hypot(x - b.x, y - (b.y - 20 - b.lift)) < 20,
    center: (b) => [b.x, b.y - 20 - b.lift],
    attacks: [
      function serve(b, G) {
        for (let v = 0; v < 3; v++) {
          G.after(v * 0.45, () => {
            const a = G.aim(b.x, b.y - 20 - b.lift);
            for (const off of b.phase2 ? [-0.25, 0, 0.25] : [0]) G.shoot(b.x, b.y - 20 - b.lift, a + off, 105, 'ball', { r: 4 });
            G.sfx.thud();
          });
        }
        return 1.5;
      },
      function spike(b, G) {
        const [px, py] = G.player(), a = G.arena;
        const tx = Math.max(a.x0 + 24, Math.min(a.x1 - 24, px)), ty = Math.max(a.y0 + 44, Math.min(a.y1 - 8, py + 16));
        G.hazardCircle(tx, ty - 16, 30, { warn: 1.2, style: 'impact' });
        G.after(0.5, () => { b.jump = { fx: b.x, fy: b.y, tx, ty, t: 0 }; });
        G.after(1.2, () => { G.ring(tx, ty - 16, b.phase2 ? 16 : 12, 60, 'ball'); G.sfx.thud(); G.shake(5); });
        return 2.2;
      },
      function bumpSet(b, G) {
        const [px, py] = G.player(), a = G.arena;
        const n = b.phase2 ? 7 : 5;
        for (let i = 0; i < n; i++) {
          const x = i === 0 ? px : a.x0 + 20 + Math.random() * (a.x1 - a.x0 - 40);
          const y = i === 0 ? py : a.y0 + 20 + Math.random() * (a.y1 - a.y0 - 40);
          G.hazardCircle(x, y, 12, { warn: 1.3 + i * 0.12, active: 0.2, style: 'vball' });
        }
        G.sfx.puff();
        return 2.3;
      },
      function net(b, G) {
        const a = G.arena;
        for (let w = 0; w < 2; w++) {
          G.after(w * 1.6, () => {
            const gap = a.y0 + 30 + Math.random() * (a.y1 - a.y0 - 60);
            const fromLeft = w % 2 === 0, x = fromLeft ? a.x0 + 6 : a.x1 - 6;
            for (let y = a.y0 + 8; y < a.y1; y += 16) if (Math.abs(y - gap) > 26) G.shoot(x, y, fromLeft ? 0 : Math.PI, 48, 'ball', { r: 4 });
            G.sfx.puff();
          });
        }
        return 3.2;
      },
    ],
    draw(ctx, b, t, G) {
      const s = Math.max(0.4, 1 - b.lift / 120);
      ctx.fillStyle = 'rgba(0,0,0,.35)';
      ctx.fillRect(Math.round(b.x - 16 * s), Math.round(b.y - 3), Math.round(32 * s), 4);
      if (b.hurt > 0 && Math.floor(t * 20) % 2) return;
      const frames = BOSS_ART.vball;
      const f = frames[((Math.floor(b.spin) % 8) + 8) % 8];
      const x = Math.round(b.x - 21), y = Math.round(b.y - 41 - b.lift);
      ctx.drawImage(f, x, y);
      // angry face stays upright while the ball spins
      const [px, py] = G.player();
      const ex = Math.max(-1, Math.min(1, Math.round((px - b.x) / 40)));
      const ey = Math.max(-1, Math.min(1, Math.round((py - b.y) / 40)));
      for (const sx of [13, 24]) {
        ctx.fillStyle = '#1a1c2c'; ctx.fillRect(x + sx - 1, y + 15, 7, 6);
        ctx.fillStyle = '#f4f4f4'; ctx.fillRect(x + sx, y + 16, 5, 4);
        ctx.fillStyle = '#b13e53'; ctx.fillRect(x + sx + 2 + ex, y + 17 + ey, 2, 2);
      }
      ctx.fillStyle = '#1a1c2c';
      for (let i = 0; i < 6; i++) { ctx.fillRect(x + 12 + i, y + 12 + Math.floor(i / 2), 1, 2); ctx.fillRect(x + 30 - i, y + 12 + Math.floor(i / 2), 1, 2); }
      ctx.fillRect(x + 17, y + 27, 9, 2);
    },
  },

  // ================================================================== ABE (chess)
  // Abe wanders the board and commands the pieces. His knight hops around as a sidekick.
  abe: {
    name: 'ABE, THE GRANDMASTER', hp: 360, rest: 0.7,
    init(b) {
      b.tx = b.x; b.ty = b.y; b.walkT = 0; b.dir = 'down';
      b.piece = { x: b.x + 48, y: b.y + 16, lift: 0, jump: null };
    },
    move(b, dt, G) {
      const a = G.arena, dx = b.tx - b.x, dy = b.ty - b.y, d = Math.hypot(dx, dy);
      if (d < 2) {
        b.tx = a.x0 + 50 + Math.random() * (a.x1 - a.x0 - 100);
        b.ty = a.y0 + 40 + Math.random() * 70;
      } else {
        const sp = (b.phase2 ? 45 : 30) * dt;
        b.x += (dx / d) * sp; b.y += (dy / d) * sp;
        b.walkT += dt;
        b.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
      }
      const p = b.piece;
      if (p.jump) {
        const j = p.jump;
        j.t += dt / 0.5;
        const e = Math.min(1, j.t);
        p.x = j.fx + (j.tx - j.fx) * e;
        p.y = j.fy + (j.ty - j.fy) * e;
        p.lift = Math.sin(e * Math.PI) * 36;
        if (j.t >= 1) { p.jump = null; p.lift = 0; }
      }
    },
    hit: (b, x, y) => Math.abs(x - b.x) < 11 && y > b.y - 44 && y < b.y,
    center: (b) => [b.x, b.y - 24],
    attacks: [
      function knightHops(b, G) {
        const L = [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]];
        const a = G.arena, p = b.piece;
        for (let k = 0; k < 3; k++) {
          G.after(k * 1.2, () => {
            const [px, py] = G.player();
            const moves = L.map(([dx, dy]) => [p.x + dx * 32, p.y + dy * 32])
              .filter(([x, y]) => x > a.x0 + 16 && x < a.x1 - 16 && y > a.y0 + 40 && y < a.y1 - 4);
            if (!moves.length) return;
            moves.sort((m1, m2) => Math.hypot(m1[0] - px, m1[1] - py) - Math.hypot(m2[0] - px, m2[1] - py));
            const [tx, ty] = moves[rint(Math.min(2, moves.length))];
            G.hazardCircle(tx, ty - 6, 26, { warn: 0.9, style: 'impact' });
            G.after(0.4, () => { p.jump = { fx: p.x, fy: p.y, tx, ty, t: 0 }; });
            G.after(0.9, () => { G.ring(tx, ty - 10, b.phase2 ? 14 : 10, 55, 'orb', k * 0.3); G.sfx.thud(); G.shake(3); });
          });
        }
        return 3.7;
      },
      function rook(b, G) {
        const dur = 1.8;
        for (let s = 0, i = 0; s < dur; s += 0.14, i++) {
          G.after(s, () => { for (let d = 0; d < 4; d++) G.shoot(b.x, b.y - 22, d * TAU / 4 + (b.phase2 ? i * 0.06 : 0), 80, 'orb'); });
        }
        return dur + 0.4;
      },
      function pawns(b, G) {
        const a = G.arena;
        for (let w = 0; w < 2; w++) {
          G.after(w * 1.6, () => {
            const gap = a.x0 + 40 + Math.random() * (a.x1 - a.x0 - 80);
            for (let x = a.x0 + 10; x < a.x1; x += 20) if (Math.abs(x - gap) > 30) G.shoot(x, a.y0 + 6, Math.PI / 2, 38, 'pawn', { r: 5 });
            G.sfx.puff();
          });
        }
        return 3.2;
      },
      function bishop(b, G) {
        const dur = 1.8;
        for (let s = 0, i = 0; s < dur; s += 0.14, i++) {
          G.after(s, () => { for (let d = 0; d < 4; d++) G.shoot(b.x, b.y - 22, TAU / 8 + d * TAU / 4 - (b.phase2 ? i * 0.06 : 0), 80, 'orb'); });
        }
        return dur + 0.4;
      },
      function queen(b, G) {
        for (let r = 0; r < 3; r++) G.after(r * 0.5, () => { G.ring(b.x, b.y - 22, b.phase2 ? 16 : 12, 60, 'orb', r * 0.5); G.sfx.chord(r % 2); });
        return 1.8;
      },
    ],
    draw(ctx, b, t) {
      const p = b.piece;
      const drawPiece = () => {
        ctx.fillStyle = 'rgba(0,0,0,.35)';
        ctx.fillRect(Math.round(p.x - 10), Math.round(p.y - 4), 20, 4);
        ctx.drawImage(BOSS_ART.knight, Math.round(p.x - 16), Math.round(p.y - 48 - p.lift + Math.sin(t * 3)));
      };
      if (p.y < b.y) drawPiece();
      ctx.fillStyle = 'rgba(0,0,0,.35)';
      ctx.fillRect(Math.round(b.x - 10), Math.round(b.y - 3), 20, 4);
      if (!(b.hurt > 0 && Math.floor(t * 20) % 2)) {
        const set = b.dir === 'up' ? SPR.friend.up : b.dir === 'down' ? SPR.friend.down : SPR.friend.side;
        drawSprite(ctx, set[Math.floor(b.walkT * 6) % 4], b.x - 8, b.y - 16, { scale: 2, flip: b.dir === 'left' });
      }
      if (p.y >= b.y) drawPiece();
    },
  },
};
