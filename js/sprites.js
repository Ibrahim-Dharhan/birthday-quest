// Pixel-art sprites. Each sprite is a grid of characters, each char maps to a colour.
// '.' is transparent. A sprite's own palette overrides BASE_PAL.

const BASE_PAL = {
  k: '#1a1c2c', w: '#f4f4f4', l: '#94b0c2', L: '#c2d0dc', g: '#566c86', G: '#333c57',
  r: '#b13e53', R: '#ef7d57', o: '#a7663b', O: '#7a4a2a', y: '#ffcd75', Y: '#fff2b0',
  p: '#f4a3c4', c: '#fff4d6', b: '#3b5dc9', B: '#29366f', t: '#38b764', n: '#5d275d',
  e: '#1a1c2c', P: '#333c57',
};

// ---- Character colours (from the reference photos) ----
const LOOKS = {
  // Jadon: buzz cut, round tortoiseshell glasses, mustache + goatee, rust sweater, jeans
  jadon: { H: '#1b1512', s: '#c68e62', S: '#a8744c', g: '#6b4226', m: '#8a5a3c', M: '#8a4a3a', w: '#f4f4f4', r: '#a3502e', R: '#7e3a20', p: '#3a4f7a', f: '#2a2a2a' },
  // Abe: curly dark hair, short beard, white tee, black pants
  abe: { H: '#1a1410', s: '#dcaa82', S: '#c08e68', E: '#1a1410', m: '#3a2a20', M: '#8a4a3a', B: '#eceef2', l: '#b8bcc8', p: '#1c1c22', f: '#0e0e12' },
  // Other people (volleyball opponents etc.)
  people: [
    { H: '#d9b25a', s: '#f2cfa6', S: '#d9b28a', g: '#d9b25a', r: '#38b764', R: '#257a45', p: '#29366f', f: '#2a2a2a' },
    { H: '#3a2a1a', s: '#8d5a3c', S: '#6e4329', g: '#3a2a1a', r: '#e84a5f', R: '#b13e53', p: '#2e2e38', f: '#2a2a2a' },
  ],
  // Thatcher (Yorkie): golden-tan head + ears, dark steel-grey body with silver streaks
  dog: { c: '#d9ad6c', C: '#b98548', E: '#c48f52', T: '#45454c', t: '#8a8a94', e: '#1a1c2c', n: '#1a1c2c' },
};

