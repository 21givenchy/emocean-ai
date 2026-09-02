"use client";

import React, { useEffect, useRef } from 'react';
import { useSensorHub } from '@/app/hooks/useSensorHub';
import { VitalSigns, vitalSignsDataFromSnapshot, type VitalSignsData } from './VitalSigns';
import type { SensorField, SensorSnapshot } from '@/app/lib/sensors/types';

/**
 * Developer sensor diagnostic.
 *
 * This surface reports only what the pipeline can observe and how good the
 * observation is — detection, region of interest, landmark count, motion,
 * signal quality, buffer duration, source and reason codes. It deliberately
 * reports no affective label and no "confidence" in one.
 *
 * An earlier version of this component rendered eleven emotion labels
 * (joy/calm/focus/surprise/tense/curious/drowsy/talking/sad/angry/frustrated)
 * with a confidence figure synthesised as `min(98, 55 + score * 40)` — a
 * number with a 55% floor that was never measured — and seeded `calm` to 0.28
 * before the camera was even started. That violated the project's standing
 * rules on unearned claims and on numbers without provenance. Do not
 * reintroduce an expression display here; expression inference is disabled
 * upstream, and there is no validated estimator behind it. claim-ok:negated
 */

export type { VitalSignsData } from './VitalSigns';

interface CameraFeedProps {
  onVitalSignsChange?: (vitals: VitalSignsData) => void;
}

/** Rounds to `dp` places, or renders an em dash when the value is absent. */
function num(v: number | null | undefined, dp = 2): string {
  return typeof v === 'number' && Number.isFinite(v) ? v.toFixed(dp) : '—';
}

/**
 * One row of the provenance table. Shows the field's availability, its
 * originating adapter, whether it was derived from another signal, and — when
 * unavailable — the adapter's own reason code rather than a blank.
 */
