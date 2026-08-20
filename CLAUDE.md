# EMOCEAN — Bioadaptive Experience Lab

## What this is

A public, evidence-aware web lab with two experiences:

- **Find My Interface** — task-based interface assessment returning an exportable Interface Kit
- **Breathe the World Open** — camera-optional breathing experience where a world responds to confirmed slower, steadier breathing

Formerly "Coloring AI". Next.js App Router, TypeScript, React.

## Non-negotiables

Violating any of these is a bug, not a preference.

1. **ONE getUserMedia OWNER.** A single SensorHub owns the MediaStream. No component calls `getUserMedia` directly. Stop tracks on route exit and on visibility change.

2. **NEVER ASSUME A FRAME RATE.** Sampling rate is measured from real timestamps via `requestVideoFrameCallback` where available. `30` is not a constant anywhere in this codebase.

3. **NO NUMBER WITHOUT PROVENANCE.** Every physiological value carries source, window, units, quality score, reason codes and a validation label. If those cannot be attached, return `insufficient_signal` instead. Returning nothing is the correct behaviour.

4. **NO CLAIM WE HAVEN'T EARNED.** No accuracy figure, study result, confidence percentage or citation may appear unless it has been measured or verified. Belt-referenced validation has NOT been run. Never write "medical grade", "detects your emotion", "knows how you feel", or unqualified "HRV" — it is PRV, experimental. No SpO2 or blood pressure; no valid estimator exists.

5. **PREFERENCE IS NOT PERFORMANCE.** Measured task performance, stated preference and optional physiology are three separate results. Never blend them into one score. Physiology adds context and never overrules either. The protected result is measured performance, not preference. "No clear difference" is a valid, displayable outcome.

6. **A SKIP IS MISSING DATA.** Never a neutral value.

7. **QUALITY LOSS FREEZES ADAPTATION.** It never degrades the experience. The breathing world must never become more threatening because a signal was lost.

8. **THE CAMERA IS ALWAYS OPTIONAL.** Guided mode is a complete experience end to end with permission denied.

9. **NO RAW INTERNAL STRINGS IN THE UI.** Every failure path gets human copy and a route forward.

## Commands

```
npm run dev
npm run build
npm run lint
npm run typecheck
npm run test
npm run check:claims
npm run verify      # runs all checks — must pass before you stop
```

## Testing

iOS Safari on a real iPhone is a required target, not an afterthought. The simulator and desktop responsive mode do not reproduce its camera behaviour.

## Version notes

Next.js and React here are newer than most training data. Read `node_modules/next/dist/docs/` rather than assuming API shapes.

## Working style

Show the diff before editing. Stop at review gates. Do not invent physiological algorithms, statistics or citations — if a number is needed and has not been supplied, say so.
