export interface AimInput {
  angle: number;
  magnitude: number;
}

export interface InputState {
  throttle: number;
  turn: number;
  sprint: boolean;
  aim: AimInput | null;
}

export interface TouchStickView {
  active: boolean;
  baseX: number;
  baseY: number;
  headX: number;
  headY: number;
  maxRadius: number;
}

const pressed = new Set<string>();

const STICK_MAX_RADIUS = 70;
const STICK_DEAD_ZONE = 10;

let pointerId: number | null = null;
let baseCanvasX = 0;
let baseCanvasY = 0;
let headCanvasX = 0;
let headCanvasY = 0;
let canvasRef: HTMLCanvasElement | null = null;
let logicalW = 1;
let logicalH = 1;

export function initInput(canvas: HTMLCanvasElement, logicalWidth: number, logicalHeight: number): void {
  canvasRef = canvas;
  logicalW = logicalWidth;
  logicalH = logicalHeight;

  window.addEventListener('keydown', (e) => {
    pressed.add(e.key.toLowerCase());
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(e.key.toLowerCase())) {
      e.preventDefault();
    }
  });
  window.addEventListener('keyup', (e) => {
    pressed.delete(e.key.toLowerCase());
  });
  window.addEventListener('blur', () => {
    pressed.clear();
    pointerId = null;
  });

  canvas.style.touchAction = 'none';

  canvas.addEventListener('pointerdown', (e) => {
    if (pointerId !== null) return;
    pointerId = e.pointerId;
    const p = toCanvasCoords(e.clientX, e.clientY);
    baseCanvasX = p.x;
    baseCanvasY = p.y;
    headCanvasX = p.x;
    headCanvasY = p.y;
    canvas.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  canvas.addEventListener('pointermove', (e) => {
    if (pointerId !== e.pointerId) return;
    const p = toCanvasCoords(e.clientX, e.clientY);
    headCanvasX = p.x;
    headCanvasY = p.y;
  });

  const endPointer = (e: PointerEvent) => {
    if (pointerId !== e.pointerId) return;
    pointerId = null;
  };
  canvas.addEventListener('pointerup', endPointer);
  canvas.addEventListener('pointercancel', endPointer);
  canvas.addEventListener('lostpointercapture', endPointer);
}

function toCanvasCoords(clientX: number, clientY: number): { x: number; y: number } {
  if (!canvasRef) return { x: clientX, y: clientY };
  const rect = canvasRef.getBoundingClientRect();
  const sx = rect.width === 0 ? 1 : logicalW / rect.width;
  const sy = rect.height === 0 ? 1 : logicalH / rect.height;
  return {
    x: (clientX - rect.left) * sx,
    y: (clientY - rect.top) * sy,
  };
}

export function readInput(): InputState {
  const forward = pressed.has('w') || pressed.has('arrowup');
  const back = pressed.has('s') || pressed.has('arrowdown');
  const left = pressed.has('a') || pressed.has('arrowleft');
  const right = pressed.has('d') || pressed.has('arrowright');

  let aim: AimInput | null = null;
  if (pointerId !== null) {
    const dx = headCanvasX - baseCanvasX;
    const dy = headCanvasY - baseCanvasY;
    const dist = Math.hypot(dx, dy);
    if (dist > STICK_DEAD_ZONE) {
      const clamped = Math.min(dist, STICK_MAX_RADIUS);
      aim = {
        angle: Math.atan2(dy, dx),
        magnitude: (clamped - STICK_DEAD_ZONE) / (STICK_MAX_RADIUS - STICK_DEAD_ZONE),
      };
    } else {
      aim = { angle: 0, magnitude: 0 };
    }
  }

  return {
    throttle: (forward ? 1 : 0) - (back ? 1 : 0),
    turn: (right ? 1 : 0) - (left ? 1 : 0),
    sprint: pressed.has('shift'),
    aim,
  };
}

export function getStickView(): TouchStickView {
  if (pointerId === null) {
    return { active: false, baseX: 0, baseY: 0, headX: 0, headY: 0, maxRadius: STICK_MAX_RADIUS };
  }
  const dx = headCanvasX - baseCanvasX;
  const dy = headCanvasY - baseCanvasY;
  const dist = Math.hypot(dx, dy);
  const scale = dist > STICK_MAX_RADIUS ? STICK_MAX_RADIUS / dist : 1;
  return {
    active: true,
    baseX: baseCanvasX,
    baseY: baseCanvasY,
    headX: baseCanvasX + dx * scale,
    headY: baseCanvasY + dy * scale,
    maxRadius: STICK_MAX_RADIUS,
  };
}
