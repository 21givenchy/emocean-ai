#!/usr/bin/env node
/**
 * Claim guard.
 *
 * This repository's recurring failure mode is copy drifting ahead of
 * implementation: pages have promised validated estimators, IRB readiness,
 * production-ready hand-offs and emotion detection that the code could not
 * support. Human review caught those late, twice. This guard catches them at
 * commit time.
 *
 * Every rule below corresponds to a defect that was actually shipped, or to a
 * standing rule in CLAUDE.md. Rules are deliberately narrow: a guard that cries
 * wolf gets disabled, and a disabled guard protects nothing.
 *
 * To allow a specific line, append a trailing `claim-ok:<reason>` comment. Use
 * it when the surrounding copy is explicitly disclaiming the thing matched —
 * a page that says "we have no accuracy figure" must be able to say the word.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
// Shipped copy only. `docs/` is internal planning and must be able to quote a
// banned phrase in order to track it.
const SCAN_DIRS = ['app'];
const SCAN_EXT = /\.(tsx?|md|mdx)$/;
const SKIP_DIR = /(^|\/)(node_modules|\.next|vendor|models)(\/|$)/;
const ALLOW = /claim-ok:/;

/** @type {{id:string,re:RegExp,why:string}[]} */
const RULES = [
  {
    id: 'unearned-validation',
    re: /\bvalidated\s+(building blocks|estimator|pipeline|adapter|signal)/i,
    why: 'No estimator here has been compared against a reference instrument. Belt validation has not been run.',
  },
  {
    id: 'irb-readiness',
    re: /\b(IRB[- ]ready|ready for IRB|IRB[- ]approved studies)\b/i,
    why: 'IRB readiness is a property of a study protocol, not of this product. We cannot assert it.',
  },
  {
    id: 'production-ready',
    re: /\bproduction[- ]ready\b/i,
    why: 'No versioned package, test suite or service boundary exists to back this.',
  },
  {
    id: 'medical-claim',
    re: /\bmedical[- ]grade\b|\bclinically (validated|proven)\b|\bdiagnos(e|es|is) (your|the user)/i,
    why: 'CLAUDE.md rule 4: no medical or diagnostic claim, ever.',
  },
  {
    id: 'emotion-inference',
    re: /\bdetects? your emotion\b|\bknows how you feel\b|\breads? your (emotion|mood|feelings)\b|\bemotion detection\b/i,
    why: 'CLAUDE.md rule 4 and the brand promise: we measure observable behaviour, never inferred emotion.',
  },
  {
    id: 'bare-hrv',
    // Unqualified "HRV" as a user-facing measure. The honest term is PRV
    // (pulse rate variability), and it is experimental.
    re: /(?<!P)\bHRV\b(?!\s*\(|[^.]{0,40}\b(experimental|unvalidated|PRV)\b)/,
    why: 'It is PRV, not HRV, and it is experimental. Say so or use the accurate term.',
  },
  {
    id: 'no-spo2-bp',
    re: /\bSpO2\b|\bblood (oxygen|pressure)\b/i,
    why: 'CLAUDE.md rule 4: no valid camera-based estimator exists for these. Do not mention them as outputs.',
  },
  {
    id: 'accuracy-figure',
    // A percentage next to accuracy language. No measured figure exists.
    re: /\b\d{1,3}(\.\d+)?\s*%\s*(accurate|accuracy|precision|confiden(t|ce))\b|\b(accuracy|precision)\s*(of|:)\s*\d/i,
    why: 'No accuracy figure has been measured. Publishing one is fabrication.',
  },
  {
    id: 'stray-cjk',
    // `Paper记忆力` shipped in the reading item bank. Catches accidental
    // pasted CJK in an English-only corpus.
    re: /[一-鿿]/,
    why: 'Stray CJK characters in English copy — likely an accidental paste (see the Paper记忆力 defect).',
  },
  {
    id: 'fabricated-baseline',
    // The 0.28 "calm" floor. Catches a non-zero literal baseline reintroduced
    // into an inference score map.
    re: /\b(calm|joy|tense|focus|drowsy|curious|frustrated)\s*:\s*0*\.[1-9]/i,
    why: 'A non-zero baseline for an affective label is a fabricated reading. Removed once already; do not reintroduce.',
  },
];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (SKIP_DIR.test(full)) continue;
    if (statSync(full).isDirectory()) walk(full, out);
    else if (SCAN_EXT.test(full)) out.push(full);
  }
  return out;
}

const files = SCAN_DIRS.flatMap((d) => {
  try {
    return walk(join(ROOT, d));
  } catch {
    return [];
  }
});

let failures = 0;
for (const file of files) {
  const rel = relative(ROOT, file);
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    if (ALLOW.test(line)) return;
    for (const rule of RULES) {
      if (rule.re.test(line)) {
        failures++;
        console.error(`\n${rel}:${i + 1}  [${rule.id}]`);
        console.error(`  ${line.trim().slice(0, 160)}`);
        console.error(`  → ${rule.why}`);
      }
    }
  });
}

console.error(
  `\ncheck:claims — scanned ${files.length} file(s) against ${RULES.length} rule(s): ` +
    (failures ? `${failures} violation(s)` : 'clean')
);
if (failures) {
  console.error(
    'Fix the copy, or append `claim-ok:<reason>` to a line that is explicitly disclaiming the match.'
  );
}
process.exit(failures ? 1 : 0);
