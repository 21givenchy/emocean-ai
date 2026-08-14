"use client";

import React, { useRef, useEffect, useState } from 'react';

interface ScreenIlluminationGateProps {
  onCalibrated: (data: { baselineIllumination: number; ambientLight: number; acceptable: boolean }) => void;
}

export const ScreenIlluminationGate: React.FC<ScreenIlluminationGateProps> = ({ onCalibrated }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [calibrating, setCalibrating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ illumination: number; acceptable: boolean } | null>(null);

  useEffect(() => {
    if (!calibrating) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 100;
    canvas.height = 100;

    let samples: number[] = [];
    let frameCount = 0;
    const totalFrames = 90;

    const measureFrame = () => {
      if (frameCount >= totalFrames) {
        const avgIllumination = samples.reduce((a, b) => a + b, 0) / samples.length;
        const variance = samples.reduce((a, b) => a + (b - avgIllumination) ** 2, 0) / samples.length;
        const stable = variance < 500;

        setResult({ illumination: avgIllumination, acceptable: stable });
        setCalibrating(false);
        onCalibrated({
          baselineIllumination: avgIllumination,
          ambientLight: avgIllumination,
          acceptable: stable,
        });
        return;
      }

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 100, 100);

      const imageData = ctx.getImageData(0, 0, 100, 100);
      const pixels = imageData.data;

      let totalBrightness = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        totalBrightness += (r * 0.299 + g * 0.587 + b * 0.114);
      }

      const avgBrightness = totalBrightness / (pixels.length / 4);
      samples.push(avgBrightness);

      setProgress(Math.round((frameCount / totalFrames) * 100));
      frameCount++;

      requestAnimationFrame(measureFrame);
    };

    measureFrame();
  }, [calibrating, onCalibrated]);

  const startCalibration = () => {
    setCalibrating(true);
    setResult(null);
    setProgress(0);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Screen Illumination Calibration</h3>

      <p className="text-sm text-gray-600 mb-4">
        We need to measure your screen brightness to ensure accurate color perception.
        Please keep your room lighting consistent during the assessment.
      </p>

      {!calibrating && !result && (
        <button
          onClick={startCalibration}
          className="w-full rounded-lg bg-blue-500 px-4 py-3 text-white font-medium hover:bg-blue-600 transition-colors"
        >
          Start Calibration
        </button>
      )}

      {calibrating && (
        <div className="space-y-4">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 text-center">Measuring... {progress}%</p>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className={`p-4 rounded-lg ${result.acceptable ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
            <p className={`font-medium ${result.acceptable ? 'text-green-800' : 'text-amber-800'}`}>
              {result.acceptable ? 'Calibration Complete' : 'Lighting Unstable'}
            </p>
            <p className={`text-sm mt-1 ${result.acceptable ? 'text-green-600' : 'text-amber-600'}`}>
              {result.acceptable
                ? 'Your screen illumination is stable. You can proceed with the assessment.'
                : 'Please close curtains or adjust lighting to reduce glare, then try again.'}
            </p>
          </div>

          <button
            onClick={startCalibration}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Recalibrate
          </button>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
