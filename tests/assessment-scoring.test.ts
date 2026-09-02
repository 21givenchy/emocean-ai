/**
 * Characterisation tests for the assessment scoring engine.
 *
 * These lock in the CURRENT, KNOWN-INVALID behaviour so that the rewrite has a
 * baseline to change deliberately rather than by accident. Each test names the
 * defect it pins and what the correct behaviour will be. When the decision rule
 * is replaced, these tests are expected to fail — that failure is the signal
 * the rewrite landed, and each assertion should be inverted at that point.
 *
 * Kept separate from the guard tests because these describe a defect, not a
 * rule we want to keep.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  FACTORS,
  generateProtocol,
  scoreAssessment,
  tokensToCSS,
  type TrialResult,
} from '../app/lib/assessment/engine.ts';

/** A session where every task is correct and every rating identical: a true tie. */
function perfectTiedSession(mode: 'quick' | 'deep' = 'quick'): TrialResult[] {
  return generateProtocol(mode).trials.map((t) => ({
    trialId: t.id,
    factorId: t.factorId,
    variantId: t.variantId,
    taskId: t.taskId,
    repeatIndex: t.repeatIndex,
    skipped: false,
    taskMetrics: {
      taskType: t.taskId,
      correct: true,
      responseTimeMs: 1000,
      details: {} as never,
    },
    selfReport: 3,
    timestamp: 0,
  }));
}

test('DEFECT: a perfect tie awards the first-registered variant of every factor', () => {
  const score = scoreAssessment(perfectTiedSession());
  const offenders: string[] = [];
  for (const f of score.factorScores) {
    const firstRegistered = FACTORS.find((x) => x.id === f.factorId)!.variants[0].id;
    if (f.bestVariantId === firstRegistered) offenders.push(f.factorId);
  }
  // Correct behaviour: zero offenders, and each factor reports "no clear
  // difference". Today: all six resolve to registration order.
  assert.equal(
    offenders.length,
    score.factorScores.length,
    'expected every tied factor to fall back to registration order',
  );
});

test('DEFECT: a winner is declared even when confidence is not estimable', () => {
  const score = scoreAssessment(perfectTiedSession());
  assert.equal(score.overallConfidence, null, 'overall confidence should be null here');
  for (const f of score.factorScores) {
    assert.equal(f.confidence, null, `${f.factorId} confidence should be null`);
    assert.ok(f.confidenceUnavailableReason, `${f.factorId} should carry a reason`);
    // Correct behaviour: bestVariantId is null / no_clear_difference.
    assert.ok(f.bestVariantId, `${f.factorId} still names a winner despite null confidence`);
  }
});

test('quick mode yields exactly one observation per variant', () => {
  const score = scoreAssessment(perfectTiedSession('quick'));
  for (const f of score.factorScores) {
    for (const [variantId, vs] of Object.entries(f.variantScores)) {
      assert.equal(vs.n, 1, `${variantId} should have n=1 in quick mode`);
    }
  }
});

test('DEFECT: stated preference alone can decide the winner', () => {
  // Identical task performance; preference favours the LAST variant of each
  // factor. Under a valid rule, performance is tied and preference must not
  // reorder it. Today the 50/50 blend lets preference pick the winner.
  const trials = generateProtocol('quick').trials;
  const results: TrialResult[] = trials.map((t) => {
    const factor = FACTORS.find((f) => f.id === t.factorId)!;
    const isLast = factor.variants[factor.variants.length - 1].id === t.variantId;
    return {
      trialId: t.id,
      factorId: t.factorId,
      variantId: t.variantId,
      taskId: t.taskId,
      repeatIndex: t.repeatIndex,
      skipped: false,
      taskMetrics: {
        taskType: t.taskId,
        correct: true,
        responseTimeMs: 1000,
        details: {} as never,
      },
      selfReport: isLast ? 5 : 1,
      timestamp: 0,
    };
  });
  const score = scoreAssessment(results);
  for (const f of score.factorScores) {
    const factor = FACTORS.find((x) => x.id === f.factorId)!;
    const last = factor.variants[factor.variants.length - 1].id;
    assert.equal(
      f.bestVariantId,
      last,
      `${f.factorId}: preference overrode tied performance (this is the defect)`,
    );
  }
});