function ProvenanceRow<T>({
  label,
  field,
  detail,
  experimental,
}: {
  label: string;
  field: SensorField<T> | undefined;
  detail?: string;
  experimental?: boolean;
}) {
  const available = field?.available ?? false;
  return (
    <div
      className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b py-3 last:border-b-0"
      style={{ borderColor: 'rgba(245,247,242,.08)' }}
    >
      <div className="min-w-[10rem]">
        <span className="text-sm font-medium">{label}</span>
        {experimental && (
          <span
            className="ml-2 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider"
            style={{ backgroundColor: '#F4B86A20', color: '#F4B86A' }}
          >
            Unvalidated
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-baseline gap-x-3 font-mono text-xs" style={{ color: '#A9BAB8' }}>
        <span
          className="rounded px-1.5 py-0.5"
          style={
            available
              ? { backgroundColor: '#67E8D420', color: '#67E8D4' }
              : { backgroundColor: 'rgba(245,247,242,.08)', color: '#A9BAB8' }
          }
        >
          {available ? 'available' : 'unavailable'}
        </span>
        {detail && available && <span style={{ color: '#F5F7F2' }}>{detail}</span>}
        {!available && field?.reason && <span>reason: {field.reason}</span>}
        {field?.source && <span>src: {field.source}</span>}
        {field?.derived && <span>derived</span>}
      </div>
    </div>
  );
}

export const CameraFeed: React.FC<CameraFeedProps> = ({ onVitalSignsChange }) => {
  const { videoRef, snapshot, status, error, start, stop, pause, resume } = useSensorHub();
  const paused = status === 'paused';
  const running =
    status === 'running' || status === 'paused' || status === 'initializing' || status === 'requesting-camera';

  const onVitalSignsChangeRef = useRef(onVitalSignsChange);
  useEffect(() => {
    onVitalSignsChangeRef.current = onVitalSignsChange;
  }, [onVitalSignsChange]);

  const snap: SensorSnapshot | null = snapshot ?? null;
  const faceFound = snap?.faceDetection.available ?? false;
  const roi = snap?.faceDetection.value?.box ?? null;
  const keypointCount = snap?.faceDetection.value?.keypoints?.length ?? null;
  const vitalSigns = snap ? vitalSignsDataFromSnapshot(snap) : null;

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
  }, [
    snapshot?.heartRate.value,
    snapshot?.prv.value,
    snapshot?.respiration.value,
    snapshot?.bvp.value,
    snapshot?.signalQuality.value,
  ]);

  const statusLabel =
    status === 'idle' || status === 'stopped'
      ? 'Ready'
      : status === 'requesting-camera'
      ? 'Requesting camera…'
      : status === 'initializing'
      ? 'Loading sensor pipeline…'
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
    if (paused) resume();
    else pause();
  };

  return (
    <div className="space-y-6">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl" style={{ backgroundColor: '#10242B' }}>
        {/* Mirrored so the preview reads like a mirror rather than a recording. */}
        <video
          ref={videoRef}
          muted
          playsInline
          className={`size-full object-cover ${running ? 'block' : 'hidden'}`}
          style={{ transform: 'scaleX(-1)' }}
        />
        {!running && (
          <div className="absolute inset-0 grid place-items-center">
            <p className="text-sm" style={{ color: '#A9BAB8' }}>
              Camera preview
            </p>
          </div>
        )}

        {/* Real detection region, drawn from the reported box — mirrored to match
            the preview. Absent when nothing is detected, rather than a guess. */}
        {running && roi && (
          <div
            className="pointer-events-none absolute border-2"
            style={{
              borderColor: '#67E8D4',
              left: `${(1 - roi.x - roi.w) * 100}%`,
              top: `${roi.y * 100}%`,
              width: `${roi.w * 100}%`,
              height: `${roi.h * 100}%`,
            }}
          />
        )}

        <div
          className="absolute left-4 top-4 flex items-center gap-2 rounded-full px-3 py-2 font-mono text-[10px] uppercase tracking-widest"
          style={{ backgroundColor: 'rgba(7,19,24,.85)', color: '#F5F7F2' }}
        >
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: running && !paused ? '#67E8D4' : '#A9BAB8' }}
          />
          {statusLabel}
        </div>

        {running && (
          <div
            className="absolute inset-x-4 bottom-4 rounded-2xl px-4 py-3 font-mono text-xs"
            style={{ backgroundColor: 'rgba(7,19,24,.85)', color: '#A9BAB8' }}
          >
            {faceFound
              ? `region detected · landmarks: ${keypointCount ?? 'n/a'}`
              : 'no region detected'}
          </div>
        )}
      </div>

      {error && (
        <p
          className="max-w-md rounded-2xl p-4 text-sm leading-6"
          style={{ backgroundColor: '#F4B86A15', color: '#F4B86A' }}
        >
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handlePrimaryButton}
          className="min-h-[44px] rounded-full px-5 py-3 text-sm font-medium"
          style={{ backgroundColor: '#67E8D4', color: '#071318' }}
        >
          {running ? (paused ? 'Resume' : 'Pause') : 'Start camera'}
        </button>
        <button
          onClick={stop}
          className="min-h-[44px] rounded-full border px-5 py-3 text-sm font-medium hover:bg-white/5"
          style={{ borderColor: 'rgba(245,247,242,.2)', color: '#F5F7F2' }}
        >
          Stop
        </button>
      </div>

      <div className="rounded-2xl border p-5" style={{ backgroundColor: '#10242B', borderColor: 'rgba(245,247,242,.12)' }}>
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-widest" style={{ color: '#67E8D4' }}>
          Observable signals
        </h2>
        <p className="mb-4 text-xs" style={{ color: '#A9BAB8' }}>
          What the pipeline can see, and how good the observation is. No affective label is produced.
        </p>

        <ProvenanceRow
          label="Region detection"
          field={snap?.faceDetection}
          detail={
            roi
              ? `x ${num(roi.x)} y ${num(roi.y)} w ${num(roi.w)} h ${num(roi.h)} · landmarks ${keypointCount ?? 'n/a'}`
              : undefined
          }
        />
        <ProvenanceRow
          label="Signal quality"
          field={snap?.signalQuality}
          detail={num(snap?.signalQuality.value)}
        />
        <ProvenanceRow
          label="Movement stability"
          field={snap?.movementStability}
          detail={num(snap?.movementStability.value?.score)}
        />
        <ProvenanceRow
          label="Head pose"
          field={snap?.headPose}
          detail={
            snap?.headPose.value
              ? `yaw ${num(snap.headPose.value.yaw, 1)}° pitch ${num(snap.headPose.value.pitch, 1)}° roll ${num(snap.headPose.value.roll, 1)}°`
              : undefined
          }
        />
        <ProvenanceRow
          label="Eye openness"
          field={snap?.eyeState}
          detail={
            snap?.eyeState.value
              ? `L ${num(snap.eyeState.value.left.prob)} R ${num(snap.eyeState.value.right.prob)}`
              : undefined
          }
        />
        <ProvenanceRow
          label="Jaw movement"
          field={snap?.speaking}
          detail={snap?.speaking.value ? `jawOpen ${num(snap.speaking.value.jawOpen)}` : undefined}
        />
        <ProvenanceRow
          label="Waveform buffer"
          field={snap?.bvp}
          detail={snap?.bvp.value ? `${snap.bvp.value.length} samples` : undefined}
          experimental
        />
        <ProvenanceRow
          label="Respiration estimate"
          field={snap?.respiration}
          detail={snap?.respiration.value !== null ? `${num(snap?.respiration.value, 1)} breaths/min` : undefined}
          experimental
        />
        <ProvenanceRow
          label="Pulse rate estimate"
          field={snap?.heartRate}
          detail={snap?.heartRate.value !== null ? `${num(snap?.heartRate.value, 1)} bpm` : undefined}
          experimental
        />
        <ProvenanceRow
          label="Pulse rate variability"
          field={snap?.prv}
          detail={
            snap?.prv.value
              ? `rmssd ${num(snap.prv.value.rmssd, 1)} sdnn ${num(snap.prv.value.sdnn, 1)} n ${snap.prv.value.n}`
              : undefined
          }
          experimental
        />

        <p className="mt-4 text-xs leading-5" style={{ color: '#A9BAB8' }}>
          Frame cadence and illumination are not instrumented yet, so they are not reported here
          rather than estimated.
        </p>
      </div>

      {vitalSigns && <VitalSigns vitalSigns={vitalSigns} isLive={running && !paused} />}

      <p className="max-w-md text-xs leading-5" style={{ color: '#A9BAB8' }}>
        Observable signals only, with no diagnosis and no emotion inference. Fields marked
        unvalidated have never been compared against a reference instrument. Camera processing is
        designed to run in your browser.
      </p>
    </div>
  );
};
