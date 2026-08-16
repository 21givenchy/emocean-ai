import type { AdapterContext, Capability, SensorAdapter } from '../types';
import { ALL_CAPABILITIES } from '../types';

const UPDATE_INTERVAL_MS = 500;

/**
 * Synthetic data source for local development ONLY. Every value it reports
 * is tagged `source: 'simulation-dev-only'` so no UI can mistake it for a
 * real reading, and it refuses to construct at all unless every one of the
 * following is true:
 *
 *   1. `NEXT_PUBLIC_SENSOR_SIMULATION === 'true'`
 *   2. `process.env.NODE_ENV === 'development'`
 *   3. The caller passes `allowSimulation: true` explicitly
 *
 * This triple gate means a stray env var alone can never light up fake
 * physiology in a production build — the calling code has to opt in too.
 */
export function isSimulationAllowed(): boolean {
  return process.env.NEXT_PUBLIC_SENSOR_SIMULATION === 'true' && process.env.NODE_ENV === 'development';
}

export function createSimulationAdapter(options: { allowSimulation: boolean }): SensorAdapter {
  const id = 'simulation-dev-only';
  const capabilities: Capability[] = [...ALL_CAPABILITIES];

  let intervalId: ReturnType<typeof setInterval> | null = null;
  let t = 0;

  async function init(_ctx: AdapterContext): Promise<Capability[]> {
    if (!options.allowSimulation) {
      throw new Error('simulation adapter requires explicit allowSimulation:true from the caller');
    }
    if (!isSimulationAllowed()) {
      throw new Error(
        'simulation adapter requires NEXT_PUBLIC_SENSOR_SIMULATION="true" AND NODE_ENV=development'
      );
    }
    // eslint-disable-next-line no-console
    console.warn(
      '[SensorHub] SIMULATION MODE ACTIVE — all reported values are synthetic and must never appear in production.'
    );
    return capabilities;
  }

  function tick(ctx: AdapterContext) {
    t += UPDATE_INTERVAL_MS / 1000;
    const hr = 68 + Math.sin(t * 0.2) * 6;
    const bvpSample = Math.sin(t * (hr / 60) * 2 * Math.PI);

    ctx.report('heartRate', Math.round(hr), { derived: false });
    ctx.report('bvp', Array.from({ length: 30 }, (_, i) => Math.sin((t + i / 30) * (hr / 60) * 2 * Math.PI)));
    ctx.report('beatIntervals', [60000 / hr, 60000 / hr, 60000 / hr]);
    ctx.report('signalQuality', 0.9);
    ctx.report('prv', { rmssd: 35, sdnn: 45, meanRR: 60000 / hr, n: 20 });
    ctx.report('respiration', 14, { derived: true });
    ctx.report('facialExpression', { label: 'calm', scores: { calm: 0.6, joy: 0.2 } });
    ctx.report('faceDetection', { box: { x: 100, y: 80, w: 200, h: 220 } });
    ctx.report('headPose', { yaw: Math.sin(t * 0.1) * 5, pitch: 0, roll: 0 });
    ctx.report('eyeState', { left: { prob: 0.95, open: true }, right: { prob: 0.95, open: true }, bothClosed: false });
    ctx.report('gaze', { yaw: 0, pitch: 0, confidence: 0.9 });
    ctx.report('speaking', { jawOpen: 0.05, speaking: false });
    ctx.report('movementStability', { score: 0.92 }, { derived: true });
    void bvpSample;
  }

  let ctxHolder: AdapterContext | null = null;

  function start() {
    if (intervalId) return;
    intervalId = setInterval(() => {
      if (ctxHolder) tick(ctxHolder);
    }, UPDATE_INTERVAL_MS);
  }

  function stop() {
    if (intervalId) clearInterval(intervalId);
    intervalId = null;
  }

  function destroy() {
    stop();
    ctxHolder = null;
  }

  return {
    id,
    capabilities,
    init: async (ctx) => {
      ctxHolder = ctx;
      return init(ctx);
    },
    start,
    stop,
    destroy,
  };
}
