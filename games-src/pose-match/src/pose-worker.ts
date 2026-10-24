// Runs pose inference off the main thread so rendering never waits on the model.
import { ModelVariant, PoseDetector } from './pose-detector';

export type WorkerIn =
  | { type: 'init'; wasmBase: string; modelBase: string; model: ModelVariant; numPoses: number }
  | { type: 'frame'; bitmap: ImageBitmap; ts: number };

export type WorkerOut =
  | { type: 'ready'; delegate: string; model: ModelVariant }
  | { type: 'error'; message: string }
  | { type: 'result'; count: number; image: Float32Array; world: Float32Array; inferenceMs: number; ts: number };

const detector = new PoseDetector();
let lastTs = -1;

self.onmessage = async (e: MessageEvent<WorkerIn>) => {
  const msg = e.data;
  if (msg.type === 'init') {
    try {
      await detector.init(msg.wasmBase, msg.modelBase, msg.model, true, msg.numPoses);
      post({ type: 'ready', delegate: detector.delegate, model: detector.model });
    } catch (err) {
      post({ type: 'error', message: String((err as Error)?.message ?? err) });
    }
    return;
  }
  // VIDEO mode needs strictly increasing timestamps.
  const ts = Math.max(msg.ts, lastTs + 1);
  lastTs = ts;
  try {
    const r = detector.detect(msg.bitmap, ts);
    if (r) post({ type: 'result', ...r }, [r.image.buffer, r.world.buffer]);
    else post({ type: 'result', count: 0, image: new Float32Array(0), world: new Float32Array(0), inferenceMs: 0, ts });
  } catch (err) {
    post({ type: 'error', message: String((err as Error)?.message ?? err) });
  } finally {
    msg.bitmap.close();
  }
};

function post(m: WorkerOut, transfer: Transferable[] = []) {
  (self as unknown as { postMessage(m: WorkerOut, t: Transferable[]): void }).postMessage(m, transfer);
}
