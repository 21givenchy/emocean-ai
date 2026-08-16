import type { AdapterContext, Capability, SensorAdapter } from '../types';

/**
 * Primary rPPG/face adapter — wraps `vitalcamera-sdk` (FacePhys-based),
 * pinned to an exact reviewed version in package.json. Runs entirely
 * on-device (no network calls once models/wasm are loaded from
 * self-hosted paths). Manual mode is used ("you control the camera")
 * because SensorHub owns a single shared `<video>` element that other
 * adapters (movement/respiration) also read from.
 */
export function createVitalCameraAdapter(): SensorAdapter {
  const id = 'vitalcamera-sdk';
  const declaredCapabilities: Capability[] = [
    'heartRate',
    'bvp',
    'beatIntervals',
    'signalQuality',
    'prv',
    'facialExpression',
    'faceDetection',
    'headPose',
    'eyeState',
    'gaze',
    'speaking',
  ];

  let browserAdapter: any = null;
  let rafId: number | null = null;
  let running = false;
  let ctxRef: AdapterContext | null = null;
  const ibiBuffer: number[] = [];
  const bvpBuffer: number[] = [];
  const IBI_WINDOW = 50;
  const BVP_WINDOW = 300;

  async function init(ctx: AdapterContext): Promise<Capability[]> {
    ctxRef = ctx;
    const { BrowserAdapter } = await import('vitalcamera-sdk/adapter').then(
      (m) => ({ BrowserAdapter: (m as any).default ?? m })
    );

    const modelBase = '/models/vitalcamera/';
    const runtimeBaseUrls = {
      litert: '/vendor/litertjs-core-0.2.1/',
      mediapipe: '/vendor/mediapipe-tasks-vision-0.10.21/',
    };
    // Explicit workerBasePath — without this the SDK falls back to fetching
    // worker source relative to its own bundled module URL (import.meta.url),
    // which under Next.js/Turbopack points at a build chunk, not a real
    // static path. Self-hosted worker sources live here (see
    // scripts/copy-sensor-assets.mjs).
    const workerBasePath = '/vendor/vitalcamera-sdk-0.6.9/workers/';

    let models: Record<string, ArrayBuffer>;
    let faceLandmarkerEnabled = true;
    let emotionEnabled = true;
    let gazeEnabled = true;

    try {
      models = await BrowserAdapter.loadModels(modelBase);
    } catch (err) {
      // Degrade gracefully: retry with only the required rPPG/HRV models
      // so heart rate still works even if optional assets are missing.
      ctx.onError(`optional model load failed, retrying rPPG-only: ${err instanceof Error ? err.message : String(err)}`);
      faceLandmarkerEnabled = false;
      emotionEnabled = false;
      gazeEnabled = false;
      models = await BrowserAdapter.loadModels(modelBase, {
        emotion: false,
        gaze: false,
        faceLandmarker: false,
      });
    }

    browserAdapter = new BrowserAdapter({
      models,
      runtimeBaseUrls,
      workerBasePath,
      vitalcameraConfig: {
        enableFaceLandmarker: faceLandmarkerEnabled,
        enableEyeState: faceLandmarkerEnabled,
        enableMouth: faceLandmarkerEnabled,
        enableGaze: faceLandmarkerEnabled && gazeEnabled,
        enableEmotion: emotionEnabled,
        enableHeadPose: true,
        enableHrv: true,
      },
    });

    await browserAdapter.init();

    const vc = browserAdapter.vitalcamera;

    vc.on('heartrate', ({ hr, sqi }: { hr: number; sqi: number }) => {
      ctx.report('heartRate', hr, { available: Number.isFinite(hr) });
      ctx.report('signalQuality', sqi, { available: Number.isFinite(sqi) });
    });

    vc.on('bvp', ({ value }: { value: number }) => {
      bvpBuffer.push(value);
      if (bvpBuffer.length > BVP_WINDOW) bvpBuffer.shift();
      ctx.report('bvp', [...bvpBuffer]);
    });

    vc.on('beat', ({ ibi }: { ibi: number }) => {
      ibiBuffer.push(ibi);
      if (ibiBuffer.length > IBI_WINDOW) ibiBuffer.shift();
      ctx.report('beatIntervals', [...ibiBuffer]);
    });

    vc.on('hrv', (data: { rmssd: number | null; sdnn: number | null; meanRR: number | null; n: number; reject: string | null }) => {
      if (data.rmssd == null || data.reject) {
        ctx.report('prv', null, { available: false, reason: data.reject ?? 'insufficient data' });
        return;
      }
      ctx.report('prv', { rmssd: data.rmssd, sdnn: data.sdnn as number, meanRR: data.meanRR as number, n: data.n });
    });

    vc.on('emotion', ({ emotion, probs }: { emotion: string; probs: number[] }) => {
      if (!emotion) {
        ctx.report('facialExpression', null, { available: false, reason: 'no face detected' });
        return;
      }
      const labels: string[] = (browserAdapter.constructor as any).EMOTION_LABELS ?? [];
      const scores: Record<string, number> = {};
      labels.forEach((label, i) => {
        scores[label] = probs[i] ?? 0;
      });
      ctx.report('facialExpression', { label: emotion, scores });
    });

    vc.on('gaze', ({ yaw, pitch, confidence }: { yaw: number; pitch: number; confidence: number[] | null }) => {
      ctx.report('gaze', { yaw, pitch, confidence: confidence ? Math.min(...confidence) : null });
    });

    vc.on('eyestate', (data: { left: { prob: number; open: boolean }; right: { prob: number; open: boolean }; bothClosed: boolean }) => {
      ctx.report('eyeState', { left: data.left, right: data.right, bothClosed: data.bothClosed });
    });

    vc.on('mouth', ({ jawOpen, speaking }: { jawOpen: number; speaking: boolean }) => {
      ctx.report('speaking', { jawOpen, speaking });
    });

    vc.on('headpose', ({ yaw, pitch, roll }: { yaw: number; pitch: number; roll: number }) => {
      ctx.report('headPose', { yaw, pitch, roll });
    });

    vc.on('face', (data: { detected: boolean; box: { x: number; y: number; w: number; h: number } | null; keypoints: { x: number; y: number }[] | null }) => {
      if (!data.detected || !data.box) {
        ctx.report('faceDetection', null, { available: false, reason: 'no face detected' });
        return;
      }
      ctx.report('faceDetection', { box: data.box, keypoints: data.keypoints ?? undefined });
    });

    vc.on('error', ({ source, message }: { source: string; message: string }) => {
      ctx.onError(`${source}: ${message}`);
      if (source === 'faceLandmarker') {
        ctx.report('eyeState', null, { available: false, reason: 'face landmarker unavailable' });
        ctx.report('speaking', null, { available: false, reason: 'face landmarker unavailable' });
        ctx.report('gaze', null, { available: false, reason: 'face landmarker unavailable' });
      }
    });

    const activated: Capability[] = ['heartRate', 'bvp', 'beatIntervals', 'signalQuality', 'prv', 'headPose', 'faceDetection'];
    if (emotionEnabled) activated.push('facialExpression');
    if (faceLandmarkerEnabled) {
      activated.push('eyeState', 'speaking');
      if (gazeEnabled) activated.push('gaze');
    }
    return activated;
  }

  function tick() {
    if (!running || !browserAdapter || !ctxRef) return;
    browserAdapter.processVideoFrame(ctxRef.video);
    rafId = requestAnimationFrame(tick);
  }

  function start() {
    if (running || !browserAdapter) return;
    running = true;
    browserAdapter.vitalcamera.start();
    rafId = requestAnimationFrame(tick);
  }

  function stop() {
    running = false;
    if (rafId != null) cancelAnimationFrame(rafId);
    rafId = null;
    browserAdapter?.vitalcamera?.stop();
  }

  function destroy() {
    stop();
    browserAdapter?.destroy?.();
    browserAdapter = null;
    ibiBuffer.length = 0;
    bvpBuffer.length = 0;
  }

  return { id, capabilities: declaredCapabilities, init, start, stop, destroy };
}
