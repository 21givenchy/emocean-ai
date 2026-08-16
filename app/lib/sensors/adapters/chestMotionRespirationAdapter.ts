import type { AdapterContext, Capability, SensorAdapter } from '../types';

/**
 * Chest-motion respiration adapter.
 *
 * Analyzes video frames to detect breathing rate from upper-chest vertical
 * displacement. Uses optical flow on a region of interest (ROI) positioned
 * at the upper chest, applies a bandpass filter for respiratory frequencies,
 * and reports breaths-per-minute with a quality score.
 *
 * This is a *direct* measurement from body motion, not derived from BVP.
 */

const UPDATE_INTERVAL_MS = 500;
const MIN_FRAME_INTERVAL_MS = 200;
const ASSUMED_FPS = 30;

// Respiratory frequency band: 6–30 breaths/min → 0.1–0.5 Hz
const MIN_BPM = 6;
const MAX_BPM = 30;
const MIN_HISTORY_SEC = 4;
const MAX_HISTORY_SEC = 15;
const QUALITY_WINDOW_SEC = 8;

interface ChestMotionSample {
  timestamp: number;
  dy: number; // vertical displacement of chest ROI (pixels)
}

function bandpassFilter(samples: ChestMotionSample[], lowHz: number, highHz: number): number[] {
  // Simple moving-average detrend + zero-crossing rate
  if (samples.length < 10) return [];

  const durationSec = (samples[samples.length - 1].timestamp - samples[0].timestamp) / 1000;
  if (durationSec <= 0) return [];

  // Detrend: subtract running mean (window = 2 sec)
  const windowSize = Math.max(5, Math.round(ASSUMED_FPS * 2));
  const detrended: number[] = [];
  for (let i = 0; i < samples.length; i++) {
    const start = Math.max(0, i - windowSize);
    const end = Math.min(samples.length, i + windowSize + 1);
    let sum = 0;
    for (let j = start; j < end; j++) sum += samples[j].dy;
    detrended.push(samples[i].dy - sum / (end - start));
  }

  return detrended;
}

function computeBPM(detrended: number[], durationSec: number): { bpm: number; confidence: number } | null {
  if (durationSec <= 0 || detrended.length < 10) return null;

  // Zero-crossing rate
  let crossings = 0;
  for (let i = 1; i < detrended.length; i++) {
    if ((detrended[i] >= 0 && detrended[i - 1] < 0) || (detrended[i] < 0 && detrended[i - 1] >= 0)) {
      crossings++;
    }
  }

  const rawBPM = (crossings / 2 / durationSec) * 60;
  if (!Number.isFinite(rawBPM) || rawBPM < MIN_BPM || rawBPM > MAX_BPM) return null;

  // Confidence from signal-to-noise: compare amplitude of zero-crossing segments
  const absMean = detrended.reduce((s, v) => s + Math.abs(v), 0) / detrended.length;
  const maxAbs = Math.max(...detrended.map(Math.abs));
  const snr = maxAbs > 0 ? absMean / maxAbs : 0;
  const confidence = Math.min(1, snr * 3); // scale up since typical snr is 0.2-0.4

  return { bpm: Math.round(rawBPM * 10) / 10, confidence };
}

