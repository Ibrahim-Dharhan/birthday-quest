// Piano pieces for the Roble Gym scene, started from a scene with { piano: 'id' }.
// Notes are MIDI numbers (60 = middle C). Times are in seconds from the start of the piece.
//   auto pieces just play (with falling notes for show)
//   rhythm pieces: every chunk of right-hand notes is a note to hit with D F J K (or the arrow keys)

const SONGS = (() => {
  // ---- Chopin, Nocturne Op. 9 No. 2 (opening), in eighth notes
  const EIGHTH = 0.27;
  const CHORDS = {
    Eb: [39, [55, 58, 63]], Ab: [44, [56, 60, 63]], Bb7: [46, [56, 62, 65]], Cm: [48, [55, 60, 63]],
  };
  const NOCT_RH = [
    [70, 1],                                                       // pickup
    [79, 3], [77, 1], [79, 2], [77, 1], [75, 3], [70, 2],          // G F G F Eb Bb
    [79, 3], [72, 1], [84, 2], [79, 1], [82, 3], [80, 1], [79, 1], // G C C' G Bb Ab G
    [77, 3], [79, 1], [74, 2], [75, 1], [72, 3], [70, 2],          // F G D Eb C Bb
    [75, 6],                                                       // Eb
  ];
  const NOCT_LH = ['Eb', 'Eb', 'Eb', 'Eb', 'Eb', 'Ab', 'Eb', 'Eb', 'Bb7', 'Bb7', 'Cm', 'Bb7', 'Eb'];

  function nocturne() {
    const notes = [];
    let t = 0;
    for (const [m, d] of NOCT_RH) { notes.push({ m, t: t * EIGHTH, d: d * EIGHTH + 0.1, hand: 'r' }); t += d; }
    NOCT_LH.forEach((name, i) => {
      const [bass, chord] = CHORDS[name], t0 = (1 + i * 3) * EIGHTH;
      notes.push({ m: bass, t: t0, d: EIGHTH * 3, hand: 'l' });
      if (i < NOCT_LH.length - 1) for (const k of [1, 2]) for (const m of chord) notes.push({ m, t: t0 + k * EIGHTH, d: EIGHTH, hand: 'l', v: 0.5 });
      else for (const m of chord) notes.push({ m, t: t0, d: EIGHTH * 5, hand: 'l', v: 0.6 });
    });
    return notes;
  }

  // ---- Abe's attempt at the same thing. [gap before this note (s), notes, what went wrong]
  const ABE_TRY = [
    [0, [70]], [0.5, [79, 39]], [0.9, [77]], [0.35, [79]],
    [0.6, [78], 'wrong'], [0.9, [77]], [0.35, [75, 40], 'wrong'],
    [1.5, [70], 'pause'], [0.7, [79, 39]], [0.5, [72]],
    [0.45, [85], 'wrong'], [0.25, [83], 'wrong'], [0.3, [84]],
    [1.4, [], 'pause'], [0, [79]], [0.2, [82]], [0.15, [80]], [0.15, [79]],
    [0.8, [77, 46]], [0.45, [79]], [0.5, [74]], [0.35, [76], 'wrong'], [0.7, [71], 'wrong'],
    [1.1, [36, 37, 39, 40, 42, 43, 44, 46, 47, 48, 49], 'smash'],
  ];
  function abe() {
    const notes = [];
    let t = 0;
    for (const [gap, ms, what] of ABE_TRY) {
      t += gap;
      if (!ms.length) notes.push({ m: null, t, d: 0, what });
      ms.forEach((m, i) => notes.push({ m, t, d: what === 'smash' ? 1.4 : 0.55, hand: m < 60 ? 'l' : 'r', what: i === 0 ? what : null, v: what === 'smash' ? 1.6 : 1 }));
    }
    return notes;
  }

  // ---- Chopin, Fantaisie-Impromptu (opening runs + a big finish), in sixteenth notes
  const S16 = 0.11;
  const motif = (root) => [0, 1, 0, -1, 0, 5, 8, 7, 5, 7, 5, 4, 5, 8].map((x) => root + x);
  const PHRASE = [
    ...motif(68), ...motif(80),
    92, 90, 88, 87, 85, 84, 81, 80, 78, 76, 75, 73, 72, 69, 68,     // down the C# harmonic minor
    72, 73, 76, 75, 73,
  ];
  const FINALE = [61, 64, 68, 73, 76, 80, 85, 88, 92, 91, 90, 89, 88, 87, 86, 85, 84, 83, 82, 81, 80, 79, 78, 77, 73, 68, 64, 61, 56, 52, 49];
  const RH = [...PHRASE, ...PHRASE, ...FINALE];
  const ARP = { Cm: [37, 44, 49, 52, 49, 44], G7: [44, 51, 54, 60, 54, 51] };
  const LH = ['Cm', 'Cm', 'Cm', 'G7', 'G7', 'Cm', 'Cm', 'Cm', 'Cm', 'G7', 'G7', 'Cm', 'Cm', 'Cm', 'G7', 'Cm'];

  function fantaisie() {
    const notes = [];
    RH.forEach((m, i) => notes.push({ m, t: i * S16, d: S16 * 1.6, hand: 'r' }));
    LH.forEach((name, h) => ARP[name].forEach((m, k) => notes.push({ m, t: (h * 8 + (k * 8) / 6) * S16, d: S16 * 2, hand: 'l', v: 0.55 })));
    const end = RH.length * S16 + 0.1;
    for (const m of [37, 49, 56, 61, 64, 68, 73]) notes.push({ m, t: end, d: 2.2, hand: 'r', v: 0.9, final: true });
    return notes;
  }

  return {
    'nocturne-demo': { title: 'Chopin - Nocturne Op. 9 No. 2', player: 'jadon', notes: nocturne() },
    'nocturne-abe': { title: 'Chopin - Nocturne Op. 9 No. 2 (?)', player: 'abe', notes: abe() },
    fantaisie: { title: 'Chopin - Fantaisie-Impromptu', player: 'jadon', notes: fantaisie(), rhythm: true, chunk: 4 },
  };
})();
