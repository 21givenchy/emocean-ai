import type { AdapterContext, Capability, SensorAdapter } from '../types';

const WINDOW_SIZE = 150;
const MAX_BEATS = 50;

/**
 * Forehead green-channel peak-detection rPPG — a lightweight, dependency-free
 * heart-rate estimator used only when `vitalcamera-sdk`'s rPPG path fails to
 * initialize. Far less accurate than the SDK's SSM-based model, but keeps
 * heart rate / BVP available on unsupported browsers rather than going dark.
 */
export function createGreenChannelRppgAdapter(): SensorAdapter {
  const id = 'green-channel-rppg';
  const capabilities: Capability[] = ['heartRate', 'bvp', 'beatIntervals', 'signalQuality', 'prv'];

  let rafId: number | null = null;
  let running = false;
  let ctxRef: AdapterContext | null = null;

  const samples: number[] = [];
  const timestamps: number[] = [];
  const beatTimestamps: number[] = [];
  const rrIntervals: number[] = [];
  const bpmHistory: number[] = [];
  const scratch = document.createElement('canvas');
  scratch.width = 1;
  scratch.height = 1;
  const scratchCtx = scratch.getContext('2d');

  function extractForeheadColor(video: HTMLVideoElement) {
    if (!scratchCtx || video.videoWidth === 0) return null;
    const x = Math.floor(video.videoWidth * 0.5);
    const y = Math.floor(video.videoHeight * 0.3);
    scratchCtx.drawImage(video, x, y, 10, 10, 0, 0, 1, 1);
    const pixel = scratchCtx.getImageData(0, 0, 1, 1).data;
    return { r: pixel[0], g: pixel[1], b: pixel[2] };
  }

  function findPeaks(): number[] {
    if (samples.length < 10) return [];
    const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
    const detrended = samples.map((s) => s - mean);
    const std = Math.sqrt(detrended.reduce((a, b) => a + b * b, 0) / detrended.length);
    const threshold = std * 0.3;

    const peaks: number[] = [];
    for (let i = 2; i < detrended.length - 2; i++) {
      if (
        detrended[i] > detrended[i - 1] &&
        detrended[i] > detrended[i + 1] &&
        detrended[i] > detrended[i - 2] &&
        detrended[i] > detrended[i + 2] &&
        detrended[i] > threshold
      ) {
        peaks.push(i);
      }
    }
    return peaks;
  }

  function computeAndReport(ctx: AdapterContext) {
    const peaks = findPeaks();

    if (peaks.length >= 2) {
      for (let i = 1; i < peaks.length; i++) {
        const interval = timestamps[peaks[i]] - timestamps[peaks[i - 1]];
        if (interval > 300 && interval < 2000) {
          const lastBeat = timestamps[peaks[i]];
          if (!beatTimestamps.includes(lastBeat)) {
            beatTimestamps.push(lastBeat);
            rrIntervals.push(interval);
          }
        }
      }
    }
    if (beatTimestamps.length > MAX_BEATS) beatTimestamps.splice(0, beatTimestamps.length - MAX_BEATS);
    if (rrIntervals.length > MAX_BEATS) rrIntervals.splice(0, rrIntervals.length - MAX_BEATS);

    ctx.report('bvp', samples.slice(-100));
    ctx.report('beatIntervals', [...rrIntervals]);

    if (rrIntervals.length >= 2) {
      const recentRR = rrIntervals.slice(-5);
      const avgRR = recentRR.reduce((a, b) => a + b, 0) / recentRR.length;
      let heartRate = Math.round(60000 / avgRR);
      bpmHistory.push(heartRate);
      if (bpmHistory.length > 5) bpmHistory.shift();
      const sorted = [...bpmHistory].sort((a, b) => a - b);
      heartRate = sorted[Math.floor(sorted.length / 2)];
      ctx.report('heartRate', heartRate);
    } else {
      ctx.report('heartRate', null, { available: false, reason: 'warming up' });
    }

    if (rrIntervals.length >= 5) {
      const meanRR = rrIntervals.reduce((a, b) => a + b, 0) / rrIntervals.length;
      let sumSqDiff = 0;
      for (let i = 1; i < rrIntervals.length; i++) sumSqDiff += (rrIntervals[i] - rrIntervals[i - 1]) ** 2;
      const rmssd = Math.sqrt(sumSqDiff / (rrIntervals.length - 1));
      let sumVar = 0;
      for (const rr of rrIntervals) sumVar += (rr - meanRR) ** 2;
      const sdnn = Math.sqrt(sumVar / rrIntervals.length);
      ctx.report('prv', { rmssd, sdnn, meanRR, n: rrIntervals.length });
    } else {
      ctx.report('prv', null, { available: false, reason: 'too_few_peaks' });
    }

    let signalQuality = 0;
    if (samples.length >= 30) {
      const recent = samples.slice(-30);
      const mean = recent.reduce((a, b) => a + b, 0) / recent.length;
      const variance = recent.reduce((a, b) => a + (b - mean) ** 2, 0) / recent.length;
      signalQuality = Math.min(1, variance * 10000 * 0.5 + (rrIntervals.length >= 3 ? 0.15 : 0));
    }
    ctx.report('signalQuality', signalQuality);
  }

  function tick() {
    if (!running || !ctxRef) return;
    const video = ctxRef.video;
    if (video.readyState >= 2) {
      const color = extractForeheadColor(video);
      if (color) {
        const greenAvg = color.g / (color.r + color.g + color.b + 1);
        samples.push(greenAvg);
        timestamps.push(performance.now());
        if (samples.length > WINDOW_SIZE) {
          samples.shift();
          timestamps.shift();
        }
        computeAndReport(ctxRef);
      }
    }
    rafId = requestAnimationFrame(tick);
  }

  async function init(ctx: AdapterContext): Promise<Capability[]> {
    ctxRef = ctx;
    return capabilities;
  }

  function start() {
    if (running) return;
    running = true;
    rafId = requestAnimationFrame(tick);
  }

  function stop() {
    running = false;
    if (rafId != null) cancelAnimationFrame(rafId);
    rafId = null;
  }

  function destroy() {
    stop();
    samples.length = 0;
    timestamps.length = 0;
    beatTimestamps.length = 0;
    rrIntervals.length = 0;
    bpmHistory.length = 0;
  }

  return { id, capabilities, init, start, stop, destroy };
}
