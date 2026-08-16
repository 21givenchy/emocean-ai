import { VisualTokens, defaultTokens, VisualMode } from '../designTokens';

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

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateProtocol(mode: AssessmentMode): Protocol {
  const factorOrder = shuffleArray(FACTORS.map((f) => f.id));
  const trials: Trial[] = [];

  const repeats = mode === 'quick' ? 1 : 2;

  factorOrder.forEach((factorId) => {
    const factor = FACTORS.find((f) => f.id === factorId)!;
    for (let r = 0; r < repeats; r++) {
      const variantOrder = shuffleArray(factor.variants.map((v) => v.id));
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

  return { mode, trials, factorOrder };
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
  confidence: number;
}

export interface AssessmentScore {
  factorScores: FactorScore[];
  overallConfidence: number;
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

function cohenD(a: number[], b: number[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const mA = mean(a);
  const mB = mean(b);
  const pooledStd = Math.sqrt(
    ((a.length - 1) * stdDev(a) ** 2 + (b.length - 1) * stdDev(b) ** 2) /
      (a.length + b.length - 2)
  );
  if (pooledStd === 0) return 0;
  return (mA - mB) / pooledStd;
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

    // Confidence from repeat consistency
    let confidence = 0;
    if (factorResults.length >= 2) {
      const uniqueVariants = [...new Set(factorResults.map((r) => r.variantId))];
      if (uniqueVariants.length >= 2) {
        const groups = uniqueVariants.map((vid) =>
          factorResults
            .filter((r) => r.variantId === vid)
            .map((r) => (r.taskMetrics?.correct ? 1 : 0))
        );
        const validGroups = groups.filter((g) => g.length >= 1);
        if (validGroups.length >= 2) {
          const d = Math.abs(cohenD(validGroups[0], validGroups[1]));
          // Map effect size to confidence: d < 0.2 = low, 0.2-0.8 = medium, > 0.8 = high
          confidence = Math.min(1, d / 1.2);
        }
      }
      // Boost confidence if we have repeats
      const repeatCount = new Set(factorResults.map((r) => r.repeatIndex)).size;
      if (repeatCount >= 2) confidence = Math.min(1, confidence + 0.15);
    }

    factorScores.push({
      factorId: factor.id,
      variantScores,
      bestVariantId: bestId,
      confidence,
    });

    recommendation[factor.id] = bestId;
  }

  const overallConfidence =
    factorScores.length > 0
      ? mean(factorScores.map((f) => f.confidence))
      : 0;

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
