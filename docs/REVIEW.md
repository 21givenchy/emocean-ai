# EMOCEAN MVP readiness review

Read-only verification pass, plus a status map of the P0 truth-sweep work that
landed before it. Every finding below was checked against the file cited or
against recorded command output. Nothing is described as passing that was not
run.

## 1. Executive verdict and MVP-readiness score

**Not ready to ship. 3 / 10.**

The truth layer is now sound: no public route infers emotion, no page claims a
validation that `/validation` denies, privacy copy matches verified network and
persistence behaviour, and a claim guard plus CI now defend all of that. That
work is done and verified.

The two product outcomes are not. **Neither magic moment works.**

- *Find My Interface* returns a recommendation that is an artefact of
  registration order, not measurement. Runtime-proven below: a perfect session
  selects the first-registered variant for all six factors while reporting
  `confidence: null`. The number shown next to each factor is a sample count of
  `1`.
- *Breathe the World Open* cannot reach its designed ending. Guided progression
  advances 0.02 per cycle-boundary callback (~10 s at 6 bpm), so one state
  transition needs ~500 s — longer than the 3-minute experience.

So the product currently ships two experiences that both produce a confidently
presented wrong answer. That is a worse failure than shipping nothing, and it is
why the score is 3 rather than 6: honesty about the *pipeline* is in place, but
the *outputs* are not yet honest.

Camera estimation is further behind still and is correctly gated behind
experimental labelling.

## 2. Repo / branch / SHA / deployment

| | |
|---|---|
| Remote | `https://github.com/21givenchy/emocean-ai.git` (remote name `fork`) |
| Branch | `main` |
| Reviewed base SHA | `efd16d31bb498121b649ef8f2210ca7c33d2ba8a` |
| Base subject | *MVP finalization: remove fabricated claims, fix assessment completion bugs, camera mount-order, mobile layout* |
| Working tree | 34 modified/added files, **uncommitted**, staged only |
| Package | was `emotion-detector@0.1.0` → now `emocean@0.1.0` |
| Deployment | Vercel (per `/privacy` copy). **No deploy performed. No branch created.** |

Local runtime checks ran against `npm start` on port **3999** — port 3000 was
already occupied by an unrelated app, and the first attempt produced a full page
of misleading 404s from that other server before the collision was caught.

## 3. Command output (recorded)

```
$ npm run typecheck
> emocean@0.1.0 typecheck
> tsc --noEmit
exit=0                                                    PASS

$ npm run check:claims
check:claims — scanned 44 file(s) against 10 rule(s): clean
exit=0                                                    PASS

$ npm test
ℹ tests 17   ℹ pass 17   ℹ fail 0   ℹ duration_ms 495.4    PASS

$ npm run build
✓ Generating static pages (16/16); 15 routes emitted        PASS

$ npm run lint
✖ 36 problems (10 errors, 26 warnings)                     FAIL
```

Lint is the only failing gate. All 10 errors are pre-existing, in the Breathe and
assessment modules scheduled for the next two work items; they are enumerated in
`ROADMAP.md`. CI runs lint with `continue-on-error: true` and a documented
closing condition, chosen over either weakening the rules or landing a
permanently red pipeline.

### Production route status (port 3999)

| Route | Status | Route | Status |
|---|---|---|---|
| `/` | 200 | `/privacy` | 200 |
| `/lab` | 200 | `/for-teams` | 200 |
| `/lab/interface` | 200 | `/sandbox` | 200 |
| `/lab/breathe` | 200 | `/about` | 200 |
| **`/lab/sensors`** | **404** | `/robots.txt` | **404** |
| `/research` | 200 | `/sitemap.xml` | **404** |
| `/methods` | 200 | `/manifest.webmanifest` | **404** |
| `/validation` | 200 | | |

Emotion-label scan of served HTML across all 11 public routes: **none**
(`joy`, `drowsy`, `frustrated`, `angry`, `surprise`, `curious`, `tense`).

Security headers on `/`: **none** of CSP, X-Frame-Options, X-Content-Type-Options,
HSTS, Referrer-Policy, Permissions-Policy.

`<title>` on all 11 routes: identical — `EMOCEAN — Bioadaptive Experience Lab`.

## 4. Finding-by-finding verification

Nineteen findings were submitted. **Sixteen confirmed, one partially falsified,
three already remediated by the P0 pass.** Two additional findings were
discovered that were not submitted.

