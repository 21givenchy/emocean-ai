/**
 * Environment state machine for Breathe the World Open.
 *
 * Maps breathing rate to world states: storm → clearing → calm → serene.
 * Each state controls visual parameters (clouds, light, wind, water, threats).
 * Transitions are smooth and gated by signal quality.
 */

// ── World state ─────────────────────────────────────────────────────

export interface WorldState {
  id: string;
  label: string;
  description: string;
  sky: { top: string; bottom: string; sunOpacity: number; sunY: number };
  clouds: { opacity: number; count: number; speed: number; y: number };
  wind: { strength: number; direction: number };
  water: { roughness: number; color: string; height: number };
  threats: { visible: boolean; opacity: number; type: string };
  particles: { type: 'rain' | 'snow' | 'mist' | 'none'; density: number };
  ambient: { warmth: number; brightness: number };
}

export const WORLD_STATES: WorldState[] = [
  {
    id: 'storm',
    label: 'Storm',
    description: 'Heavy weather — breathing is fast or irregular',
    sky: { top: '#1a1a2e', bottom: '#2d2d44', sunOpacity: 0, sunY: 110 },
    clouds: { opacity: 0.9, count: 8, speed: 2, y: 15 },
    wind: { strength: 0.8, direction: 0 },
    water: { roughness: 0.9, color: '#1a3a4a', height: 25 },
    threats: { visible: true, opacity: 0.7, type: 'lightning' },
    particles: { type: 'rain', density: 0.8 },
    ambient: { warmth: 0.2, brightness: 0.3 },
  },
  {
    id: 'gale',
    label: 'Gale',
    description: 'Strong winds — breathing is slowing',
    sky: { top: '#2d3a4a', bottom: '#4a5a6a', sunOpacity: 0.1, sunY: 90 },
    clouds: { opacity: 0.7, count: 6, speed: 1.5, y: 20 },
    wind: { strength: 0.6, direction: 0 },
    water: { roughness: 0.6, color: '#2a4a5a', height: 20 },
    threats: { visible: true, opacity: 0.3, type: 'lightning' },
    particles: { type: 'rain', density: 0.4 },
    ambient: { warmth: 0.35, brightness: 0.45 },
  },
  {
    id: 'overcast',
    label: 'Overcast',
    description: 'Clouds thinning — steady breathing emerging',
    sky: { top: '#4a5a6a', bottom: '#6a7a8a', sunOpacity: 0.2, sunY: 70 },
    clouds: { opacity: 0.5, count: 4, speed: 1, y: 25 },
    wind: { strength: 0.3, direction: 0 },
    water: { roughness: 0.4, color: '#3a5a6a', height: 15 },
    threats: { visible: false, opacity: 0, type: 'lightning' },
    particles: { type: 'mist', density: 0.3 },
    ambient: { warmth: 0.5, brightness: 0.6 },
  },
  {
    id: 'clearing',
    label: 'Clearing',
    description: 'Sky opens — breathing is calm and rhythmic',
    sky: { top: '#4a7a9a', bottom: '#7aaacc', sunOpacity: 0.5, sunY: 50 },
    clouds: { opacity: 0.3, count: 2, speed: 0.5, y: 30 },
    wind: { strength: 0.15, direction: 0 },
    water: { roughness: 0.2, color: '#4a7a9a', height: 10 },
    threats: { visible: false, opacity: 0, type: 'lightning' },
    particles: { type: 'none', density: 0 },
    ambient: { warmth: 0.7, brightness: 0.75 },
  },
  {
    id: 'calm',
    label: 'Calm',
    description: 'Gentle conditions — breathing is slow and deep',
    sky: { top: '#5a9aba', bottom: '#8abacc', sunOpacity: 0.7, sunY: 35 },
    clouds: { opacity: 0.15, count: 1, speed: 0.3, y: 35 },
    wind: { strength: 0.08, direction: 0 },
    water: { roughness: 0.1, color: '#5a9aba', height: 5 },
    threats: { visible: false, opacity: 0, type: 'lightning' },
    particles: { type: 'none', density: 0 },
    ambient: { warmth: 0.85, brightness: 0.9 },
  },
  {
    id: 'serene',
    label: 'Serene',
    description: 'Perfect stillness — sustained deep breathing',
    sky: { top: '#6aacda', bottom: '#aae0ff', sunOpacity: 0.9, sunY: 20 },
    clouds: { opacity: 0.05, count: 0, speed: 0.1, y: 40 },
    wind: { strength: 0.02, direction: 0 },
    water: { roughness: 0.03, color: '#6aacda', height: 2 },
    threats: { visible: false, opacity: 0, type: 'lightning' },
    particles: { type: 'none', density: 0 },
    ambient: { warmth: 1, brightness: 1 },
  },
];

// ── State machine ───────────────────────────────────────────────────

export interface BreathingState {
  currentWorldState: WorldState;
  transitionProgress: number; // 0-1 within current transition
  breathRate: number | null;
  quality: number; // 0-1
  secondsAtRate: number;
  stabilized: boolean;
}

export interface StateTransition {
  from: string;
  to: string;
  progress: number; // 0-1
}

const BPM_THRESHOLDS = [
  { bpm: 22, stateId: 'storm' },
  { bpm: 18, stateId: 'gale' },
  { bpm: 14, stateId: 'overcast' },
  { bpm: 10, stateId: 'clearing' },
  { bpm: 7, stateId: 'calm' },
  { bpm: 0, stateId: 'serene' },
];

