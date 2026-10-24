// Pure tennis scoring for a single set: games to 6 (win by 2), tiebreak to 7 at 6–6.
export type Side = 0 | 1;
export const other = (s: Side): Side => (s === 0 ? 1 : 0);

export interface PointOutcome {
  gameWinner: Side | null;
  setWinner: Side | null;
}

const NAMES = ['0', '15', '30', '40'];

export class SetScore {
  points: [number, number] = [0, 0];
  games: [number, number] = [0, 0];
  tiebreak = false;
  winner: Side | null = null;
  private gameServer: Side;
  private tbFirstServer: Side = 0;

  constructor(firstServer: Side = 0) {
    this.gameServer = firstServer;
  }

  get server(): Side {
    if (!this.tiebreak) return this.gameServer;
    const n = this.points[0] + this.points[1];
    if (n === 0) return this.tbFirstServer;
    // After the first point, serve alternates every two points.
    return Math.floor((n - 1) / 2) % 2 === 0 ? other(this.tbFirstServer) : this.tbFirstServer;
  }

  get serveSide(): 'deuce' | 'ad' {
    return (this.points[0] + this.points[1]) % 2 === 0 ? 'deuce' : 'ad';
  }

  pointWon(w: Side): PointOutcome {
    if (this.winner !== null) return { gameWinner: null, setWinner: this.winner };
    this.points[w]++;
    const p = this.points[w];
    const q = this.points[other(w)];
    if (this.tiebreak) {
      if (p >= 7 && p - q >= 2) {
        this.games[w]++;
        this.winner = w;
        return { gameWinner: w, setWinner: w };
      }
      return { gameWinner: null, setWinner: null };
    }
    if (p >= 4 && p - q >= 2) return this.winGame(w);
    return { gameWinner: null, setWinner: null };
  }

  private winGame(w: Side): PointOutcome {
    this.games[w]++;
    this.points = [0, 0];
    this.gameServer = other(this.gameServer);
    const g = this.games[w];
    const h = this.games[other(w)];
    if ((g >= 6 && g - h >= 2) || g === 7) {
      this.winner = w;
      return { gameWinner: w, setWinner: w };
    }
    if (this.games[0] === 6 && this.games[1] === 6) {
      this.tiebreak = true;
      this.tbFirstServer = this.gameServer;
    }
    return { gameWinner: w, setWinner: null };
  }

  /** Display strings for each side's point score. */
  pointLabels(): [string, string] {
    const [a, b] = this.points;
    if (this.tiebreak) return [String(a), String(b)];
    if (a >= 3 && b >= 3) {
      if (a === b) return ['40', '40'];
      return a > b ? ['AD', '40'] : ['40', 'AD'];
    }
    return [NAMES[Math.min(a, 3)], NAMES[Math.min(b, 3)]];
  }

  /** 'deuce', 'adv' + side, game/set point info for callouts. */
  status(): { deuce: boolean; adv: Side | null; gamePoint: Side | null; setPoint: Side | null } {
    const [a, b] = this.points;
    const deuce = !this.tiebreak && a >= 3 && a === b;
    const adv: Side | null = !this.tiebreak && a >= 3 && b >= 3 && a !== b ? (a > b ? 0 : 1) : null;
    let gamePoint: Side | null = null;
    for (const s of [0, 1] as Side[]) {
      const p = this.points[s];
      const q = this.points[other(s)];
      const need = this.tiebreak ? 6 : 3;
      if (p >= need && p - q >= 1) gamePoint = s;
    }
    let setPoint: Side | null = null;
    if (gamePoint !== null) {
      const g = this.games[gamePoint] + 1;
      const h = this.games[other(gamePoint)];
      if (this.tiebreak || (g >= 6 && g - h >= 2) || g === 7) setPoint = gamePoint;
    }
    return { deuce, adv, gamePoint, setPoint };
  }

  /** Debug helper: jump to 6–6. */
  forceTiebreak() {
    this.games = [6, 6];
    this.points = [0, 0];
    this.tiebreak = true;
    this.tbFirstServer = this.gameServer;
  }
}
