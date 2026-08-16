import type {
  AdapterContext,
  AdapterRegistry,
  Capability,
  HubStatus,
  SensorAdapter,
  SensorSnapshot,
} from './types';
import { ALL_CAPABILITIES } from './types';

function emptyField<T>(reason: string): SensorSnapshot[keyof SensorSnapshot] {
  return {
    value: null,
    available: false,
    reason,
    source: 'none',
    timestamp: Date.now(),
  } as unknown as SensorSnapshot[keyof SensorSnapshot];
}

function emptySnapshot(): SensorSnapshot {
  const reason = 'not started';
  return ALL_CAPABILITIES.reduce((acc, cap) => {
    acc[cap] = emptyField(reason) as never;
    return acc;
  }, {} as SensorSnapshot);
}

export interface SensorHubOptions {
  video: HTMLVideoElement;
  /** Adapter instances available to the hub, in no particular order. */
  adapters: SensorAdapter[];
  /** Priority-ordered adapter ids per capability. First match wins. */
  registry: AdapterRegistry;
  onStatusChange?: (status: HubStatus) => void;
  onSnapshotChange?: (snapshot: SensorSnapshot) => void;
}

/**
 * Orchestrates a set of SensorAdapters behind one unified, typed snapshot.
 *
 * Responsibilities:
 *  - Initialize adapters (deduped — each adapter instance is init'd at most once).
 *  - For every capability, walk the registry's priority list and assign
 *    ownership to the first adapter that both initialized successfully and
 *    actually activated that capability.
 *  - Start only the adapters that ended up owning at least one capability.
 *  - Reject writes from an adapter for a capability it does not own.
 *  - Never fabricate a value: capabilities with no successful owner stay
 *    `{ available: false, value: null }`.
 */
export class SensorHub {
  private readonly video: HTMLVideoElement;
  private readonly adaptersById: Map<string, SensorAdapter>;
  private readonly registry: AdapterRegistry;
  private readonly onStatusChangeCb?: (status: HubStatus) => void;
  private readonly onSnapshotChangeCb?: (snapshot: SensorSnapshot) => void;

  private snapshot: SensorSnapshot = emptySnapshot();
  private owner: Partial<Record<Capability, string>> = {};
  private activeAdapterIds = new Set<string>();
  private initResults = new Map<string, { ok: boolean; activated: Capability[]; error?: string }>();
  private _status: HubStatus = 'idle';

  constructor(options: SensorHubOptions) {
    this.video = options.video;
    this.adaptersById = new Map(options.adapters.map((a) => [a.id, a]));
    this.registry = options.registry;
    this.onStatusChangeCb = options.onStatusChange;
    this.onSnapshotChangeCb = options.onSnapshotChange;
  }

  get status(): HubStatus {
    return this._status;
  }

  getSnapshot(): Readonly<SensorSnapshot> {
    return this.snapshot;
  }

  getActiveAdapterIds(): Readonly<Partial<Record<Capability, string>>> {
    return this.owner;
  }

  private setStatus(status: HubStatus) {
    this._status = status;
    this.onStatusChangeCb?.(status);
  }

  private makeContext(adapter: SensorAdapter): AdapterContext {
    return {
      video: this.video,
      getSnapshot: () => this.snapshot,
      onError: (message: string) => {
        // Non-fatal by default — surfaced only via console; capability
        // fields already reflect unavailability through report()/fallback.
        console.warn(`[SensorHub] ${adapter.id}: ${message}`);
      },
      report: (capability, value, meta) => {
        if (this.owner[capability] !== adapter.id) {
          // Adapter isn't the assigned owner for this capability (it may
          // have lost a fallback race, or be reporting a capability it
          // never actually got assigned) — ignore silently.
          return;
        }
        const available = meta?.available ?? value !== null;
        this.snapshot = {
          ...this.snapshot,
          [capability]: {
            value: available ? value : null,
            available,
            reason: available ? undefined : meta?.reason ?? 'unavailable',
            source: adapter.id,
            derived: meta?.derived,
            timestamp: Date.now(),
          },
        };
        this.onSnapshotChangeCb?.(this.snapshot);
      },
    };
  }

  private async initAdapterOnce(id: string): Promise<{ ok: boolean; activated: Capability[]; error?: string }> {
    const cached = this.initResults.get(id);
    if (cached) return cached;

    const adapter = this.adaptersById.get(id);
    if (!adapter) {
      const result = { ok: false, activated: [] as Capability[], error: `adapter "${id}" not registered` };
      this.initResults.set(id, result);
      return result;
    }

    try {
      const activated = await adapter.init(this.makeContext(adapter));
      const result = { ok: true, activated };
      this.initResults.set(id, result);
      return result;
    } catch (err) {
      const result = {
        ok: false,
        activated: [] as Capability[],
        error: err instanceof Error ? err.message : String(err),
      };
      this.initResults.set(id, result);
      console.warn(`[SensorHub] adapter "${id}" failed to init:`, result.error);
      return result;
    }
  }

  /**
   * Initialize adapters and assign per-capability ownership. Adapters are
   * only started once ownership is fully resolved, so a fallback adapter
   * never briefly runs alongside the primary one for the same capability.
   */
  async start(): Promise<void> {
    this.setStatus('initializing');
    this.owner = {};
    this.activeAdapterIds = new Set();

    for (const capability of ALL_CAPABILITIES) {
      const candidates = this.registry[capability] ?? [];
      let assigned = false;
      for (const adapterId of candidates) {
        const result = await this.initAdapterOnce(adapterId);
        if (result.ok && result.activated.includes(capability)) {
          this.owner[capability] = adapterId;
          this.activeAdapterIds.add(adapterId);
          assigned = true;
          break;
        }
      }
      if (!assigned) {
        this.snapshot = {
          ...this.snapshot,
          [capability]: emptyField('no adapter available'),
        };
      }
    }

    for (const id of this.activeAdapterIds) {
      this.adaptersById.get(id)?.start();
    }

    this.onSnapshotChangeCb?.(this.snapshot);
    this.setStatus('running');
  }

  pause(): void {
    for (const id of this.activeAdapterIds) {
      this.adaptersById.get(id)?.stop();
    }
    this.setStatus('paused');
  }

  resume(): void {
    for (const id of this.activeAdapterIds) {
      this.adaptersById.get(id)?.start();
    }
    this.setStatus('running');
  }

  stop(): void {
    for (const id of this.activeAdapterIds) {
      this.adaptersById.get(id)?.stop();
    }
    this.setStatus('stopped');
  }

  destroy(): void {
    for (const adapter of this.adaptersById.values()) {
      try {
        adapter.destroy();
      } catch (err) {
        console.warn(`[SensorHub] adapter "${adapter.id}" failed to destroy:`, err);
      }
    }
    this.activeAdapterIds.clear();
    this.initResults.clear();
    this.owner = {};
    this.snapshot = emptySnapshot();
    this.setStatus('idle');
  }
}
