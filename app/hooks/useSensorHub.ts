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
 */
export interface UseSensorHubOptions {
  allowSimulation?: boolean;
}

export interface UseSensorHubResult {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  snapshot: SensorSnapshot | null;
  status: HubStatus;
  error: string;
  activeAdapters: Partial<Record<Capability, string>>;
  isSimulation: boolean;
  start: () => Promise<void>;
  stop: () => void;
  pause: () => void;
  resume: () => void;
}

const SIMULATION_ENABLED =
  process.env.NEXT_PUBLIC_SENSOR_SIMULATION === 'true' && process.env.NODE_ENV === 'development';

export function useSensorHub(options: UseSensorHubOptions = {}): UseSensorHubResult {
  const { allowSimulation = false } = options;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hubRef = useRef<ReturnType<typeof createDefaultSensorHub> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [snapshot, setSnapshot] = useState<SensorSnapshot | null>(null);
  const [status, setStatus] = useState<HubStatus>('idle');
  const [error, setError] = useState('');
  const [activeAdapters, setActiveAdapters] = useState<Partial<Record<Capability, string>>>({});

  const isSimulation = allowSimulation && SIMULATION_ENABLED;

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
    setStatus('requesting-camera');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 1280 },
        audio: false,
      });
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) throw new Error('video element not mounted');
      video.srcObject = stream;
      await video.play();

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

      const name = caught instanceof DOMException ? caught.name : '';
      const message =
        name === 'NotAllowedError'
          ? 'Camera permission blocked. Allow camera access in browser settings.'
          : name === 'NotFoundError'
          ? 'No camera found. Connect a camera.'
          : caught instanceof Error
          ? caught.message
          : 'Camera opened but the sensor pipeline failed to load.';

      setError(message);
      setStatus('error');
    }
  }, [allowSimulation]);

  const stop = useCallback(() => {
    hubRef.current?.destroy();
    hubRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setSnapshot(null);
    setActiveAdapters({});
    setStatus('idle');
  }, []);

  const pause = useCallback(() => {
    hubRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    hubRef.current?.resume();
  }, []);

  useEffect(() => () => stop(), [stop]);

  return { videoRef, snapshot, status, error, activeAdapters, isSimulation, start, stop, pause, resume };
}
