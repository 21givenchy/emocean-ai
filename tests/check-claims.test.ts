/**
 * Tests for the claim guard itself.
 *
 * A guard nobody tests is a guard that quietly stops matching. These cases
 * assert both directions: known-bad copy fails, and the `claim-ok:` escape
 * hatch works, so a page that explicitly disclaims a phrase can still say it.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const GUARD = resolve('scripts/check-claims.mjs');

/** Runs the guard against a throwaway repo containing one app/ file. */
function runGuardOn(contents: string): { code: number; out: string } {
  const dir = mkdtempSync(join(tmpdir(), 'claimguard-'));
  try {
    mkdirSync(join(dir, 'app'), { recursive: true });
    writeFileSync(join(dir, 'app', 'page.tsx'), contents);
    try {
      const out = execFileSync('node', [GUARD], { cwd: dir, encoding: 'utf8', stdio: 'pipe' });
      return { code: 0, out };
    } catch (err) {
      const e = err as { status?: number; stdout?: string; stderr?: string };
      return { code: e.status ?? 1, out: `${e.stdout ?? ''}${e.stderr ?? ''}` };
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const BAD = [
  ['unearned-validation', 'We ship validated building blocks for teams.'],
  ['irb-readiness', 'Exports are ready for IRB-approved studies.'],
  ['production-ready', 'We hand off production-ready code.'],
  ['medical-claim', 'A medical-grade breathing signal.'],
  ['emotion-inference', 'EMOCEAN detects your emotion from your face.'],
  ['no-spo2-bp', 'We also report SpO2 from the camera.'],
  ['accuracy-figure', 'The estimator is 94% accurate.'],
  ['stray-cjk', "title: 'Paper记忆力',"],
  ['fabricated-baseline', 'const scores = { calm: 0.28, joy: 0 };'],
];

for (const [ruleId, copy] of BAD) {
  test(`guard rejects: ${ruleId}`, () => {
    const { code, out } = runGuardOn(copy);
    assert.equal(code, 1, `expected a violation for ${ruleId}\n${out}`);
    assert.match(out, new RegExp(ruleId), `expected rule ${ruleId} to fire`);
  });
}

test('guard accepts honest copy', () => {
  const { code, out } = runGuardOn(
    'We have not compared the estimate against a reference instrument, so we report no error figure.',
  );
  assert.equal(code, 0, out);
});

test('claim-ok: escape hatch suppresses a match', () => {
  const { code } = runGuardOn('A medical-grade claim we cannot make. claim-ok:negated');
  assert.equal(code, 0);
});

test('bare HRV fails but PRV and qualified HRV pass', () => {
  assert.equal(runGuardOn('Your HRV is shown live.').code, 1);
  assert.equal(runGuardOn('Your PRV (experimental) is shown live.').code, 0);
});
