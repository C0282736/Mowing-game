import type { InputState } from './input.js';
import type { LawnRect } from './types.js';

const MAX_FORWARD_SPEED = 140;
const MAX_REVERSE_SPEED = 70;
const SPRINT_MULTIPLIER = 1.4;
const ACCEL = 260;
const BRAKE = 420;
const TURN_RATE = 2.6;
const TURN_FALLOFF_AT_MAX = 0.55;

export class Mower {
  x: number;
  y: number;
  heading: number;
  speed = 0;
  readonly radius: number;

  constructor(x: number, y: number, heading = 0, radius = 16) {
    this.x = x;
    this.y = y;
    this.heading = heading;
    this.radius = radius;
  }

  update(input: InputState, dt: number, bounds: LawnRect): void {
    const maxFwd = MAX_FORWARD_SPEED * (input.sprint ? SPRINT_MULTIPLIER : 1);

    let targetSpeed: number;
    let turnInput: number;

    if (input.aim) {
      const diff = wrapAngle(input.aim.angle - this.heading);
      turnInput = Math.max(-1, Math.min(1, diff / 0.4));
      const alignment = Math.max(0, Math.cos(diff));
      targetSpeed = maxFwd * input.aim.magnitude * alignment;
    } else {
      turnInput = input.turn;
      targetSpeed =
        input.throttle > 0 ? maxFwd * input.throttle :
        input.throttle < 0 ? MAX_REVERSE_SPEED * input.throttle : 0;
    }

    const delta = targetSpeed - this.speed;
    const rate = Math.sign(delta) === Math.sign(this.speed) || this.speed === 0 ? ACCEL : BRAKE;
    this.speed += Math.sign(delta) * Math.min(Math.abs(delta), rate * dt);

    const speedFrac = Math.abs(this.speed) / maxFwd;
    const turnScale = 1 - TURN_FALLOFF_AT_MAX * Math.min(1, speedFrac);
    const turnDir = this.speed >= 0 ? 1 : -1;
    this.heading += turnInput * TURN_RATE * turnScale * turnDir * dt;

    this.x += Math.cos(this.heading) * this.speed * dt;
    this.y += Math.sin(this.heading) * this.speed * dt;

    const minX = bounds.x + this.radius;
    const maxX = bounds.x + bounds.w - this.radius;
    const minY = bounds.y + this.radius;
    const maxY = bounds.y + bounds.h - this.radius;
    if (this.x < minX) { this.x = minX; this.speed = 0; }
    if (this.x > maxX) { this.x = maxX; this.speed = 0; }
    if (this.y < minY) { this.y = minY; this.speed = 0; }
    if (this.y > maxY) { this.y = maxY; this.speed = 0; }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.heading);

    ctx.fillStyle = '#c63d2f';
    ctx.strokeStyle = '#2a1412';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-this.radius, -this.radius * 0.8, this.radius * 2, this.radius * 1.6, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#f4d35e';
    ctx.beginPath();
    ctx.moveTo(this.radius - 2, 0);
    ctx.lineTo(this.radius - 8, -5);
    ctx.lineTo(this.radius - 8, 5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}

function wrapAngle(a: number): number {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}
