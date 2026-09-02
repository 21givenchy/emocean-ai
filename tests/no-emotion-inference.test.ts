/**
 * Regression guard for the emotion-inference removal.
 *
 * `/lab/sensors` shipped a display of eleven affective labels with a confidence
 * figure synthesised as `min(98, 55 + score * 40)` and a `calm` score seeded to
 * 0.28 before the camera started. The capability was removed from the sensor
 * registry, both adapters, the snapshot type and the public sandbox samples.
 *
 * These tests exist because that removal is only worth anything if it stays
 * removed. They assert on source text as well as exported values, because the
 * risk is a well-meaning reinstatement, not a type error.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { ALL_CAPABILITIES } from '../app/lib/sensors/types.ts';

test('facialExpression is not a declared capability', () => {
  assert.ok(
    !(ALL_CAPABILITIES as string[]).includes('facialExpression'),
    'facialExpression is back in ALL_CAPABILITIES — there is no validated estimator behind it',
  );
});

test('no source file outside vendor references facialExpression', () => {
  const files = [
    'app/lib/sensors/types.ts',
    'app/lib/sensors/index.ts',
    'app/lib/sensors/adapters/vitalCameraAdapter.ts',
    'app/lib/sensors/adapters/mediapipeFallbackAdapter.ts',
    'app/lib/sensors/adapters/simulationAdapter.ts',
    'app/components/CameraFeed.tsx',
    'app/sandbox/page.tsx',
  ];
  for (const f of files) {
    const src = readFileSync(f, 'utf8');
    // The CameraFeed docblock names the removed feature deliberately, to stop
    // it being reintroduced. Only executable references are a problem.
    const offending = src
      .split('\n')
      .filter((l) => l.includes('facialExpression'))
      .filter((l) => !l.trimStart().startsWith('*') && !l.trimStart().startsWith('//'));
    assert.deepEqual(offending, [], `${f} references facialExpression in code`);
  }
});

test('the vitalcamera adapter does not enable SDK emotion inference', () => {
  const src = readFileSync('app/lib/sensors/adapters/vitalCameraAdapter.ts', 'utf8');
  assert.match(
    src,
    /const emotionEnabled = false;/,
    'emotionEnabled must be a hard-coded false, not a mutable flag',
  );
  assert.ok(
    !/vc\.on\('emotion'/.test(src),
    "the SDK 'emotion' event handler is back",
  );
});

test('no affective-label score map has a non-zero baseline', () => {
  // The 0.28 "calm" floor made the UI report a mood before any measurement.
  for (const f of [
    'app/lib/sensors/adapters/mediapipeFallbackAdapter.ts',
    'app/lib/sensors/adapters/simulationAdapter.ts',
    'app/components/CameraFeed.tsx',
  ]) {
    const src = readFileSync(f, 'utf8');
    assert.ok(
      !/\b(calm|joy|tense|drowsy|curious|frustrated)\s*:\s*0*\.[1-9]/i.test(src),
      `${f} seeds a non-zero affective baseline`,
    );
  }
});

test('components deleted for making unearned claims stay deleted', () => {
  for (const name of [
    'EmotionDisplay',
    'EmotionChat',
    'ChatDemo',
    'ColorAssessment',
    'ColorTrial',
    'ColorDisplay',
    'ScreenIlluminationGate',
  ]) {
    assert.ok(
      !existsSync(`app/components/${name}.tsx`),
      `app/components/${name}.tsx is back; it was removed as orphaned/unearned`,
    );
  }
});
