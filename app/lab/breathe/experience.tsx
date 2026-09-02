"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSensorHub } from '@/app/hooks/useSensorHub';
import { BreathingWorld } from '@/app/lib/breathe/BreathingWorld';
import { GuidedBreathing } from '@/app/lib/breathe/GuidedBreathing';
import { FramingGuide } from '@/app/lab/breathe/FramingGuide';
import { BreathingStateMachine, WorldState, WORLD_STATES } from '@/app/lib/breathe/stateMachine';

type SessionPhase = 'select' | 'safety' | 'calibrate' | 'tutorial' | 'session' | 'debrief';
type InputMode = 'camera' | 'guided';

export default function BreatheExperience() {
  const [phase, setPhase] = useState<SessionPhase>('select');
  const [inputMode, setInputMode] = useState<InputMode>('camera');
  const [worldState, setWorldState] = useState<WorldState>(WORLD_STATES[0]);
  const [breathRate, setBreathRate] = useState<number | null>(null);
  const [quality, setQuality] = useState(0);
  const [isFrozen, setIsFrozen] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [statesVisited, setStatesVisited] = useState<string[]>(['storm']);
  const [calibrationCount, setCalibrationCount] = useState(0);

  const stateMachineRef = useRef(new BreathingStateMachine((state) => {
    setWorldState(state);
    setStatesVisited((prev) => (prev.includes(state.id) ? prev : [...prev, state.id]));
  }));

  const sessionStartRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Camera mode
  const { attachVideo, snapshot, status, error, errorKind, needsResume, start, stop, resume } =
    useSensorHub();
  const cameraRunning = status === 'running' || status === 'paused';
  const cameraFailed = status === 'error';

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
  }, [snapshot, inputMode, phase]);

  // Guided mode breathing callback
  const handleGuidedBreathRate = useCallback((bpm: number | null) => {
    // In guided mode, we know the target pace (6 bpm) but don't measure actual breathing.
    // Never expose bpm as measured data (that would violate CLAUDE.md non-negotiable #3:
    // "no number without provenance"). The breathing world receives 6 bpm as the
    // guide pace for simulation purposes only. The badge shows "Guide pace:" static text.
    const q = bpm !== null ? 0.8 : 0;
    setQuality(q);
    setWorldState(stateMachineRef.current.update(6, q));
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

  /**
   * Camera start. Two things matter here and both have bitten us:
   *
   *  1. `getUserMedia` runs synchronously inside this tap handler, before the
   *     first await, so iOS still sees it as user-initiated.
   *  2. We move to `calibrate` FIRST so the preview mounts. The <video> element
   *     itself is rendered unconditionally below regardless, so the stream
   *     always has somewhere to attach — the previous build rendered it only in
   *     the calibrate phase while calling start() from the select phase, which
   *     deadlocked every time on every browser.
   */
  const handleStartCamera = useCallback(async () => {
    setPhase('calibrate');
    await start();
  }, [start]);

  const switchToGuided = useCallback(() => {
    stop();
    setInputMode('guided');
    setCalibrationCount(0);
    setPhase('tutorial');
  }, [stop]);

  const handleReady = useCallback(() => {
    if (inputMode === 'camera') {
      void handleStartCamera();
    } else {
      setPhase('tutorial');
    }
  }, [inputMode, handleStartCamera]);

  // Calibration progress (camera only — guided skips straight to the tutorial)
  useEffect(() => {
    if (phase !== 'calibrate' || inputMode !== 'camera') return;
    if (!cameraRunning || !snapshot?.respiration.available) return;

    setCalibrationCount((prev) => {
      const next = prev + 1;
      if (next >= 3) setPhase('tutorial');
      return next;
    });
  }, [phase, inputMode, cameraRunning, snapshot]);

  const handleEndSession = () => {
    stop();
    setPhase('debrief');
  };

  const resetSession = () => {
    stop();
    setPhase('select');
    setInputMode('camera');
    setSessionDuration(0);
    setStatesVisited(['storm']);
    setCalibrationCount(0);
    setBreathRate(null);
    setQuality(0);
    setIsFrozen(false);
    setWorldState(WORLD_STATES[0]);
    stateMachineRef.current = new BreathingStateMachine((state) => {
      setWorldState(state);
      setStatesVisited((prev) => (prev.includes(state.id) ? prev : [...prev, state.id]));
    });
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  /**
   * Calmest weather state actually reached, used instead of a breathing-rate
   * number. We have not validated the respiration adapter against any reference
   * instrument, so publishing a figure like "6.4 bpm" would dress an unverified
   * estimate up as a measurement.
   */
  const calmestStateLabel = useMemo(() => {
    let bestIndex = 0;
    for (const id of statesVisited) {
      const index = WORLD_STATES.findIndex((s) => s.id === id);
      if (index > bestIndex) bestIndex = index;
    }
    return WORLD_STATES[bestIndex]?.label ?? '—';
  }, [statesVisited]);

  // Where the always-mounted preview should appear for the current phase.
  const previewMode: 'calibrate' | 'pip' | 'hidden' =
    inputMode !== 'camera' || !cameraRunning
      ? phase === 'calibrate' && inputMode === 'camera'
        ? 'calibrate'
        : 'hidden'
      : phase === 'calibrate'
      ? 'calibrate'
      : phase === 'session'
      ? 'pip'
      : 'hidden';

  const previewWrapperClass =
    previewMode === 'calibrate'
      ? 'fixed bottom-8 left-1/2 z-30 w-64 -translate-x-1/2 overflow-hidden rounded-2xl border'
      : previewMode === 'pip'
      ? 'fixed bottom-4 right-4 z-30 w-28 overflow-hidden rounded-xl border opacity-80'
      : 'pointer-events-none fixed left-0 top-0 h-px w-px overflow-hidden opacity-0';

  /**
   * The <video> element is rendered on every phase and never conditionally
   * unmounted. It must outlive the calibrate screen: the sensor hub keeps
   * reading frames from this exact element for the whole session.
   */
  const persistentPreview = (
    <div
      className={previewWrapperClass}
      style={previewMode === 'hidden' ? undefined : { borderColor: 'rgba(245,247,242,.2)' }}
      aria-hidden={previewMode === 'hidden'}
    >
      <div className="relative aspect-[4/3] w-full bg-black">
        <video
          ref={attachVideo}
          autoPlay
          muted
          playsInline
          className="h-full w-full -scale-x-100 object-cover"
        />
        <FramingGuide visible={previewMode === 'calibrate'} />
        {previewMode !== 'hidden' && needsResume && (
          <button
            onClick={resume}
            className="absolute inset-0 grid place-items-center bg-black/70 text-sm font-medium"
            style={{ color: '#67E8D4' }}
          >
            Tap to resume camera
          </button>
        )}
      </div>
    </div>
  );

  const safetyNote = (
    <div
      className="rounded-2xl border p-5 text-left text-sm"
      style={{ backgroundColor: '#10242B', borderColor: 'rgba(245,247,242,.12)', color: '#A9BAB8' }}
    >
      <p className="mb-3 font-medium text-white">Before you start</p>
      <ul className="space-y-2">
        <li className="flex items-start gap-3">
          <span style={{ color: '#67E8D4' }}>·</span>
          <span>Breathe normally. Never hold, force, or strain your breath.</span>
        </li>
        <li className="flex items-start gap-3">
          <span style={{ color: '#67E8D4' }}>·</span>
          <span>
            If you feel light-headed, dizzy, or uncomfortable at any point, stop and breathe
            normally. You can leave at any time.
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span style={{ color: '#67E8D4' }}>·</span>
          <span>Sit somewhere comfortable and supported, not standing.</span>
        </li>
        <li className="flex items-start gap-3">
          <span style={{ color: '#F4B86A' }}>·</span>
          <span>
            This is a wellness experience, not medical care, and not a medical device. If you have a
            respiratory or cardiac condition, or you are pregnant, check with a clinician before
            doing breathing exercises.
          </span>
        </li>
      </ul>
    </div>
  );

  // ── Phase content ───────────────────────────────────────────────
  let content: React.ReactNode = null;

  if (phase === 'select') {
    content = (
      <div className="flex min-h-screen flex-col">
        <nav className="mx-auto w-full max-w-6xl px-6 py-6">
          <a href="/lab" className="flex items-center gap-2 text-sm" style={{ color: '#A9BAB8' }}>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Lab
          </a>
        </nav>
        <main className="flex flex-1 items-center justify-center px-6 py-8">
          <div className="w-full max-w-lg text-center">
            <div className="mb-6 text-6xl">🌊</div>
            <h1 className="mb-4 text-4xl font-bold">Breathe the World Open</h1>
            <p className="mb-10 text-lg" style={{ color: '#A9BAB8' }}>
              A stormed-over world responds as your breathing becomes slower and steadier.
            </p>

            <div className="mb-10 space-y-4">
              <button
                onClick={() => {
                  setInputMode('camera');
                  setPhase('safety');
                }}
                className="w-full rounded-2xl border-2 p-6 text-left transition-all hover:border-[#67E8D4]/30"
                style={{ backgroundColor: '#10242B', borderColor: 'rgba(245,247,242,.12)' }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl text-xl"
                    style={{ backgroundColor: '#67E8D420' }}
                  >
                    📷
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Camera mode</h3>
                    <p className="text-sm" style={{ color: '#A9BAB8' }}>
                      The world responds when the camera can see a steady repeating pattern in your
                      upper body. Experimental, and it pauses when it cannot. Requires camera
                      permission.
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  setInputMode('guided');
                  setPhase('safety');
                }}
                className="w-full rounded-2xl border-2 p-6 text-left transition-all hover:border-[#7DD3B0]/30"
                style={{ backgroundColor: '#10242B', borderColor: 'rgba(245,247,242,.12)' }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl text-xl"
                    style={{ backgroundColor: '#7DD3B020' }}
                  >
                    🎯
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Guided mode</h3>
                    <p className="text-sm" style={{ color: '#A9BAB8' }}>
                      Follow visual breathing cues. No camera needed — works on any device.
                    </p>
                  </div>
                </div>
              </button>
            </div>

            <p className="text-xs" style={{ color: '#A9BAB8' }}>
              3–5 minutes · Camera processing runs in your browser · No account required
            </p>
          </div>
        </main>
      </div>
    );
  } else if (phase === 'safety') {
    content = (
      <div className="flex min-h-screen flex-col">
        <nav className="mx-auto w-full max-w-6xl px-6 py-6">
          <button
            onClick={() => setPhase('select')}
            className="flex items-center gap-2 text-sm"
            style={{ color: '#A9BAB8' }}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </nav>
        <main className="flex flex-1 items-center justify-center px-6 py-8">
          <div className="w-full max-w-lg">
            <h2 className="mb-3 text-center text-3xl font-bold">Get comfortable</h2>
            <p className="mb-8 text-center" style={{ color: '#A9BAB8' }}>
              {inputMode === 'camera'
                ? 'Camera mode next. Nothing starts until you tap below.'
                : 'Guided mode next. No camera will be used.'}
            </p>

            {safetyNote}

            <button
              onClick={handleReady}
              className="mt-8 w-full rounded-xl py-4 text-lg font-medium transition-colors"
              style={{ backgroundColor: '#67E8D4', color: '#071318' }}
            >
              {inputMode === 'camera' ? 'I understand — start camera' : "I understand — let's begin"}
            </button>

            {inputMode === 'camera' && (
              <button
                onClick={switchToGuided}
                className="mt-3 w-full rounded-xl border py-3 text-sm transition-colors"
                style={{ borderColor: 'rgba(245,247,242,.12)', color: '#A9BAB8' }}
              >
                Use guided mode instead (no camera)
              </button>
            )}
          </div>
        </main>
      </div>
    );
  } else if (phase === 'calibrate') {
    content = (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 pb-72">
        {cameraFailed ? (
          <div className="w-full max-w-md text-center">
            <div className="mb-4 text-4xl">📷</div>
            <h2 className="mb-3 text-2xl font-semibold">Camera could not start</h2>
            <p className="mb-8" style={{ color: '#A9BAB8' }}>
              {error || 'Something prevented the camera from starting.'}
            </p>
            <div className="space-y-3">
              <button
                onClick={switchToGuided}
                className="w-full rounded-xl py-4 font-medium transition-colors"
                style={{ backgroundColor: '#67E8D4', color: '#071318' }}
              >
                Continue in guided mode
              </button>
              {errorKind !== 'no-camera' && errorKind !== 'unsupported-browser' && (
                <button
                  onClick={() => void start()}
                  className="w-full rounded-xl border py-3 text-sm transition-colors"
                  style={{ borderColor: 'rgba(245,247,242,.12)', color: '#F5F7F2' }}
                >
                  Try the camera again
                </button>
              )}
              <button
                onClick={resetSession}
                className="w-full py-2 text-sm"
                style={{ color: '#A9BAB8' }}
              >
                Back to start
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-md text-center">
            <div
              className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-t-transparent"
              style={{ borderColor: '#67E8D4', borderTopColor: 'transparent' }}
            />
            <h2 className="mb-3 text-2xl font-semibold">Looking for a breathing pattern…</h2>
            <p className="mx-auto max-w-md" style={{ color: '#A9BAB8' }}>
              Sit comfortably with your head, shoulders and upper chest in view, and breathe
              normally. Finding a steady repeating pattern usually takes around half a minute, and
              sometimes it is not possible at all — if so, guided mode works just as well.
            </p>
            <button
              onClick={switchToGuided}
              className="mt-8 rounded-xl border px-6 py-3 text-sm transition-colors"
              style={{ borderColor: 'rgba(245,247,242,.12)', color: '#A9BAB8' }}
            >
              Switch to guided mode
            </button>
          </div>
        )}
      </div>
    );
  } else if (phase === 'tutorial') {
    content = (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-lg text-center">
          <div className="mb-6 text-5xl">🌊</div>
          <h2 className="mb-4 text-3xl font-bold">Welcome to the storm</h2>
          <p className="mb-8 text-lg" style={{ color: '#A9BAB8' }}>
            The world is dark and stormy. As you breathe slower and steadier, the weather will
            clear. Your goal: reach a state of calm serenity.
          </p>

          <div className="mb-10 grid grid-cols-3 gap-4 text-sm">
            {WORLD_STATES.filter((_, i) => i % 2 === 0).map((s) => (
              <div key={s.id} className="rounded-xl p-3" style={{ backgroundColor: '#10242B' }}>
                <div className="font-medium">{s.label}</div>
                <div className="text-xs" style={{ color: '#A9BAB8' }}>
                  {s.description}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setPhase('session')}
            className="rounded-xl px-10 py-4 text-lg font-medium transition-colors"
            style={{ backgroundColor: '#67E8D4', color: '#071318' }}
          >
            Begin session
          </button>
          <p className="mt-4 text-xs" style={{ color: '#A9BAB8' }}>
            Never force your breath. Stop if you feel light-headed.
          </p>
        </div>
      </div>
    );
  } else if (phase === 'session') {
    content = (
      <div className="flex min-h-screen flex-col">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <button
            onClick={handleEndSession}
            className="rounded-xl px-4 py-2 text-sm transition-colors"
            style={{ color: '#A9BAB8', border: '1px solid rgba(245,247,242,.12)' }}
          >
            End session
          </button>
          <div className="text-sm" style={{ color: '#A9BAB8' }}>
            {formatTime(sessionDuration)}
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-4">
          <BreathingWorld state={worldState} breathRate={breathRate} isFrozen={isFrozen} inputMode={inputMode} />
        </div>

        <div className="mx-auto w-full max-w-6xl px-6 py-6">
          {inputMode === 'camera' ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`h-2 w-2 rounded-full ${cameraRunning ? 'bg-green-400' : 'bg-red-400'}`}
                />
                <span className="text-sm" style={{ color: '#A9BAB8' }}>
                  Camera {cameraRunning ? 'active' : 'inactive'}
                </span>
              </div>
              <div className="text-sm" style={{ color: '#A9BAB8' }}>
                Signal {quality >= 0.6 ? 'steady' : quality >= 0.25 ? 'unsteady' : 'not detected'}
              </div>
            </div>
          ) : (
            <GuidedBreathing onBreathRate={handleGuidedBreathRate} onQuality={handleGuidedQuality} />
          )}
        </div>
      </div>
    );
  } else if (phase === 'debrief') {
    content = (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-lg text-center">
          <div className="mb-6 text-5xl">✨</div>
          <h2 className="mb-4 text-3xl font-bold">Session complete</h2>

          <div className="mb-8 grid grid-cols-2 gap-4">
            <div className="rounded-xl p-4" style={{ backgroundColor: '#10242B' }}>
              <p className="text-sm" style={{ color: '#A9BAB8' }}>
                Duration
              </p>
              <p className="text-2xl font-bold">{formatTime(sessionDuration)}</p>
            </div>
            <div className="rounded-xl p-4" style={{ backgroundColor: '#10242B' }}>
              <p className="text-sm" style={{ color: '#A9BAB8' }}>
                States visited
              </p>
              <p className="text-2xl font-bold">
                {statesVisited.length}/{WORLD_STATES.length}
              </p>
            </div>
            <div className="rounded-xl p-4" style={{ backgroundColor: '#10242B' }}>
              <p className="text-sm" style={{ color: '#A9BAB8' }}>
                Calmest state reached
              </p>
              <p className="text-2xl font-bold">{calmestStateLabel}</p>
            </div>
            <div className="rounded-xl p-4" style={{ backgroundColor: '#10242B' }}>
              <p className="text-sm" style={{ color: '#A9BAB8' }}>
                Final state
              </p>
              <p className="text-2xl font-bold">{worldState.label}</p>
            </div>
          </div>

          <div
            className="mb-6 rounded-xl p-4 text-left text-sm"
            style={{ backgroundColor: '#10242B', color: '#A9BAB8' }}
          >
            <p className="mb-2 font-medium text-white">What you experienced</p>
            <p>
              {statesVisited.length >= 4
                ? 'You moved through most of the weather states. The breathing pattern you practised here — slow, steady breaths with a longer exhale — is a skill you can use away from the screen.'
                : statesVisited.length >= 2
                ? 'Good movement through the states. With practice, shifting your breathing pattern gets quicker.'
                : 'Every session counts. The calm breathing pattern you practised — slow, steady breaths with a longer exhale — improves with repetition.'}
            </p>
          </div>

          <div
            className="mb-8 rounded-xl p-4 text-left text-xs"
            style={{ backgroundColor: '#10242B', color: '#A9BAB8' }}
          >
            <p>
              We are not showing you a breathing rate. Our camera-based estimate has never been
              compared against a reference instrument, so we do not know how far off it is. Showing
              a number would imply a precision we have not earned.
            </p>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={resetSession}
              className="rounded-xl px-8 py-3 font-medium transition-colors"
              style={{ backgroundColor: '#67E8D4', color: '#071318' }}
            >
              Try again
            </button>
            <a
              href="/lab"
              className="rounded-xl border px-8 py-3 font-medium transition-colors"
              style={{ borderColor: 'rgba(245,247,242,.12)', color: '#F5F7F2' }}
            >
              Back to Lab
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#071318', color: '#F5F7F2' }}>
      {persistentPreview}
      {content}
    </div>
  );
}
