# EMOCEAN — Bioadaptive Experience Lab

A public, evidence-aware web lab exploring how interfaces can adapt to what you
do, and to signals you choose to share. It measures observable behaviour and
signal quality. It does not claim to know how you feel.

Two experiences:

- **Find My Interface** — a task-based interface assessment that returns an
  exportable Interface Kit. Needs no camera.
- **Breathe the World Open** — a breathing experience where a world responds as
  breathing becomes slower and steadier. Guided mode is complete without a
  camera; camera mode is an experimental demonstration of upper-body motion
  sensing.

Formerly "Coloring AI". Next.js App Router, TypeScript, React.

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Next dev server |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (vendor bundles excluded) |
| `npm run check:claims` | Claim guard — see below |
| `npm test` | Node test runner over `tests/**/*.test.ts` |
| `npm run verify` | typecheck → claims → tests → lint. **Must pass before you stop.** |

`npm test` imports `.ts` directly and relies on Node's unflagged type-stripping,
so it needs **Node 23.6 or newer**.

## The claim guard

`npm run check:claims` greps shipped copy under `app/` for claims this project
cannot support: unearned validation, IRB readiness, production-readiness,
medical or diagnostic framing, emotion inference, bare "HRV" where the honest
term is PRV, SpO2 or blood pressure, invented accuracy figures, stray CJK from
pasted content, and non-zero baselines in affective score maps.

Every rule corresponds to something that actually shipped here at least once.
This repository's recurring failure mode is copy drifting ahead of
implementation, and the guard exists because human review caught that late twice.

To allow a line that is explicitly *disclaiming* the phrase it matches, append a
trailing `claim-ok:<reason>` comment. Use it sparingly and never to ship a claim.

`docs/` is not scanned — planning notes must be able to quote a banned phrase in
order to track it.

## Non-negotiables

See `CLAUDE.md`. Violating any of them is a bug, not a preference. The short
version: one `getUserMedia` owner; never assume a frame rate; no number without
provenance; no claim we have not earned; preference is not performance; a skip is
missing data; quality loss freezes adaptation rather than degrading the
experience; the camera is always optional; no raw internal strings in the UI.

## Status

Pre-MVP. `docs/ROADMAP.md` tracks the prioritised repair work with verified
`file:line` references, including a corrections section where the roadmap differs
from earlier audits. Read it before planning work.

No accuracy figure appears anywhere in this project because none has been
measured. The camera-based respiration estimator has never been compared against
a respiration belt. See `/validation`.

## Testing

iOS Safari on a real iPhone is a required target, not an afterthought. The
simulator and desktop responsive mode do not reproduce its camera behaviour.
