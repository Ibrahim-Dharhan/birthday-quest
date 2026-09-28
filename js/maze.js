// Seeded maze generator (recursive backtracker + a few loops and rooms so it isn't too mean).

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DIRS4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];

function generateMaze(cw, ch, seed = 1, loopChance = 0.1, rooms = 1) {
  const rnd = mulberry32(seed);
  const W = cw * 2 + 1, H = ch * 2 + 1;
  const g = Array.from({ length: H }, () => Array(W).fill('#'));
  const seen = Array.from({ length: ch }, () => Array(cw).fill(false));

  const stack = [[0, 0]];
  seen[0][0] = true;
  g[1][1] = '.';
  while (stack.length) {
    const [cx, cy] = stack[stack.length - 1];
    const opts = DIRS4.filter(([dx, dy]) => {
      const nx = cx + dx, ny = cy + dy;
      return nx >= 0 && ny >= 0 && nx < cw && ny < ch && !seen[ny][nx];
    });
    if (!opts.length) { stack.pop(); continue; }
    const [dx, dy] = opts[Math.floor(rnd() * opts.length)];
    const nx = cx + dx, ny = cy + dy;
    seen[ny][nx] = true;
    g[cy * 2 + 1 + dy][cx * 2 + 1 + dx] = '.';
    g[ny * 2 + 1][nx * 2 + 1] = '.';
    stack.push([nx, ny]);
  }

  // Knock out some walls to create loops.
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      if (g[y][x] !== '#') continue;
      const between = (x % 2 === 0 && y % 2 === 1) || (x % 2 === 1 && y % 2 === 0);
      if (between && rnd() < loopChance) g[y][x] = '.';
    }
  }

  // Small open rooms (2x2 cells -> 3x3 floor).
  for (let i = 0; i < rooms && cw > 3 && ch > 3; i++) {
    const rx = 1 + Math.floor(rnd() * (cw - 3)), ry = 1 + Math.floor(rnd() * (ch - 3));
    for (let y = ry * 2 + 1; y <= ry * 2 + 3; y++) for (let x = rx * 2 + 1; x <= rx * 2 + 3; x++) g[y][x] = '.';
  }

  const start = [1, 1];
  const dist = Array.from({ length: H }, () => Array(W).fill(-1));
  const q = [start];
  dist[1][1] = 0;
  while (q.length) {
    const [x, y] = q.shift();
    for (const [dx, dy] of DIRS4) {
      const nx = x + dx, ny = y + dy;
      if (g[ny][nx] === '.' && dist[ny][nx] < 0) { dist[ny][nx] = dist[y][x] + 1; q.push([nx, ny]); }
    }
  }

  const cells = [];
  for (let y = 1; y < H; y += 2) for (let x = 1; x < W; x += 2) cells.push([x, y]);
  let exit = start;
  for (const c of cells) if (dist[c[1]][c[0]] > dist[exit[1]][exit[0]]) exit = c;

  const openCount = (x, y) => DIRS4.filter(([dx, dy]) => g[y + dy][x + dx] === '.').length;
  const deadEnds = cells
    .filter(([x, y]) => openCount(x, y) === 1 && !(x === start[0] && y === start[1]) && !(x === exit[0] && y === exit[1]))
    .sort((a, b) => dist[a[1]][a[0]] - dist[b[1]][b[0]]);

  return { grid: g, W, H, start, exit, deadEnds, dist, cells, rnd };
}
