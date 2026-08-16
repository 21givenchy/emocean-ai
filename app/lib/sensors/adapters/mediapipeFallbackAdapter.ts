import type { AdapterContext, Capability, SensorAdapter } from '../types';

type Blend = { categoryName: string; score: number }[];

function blendScore(blend: Blend, names: string[]) {
  const matches = names.map((name) => blend.find((item) => item.categoryName === name)?.score ?? 0);
  return matches.length ? Math.max(...matches) : 0;
}

function readExpressionScores(blend: Blend) {
  const smile = blendScore(blend, ['mouthSmileLeft', 'mouthSmileRight']);
  const frown = blendScore(blend, ['mouthFrownLeft', 'mouthFrownRight']);
  const browDown = blendScore(blend, ['browDownLeft', 'browDownRight']);
  const browUp = blendScore(blend, ['browInnerUp', 'browOuterUpLeft', 'browOuterUpRight']);
  const jawOpen = blendScore(blend, ['jawOpen']);
  const eyeWide = blendScore(blend, ['eyeWideLeft', 'eyeWideRight']);
  const eyeSquint = blendScore(blend, ['eyeSquintLeft', 'eyeSquintRight']);
  const mouthPress = blendScore(blend, ['mouthPressLeft', 'mouthPressRight']);
  const cheekSquint = blendScore(blend, ['cheekSquintLeft', 'cheekSquintRight']);

  const scores: Record<string, number> = {
    joy: Math.max(0, smile * 0.8 + cheekSquint * 0.2),
    surprise: Math.max(0, browUp * 0.55 + jawOpen * 0.25 + eyeWide * 0.2),
    tense: Math.max(0, (browDown * 0.5 + mouthPress * 0.35 + frown * 0.15) * (1 - jawOpen * 0.5)),
    curious: Math.max(0, browUp * 0.5 + eyeSquint * 0.3 + (1 - smile) * 0.1),
    calm: 0.28,
    sad: Math.max(0, frown * 0.5 + (1 - smile) * 0.3 + browUp * 0.2),
    angry: Math.max(0, browDown * 0.6 + mouthPress * 0.3 + frown * 0.1),
  };

  let dominant = 'calm';
  let best = scores.calm;
  for (const [key, value] of Object.entries(scores)) {
    if (key !== 'calm' && value > best && value > 0.22) {
      best = value;
      dominant = key;
    }
  }
  return { scores, dominant };
}

/** Decode yaw/pitch/roll (degrees) from a MediaPipe 4x4 row-major facial transformation matrix. */
function eulerFromMatrix(m: Float32Array): { yaw: number; pitch: number; roll: number } {
  // m is row-major 4x4; rotation submatrix occupies indices [0..2][0..2] at
  // offsets 0,1,2 / 4,5,6 / 8,9,10.
  const r00 = m[0], r01 = m[1], r02 = m[2];
  const r10 = m[4], r11 = m[5], r12 = m[6];
  const r20 = m[8], r21 = m[9], r22 = m[10];

  const sy = Math.sqrt(r00 * r00 + r10 * r10);
  const singular = sy < 1e-6;

  let yaw: number, pitch: number, roll: number;
  if (!singular) {
    pitch = Math.atan2(-r20, sy);
    yaw = Math.atan2(r10, r00);
    roll = Math.atan2(r21, r22);
  } else {
    pitch = Math.atan2(-r20, sy);
    yaw = 0;
    roll = Math.atan2(-r12, r11);
  }
  const toDeg = 180 / Math.PI;
  return { yaw: yaw * toDeg, pitch: pitch * toDeg, roll: roll * toDeg };
}

const SPEAKING_WINDOW_MS = 1000;
const SPEAKING_STD_THRESHOLD = 0.04;

/**
 * Fallback face pipeline — plain MediaPipe FaceLandmarker (blendshapes +
 * facial transformation matrix), self-hosted, used only when the primary
 * `vitalcamera-sdk` adapter fails to initialize (e.g. WebGL/SIMD
 * unavailable). Provides the same capability set for face-derived signals,
 * using a distinct expression vocabulary from vitalcamera-sdk's 8-class
 * emotion model — consumers should key off `source` to know which
 * vocabulary is active.
 */
