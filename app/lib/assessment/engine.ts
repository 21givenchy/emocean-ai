import type { VisualTokens } from '../designTokens';

// ── Factor definitions ──────────────────────────────────────────────

export type FactorType = 'typography' | 'spacing' | 'density' | 'contrast' | 'color' | 'motion';

export interface FactorVariant {
  id: string;
  label: string;
  description: string;
  apply: (base: VisualTokens) => VisualTokens;
}

export interface Factor {
  id: FactorType;
  label: string;
  description: string;
  task: 'reading' | 'search' | 'chat';
  variants: FactorVariant[];
}

// ── Factor registry ─────────────────────────────────────────────────

export const FACTORS: Factor[] = [
  {
    id: 'typography',
    label: 'Typography',
    description: 'Font size and line height',
    task: 'reading',
    variants: [
      {
        id: 'type-compact',
        label: 'Compact',
        description: 'Smaller text, tighter lines',
        apply: (t) => ({ ...t, typography: { scale: 'compact', lineHeight: 'normal' } }),
      },
      {
        id: 'type-default',
        label: 'Default',
        description: 'Standard size and spacing',
        apply: (t) => ({ ...t, typography: { scale: 'default', lineHeight: 'normal' } }),
      },
      {
        id: 'type-large',
        label: 'Large',
        description: 'Bigger text, more breathing room',
        apply: (t) => ({ ...t, typography: { scale: 'large', lineHeight: 'relaxed' } }),
      },
    ],
  },
  {
    id: 'spacing',
    label: 'Spacing',
    description: 'Padding and margins',
    task: 'chat',
    variants: [
      {
        id: 'space-tight',
        label: 'Tight',
        description: 'Less padding, denser layout',
        apply: (t) => ({ ...t, layout: { ...t.layout, density: 'compact' } }),
      },
      {
        id: 'space-comfortable',
        label: 'Comfortable',
        description: 'Standard padding',
        apply: (t) => ({ ...t, layout: { ...t.layout, density: 'comfortable' } }),
      },
    ],
  },
  {
    id: 'density',
    label: 'Density',
    description: 'How much content fits on screen',
    task: 'search',
    variants: [
      {
        id: 'density-compact',
        label: 'Compact',
        description: 'More items visible at once',
        apply: (t) => ({ ...t, layout: { ...t.layout, density: 'compact' } }),
      },
      {
        id: 'density-comfortable',
        label: 'Comfortable',
        description: 'Standard item sizing',
        apply: (t) => ({ ...t, layout: { ...t.layout, density: 'comfortable' } }),
      },
    ],
  },
  {
    id: 'contrast',
    label: 'Contrast',
    description: 'Text and background contrast ratio',
    task: 'reading',
    variants: [
      {
        id: 'contrast-high',
        label: 'High contrast',
        description: 'Sharp, crisp text',
        apply: (t) => ({
          ...t,
          color: {
            ...t.color,
            textPrimary: '#FFFFFF',
            textSecondary: '#D1D5DB',
            canvas: '#000000',
            surface: '#111111',
          },
        }),
      },
      {
        id: 'contrast-medium',
        label: 'Medium contrast',
        description: 'Balanced readability',
        apply: (t) => ({
          ...t,
          color: {
            ...t.color,
            textPrimary: '#F5F7F2',
            textSecondary: '#A9BAB8',
            canvas: '#071318',
            surface: '#10242B',
          },
        }),
      },
      {
        id: 'contrast-low',
        label: 'Low contrast',
        description: 'Softer, less harsh',
        apply: (t) => ({
          ...t,
          color: {
            ...t.color,
            textPrimary: '#C8CCC8',
            textSecondary: '#8A9A98',
            canvas: '#0A1A22',
            surface: '#122630',
          },
        }),
      },
    ],
  },
  {
    id: 'color',
    label: 'Accent color',
    description: 'The highlight color for active elements',
    task: 'chat',
    variants: [
      {
        id: 'color-cyan',
        label: 'Cyan',
        description: 'Cool bio-cyan',
        apply: (t) => ({ ...t, color: { ...t.color, accent: '#67E8D4', outgoingBubble: '#67E8D4' } }),
      },
      {
        id: 'color-green',
        label: 'Sea glass',
        description: 'Natural green',
        apply: (t) => ({ ...t, color: { ...t.color, accent: '#7DD3B0', outgoingBubble: '#7DD3B0' } }),
      },
      {
        id: 'color-amber',
        label: 'Dawn amber',
        description: 'Warm amber',
        apply: (t) => ({ ...t, color: { ...t.color, accent: '#F4B86A', outgoingBubble: '#F4B86A' } }),
      },
      {
        id: 'color-blue',
        label: 'Ocean blue',
        description: 'Deep blue',
        apply: (t) => ({ ...t, color: { ...t.color, accent: '#0EA5E9', outgoingBubble: '#0EA5E9' } }),
      },
    ],
  },
  {
    id: 'motion',
    label: 'Motion',
    description: 'Animation and transition speed',
    task: 'search',
    variants: [
      {
        id: 'motion-full',
        label: 'Full motion',
        description: 'Smooth transitions',
        apply: (t) => ({ ...t, motion: { level: 'full', durationMs: 200 } }),
      },
      {
        id: 'motion-reduced',
        label: 'Reduced motion',
        description: 'Faster, subtler transitions',
        apply: (t) => ({ ...t, motion: { level: 'reduced', durationMs: 100 } }),
      },
      {
        id: 'motion-none',
        label: 'No motion',
        description: 'Instant changes',
        apply: (t) => ({ ...t, motion: { level: 'none', durationMs: 0 } }),
      },
    ],
  },
];

