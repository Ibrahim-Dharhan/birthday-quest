// =====================================================================
//  CONTENT.JS: all the personal stuff lives here. Edit freely!
//
//  In any text you can write {name}, {dog}, {friend}, {from}; they're
//  swapped for the names below. Dialog lines automatically get the
//  Undertale-style "* " in front. Use backticks (`) for multi-line notes.
// =====================================================================

const GIFT = {
  name: 'Jadon',
  from: 'Abe',
  dogName: 'Thatcher',
  friendName: 'Abe',

  // Opening message, shown over a black screen before the game starts.
  intro: [
    'Abe: Happy Birthday {name}! Quarter of a century!!!',
    "Abe: We're getting old...",
    "Abe: But not old enough to not have some fun.",
    "Abe: Welcome to your birthday quest; it's filled with trials, tribulations, memories, and more.",
    'Abe: I hope you enjoy it, it was made with love <3',
    'Abe: YAAAAAYYYYYYY YAAAAYYYYYYYY',
  ],
  // Clips that play full-screen after the final message (can't be skipped). Leave empty for none.
  video: 'assets/video/memories.mp4',
  // The final message on the celebration screen.
  ending: `Happy Happy Birthday {name}!!!! I can't believe it's been over half a decade since we met, but meeting you has been one of the luckiest things that has ever happened to me. You hear it all the time, but let me say it again: You are the best. The best human, the best friend, the best son, the best of the best; the superlatives go on and on. You are the human experience, and you've touched the lives of so many without even realizing it. A beacon of light in the darkness, you guide the way for others and shine at the end of the dark tunnel. I miss you and hope I can see you soon, and I'm sending virtual hugs. I hope you enjoyed this little game, though it pales in comparison to the effect you've had on my life.`,
};

// ---------------------------------------------------------------------
//  CHESTS. Where they are is set in world.js; what's inside is here.
//    { type: 'note',  title: 'Title', text: `Your message...` }
//    { type: 'photo', src: 'assets/photos/pic.jpg', caption: 'Caption' }
//    { type: 'gear',  name: 'Chalk Bag', icon: 'chalk', text: '...' }   <- +1 LV each
//        (optional found: '...' replaces the "You found the ...!" line; photo: '...' shows a photo afterwards)
//        icons: star, crown, shoe, chalk, note, book, ball
// ---------------------------------------------------------------------
const CHESTS = {
  // Climbing gym -> volleyball
  'volleyball-shoes': { type: 'gear', name: 'Volleyball Shoes', icon: 'shoe', text: 'Squeaky. Grippy. Ready for the court.' },

  // World 1: The Conservatory
  'w1-tuningfork': { type: 'gear', name: 'Golden Hour Sheet Music', icon: 'note', text: '' },

  // World 2: The Crag
  'w2-glasses': { type: 'photo', src: 'assets/photos/glasses.jpg', caption: '' },
  'w2-photo3': { type: 'photo', src: 'assets/photos/photo3.jpg', caption: '' },

  // The Court (volleyball)
  'vb-trophy':   { type: 'gear', name: 'MVP Trophy', icon: 'star', found: 'MVP! MVP!', text: 'You looked like Hinata out there.', photo: 'assets/photos/volleyball.jpg' },

  // World 3: The Board
  'w3-crown':  { type: 'gear', name: 'The Birthday Crown', icon: 'crown', found: 'You found The Birthday Crown!', text: "Careful, it's 25 years old and has started rusting. I wouldn't want you to get Tetanus on your birthday." },

};

// ---------------------------------------------------------------------
//  CUTSCENES: play once, the first time Jadon walks into that room.
//  Start a line with "Jadon:" or "Abe:" to show that person's portrait.
//  Lines without a name are narration.
// ---------------------------------------------------------------------
const SCENES = {
  // Objects in a scene: { climb: 'v4' } runs a climbing route (see CLIMBS in world.js).
  // Start a line with ! for big shaking text; | pauses the typing for a beat.
  'w2-hall': [
    "Abe: I've been struggling to do this V4, can you show me the beta?",
    { climb: 'v4' },
    "Abe: What?!?! I would've never thought to do that",
    'Abe: What have you been working on?',
    "Jadon: I'm working on this V6.",
    'Jadon: !V6|34827429742',
    { climb: 'v6' },
    "Abe: ...ain't no way. You actually sent it.",
  ],
  // TODO: placeholder lines around the volleyball match
  volley: [
    "Abe: Man of the hour! Alright, let's run it. Me and you vs them",
    { volley: 'match' },
    'Jadon: !Too EZ| RAAAAA',
    'Abe: !RAAAAAAA',
  ],
  // { piano: 'id' } plays a piece (see js/songs.js). 'fantaisie' is a rhythm game: D F J K (or arrow keys).
  // { video: 'file.mp4' } plays a video full-screen (can't be skipped).
  // TODO: placeholder lines, rewrite however you like
  'roble-gym': [
    "Abe: Dude I can't get down Chopin's Nocturne Op. 9 No. 2",
    'Abe: Can you show it to me again?',
    "Jadon: Don't fret, I'll teach you as many times as you need.",
    { piano: 'nocturne-demo' },
    'Abe: Lightwork. My turn.',
    { piano: 'nocturne-abe' },
    'Abe: ...',
    "Abe: Uhh, I think the piano is either out of tune or I'm bad.",
    "Abe: Let's go with the latter.",
    'Jadon: I think the piano is fine, I have perf-',
    'Abe: PeRfEcT pItCh. I know, I know. Aight, your turn, blow my socks off.',
    'Jadon: Hmm... okay.',
    { piano: 'fantaisie' },
    { video: 'assets/video/piano.mp4', caption: 'My literal POV watching you play piano:' },   // the real performance
    'Abe: ...',
    "Abe: I am once again reminded how dogshit I am.",
  ],
  bedroom: ['Jadon: *yawn*...', '(Thatcher is still asleep on the rug.)', '(Move with WASD or the arrow keys. Press SPACE to look at things.)'],
};

