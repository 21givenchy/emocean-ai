# EMOCEAN repair roadmap

Grounded against commit `efd16d3`. Every claim below was verified by reading the
file cited. Where the source audit was stale or incomplete, this document says so
— the point of the exercise is that trust pages describe shipped behaviour, and
that standard applies to our own planning docs too.

Status key: `[ ]` open · `[~]` partially done · `[x]` verified done

---

## Corrections to the source audit

Four items differ from the audit. Read these before planning sprints, because two
of them change P0 scope.

### 1. Sensor Diagnostics WAS a live trust failure — now fixed

An earlier draft of this document claimed the emotion display was already gone,
on the strength of `app/lab/sensors/page.tsx` being a 37-line wrapper and
`EmotionDisplay.tsx` having no importers. That was wrong, and the source audit
was right: `EmotionDisplay.tsx` was a decoy. The live path was
`page.tsx` → `CameraFeed` → its own inline expression UI.

What was actually shipping, in `app/components/CameraFeed.tsx`:

- an 11-label affective vocabulary (joy, calm, focus, surprise, tense, curious,
  drowsy, talking, sad, angry, frustrated), rendered as a bar per label;
- `confidence = min(98, 55 + score * 40)` — a figure with a **55% floor** that
  was never measured against anything;
- `calm` seeded to **0.28** before the camera was started, via
  `emptyScores`, with `pickDominant()` defaulting to `calm`;
- upstream, `mediapipeFallbackAdapter.readExpressionScores()` synthesised those
  scores from hand-weighted MediaPipe blendshape sums (`joy: smile*0.8 +
  cheekSquint*0.2`, and a literal `calm: 0.28`) — invented arithmetic presented
  as measurement.

Resolved: `facialExpression` removed from `Capability`, `ALL_CAPABILITIES`,
`SensorSnapshot`, both adapter registries, the vitalcamera adapter (SDK
`enableEmotion` now a hard-coded `false`, `vc.on('emotion')` handler deleted),
the mediapipe adapter (`readExpressionScores` deleted), the simulation adapter,
and the public sandbox samples. `CameraFeed` was rewritten to report observable
signals only, each row carrying availability, source, derived flag and the
adapter's own reason code. Frame cadence and illumination are reported as *not
instrumented* rather than estimated.

Locked in by `tests/no-emotion-inference.test.ts` (5 tests) and the
`emotion-inference` / `fabricated-baseline` claim-guard rules.

The seven orphaned components were deleted outright, `EmotionDisplay` among
them: dead emotion-labelling code in a repo that publishes a
no-emotion-inference promise is one careless import from becoming a live claim.

### 2. `spacing` and `density` are the same token — the audit missed this

`app/lib/assessment/engine.ts`: variant `space-tight` writes
`layout.density: 'compact'`, and variant `density-compact` writes
`layout.density: 'compact'`. Identical. `space-comfortable` and
`density-comfortable` are likewise identical.

So of six advertised factors, two are one factor measured twice under different
names. They can produce contradictory recommendations from the same underlying
token, and the Interface Kit has no way to honour both. This is not a scoring bug
that better statistics would fix — the factor definitions are wrong.

Cutting the MVP to typography / reading-width / contrast (the audit's own
recommendation) resolves it, but reading width must then become a **real** token.
There is currently no width token at all in `designTokens.ts`.

### 3. Search-task contamination is worse than "multiple targets"

`app/lib/assessment/tasks.ts:105-145` — the `distractors` array *contains the
target glyph*:

- `s5` target `★`, distractors `['☆','★','☆','★','☆','★','☆','★','☆','★','☆','★']` → **6 of 12 cells are the target**
- `s6` target `6`, distractors `['9','6','9','6','9','6','9','6','9','6','9','6']` → **6 of 12 cells are the target**
- `s4` target `K` → 3 extra `K`s. `s2` target `Q` → 3 extra `Q`s. `s1`, `s3` similar.

At 50% target density, search time measures pointer travel, not visual search.
Every search-derived number in the corpus so far is unusable — this is a data
invalidation, not just a task-design flaw.

### 4. Confidence handling is already honest; only the winner needs gating

