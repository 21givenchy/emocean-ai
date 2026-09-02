/**
 * Render tests for the chat-thread assessment UI.
 *
 * These exist because the session route cannot be verified over HTTP: it calls
 * `useSearchParams`, which forces Next's Suspense fallback during SSR, so a
 * request only ever returns "Loading session…". Static rendering is the
 * cheapest way to assert that the variant under test actually reaches the
 * pixels — which was the original defect: `getTypographyStyles` was applied to
 * exactly one element (the passage body) while headings, buttons and nav
 * stayed at fixed sizes, so the factor under test was nearly invisible.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { applyVariant } from '../app/lib/assessment/engine.ts';
import { defaultTokens } from '../app/lib/designTokens.ts';
import { READING_PASSAGES } from '../app/lib/assessment/tasks.ts';
import { loadTsx } from './helpers/renderComponent.ts';

const passage = READING_PASSAGES[0];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Provider: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let TrialBubbleExchange: any;

test('bundle the component tree', async () => {
  // One entry, so provider and consumer share a single context instance.
  const mod = await loadTsx('tests/helpers/assessmentEntry.ts');
  Provider = mod.VisualTokensProvider;
  TrialBubbleExchange = mod.TrialBubbleExchange;
  assert.equal(typeof Provider, 'function');
  assert.equal(typeof TrialBubbleExchange, 'function');
});

function renderTrial(variantId: string): string {
  const tokens = applyVariant(defaultTokens.focus, variantId);
  return renderToStaticMarkup(
    React.createElement(
      Provider,
      { tokens },
      React.createElement(TrialBubbleExchange, {
        passage,
        trialKey: 't1',
        onComplete: () => {},
        onSkip: () => {},
      }),
    ),
  );
}

test('the passage and its question both render as bubbles', () => {
  const html = renderTrial('type-default');
  assert.ok(html.includes(passage.title), 'passage title should render');
  assert.ok(html.includes(passage.question), 'question should render');
  // The asymmetric corner is what distinguishes an incoming bubble.
  assert.ok(html.includes('18px 18px 18px 4px'), 'incoming bubble shape should render');
});

test('every answer renders as a tappable chip', () => {
  const html = renderTrial('type-default');
  for (const answer of passage.answers) {
    assert.ok(html.includes(answer), `answer "${answer}" should render`);
  }
  const buttonCount = (html.match(/<button/g) ?? []).length;
  // One chip per answer, plus the skip control.
  assert.equal(buttonCount, passage.answers.length + 1);
});

test('touch targets meet the 44px minimum', () => {
  assert.ok(renderTrial('type-default').includes('min-height:44px'));
});

test('typography variants change the rendered font size', () => {
  const sizes = ['type-compact', 'type-default', 'type-large'].map((v) => {
    const m = renderTrial(v).match(/font-size:(\d+)px/);
    return m ? m[1] : null;
  });
  assert.deepEqual(sizes, ['14', '16', '18'], 'each variant should emit a distinct size');
});

test('typography reaches the reply chips, not just the passage', () => {
  // Guards the original defect directly: if the chips are styled from the same
  // tokens, the large variant emits 18px on the bubbles *and* on every chip.
  const occurrences = (renderTrial('type-large').match(/font-size:18px/g) ?? []).length;
  assert.ok(
    occurrences > 2,
    `expected 18px on bubbles and chips, saw ${occurrences} occurrence(s)`,
  );
});

test('contrast variants change the bubble colour, not only the backdrop', () => {
  const bubble = (v: string) => applyVariant(defaultTokens.focus, v).color.incomingBubble;
  assert.notEqual(bubble('contrast-high'), bubble('contrast-medium'));
  assert.notEqual(bubble('contrast-medium'), bubble('contrast-low'));
  // And the value must actually reach the markup.
  assert.ok(renderTrial('contrast-high').toLowerCase().includes('#1c1c1c'));
});

test('spacing variants change bubble and chip padding', () => {
  const padding = (v: string) => [...(renderTrial(v).match(/padding:[^;"]+/g) ?? [])];
  const tight = padding('space-tight');
  const comfortable = padding('space-comfortable');
  assert.notDeepEqual(tight, comfortable, 'density should change rendered padding');
  assert.ok(tight.some((p) => p.includes('8px 12px')), 'tight should use compact padding');
  assert.ok(
    comfortable.some((p) => p.includes('12px 16px')),
    'comfortable should use roomier padding',
  );
});

test('the feeling check does not preempt the task answer', () => {
  // Preference is a separate, deliberate tap — never inferred from the answer
  // and never shown alongside it.
  const html = renderTrial('type-default');
  assert.ok(!html.includes('How did that feel'), 'feeling prompt should not render yet');
  assert.ok(!html.includes('Easy to read'), 'feeling chips should not render yet');
});
