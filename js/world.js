// The world: rooms connected by doors.
//
// Map legend:
//   #  wall            .  floor          ~  carpet (walkable)     O  pillar (solid)
//   1-9 door tiles (see `doors`)          C  chest (ids from `chests`, in reading order)
//   *  save star       S  sign (text in content.js SIGNS)          D  dog (until he joins)
//   F  friend NPC      e  enemy (room locks until cleared)          B  boss / boss reward spot
//   K  birthday cake (2x2)                P  very first spawn point
//   Furniture (solid, examine with SPACE; repeat the letter to fill its size):
//   b  bed (2x3, also a save point)  n  nightstand  d  desk (2x1)  x  dresser (2x1)  p  plant
//   u  piano (3x1, plays Happy Birthday one note per SPACE)   a  deflated air mattress (3x2)
//   w  window (part of the wall)   o  dorm room door (part of the wall)   q  whiteboard with polls (part of the wall)
//   Y  another person (volleyball player)   N  volleyball net (top-down)
//   Roble Gym: g  grand piano 3x3   M  gym mats 3x1
//   Scenery:   U  beach umbrella   t  chess table   L  lamp post   j  gift table (2x1)
//   Pillars (O) are drawn to suit the theme: trees, palms, chess statues, boulders, balloons.
//   Outdoors:  R  building (Roble Hall facade)  h  hedge  T  tree  =  paved path  k  bike
// name: shown in the HUD instead of the world name.
//
// doors: { digit: [targetRoom, targetDoorDigit, 'gate'?] }
//   'gate' = sealed until every chest in this world has been opened.
// rockRain: true = small rocks keep falling while fighting in this room.
// hardFirst: true = the first attempt is brutal (made to be lost; Thatcher revives him, then it's normal).
// music: an audio file that loops during the boss fight.
// Maze rooms are generated from a seed: door 1 is on the left, door 2 on the right.

const WORLDS = {
  home: { name: "Jadon's Room" },
  w1: { name: 'The Conservatory' },
  w2: { name: 'The Crag' },
  vb: { name: 'The Beach' },
  w3: { name: 'The Board' },
  party: { name: 'The Party' },
};

const ARENA_MAP = [
  '####################',
  '#########22#########',
  '#..................#',
  '#..................#',
  '#........B.........#',
  '#..................#',
  '#..................#',
  '#..................#',
  '#..................#',
  '#..................#',
  '#..................#',
  '#..................#',
  '#..................#',
  '#..................#',
  '#########11#########',
];
ARENA_MAP[0] = ARENA_MAP[1];

const COMBAT_MAP = (e) => [
  '####################',
  '#########22#########',
  '#..................#',
  '#..O....' + e[0] + '..' + e[1] + '....O..#',
  '#..................#',
  '#.....' + e[2] + '......' + e[3] + '.....#',
  '1..................#',
  '1..................#',
  '#.......' + e[4] + '..' + e[5] + '.......#',
  '#..O............O..#',
  '#..................#',
  '#..................#',
  '####################',
].map((r, i, a) => (i === 0 ? a[1] : r));

const ANTE_MAP = [
  '######22######',
  '######22######',
  '#............#',
  '#.........S..#',
  '#............#',
  '#.....~~.....#',
  '#.....~~.....#',
  '#............#',
  '#.O........O.#',
  '#............#',
  '#............#',
  '######11######',
];