// 16x20 characters. Last two rows are the legs (swapped for walk frames).
const JADON_DOWN = [
  '................',
  '......kkkk......',
  '.....kHHHHk.....',
  '....kHHHHHHk....',
  '....kHssssHk....',
  '....kssssssk....',
  '....ksessesk....',
  '....kssssssk....',
  '....kssssssk....',
  '.....kssssk.....',
  '......kssk......',
  '....krrrrrrk....',
  '...krrrrrrrrk...',
  '...krkrrrrkrk...',
  '...krkrrrrkrk...',
  '...krkrrrrkrk...',
  '...kskrrrrksk...',
  '....kkppppkk....',
  '.....kppppk.....',
  '.....kpkkpk.....',
  '.....kpkkpk.....',
  '.....kpkkpk.....',
  '.....kpkkpk.....',
  '.....kfkkfk.....',
];
const JADON_UP = [
  '................',
  '......kkkk......',
  '.....kHHHHk.....',
  '....kHHHHHHk....',
  '....kHHHHHHk....',
  '....kHHHHHHk....',
  '....kHHHHHHk....',
  '....kSHHHHSk....',
  '....kSssssSk....',
  '.....kssssk.....',
  '......kssk......',
  '....krrrrrrk....',
  '...krrrrrrrrk...',
  '...krkrrrrkrk...',
  '...krkrrrrkrk...',
  '...krkrrrrkrk...',
  '...kskrrrrksk...',
  '....kkppppkk....',
  '.....kppppk.....',
  '.....kpkkpk.....',
  '.....kpkkpk.....',
  '.....kpkkpk.....',
  '.....kpkkpk.....',
  '.....kfkkfk.....',
];
const JADON_SIDE = [
  '................',
  '......kkkk......',
  '.....kHHHHk.....',
  '....kHHHHHHk....',
  '....kHHHsssk....',
  '....kHsssssk....',
  '....kHsssesk....',
  '....kssssssk....',
  '....kssssssk....',
  '.....kssssk.....',
  '......kssk......',
  '.....krrrrk.....',
  '.....krrrrk.....',
  '.....krrRrk.....',
  '.....krrRrk.....',
  '.....krrRrk.....',
  '.....krrsrk.....',
  '.....kppppk.....',
  '......kppk......',
  '......kppk......',
  '......kppk......',
  '......kppk......',
  '......kppk......',
  '......kffk......',
];
const ABE_DOWN = [
  '.....kkkkkk.....',
  '....kHHHHHHk....',
  '...kHHHHHHHHk...',
  '...kHHHHHHHHk...',
  '...kHHHHHHHHk...',
  '....kHssssHk....',
  '....ksessesk....',
  '....kssssssk....',
  '....kmssssmk....',
  '.....kmmmmk.....',
  '......kssk......',
  '....kBBBBBBk....',
  '...kBBBBBBBBk...',
  '...kBkBBBBkBk...',
  '...kskBBBBksk...',
  '...kskBBBBksk...',
  '...kskBBBBksk...',
  '....kkppppkk....',
  '.....kppppk.....',
  '.....kpkkpk.....',
  '.....kpkkpk.....',
  '.....kpkkpk.....',
  '.....kpkkpk.....',
  '.....kfkkfk.....',
];
const ABE_UP = [
  '.....kkkkkk.....',
  '....kHHHHHHk....',
  '...kHHHHHHHHk...',
  '...kHHHHHHHHk...',
  '...kHHHHHHHHk...',
  '....kHHHHHHk....',
  '....kHHHHHHk....',
  '....kHHHHHHk....',
  '....kSHHHHSk....',
  '.....kssssk.....',
  '......kssk......',
  '....kBBBBBBk....',
  '...kBBBBBBBBk...',
  '...kBkBBBBkBk...',
  '...kskBBBBksk...',
  '...kskBBBBksk...',
  '...kskBBBBksk...',
  '....kkppppkk....',
  '.....kppppk.....',
  '.....kpkkpk.....',
  '.....kpkkpk.....',
  '.....kpkkpk.....',
  '.....kpkkpk.....',
  '.....kfkkfk.....',
];
const ABE_SIDE = [
  '....kkkkkk......',
  '...kHHHHHHk.....',
  '..kHHHHHHHHk....',
  '..kHHHHHHHHk....',
  '..kHHHHHHHHk....',
  '...kHHHssssk....',
  '....kHsssesk....',
  '....kssssssk....',
  '....kmmsssmk....',
  '.....kmmmmk.....',
  '......kssk......',
  '.....kBBBBk.....',
  '.....kBBBBk.....',
  '.....kBBlBk.....',
  '.....kBBsBk.....',
  '.....kBBsBk.....',
  '.....kBBsBk.....',
  '.....kppppk.....',
  '......kppk......',
  '......kppk......',
  '......kppk......',
  '......kppk......',
  '......kppk......',
  '......kffk......',
];

