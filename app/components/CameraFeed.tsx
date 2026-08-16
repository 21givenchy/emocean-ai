"use client";

import React, { useEffect, useRef } from 'react';
import { useSensorHub } from '@/app/hooks/useSensorHub';
import { VitalSigns, vitalSignsDataFromSnapshot, type VitalSignsData } from './VitalSigns';

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

const emptyScores: Record<ExpressionKey, number> = Object.fromEntries(
  expressionOrder.map((key) => [key, key === 'calm' ? 0.28 : 0])
) as Record<ExpressionKey, number>;

/** Normalize a snapshot's `facialExpression.value.scores` (an open-ended
 *  label set that varies by which adapter is active) into this component's
 *  fixed 11-key display vocabulary. Unknown labels are dropped rather than
 *  guessed at. */
function mapExpressionScores(scores: Record<string, number> | null | undefined): Record<ExpressionKey, number> {
  if (!scores) return { ...emptyScores };
  const mapped: Record<ExpressionKey, number> = { ...emptyScores };
  for (const key of expressionOrder) {
    if (typeof scores[key] === 'number') mapped[key] = scores[key];
  }
  return mapped;
}

function pickDominant(scores: Record<ExpressionKey, number>, label: string | undefined): ExpressionKey {
  if (label && (expressionOrder as string[]).includes(label)) return label as ExpressionKey;
  let dominant: ExpressionKey = 'calm';
  let best = scores.calm;
  for (const key of expressionOrder) {
    if (key !== 'calm' && scores[key] > best) {
      best = scores[key];
      dominant = key;
    }
  }
  return dominant;
}

export type { VitalSignsData } from './VitalSigns';

interface CameraFeedProps {
  onEmotionChange?: (emotion: { label: string; confidence: number }) => void;
  onVitalSignsChange?: (vitals: VitalSignsData) => void;
}

export const CameraFeed: React.FC<CameraFeedProps> = ({ onEmotionChange, onVitalSignsChange }) => {
  const { videoRef, snapshot, status, error, start, stop, pause, resume } = useSensorHub();
  const paused = status === 'paused';
  const running = status === 'running' || status === 'paused' || status === 'initializing' || status === 'requesting-camera';

  const onEmotionChangeRef = useRef(onEmotionChange);
  onEmotionChangeRef.current = onEmotionChange;
  const onVitalSignsChangeRef = useRef(onVitalSignsChange);
  onVitalSignsChangeRef.current = onVitalSignsChange;

  const faceFound = snapshot?.faceDetection.available ?? false;
  const expressionScores = mapExpressionScores(snapshot?.facialExpression.value?.scores);
  const mood = pickDominant(expressionScores, snapshot?.facialExpression.value?.label);
  const confidence = Math.round(Math.min(98, 55 + Math.max(0, expressionScores[mood]) * 40));
  const vitalSigns = snapshot ? vitalSignsDataFromSnapshot(snapshot) : null;

  useEffect(() => {
    if (!snapshot?.facialExpression.available || !snapshot.facialExpression.value) return;
    onEmotionChangeRef.current?.({
      label: mood,
      confidence: confidence / 100,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot?.facialExpression.value?.label, snapshot?.facialExpression.available]);

  useEffect(() => {
    if (!snapshot) return;
    onVitalSignsChangeRef.current?.({
      heartRate: snapshot.heartRate.available ? snapshot.heartRate.value : null,
      heartRateVariability: snapshot.prv.available ? snapshot.prv.value?.rmssd ?? null : null,
      sdnn: snapshot.prv.available ? snapshot.prv.value?.sdnn ?? null : null,
      rmssd: snapshot.prv.available ? snapshot.prv.value?.rmssd ?? null : null,
      breathRate: snapshot.respiration.available ? snapshot.respiration.value : null,
      signalQuality: snapshot.signalQuality.available ? snapshot.signalQuality.value ?? 0 : 0,
      beatTimestamps: [],
      bvp: snapshot.bvp.available ? snapshot.bvp.value ?? [] : [],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot?.heartRate.value, snapshot?.prv.value, snapshot?.respiration.value, snapshot?.bvp.value, snapshot?.signalQuality.value]);

  const statusLabel =
    status === 'idle' || status === 'stopped'
      ? 'Ready'
      : status === 'requesting-camera'
      ? 'Requesting camera...'
      : status === 'initializing'
      ? 'Loading sensor pipeline...'
      : status === 'error'
      ? 'Error'
      : status === 'paused'
      ? 'Paused'
      : 'Live';

  const handlePrimaryButton = () => {
    if (!running) {
      start();
      return;
    }
    if (paused) {
      resume();
    } else {
      pause();
    }
  };

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
          <span className={`size-2 rounded-full ${running && !paused ? 'bg-[#d46958]' : 'bg-[#8bc8b2]'}`} />
          {statusLabel}
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
          onClick={handlePrimaryButton}
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
            <div key={key} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <span className={`size-3 rounded-full ${item.color}`} />
                <span className="font-mono text-xs font-semibold text-gray-700">{value.toFixed(2)}</span>
              </div>
              <p className="text-sm font-medium text-gray-800">{item.label}</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full ${item.color}`}
                  style={{ width: `${Math.min(100, value * 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {vitalSigns && (
        <VitalSigns vitalSigns={vitalSigns} isLive={running && !paused} />
      )}

      <p className="max-w-md text-xs leading-5 text-gray-500">
        Observed facial signals, not a diagnosis. Camera data stays on your device.
      </p>
    </div>
  );
};
