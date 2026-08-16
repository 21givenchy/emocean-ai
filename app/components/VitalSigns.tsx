"use client";

import React, { useRef, useEffect } from 'react';
import type { SensorSnapshot } from '@/app/lib/sensors';

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

/**
 * Compatibility layer: maps a `SensorSnapshot` (the SensorHub's typed,
 * per-field availability shape) down to the flat `VitalSignsData` this
 * component was originally built against, so existing consumers don't need
 * to change yet. New code should prefer reading `SensorSnapshot` fields
 * directly — each carries its own `available`/`reason`, which this mapper
 * necessarily collapses away.
 */
export function vitalSignsDataFromSnapshot(snapshot: SensorSnapshot): VitalSignsData {
  return {
    heartRate: snapshot.heartRate.available ? snapshot.heartRate.value : null,
    heartRateVariability: snapshot.prv.available ? snapshot.prv.value?.rmssd ?? null : null,
    sdnn: snapshot.prv.available ? snapshot.prv.value?.sdnn ?? null : null,
    rmssd: snapshot.prv.available ? snapshot.prv.value?.rmssd ?? null : null,
    breathRate: snapshot.respiration.available ? snapshot.respiration.value : null,
    spo2: null,
    signalQuality: snapshot.signalQuality.available ? snapshot.signalQuality.value ?? 0 : 0,
    beatTimestamps: [],
    bvp: snapshot.bvp.available ? snapshot.bvp.value ?? [] : [],
  };
}

interface VitalSignsProps {
  vitalSigns: VitalSignsData;
  isLive: boolean;
}

export const VitalSigns: React.FC<VitalSignsProps> = ({ vitalSigns, isLive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bvpBufferRef = useRef<number[]>([]);

  useEffect(() => {
    if (vitalSigns.bvp.length > 0) {
      bvpBufferRef.current = [...vitalSigns.bvp].slice(-100);
    }
  }, [vitalSigns.bvp]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const data = bvpBufferRef.current;

    ctx.clearRect(0, 0, width, height);

    if (data.length < 2) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Waiting for signal...', width / 2, height / 2);
      return;
    }

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    ctx.beginPath();
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;

    data.forEach((value, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * (height - 20) - 10;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke();

    ctx.fillStyle = '#22c55e';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`BVP (${data.length} samples)`, 5, 12);
  }, [vitalSigns.bvp]);

  const formatValue = (value: number | null, unit: string, decimals = 0) => {
    if (value === null || value === undefined) return `-- ${unit}`;
    return `${value.toFixed(decimals)} ${unit}`;
  };

  const getQualityColor = (quality: number) => {
    if (quality > 0.7) return 'text-green-500';
    if (quality > 0.4) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">Vital Signs</h3>
        <div className="flex items-center gap-2">
          {isLive && (
            <span className="flex items-center gap-1 text-xs text-green-600">
              <span className="size-2 animate-pulse rounded-full bg-green-500" />
              Live
            </span>
          )}
          <span className={`text-xs ${getQualityColor(vitalSigns.signalQuality)}`}>
            SQI: {(vitalSigns.signalQuality * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      <div className="mb-4">
        <canvas
          ref={canvasRef}
          width={300}
          height={80}
          className="w-full rounded-lg bg-gray-50"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-xs text-gray-500">Heart Rate</p>
          <p className="text-xl font-bold text-gray-800">
            {formatValue(vitalSigns.heartRate, 'bpm')}
          </p>
        </div>

        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-xs text-gray-500">Breath Rate</p>
          <p className="text-xl font-bold text-gray-800">
            {formatValue(vitalSigns.breathRate, '/min', 1)}
          </p>
        </div>

        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-xs text-gray-500">HRV (RMSSD)</p>
          <p className="text-xl font-bold text-gray-800">
            {formatValue(vitalSigns.rmssd, 'ms', 1)}
          </p>
        </div>

        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-xs text-gray-500">SDNN</p>
          <p className="text-xl font-bold text-gray-800">
            {formatValue(vitalSigns.sdnn, 'ms', 1)}
          </p>
        </div>

        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-xs text-gray-500">SpO2</p>
          <p className="text-xl font-bold text-gray-800">
            {formatValue(vitalSigns.spo2, '%')}
          </p>
        </div>

        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-xs text-gray-500">Beat Count</p>
          <p className="text-xl font-bold text-gray-800">
            {vitalSigns.beatTimestamps.length}
          </p>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-400">
        {vitalSigns.signalQuality < 0.3 && isLive && (
          <p className="text-amber-500">Low signal quality - ensure good lighting and remain still</p>
        )}
      </div>
    </div>
  );
};
