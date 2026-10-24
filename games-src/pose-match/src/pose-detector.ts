import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';

export type ModelVariant = 'lite' | 'full';

/** Flat, transferable pose result: 33 landmarks each. */
export interface PoseFrame {
  /** Number of people found; arrays hold `count` consecutive blocks of 33 landmarks. */
  count: number;
  /** x, y, z, visibility per image landmark (normalised). */
  image: Float32Array;
  /** x, y, z per world landmark (metres, hip-centred). */
  world: Float32Array;
  inferenceMs: number;
  ts: number;
}

export const N_LANDMARKS = 33;

/** Thin wrapper over PoseLandmarker that runs in a worker or on the main thread. */
export class PoseDetector {
  private landmarker: PoseLandmarker | null = null;
  delegate: 'GPU' | 'CPU' = 'GPU';
  model: ModelVariant = 'full';

  /**
   * @param wasmBase absolute URL of the folder holding the MediaPipe wasm files
   * @param modelBase absolute URL of the folder holding pose_landmarker_<variant>.task
   * @param useModule true inside module workers (no importScripts there)
   */
  async init(wasmBase: string, modelBase: string, model: ModelVariant, useModule: boolean, numPoses = 1) {
    const fileset = await FilesetResolver.forVisionTasks(wasmBase, useModule);
    const make = (delegate: 'GPU' | 'CPU') =>
      PoseLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: `${modelBase}pose_landmarker_${model}.task`, delegate },
        runningMode: 'VIDEO',
        numPoses,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
    this.landmarker?.close();
    try {
      this.landmarker = await make('GPU');
      this.delegate = 'GPU';
    } catch {
      this.landmarker = await make('CPU');
      this.delegate = 'CPU';
    }
    this.model = model;
  }

  detect(frame: ImageBitmap | HTMLVideoElement, ts: number): PoseFrame | null {
    if (!this.landmarker) return null;
    const t0 = performance.now();
    const res = this.landmarker.detectForVideo(frame, ts);
    const inferenceMs = performance.now() - t0;
    const count = Math.min(res.landmarks.length, res.worldLandmarks.length);
    const image = new Float32Array(count * N_LANDMARKS * 4);
    const world = new Float32Array(count * N_LANDMARKS * 3);
    for (let p = 0; p < count; p++) {
      const lm = res.landmarks[p], wl = res.worldLandmarks[p];
      for (let i = 0; i < N_LANDMARKS; i++) {
        const a = (p * N_LANDMARKS + i) * 4, b = (p * N_LANDMARKS + i) * 3;
        image[a] = lm[i].x;
        image[a + 1] = lm[i].y;
        image[a + 2] = lm[i].z;
        image[a + 3] = lm[i].visibility ?? 1;
        world[b] = wl[i].x;
        world[b + 1] = wl[i].y;
        world[b + 2] = wl[i].z;
      }
    }
    return { count, image, world, inferenceMs, ts };
  }
}
