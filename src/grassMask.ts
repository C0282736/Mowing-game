import type { LawnRect } from './types.js';

export class GrassMask {
  readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly bounds: LawnRect;
  private lastX: number | null = null;
  private lastY: number | null = null;

  constructor(bounds: LawnRect, fill = '#4d7c2e') {
    this.bounds = bounds;
    this.canvas = document.createElement('canvas');
    this.canvas.width = bounds.w;
    this.canvas.height = bounds.h;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('2D context unavailable on grass mask canvas');
    this.ctx = ctx;

    this.ctx.fillStyle = fill;
    this.ctx.fillRect(0, 0, bounds.w, bounds.h);

    const stripe = 18;
    this.ctx.fillStyle = 'rgba(255,255,255,0.035)';
    for (let y = 0; y < bounds.h; y += stripe * 2) {
      this.ctx.fillRect(0, y, bounds.w, stripe);
    }
  }

  cutAt(worldX: number, worldY: number, radius: number): void {
    const lx = worldX - this.bounds.x;
    const ly = worldY - this.bounds.y;

    this.ctx.save();
    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.fillStyle = '#000';

    if (this.lastX !== null && this.lastY !== null) {
      const dx = lx - this.lastX;
      const dy = ly - this.lastY;
      const len = Math.hypot(dx, dy);
      if (len > 0) {
        const nx = -dy / len;
        const ny = dx / len;
        const r = radius - 1;
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX + nx * r, this.lastY + ny * r);
        this.ctx.lineTo(lx + nx * r, ly + ny * r);
        this.ctx.lineTo(lx - nx * r, ly - ny * r);
        this.ctx.lineTo(this.lastX - nx * r, this.lastY - ny * r);
        this.ctx.closePath();
        this.ctx.fill();
      }
    }

    this.ctx.beginPath();
    this.ctx.arc(lx, ly, radius - 1, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();

    this.lastX = lx;
    this.lastY = ly;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.drawImage(this.canvas, this.bounds.x, this.bounds.y);
  }
}