test('DEFECT: response time is collected but never affects the score', () => {
  const base = perfectTiedSession();
  // Make one variant dramatically slower. A performance-based rule must react.
  const slowed = base.map((r) =>
    r.variantId === FACTORS[0].variants[0].id
      ? { ...r, taskMetrics: { ...r.taskMetrics!, responseTimeMs: 60_000 } }
      : r,
  );
  const a = scoreAssessment(base).factorScores[0].bestVariantId;
  const b = scoreAssessment(slowed).factorScores[0].bestVariantId;
  assert.equal(b, a, 'a 60x slower variant changed nothing — response time is ignored');
});

test('DEFECT: spacing and density variants write the same underlying token', () => {
  const spacing = FACTORS.find((f) => f.id === 'spacing')!;
  const density = FACTORS.find((f) => f.id === 'density')!;
  const base = {
    color: {} as never,
    typography: { scale: 'default', lineHeight: 'normal' },
    layout: { density: 'comfortable', radius: 'rounded' },
    motion: { level: 'full', durationMs: 200 },
  } as never;
  const tight = spacing.variants[0].apply(base) as { layout: { density: string } };
  const compact = density.variants[0].apply(base) as { layout: { density: string } };
  assert.equal(
    tight.layout.density,
    compact.layout.density,
    'spacing and density are meant to be distinct factors',
  );
});

test('DEFECT: exported CSS carries semantic labels, not usable CSS values', () => {
  const tokens = {
    color: {
      canvas: '#071318', surface: '#10242B', surfaceRaised: '#1a3038',
      textPrimary: '#F5F7F2', textSecondary: '#A9BAB8', border: '#333',
      accent: '#67E8D4', accentText: '#071318', incomingBubble: '#1a3038',
      incomingBubbleText: '#fff', outgoingBubble: '#67E8D4',
      outgoingBubbleText: '#071318', danger: '#f00', success: '#0f0',
      focusRing: '#67E8D4',
    },
    typography: { scale: 'default', lineHeight: 'normal' },
    layout: { density: 'comfortable', radius: 'rounded' },
    motion: { level: 'full', durationMs: 200 },
  } as never;
  const css = tokensToCSS(tokens);
  // A length-valued custom property must not be a bare English word.
  for (const [prop, bad] of [
    ['--font-scale', 'default'],
    ['--line-height', 'normal'],
    ['--density', 'comfortable'],
    ['--radius', 'rounded'],
    ['--motion-level', 'full'],
  ] as const) {
    assert.ok(
      css.includes(`${prop}: ${bad};`),
      `${prop} no longer emits the semantic label "${bad}" — update this test if the export was fixed`,
    );
  }
});

test('DEFECT: protocol order is not reproducible (unseeded RNG)', () => {
  const orders = new Set(
    Array.from({ length: 40 }, () => generateProtocol('quick').trials.map((t) => t.id).join('|')),
  );
  assert.ok(
    orders.size > 1,
    'protocol became deterministic — a seed was added, so invert this test',
  );
});

test('a skipped trial is excluded rather than counted as zero', () => {
  const results = perfectTiedSession().map((r, i) =>
    i === 0 ? { ...r, skipped: true, taskMetrics: null, selfReport: null } : r,
  );
  const score = scoreAssessment(results);
  const factorId = results[0].factorId;
  const f = score.factorScores.find((x) => x.factorId === factorId)!;
  assert.equal(f.variantScores[results[0].variantId].n, 0, 'skip must not contribute an observation');
});
