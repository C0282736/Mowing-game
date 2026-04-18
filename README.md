# Mowing Game

An efficiency-focused lawn mowing game. Cut the most grass with the shortest path
and the least overlap, around obstacles like tree beds.

## Status

**Phase 1 prototype.** Drive a mower around a rectangular lawn and erase
uncut grass. No obstacles, scoring, or levels yet — those come in Phase 2+.

## Running

```
npm install
npm run dev
```

Open the printed URL, then use WASD or arrow keys to drive. Hold Shift to sprint.

## Scripts

- `npm run dev` — Vite dev server with HMR
- `npm run build` — type check + production build
- `npm run typecheck` — type check only
- `npm run preview` — serve the built output

## Structure

```
src/
  main.ts        entry point
  game.ts        loop + render
  mower.ts       physics + draw
  grassMask.ts   offscreen cut-grass mask
  input.ts       keyboard state
  types.ts       shared types
```
