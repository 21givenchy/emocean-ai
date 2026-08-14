"use client";

import React, { useRef, useState, useEffect, useCallback } from 'react';

type ExpressionKey = 'joy' | 'calm' | 'focus' | 'surprise' | 'tense' | 'curious' | 'drowsy' | 'talking' | 'sad' | 'angry' | 'frustrated';

const expressionMeta: Record<ExpressionKey, { label: string; color: string }> = {
  joy: { label: 'Joy', color: 'bg-[#f28b72]' },
  calm: { label: 'Calm', color: 'bg-[#8bc8b2]' },
  focus: { label: 'Focus', color: 'bg-[#20334a]' },
  surprise: { label: 'Surprise', color: 'bg-[#e0b23c]' },
  tense: { label: 'Tense', color: 'bg-[#9a483b]' },
  curious: { label: 'Curious', color: 'bg-[#5b7fa6]' },
  drowsy: { label: 'Drowsy', color: 'bg-[#7d6b9e]' },
  talking: { label: 'Talking', color: 'bg-[#4f9d8a]' },
  sad: { label: 'Sad', color: 'bg-[#6b8cb4]' },
  angry: { label: 'Angry', color: 'bg-[#c44e4e]' },
  frustrated: { label: 'Frustrated', color: 'bg-[#b87333]' },
};

const expressionOrder: ExpressionKey[] = ['joy', 'calm', 'focus', 'surprise', 'tense', 'curious', 'drowsy', 'talking', 'sad', 'angry', 'frustrated'];

function blendScore(blend: { categoryName: string; score: number }[], names: string[]) {
  const matches = names.map((name) => blend.find((item) => item.categoryName === name)?.score ?? 0);
  return matches.length ? Math.max(...matches) : 0;
}

function readExpressions(blend: { categoryName: string; score: number }[]) {
  const smile = blendScore(blend, ['mouthSmileLeft', 'mouthSmileRight']);
  const frown = blendScore(blend, ['mouthFrownLeft', 'mouthFrownRight']);
  const browDown = blendScore(blend, ['browDownLeft', 'browDownRight']);
  const browUp = blendScore(blend, ['browInnerUp', 'browOuterUpLeft', 'browOuterUpRight']);
  const jawOpen = blendScore(blend, ['jawOpen']);
  const eyeWide = blendScore(blend, ['eyeWideLeft', 'eyeWideRight']);
  const eyeBlink = blendScore(blend, ['eyeBlinkLeft', 'eyeBlinkRight']);
  const eyeSquint = blendScore(blend, ['eyeSquintLeft', 'eyeSquintRight']);
  const mouthPress = blendScore(blend, ['mouthPressLeft', 'mouthPressRight']);
  const cheekSquint = blendScore(blend, ['cheekSquintLeft', 'cheekSquintRight']);

  const scores: Record<ExpressionKey, number> = {
    joy: smile * 0.8 + cheekSquint * 0.2,
    surprise: browUp * 0.55 + jawOpen * 0.25 + eyeWide * 0.2,
    tense: (browDown * 0.5 + mouthPress * 0.35 + frown * 0.15) * (1 - jawOpen * 0.5),
    curious: browUp * 0.5 + eyeSquint * 0.3 + (1 - smile) * 0.1,
    talking: jawOpen * 0.7 + (jawOpen > 0.15 ? 0.15 : 0),
    drowsy: eyeBlink * 0.7 + (1 - eyeWide) * 0.1,
    focus: browDown * 0.45 + eyeSquint * 0.35 - jawOpen * 0.3,
    calm: 0.28,
    sad: frown * 0.5 + (1 - smile) * 0.3 + browUp * 0.2,
    angry: browDown * 0.6 + mouthPress * 0.3 + frown * 0.1,
    frustrated: browDown * 0.4 + mouthPress * 0.3 + frown * 0.2 + eyeSquint * 0.1,
  };

  let dominant: ExpressionKey = 'calm';
  let best = scores.calm;
  for (const key of expressionOrder) {
    const value = Math.max(0, scores[key]);
    scores[key] = value;
    if (key !== 'calm' && value > best && value > 0.22) {
      best = value;
      dominant = key;
    }
  }
  return { scores, dominant, confidence: Math.min(0.98, 0.55 + best * 0.4) };
}

