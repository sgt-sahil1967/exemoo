import { svgUrl } from '../assets';
import type { ThemeName } from '../scene/stadium';

export type Mode = 'match' | 'practice' | 'goal';
export type Grade = 'PERFECT' | 'GOOD' | 'EARLY' | 'LATE';

const $ = <T extends HTMLElement = HTMLElement>(sel: string) => document.querySelector(sel) as T;

const THUMBS: Record<ThemeName, string> = {
  midnight: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="ms" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#02050c"/><stop offset="1" stop-color="#13284d"/></linearGradient><radialGradient id="mg"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><rect width="320" height="180" fill="url(#ms)"/><g fill="url(#mg)"><circle cx="40" cy="22" r="22"/><circle cx="120" cy="16" r="18"/><circle cx="200" cy="16" r="18"/><circle cx="280" cy="22" r="22"/></g><path d="M0 70 L320 70 L320 110 L0 110Z" fill="#1a2233"/><path d="M0 74h320M0 84h320M0 94h320" stroke="#2f3b55" stroke-width="3"/><path d="M60 180 L110 98 L210 98 L260 180Z" fill="#2558c4"/><path d="M0 110 L320 110 L320 180 L0 180Z" fill="#14336e" opacity=".35"/><path d="M60 180 L110 98 L210 98 L260 180Z M90 180 L122 98 M230 180 L198 98 M160 180 L160 116 M100 150 L220 150 M116 116 L204 116" stroke="#fff" stroke-width="2" fill="none"/><path d="M100 124h120" stroke="#e8e8e8" stroke-width="4"/></svg>`,
  riviera: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="rs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3d8fe0"/><stop offset="1" stop-color="#d9eefb"/></linearGradient></defs><rect width="320" height="180" fill="url(#rs)"/><circle cx="250" cy="30" r="14" fill="#fff6d8"/><ellipse cx="70" cy="34" rx="40" ry="9" fill="#fff" opacity=".8"/><rect y="78" width="320" height="30" fill="#2fd0c8"/><path d="M0 86 L320 86 L320 112 L0 112Z" fill="#e9edf2"/><path d="M0 90h320M0 98h320M0 106h320" stroke="#2f6fb3" stroke-width="3"/><rect y="112" width="320" height="68" fill="#3f9a63"/><path d="M60 180 L110 112 L210 112 L260 180Z" fill="#2f7fd0"/><path d="M60 180 L110 112 L210 112 L260 180Z M160 180 L160 126 M100 156 L220 156 M114 126 L206 126" stroke="#fff" stroke-width="2" fill="none"/><path d="M100 134h120" stroke="#e8e8e8" stroke-width="4"/><path d="M296 112 q-6 -30 4 -50" stroke="#8b6b4a" stroke-width="4" fill="none"/><path d="M300 62 q-20 -4 -30 8 M300 62 q18 -6 26 6 M300 62 q-8 -16 -22 -16 M300 62 q10 -14 22 -12" stroke="#2f7d3a" stroke-width="5" fill="none" stroke-linecap="round"/></svg>`,
};

export class UI {
  onPlay: (m: Mode) => void = () => {};
  onTheme: (t: ThemeName) => void = () => {};
  onResume: () => void = () => {};
  onQuit: () => void = () => {};
  onPause: () => void = () => {};
  onMute: (m: boolean) => void = () => {};
  onAgain: () => void = () => {};

  private gradeTimer = 0;
  private calloutTimer = 0;
  private muted = false;

  constructor(theme: ThemeName) {
    const logo = svgUrl('logo');
    if (logo) $('#brand').innerHTML = `<img src="${logo}" alt="Court Ace" />`;

    for (const card of document.querySelectorAll<HTMLElement>('.stadium')) {
      const name = card.dataset.theme as ThemeName;
      const url = svgUrl(`thumb-${name}`);
      card.querySelector('.thumb')!.innerHTML = url ? `<img src="${url}" alt="" />` : THUMBS[name];
      card.addEventListener('click', () => {
        this.selectTheme(name);
        this.onTheme(name);
      });
    }
    this.selectTheme(theme);

    for (const b of document.querySelectorAll<HTMLElement>('[data-mode]')) {
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        this.onPlay(b.dataset.mode as Mode);
      });
    }
    $('#btn-pause').addEventListener('click', (e) => {
      e.stopPropagation();
      this.onPause();
    });
    $('#btn-resume').addEventListener('click', () => this.onResume());
    $('#btn-quit').addEventListener('click', () => this.onQuit());
    $('#btn-again').addEventListener('click', () => this.onAgain());
    $('#btn-menu').addEventListener('click', () => this.onQuit());
    $('#btn-mute').addEventListener('click', (e) => {
      e.stopPropagation();
      this.muted = !this.muted;
      $('#btn-mute').classList.toggle('off', this.muted);
      this.onMute(this.muted);
    });
    for (const el of document.querySelectorAll<HTMLElement>('#hud button, .overlay')) {
      el.addEventListener('pointerdown', (e) => e.stopPropagation());
    }
  }

  selectTheme(t: ThemeName) {
    for (const c of document.querySelectorAll<HTMLElement>('.stadium')) c.classList.toggle('selected', c.dataset.theme === t);
  }

  showMenu(show: boolean) {
    $('#menu').classList.toggle('hidden', !show);
    $('#hud').classList.toggle('hidden', show);
  }

  setGoal(count: number, target: number) {
    $('#goal-count').textContent = `${Math.min(count, target)}/${target}`;
    const bars = $('#goal-bars');
    bars.innerHTML = '';
    for (let i = 0; i < target; i++) {
      const s = document.createElement('span');
      if (i < count) s.className = 'on';
      bars.appendChild(s);
    }
    $('#goal-card').classList.toggle('done', count >= target);
  }

  scorebug(names: [string, string], games: [number, number], points: [string, string], server: 0 | 1 | null, visible: boolean) {
    $('#scorebug').classList.toggle('hidden', !visible);
    for (const i of [0, 1] as const) {
      const row = $(`#sb-${i}`);
      row.querySelector('.name')!.textContent = names[i];
      row.querySelector('.games')!.textContent = String(games[i]);
      row.querySelector('.pts')!.textContent = points[i];
      row.classList.toggle('serving', server === i);
    }
  }

  rally(n: number) {
    const el = $('#rally');
    el.querySelector('b')!.textContent = String(n);
    el.classList.toggle('hidden', n < 2);
  }

  progress(text: string | null) {
    const el = $('#progress');
    el.classList.toggle('hidden', !text);
    if (text) el.innerHTML = text;
  }

  grade(g: Grade, kmh: number) {
    const el = $('#grade');
    el.className = `grade ${g.toLowerCase()}`;
    el.innerHTML = `<span>${g}</span><small>${Math.round(kmh)} km/h</small>`;
    void el.offsetWidth;
    el.classList.add('show');
    clearTimeout(this.gradeTimer);
    this.gradeTimer = window.setTimeout(() => el.classList.remove('show'), 900);
  }

  callout(text: string, sub = '', tone: 'good' | 'bad' | 'neutral' = 'neutral', ms = 1700) {
    const el = $('#callout');
    el.className = `callout ${tone}`;
    el.innerHTML = `<span>${text}</span>${sub ? `<small>${sub}</small>` : ''}`;
    void el.offsetWidth;
    el.classList.add('show');
    clearTimeout(this.calloutTimer);
    this.calloutTimer = window.setTimeout(() => el.classList.remove('show'), ms);
  }

  hint(text: string | null) {
    const el = $('#hint');
    el.classList.toggle('hidden', !text);
    if (text) el.innerHTML = text;
  }

  pause(show: boolean) {
    $('#pause').classList.toggle('hidden', !show);
  }

  result(title: string, sub: string, stats: [string, string][], won: boolean) {
    $('#result-title').textContent = title;
    $('#result-title').className = won ? 'won' : 'lost';
    $('#result-sub').textContent = sub;
    $('#result-stats').innerHTML = stats.map(([k, v]) => `<div><b>${v}</b><span>${k}</span></div>`).join('');
    $('#result').classList.remove('hidden');
  }

  hideResult() {
    $('#result').classList.add('hidden');
  }
}