| # | Finding | Verdict | Evidence |
|---|---|---|---|
| 1 | Quick runs 1 obs/option, still picks winners when confidence not estimable | **CONFIRMED** | Runtime: 17 trials, `n:1` per variant, `confidence: null`, winner still set for all 6 factors |
| 2 | 50/50 blend; elapsed time recorded but ignored | **CONFIRMED** | `engine.ts` `taskAvg * 0.5 + normalizedSelfReport * 0.5`; `taskScores` maps only `.correct` |
| 3 | Ties pick first registered variant | **CONFIRMED** | Runtime: all 6 winners `== firstRegistered` (`type-compact`, `space-tight`, `density-compact`, `contrast-high`, `color-cyan`, `motion-full`) |
| 4 | Multi-target search grids; any non-empty chat correct; sentiment hard-coded 0.5 | **CONFIRMED, worse** | `tasks.ts:105-145` distractors *contain* the target (`s5`,`s6` = 6/12 cells); `AssessmentFlow.tsx:554` `correct: reply.trim().length > 0`; `:558` `sentimentScore: 0.5`; **and `:477` `correct: true` is the only completion path** |
| 5 | Motion variants create no different motion | **CONFIRMED** | `AssessmentFlow.tsx` has **zero** references to `motion.level`/`durationMs`; hard-coded `duration-500`, `transition-all`, `transition: 'opacity 0.3s'` |
| 6 | Deep reuses small bank; `Math.random` unseeded | **CONFIRMED** | 6 reading / 6 search / 6 chat items vs 34 deep trials; `engine.ts` `shuffleArray`, `tasks.ts:192` |
| 7 | Exported CSS holds semantic labels | **CONFIRMED** | Runtime output: `--font-scale: default; --line-height: normal; --density: comfortable; --radius: rounded; --motion-level: full` |
| 8 | Guided advances 0.02/callback; anim resets on `cycleCount` | **CONFIRMED** | `stateMachine.ts:126` `TRANSITION_SPEED = 0.02`; `update()` computes `dt` but spends it only on `secondsAtRate`; `GuidedBreathing.tsx:47` `tick` dep `[cycleCount,…]` re-registers rAF at `:52` |
| 9 | 0 bpm → Serene; steadiness/depth unmeasured | **CONFIRMED, worse** | `stateMachine.ts:141` `{ bpm: 0, stateId: 'serene' }`; state selection reads rate only; **and `bpm === null` targets `WORLD_STATES[0]` (Storm)** — signal loss makes the world *more* threatening, violating non-negotiable 7 |
| 10 | Fixed central ROI + brightness centroid, not pose-anchored flow | **CONFIRMED** | `chestMotionRespirationAdapter.ts` |
| 11 | `ASSUMED_FPS = 30` vs ~500 ms interval | **CONFIRMED** | `:16` `ASSUMED_FPS = 30`, `:14` `UPDATE_INTERVAL_MS = 500` — violates non-negotiable 2 |
| 12 | Filter is not the claimed band-pass; window too short; quality not a validated SQI | **CONFIRMED** | `:30` `bandpassFilter(samples, lowHz, highHz)` — both params **unused** (lint confirms); body is moving-average detrend sized by `ASSUMED_FPS`; `:21` `MIN_HISTORY_SEC = 4` < one 10 s cycle at 6 bpm; quality is an amplitude ratio |
| 13 | Respiration quality mixed with broader face/rPPG quality | **CONFIRMED** | `experience.tsx:43` gates the respiration-driven world on `snapshot.signalQuality` |
| 14 | `useSensorHub` not a singleton; no reliable stop/reacquire on visibility | **CONFIRMED** | Per-instance `useRef` (`:153-155`), **two** consumers (`experience.tsx:33`, `CameraFeed.tsx:91`) → two streams; `:302-324` handler acts **only** on `visibilityState === 'visible'` and never stops tracks when hidden — violates non-negotiable 1 |
| 15 | VitalCamera uses rAF, copies BVP buffers, enables expression inference | **PARTLY FALSIFIED** | rAF (`:163,:170`) and `[...bvpBuffer]`/`[...ibiBuffer]` (`:102,:108`) confirmed. Expression inference **now disabled** — `enableEmotion` is a hard-coded `false`, `vc.on('emotion')` deleted |
| 16 | Sensor Diagnostics shows emotion labels; `Calm` = 0.28 pre-camera | **WAS TRUE → FIXED** | Was `CameraFeed.tsx:156,188` + `confidence = min(98, 55 + score*40)` + `emptyScores` `calm: 0.28`, sourced from `mediapipeFallbackAdapter.readExpressionScores()` (`calm: 0.28` literal). All removed; route now 404s in production |
| 17 | Local-only consent, unimplemented telemetry, quasi-identifiers, dead deletion promises | **WAS TRUE → FIXED** | `withdrawConsent()` now deletes; telemetry scaffolding removed; metadata reduced from userAgent+resolution+timezone+language to viewport band + reduced-motion + UTC timestamp + version; privacy copy rewritten |
| 18 | CLAUDE.md names scripts `package.json` lacks | **WAS TRUE → FIXED** | All four now defined and runnable |
| 19 | No CI, security headers, route metadata, robots, sitemap, manifest | **CI FIXED; REST CONFIRMED** | `.github/workflows/verify.yml` added. Headers/metadata/robots/sitemap/manifest still absent — runtime-confirmed above |