export interface VitalSignsData {
  heartRate: number | null;
  heartRateVariability: number | null;
  sdnn: number | null;
  rmssd: number | null;
  breathRate: number | null;
  spo2: number | null;
  signalQuality: number;
  beatTimestamps: number[];
  bvp: number[];
}

class HeartRateEstimator {
  private samples: number[] = [];
  private timestamps: number[] = [];
  private beatTimestamps: number[] = [];
  private rrIntervals: number[] = [];
  private bpmHistory: number[] = [];
  private breathSamples: number[] = [];
  private readonly windowSize = 150;
  private lastPeakIndex = -1;

  addSample(r: number, g: number, b: number) {
    const greenAvg = g / (r + g + b + 1);
    this.samples.push(greenAvg);
    this.timestamps.push(performance.now());

    this.breathSamples.push(greenAvg);
    if (this.breathSamples.length > 300) this.breathSamples.shift();

    if (this.samples.length > this.windowSize) {
      this.samples.shift();
      this.timestamps.shift();
    }
  }

  private findPeaks(): number[] {
    if (this.samples.length < 10) return [];

    const mean = this.samples.reduce((a, b) => a + b, 0) / this.samples.length;
    const detrended = this.samples.map((s) => s - mean);
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

  getVitalSigns(): VitalSignsData {
    const peaks = this.findPeaks();
    const now = performance.now();

    if (peaks.length >= 2) {
      for (let i = 1; i < peaks.length; i++) {
        const interval = this.timestamps[peaks[i]] - this.timestamps[peaks[i - 1]];
        if (interval > 300 && interval < 2000) {
          const lastBeat = this.timestamps[peaks[i]];
          if (!this.beatTimestamps.includes(lastBeat)) {
            this.beatTimestamps.push(lastBeat);
            this.rrIntervals.push(interval);
          }
        }
      }
    }

    if (this.beatTimestamps.length > 50) {
      this.beatTimestamps = this.beatTimestamps.slice(-50);
    }
    if (this.rrIntervals.length > 50) {
      this.rrIntervals = this.rrIntervals.slice(-50);
    }

    let heartRate: number | null = null;
    if (this.rrIntervals.length >= 2) {
      const recentRR = this.rrIntervals.slice(-5);
      const avgRR = recentRR.reduce((a, b) => a + b, 0) / recentRR.length;
      heartRate = Math.round(60000 / avgRR);
      this.bpmHistory.push(heartRate);
      if (this.bpmHistory.length > 5) this.bpmHistory.shift();
      const sorted = [...this.bpmHistory].sort((a, b) => a - b);
      heartRate = sorted[Math.floor(sorted.length / 2)];
    }

    let rmssd: number | null = null;
    let sdnn: number | null = null;
    let hrv: number | null = null;

    if (this.rrIntervals.length >= 5) {
      const meanRR = this.rrIntervals.reduce((a, b) => a + b, 0) / this.rrIntervals.length;

      let sumSqDiff = 0;
      for (let i = 1; i < this.rrIntervals.length; i++) {
        sumSqDiff += (this.rrIntervals[i] - this.rrIntervals[i - 1]) ** 2;
      }
      rmssd = Math.round(Math.sqrt(sumSqDiff / (this.rrIntervals.length - 1)) * 10) / 10;

      let sumVar = 0;
      for (const rr of this.rrIntervals) {
        sumVar += (rr - meanRR) ** 2;
      }
      sdnn = Math.round(Math.sqrt(sumVar / this.rrIntervals.length) * 10) / 10;
      hrv = rmssd;
    }

    let breathRate: number | null = null;
    if (this.breathSamples.length >= 60) {
      const breathMean = this.breathSamples.reduce((a, b) => a + b, 0) / this.breathSamples.length;
      const breathDetrended = this.breathSamples.map((s) => s - breathMean);

      let zeroCrossings = 0;
      for (let i = 1; i < breathDetrended.length; i++) {
        if ((breathDetrended[i] >= 0 && breathDetrended[i - 1] < 0) ||
            (breathDetrended[i] < 0 && breathDetrended[i - 1] >= 0)) {
          zeroCrossings++;
        }
      }

      const durationSec = (this.timestamps[this.timestamps.length - 1] - this.timestamps[0]) / 1000;
      if (durationSec > 0) {
        breathRate = Math.round((zeroCrossings / 2 / durationSec) * 60 * 10) / 10;
        breathRate = Math.max(8, Math.min(25, breathRate));
      }
    }

    const bvp = this.samples.slice(-100);

    let signalQuality = 0;
    if (this.samples.length >= 30) {
      const recent = this.samples.slice(-30);
      const mean = recent.reduce((a, b) => a + b, 0) / recent.length;
      const variance = recent.reduce((a, b) => a + (b - mean) ** 2, 0) / recent.length;
      const snr = variance * 10000;
      const beatConsistency = this.rrIntervals.length >= 3 ? 1 - (sdnn || 0) / (hrv || 1) * 0.5 : 0.3;
      signalQuality = Math.min(1, (snr * 0.5 + beatConsistency * 0.5));
    }

    return {
      heartRate,
      heartRateVariability: hrv,
      sdnn,
      rmssd,
      breathRate,
      spo2: null,
      signalQuality,
      beatTimestamps: [...this.beatTimestamps],
      bvp,
    };
  }
}

interface CameraFeedProps {
  onEmotionChange?: (emotion: { label: string; confidence: number }) => void;
  onVitalSignsChange?: (vitals: VitalSignsData) => void;
}

export const CameraFeed: React.FC<CameraFeedProps> = ({ onEmotionChange, onVitalSignsChange }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);
  const heartRateRef = useRef(new HeartRateEstimator());

  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [status, setStatus] = useState('Ready');
  const [faceFound, setFaceFound] = useState(false);
  const [mood, setMood] = useState<ExpressionKey>('calm');
  const [confidence, setConfidence] = useState(72);
  const [expressionScores, setExpressionScores] = useState<Record<ExpressionKey, number>>(
    () => Object.fromEntries(expressionOrder.map((key) => [key, key === 'calm' ? 0.28 : 0])) as Record<ExpressionKey, number>
  );
  const [error, setError] = useState('');