// 20x20 dialog portraits (Undertale-style talking heads).
const PORTRAIT_JADON = [
  '......kkkkkkkk......',
  '....kkHHHHHHHHkk....',
  '...kHHHHHHHHHHHHk...',
  '..kHHHHHHHHHHHHHHk..',
  '..kssssssssssssssk..',
  '..kssssssssssssssk..',
  '..ksgggssssssgggsk..',
  '..kgsssgsggsgsssgk..',
  '..kgsesgssssgsesgk..',
  '..ksgggssssssgggsk..',
  '..kssssssssssssssk..',
  '..kssssssssssssssk..',
  '..kssssMssssMssssk..',
  '..ksssssMMMMsssssk..',
  '...kssssssssssssk...',
  '....kksssssssskk....',
  '......kkkkkkkk......',
  '......kssssssk......',
  '...kkrrrrrrrrrrkk...',
  '..krrrrrrrrrrrrrrk..',
];
const PORTRAIT_ABE = [
  '.....kk.kkkk.kk.....',
  '....kHHkHHHHkHHk....',
  '...kHHHHHHHHHHHHk...',
  '..kHHHHHHHHHHHHHHk..',
  '..kHHHHHHHHHHHHHHk..',
  '..kHHssssssssssHHk..',
  '..kHsEEssssssEEsHk..',
  '..kHssessssssessHk..',
  '..kssssssssssssssk..',
  '..kmssssssssssssmk..',
  '..kmssMssssssMssmk..',
  '..kmmsssMMMMsssmmk..',
  '...kmmmmmmmmmmmmk...',
  '....kkmmmmmmmmkk....',
  '......kkkkkkkk......',
  '......kssssssk......',
  '...kkBBBBBBBBBBkk...',
  '..kBBBBBBBBBBBBBBk..',
  '..kBBBBBBBBBBBBBBk..',
  '..kBBBBBBBBBBBBBBk..',
];

