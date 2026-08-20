"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { createDefaultSensorHub } from '@/app/lib/sensors';
import type { Capability, HubStatus, SensorSnapshot } from '@/app/lib/sensors';

/**
 * React binding for SensorHub. Owns the camera MediaStream + the video
 * element the hub reads frames from; exposes a plain, always-current
 * snapshot plus start/stop/pause controls.
 *
 * Simulation mode is never turned on implicitly — `allowSimulation` must be
 * passed explicitly by the caller AND the two env-var gates in
 * `simulationAdapter.ts` must both hold, otherwise the hub silently runs
 * with the real adapter registry.
 *
 * Camera lifecycle notes, learned the hard way:
 *
 *  - `start()` must be called from a real user gesture. iOS Safari will fail
 *    silently if `getUserMedia` is reached from an effect after navigation.
 *  - The <video> element must already be in the DOM when `start()` runs. A
 *    consumer that renders the video only once the camera is "ready" creates a
 *    deadlock: the stream waits for the element, the element waits for the
 *    stream. `start()` now waits briefly for a late mount rather than throwing,
 *    but consumers should still keep the element mounted unconditionally.
 *  - Every failure path must produce copy a person can act on. No internal
 *    strings reach the UI from here.
 */
export interface UseSensorHubOptions {
  allowSimulation?: boolean;
}

/**
 * Machine-readable failure category so the UI can decide what to offer
 * (retry vs. switch to guided vs. free the camera) without string matching.
 */
export type SensorErrorKind =
  | 'permission-denied'
  | 'no-camera'
  | 'camera-busy'
  | 'unsupported-constraints'
  | 'unsupported-browser'
  | 'video-unavailable'
  | 'playback-blocked'
  | 'pipeline-failed'
  | null;

export interface UseSensorHubResult {
  /** Attach to the <video> element. Callback ref: fires as soon as it mounts. */
  attachVideo: (el: HTMLVideoElement | null) => void;
  /** Retained for consumers that already pass this straight to `ref=`. */
  videoRef: React.RefObject<HTMLVideoElement | null>;
  snapshot: SensorSnapshot | null;
  status: HubStatus;
  error: string;
  errorKind: SensorErrorKind;
  activeAdapters: Partial<Record<Capability, string>>;
  isSimulation: boolean;
  /** Must be invoked from a user gesture handler. */
  start: () => Promise<void>;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  /** True when iOS suspended the tracks after backgrounding; offer "tap to resume". */
  needsResume: boolean;
}

const SIMULATION_ENABLED =
  process.env.NEXT_PUBLIC_SENSOR_SIMULATION === 'true' && process.env.NODE_ENV === 'development';

/** How long to tolerate a video element that mounts a tick after `start()`. */
const VIDEO_MOUNT_TIMEOUT_MS = 3000;

interface FailureCopy {
  kind: SensorErrorKind;
  message: string;
}

function describeFailure(caught: unknown): FailureCopy {
  const name =
    caught instanceof DOMException || (caught instanceof Error && 'name' in caught)
      ? caught.name
      : '';

  switch (name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return {
        kind: 'permission-denied',
        message:
          'Camera access was declined. You can allow it in your browser settings and try again — or carry on in guided mode, which needs no camera.',
      };
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return {
        kind: 'no-camera',
        message:
          'No camera was found on this device. Guided mode works without one.',
      };
    case 'NotReadableError':
    case 'TrackStartError':
      return {
        kind: 'camera-busy',
        message:
          'The camera is already in use by another app or browser tab. Close whatever else is using it and try again, or continue in guided mode.',
      };
    case 'OverconstrainedError':
    case 'ConstraintNotSatisfiedError':
      return {
        kind: 'unsupported-constraints',
        message:
          'This camera does not support the settings we asked for. Guided mode will work on this device.',
      };
    case 'AbortError':
      return {
        kind: 'playback-blocked',
        message:
          'The camera stopped before it finished starting. Try again, or continue in guided mode.',
      };
    default:
      return {
        kind: 'pipeline-failed',
        message:
          'The camera opened but the sensing pipeline could not start. Try again, or continue in guided mode.',
      };
  }
}

/**
 * Resolve once the video element is in the DOM. Returns null on timeout rather
 * than throwing, so the caller can present human copy instead of a stack trace.
 */
function waitForVideoElement(
  ref: React.RefObject<HTMLVideoElement | null>,
  timeoutMs: number
): Promise<HTMLVideoElement | null> {
  if (ref.current) return Promise.resolve(ref.current);

  return new Promise((resolve) => {
    const startedAt = Date.now();
    const poll = () => {
      if (ref.current) return resolve(ref.current);
      if (Date.now() - startedAt >= timeoutMs) return resolve(null);
      requestAnimationFrame(poll);
    };
    requestAnimationFrame(poll);
  });
}

