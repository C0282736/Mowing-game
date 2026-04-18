import { initInput, readInput, getStickView } from './input.js';
import type { TouchStickView } from './input.js';
import { Mower } from './mower.js';
import { GrassMask } from './grassMask.js';
import type { LawnRect } from './types.js';

const FIXED_DT = 1 / 60;
const MAX_ACCUM = 0.25;

const LOGICAL_W = 800;
const LOGICAL_H = 600;
const LAWN: LawnRect = { x: 60, y: 60, w: 680, h: 480 };

export function startGame(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D context unavailable on main canvas');

  const applyBackingSize = () => {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const rect = canvas.getBoundingClientRect();
    const targetW = Math.round(rect.width * dpr);
    const targetH = Math.round(rect.height * dpr);
    if (canvas.width !== targetW) canvas.width = targetW;
    if (canvas.height !== targetH) canvas.height = targetH;
  };
  applyBackingSize();
  window.addEventListener('resize', applyBackingSize);
  window.addEventListener('orientationchange', applyBackingSize);

  initInput(canvas, LOGICAL_W, LOGICAL_H);

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

    render(ctx, canvas, grass, mower, getStickView());
    requestAnimationFrame(frame);
  };

  requestAnimationFrame(frame);
}

function render(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  grass: GrassMask,
  mower: Mower,
  stick: TouchStickView,
): void {
  ctx.save();
  ctx.setTransform(canvas.width / LOGICAL_W, 0, 0, canvas.height / LOGICAL_H, 0, 0);

  ctx.fillStyle = '#2a2f27';
  ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);

  ctx.fillStyle = '#6b4a2b';
  ctx.fillRect(LAWN.x - 6, LAWN.y - 6, LAWN.w + 12, LAWN.h + 12);
  ctx.fillStyle = '#33381d';
  ctx.fillRect(LAWN.x, LAWN.y, LAWN.w, LAWN.h);

  grass.draw(ctx);
  mower.draw(ctx);

  if (stick.active) drawStick(ctx, stick);

  ctx.restore();
}

function drawStick(ctx: CanvasRenderingContext2D, stick: TouchStickView): void {
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(stick.baseX, stick.baseY, stick.maxRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = 'rgba(244, 211, 94, 0.85)';
  ctx.beginPath();
  ctx.arc(stick.headX, stick.headY, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