### Additional findings not submitted

| # | Finding | Severity |
|---|---|---|
| A1 | **`spacing` and `density` write the same token.** `space-tight` and `density-compact` both set `layout.density: 'compact'`. Six declared factors are five, two can recommend contradictory values for one token, and no Interface Kit can honour both. | High |
| A2 | **The site publicly serves emotion and age/gender classifiers.** Runtime-verified 200s: `/models/face_expression_model-shard1` (329,468 B), `/models/age_gender_model-shard1` (429,708 B), `/face-api.min.js` (663,829 B). No code loads them — `face-api.js` is imported by **0** app files — but the product promises no emotion inference while shipping a face-expression classifier as a public asset. | High (trust) |
| A3 | **`engine.ts:1` imports type-only exports as values** (`VisualTokens`, `VisualMode`), so the scoring engine cannot be imported by any non-bundler ESM consumer. Blocks plain-Node unit tests of scoring — a prerequisite for the Find My Interface acceptance criteria. Needs `import type`. | Medium |

### The compounding chain worth naming

Findings 3, 4 and 5 are not independent. The search task **cannot be answered
incorrectly** (`correct: true` is the only completion path, `:477`), so
`taskAvg = 1.0` for every search variant. Both search-backed factors — `density`
and `motion` — are therefore always perfectly tied, and the tie-break awards the
first registered variant. Motion variants additionally produce identical motion.

So `density: compact` and `motion: full` are **constants dressed as findings**.
No user input can change them. Combined with A1, that means half the six-factor
result is structurally predetermined.

## 5. Scientific-validity review

**Assessment.** The design is sound in intent and invalid in execution. Three
independent defects each alone void the recommendation: preference is blended
into a measurement (2); ties resolve by registration order rather than reporting
no difference (3); and one observation per condition cannot support an effect
size (1) — which `cohenD()` correctly recognises by returning `null`, while the
consuming code assigns a winner anyway. Practice and memory effects are
unaddressed (6). Order is not reproducible (6). Response time is collected and
discarded (2).

Credit where due: `engine.ts`'s uncertainty handling is genuinely careful —
`cohenD()` returns `null` for `df <= 0` and zero pooled spread with distinct
human-readable reasons, and `overallConfidence` averages only estimable factors
rather than coercing absent values to zero. The defect is narrow: `bestVariantId`
is assigned unconditionally. **Gate the winner on the confidence the engine
already computes** — do not rebuild the statistics.

**Respiration.** Not a valid estimator, and should make no numeric claim. The ROI
is a fixed rectangle rather than a detected torso; the signal is brightness
centroid drift, not landmark displacement or optical flow; the "band-pass"
ignores its own cutoff arguments; the window can be 4 s against a 10 s cycle at
6 bpm; periodicity rests on zero crossings with no independent-estimator
agreement; and quality is an amplitude ratio, not a validated SQI. Any of the six
would be disqualifying on its own.

`STABILIZATION_TIME_SEC` (`stateMachine.ts:125`) is declared and never read, so
there is no stabilisation requirement at all.

## 6. Camera lifecycle and mobile Safari risk

`useSensorHub` holds the only `getUserMedia` call in app source (`:203`) — good
— but it is a hook with per-instance refs, not an application-level owner. Two
components mount it, so two streams are possible. Non-negotiable 1 is not met in
architecture, only in call-site count.

The visibility handler is **half-implemented**: it reacts to becoming visible
(checking `readyState`, setting `needsResume`, retrying `play()`) but never stops
tracks on hidden. Non-negotiable 1 requires stopping on visibility change. On iOS
Safari this is the exact path that produces a held camera indicator after
backgrounding, and an unrecoverable stream after an interruption.

Highest iOS risks, untested: permission denial mid-onboarding; backgrounding
during a session; track interruption by a call; resume after interruption;
thermal throttling with rAF-driven frame processing and 31 MB of models.

## 7. Privacy, security, claim consistency

