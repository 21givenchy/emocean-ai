"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSensorHub } from '@/app/hooks/useSensorHub';
import { BreathingWorld } from '@/app/lib/breathe/BreathingWorld';
import { GuidedBreathing } from '@/app/lib/breathe/GuidedBreathing';
import { BreathingStateMachine, WorldState, WORLD_STATES } from '@/app/lib/breathe/stateMachine';

type SessionPhase = 'select' | 'calibrate' | 'tutorial' | 'session' | 'debrief';
type InputMode = 'camera' | 'guided';

interface SessionResult {
  mode: InputMode;
  duration: number;
  worldStatesVisited: string[];
  peakBreathRate: number | null;
  finalBreathRate: number | null;
  averageQuality: number;
}

export default function BreatheExperience() {
  const [phase, setPhase] = useState<SessionPhase>('select');
  const [inputMode, setInputMode] = useState<InputMode>('camera');
  const [worldState, setWorldState] = useState<WorldState>(WORLD_STATES[0]);
  const [breathRate, setBreathRate] = useState<number | null>(null);
  const [quality, setQuality] = useState(0);
  const [isFrozen, setIsFrozen] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [statesVisited, setStatesVisited] = useState<string[]>(['storm']);
  const [peakBreathRate, setPeakBreathRate] = useState<number | null>(null);
  const [calibrationCount, setCalibrationCount] = useState(0);

  const stateMachineRef = useRef(new BreathingStateMachine((state) => {
    setWorldState(state);
    setStatesVisited((prev) => (prev.includes(state.id) ? prev : [...prev, state.id]));
  }));

  const sessionStartRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Camera mode
  const { videoRef, snapshot, status, error, start, stop } = useSensorHub();
  const cameraRunning = status === 'running' || status === 'paused';

  // Process camera breathing data
  useEffect(() => {
    if (inputMode !== 'camera' || phase !== 'session') return;
    if (!snapshot?.respiration.available) return;

    const bpm = snapshot.respiration.value;
    const sigQuality = snapshot.signalQuality.available ? (snapshot.signalQuality.value ?? 0) : 0;
    const newQuality = Math.min(1, sigQuality + (bpm !== null ? 0.3 : 0));

    setBreathRate(bpm);
    setQuality(newQuality);
    setIsFrozen(stateMachineRef.current.isFrozen());
    setWorldState(stateMachineRef.current.update(bpm, newQuality));

    if (bpm !== null) {
      setPeakBreathRate((prev) => (prev === null ? bpm : Math.max(prev, bpm)));
    }
  }, [snapshot, inputMode, phase]);

  // Guided mode breathing callback
  const handleGuidedBreathRate = useCallback((bpm: number | null) => {
    setBreathRate(bpm);
    const q = bpm !== null ? 0.8 : 0;
    setQuality(q);
    setWorldState(stateMachineRef.current.update(bpm, q));
    if (bpm !== null) {
      setPeakBreathRate((prev) => (prev === null ? bpm : Math.max(prev, bpm)));
    }
  }, []);

  const handleGuidedQuality = useCallback((q: number) => {
    setQuality(q);
  }, []);

  // Session timer
  useEffect(() => {
    if (phase === 'session') {
      sessionStartRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setSessionDuration(Math.floor((Date.now() - sessionStartRef.current) / 1000));
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  // Start camera for camera mode
  const handleStartCamera = async () => {
    await start();
    setPhase('calibrate');
  };

  // Calibration phase
  useEffect(() => {
    if (phase !== 'calibrate') return;
    if (inputMode === 'camera' && cameraRunning && snapshot?.respiration.available) {
      setCalibrationCount((prev) => prev + 1);
      if (calibrationCount >= 3) {
        setPhase('tutorial');
      }
    }
    if (inputMode === 'guided') {
      // Skip calibration for guided mode
      setPhase('tutorial');
    }
  }, [phase, inputMode, cameraRunning, snapshot, calibrationCount]);

  // End session
  const handleEndSession = () => {
    stop();
    setPhase('debrief');
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // ── Select phase ────────────────────────────────────────────────
  if (phase === 'select') {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#071318', color: '#F5F7F2' }}>
        <nav className="max-w-6xl mx-auto px-6 py-6 w-full">
          <a href="/lab" className="flex items-center gap-2 text-sm" style={{ color: '#A9BAB8' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Lab
          </a>
        </nav>
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-lg w-full text-center">
            <div className="text-6xl mb-6">🌊</div>
            <h1 className="text-4xl font-bold mb-4">Breathe the World Open</h1>
            <p className="text-lg mb-10" style={{ color: '#A9BAB8' }}>
              A stormed-over world responds as your breathing becomes slower and steadier.
            </p>

            <div className="space-y-4 mb-10">
              <button
                onClick={() => { setInputMode('camera'); handleStartCamera(); }}
                className="w-full p-6 rounded-2xl border-2 text-left transition-all hover:border-[#67E8D4]/30"
                style={{ backgroundColor: '#10242B', borderColor: 'rgba(245,247,242,.12)' }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: '#67E8D420' }}>📷</div>
                  <div>
                    <h3 className="font-semibold text-lg">Camera mode</h3>
                    <p className="text-sm" style={{ color: '#A9BAB8' }}>Webcam detects breathing from chest motion. Requires camera permission.</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => { setInputMode('guided'); setPhase('calibrate'); }}
                className="w-full p-6 rounded-2xl border-2 text-left transition-all hover:border-[#7DD3B0]/30"
                style={{ backgroundColor: '#10242B', borderColor: 'rgba(245,247,242,.12)' }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: '#7DD3B020' }}>🎯</div>
                  <div>
                    <h3 className="font-semibold text-lg">Guided mode</h3>
                    <p className="text-sm" style={{ color: '#A9BAB8' }}>Follow visual breathing cues. No camera needed — works on any device.</p>
                  </div>
                </div>
              </button>
            </div>

            <p className="text-xs" style={{ color: '#A9BAB8' }}>
              3–5 minutes · Camera data stays on this device · No account required
            </p>
          </div>
        </main>
      </div>
    );
  }

  // ── Calibrate phase ─────────────────────────────────────────────
  if (phase === 'calibrate') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ backgroundColor: '#071318', color: '#F5F7F2' }}>
        <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mb-6" style={{ borderColor: '#67E8D4', borderTopColor: 'transparent' }} />
        <h2 className="text-2xl font-semibold mb-3">
          {inputMode === 'camera' ? 'Calibrating camera...' : 'Preparing...'}
        </h2>
        <p className="text-center max-w-md" style={{ color: '#A9BAB8' }}>
          {inputMode === 'camera'
            ? 'Sit still, breathe normally. We need a few seconds of data to establish your baseline.'
            : 'Get comfortable. The guided breathing will begin shortly.'}
        </p>
        {inputMode === 'camera' && (
          <div className="mt-8 relative w-64 aspect-[4/3] rounded-2xl overflow-hidden">
            <video ref={videoRef} muted playsInline className="w-full h-full object-cover" />
            <div className="absolute bottom-2 left-2 right-2 text-center text-xs px-2 py-1 rounded" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              {error || 'Detecting breathing...'}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Tutorial phase ──────────────────────────────────────────────
  if (phase === 'tutorial') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ backgroundColor: '#071318', color: '#F5F7F2' }}>
        <div className="max-w-lg w-full text-center">
          <div className="text-5xl mb-6">🌊</div>
          <h2 className="text-3xl font-bold mb-4">Welcome to the storm</h2>
          <p className="text-lg mb-8" style={{ color: '#A9BAB8' }}>
            The world is dark and stormy. As you breathe slower and steadier, the weather will clear.
            Your goal: reach a state of calm serenity.
          </p>

          <div className="grid grid-cols-3 gap-4 mb-10 text-sm">
            {WORLD_STATES.filter((_, i) => i % 2 === 0).map((s) => (
              <div key={s.id} className="p-3 rounded-xl" style={{ backgroundColor: '#10242B' }}>
                <div className="font-medium">{s.label}</div>
                <div className="text-xs" style={{ color: '#A9BAB8' }}>{s.description}</div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setPhase('session')}
            className="px-10 py-4 rounded-xl text-lg font-medium transition-colors"
            style={{ backgroundColor: '#67E8D4', color: '#071318' }}
          >
            Begin session
          </button>
        </div>
      </div>
    );
  }

  // ── Session phase ───────────────────────────────────────────────
  if (phase === 'session') {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#071318', color: '#F5F7F2' }}>
        {/* Top bar */}
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between w-full">
          <button
            onClick={handleEndSession}
            className="text-sm px-4 py-2 rounded-xl transition-colors"
            style={{ color: '#A9BAB8', border: '1px solid rgba(245,247,242,.12)' }}
          >
            End session
          </button>
          <div className="text-sm" style={{ color: '#A9BAB8' }}>
            {formatTime(sessionDuration)}
          </div>
        </div>

        {/* World visualization */}
        <div className="flex-1 flex items-center justify-center px-6 py-4">
          <BreathingWorld state={worldState} breathRate={breathRate} isFrozen={isFrozen} />
        </div>

        {/* Bottom controls */}
        <div className="max-w-6xl mx-auto px-6 py-6 w-full">
          {inputMode === 'camera' ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${cameraRunning ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className="text-sm" style={{ color: '#A9BAB8' }}>
                  Camera {cameraRunning ? 'active' : 'inactive'}
                </span>
              </div>
              <div className="text-sm" style={{ color: '#A9BAB8' }}>
                Quality: {Math.round(quality * 100)}%
              </div>
            </div>
          ) : (
            <GuidedBreathing onBreathRate={handleGuidedBreathRate} onQuality={handleGuidedQuality} />
          )}
        </div>
      </div>
    );
  }

  // ── Debrief phase ───────────────────────────────────────────────
  if (phase === 'debrief') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ backgroundColor: '#071318', color: '#F5F7F2' }}>
        <div className="max-w-lg w-full text-center">
          <div className="text-5xl mb-6">✨</div>
          <h2 className="text-3xl font-bold mb-4">Session complete</h2>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-xl" style={{ backgroundColor: '#10242B' }}>
              <p className="text-sm" style={{ color: '#A9BAB8' }}>Duration</p>
              <p className="text-2xl font-bold">{formatTime(sessionDuration)}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: '#10242B' }}>
              <p className="text-sm" style={{ color: '#A9BAB8' }}>States visited</p>
              <p className="text-2xl font-bold">{statesVisited.length}/{WORLD_STATES.length}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: '#10242B' }}>
              <p className="text-sm" style={{ color: '#A9BAB8' }}>Peak breath rate</p>
              <p className="text-2xl font-bold">{peakBreathRate?.toFixed(1) || '—'} bpm</p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: '#10242B' }}>
              <p className="text-sm" style={{ color: '#A9BAB8' }}>Final state</p>
              <p className="text-2xl font-bold">{worldState.label}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl mb-8 text-sm text-left" style={{ backgroundColor: '#10242B', color: '#A9BAB8' }}>
            <p className="font-medium text-white mb-2">What you experienced</p>
            <p>
              {statesVisited.length >= 4
                ? 'Excellent progress — you moved through most of the weather states. The breathing regulation skill you practiced here can be applied in daily life.'
                : statesVisited.length >= 2
                ? 'Good movement through the states. With practice, you can learn to shift your breathing pattern more quickly.'
                : 'Every session is valuable. The calm breathing pattern you practiced — slow, steady breaths with a longer exhale — is a skill that improves with repetition.'}
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setPhase('select');
                setSessionDuration(0);
                setStatesVisited(['storm']);
                setPeakBreathRate(null);
                setCalibrationCount(0);
                stateMachineRef.current = new BreathingStateMachine((state) => {
                  setWorldState(state);
                  setStatesVisited((prev) => (prev.includes(state.id) ? prev : [...prev, state.id]));
                });
              }}
              className="px-8 py-3 rounded-xl font-medium transition-colors"
              style={{ backgroundColor: '#67E8D4', color: '#071318' }}
            >
              Try again
            </button>
            <a
              href="/lab"
              className="px-8 py-3 rounded-xl font-medium border transition-colors"
              style={{ borderColor: 'rgba(245,247,242,.12)', color: '#F5F7F2' }}
            >
              Back to Lab
            </a>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
