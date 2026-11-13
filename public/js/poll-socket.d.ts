/** Types for poll-socket.js (used by the TypeScript games' own phone links). */
export declare class PollSocket {
  constructor(url: string, opts?: { fetchImpl?: typeof fetch; pollMs?: number });
  readyState: number;
  pollMs: number;
  binaryType: string;
  onopen: ((ev: unknown) => void) | null;
  onmessage: ((ev: { data: string }) => void) | null;
  onclose: ((ev: { code: number }) => void) | null;
  onerror: ((ev: unknown) => void) | null;
  send(data: string): void;
  close(code?: number): void;
}
export declare function openSignal(url: string, opts?: { fetchImpl?: typeof fetch; pollMs?: number }): WebSocket;
export declare function setPoll(sock: unknown, ms: number): void;
/** Poll interval for a screen-side link in this state (same policy as ScreenLink). */
export declare function screenPollMs(status: string, transport: string): number;