  const onEmotionChangeRef = useRef(onEmotionChange);
  onEmotionChangeRef.current = onEmotionChange;
  const onVitalSignsChangeRef = useRef(onVitalSignsChange);
  onVitalSignsChangeRef.current = onVitalSignsChange;

  const extractForeheadColor = useCallback((video: HTMLVideoElement): { r: number; g: number; b: number } | null => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 1;
    tempCanvas.height = 1;
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return null;

    const x = Math.floor(video.videoWidth * 0.5);
    const y = Math.floor(video.videoHeight * 0.3);
    ctx.drawImage(video, x, y, 10, 10, 0, 0, 1, 1);
    const pixel = ctx.getImageData(0, 0, 1, 1).data;

    return { r: pixel[0], g: pixel[1], b: pixel[2] };
  }, []);

  const detect = useCallback(() => {
    const video = videoRef.current;
    const landmarker = landmarkerRef.current;
    if (!video || !landmarker || video.readyState < 2 || paused) {
      rafRef.current = requestAnimationFrame(detect);
      return;
    }

    const result = landmarker.detectForVideo(video, performance.now());
    const found = result.faceLandmarks.length > 0;
    setFaceFound(found);

    if (found) {
      const blend = result.faceBlendshapes?.[0]?.categories ?? [];
      const { scores, dominant, confidence: readConfidence } = readExpressions(blend);
      setExpressionScores(scores);
      setMood(dominant);
      setConfidence(Math.round(readConfidence * 100));

      if (onEmotionChangeRef.current) {
        onEmotionChangeRef.current({ label: dominant, confidence: readConfidence });
      }

      const color = extractForeheadColor(video);
      if (color) {
        heartRateRef.current.addSample(color.r, color.g, color.b);
        const vitals = heartRateRef.current.getVitalSigns();
        if (onVitalSignsChangeRef.current) {
          onVitalSignsChangeRef.current(vitals);
        }
      }
    }

    rafRef.current = requestAnimationFrame(detect);
  }, [paused, extractForeheadColor]);

  const start = async () => {
    try {
      setError('');
      setStatus('Requesting camera...');

      streamRef.current = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 1280 },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = streamRef.current;
        await videoRef.current.play();
      }

      setStatus('Loading vision model...');

      const vision = await import('@mediapipe/tasks-vision');
      const { FaceLandmarker, FilesetResolver } = vision;

      const filesetResolver = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm'
      );

      const options = {
        baseOptions: { modelAssetPath: '/models/face_landmarker.task' },
        outputFaceBlendshapes: true,
        runningMode: 'VIDEO' as const,
        numFaces: 1,
      };

      try {
        landmarkerRef.current = await FaceLandmarker.createFromOptions(filesetResolver, {
          ...options,
          baseOptions: { ...options.baseOptions, delegate: 'GPU' },
        });
      } catch {
        landmarkerRef.current = await FaceLandmarker.createFromOptions(filesetResolver, options);
      }

      setRunning(true);
      setStatus('Live');
      setPaused(false);
      rafRef.current = requestAnimationFrame(detect);
    } catch (caught) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;

      const name = caught instanceof DOMException ? caught.name : '';
      const message =
        name === 'NotAllowedError'
          ? 'Camera permission blocked. Allow camera access in browser settings.'
          : name === 'NotFoundError'
          ? 'No camera found. Connect a camera.'
          : 'Camera opened but MediaPipe model failed to load.';

      setError(message);
      setStatus('Error');
    }
  };

  const stop = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setRunning(false);
    setFaceFound(false);
    setStatus('Ready');
  };

  useEffect(() => () => stop(), []);

  return (
    <div className="space-y-4">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#20334a]">
        <video
          ref={videoRef}
          muted
          playsInline
          className={`size-full object-cover ${running ? 'block' : 'hidden'}`}
        />
        {!running && (
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center text-[#f5f1e9]/70">
              <p className="text-sm">Camera preview</p>
            </div>
          </div>
        )}

        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-[#f5f1e9]/90 px-3 py-2 font-mono text-[10px] uppercase tracking-widest">
          <span className={`size-2 rounded-full ${running ? 'bg-[#d46958]' : 'bg-[#8bc8b2]'}`} />
          {status}
        </div>

        {running && (
          <div className="absolute inset-x-4 bottom-4 flex items-end justify-between">
            <div className="rounded-2xl bg-[#f5f1e9]/90 px-4 py-3">
              <p className="font-mono text-[10px] uppercase tracking-widest text-[#20334a]/60">
                Observed expression
              </p>
              <p className="text-2xl font-semibold">
                {faceFound ? expressionMeta[mood].label : 'Looking...'}
              </p>
            </div>
            <div className="rounded-full bg-[#f5f1e9]/90 px-3 py-2 font-mono text-xs">
              {confidence}%
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="max-w-md rounded-2xl bg-[#f28b72]/15 p-4 text-sm leading-6 text-[#9a483b]">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          onClick={running ? (paused ? () => setPaused(false) : () => setPaused(true)) : start}
          className="flex items-center gap-2 rounded-full bg-[#20334a] px-5 py-3 text-sm font-medium text-[#f5f1e9] transition-transform hover:scale-[1.02]"
        >
          {running ? (paused ? 'Resume' : 'Pause') : 'Start Camera'}
        </button>
        <button
          onClick={stop}
          className="flex items-center gap-2 rounded-full border border-[#20334a]/20 px-5 py-3 text-sm font-medium hover:bg-[#fffdf8]"
        >
          Reset
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {expressionOrder.map((key) => {
          const item = expressionMeta[key];
          const value = expressionScores[key] ?? 0;
          return (
            <div key={key} className="rounded-2xl border border-[#20334a]/10 bg-[#fffdf8]/65 p-4">
              <div className="mb-4 flex items-center justify-between">
                <span className={`size-3 rounded-full ${item.color}`} />
                <span className="font-mono text-xs text-[#20334a]/50">{value.toFixed(2)}</span>
              </div>
              <p className="text-sm font-medium">{item.label}</p>
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-[#20334a]/10">
                <div
                  className={`h-full rounded-full ${item.color}`}
                  style={{ width: `${Math.min(100, value * 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="max-w-md text-xs leading-5 text-[#20334a]/50">
        These are observed facial-expression signals, not a diagnosis of how you feel inside. Heart rate is estimated using photoplethysmography (PPG) from facial color changes.
      </p>
    </div>
  );
};
