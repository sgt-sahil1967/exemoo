import './style.css';
import { Game } from './game/Game';

const root = document.getElementById('app')!;
const game = new Game(root);
if (import.meta.env.DEV) (window as unknown as { __game: Game }).__game = game;
