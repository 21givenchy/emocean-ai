"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ColorTheme } from '@/app/lib/colorThemes';

interface ColorTrialProps {
  color: ColorTheme;
  trialNumber: number;
  onComplete: (exposureData: {
    colorId: string;
    duration: number;
    motionScore: number;
    vitalsSnapshot: {
      heartRate: number | null;
      rmssd: number | null;
    };
  }) => void;
  vitals: {
    heartRate: number | null;
    rmssd: number | null;
  };
}

type TrialPhase = 'baseline' | 'washout' | 'exposure' | 'complete';

const BASELINE_DURATION = 30;
const WASHOUT_DURATION = 10;
const EXPOSURE_DURATION = 25;
const TRANSITION_EXCLUDE = 5;

export const ColorTrial: React.FC<ColorTrialProps> = ({
  color,
  trialNumber,
  onComplete,
  vitals,
}) => {
  const [phase, setPhase] = useState<TrialPhase>('baseline');
  const [timeLeft, setTimeLeft] = useState(BASELINE_DURATION);
  const [motionScore, setMotionScore] = useState(1);
  const [showRating, setShowRating] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const prevFrameRef = useRef<ImageData | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handlePhaseComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase === 'exposure' || phase === 'baseline') {
      detectMotion();
    }
  }, [phase]);

  const detectMotion = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 48;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, 64, 48);
    const currentFrame = ctx.getImageData(0, 0, 64, 48);

    if (prevFrameRef.current) {
      let diff = 0;
      for (let i = 0; i < currentFrame.data.length; i += 4) {
        diff += Math.abs(currentFrame.data[i] - prevFrameRef.current.data[i]);
        diff += Math.abs(currentFrame.data[i + 1] - prevFrameRef.current.data[i + 1]);
        diff += Math.abs(currentFrame.data[i + 2] - prevFrameRef.current.data[i + 2]);
      }
      const avgDiff = diff / (currentFrame.data.length * 3);
      const normalizedMotion = Math.min(1, Math.max(0, 1 - avgDiff / 30));
      setMotionScore(normalizedMotion);
    }

    prevFrameRef.current = currentFrame;
  };

  const handlePhaseComplete = () => {
    switch (phase) {
      case 'baseline':
        setPhase('washout');
        setTimeLeft(WASHOUT_DURATION);
        break;
      case 'washout':
        setPhase('exposure');
        setTimeLeft(EXPOSURE_DURATION);
        break;
      case 'exposure':
        setShowRating(true);
        break;
    }
  };

  const handleRatingSubmit = (rating: number, label: string) => {
    onComplete({
      colorId: color.id,
      duration: EXPOSURE_DURATION,
      motionScore,
      vitalsSnapshot: vitals,
    });
    setPhase('complete');
  };

  const getPhaseLabel = () => {
    switch (phase) {
      case 'baseline':
        return 'Baseline - Please relax and look at the gray screen';
      case 'washout':
        return 'Rest period - Look away from the screen';
      case 'exposure':
        return `Exposure ${trialNumber} - Observe the color`;
      default:
        return '';
    }
  };

  const getBackgroundColor = () => {
    switch (phase) {
      case 'baseline':
      case 'washout':
        return '#808080';
      case 'exposure':
        return color.hex;
      default:
        return '#ffffff';
    }
  };

  if (phase === 'complete') {
    return null;
  }

  if (showRating) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-2">How did this color make you feel?</p>
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6, 7].map((value) => (
            <button
              key={value}
              onClick={() => handleRatingSubmit(value, String(value))}
              className="w-full p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
            >
              <span className="font-medium text-gray-700">
                {value === 1 && 'Very Tense'}
                {value === 2 && 'Tense'}
                {value === 3 && 'Slightly Tense'}
                {value === 4 && 'Neutral'}
                {value === 5 && 'Slightly Calm'}
                {value === 6 && 'Calm'}
                {value === 7 && 'Very Calm'}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <video ref={videoRef} className="hidden" autoPlay playsInline muted />

      <div
        className="w-full h-64 rounded-2xl transition-colors duration-500 flex items-center justify-center"
        style={{ backgroundColor: getBackgroundColor() }}
      >
        <div className="text-center">
          <p className={`text-lg font-medium ${phase === 'exposure' ? 'text-white/90' : 'text-gray-700'}`}>
            {getPhaseLabel()}
          </p>
          <p className={`text-4xl font-bold mt-2 ${phase === 'exposure' ? 'text-white' : 'text-gray-800'}`}>
            {timeLeft}s
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Phase: {phase}</span>
        <span>Trial: {trialNumber}</span>
        <span className={motionScore < 0.7 ? 'text-amber-500' : 'text-green-500'}>
          Motion: {Math.round(motionScore * 100)}%
        </span>
      </div>

      {motionScore < 0.5 && phase === 'exposure' && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
          <p className="text-sm text-amber-700">
            High motion detected. Please try to remain still for accurate results.
          </p>
        </div>
      )}
    </div>
  );
};