const ROOMS = {
  // ================================================================ WORLD 1
  'bedroom': {
    world: 'home', theme: 'bedroom',
    map: [
      '##################',
      '####ww########ww##',
      '#bbn...uuu..xx..p#',
      '#bb.aaa..........#',
      '#bb.aaa..........#',
      '#..P.............#',
      '#.....~~~~.......1',
      '#.....~~~D.......1',
      '#.....~~~~.......#',
      '#dd..............#',
      '#................#',
      '##################',
    ],
    name: "Jadon's Room",
    doors: { 1: ['hallway', 1] },
  },
  'hallway': {
    world: 'home', theme: 'dorm', name: 'Roble Hall',
    map: [
      '################################',
      '###o####o#qq#o####o####o####o###',
      '#.............S................#',
      '1~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~2',
      '1~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~2',
      '#..............................#',
      '################################',
    ],
    doors: { 1: ['bedroom', 1], 2: ['roble', 1] },
  },
  'roble': {
    world: 'home', theme: 'campus', name: 'Outside Roble',
    map: [
      '#RRRRRRRRRRRRRRRRRRRRRR#',
      '#RRRRRRRRRRRRRRRRRRRRRR#',
      '#RRRRRRRRRRRRRRRRRRRRRR#',
      '#RRRRRRRRRRRRRRRRRRRRRR#',
      '#RRRRRRRRRRRRRRRRRRRRRR#',
      '#RRRRRRRRRR11RRRRRRRRRR#',
      '#hhhhhhhhh.==k.hhhhhhhh#',
      '#.........====.........#',
      '#..T......====......T..#',
      '#======================#',
      '#======================#',
      '#.........====...S.....#',
      '#..T......====......T..#',
      '#.........====.........#',
      '#.T.......====.......T.#',
      '#hhhhhhhhh.==.hhhhhhhhh#',
      '###########22###########',
    ],
    doors: { 1: ['hallway', 2], 2: ['w2-hall', 1] },
  },
  'w1-maze': {
    world: 'w1', theme: 'garden', type: 'maze', size: [7, 4], seed: 7,
    doors: { 1: ['roble-gym', 2], 2: ['w1-recital', 1] },
  },
  'w1-recital': {
    world: 'w1', theme: 'garden',
    map: COMBAT_MAP('ee.ee.'),
    doors: { 1: ['w1-maze', 2], 2: ['w1-ante', 1] },
  },
  'w1-ante': {
    world: 'w1', theme: 'garden', map: ANTE_MAP,
    doors: { 1: ['w1-recital', 2], 2: ['w1-boss', 1, 'gate'] },
  },
  'w1-boss': {
    world: 'w1', theme: 'garden', map: ARENA_MAP, boss: 'piano', music: 'assets/audio/piano-boss.mp3',
    doors: { 1: ['w1-ante', 2], 2: ['w3-hall', 1] },
    rewards: ['w1-tuningfork'],
  },

  // ================================================================ WORLD 2
  'w2-hall': {
    world: 'w2', theme: 'climb', name: 'The Climbing Gym',
    map: [
      '######################',
      '######################',
      '######################',
      '######################',
      '#~~~~~~~~~~F~~~~~~~~~#',
      '#.......S............2',
      '#....................2',
      '#..................C.#',
      '#..........C.........#',
      '#....................#',
      '#....................#',
      '##########11##########',
    ],
    friend: 'friend_w2',
    doors: { 1: ['roble', 2], 2: ['w2-boss', 1, 'gate'] },
    chests: ['volleyball-shoes', 'w2-glasses'],
  },
  'volley': {
    world: 'w2', theme: 'court', name: 'Volleyball Court',
    map: [
      '######################',
      '######################',
      '#....................#',
      '#..~~~~~~~N~~~~~~~...#',
      '1..~~~~~~~N~~~~~~~...2',
      '1..~~F~~~~N~~~~Y~~...2',
      '#..~~~~~~~N~~~Y~~~...#',
      '#..~~~~~~~N~~~~~~~...#',
      '#....................#',
      '#....................#',
      '######################',
    ],
    friend: 'friend_volley',
    doors: { 1: ['w2-boss', 2], 2: ['vb-hall', 1] },
  },
  'roble-gym': {
    world: 'home', theme: 'roblegym', name: 'Roble Gym',
    map: [
      '########################',
      '########################',
      '########################',
      '########################',
      '#......................#',
      '#.........ggg..........#',
      '#.........ggg...F......#',
      '#.........ggg..........#',
      '1......................2',
      '1......................2',
      '#......................#',
      '#......................#',
      '#MMM...................#',
      '#......................#',
      '########################',
    ],
    friend: 'friend_roblegym',
    doors: { 1: ['vb-boss', 2], 2: ['w1-maze', 1] },
  },
  'w2-boss': {
    world: 'w2', theme: 'crag', map: ARENA_MAP, boss: 'hold', rockRain: true, hardFirst: true,
    doors: { 1: ['w2-hall', 2], 2: ['volley', 1] },
    rewards: ['w2-photo3'],
  },

  // ================================================================ THE COURT (volleyball)
  'vb-hall': {
    world: 'vb', theme: 'beach',
    map: [
      '####################',
      '####################',
      '#..................#',
      '#..O.....U.....O...#',
      '#.......S..........2',
      '#...~~.......~~....2',
      '#...~~..U....~~....#',
      '#...~~.......~~....#',
      '#..O...........O...#',
      '#..................#',
      '#########11#########',
    ],
    doors: { 1: ['volley', 2], 2: ['vb-gym', 1] },
  },
  'vb-gym': {
    world: 'vb', theme: 'beach',
    map: COMBAT_MAP('eeeeee'),
    doors: { 1: ['vb-hall', 2], 2: ['vb-ante', 1] },
  },
  'vb-ante': {
    world: 'vb', theme: 'beach', map: ANTE_MAP,
    doors: { 1: ['vb-gym', 2], 2: ['vb-boss', 1, 'gate'] },
  },
  'vb-boss': {
    world: 'vb', theme: 'beach', map: ARENA_MAP, boss: 'vball', music: 'assets/audio/volleyball-boss.mp3',
    doors: { 1: ['vb-ante', 2], 2: ['roble-gym', 1] },
    rewards: ['vb-trophy'],
  },

  // ================================================================ WORLD 3
  'w3-hall': {
    world: 'w3', theme: 'chessgarden',
    map: [
      '##################',
      '##################',
      '#....L......L....#',
      '#..O..........O..#',
      '#.......S........2',
      '#..t...~~~~...t..2',
      '#......~~~~......#',
      '#..t...~~~~...t..#',
      '#......~~~~......#',
      '#..O..........O..#',
      '#....L......L....#',
      '########11########',
    ],
    doors: { 1: ['w1-boss', 2], 2: ['w3-combat', 1] },
  },
  'w3-combat': {
    world: 'w3', theme: 'chessgarden',
    map: COMBAT_MAP('eeeeee'),
    doors: { 1: ['w3-hall', 2], 2: ['w3-ante', 1] },
  },
  'w3-ante': {
    world: 'w3', theme: 'chessgarden', map: ANTE_MAP,
    doors: { 1: ['w3-combat', 2], 2: ['w3-boss', 1, 'gate'] },
  },
  'w3-boss': {
    world: 'w3', theme: 'chessgarden', boss: 'abe',
    map: [
      '####################',
      '#########22#########',
      '#..................#',
      '#.L..............L.#',
      '#.....~~~~~~~~.....#',
      '#.....~~~~~~~~.....#',
      '#.....~~~B~~~~.....#',
      '#.....~~~~~~~~.....#',
      '#.....~~~~~~~~.....#',
      '#.....~~~~~~~~.....#',
      '#.....~~~~~~~~.....#',
      '#.....~~~~~~~~.....#',
      '#.L..............L.#',
      '#..................#',
      '#########11#########',
    ],
    doors: { 1: ['w3-ante', 2], 2: ['party', 1] },
    rewards: ['w3-crown'],
  },

  // ================================================================ FINALE
  'party': {
    world: 'party', theme: 'party',
    map: [
      '##################',
      '##################',
      '#..jj........jj..#',
      '#................#',
      '#.....~~~~~~.....#',
      '#..O..~~K~~~..O..#',
      '#.....~~~~~~.....#',
      '#....F~~~~~~.....#',
      '#................#',
      '#..O..........O..#',
      '#................#',
      '#................#',
      '########11########',
    ],
    friend: 'friend_party',
    doors: { 1: ['w3-boss', 2] },
    finale: true,
  },
};