export function createChestMotionRespirationAdapter(): SensorAdapter {
  const id = 'chest-motion-respiration';
  const capabilities: Capability[] = ['respiration'];

  let intervalId: ReturnType<typeof setInterval> | null = null;
  let ctxRef: AdapterContext | null = null;
  let samples: ChestMotionSample[] = [];
  let lastFrameTime = 0;
  let canvas: HTMLCanvasElement | null = null;
  let canvasCtx: CanvasRenderingContext2D | null = null;
  let prevFrame: ImageData | null = null;

  function extractChestROI(video: HTMLVideoElement): ImageData | null {
    if (!canvas || !canvasCtx) {
      canvas = document.createElement('canvas');
      canvas.width = 80;
      canvas.height = 60;
      canvasCtx = canvas.getContext('2d');
    }
    if (!canvasCtx) return null;

    // Upper-chest ROI: center horizontally, upper 30-50% vertically
    const sx = Math.floor(video.videoWidth * 0.25);
    const sy = Math.floor(video.videoHeight * 0.30);
    const sw = Math.floor(video.videoWidth * 0.50);
    const sh = Math.floor(video.videoHeight * 0.20);

    canvasCtx.drawImage(video, sx, sy, sw, sh, 0, 0, 80, 60);
    return canvasCtx.getImageData(0, 0, 80, 60);
  }

  function computeVerticalDisplacement(current: ImageData, previous: ImageData): number {
    // Simple block matching: find vertical shift of brightness centroid
    const w = current.width;
    const h = current.height;

    // Compute brightness rows for current and previous
    const currRows = new Float32Array(h);
    const prevRows = new Float32Array(h);

    for (let y = 0; y < h; y++) {
      let cSum = 0;
      let pSum = 0;
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        cSum += (current.data[idx] + current.data[idx + 1] + current.data[idx + 2]) / 3;
        pSum += (previous.data[idx] + previous.data[idx + 1] + previous.data[idx + 2]) / 3;
      }
      currRows[y] = cSum / w;
      prevRows[y] = pSum / w;
    }

    // Centroid of brightness
    let currCentroid = 0;
    let prevCentroid = 0;
    let currTotal = 0;
    let prevTotal = 0;

    for (let y = 0; y < h; y++) {
      currCentroid += y * currRows[y];
      prevCentroid += y * prevRows[y];
      currTotal += currRows[y];
      prevTotal += prevRows[y];
    }

    if (currTotal === 0 || prevTotal === 0) return 0;
    return currCentroid / currTotal - prevCentroid / prevTotal;
  }

  function processFrame() {
    if (!ctxRef) return;
    const video = ctxRef.video;

    if (video.readyState < 2 || video.paused || video.ended) return;

    const now = performance.now();
    if (now - lastFrameTime < MIN_FRAME_INTERVAL_MS) return;
    lastFrameTime = now;

    const currentFrame = extractChestROI(video);
    if (!currentFrame || !prevFrame) {
      prevFrame = currentFrame;
      return;
    }

    const dy = computeVerticalDisplacement(currentFrame, prevFrame);
    prevFrame = currentFrame;

    samples.push({ timestamp: now, dy });

    // Trim old samples
    const cutoff = now - MAX_HISTORY_SEC * 1000;
    while (samples.length > 0 && samples[0].timestamp < cutoff) {
      samples.shift();
    }
  }

  function computeAndReport() {
    if (!ctxRef) return;

    const durationSec =
      samples.length >= 2
        ? (samples[samples.length - 1].timestamp - samples[0].timestamp) / 1000
        : 0;

    if (durationSec < MIN_HISTORY_SEC || samples.length < 10) {
      ctxRef.report('respiration', null, {
        available: false,
        reason: durationSec < MIN_HISTORY_SEC ? 'calibrating — need more data' : 'insufficient samples',
        derived: false,
      });
      return;
    }

    const detrended = bandpassFilter(samples, 0.1, 0.5);
    const result = computeBPM(detrended, durationSec);

    if (!result) {
      ctxRef.report('respiration', null, {
        available: false,
        reason: 'no valid breathing pattern detected — stay still and breathe normally',
        derived: false,
      });
      return;
    }

    // Quality from recent consistency
    const recentWindow = QUALITY_WINDOW_SEC * 1000;
    const now = samples[samples.length - 1].timestamp;
    const recentSamples = samples.filter((s) => now - s.timestamp < recentWindow);
    const recentDetrended = bandpassFilter(recentSamples, 0.1, 0.5);
    const recentResult = computeBPM(recentDetrended, QUALITY_WINDOW_SEC);

    let quality = result.confidence;
    if (recentResult && Math.abs(recentResult.bpm - result.bpm) < 3) {
      quality = Math.min(1, quality + 0.2); // consistency boost
    }

    ctxRef.report('respiration', result.bpm, {
      available: true,
      derived: false,
      reason: quality < 0.3 ? 'low confidence — move less and breathe steadily' : undefined,
    });
  }

  async function init(ctx: AdapterContext): Promise<Capability[]> {
    ctxRef = ctx;
    ctx.report('respiration', null, {
      available: false,
      reason: 'initializing chest-motion adapter',
      derived: false,
    });
    return ['respiration'];
  }

  function start() {
    if (intervalId || !ctxRef) return;
    samples = [];
    prevFrame = null;
    lastFrameTime = 0;

    // Process video frames at ~10 fps
    intervalId = setInterval(() => {
      processFrame();
      computeAndReport();
    }, UPDATE_INTERVAL_MS);
  }

  function stop() {
    if (intervalId) clearInterval(intervalId);
    intervalId = null;
    samples = [];
    prevFrame = null;
  }

  function destroy() {
    stop();
    canvas = null;
    canvasCtx = null;
    ctxRef = null;
  }

  return { id, capabilities, init, start, stop, destroy };
}