**Verified local-only.** Zero `fetch` / `XMLHttpRequest` / `WebSocket` /
`sendBeacon` in app source. Zero analytics or tracker packages. Persistence is
`localStorage` (consent, modes) and `sessionStorage` (session results) only. Env
var use is limited to `NODE_ENV` and `NEXT_PUBLIC_SENSOR_SIMULATION`, both
dev-gated. The privacy copy now matches this.

Remaining gaps: no security headers of any kind; results in `sessionStorage`
vanish on tab close while the landing trust line offers export; and A2 above —
serving emotion/age classifiers publicly contradicts the no-emotion promise
regardless of whether code loads them.

## 8. Accessibility, performance, SEO

- Zero 44 px-minimum touch targets on `/`. Nav links measure ~20 px.
- Three `text-xs` (12 px) metadata clusters remain on `/`, below the 16 px floor.
- `prefers-reduced-motion` is honoured in `globals.css:27` — one real win.
- No `<title>`, description, canonical, Open Graph or Twitter metadata per route: all 11 routes share one title.
- No `robots.txt`, `sitemap.xml` or `manifest.webmanifest` (404s recorded).
- 31 MB of models plus 652 KB of unused `face-api.min.js` in `public/`.

## 9. Dependency and dead-code review

| Package | App imports | Verdict |
|---|---|---|
| `face-api.js` | **0** | **Remove.** Plus `public/face-api.min.js` (652 KB) and the face-api model set |
| `@litertjs/core` | **0** | Investigate — likely a transitive need of `vitalcamera-sdk`; remove if not |
| `@mediapipe/tasks-vision` | 1 | Keep |
| `vitalcamera-sdk` | 6 | Keep, but rPPG should leave the breathing loop |

Seven orphaned components were deleted in the P0 pass (−1,597 lines):
`EmotionDisplay`, `EmotionChat`, `ChatDemo`, `ColorAssessment`, `ColorTrial`,
`ColorDisplay`, `ScreenIlluminationGate`.

Dead assets still present: `public/models/face_expression_model-*`,
`age_gender_model-*`, `mtcnn_model-*`, `face_recognition_model-*`, plus six
project PDFs and a screenshot in `public/`, and eight loose `.jpeg` files in the
repo root.

## 10. Repair plan — small reviewable PRs

P0 truth work is **already landed** (staged, uncommitted). What follows is what
remains.

### PR-0 · Commit the P0 truth sweep
- **Goal:** land the verified truth layer.
- **Files:** the 34 staged paths.
- **Acceptance:** `typecheck`, `check:claims`, `test`, `build` pass; `/lab/sensors` 404s in production; no emotion label in any served route.
- **Rollback:** `git revert`.
- **Risks:** low. Lint remains at 10 pre-existing errors.

### PR-1 · Purge emotion/age model assets and `face-api.js`
- **Goal:** stop serving classifiers the product promises not to use (A2).
- **Files:** `package.json`, `package-lock.json`, `public/face-api.min.js`, `public/models/{face_expression,age_gender,mtcnn,face_recognition}*`.
- **Acceptance:** those paths 404; `npm run build` passes; camera path still initialises in dev.
- **Rollback:** revert; assets are re-downloadable.
- **Risks:** confirm `scripts/copy-sensor-assets.mjs` and the vitalcamera loader do not reference the removed manifests.

### PR-2 · Guided Breathe: deterministic, camera-free
- **Goal:** a 3-minute guided session reaches its designed ending.
- **Files:** `app/lib/breathe/{stateMachine.ts,GuidedBreathing.tsx}`, `app/lab/breathe/{page.tsx,experience.tsx}`, `tests/breathe/*`.
- **Changes:** progression from `dt` and breathing phase, not callback count; drop `cycleCount` from the `tick` dependency; label displayed numbers "Guide pace", never detected; explicit `unavailable`/`frozen` states replacing 0/null; separate guided vs camera debrief copy; three visible milestones; immediate phase feedback; pause/resume/stop/restart; remove `null as any`.
- **Acceptance:** fake-timer unit test per transition; no transition on null/insufficient signal; guided completes with permission denied; debrief matches mode; no stale rAF loop; `0`/`null` never map to Serene; signal loss freezes and never worsens the world.
- **Rollback:** revert; no schema or storage change.
- **Risks:** the `bpm === null → Storm` path is load-bearing for camera mode; changing it needs the camera-mode tests in the same PR. Do not touch estimation.