// ── Protocol types ──────────────────────────────────────────────────

export type AssessmentMode = 'quick' | 'deep';

export interface Trial {
  id: string;
  factorId: FactorType;
  variantId: string;
  variantIndex: number;
  taskId: 'reading' | 'search' | 'chat';
  repeatIndex: number;
}

export interface Protocol {
  mode: AssessmentMode;
  trials: Trial[];
  factorOrder: FactorType[];
  seed: number;
}

export interface TrialResult {
  trialId: string;
  factorId: FactorType;
  variantId: string;
  taskId: 'reading' | 'search' | 'chat';
  repeatIndex: number;
  skipped: boolean;
  taskMetrics: TaskMetrics | null;
  selfReport: number | null;
  timestamp: number;
}

export interface TaskMetrics {
  taskType: 'reading' | 'search' | 'chat';
  correct: boolean;
  responseTimeMs: number;
  details: ReadingMetrics | SearchMetrics | ChatMetrics;
}

export interface ReadingMetrics {
  passageId: string;
  questionId: string;
  selectedAnswer: number;
  correctAnswer: number;
}

export interface SearchMetrics {
  targetFound: boolean;
  searchTimeMs: number;
  distractorsScanned: number;
}

export interface ChatMetrics {
  replyLength: number;
  sentimentScore: number;
  responseTimeMs: number;
}

// ── Protocol generator ──────────────────────────────────────────────

// Seeded PRNG for reproducible protocol order. Seed is stored in result
// payload, allowing replays of the same assessment order on demand.
function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleArray<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateProtocol(mode: AssessmentMode, seed?: number): Protocol {
  // Generate a random seed if not provided, store it so the assessment is
  // reproducible if the user exports their results.
  const actualSeed = seed ?? Math.floor(Math.random() * 2147483647);
  const rng = mulberry32(actualSeed);

  const quickFactorIds: FactorType[] = ['typography', 'spacing', 'contrast'];
  const modesFactors = mode === 'quick' ? quickFactorIds : FACTORS.map((f) => f.id);
  const factorOrder = shuffleArray(
    modesFactors.filter((id) => FACTORS.find((f) => f.id === id)),
    rng,
  );
  const trials: Trial[] = [];

  const repeats = mode === 'quick' ? 1 : 2;

  factorOrder.forEach((factorId) => {
    const factor = FACTORS.find((f) => f.id === factorId)!;
    for (let r = 0; r < repeats; r++) {
      const variantOrder = shuffleArray(
        factor.variants.map((v) => v.id),
        rng,
      );
      variantOrder.forEach((variantId, variantIndex) => {
        trials.push({
          id: `${factorId}-${variantId}-r${r}`,
          factorId,
          variantId,
          variantIndex,
          taskId: factor.task,
          repeatIndex: r,
        });
      });
    }
  });

  return { mode, trials, factorOrder, seed: actualSeed };
}

// ── Token application ───────────────────────────────────────────────

export function applyVariant(base: VisualTokens, variantId: string): VisualTokens {
  for (const factor of FACTORS) {
    const variant = factor.variants.find((v) => v.id === variantId);
    if (variant) return variant.apply(base);
  }
  return base;
}

