/**
 * SPINSHOT — ITTF rules: rally referee and match scoreboard.
 */
import { other, type BallEvent, type FaultReason, type PointResult, type Side } from '../core/contracts';

type Phase = 'idle' | 'serve' | 'rally' | 'over';

export class Referee {
  private _phase: Phase = 'idle';
  private _rally = 0;
  private _expecting: Side = 'player';
  private _lastHitter: Side | null = null;
  private server: Side = 'player';
  /** Sides of table contacts since the last strike. */
  private bounces: Side[] = [];
  /** Ball touched the net / posts since the last strike. */
  private netSinceHit = false;

  get phase(): Phase { return this._phase; }
  get rally(): number { return this._rally; }
  get expecting(): Side { return this._expecting; }
  get lastHitter(): Side | null { return this._lastHitter; }

  /** True while the ball is in flight from the serve (not yet touched by the receiver). */
  private get serveFlight(): boolean {
    return this._rally === 1;
  }

  get readyToStrike(): boolean {
    if (this._phase !== 'serve' && this._phase !== 'rally') return false;
    if (this._rally === 0) return this._expecting === this.server; // server about to serve
    const recv = this._expecting;
    if (this.serveFlight) return this.bounces.length === 2 && this.bounces[0] === this.server && this.bounces[1] === recv;
    return this.bounces.length === 1 && this.bounces[0] === recv;
  }

  startRally(server: Side): void {
    this.server = server;
    this._phase = 'serve';
    this._rally = 0;
    this._expecting = server;
    this._lastHitter = null;
    this.bounces = [];
    this.netSinceHit = false;
  }

  private end(winner: Side, reason: FaultReason | 'winner', faultBy?: Side): PointResult {
    this._phase = 'over';
    // An ace: the serve was never touched by the receiver and the server won the point.
    const ace = this._rally === 1 && winner === this.server && reason !== 'winner' && faultBy === other(this.server);
    return { winner, reason, faultBy, rally: this._rally, ace };
  }

  onHit(by: Side): PointResult | null {
    if (this._phase !== 'serve' && this._phase !== 'rally') return null;
    if (this._rally === 0) {
      if (by !== this.server) return this.end(this.server, 'volley', by); // receiver struck before the serve
      this._rally = 1;
      this._lastHitter = by;
      this._expecting = other(by);
      this.bounces = [];
      this.netSinceHit = false;
      this._phase = 'rally';
      return null;
    }
    if (by === this._lastHitter) {
      // struck twice in succession (or again before the opponent)
      return this.end(other(by), 'double-hit', by);
    }
    if (!this.readyToStrike) {
      // Struck before the ball bounced on the striker's half (volley / obstruction).
      return this.end(other(by), 'volley', by);
    }
    this._rally++;
    this._lastHitter = by;
    this._expecting = other(by);
    this.bounces = [];
    this.netSinceHit = false;
    return null;
  }

  onEvent(ev: BallEvent): PointResult | 'let' | null {
    if (this._phase !== 'rally' || this._rally === 0 || !this._lastHitter) return null;
    const hitter = this._lastHitter;
    const recv = other(hitter);
    switch (ev.type) {
      case 'net':
        this.netSinceHit = true;
        return null;
      case 'bounce':
      case 'edge': {
        const s = ev.side;
        const b = this.bounces;
        if (this.serveFlight) {
          if (b.length === 0) {
            if (s !== hitter) return this.end(recv, 'serve-fault', hitter); // missed own half
            b.push(s);
            return null;
          }
          if (b.length === 1) {
            if (s === hitter) return this.end(recv, this.netSinceHit ? 'net' : 'serve-fault', hitter);
            b.push(s);
            if (this.netSinceHit) {
              this._phase = 'over';
              return 'let';
            }
            return null;
          }
          // third contact without the receiver striking: receiver failed
          return this.end(hitter, 'double-bounce', recv);
        }
        if (b.length === 0) {
          if (s === hitter) return this.end(recv, this.netSinceHit ? 'net' : 'own-side', hitter);
          b.push(s);
          return null;
        }
        return this.end(hitter, 'double-bounce', recv);
      }
      case 'floor':
      case 'out': {
        const legal = this.readyToStrike;
        if (legal) return this.end(hitter, 'missed', recv);
        // Never reached the receiver's half legally.
        const z = ev.pos.z;
        const fellOnHitterSide = (z >= 0 ? 'player' : 'opponent') === hitter;
        const reason: FaultReason = this.netSinceHit && fellOnHitterSide ? 'net' : this.serveFlight && this.bounces.length === 0 ? 'serve-fault' : 'out';
        return this.end(recv, reason, hitter);
      }
    }
    return null;
  }
}

export class Scoreboard {
  readonly points: Record<Side, number> = { player: 0, opponent: 0 };
  readonly games: Record<Side, number> = { player: 0, opponent: 0 };
  readonly gameScores: Array<Record<Side, number>> = [];
  private gameFirstServer: Side;
  private finished: Side | null = null;

  constructor(readonly gamesToWin: number, readonly firstServer: Side, readonly pointsPerGame = 11) {
    this.gameFirstServer = firstServer;
  }

  /** Winner of the match, once decided. */
  get matchWinner(): Side | null { return this.finished; }

  server(): Side {
    const p = this.points.player + this.points.opponent;
    const d = this.pointsPerGame - 1;
    const deuceAt = 2 * d;
    const changes = p < deuceAt ? Math.floor(p / 2) : d + (p - deuceAt);
    return changes % 2 === 0 ? this.gameFirstServer : other(this.gameFirstServer);
  }

  private wins(s: Side, extra: number): boolean {
    const me = this.points[s] + extra;
    return me >= this.pointsPerGame && me - this.points[other(s)] >= 2;
  }

  award(winner: Side): { gameWon?: Side; matchWon?: Side } {
    if (this.finished) return { matchWon: this.finished };
    this.points[winner]++;
    if (!this.wins(winner, 0)) return {};
    this.gameScores.push({ player: this.points.player, opponent: this.points.opponent });
    this.games[winner]++;
    this.points.player = 0;
    this.points.opponent = 0;
    this.gameFirstServer = other(this.gameFirstServer);
    if (this.games[winner] >= this.gamesToWin) {
      this.finished = winner;
      return { gameWon: winner, matchWon: winner };
    }
    return { gameWon: winner };
  }

  gamePoint(): Side | null {
    if (this.finished) return null;
    if (this.wins('player', 1)) return 'player';
    if (this.wins('opponent', 1)) return 'opponent';
    return null;
  }

  matchPoint(): Side | null {
    const g = this.gamePoint();
    return g && this.games[g] + 1 >= this.gamesToWin ? g : null;
  }

  deuce(): boolean {
    const d = this.pointsPerGame - 1;
    return this.points.player >= d && this.points.player === this.points.opponent;
  }
}
