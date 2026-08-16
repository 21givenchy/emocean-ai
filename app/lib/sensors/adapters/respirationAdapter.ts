import type { AdapterContext, Capability, SensorAdapter } from '../types';

const UPDATE_INTERVAL_MS = 1000;
const MIN_SAMPLES = 60;
const MIN_BREATH_RATE = 6;
const MAX_BREATH_RATE = 30;
/** Approximate BVP sample rate assumed for duration math (both rPPG sources sample at ~30 fps). */
const ASSUMED_SAMPLE_HZ = 30;

/**
 * Respiration is not measured directly by any adapter — it is *derived*
 * from whichever BVP waveform is currently active (vitalcamera-sdk or the
 * green-channel fallback), via zero-crossing rate on the low-frequency
 * envelope. Always reported with `derived: true` so consumers never
 * mistake it for a dedicated respiration sensor. Reports unavailable
 * whenever the upstream BVP signal itself is unavailable — never invents a
 * breathing rate from nothing.
 */
export function createRespirationAdapter(): SensorAdapter {
  const id = 'respiration-derived';
  const capabilities: Capability[] = ['respiration'];

  let intervalId: ReturnType<typeof setInterval> | null = null;
  let ctxRef: AdapterContext | null = null;

  function computeAndReport(ctx: AdapterContext) {
    const bvpField = ctx.getSnapshot().bvp;
    if (!bvpField.available || !bvpField.value || bvpField.value.length < MIN_SAMPLES) {
      ctx.report('respiration', null, {
        available: false,
        reason: bvpField.available ? 'insufficient BVP samples' : 'no BVP source available',
        derived: true,
      });
      return;
    }

    const samples = bvpField.value;
    const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
    const detrended = samples.map((s) => s - mean);

    let zeroCrossings = 0;
    for (let i = 1; i < detrended.length; i++) {
      if ((detrended[i] >= 0 && detrended[i - 1] < 0) || (detrended[i] < 0 && detrended[i - 1] >= 0)) {
        zeroCrossings++;
      }
    }

    const durationSec = samples.length / ASSUMED_SAMPLE_HZ;
    if (durationSec <= 0) {
      ctx.report('respiration', null, { available: false, reason: 'insufficient duration', derived: true });
      return;
    }

    const rawRate = (zeroCrossings / 2 / durationSec) * 60;
    if (!Number.isFinite(rawRate) || rawRate < MIN_BREATH_RATE || rawRate > MAX_BREATH_RATE) {
      ctx.report('respiration', null, {
        available: false,
        reason: 'estimate out of physiological range',
        derived: true,
      });
      return;
    }

    ctx.report('respiration', Math.round(rawRate * 10) / 10, { derived: true });
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
  }

  return { id, capabilities, init, start, stop, destroy };
}
