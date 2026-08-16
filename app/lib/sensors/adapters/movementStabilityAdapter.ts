import type { AdapterContext, Capability, SensorAdapter } from '../types';

const UPDATE_INTERVAL_MS = 500;
const WINDOW_SIZE = 10;
/** Empirical normalization: jitter values above this (px/frame + deg/frame, blended) count as "fully unstable". */
const JITTER_NORMALIZER = 40;

interface Sample {
  boxCenter: { x: number; y: number } | null;
  headPose: { yaw: number; pitch: number; roll: number } | null;
}

/**
 * Movement/stability is not measured directly — it is *derived* from the
 * rolling variance of the face bounding-box center and head-pose angles,
 * whichever face pipeline is currently active. Always reported with
 * `derived: true`. Unavailable whenever face detection itself is
 * unavailable, since there is nothing to measure jitter against.
 */
export function createMovementStabilityAdapter(): SensorAdapter {
  const id = 'movement-stability-derived';
  const capabilities: Capability[] = ['movementStability'];

  let intervalId: ReturnType<typeof setInterval> | null = null;
  let ctxRef: AdapterContext | null = null;
  const history: Sample[] = [];

  function computeAndReport(ctx: AdapterContext) {
    const snapshot = ctx.getSnapshot();
    const face = snapshot.faceDetection;

    if (!face.available || !face.value) {
      history.length = 0;
      ctx.report('movementStability', null, {
        available: false,
        reason: 'no face detected',
        derived: true,
      });
      return;
    }

    const box = face.value.box;
    const headPose = snapshot.headPose.available ? snapshot.headPose.value : null;

    history.push({
      boxCenter: { x: box.x + box.w / 2, y: box.y + box.h / 2 },
      headPose,
    });
    if (history.length > WINDOW_SIZE) history.shift();

    if (history.length < 3) {
      ctx.report('movementStability', null, { available: false, reason: 'warming up', derived: true });
      return;
    }

    let posJitter = 0;
    let poseJitter = 0;
    let count = 0;
    for (let i = 1; i < history.length; i++) {
      const prev = history[i - 1];
      const curr = history[i];
      if (prev.boxCenter && curr.boxCenter) {
        posJitter += Math.hypot(curr.boxCenter.x - prev.boxCenter.x, curr.boxCenter.y - prev.boxCenter.y);
        count++;
      }
      if (prev.headPose && curr.headPose) {
        poseJitter +=
          Math.abs(curr.headPose.yaw - prev.headPose.yaw) +
          Math.abs(curr.headPose.pitch - prev.headPose.pitch) +
          Math.abs(curr.headPose.roll - prev.headPose.roll);
      }
    }
    if (count === 0) {
      ctx.report('movementStability', null, { available: false, reason: 'insufficient history', derived: true });
      return;
    }

    const avgJitter = (posJitter + poseJitter) / count;
    const score = Math.max(0, Math.min(1, 1 - avgJitter / JITTER_NORMALIZER));
    ctx.report('movementStability', { score: Math.round(score * 100) / 100 }, { derived: true });
  }

  async function init(ctx: AdapterContext): Promise<Capability[]> {
    ctxRef = ctx;
    return capabilities;
  }

  function start() {
    if (intervalId || !ctxRef) return;
    intervalId = setInterval(() => computeAndReport(ctxRef as AdapterContext), UPDATE_INTERVAL_MS);
  }

  function stop() {
    if (intervalId) clearInterval(intervalId);
    intervalId = null;
  }

  function destroy() {
    stop();
    history.length = 0;
  }

  return { id, capabilities, init, start, stop, destroy };
}