`engine.ts` `cohenD()` and `scoreAssessment()` already return `null` with specific
`confidenceUnavailableReason` strings for df≤0 and zero pooled spread, and
`overallConfidence` averages only estimable factors. That work is done and is good.

The real defect is narrower than the audit implies: `bestVariantId` is assigned
unconditionally, so a factor reports "Not estimable" **and** a winner. The fix is
to gate the recommendation on the confidence the engine already computes, not to
rebuild confidence.

### 5. Two null-signal bugs coexist in Breathe, not one

The audit flags `0 bpm → Serene`. Confirmed: `stateMachine.ts:141`
(`{ bpm: 0, stateId: 'serene' }`). But `update()` has a second, worse path:

```
if (bpm === null) { ... this.targetState = WORLD_STATES[0]; /* storm */ }
```

With adequate quality but a null rate, the world **walks toward Storm**. That
directly violates non-negotiable #7 ("the breathing world must never become more
threatening because a signal was lost"). Quality gating (`quality < MIN_QUALITY`
→ freeze) is correct and already present; the null-rate path bypasses it.

---

## P0 — stop-ship truth and broken core behaviour

Nothing ships publicly until every box here is `[x]`.

### Truth

- [x] Delete the 7 orphaned components listed above.
- [x] Remove `facialExpression` end-to-end; expression inference disabled in both adapters and the SDK config.
- [x] `app/for-teams/page.tsx` — "validated building blocks" replaced with an explicit not-yet-validated statement.
- [x] `app/for-teams/page.tsx` — IRB readiness claim replaced; we now state we make no compliance claim.
- [x] `app/for-teams/page.tsx` — "production-ready" hand-off replaced with prototype-plus-known-limits.
- [~] Reconcile Research / Methods / Validation / About / Privacy. Two live contradictions fixed: `about` no longer says stated preference takes priority, and `methods` version history no longer claims validation study results. `research` and `methods` already flagged the 50/50 blend as a known defect and were left as-is — they are honest. **Reopen when the blend is actually removed**, so the gap notices come down with it. Known contradictions: Research says performance and preference are separate while `engine.ts` blends them 50/50; Methods' version history says "validation study results" while `validation/page.tsx:37` says no figure exists; About says stated preference takes priority.
- [x] Local-only privacy model adopted. `app/lib/consent.ts:279-284` has the upload commented out and `withdrawConsent()` (`:127`) only mutates local state — so remove server-deletion promises from copy, or implement the backend. Local-only is recommended.
- [x] Export metadata minimised to a coarse viewport band, reduced-motion preference, UTC timestamp and format version. Was: `consent.ts:78-81,148-151` collect `userAgent`, `screenResolution`, `timezone`, `language` — quasi-identifiers, while copy says de-identified.

### Find My Interface