// Thatcher: side view, long silky blond head fur + droopy ears, shaggy grey-tan body, tail up.
const DOG = [
  '.kk.........kkkkk...',
  'kTTk.......kcCCCck..',
  '.kTk.......kEcceckk.',
  '.kTTk.....kEEcccccnk',
  '..kTkkkkkkkEEccccck.',
  '..kTTtTTTtTEEcccCk..',
  '...kTTTTTTTEETkkk...',
  '..kTtTTTtTTTtTTk....',
  '...kTTTTTTTTTTk.....',
  '...ktTtTtTtTtTk.....',
  '....kTkTkkkTkTk.....',
  '....ktktk.ktktk.....',
  '.....k.k...k.k......',
];
// Thatcher lying down (napping / waiting)
const DOG_LIE = [
  '...............kkk......',
  '........kkkk..kCCCkk....',
  '....kkkkTTTTkkkccccck...',
  '...kTtTTTtTTTtEceeccckk.',
  '.kkTTTTTTTTTTEEcccccccnk',
  'kTTTTTtTTTtTTEEEcccccck.',
  'kTTkTTTTTTTTTTTTTTttkk..',
  '.kk.kkkkTTTTkkkkkkkk....',
  '........kkkk............',
];
const CHEST = [
  '................',
  '................',
  '..kkkkkkkkkkkk..',
  '.kooooooooooook.',
  '.koOOOOOOOOOOok.',
  '.kooooooooooook.',
  '.kyyyyyyyyyyyyk.',
  '.kooooykkyooook.',
  '.kooooykkyooook.',
  '.koooooyyoooook.',
  '.kooooooooooook.',
  '.koOOOOOOOOOOok.',
  '.kooooooooooook.',
  '.kkkkkkkkkkkkkk.',
];
const CHEST_OPEN = [
  '................',
  '..kkkkkkkkkkkk..',
  '.kooooooooooook.',
  '.koOOOOOOOOOOok.',
  '.kyyyyyyyyyyyyk.',
  '.kkkkkkkkkkkkkk.',
  '.kYYYYYYYYYYYYk.',
  '.kkkkkkkkkkkkkk.',
  '.kooooooooooook.',
  '.koooooyyoooook.',
  '.kooooooooooook.',
  '.koOOOOOOOOOOok.',
  '.kooooooooooook.',
  '.kkkkkkkkkkkkkk.',
];
const CANDLE = [
  '................',
  '.......yy.......',
  '......yRRy......',
  '......yRRy......',
  '.......yy.......',
  '......kkkk......',
  '......kwrk......',
  '......krwk......',
  '......kwrk......',
  '......krwk......',
  '......kwrk......',
  '......krwk......',
  '......kwrk......',
  '....kkkkkkkk....',
  '....kppppppk....',
  '....kkkkkkkk....',
];
const CAKE = [
  '................',
  '...y..y..y..y...',
  '...R..R..R..R...',
  '...w..r..w..r...',
  '...r..w..r..w...',
  '.kkkkkkkkkkkkkk.',
  '.kppppppppppppk.',
  '.kpwpppwpppwppk.',
  '.kcpccccpcccpck.',
  '.kcccccccccccck.',
  '.krrrrrrrrrrrrk.',
  '.kcccccccccccck.',
  '.kcccccccccccck.',
  'kkkkkkkkkkkkkkkk',
  'kllllllllllllllk',
  '.kkkkkkkkkkkkkk.',
];
const NOTE_MINION = [
  '................',
  '........kkkkk...',
  '........knnnnk..',
  '........kkknnk..',
  '........k..knk..',
  '........k...kk..',
  '........k.......',
  '........k.......',
  '....kkkkk.......',
  '...knnnnnk......',
  '..knwknwknk.....',
  '..knnnnnnnk.....',
  '...knnnnnk......',
  '....kkkkk.......',
];
const PEBBLE = [
  '................',
  '................',
  '................',
  '................',
  '................',
  '......kkkk......',
  '....kkLLLLkk....',
  '...kLLLLLLLLk...',
  '..kLLwkLLwkLLk..',
  '..kllllllllllk..',
  '..kllllllllllk..',
  '...kllllllllk...',
  '....kkkkkkkk....',
];
const PAWN = [
  '................',
  '................',
  '......kkkk......',
  '.....kPPPPk.....',
  '.....kwPPwk.....',
  '.....kPPPPk.....',
  '......kkkk......',
  '.....kPPPPk.....',
  '......kPPk......',
  '......kPPk......',
  '.....kPPPPk.....',
  '....kPPPPPPk....',
  '...kPPPPPPPPk...',
  '...kkkkkkkkkk...',
];
const VBALL = [
  '................',
  '................',
  '.....kkkkkk.....',
  '....kwwyywwk....',
  '...kwwwwyywwk...',
  '..kwwwwwyybbbk..',
  '..kwwwbbyybbbk..',
  '.kwbbbbbbyywwwk.',
  '.kbbbbbwwyywwwk.',
  '.kbbkwwwwkyywwk.',
  '..kwwewwewyywk..',
  '..kwwwwwwwyywk..',
  '...kwwwwwwwyk...',
  '....kwwwwwwk....',
  '.....kkkkkk.....',
  '................',
];
const HEART = [
  '................',
  '................',
  '..kkkk....kkkk..',
  '.krrrrk..krrrrk.',
  'krrwrrrkkrrrrrrk',
  'krwrrrrrrrrrrrrk',
  'krrrrrrrrrrrrrrk',
  '.krrrrrrrrrrrrk.',
  '..krrrrrrrrrrk..',
  '...krrrrrrrrk...',
  '....krrrrrrk....',
  '.....krrrrk.....',
  '......krrk......',
  '.......kk.......',
];
const ICONS = {
  star: [
    '................',
    '.......kk.......',
    '......kyyk......',
    '......kyyk......',
    '.....kyyyyk.....',
    '.kkkkkyyyykkkkk.',
    '.kyyyyyyyyyyyyk.',
    '..kyyyyyyyyyyk..',
    '...kyyyyyyyyk...',
    '....kyyyyyyk....',
    '....kyyyyyyk....',
    '...kyyykkyyyk...',
    '...kyyk..kyyk...',
    '..kyyk....kyyk..',
    '..kkk......kkk..',
  ],
  crown: [
    '................',
    '................',
    '................',
    '..k....kk....k..',
    '.kyk..kyyk..kyk.',
    '.kyyk.kyyk.kyyk.',
    '.kyyykyyyykyyyk.',
    '.kyyyyyyyyyyyyk.',
    '.kyrryybbyyrryk.',
    '.kyyyyyyyyyyyyk.',
    '.kkkkkkkkkkkkkk.',
  ],
  shoe: [
    '................',
    '................',
    '................',
    '................',
    '......kkk.......',
    '.....kbbbk......',
    '.....kbwbk......',
    '....kbbbbbk.....',
    '...kbbwbbbbkk...',
    '..kbbbbbbbbbbk..',
    '.kbbbbbbbbbbbbk.',
    '.krrrrrrrrrrrrk.',
    '..kkkkkkkkkkkk..',
  ],
  chalk: [
    '................',
    '................',
    '....kkkkkkkk....',
    '...kwwwwwwwwk...',
    '...kkkkkkkkkk...',
    '...krrrrrrrrk...',
    '...krrrrrrrrk...',
    '...krrwwrrrrk...',
    '...krrrrrrrrk...',
    '...krrrrrrrrk...',
    '....krrrrrrk....',
    '.....kkkkkk.....',
  ],
  book: [
    '................',
    '................',
    '...kkkkkkkkkk...',
    '...kbbbbbbbbwk..',
    '...kbyyyyyybwk..',
    '...kbbbbbbbbwk..',
    '...kbbbbbbbbwk..',
    '...kbbbbbbbbwk..',
    '...kbbbbbbbbwk..',
    '...kbbbbbbbbwk..',
    '...kbbbbbbbbwk..',
    '...kkkkkkkkkkk..',
  ],
  note: NOTE_MINION,
  ball: [
    '................',
    '................',
    '.....kkkkkk.....',
    '....kwwyywwk....',
    '...kwwwwyywwk...',
    '..kwwwwwyybbbk..',
    '..kwwwbbyybbbk..',
    '.kwbbbbbbyywwwk.',
    '.kbbbbbwwyywwwk.',
    '.kbbwwwwwwyywwk.',
    '..kwwwwwwwyywk..',
    '..kwwwwwwwyywk..',
    '...kwwwwwwwyk...',
    '....kwwwwwwk....',
    '.....kkkkkk.....',
    '................',
  ],
};