export function useSensorHub(options: UseSensorHubOptions = {}): UseSensorHubResult {
  const { allowSimulation = false } = options;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hubRef = useRef<ReturnType<typeof createDefaultSensorHub> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [snapshot, setSnapshot] = useState<SensorSnapshot | null>(null);
  const [status, setStatus] = useState<HubStatus>('idle');
  const [error, setError] = useState('');
  const [errorKind, setErrorKind] = useState<SensorErrorKind>(null);
  const [needsResume, setNeedsResume] = useState(false);
  const [activeAdapters, setActiveAdapters] = useState<Partial<Record<Capability, string>>>({});

  const isSimulation = allowSimulation && SIMULATION_ENABLED;

  /**
   * Callback ref. Consumers must keep the element mounted for the whole camera
   * lifetime; this exists so a late mount is still picked up immediately rather
   * than being read once and cached as null.
   */
  const attachVideo = useCallback((el: HTMLVideoElement | null) => {
    videoRef.current = el;
  }, []);

  useEffect(() => {
    if (allowSimulation && SIMULATION_ENABLED) {
      // eslint-disable-next-line no-console
      console.warn(
        '[useSensorHub] SIMULATION MODE ACTIVE — NEXT_PUBLIC_SENSOR_SIMULATION=true and allowSimulation=true. ' +
          'Every field in the snapshot is synthetic (source: "simulation-dev-only"). This must never happen in production.'
      );
    }
  }, [allowSimulation]);

  const start = useCallback(async () => {
    setError('');
    setErrorKind(null);
    setNeedsResume(false);
    setStatus('requesting-camera');

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError(
        'This browser does not offer camera access to web pages. Guided mode works everywhere.'
      );
      setErrorKind('unsupported-browser');
      setStatus('error');
      return;
    }

    try {
      // `ideal`, never `exact`: exact resolution constraints throw
      // OverconstrainedError on several iOS front cameras.
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;

      const video = await waitForVideoElement(videoRef, VIDEO_MOUNT_TIMEOUT_MS);
      if (!video) {
        // Consumer bug, but the user still gets copy they can act on.
        // eslint-disable-next-line no-console
        console.error(
          '[useSensorHub] No <video> element was attached within ' +
            `${VIDEO_MOUNT_TIMEOUT_MS}ms of start(). Keep the element mounted unconditionally ` +
            'and pass `attachVideo` to its ref.'
        );
        throw Object.assign(new Error('video-unavailable'), { name: 'VideoUnavailableError' });
      }

      video.srcObject = stream;
      // Required for inline playback on iOS; harmless elsewhere.
      video.muted = true;
      video.playsInline = true;

      try {
        await video.play();
      } catch (playError) {
        // iOS rejects play() in several situations (backgrounded tab, low power
        // mode, autoplay policy). The stream is live, so surface a resume
        // affordance rather than tearing everything down.
        // eslint-disable-next-line no-console
        console.warn('[useSensorHub] video.play() rejected', playError);
        setNeedsResume(true);
      }

      const hub = createDefaultSensorHub({
        video,
        allowSimulation,
        onStatusChange: setStatus,
        onSnapshotChange: setSnapshot,
      });
      hubRef.current = hub;

      await hub.start();
      setActiveAdapters({ ...hub.getActiveAdapterIds() });
    } catch (caught) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;

      const isVideoUnavailable =
        caught instanceof Error && caught.name === 'VideoUnavailableError';

      const { kind, message } = isVideoUnavailable
        ? {
            kind: 'video-unavailable' as const,
            message:
              'The camera preview could not be set up on this device. Guided mode will work.',
          }
        : describeFailure(caught);

      setError(message);
      setErrorKind(kind);
      setStatus('error');
    }
  }, [allowSimulation]);

  const stop = useCallback(() => {
    hubRef.current?.destroy();
    hubRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setSnapshot(null);
    setActiveAdapters({});
    setNeedsResume(false);
    setStatus('idle');
  }, []);

  const pause = useCallback(() => {
    hubRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    const video = videoRef.current;
    if (video && video.paused) {
      video.play().catch(() => setNeedsResume(true));
    }
    setNeedsResume(false);
    hubRef.current?.resume();
  }, []);

  /**
   * iOS suspends camera tracks when the tab loses focus and does not resume
   * them on return. Detect the dead stream and offer an explicit resume rather
   * than showing a frozen frame that looks live.
   */
  useEffect(() => {
    const handleVisibility = () => {
      if (typeof document === 'undefined') return;
      if (!streamRef.current) return;

      if (document.visibilityState === 'visible') {
        const tracksLive = streamRef.current
          .getVideoTracks()
          .some((track) => track.readyState === 'live' && track.enabled);
        const video = videoRef.current;

        if (!tracksLive) {
          setNeedsResume(true);
          return;
        }
        if (video?.paused) {
          video.play().catch(() => setNeedsResume(true));
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  useEffect(() => () => stop(), [stop]);

  return {
    attachVideo,
    videoRef,
    snapshot,
    status,
    error,
    errorKind,
    activeAdapters,
    isSimulation,
    start,
    stop,
    pause,
    resume,
    needsResume,
  };
}