### PR-3 · Find My Interface: valid decision rule
- **Goal:** replace the invalid rule while preserving raw trial data.
- **Files:** `app/lib/assessment/{engine.ts,tasks.ts}`, `app/components/{AssessmentFlow.tsx,SelfReport.tsx,ResultsPage.tsx}`, `app/lib/designTokens.ts`, `tests/assessment/*`.
- **Changes:** delete the 50/50 blend; separate performance and preference models; return `no_clear_difference` / `insufficient_evidence` instead of forcing a winner; seeded exportable protocol; cut MVP factors to typography, reading width/spacing, contrast — resolving A1, and adding the reading-width token that does not yet exist; expand the item bank; one unambiguous search target with calibrated distractors; delete hard-coded sentiment and any-chat-is-correct; make motion genuinely distinct or drop it from measurement; surface sample count, exclusions, uncertainty; apply the Kit across the result page with a before/after toggle; emit real CSS px/rem and provenance-rich JSON; fix A3 with `import type`.
- **Acceptance:** all-correct ties never pick the first variant; Quick never overstates evidence; preference cannot reorder performance; every export reproduces protocol order; CSS parses and applies; no internal IDs in user-facing strings; unit tests over scoring, ties, skips, randomisation, export.
- **Rollback:** revert; keep the raw-trial schema unchanged so old sessions still parse.
- **Risks:** largest surface. A3 must land first or the tests cannot import the engine.

### PR-4 · Platform hygiene
- **Goal:** headers, metadata, `robots.txt`, `sitemap.xml`, manifest, per-route titles; asset cleanup.
- **Acceptance:** those three routes return 200; each route has a distinct title and description; security headers present on `/`.
- **Rollback:** revert `next.config.ts`.
- **Risks:** a CSP will likely need tuning for the worker/wasm sensor paths — ship report-only first.

### PR-5 · Accessibility floor
- **Goal:** 16 px body minimum, 44×44 px targets, visible focus, colour never the sole cue.
- **Acceptance:** axe clean on all public routes; keyboard traversal of both experiences.

### PR-6 · Camera lifecycle (do not start before PR-2)
- **Goal:** one application-level `CameraController` owning the stream; stop on hidden and on route exit; explicit reacquire.
- **Acceptance:** one stream with two consumers mounted; tracks stop on hidden; real-iPhone matrix below passes.

### PR-7 · Rebuild estimation (P2)
Pose-anchored ROI, real frame timestamps via `requestVideoFrameCallback`,
global-motion subtraction, true band-pass, multi-estimator agreement, quality
gates, worker offload, rPPG out of the interaction loop. No accuracy claim before
belt validation.

## 11. Device / browser test matrix

Playwright is **not installed** — there is no E2E harness, so the
"changed routes have Playwright assertions" criterion is unmet. Adding it is a
prerequisite for PR-2 and PR-3 acceptance.

| Surface | Guided complete | Camera denied | Background/resume | Reduced motion | Kit applies |
|---|---|---|---|---|---|
| **Real iPhone Safari (required)** | ☐ | ☐ | ☐ | ☐ | ☐ |
| iPad Safari | ☐ | ☐ | ☐ | ☐ | ☐ |
| Android Chrome | ☐ | ☐ | ☐ | ☐ | ☐ |
| Desktop Chrome | ☐ | ☐ | n/a | ☐ | ☐ |
| Desktop Firefox | ☐ | ☐ | n/a | ☐ | ☐ |
| Desktop Safari | ☐ | ☐ | n/a | ☐ | ☐ |

iPhone Safari additions: permission denial mid-onboarding; backgrounding
mid-session; interruption by a call; resume after interruption; thermal
behaviour over 3 minutes; camera indicator clears on navigation away.

## 12. Questions requiring owner decisions

1. **Motion and colour:** drop from the measured flow entirely, or build equivalent tasks and genuinely distinct conditions? Cheapest credible MVP drops both to stated preferences.
2. **Result durability:** the trust line promises export, but `sessionStorage` dies with the tab. Persist to `localStorage`, or reword the promise?
3. **Reading-width token:** none exists. Add one, or ship a two-factor MVP (typography, contrast)?
4. **Response time:** score it under a predeclared rule, or stop collecting it?
5. **`face-api.js` and its models:** confirmed unused — safe to delete outright, or is a research path depending on them?
6. **`/sandbox`:** keep as an honest "no package yet" technical note, or replace with a waitlist until a versioned package exists?
7. **Chat task:** build a real rubric, or cut it? It currently accepts any non-empty reply.
8. **Item bank:** who authors and validates equivalent reading passages? This is content work, not engineering, and it gates PR-3.
9. **E2E harness:** approve adding Playwright, and does CI budget allow it?
10. **`emotion-detector` history:** the repo was public under a name and README describing emotion detection. Any external references to correct?

## 13. Standing constraints observed

No branch created. No commit made. No production deploy. No camera-estimation
code touched. No AI API calls added — this product needs none, and none exist.