const SIGN = [
  '................',
  '..kkkkkkkkkkkk..',
  '.kooooooooooook.',
  '.koOOOOoOOOOook.',
  '.kooooooooooook.',
  '.koOOOoOOOOOOok.',
  '.kooooooooooook.',
  '..kkkkkkkkkkkk..',
  '.......kOk......',
  '.......kOk......',
  '.......kOk......',
  '.......kOk......',
  '......kkOkk.....',
];

// Walk frames: swap the last two rows (legs).
const legs = (rows, a, b) => [...rows.slice(0, -2), a, b];
const walkFrames = (rows, side, custom) => {
  const [a, b] = custom || (side
    ? [['....kp....pk....', '....kk....kk....'], ['......kppk......', '......kkkk......']]
    : [['....kpp..kkk....', '....kkk.........'], ['....kkk..ppk....', '.........kkk....']]);
  return [rows, legs(rows, ...a), rows, legs(rows, ...b)];
};
const JADON_LEGS = [['.....kpkkkk.....', '.....kfk........'], ['.....kkkkpk.....', '........kfk.....']];
const JADON_SIDE_LEGS = [['.....kp..pk.....', '....kf....fk....'], ['......kppk......', '......kffk......']];

function makeSprite(rows, pal = {}) {
  const w = Math.max(...rows.map((r) => r.length));
  const c = document.createElement('canvas');
  c.width = w; c.height = rows.length;
  const g = c.getContext('2d');
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === '.') continue;
      const col = pal[ch] ?? BASE_PAL[ch];
      if (!col) continue;
      g.fillStyle = col;
      g.fillRect(x, y, 1, 1);
    }
  });
  return c;
}