export function getVariantLabel(variantId: string): string {
  for (const factor of FACTORS) {
    const variant = factor.variants.find((v) => v.id === variantId);
    if (variant) return variant.label;
  }
  return variantId;
}

export function getFactorForVariant(variantId: string): Factor | undefined {
  return FACTORS.find((f) => f.variants.some((v) => v.id === variantId));
}

// ── Typography scaling helpers ──────────────────────────────────────

export function getTypographyStyles(tokens: VisualTokens): React.CSSProperties {
  const scaleMap: Record<string, { fontSize: string; lineHeight: string }> = {
    compact: { fontSize: '14px', lineHeight: '1.4' },
    default: { fontSize: '16px', lineHeight: '1.5' },
    large: { fontSize: '18px', lineHeight: '1.6' },
  };
  return scaleMap[tokens.typography.scale] || scaleMap.default;
}

export function getDensityStyles(tokens: VisualTokens): React.CSSProperties {
  return tokens.layout.density === 'compact'
    ? { gap: '8px', padding: '8px' }
    : { gap: '12px', padding: '12px' };
}

// ── Scoring engine ──────────────────────────────────────────────────

export interface FactorScore {
  factorId: FactorType;
  variantScores: Record<string, { taskAvg: number; selfReportAvg: number; n: number }>;
  bestVariantId: string;
  /**
   * `null` means "not estimable from this session's data" — e.g. a single trial
   * per variant, which cannot support an effect size. Consumers must render the
   * absence, not coerce it to 0%.
   */
  confidence: number | null;
  /** Why confidence is null, for display. `null` when confidence is available. */
  confidenceUnavailableReason: string | null;
}

export interface AssessmentScore {
  factorScores: FactorScore[];
  /** `null` when no factor produced an estimable confidence. */
  overallConfidence: number | null;
  recommendation: Partial<Record<FactorType, string>>;
}

function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function stdDev(arr: number[]): number {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - 1));
}

/**
 * Pooled-variance Cohen's d.
 *
 * Returns `null` when the effect size is not defined for the data given, rather
 * than a number that looks like a measurement but is not one. Two cases matter:
 *
 *  - degrees of freedom <= 0. With one observation per group (quick mode) the
 *    pooled-variance denominator is `n1 + n2 - 2 === 0`, so the expression is
 *    0/0 -> NaN. NaN then propagates through `Math.min(1, NaN / 1.2)` and is
 *    rendered as "NaN%". There is no within-group variance to pool from a single
 *    observation, so the honest answer is "undefined", not "zero".
 *  - zero pooled spread. Both groups constant; the standardised difference is
 *    undefined regardless of how far apart the means are.
 */
function cohenD(a: number[], b: number[]): number | null {
  if (a.length === 0 || b.length === 0) return null;

  const df = a.length + b.length - 2;
  if (df <= 0) return null;

  const mA = mean(a);
  const mB = mean(b);
  const pooledStd = Math.sqrt(
    ((a.length - 1) * stdDev(a) ** 2 + (b.length - 1) * stdDev(b) ** 2) / df
  );
  if (!Number.isFinite(pooledStd) || pooledStd === 0) return null;

  const d = (mA - mB) / pooledStd;
  return Number.isFinite(d) ? d : null;
}

