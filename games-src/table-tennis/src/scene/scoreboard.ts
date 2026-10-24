/**
 * In-world flip scoreboard on a stand. CanvasTexture redrawn only when the score changes;
 * the changed side's card does a quick flip (scale squash) as it updates.
 */
import { BoxGeometry, CanvasTexture, CylinderGeometry, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry } from 'three';
import { PALETTE } from '../core/contracts';
import { FONT, canvasTexture, makeCanvas, roundRect } from './textures';
import { mat } from './util';

export interface ScoreData {
  player: number;
  opponent: number;
  gamesP: number;
  gamesO: number;
  names: [string, string];
}

const CW = 512;
const CH = 300;

export class ScoreboardView {
  readonly group = new Group();
  private cards: { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; tex: CanvasTexture; mesh: Mesh; flip: number; shown: string }[] = [];
  private data: ScoreData = { player: 0, opponent: 0, gamesP: 0, gamesO: 0, names: ['You', 'CPU'] };
  private pending: (ScoreData | null)[] = [null, null];

  constructor() {
    const frameMat = mat('#f4f1ea', { rough: 0.55 });
    const dark = mat('#2a3042', { rough: 0.6, metal: 0.2 });
    // stand
    const pole = new Mesh(new CylinderGeometry(0.025, 0.03, 0.9, 10), dark);
    pole.position.y = 0.45;
    const base = new Mesh(new CylinderGeometry(0.22, 0.25, 0.04, 20), dark);
    base.position.y = 0.02;
    const frame = new Mesh(new BoxGeometry(0.98, 0.42, 0.07), frameMat);
    frame.position.y = 1.08;
    const header = new Mesh(new BoxGeometry(0.98, 0.07, 0.075), mat(PALETTE.ink, { rough: 0.6 }));
    header.position.y = 1.3;
    this.group.add(pole, base, frame, header);
    for (const m of [pole, base, frame, header]) {
      m.castShadow = true;
      m.receiveShadow = true;
    }
    // header label
    const [hc, hctx] = makeCanvas(512, 40);
    hctx.fillStyle = PALETTE.ink;
    hctx.fillRect(0, 0, 512, 40);
    hctx.fillStyle = '#ffffff';
    hctx.font = `800 26px ${FONT}`;
    hctx.textAlign = 'center';
    hctx.textBaseline = 'middle';
    hctx.fillText('S P I N S H O T', 256, 21);
    const hl = new Mesh(new PlaneGeometry(0.96, 0.066), new MeshBasicMaterial({ map: canvasTexture(hc), toneMapped: false }));
    hl.position.set(0, 1.3, 0.0385);
    this.group.add(hl);

    for (let i = 0; i < 2; i++) {
      const [canvas, ctx] = makeCanvas(CW, CH);
      const tex = canvasTexture(canvas);
      const mesh = new Mesh(new PlaneGeometry(0.46, 0.46 * (CH / CW)), new MeshStandardMaterial({ map: tex, roughness: 0.5, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.35 }));
      mesh.position.set(i === 0 ? -0.24 : 0.24, 1.075, 0.036);
      this.group.add(mesh);
      this.cards.push({ canvas, ctx, tex, mesh, flip: 1, shown: '' });
    }
    this.draw(0);
    this.draw(1);
  }

  set(s: ScoreData): void {
    this.data = { ...s, names: [s.names[0], s.names[1]] };
    for (let i = 0; i < 2; i++) {
      const key = this.key(i);
      if (key !== this.cards[i].shown) {
        this.cards[i].flip = 0;
        this.pending[i] = this.data;
      }
    }
  }

  private key(i: number): string {
    const d = this.data;
    return i === 0 ? `${d.names[0]}|${d.player}|${d.gamesP}` : `${d.names[1]}|${d.opponent}|${d.gamesO}`;
  }

  private draw(i: number): void {
    const c = this.cards[i];
    const ctx = c.ctx;
    const d = this.data;
    const name = d.names[i] ?? '';
    const pts = i === 0 ? d.player : d.opponent;
    const games = i === 0 ? d.gamesP : d.gamesO;
    const col = i === 0 ? PALETTE.accent : PALETTE.accent2;
    ctx.clearRect(0, 0, CW, CH);
    ctx.fillStyle = '#f4f1ea';
    ctx.fillRect(0, 0, CW, CH);
    // name tab
    ctx.fillStyle = col;
    roundRect(ctx, 14, 10, CW - 28, 54, 14);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = `800 34px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name.toUpperCase().slice(0, 12), CW / 2, 39);
    // flip card
    const x = 64;
    const y = 76;
    const w = CW - 128;
    const h = CH - 90;
    ctx.fillStyle = '#1f2537';
    roundRect(ctx, x, y, w, h, 22);
    ctx.fill();
    ctx.fillStyle = '#2a3148';
    roundRect(ctx, x, y, w, h / 2, 22);
    ctx.fill();
    ctx.fillRect(x, y + h / 2 - 20, w, 20);
    ctx.fillStyle = '#ffffff';
    ctx.font = `900 172px ${FONT}`;
    ctx.fillText(String(pts), CW / 2, y + h / 2 + 10);
    ctx.fillStyle = '#11151f';
    ctx.fillRect(x, y + h / 2 - 2, w, 4);
    // hinge pins
    ctx.fillStyle = '#8890a6';
    ctx.fillRect(x - 8, y + h / 2 - 9, 14, 18);
    ctx.fillRect(x + w - 6, y + h / 2 - 9, 14, 18);
    // games pips
    for (let g = 0; g < 3; g++) {
      ctx.fillStyle = g < games ? PALETTE.gold : 'rgba(29,35,51,0.18)';
      ctx.beginPath();
      ctx.arc(28, y + 40 + g * 56, 13, 0, Math.PI * 2);
      ctx.fill();
    }
    c.tex.needsUpdate = true;
    c.shown = this.key(i);
  }

  update(dt: number): void {
    for (let i = 0; i < 2; i++) {
      const c = this.cards[i];
      if (c.flip >= 1) continue;
      const before = c.flip;
      c.flip = Math.min(1, c.flip + dt / 0.32);
      if (before < 0.5 && c.flip >= 0.5 && this.pending[i]) {
        this.draw(i);
        this.pending[i] = null;
      }
      c.mesh.scale.y = Math.max(0.02, Math.abs(Math.cos(c.flip * Math.PI)));
    }
  }
}
