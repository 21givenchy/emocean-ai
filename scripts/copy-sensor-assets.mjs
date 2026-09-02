#!/usr/bin/env node
/**
 * copy-sensor-assets.mjs
 *
 * Self-hosts every model/WASM/runtime asset that vitalcamera-sdk (and its
 * peer deps @litertjs/core + @mediapipe/tasks-vision) would otherwise load
 * from cdn.jsdelivr.net at runtime. Run this once after `npm install` (or
 * whenever the pinned SDK/peer versions change) — it is intentionally NOT
 * wired into `postinstall` to avoid surprising CI environments with a
 * multi-megabyte copy step.
 *
 * Usage:
 *   node scripts/copy-sensor-assets.mjs
 *
 * What it does:
 *   1. Copies vitalcamera-sdk's bundled .tflite/.task model files into
 *      public/models/vitalcamera/ (fetched by BrowserAdapter.loadModels()).
 *   2. Copies vitalcamera-sdk's worker source files into
 *      public/vendor/vitalcamera-sdk-0.6.9/workers/ so BrowserAdapter can be
 *      given an explicit `workerBasePath` instead of relying on the SDK's
 *      auto Blob-URL loader (which resolves worker sources relative to the
 *      bundler's chunk URL, not the npm package — unreliable under Next.js).
 *   3. Self-hosts @mediapipe/tasks-vision: copies its wasm/ directory as-is
 *      and copies vision_bundle.mjs to a file literally named "+esm" (the
 *      SDK's workers/adapter request `<mediapipeBase>+esm` and
 *      `<mediapipeBase>wasm`, mirroring jsDelivr's `+esm` transform).
 *   4. Self-hosts @litertjs/core: copies its wasm/ directory as-is, then
 *      uses esbuild to bundle dist/index.js (which has a bare import of
 *      @litertjs/wasm-utils that only jsDelivr's `+esm` endpoint resolves)
 *      into a single self-contained ESM file, also named "+esm".
 */

import { mkdirSync, copyFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const NODE_MODULES = join(ROOT, 'node_modules');
const PUBLIC = join(ROOT, 'public');

function ensureDir(path) {
  mkdirSync(path, { recursive: true });
}

function copy(src, dest) {
  if (!existsSync(src)) {
    console.warn(`[copy-sensor-assets] SKIP (not found): ${src}`);
    return;
  }
  ensureDir(dirname(dest));
  copyFileSync(src, dest);
  console.log(`[copy-sensor-assets] copied ${src.replace(ROOT + '/', '')} -> ${dest.replace(ROOT + '/', '')}`);
}

function copyDir(srcDir, destDir) {
  if (!existsSync(srcDir)) {
    console.warn(`[copy-sensor-assets] SKIP dir (not found): ${srcDir}`);
    return;
  }
  ensureDir(destDir);
  for (const entry of readdirSync(srcDir, { withFileTypes: true })) {
    if (entry.isFile()) {
      copy(join(srcDir, entry.name), join(destDir, entry.name));
    }
  }
}

async function main() {
  // ── 1. vitalcamera-sdk model files -> public/models/vitalcamera/ ──
  const sdkModels = join(NODE_MODULES, 'vitalcamera-sdk', 'models');
  const modelsOut = join(PUBLIC, 'models', 'vitalcamera');
  // The SDK also ships enet_b0_8_best_vgaf_dynamic_int8.tflite (facial-emotion
  // classifier, 4.5 MB) and src/workers/emotion.worker.js. Both are
  // deliberately NOT copied: expression inference is disabled in
  // vitalCameraAdapter (`enableEmotion: false`) because there is no validated
  // estimator behind it and the product promises no emotion inference. Serving
  // the classifier as a public asset would contradict that promise even with
  // no code path loading it. Do not re-add them.
  const modelFiles = [
    'model.tflite',                              // rppg
    'proj.tflite',                                // rppgProj
    'sqi_model.tflite',                           // sqi
    'psd_model.tflite',                           // psd
    'state.gz',                                   // state
    'mobileone_s0_gaze_float16.tflite',           // gaze
    'blaze_face_short_range.tflite',              // faceDetector
    'face_landmarker.task',                       // faceLandmarker
  ];
  for (const file of modelFiles) {
    copy(join(sdkModels, file), join(modelsOut, file));
  }

  // ── 2. vitalcamera-sdk worker sources -> public/vendor/vitalcamera-sdk-0.6.9/workers/ ──
  const sdkWorkers = join(NODE_MODULES, 'vitalcamera-sdk', 'src', 'workers');
  const workersOut = join(PUBLIC, 'vendor', 'vitalcamera-sdk-0.6.9', 'workers');
  const workerFiles = [
    'inference.worker.js',
    'psd.worker.js',
    'gaze.worker.js',
    'plot.worker.js',
    'face_landmarker.worker.js',
  ];
  for (const file of workerFiles) {
    copy(join(sdkWorkers, file), join(workersOut, file));
  }

  // ── 3. @mediapipe/tasks-vision -> public/vendor/mediapipe-tasks-vision-0.10.21/ ──
  const mpPkg = join(NODE_MODULES, '@mediapipe', 'tasks-vision');
  const mpOut = join(PUBLIC, 'vendor', 'mediapipe-tasks-vision-0.10.21');
  copyDir(join(mpPkg, 'wasm'), join(mpOut, 'wasm'));
  copy(join(mpPkg, 'vision_bundle.mjs'), join(mpOut, '+esm'));

  // ── 4. @litertjs/core -> public/vendor/litertjs-core-0.2.1/ ──
  const litertPkg = join(NODE_MODULES, '@litertjs', 'core');
  const litertOut = join(PUBLIC, 'vendor', 'litertjs-core-0.2.1');
  copyDir(join(litertPkg, 'wasm'), join(litertOut, 'wasm'));

  // dist/index.js has a bare `import { createWasmLib } from '@litertjs/wasm-utils'`
  // that only jsDelivr's `+esm` transform resolves for browsers. Bundle it
  // ourselves with esbuild so the self-hosted "+esm" file is self-contained.
  ensureDir(litertOut);
  const litertEntry = join(litertPkg, 'dist', 'index.js');
  if (existsSync(litertEntry)) {
    await esbuild.build({
      entryPoints: [litertEntry],
      bundle: true,
      format: 'esm',
      platform: 'browser',
      outfile: join(litertOut, '+esm'),
      logLevel: 'info',
    });
    console.log(`[copy-sensor-assets] bundled @litertjs/core -> public/vendor/litertjs-core-0.2.1/+esm`);
  } else {
    console.warn(`[copy-sensor-assets] SKIP (not found): ${litertEntry}`);
  }

  console.log('[copy-sensor-assets] Done. All model/WASM/runtime assets are self-hosted under public/.');
}

main().catch((err) => {
  console.error('[copy-sensor-assets] FAILED', err);
  process.exit(1);
});