const STABILIZATION_TIME_SEC = 5;
const TRANSITION_SPEED = 0.02; // per update tick (~500ms)
const MIN_QUALITY = 0.25;

function getTargetState(bpm: number): WorldState {
  for (const threshold of BPM_THRESHOLDS) {
    if (bpm >= threshold.bpm) {
      return WORLD_STATES.find((s) => s.id === threshold.stateId)!;
    }
  }
  return WORLD_STATES[WORLD_STATES.length - 1];
}

function lerpWorldState(a: WorldState, b: WorldState, t: number): WorldState {
  const lerp = (x: number, y: number) => x + (y - x) * t;
  const lerpColor = (c1: string, c2: string) => {
    // Simple hex lerp
    const h2r = (h: string) => {
      const v = parseInt(h.slice(1), 16);
      return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
    };
    const r1 = h2r(c1), r2 = h2r(c2);
    const r = Math.round(lerp(r1[0], r2[0]));
    const g = Math.round(lerp(r1[1], r2[1]));
    const bl = Math.round(lerp(r1[2], r2[2]));
    return `#${((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1)}`;
  };

  return {
    id: t < 0.5 ? a.id : b.id,
    label: t < 0.5 ? a.label : b.label,
    description: t < 0.5 ? a.description : b.description,
    sky: {
      top: lerpColor(a.sky.top, b.sky.top),
      bottom: lerpColor(a.sky.bottom, b.sky.bottom),
      sunOpacity: lerp(a.sky.sunOpacity, b.sky.sunOpacity),
      sunY: lerp(a.sky.sunY, b.sky.sunY),
    },
    clouds: {
      opacity: lerp(a.clouds.opacity, b.clouds.opacity),
      count: Math.round(lerp(a.clouds.count, b.clouds.count)),
      speed: lerp(a.clouds.speed, b.clouds.speed),
      y: lerp(a.clouds.y, b.clouds.y),
    },
    wind: {
      strength: lerp(a.wind.strength, b.wind.strength),
      direction: lerp(a.wind.direction, b.wind.direction),
    },
    water: {
      roughness: lerp(a.water.roughness, b.water.roughness),
      color: lerpColor(a.water.color, b.water.color),
      height: lerp(a.water.height, b.water.height),
    },
    threats: {
      visible: t < 0.5 ? a.threats.visible : b.threats.visible,
      opacity: lerp(a.threats.opacity, b.threats.opacity),
      type: t < 0.5 ? a.threats.type : b.threats.type,
    },
    particles: {
      type: t < 0.5 ? a.particles.type : b.particles.type,
      density: lerp(a.particles.density, b.particles.density),
    },
    ambient: {
      warmth: lerp(a.ambient.warmth, b.ambient.warmth),
      brightness: lerp(a.ambient.brightness, b.ambient.brightness),
    },
  };
}

export class BreathingStateMachine {
  private currentState: WorldState = WORLD_STATES[0];
  private targetState: WorldState = WORLD_STATES[0];
  private transitionProgress = 1;
  private breathRate: number | null = null;
  private quality = 0;
  private secondsAtRate = 0;
  private lastUpdate = Date.now();
  private onStateChange?: (state: WorldState) => void;
  private frozen = false; // quality gating

  constructor(onStateChange?: (state: WorldState) => void) {
    this.onStateChange = onStateChange;
  }

  /**
   * Update with new breathing data. Called at ~2Hz.
   */
  update(bpm: number | null, quality: number): WorldState {
    const now = Date.now();
    const dt = (now - this.lastUpdate) / 1000;
    this.lastUpdate = now;

    this.breathRate = bpm;
    this.quality = quality;

    // Quality gating: freeze if signal is poor
    if (quality < MIN_QUALITY) {
      this.frozen = true;
      return this.getCurrentInterpolated();
    }

    this.frozen = false;

    if (bpm === null) {
      // No data — gradually degrade toward storm
      this.secondsAtRate = 0;
      const fallback = WORLD_STATES[0]; // storm
      if (this.targetState.id !== fallback.id) {
        this.targetState = fallback;
        this.transitionProgress = 0;
      }
    } else {
      const newTarget = getTargetState(bpm);
      if (newTarget.id !== this.targetState.id) {
        this.targetState = newTarget;
        this.transitionProgress = 0;
        this.secondsAtRate = 0;
      } else {
        this.secondsAtRate += dt;
      }
    }

    // Advance transition
    if (this.transitionProgress < 1) {
      this.transitionProgress = Math.min(1, this.transitionProgress + TRANSITION_SPEED);
      if (this.transitionProgress >= 1) {
        this.currentState = this.targetState;
        this.onStateChange?.(this.currentState);
      }
    }

    return this.getCurrentInterpolated();
  }

  private getCurrentInterpolated(): WorldState {
    if (this.transitionProgress >= 1) return this.currentState;
    return lerpWorldState(this.currentState, this.targetState, this.transitionProgress);
  }

  getState(): WorldState {
    return this.getCurrentInterpolated();
  }

  isFrozen(): boolean {
    return this.frozen;
  }

  getBreathRate(): number | null {
    return this.breathRate;
  }

  getQuality(): number {
    return this.quality;
  }
}