// ---------------------------------------------------------------------
//  CLIMBS: side-view parkour routes, started from a scene with { climb: 'id' }.
//    #  wall/floor      =  hold (stand on it, jump up through it)
//    -  crumbling hold (drops shortly after you land)      m  moving hold (slides side to side)
//    *  checkpoint (chalk bucket)   G  top-out (touch to finish)   P  start   A  Abe watching
// ---------------------------------------------------------------------
const CLIMBS = {
  v4: {
    name: 'V4', title: 'V4: show Abe the beta!',
    map: [
      '#..................#',
      '#..................#',
      '#..................#',
      '#........GG........#',
      '#......======......#',
      '#..................#',
      '#..................#',
      '#...........=====..#',
      '#..................#',
      '#..................#',
      '#.......====.......#',
      '#..................#',
      '#..................#',
      '#..====............#',
      '#..................#',
      '#..................#',
      '#.......====.......#',
      '#..................#',
      '#..................#',
      '#............====..#',
      '#..................#',
      '#..................#',
      '#........====......#',
      '#..................#',
      '#..................#',
      '#..=====...........#',
      '#..................#',
      '#..P...........A...#',
      '####################',
    ],
  },
  v6: {
    name: 'V634827429742', title: 'V634827429742',
    moverAmp: 40, moverSpeed: 1.3,
    map: [
      '#..................#',
      '#..................#',
      '#..................#',
      '#.........GG.......#',
      '#........=====.....#',
      '#..................#',
      '#..................#',
      '#.....=............#',
      '#..................#',
      '#..................#',
      '#..-...............#',
      '#..................#',
      '#......=...........#',
      '#..................#',
      '#..................#',
      '#..........mm......#',
      '#..................#',
      '#..................#',
      '#...............==.#',
      '#..................#',
      '#..................#',
      '#............-.....#',
      '#..................#',
      '#........=.........#',
      '#..................#',
      '#..................#',
      '#....==............#',
      '#..................#',
      '#..................#',
      '#.-................#',
      '#..................#',
      '#....=.............#',
      '#..................#',
      '#..................#',
      '#........mmm.......#',
      '#..................#',
      '#..................#',
      '#..............==..#',
      '#..................#',
      '#..................#',
      '#..........--......#',
      '#..................#',
      '#......=...........#',
      '#..................#',
      '#..................#',
      '#..==..............#',
      '#..................#',
      '#.P............A...#',
      '####################',
    ],
  },
};

// ---------------------------------------------------------------------
//  VOLLEYBALL: side-view 2v2 matches, started from a scene with { volley: 'id' }.
//  Jadon + Abe vs. two other people. First to `to` points wins (losing = rematch).
// ---------------------------------------------------------------------
const VOLLEYS = {
  match: { title: '2v2 VOLLEYBALL', to: 5, us: 'JADON & ABE', them: 'THE OTHERS' },
};
