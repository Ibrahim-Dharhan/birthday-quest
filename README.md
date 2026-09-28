# Birthday Quest

A small Undertale-style adventure with Gungeon-style boss fights. Plain HTML/JS, no build step.

## Play

Open https://ibrahim-dharhan.github.io/birthday-quest/ (best on a laptop, with sound on).

Controls: WASD/arrows move · Space interacts · mouse aims, click shoots · Space/Shift/right-click dodge-rolls in fights · hold J to auto-aim.

## Personalize

- `js/content.js`: names, every note/photo/gear chest, dialog, signs, boss lines. **This is the main file to edit.**
- `assets/photos/`: put photos here and reference them as `assets/photos/whatever.jpg`.
- `js/world.js`: room layouts (ASCII maps) and which chest sits where.
- `js/sprites.js`: pixel art. Character colours live in `LOOKS`.
- `js/bosses.js`: boss HP, attack patterns, art.

Debug in the browser console: `bq.goto('w2-boss')`, `bq.level(5)`, `bq.god()`, `bq.openAll()`, `bq.reset()`.

## Sharing it

Zip the whole folder, or host it anywhere static (GitHub Pages, Netlify drop). Progress saves in the browser automatically.
