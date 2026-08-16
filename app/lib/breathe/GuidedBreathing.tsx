"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface GuidedBreathingProps {
  onBreathRate?: (bpm: number) => void;
  onQuality?: (quality: number) => void;
}

const INHALE_SEC = 4;
const EXHALE_SEC = 6;
const CYCLE_SEC = INHALE_SEC + EXHALE_SEC;
const TARGET_BPM = 6; // 60 / CYCLE_SEC

export const GuidedBreathing: React.FC<GuidedBreathingProps> = ({ onBreathRate, onQuality }) => {
  const [phase, setPhase] = useState<'inhale' | 'exhale'>('inhale');
  const [progress, setProgress] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const startTimeRef = useRef<number>(0);
  const animFrameRef = useRef<number>(0);

  const tick = useCallback(() => {
    if (!startTimeRef.current) return;

    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const cyclePos = elapsed % CYCLE_SEC;

    if (cyclePos < INHALE_SEC) {
      setPhase('inhale');
      setProgress(cyclePos / INHALE_SEC);
    } else {
      setPhase('exhale');
      setProgress((cyclePos - INHALE_SEC) / EXHALE_SEC);
    }

    const newCycleCount = Math.floor(elapsed / CYCLE_SEC);
    if (newCycleCount !== cycleCount) {
      setCycleCount(newCycleCount);
      onBreathRate?.(TARGET_BPM);
      // Quality increases with consistency
      const quality = Math.min(1, 0.3 + newCycleCount * 0.1);
      onQuality?.(quality);
    }

    animFrameRef.current = requestAnimationFrame(tick);
  }, [cycleCount, onBreathRate, onQuality]);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now();
      animFrameRef.current = requestAnimationFrame(tick);
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isRunning, tick]);

  const handleStart = () => {
    setIsRunning(true);
    setCycleCount(0);
    startTimeRef.current = Date.now();
  };

  const handleStop = () => {
    setIsRunning(false);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    onBreathRate?.(null as any);
    onQuality?.(0);
  };

  // Circle size based on phase
  const circleScale = phase === 'inhale' ? 1 + progress * 0.5 : 1.5 - progress * 0.5;
  const circleOpacity = phase === 'inhale' ? 0.4 + progress * 0.4 : 0.8 - progress * 0.4;

  return (
    <div className="flex flex-col items-center">
      {/* Breathing circle */}
      <div className="relative w-48 h-48 mb-8">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <defs>
            <radialGradient id="breathGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#67E8D4" stopOpacity={circleOpacity} />
              <stop offset="100%" stopColor="#67E8D4" stopOpacity="0.1" />
            </radialGradient>
          </defs>
          {/* Outer ring */}
          <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(245,247,242,0.1)" strokeWidth="2" />
          {/* Animated circle */}
          <circle
            cx="100"
            cy="100"
            r={40 * circleScale}
            fill="url(#breathGrad)"
            style={{ transition: 'r 0.1s ease-out' }}
          />
          {/* Phase text */}
          <text x="100" y="95" textAnchor="middle" fill="#F5F7F2" fontSize="14" fontWeight="500">
            {isRunning ? (phase === 'inhale' ? 'Breathe in' : 'Breathe out') : 'Ready'}
          </text>
          <text x="100" y="115" textAnchor="middle" fill="#A9BAB8" fontSize="12">
            {isRunning
              ? phase === 'inhale'
                ? `${Math.ceil(INHALE_SEC * (1 - progress))}s`
                : `${Math.ceil(EXHALE_SEC * (1 - progress))}s`
              : 'Press start'}
          </text>
        </svg>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="px-8 py-3 rounded-xl font-medium transition-colors"
            style={{ backgroundColor: '#67E8D4', color: '#071318' }}
          >
            Start guided breathing
          </button>
        ) : (
          <button
            onClick={handleStop}
            className="px-8 py-3 rounded-xl font-medium border transition-colors"
            style={{ borderColor: 'rgba(245,247,242,.12)', color: '#F5F7F2' }}
          >
            Stop
          </button>
        )}
      </div>

      {/* Stats */}
      {isRunning && (
        <div className="mt-6 text-center">
          <p className="text-sm" style={{ color: '#A9BAB8' }}>
            Cycle {cycleCount + 1} · {TARGET_BPM} breaths/min target
          </p>
          <p className="text-xs mt-1" style={{ color: '#A9BAB8' }}>
            {INHALE_SEC}s in · {EXHALE_SEC}s out
          </p>
        </div>
      )}

      {/* Instructions */}
      {!isRunning && (
        <div className="mt-8 max-w-sm text-center">
          <p className="text-sm" style={{ color: '#A9BAB8' }}>
            Follow the expanding and contracting circle. Breathe in as it grows, breathe out as it shrinks.
            No camera required.
          </p>
        </div>
      )}
    </div>
  );
};
