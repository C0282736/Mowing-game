import { initInput, readInput } from './input.js';
import { Mower } from './mower.js';
import { GrassMask } from './grassMask.js';
import type { LawnRect } from './types.js';

const FIXED_DT = 1 / 60;
const MAX_ACCUM = 0.25;

const LAWN: LawnRect = { x: 60, y: 60, w: 680, h: 480 };

export function startGame(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D context unavailable on main canvas');

  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const cssW = canvas.width;
  const cssH = canvas.height;
  canvas.style.width = `${cssW}px`;
  canvas.style.height = `${cssH}px`;
  canvas.width = cssW * dpr;
  canvas.height = cssH * dpr;
  ctx.scale(dpr, dpr);

  initInput();

  const mower = new Mower(LAWN.x + 40, LAWN.y + 40, 0);
  const grass = new GrassMask(LAWN);

  let accum = 0;
  let last = performance.now();

  const frame = (now: number) => {
    const elapsed = Math.min(MAX_ACCUM, (now - last) / 1000);
    last = now;
    accum += elapsed;

    while (accum >= FIXED_DT) {
      const input = readInput();
      mower.update(input, FIXED_DT, LAWN);
      grass.cutAt(mower.x, mower.y, mower.radius);
      accum -= FIXED_DT;
    }

    render(ctx, cssW, cssH, grass, mower);
    requestAnimationFrame(frame);
  };

  requestAnimationFrame(frame);
}

function render(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  grass: GrassMask,
  mower: Mower,
): void {
  ctx.fillStyle = '#2a2f27';
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = '#6b4a2b';
  ctx.fillRect(LAWN.x - 6, LAWN.y - 6, LAWN.w + 12, LAWN.h + 12);
  ctx.fillStyle = '#33381d';
  ctx.fillRect(LAWN.x, LAWN.y, LAWN.w, LAWN.h);

  grass.draw(ctx);
  mower.draw(ctx);
}
