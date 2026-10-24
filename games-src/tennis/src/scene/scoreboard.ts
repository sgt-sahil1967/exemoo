import * as THREE from 'three';
import { canvas, canvasTexture } from '../assets';

export interface BoardState {
  names: [string, string];
  games: [number, number];
  points: [string, string];
  server: 0 | 1 | null;
  headline: string;
  sub: string;
}

/** Big LED screen in the stadium, drawn onto a canvas texture. */
export class Scoreboard {
  group = new THREE.Group();
  private c: HTMLCanvasElement;
  private g: CanvasRenderingContext2D;
  private tex: THREE.CanvasTexture;

  constructor(width: number, accent: string) {
    [this.c, this.g] = canvas(1024, 440);
    this.tex = canvasTexture(this.c);
    const h = (width * 440) / 1024;
    const screenMat = new THREE.MeshBasicMaterial({ map: this.tex, toneMapped: false });
    screenMat.color.setScalar(1.15);
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(width, h), screenMat);
    screen.position.z = 0.16;
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(width + 0.6, h + 0.6, 0.3),
      new THREE.MeshStandardMaterial({ color: '#111419', roughness: 0.4, metalness: 0.6 }),
    );
    const strip = new THREE.Mesh(
      new THREE.BoxGeometry(width + 0.6, 0.12, 0.32),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(accent).multiplyScalar(2.2) }),
    );
    strip.position.y = -h / 2 - 0.3;
    this.group.add(frame, screen, strip);
    this.accent = accent;
    this.draw({ names: ['YOU', 'ROOKIE RAY'], games: [0, 0], points: ['0', '0'], server: null, headline: 'COURT ACE', sub: 'CENTRE COURT' });
  }

  private accent: string;

  draw(s: BoardState) {
    const g = this.g;
    const W = 1024;
    const H = 440;
    const bg = g.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#07101e');
    bg.addColorStop(1, '#0c1a30');
    g.fillStyle = bg;
    g.fillRect(0, 0, W, H);

    g.fillStyle = this.accent;
    g.font = 'italic 900 78px "Bebas Neue", "Arial Black", Impact, sans-serif';
    g.textBaseline = 'middle';
    g.textAlign = 'left';
    g.fillText(s.headline, 40, 70);
    g.fillStyle = 'rgba(255,255,255,0.6)';
    g.font = '600 30px "Outfit", Arial, sans-serif';
    g.textAlign = 'right';
    g.fillText(s.sub, W - 40, 72);

    const rows: [number, number][] = [
      [0, 205],
      [1, 330],
    ];
    for (const [i, y] of rows) {
      g.fillStyle = i === 0 ? 'rgba(80,140,255,0.16)' : 'rgba(255,80,90,0.14)';
      g.fillRect(30, y - 52, W - 60, 104);
      g.textAlign = 'left';
      g.fillStyle = '#fff';
      g.font = '800 60px "Outfit", Arial, sans-serif';
      g.fillText(s.names[i], 110, y + 2);
      if (s.server === i) {
        g.fillStyle = this.accent;
        g.beginPath();
        g.arc(70, y, 16, 0, Math.PI * 2);
        g.fill();
      }
      g.textAlign = 'center';
      g.fillStyle = '#fff';
      g.font = '900 76px "Outfit", Arial, sans-serif';
      g.fillText(String(s.games[i]), 760, y + 4);
      g.fillStyle = this.accent;
      g.fillText(s.points[i], 905, y + 4);
    }
    // LED dot texture.
    g.fillStyle = 'rgba(0,0,0,0.22)';
    for (let y = 0; y < H; y += 4) g.fillRect(0, y, W, 1);
    this.tex.needsUpdate = true;
  }
}