export function createMediapipeFallbackAdapter(): SensorAdapter {
  const id = 'mediapipe-fallback';
  const capabilities: Capability[] = ['facialExpression', 'faceDetection', 'headPose', 'eyeState', 'speaking'];

  let landmarker: any = null;
  let rafId: number | null = null;
  let running = false;
  let ctxRef: AdapterContext | null = null;
  const jawOpenBuf: { t: number; v: number }[] = [];

  async function init(ctx: AdapterContext): Promise<Capability[]> {
    ctxRef = ctx;
    const vision = await import('@mediapipe/tasks-vision');
    const { FaceLandmarker, FilesetResolver } = vision;

    const filesetResolver = await FilesetResolver.forVisionTasks('/vendor/mediapipe-tasks-vision-0.10.21/wasm');

    const options = {
      baseOptions: { modelAssetPath: '/models/face_landmarker.task' },
      outputFaceBlendshapes: true,
      outputFacialTransformationMatrixes: true,
      runningMode: 'VIDEO' as const,
      numFaces: 1,
    };

    try {
      landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        ...options,
        baseOptions: { ...options.baseOptions, delegate: 'GPU' },
      });
    } catch {
      landmarker = await FaceLandmarker.createFromOptions(filesetResolver, options);
    }

    return capabilities;
  }

  function tick() {
    if (!running || !landmarker || !ctxRef) return;
    const video = ctxRef.video;

    if (video.readyState >= 2) {
      try {
        const result = landmarker.detectForVideo(video, performance.now());
        const found = result.faceLandmarks?.length > 0;

        if (!found) {
          ctxRef.report('faceDetection', null, { available: false, reason: 'no face detected' });
          ctxRef.report('facialExpression', null, { available: false, reason: 'no face detected' });
          ctxRef.report('eyeState', null, { available: false, reason: 'no face detected' });
          ctxRef.report('speaking', null, { available: false, reason: 'no face detected' });
          jawOpenBuf.length = 0;
        } else {
          const landmarks = result.faceLandmarks[0] as { x: number; y: number }[];
          const blend: Blend = result.faceBlendshapes?.[0]?.categories ?? [];

          let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity;
          for (const p of landmarks) {
            const px = p.x * video.videoWidth;
            const py = p.y * video.videoHeight;
            if (px < xMin) xMin = px;
            if (px > xMax) xMax = px;
            if (py < yMin) yMin = py;
            if (py > yMax) yMax = py;
          }
          ctxRef.report('faceDetection', { box: { x: xMin, y: yMin, w: xMax - xMin, h: yMax - yMin } });

          const { scores, dominant } = readExpressionScores(blend);
          ctxRef.report('facialExpression', { label: dominant, scores });

          const eyeBlinkL = blendScore(blend, ['eyeBlinkLeft']);
          const eyeBlinkR = blendScore(blend, ['eyeBlinkRight']);
          const leftProb = 1 - eyeBlinkL;
          const rightProb = 1 - eyeBlinkR;
          ctxRef.report('eyeState', {
            left: { prob: leftProb, open: leftProb >= 0.5 },
            right: { prob: rightProb, open: rightProb >= 0.5 },
            bothClosed: leftProb < 0.5 && rightProb < 0.5,
          });

          const jawOpen = blendScore(blend, ['jawOpen']);
          const now = performance.now();
          jawOpenBuf.push({ t: now, v: jawOpen });
          const cutoff = now - SPEAKING_WINDOW_MS;
          while (jawOpenBuf.length && jawOpenBuf[0].t < cutoff) jawOpenBuf.shift();
          let speaking = false;
          if (jawOpenBuf.length >= 5) {
            const mean = jawOpenBuf.reduce((a, e) => a + e.v, 0) / jawOpenBuf.length;
            const variance = jawOpenBuf.reduce((a, e) => a + (e.v - mean) ** 2, 0) / jawOpenBuf.length;
            speaking = Math.sqrt(variance) > SPEAKING_STD_THRESHOLD;
          }
          ctxRef.report('speaking', { jawOpen, speaking });

          const matrix = result.facialTransformationMatrixes?.[0]?.data as Float32Array | undefined;
          if (matrix) {
            ctxRef.report('headPose', eulerFromMatrix(matrix));
          } else {
            ctxRef.report('headPose', null, { available: false, reason: 'transformation matrix unavailable' });
          }
        }
      } catch (err) {
        ctxRef.onError(err instanceof Error ? err.message : String(err));
      }
    }

    rafId = requestAnimationFrame(tick);
  }

  function start() {
    if (running) return;
    running = true;
    rafId = requestAnimationFrame(tick);
  }

  function stop() {
    running = false;
    if (rafId != null) cancelAnimationFrame(rafId);
    rafId = null;
  }

  function destroy() {
    stop();
    landmarker?.close?.();
    landmarker = null;
    jawOpenBuf.length = 0;
  }

  return { id, capabilities, init, start, stop, destroy };
}
