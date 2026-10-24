/** BIRDIE entry point: boots the game into #app (3D) and #ui (DOM overlay). */
import './style.css';
import { Game } from './game/game';

const game = new Game(document.getElementById('app')!, document.getElementById('ui')!);
game.start();
if (import.meta.env.DEV) (window as unknown as { __game: Game }).__game = game;
