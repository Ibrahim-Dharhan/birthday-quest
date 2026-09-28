// Tiny chiptune sound effects with WebAudio, so there are no audio files to ship.

const SFX = (() => {
  let ac = null;
  const ctx = () => {
    if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state === 'suspended') ac.resume();
    return ac;
  };

  function tone(freq, dur = 0.1, type = 'square', vol = 0.06, when = 0, slide = 0) {
    try {
      const a = ctx();
      const t0 = a.currentTime + when;
      const o = a.createOscillator(), g = a.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, t0);
      if (slide) o.frequency.linearRampToValueAtTime(Math.max(30, freq + slide), t0 + dur);
      g.gain.setValueAtTime(vol, t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g).connect(a.destination);
      o.start(t0);
      o.stop(t0 + dur + 0.02);
    } catch (e) { /* audio is optional */ }
  }
  const semi = (n) => 261.63 * Math.pow(2, n / 12);

  // Happy Birthday: [semitones from C4, beats]
  const HB = [
    [7, .75], [7, .25], [9, 1], [7, 1], [12, 1], [11, 2],
    [7, .75], [7, .25], [9, 1], [7, 1], [14, 1], [12, 2],
    [7, .75], [7, .25], [19, 1], [16, 1], [12, 1], [11, 1], [9, 2],
    [17, .75], [17, .25], [16, 1], [12, 1], [14, 1], [12, 3],
  ];

  return {
    unlock: () => ctx(),
    // Clock for anything synced to scheduled notes (seconds).
    now() { try { return ctx().currentTime; } catch (e) { return performance.now() / 1000; } },
    // A piano-ish note at an absolute audio time.
    pnote(midi, at, dur = 0.5, vol = 0.05) {
      try {
        const a = ctx(), t0 = Math.max(at, a.currentTime), f = 440 * Math.pow(2, (midi - 69) / 12);
        for (const [mult, type, v] of [[1, 'triangle', 1], [2, 'sine', 0.3], [3, 'sine', 0.08]]) {
          const o = a.createOscillator(), g = a.createGain();
          o.type = type; o.frequency.value = f * mult;
          g.gain.setValueAtTime(0.0001, t0);
          g.gain.exponentialRampToValueAtTime(vol * v, t0 + 0.006);
          g.gain.exponentialRampToValueAtTime(vol * v * 0.35, t0 + Math.min(0.25, dur));
          g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur + 0.35);
          o.connect(g).connect(a.destination);
          o.start(t0); o.stop(t0 + dur + 0.4);
        }
      } catch (e) { /* audio is optional */ }
    },
    chest() { [0, 4, 7, 12].forEach((n, i) => tone(semi(12 + n), 0.12, 'square', 0.05, i * 0.07)); },
    levelUp() { [0, 4, 7, 12, 16, 19, 24].forEach((n, i) => tone(semi(12 + n), 0.1, 'square', 0.05, i * 0.06)); },
    hurt() { tone(260, 0.2, 'sawtooth', 0.07, 0, -160); },
    hit() { tone(880, 0.08, 'square', 0.06); tone(1320, 0.12, 'square', 0.05, 0.06); },
    talk() { tone(620, 0.05, 'square', 0.03); },
    woof() { tone(320, 0.07, 'square', 0.07, 0, -140); tone(280, 0.09, 'square', 0.07, 0.12, -140); },
    thud() { tone(110, 0.2, 'triangle', 0.12, 0, -60); },
    puff() { tone(500, 0.15, 'triangle', 0.04, 0, -300); },
    pianoKey(n) { tone(semi(n), 0.35, 'triangle', 0.07); },
    chord(p) { (p ? [0, 3, 7] : [0, 4, 7]).forEach((n) => tone(semi(n - 12), 0.4, 'triangle', 0.06)); },
    blip(p = 1) { tone(420 * p + Math.random() * 30, 0.035, 'square', 0.025); },
    shoot() { tone(900 + Math.random() * 200, 0.05, 'square', 0.015, 0, -500); },
    roll() { tone(300, 0.12, 'triangle', 0.05, 0, 200); },
    pop() { tone(700, 0.08, 'square', 0.04, 0, -500); tone(200, 0.12, 'triangle', 0.06, 0.03, -100); },
    pickup() { tone(880, 0.06, 'square', 0.04); tone(1175, 0.1, 'square', 0.04, 0.06); },
    save() { [12, 16, 19, 24].forEach((n, i) => tone(semi(n), 0.2, 'triangle', 0.05, i * 0.08)); },
    door() { [0, 7, 12].forEach((n, i) => tone(semi(n), 0.15, 'triangle', 0.07, i * 0.1)); },
    victory() { [0, 4, 7, 12, 7, 12, 16, 19, 24].forEach((n, i) => tone(semi(n), 0.14, 'square', 0.05, i * 0.09)); },
    hbLength: HB.length,
    hbNote(i) {
      const [n, beats] = HB[i % HB.length];
      tone(semi(n), 0.2 + beats * 0.3, 'triangle', 0.09);
      tone(semi(n - 12), 0.2 + beats * 0.3, 'square', 0.02);
    },
    birthday() {
      let t = 0;
      for (const [n, beats] of HB) { tone(semi(n), beats * 0.36, 'triangle', 0.08, t); tone(semi(n - 12), beats * 0.36, 'square', 0.02, t); t += beats * 0.4; }
    },
  };
})();