- [ ] Gate `bestVariantId` on estimable confidence; a perfect-score tie renders "No clear difference".
- [ ] Split performance and preference into separate outputs; delete the `taskAvg * 0.5 + normalizedSelfReport * 0.5` blend in `engine.ts`.
- [ ] Quick mode must not claim an evidence-backed recommendation at n=1 per variant.
- [x] Fixed `Paper记忆力` → "Paper and memory" (`tasks.ts:42`), and added a `stray-cjk` guard rule.
- [ ] Remove `sentimentScore: 0.5` (`app/components/AssessmentFlow.tsx:558`) and drop `ChatMetrics.sentimentScore` from `engine.ts:257`.
- [ ] Rebuild search items with one unambiguous target and calibrated distractors (`tasks.ts:105-145`). Discard search data collected before this lands.
- [ ] Replace the asymmetric 1–5 anchors "Too much"→"Feels right" (`AssessmentFlow.tsx:629,659-660`), which are incoherent for typography and colour alike.
- [ ] Either score `responseTimeMs` under a predeclared rule or stop collecting it. It is recorded and ignored today.
- [ ] Make motion variants produce materially different motion, or cut motion from the performance recommendation.
- [ ] Resolve the `spacing`/`density` collision (correction #2).
- [ ] Seed the protocol RNG. `engine.ts` `shuffleArray()` and `tasks.ts:192` both use bare `Math.random()`, so no session is reproducible from its export.

### Breathe

- [ ] Drive transitions from elapsed time, not callback count. `TRANSITION_SPEED = 0.02` per tick (`stateMachine.ts:126`) needs ~50 callbacks; `GuidedBreathing` reports near cycle boundaries (~10 s at 6 bpm) → ~500 s for one transition. `update()` already computes `dt` and uses it only for `secondsAtRate` — make the transition consume it.
- [ ] `bpm === null` must freeze, never target Storm (correction #5).
- [ ] Remove `{ bpm: 0, stateId: 'serene' }` (`stateMachine.ts:141`). Zero is missing data.
- [ ] Use `STABILIZATION_TIME_SEC` (`stateMachine.ts:125`) or delete it — declared, never read.
- [ ] Guided-mode copy must stop implying detection. Label pacing as "Guide pace: 6 breaths/min", never a bare "6.0 bpm".
- [ ] Camera-validation language must not appear in a guided debrief.
- [ ] Fix `stop()` passing `null` through a number-only callback via `null as any`.
- [ ] State selection uses rate only; copy promises "slower **and steadier**". Either measure steadiness or change the copy.

### Delivery

- [x] Added `typecheck`, `test`, `check:claims`, `verify` scripts. `CLAUDE.md` instructs agents to run all four; `package.json` defines none. An agent following CLAUDE.md today gets four "missing script" errors and may report success anyway.
- [x] Package renamed to `emocean`; `README.md` rewritten.
- [x] Added `.github/workflows/verify.yml`. Lint is non-blocking pending the module fixes below.
- [ ] Deploy via review branch + preview only.

### Outstanding lint errors (10)

CI runs lint non-blocking until these land. Do not silence the rules to go green.

| File | Error |
|---|---|
| `app/lib/breathe/GuidedBreathing.tsx:46` | Cannot access variable before it is declared — real bug, in the P0 Breathe slice |
| `app/lab/breathe/experience.tsx:46,113` | setState synchronously within an effect (cascading renders) |
| `app/components/AssessmentFlow.tsx:474` | Cannot call impure function during render |
| `app/components/MyModes.tsx:38` | setState synchronously within an effect |
| `app/lab/interface/results/[sessionId]/page.tsx:54` | setState synchronously within an effect |
| `app/lib/sensors/adapters/vitalCameraAdapter.ts:26,38` | `any` |
| `app/lib/sensors/adapters/mediapipeFallbackAdapter.ts:51` | `any` |

Also note `app/lib/breathe/GuidedBreathing.tsx` still contains the `null as any`
cast through a number-only callback that the Breathe section calls out.

`check:claims` is the highest-leverage single item here. This repo's failure mode
is copy drifting ahead of implementation; a grep-based guard over banned phrases
("validated", "IRB-ready", "medical grade", "detects your emotion", bare "HRV")
is the only control that scales past human review.

---

## P1 — the two magic moments

- [ ] Cut Find My Interface to typography size/line-height, reading width, contrast theme.
- [ ] Add a real reading-width token to `designTokens.ts` (none exists).
- [ ] Expand the item bank; add baseline + practice items; seeded counterbalancing.
- [ ] Ask preference once per factor block, not after every exposed condition.
- [ ] Apply the Kit to the whole product at the result screen, with before/after toggle.
- [ ] Three separate result cards: Performance (with uncertainty) · Preference · Experimental signals (quality-gated, optional).
- [ ] Fix exports: `tokensToCSS()` currently emits `--font-scale: compact`, `--density: comfortable`, `--motion-level: full` — not usable CSS values. Emit px/rem. `tokensToJSON()` must carry protocol version, seed, factor definitions, trials, exclusions, sample counts, result status.
- [ ] Add "Apply to EMOCEAN" so the Kit proves itself.
- [ ] Results survive tab close, or the trust line stops promising exportability. Currently `sessionStorage` only.
- [ ] Rebuild guided Breathe as a deterministic restorative world: Tempest → First Light → Current → Reef → Lagoon → Open Horizon, phase-linked micro-feedback, a noticeable change every 15–25 s, 3-minute session reaching the designed ending.
- [ ] Visible camera framing/calibration UI: mirrored preview, silhouette guide, real ROI overlay, raw waveform with no physiological claim, honest quality countdown, always-visible guided-mode and stop controls.
- [ ] Real iPhone Safari passes: permission denial, backgrounding, track interruption, resume.

---

## P2 — rebuild experimental sensing

- [ ] One app-level `CameraController` owning the `MediaStream`. `useSensorHub` is a hook, not a singleton — two consumers open two streams, contrary to CLAUDE.md non-negotiable #1.
- [ ] Single persistent video element → `FrameBroker`; `requestVideoFrameCallback` and real frame timestamps throughout.
- [ ] Replace the chest-motion adapter. It uses a fixed central rectangle and brightness-centroid motion, declares `ASSUMED_FPS = 30` against a 500 ms interval, ignores passed band limits, and can accept 4 s of input — shorter than one cycle at 6 bpm. Non-negotiable #2 forbids the assumed frame rate outright.
- [ ] Pose-anchored torso ROI, global-motion subtraction, principal-axis projection, uniform resampling, 0.07–0.5 Hz band-pass, multi-estimator agreement, explicit quality/duration gates, `insufficient_signal` otherwise.
- [ ] Heavy work into a Web Worker; measure mobile thermal load.
- [ ] Remove rPPG from the immediate breathing loop.
- [ ] Belt validation before any accuracy claim, reporting exclusions and failure rate — not error among successful windows only.
- [ ] rPPG cannot validate colour recommendations until matched-lightness contact-PPG work exists; screen illumination is a launch-blocking confound while the product deliberately changes colour during face capture.

---

## P3 — earn the platform story

- [ ] Versioned package, typed API, sample app, provenance schema, privacy model, tests, browser matrix, validation boundary.
- [ ] Restore `/sandbox` to primary navigation only after the above. It currently presents internal relative imports as an external SDK.
- [ ] Publish measured validation with protocol, exclusions, failure rates. Only then restore developer-platform and research-partner claims.

---

## Brand: earning "ocean of emotion"

Metaphorical, never diagnostic. The ocean is change, depth and recovery. The
product never labels a face. The user names their own intention; the environment
mirrors *verified* change with uncertainty visible. Signal loss freezes the world
— it never storms and never punishes.

| Layer | Direction |
|---|---|
| Base | Ink-black and deep ocean navy, with enough luminance separation that cards stay visible |
| Living primary | Bioluminescent cyan/teal |
| Reward | Dawn amber and soft coral, introduced only as the world opens |
| Motion | Currents, refraction, suspended particles, breathing light, horizon reveals — not scale-on-hover |
| Type | One expressive display face for wonder; one highly readable sans for product copy |

### Accessibility floor

- 16 px minimum body text for core copy. Experience metadata is 12 px today.
- 44×44 px touch targets. Home nav links measure ~20 px and several text CTAs ~17 px.
- Visible keyboard focus; reduced-motion alternatives that preserve progress through colour, sound and static composition.
- Colour never the sole state cue.
- Adjacent styled text fragments need explicit `{' '}` separators, or screen readers receive concatenated words ("learnhow"). Fixed in `app/page.tsx:41`; audit every other split heading.

---

## Agent boundaries

**V0** — visual direction, responsive prototypes, homepage hierarchy, Kit result
transformation, breathing-world states on mocked deterministic data, and the
empty / loading / permission-denied / insufficient-signal states.

**V0 must not invent** scoring rules, physiological algorithms, validation
figures, security or privacy claims, an SDK that does not exist, or production
sensor-lifecycle code.

**OpenCode / Claude Code** — repo-wide read-only audits, code changes with tests
and diffs, camera lifecycle and worker architecture, deterministic protocol and
state-machine logic, CI, claim guard, privacy verification, deploy gates.

One prompt, one review gate. Never chain implementation prompts unattended. Every
coding-agent response states files inspected, files changed, assumptions, tests
actually run, and remaining risks.

No Anthropic API key or runtime dependency exists in this repo, and the product
does not need one. If Claude is added later for narrative or explanation, call it
only from a server-side route with an environment secret, rate limits and bounded
inputs, never a client-exposed key. Sensing, scoring and world-state logic stay
deterministic and locally testable.