const SPR = {
  player: {
    down: walkFrames(JADON_DOWN, false, JADON_LEGS).map((r) => makeSprite(r, LOOKS.jadon)),
    up: walkFrames(JADON_UP, false, JADON_LEGS).map((r) => makeSprite(r, LOOKS.jadon)),
    side: walkFrames(JADON_SIDE, true, JADON_SIDE_LEGS).map((r) => makeSprite(r, LOOKS.jadon)),
  },
  friend: {
    down: walkFrames(ABE_DOWN, false, JADON_LEGS).map((r) => makeSprite(r, LOOKS.abe)),
    up: walkFrames(ABE_UP, false, JADON_LEGS).map((r) => makeSprite(r, LOOKS.abe)),
    side: walkFrames(ABE_SIDE, true, JADON_SIDE_LEGS).map((r) => makeSprite(r, LOOKS.abe)),
  },
  people: LOOKS.people.map((pal) => ({
    down: walkFrames(JADON_DOWN, false, JADON_LEGS).map((r) => makeSprite(r, pal)),
    up: walkFrames(JADON_UP, false, JADON_LEGS).map((r) => makeSprite(r, pal)),
    side: walkFrames(JADON_SIDE, true, JADON_SIDE_LEGS).map((r) => makeSprite(r, pal)),
  })),
  portraits: {
    jadon: makeSprite(PORTRAIT_JADON, LOOKS.jadon),
    abe: makeSprite(PORTRAIT_ABE, LOOKS.abe),
  },
  sign: makeSprite(SIGN),
  dog: makeSprite(DOG, LOOKS.dog),
  dogLie: makeSprite(DOG_LIE, LOOKS.dog),
  chest: makeSprite(CHEST),
  chestOpen: makeSprite(CHEST_OPEN),
  candle: makeSprite(CANDLE),
  cake: makeSprite(CAKE),
  note: makeSprite(NOTE_MINION, { n: '#ef7d57' }),
  pebble: makeSprite(PEBBLE, { l: '#8a8f99', L: '#b5bac4' }),
  pawn: makeSprite(PAWN),
  vball: makeSprite(VBALL, { b: '#3b5dc9', y: '#ffcd75' }),
  heart: makeSprite(HEART),
  heartEmpty: makeSprite(HEART, { r: '#333c57', w: '#566c86' }),
  icons: {},
};
for (const [k, rows] of Object.entries(ICONS)) {
  SPR.icons[k] = makeSprite(rows, k === 'note' ? { n: '#ffcd75', w: '#ffcd75' } : k === 'ball' ? { b: '#3b5dc9', y: '#ffcd75' } : {});
}
SPR.heartURL = SPR.heart.toDataURL();
SPR.heartEmptyURL = SPR.heartEmpty.toDataURL();
SPR.iconURL = (name) => (SPR.icons[name] || SPR.icons.star).toDataURL();
const portraitCache = {};
SPR.portraitURL = (name) => (portraitCache[name] ||= SPR.portraits[name].toDataURL());

// Draws a sprite with its bottom-centre at (x + 8, y + 16) of a tile, optionally flipped/scaled.
function drawSprite(ctx, spr, x, y, { flip = false, scale = 1, oy = 0 } = {}) {
  const w = spr.width * scale, h = spr.height * scale;
  const dx = Math.round(x + 8 - w / 2), dy = Math.round(y + 16 - h + oy);
  if (flip) {
    ctx.save();
    ctx.translate(dx + w, dy);
    ctx.scale(-1, 1);
    ctx.drawImage(spr, 0, 0, w, h);
    ctx.restore();
  } else {
    ctx.drawImage(spr, dx, dy, w, h);
  }
}