export function scoreAssessment(results: TrialResult[]): AssessmentScore {
  const factorScores: FactorScore[] = [];
  const recommendation: Partial<Record<FactorType, string>> = {};

  for (const factor of FACTORS) {
    const factorResults = results.filter((r) => r.factorId === factor.id && !r.skipped);
    if (factorResults.length === 0) continue;

    const variantScores: Record<string, { taskAvg: number; selfReportAvg: number; n: number }> = {};

    for (const variant of factor.variants) {
      const vResults = factorResults.filter((r) => r.variantId === variant.id);
      const taskScores = vResults
        .filter((r) => r.taskMetrics)
        .map((r) => (r.taskMetrics!.correct ? 1 : 0));
      const selfReports = vResults
        .filter((r) => r.selfReport !== null)
        .map((r) => r.selfReport!);

      variantScores[variant.id] = {
        taskAvg: mean(taskScores),
        selfReportAvg: mean(selfReports),
        n: vResults.length,
      };
    }

    // Find best variant by combined score (task + self-report, normalized to 0-1)
    let bestId = factor.variants[0].id;
    let bestScore = -Infinity;

    for (const variant of factor.variants) {
      const vs = variantScores[variant.id];
      // Self-report is 1-5, normalize to 0-1
      const normalizedSelfReport = (vs.selfReportAvg - 1) / 4;
      const combined = vs.taskAvg * 0.5 + normalizedSelfReport * 0.5;
      if (combined > bestScore) {
        bestScore = combined;
        bestId = variant.id;
      }
    }

    // Confidence from effect size between the two most-tested variant groups.
    // Deliberately reports "not estimable" rather than a low-looking number when
    // the session cannot support the statistic — a single trial per variant has
    // no within-group variance, so there is nothing to be confident about.
    let confidence: number | null = null;
    let confidenceUnavailableReason: string | null =
      'Not enough trials for this factor to estimate confidence.';

    const uniqueVariants = [...new Set(factorResults.map((r) => r.variantId))];
    if (uniqueVariants.length < 2) {
      confidenceUnavailableReason =
        'Only one variant of this factor was completed, so there is nothing to compare it against.';
    } else {
      const groups = uniqueVariants.map((vid) =>
        factorResults
          .filter((r) => r.variantId === vid)
          .map((r) => (r.taskMetrics?.correct ? 1 : 0))
      );
      // Compare the two best-sampled groups; effect size needs spread, not just presence.
      const rankedGroups = [...groups].sort((x, y) => y.length - x.length);
      const [groupA, groupB] = rankedGroups;

      if (groupA.length + groupB.length - 2 <= 0) {
        confidenceUnavailableReason =
          'This factor was measured once per option. A single trial per option cannot support a confidence estimate — run a Deep assessment for repeated trials.';
      } else {
        const rawD = cohenD(groupA, groupB);
        if (rawD === null) {
          confidenceUnavailableReason =
            'Task outcomes for this factor were identical across trials, so the difference between options cannot be quantified.';
        } else {
          // Map effect size to confidence: d < 0.2 = low, 0.2-0.8 = medium, > 0.8 = high
          confidence = Math.min(1, Math.abs(rawD) / 1.2);
          confidenceUnavailableReason = null;

          // Boost slightly when the factor was measured across repeated passes.
          const repeatCount = new Set(factorResults.map((r) => r.repeatIndex)).size;
          if (repeatCount >= 2) confidence = Math.min(1, confidence + 0.15);
        }
      }
    }

    factorScores.push({
      factorId: factor.id,
      variantScores,
      bestVariantId: bestId,
      confidence,
      confidenceUnavailableReason,
    });

    recommendation[factor.id] = bestId;
  }

  // Average only over factors that actually produced an estimate. Treating a
  // non-estimable factor as 0 would silently drag the headline number down and
  // present "we could not measure this" as "we measured this and it was poor".
  const estimableConfidences = factorScores
    .map((f) => f.confidence)
    .filter((c): c is number => c !== null);

  const overallConfidence =
    estimableConfidences.length > 0 ? mean(estimableConfidences) : null;

  return { factorScores, overallConfidence, recommendation };
}

// ── CSS export ──────────────────────────────────────────────────────

export function tokensToCSS(tokens: VisualTokens): string {
  return `:root {
  --canvas: ${tokens.color.canvas};
  --surface: ${tokens.color.surface};
  --surface-raised: ${tokens.color.surfaceRaised};
  --text-primary: ${tokens.color.textPrimary};
  --text-secondary: ${tokens.color.textSecondary};
  --border: ${tokens.color.border};
  --accent: ${tokens.color.accent};
  --accent-text: ${tokens.color.accentText};
  --incoming-bubble: ${tokens.color.incomingBubble};
  --incoming-bubble-text: ${tokens.color.incomingBubbleText};
  --outgoing-bubble: ${tokens.color.outgoingBubble};
  --outgoing-bubble-text: ${tokens.color.outgoingBubbleText};
  --danger: ${tokens.color.danger};
  --success: ${tokens.color.success};
  --focus-ring: ${tokens.color.focusRing};
  --font-scale: ${tokens.typography.scale};
  --line-height: ${tokens.typography.lineHeight};
  --density: ${tokens.layout.density};
  --radius: ${tokens.layout.radius};
  --motion-level: ${tokens.motion.level};
  --motion-duration: ${tokens.motion.durationMs}ms;
}`;
}

export function tokensToJSON(tokens: VisualTokens, version: string): string {
  return JSON.stringify(
    {
      version,
      exportedAt: new Date().toISOString(),
      tokens,
    },
    null,
    2
  );
}
