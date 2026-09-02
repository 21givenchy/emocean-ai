/**
 * SensorHub type definitions.
 *
 * Every physiological/behavioral output is a `SensorField<T>` — a value is
 * either genuinely present (`available: true`, `value` populated) or it is
 * not (`available: false`, `value: null`, `reason` explaining why). No
 * adapter is permitted to invent a number when the underlying signal isn't
 * there; "unavailable" is always a legitimate, expected state.
 */

export type Capability =
  | 'heartRate'
  | 'bvp'
  | 'beatIntervals'
  | 'signalQuality'
  | 'prv'
  | 'respiration'
  | 'faceDetection'
  | 'headPose'
  | 'eyeState'
  | 'gaze'
  | 'speaking'
  | 'movementStability';

export const ALL_CAPABILITIES: Capability[] = [
  'heartRate',
  'bvp',
  'beatIntervals',
  'signalQuality',
  'prv',
  'respiration',
  'faceDetection',
  'headPose',
  'eyeState',
  'gaze',
  'speaking',
  'movementStability',
];

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Point {
  x: number;
  y: number;
  z?: number;
}

export interface EyeOpenState {
  prob: number;
  open: boolean;
}

export interface PrvMetrics {
  rmssd: number;
  sdnn: number;
  meanRR: number;
  n: number;
}

export interface FaceDetectionValue {
  box: Box;
  keypoints?: Point[];
}

export interface HeadPoseValue {
  yaw: number;
  pitch: number;
  roll: number;
}

export interface EyeStateValue {
  left: EyeOpenState;
  right: EyeOpenState;
  bothClosed: boolean;
}

export interface GazeValue {
  yaw: number;
  pitch: number;
  confidence?: number | null;
}

export interface SpeakingValue {
  jawOpen: number;
  speaking: boolean;
}

export interface MovementStabilityValue {
  score: number; // 0 = unstable, 1 = stable
}

/**
 * A single reported field. `derived: true` marks values computed from
 * another sensor's output rather than measured directly (e.g. respiration
 * estimated from the BVP waveform) — UI should label these distinctly.
 */
export interface SensorField<T> {
  value: T | null;
  available: boolean;
  reason?: string;
  source: string;
  derived?: boolean;
  timestamp: number;
}

export interface SensorSnapshot {
  heartRate: SensorField<number>;
  bvp: SensorField<number[]>;
  beatIntervals: SensorField<number[]>;
  signalQuality: SensorField<number>;
  prv: SensorField<PrvMetrics>;
  respiration: SensorField<number>;
  faceDetection: SensorField<FaceDetectionValue>;
  headPose: SensorField<HeadPoseValue>;
  eyeState: SensorField<EyeStateValue>;
  gaze: SensorField<GazeValue>;
  speaking: SensorField<SpeakingValue>;
  movementStability: SensorField<MovementStabilityValue>;
}

export type HubStatus =
  | 'idle'
  | 'requesting-camera'
  | 'initializing'
  | 'running'
  | 'paused'
  | 'error'
  | 'stopped';

/**
 * Context handed to every adapter. Adapters only ever write fields they
 * are the assigned owner of — the hub enforces this at `report()` time.
 */
export interface AdapterContext {
  video: HTMLVideoElement;
  /** Report a new value (or explicit unavailability) for one capability. */
  report<K extends Capability>(
    capability: K,
    value: SensorSnapshotValue<K> | null,
    meta?: { available?: boolean; reason?: string; derived?: boolean }
  ): void;
  /** Read-only view of the current merged snapshot (for derived adapters). */
  getSnapshot(): Readonly<SensorSnapshot>;
  onError(message: string): void;
}

export type SensorSnapshotValue<K extends Capability> = SensorSnapshot[K]['value'];

/**
 * A SensorAdapter is a self-contained data source. `init()` must resolve
 * with the subset of its declared `capabilities` it actually managed to
 * activate — a partial model-load failure (e.g. gaze model 404s) should
 * shrink this list rather than throw, so the rest of the adapter's
 * capabilities can still be used. Throwing from `init()` means the whole
 * adapter is unusable and every one of its capabilities falls through to
 * the next adapter in the registry.
 */
export interface SensorAdapter {
  id: string;
  /** Capabilities this adapter can potentially produce. */
  capabilities: Capability[];
  init(ctx: AdapterContext): Promise<Capability[]>;
  start(): void;
  stop(): void;
  destroy(): void;
}

/** Priority-ordered adapter id list per capability. */
export type AdapterRegistry = Partial<Record<Capability, string[]>>;
