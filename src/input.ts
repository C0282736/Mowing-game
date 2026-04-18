export interface InputState {
  throttle: number;
  turn: number;
  sprint: boolean;
}

const pressed = new Set<string>();

export function initInput(): void {
  window.addEventListener('keydown', (e) => {
    pressed.add(e.key.toLowerCase());
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(e.key.toLowerCase())) {
      e.preventDefault();
    }
  });
  window.addEventListener('keyup', (e) => {
    pressed.delete(e.key.toLowerCase());
  });
  window.addEventListener('blur', () => pressed.clear());
}

export function readInput(): InputState {
  const forward = pressed.has('w') || pressed.has('arrowup');
  const back = pressed.has('s') || pressed.has('arrowdown');
  const left = pressed.has('a') || pressed.has('arrowleft');
  const right = pressed.has('d') || pressed.has('arrowright');
  return {
    throttle: (forward ? 1 : 0) - (back ? 1 : 0),
    turn: (right ? 1 : 0) - (left ? 1 : 0),
    sprint: pressed.has('shift'),
  };
}
