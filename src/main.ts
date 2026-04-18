import { startGame } from './game.js';

const canvas = document.getElementById('game');
if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error('#game canvas not found');
}

startGame(canvas);
