/**
 * Consent and session export for research participation.
 *
 * All data stays on-device unless the user explicitly opts in to research.
 * Consent is stored in localStorage and can be revoked at any time.
 */

// ── Types ───────────────────────────────────────────────────────────

export interface ConsentRecord {
  version: string;
  grantedAt: number;
  scope: 'assessment' | 'breathing' | 'both';
  participantId: string; // random, not linked to identity
  withdrawnAt?: number;
}

export interface SessionExport {
  exportVersion: string;
  exportedAt: string;
  sessionId: string;
  participantId: string;
  experimentType: 'assessment' | 'breathing';
  experimentMode: string;
  protocol: Record<string, unknown>;
  trials?: TrialExport[];
  breathing?: BreathingExport;
  selfReport?: SelfReportExport[];
  vitals?: VitalsExport;
  metadata: SessionMetadata;
}

export interface TrialExport {
  trialId: string;
  factorId: string;
  variantId: string;
  taskId: string;
  repeatIndex: number;
  skipped: boolean;
  taskMetrics: Record<string, unknown> | null;
  selfReport: number | null;
  timestamp: number;
}

export interface BreathingExport {
  inputMode: 'camera' | 'guided';
  duration: number;
  statesVisited: string[];
  peakBreathRate: number | null;
  finalBreathRate: number | null;
  averageQuality: number;
  samples?: BreathingSample[];
}

export interface BreathingSample {
  timestamp: number;
  breathRate: number | null;
  quality: number;
  worldState: string;
}

export interface SelfReportExport {
  timestamp: number;
  context: string;
  rating: number;
  label?: string;
}

export interface VitalsExport {
  heartRate: number[];
  breathRate: number[];
  prv: { rmssd: number; sdnn: number }[];
  signalQuality: number[];
  timestamps: number[];
}

export interface SessionMetadata {
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  timestamp: string;
  version: string;
}

// ── Constants ───────────────────────────────────────────────────────

const CONSENT_KEY = 'emocean-consent';
const CONSENT_VERSION = '1.0.0';
const EXPORT_VERSION = '1.0.0';

// ── Consent management ──────────────────────────────────────────────

function generateParticipantId(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function getConsent(): ConsentRecord | null {
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) return null;
    const record: ConsentRecord = JSON.parse(stored);
    if (record.withdrawnAt) return null;
    return record;
  } catch {
    return null;
  }
}

export function grantConsent(scope: 'assessment' | 'breathing' | 'both'): ConsentRecord {
  const existing = getConsent();
  if (existing) return existing;

  const record: ConsentRecord = {
    version: CONSENT_VERSION,
    grantedAt: Date.now(),
    scope,
    participantId: generateParticipantId(),
  };

  localStorage.setItem(CONSENT_KEY, JSON.stringify(record));
  return record;
}

export function withdrawConsent(): void {
  const stored = localStorage.getItem(CONSENT_KEY);
  if (!stored) return;

  try {
    const record: ConsentRecord = JSON.parse(stored);
    record.withdrawnAt = Date.now();
    localStorage.setItem(CONSENT_KEY, JSON.stringify(record));
  } catch {
    localStorage.removeItem(CONSENT_KEY);
  }
}

export function hasConsent(): boolean {
  return getConsent() !== null;
}

// ── Session export ──────────────────────────────────────────────────

function getMetadata(): SessionMetadata {
  return {
    userAgent: navigator.userAgent,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    timestamp: new Date().toISOString(),
    version: EXPORT_VERSION,
  };
}

export function exportAssessmentSession(sessionData: {
  sessionId: string;
  mode: string;
  assessmentMode: string;
  results: Array<{
    trialId: string;
    factorId: string;
    variantId: string;
    taskId: string;
    repeatIndex: number;
    skipped: boolean;
    taskMetrics: Record<string, unknown> | null;
    selfReport: number | null;
    timestamp: number;
  }>;
  score: Record<string, unknown>;
  tokens: Record<string, unknown>;
}): SessionExport {
  const consent = getConsent();

  return {
    exportVersion: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    sessionId: sessionData.sessionId,
    participantId: consent?.participantId || 'anonymous',
    experimentType: 'assessment',
    experimentMode: sessionData.assessmentMode,
    protocol: {
      mode: sessionData.mode,
      assessmentMode: sessionData.assessmentMode,
      score: sessionData.score,
    },
    trials: sessionData.results.map((r) => ({
      trialId: r.trialId,
      factorId: r.factorId,
      variantId: r.variantId,
      taskId: r.taskId,
      repeatIndex: r.repeatIndex,
      skipped: r.skipped,
      taskMetrics: r.taskMetrics,
      selfReport: r.selfReport,
      timestamp: r.timestamp,
    })),
    metadata: getMetadata(),
  };
}

export function exportBreathingSession(sessionData: {
  sessionId: string;
  inputMode: 'camera' | 'guided';
  duration: number;
  statesVisited: string[];
  peakBreathRate: number | null;
  finalBreathRate: number | null;
  averageQuality: number;
  samples?: BreathingSample[];
}): SessionExport {
  const consent = getConsent();

  return {
    exportVersion: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    sessionId: sessionData.sessionId,
    participantId: consent?.participantId || 'anonymous',
    experimentType: 'breathing',
    experimentMode: sessionData.inputMode,
    protocol: {
      inputMode: sessionData.inputMode,
    },
    breathing: {
      inputMode: sessionData.inputMode,
      duration: sessionData.duration,
      statesVisited: sessionData.statesVisited,
      peakBreathRate: sessionData.peakBreathRate,
      finalBreathRate: sessionData.finalBreathRate,
      averageQuality: sessionData.averageQuality,
      samples: sessionData.samples,
    },
    metadata: getMetadata(),
  };
}

export function downloadExport(data: SessionExport, filename?: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `emocean-${data.experimentType}-${data.sessionId}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Research telemetry (opt-in only) ────────────────────────────────

const TELEMETRY_KEY = 'emocean-telemetry';
const TELEMETRY_ENDPOINT = '/api/telemetry'; // placeholder

export interface TelemetryEvent {
  type: 'session_complete' | 'consent_granted' | 'consent_withdrawn' | 'export_downloaded';
  participantId: string;
  timestamp: number;
  data: Record<string, unknown>;
}

export function isTelemetryEnabled(): boolean {
  try {
    return localStorage.getItem(TELEMETRY_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setTelemetryEnabled(enabled: boolean): void {
  localStorage.setItem(TELEMETRY_KEY, enabled ? 'true' : 'false');
}

export async function sendTelemetry(event: TelemetryEvent): Promise<void> {
  if (!isTelemetryEnabled()) return;

  try {
    // In production, this would POST to the telemetry endpoint
    // For now, log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Telemetry]', event);
    }
    // await fetch(TELEMETRY_ENDPOINT, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(event),
    // });
  } catch {
    // Telemetry failures are silently ignored — never block the user
  }
}
