import { SensorHub } from './SensorHub';
import type { AdapterRegistry, HubStatus, SensorSnapshot } from './types';
import { createVitalCameraAdapter } from './adapters/vitalCameraAdapter';
import { createMediapipeFallbackAdapter } from './adapters/mediapipeFallbackAdapter';
import { createGreenChannelRppgAdapter } from './adapters/greenChannelRppgAdapter';
import { createRespirationAdapter } from './adapters/respirationAdapter';
import { createChestMotionRespirationAdapter } from './adapters/chestMotionRespirationAdapter';
import { createMovementStabilityAdapter } from './adapters/movementStabilityAdapter';
import { createSimulationAdapter, isSimulationAllowed } from './adapters/simulationAdapter';

export type { Capability, SensorSnapshot, SensorField, HubStatus, AdapterRegistry } from './types';
export { SensorHub } from './SensorHub';
export { isSimulationAllowed } from './adapters/simulationAdapter';

/** Default priority-ordered adapter registry (see plan for rationale). */
const REAL_REGISTRY: AdapterRegistry = {
  heartRate: ['vitalcamera-sdk', 'green-channel-rppg'],
  bvp: ['vitalcamera-sdk', 'green-channel-rppg'],
  beatIntervals: ['vitalcamera-sdk', 'green-channel-rppg'],
  signalQuality: ['vitalcamera-sdk', 'green-channel-rppg'],
  prv: ['vitalcamera-sdk', 'green-channel-rppg'],
  faceDetection: ['vitalcamera-sdk', 'mediapipe-fallback'],
  headPose: ['vitalcamera-sdk', 'mediapipe-fallback'],
  eyeState: ['vitalcamera-sdk', 'mediapipe-fallback'],
  gaze: ['vitalcamera-sdk'], // no fallback gaze source
  speaking: ['vitalcamera-sdk', 'mediapipe-fallback'],
  respiration: ['chest-motion-respiration', 'respiration-derived'],
  movementStability: ['movement-stability-derived'],
};

const SIMULATION_REGISTRY: AdapterRegistry = {
  heartRate: ['simulation-dev-only'],
  bvp: ['simulation-dev-only'],
  beatIntervals: ['simulation-dev-only'],
  signalQuality: ['simulation-dev-only'],
  prv: ['simulation-dev-only'],
  faceDetection: ['simulation-dev-only'],
  headPose: ['simulation-dev-only'],
  eyeState: ['simulation-dev-only'],
  gaze: ['simulation-dev-only'],
  speaking: ['simulation-dev-only'],
  respiration: ['simulation-dev-only'],
  movementStability: ['simulation-dev-only'],
};

export interface CreateSensorHubOptions {
  video: HTMLVideoElement;
  /** Explicit dev-only opt-in. Ignored unless NEXT_PUBLIC_SENSOR_SIMULATION=true AND NODE_ENV=development. */
  allowSimulation?: boolean;
  onStatusChange?: (status: HubStatus) => void;
  onSnapshotChange?: (snapshot: SensorSnapshot) => void;
}

/**
 * Builds a fully-wired SensorHub with the default adapter registry.
 * Simulation mode is only ever selected when every gate in
 * `simulationAdapter.ts` passes — see that file for the exact conditions.
 */
export function createDefaultSensorHub(options: CreateSensorHubOptions): SensorHub {
  const useSimulation = Boolean(options.allowSimulation) && isSimulationAllowed();

  const adapters = useSimulation
    ? [createSimulationAdapter({ allowSimulation: true })]
    : [
        createVitalCameraAdapter(),
        createMediapipeFallbackAdapter(),
        createGreenChannelRppgAdapter(),
        createRespirationAdapter(),
        createChestMotionRespirationAdapter(),
        createMovementStabilityAdapter(),
      ];

  return new SensorHub({
    video: options.video,
    adapters,
    registry: useSimulation ? SIMULATION_REGISTRY : REAL_REGISTRY,
    onStatusChange: options.onStatusChange,
    onSnapshotChange: options.onSnapshotChange,
  });
}
