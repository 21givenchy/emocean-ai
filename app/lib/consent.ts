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

/**
 * Metadata attached to an exported session.
 *
 * Deliberately coarse. Earlier versions recorded `navigator.userAgent`, exact
 * screen resolution, IANA timezone and `navigator.language` — four fields that
 * together fingerprint a browser, in a file the copy described as
 * de-identified. Exports are the user's to share, so the honest default is to
 * carry only what is needed to interpret the session.
 *
 * `viewport` is bucketed rather than exact because reading-task results depend
 * on roughly how wide the column was, not on the pixel count.
 */
export interface SessionMetadata {
  /** Coarse viewport band at export time. */
  viewport: 'narrow' | 'medium' | 'wide';
  /** Relevant to interpreting motion and spacing results. */
  prefersReducedMotion: boolean;
  /** UTC. Carries no timezone offset. */
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
    return JSON.parse(stored) as ConsentRecord;
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

/**
 * Deletes the consent record outright.
 *
 * This product is local-only: no consent record, session or signal is uploaded,
 * and no server holds a copy. So "withdrawal means deletion" can be honoured
 * literally, by removing the record rather than tombstoning it with a
 * tombstone marker and keeping the participant id on disk.
 */
export function withdrawConsent(): void {
  localStorage.removeItem(CONSENT_KEY);
}

export function hasConsent(): boolean {
  return getConsent() !== null;
}

// ── Session export ──────────────────────────────────────────────────

function getMetadata(): SessionMetadata {
  const w = window.innerWidth;
  return {
    viewport: w < 640 ? 'narrow' : w < 1280 ? 'medium' : 'wide',
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
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

// ── Research telemetry ──────────────────────────────────────────────
//
// Intentionally absent. This build is local-only: there is no telemetry
// endpoint, no upload path and no server that could receive a session.
//
// A previous version of this module defined `TELEMETRY_ENDPOINT = '/api/telemetry'`
// with a commented-out `fetch`, plus enable/disable helpers. Nothing called the
// upload, but its presence made the privacy copy read as though an opt-in
// research pipeline existed. If a research backend is added later it needs
// authenticated consent records, a data inventory, retention and deletion
// paths, audit logging and a security review before any of this returns.