// What Jadon says when he looks at furniture (SPACE while facing it).
const EXAMINE = {
  bed: ['(Your bed. Still warm. Abe was freezing on the air mattress)', '(You lie down for a second.)'],
  nightstand: ['(Your glasses case and a phone charger.)'],
  desk: ['(Codex and Claude are open. And an incognito tab.)', '(I should close that before anyone sees...)'],
  dresser: ['(Clothes. Mostly sweaters. And floral button ups.)'],
  plant: ['(A plant. Specifically a fig tree. It\'s thriving.)'],
  piano: ['(Happy Birthday!)'],
  airbed: ['(Abe\'s air mattress. Completely deflated. It did not survive the night. He was freezing.)'],
  grand: ['(A beautiful grand piano. Still warm from the Fantaisie-Impromptu.)'],
  mats: ['(A stack of blue gym mats.)'],
  umbrella: ['(A beach umbrella. Very shady.)'],
  chesstable: ['(Someone abandoned this game mid-Sicilian.)'],
  lamp: ['(A garden lamp. It hums quietly.)'],
  gifts: ['(A pile of presents. They all have your name on them.)'],
  cakeWish: ['(You make a wish and blow out the candles.)'],
  cakeDone: ['(You ate the whole cake.)', '(No regrets.)'],  // shown after finishing the song
};

// ---------------------------------------------------------------------
//  DIALOGUE
// ---------------------------------------------------------------------
const DIALOGUE = {
  dog: ['({dog} is napping here.)', 'Woof! Woof!', '{dog} wants to come with you!'],
  dogJoined: '{dog} joined your party!',
  friend_w2: ['Hey!! There you are!', 'Good luck with the Crimp. Nobody has flashed it.', 'After that... I will be waiting for you at the Board.', 'FIGH-TING.'],
  friend_party: ['HAPPY BIRTHDAY, {name}!!', 'Go on, the cake is all yours.'],
  friend_volley: ['Abe: Lightwork no reaction.'],
  friend_roblegym: ['Abe: Maybe I should go back to the trumpet.'],
  people: ['Good game!', 'Rematch sometime?'],
  save: ['(The smell of birthday cake fills you with DETERMINATION.)', 'HP fully restored.'],
  faint: ['...', '{dog} licks your face until you get back up.', 'Stay determined!'],
  // first time Jadon goes down at The Crimp without Thatcher in the party
  dogRescue: ['...', 'Wait... is that {dog}?', '{dog} followed you all the way here!', '{dog} licks your face until you get back up.'],
  faintNoDog: ['...', 'You take a quick nap and feel much better.', 'Stay determined!'],
  gate: 'The door is sealed. {left} chest{s} in this area {are} still unopened.',
};

const BOSS_TEXT = {
  piano: {
    intro: ['THE GRAND PIANO blocks the way!', '"Who hurt my baby (grand)!?!"'],
    defeat: ["\"...fine. You may pass. But don't touch my baby. Ever.\"", '"And practice your scales."'],
  },
  hold: {
    intro: ['THE CRIMP blocks the way!', '"You will never flash me. NEVER."', '(Aim with the mouse, click to shoot. SPACE to dodge roll!)'],
    defeat: ['"Okay... that was a clean send."'],
  },
  vball: {
    intro: ['THE BLOCKER blocks the way!', '"Nobody gets past my block."'],
    defeat: ['"...nice dig."', '"Game, set, match."'],
  },
  abe: {
    intro: ['ABE blocks the way!', "Abe: {name}, I'm sorry it had to come to this. Your reign will come to an end.", 'Abe: One game, for all the marbles.'],
    defeat: ['Abe: I hate this game... But anyway, Happy birthday.'],
  },
};

// Polls on the dorm hallway whiteboard, shown one after another.
//   histogram: labels + counts      scatter: x/y axis names, max values, and [x, y] points
const WHITEBOARD = [
  {
    type: 'histogram',
    question: 'How many jelly beans could you fit in your ears?',
    labels: ['1', '2', '3', '4', '5+'],
    counts: [4, 7, 5, 2, 9],
  },
  {
    type: 'scatter',
    question: 'Hours of sleep last night vs. cups of coffee today',
    x: 'hours of sleep', y: 'cups of coffee', xMax: 10, yMax: 6,
    points: [[3, 5], [4, 4], [4, 6], [5, 3], [5, 4], [6, 3], [6, 2], [7, 2], [7, 1], [8, 1], [8, 2], [9, 0], [3, 6], [6, 4], [2, 5]],
  },
];

// One sign per room (the 'S' on the map).
const SIGNS = {
  'w1-ante': ['The music behind this door is... very loud.'],
  'hallway': ['(A bulletin board.)', '"QUIET HOURS: 10PM - 8AM."', '"LOST: one (1) sense of time. If found, return to room 2B."'],
  roble: ['WELCOME TO ROBLE HALL', 'STANFORD UNIVERSITY'],
  'w2-hall': ['THE CLIMBING GYM', 'Please do not lick the holds.'],
  'vb-hall': ['THE BEACH', 'Your vertical will decrease by 50% in the sand, sorry not sorry'],
  'vb-ante': ['Beyond this door: THE BLOCKER.', 'Call the ball!'],
  'w3-hall': ['THE BOARD', 'Pawns move forward. Bishops move diagonally. Abe moves... suspiciously slow.'],
  'w3-ante': ['Beyond this door: ABE.', '(He has been studying openings.)'],
};
