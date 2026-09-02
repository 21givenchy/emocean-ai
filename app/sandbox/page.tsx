"use client";

import React, { useState } from 'react';
import Link from 'next/link';

type Tab = 'overview' | 'sensorhub' | 'assessment' | 'breathing' | 'export';

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'sensorhub', label: 'SensorHub' },
  { id: 'assessment', label: 'Assessment' },
  { id: 'breathing', label: 'Breathing' },
  { id: 'export', label: 'Export' },
];

const CODE_EXAMPLES: Record<Tab, { title: string; description: string; code: string }[]> = {
  overview: [
    {
      title: 'Architecture',
      description: 'EMOCEAN is built as a modular sensor pipeline with pluggable adapters, a unified snapshot interface, and framework-agnostic assessment and breathing libraries.',
      code: `// Core modules
import { createDefaultSensorHub } from './lib/sensors';
import { generateProtocol, scoreAssessment } from './lib/assessment/engine';
import { BreathingStateMachine } from './lib/breathe/stateMachine';

// 1. Create sensor hub
const hub = createDefaultSensorHub({ video, onSnapshotChange });

// 2. Generate assessment protocol
const protocol = generateProtocol('quick'); // or 'deep'

// 3. Score results
const score = scoreAssessment(trialResults);

// 4. Drive breathing world
const stateMachine = new BreathingStateMachine();
const worldState = stateMachine.update(breathRate, quality);`,
    },
    {
      title: 'TypeScript types',
      description: 'All modules are fully typed. Key types include SensorSnapshot, VisualTokens, TrialResult, WorldState, and SessionExport.',
      code: `import type { SensorSnapshot } from './lib/sensors/types';
import type { VisualTokens } from './lib/designTokens';
import type { TrialResult, AssessmentScore } from './lib/assessment/engine';
import type { WorldState } from './lib/breathe/stateMachine';
import type { SessionExport } from './lib/consent';`,
    },
  ],
  sensorhub: [
    {
      title: 'Initializing the hub',
      description: 'Create a sensor hub with a video element and optional simulation mode.',
      code: `import { createDefaultSensorHub } from './lib/sensors';

const video = document.querySelector('video');
const hub = createDefaultSensorHub({
  video,
  allowSimulation: false, // true only in dev with env vars
  onStatusChange: (status) => console.log('Status:', status),
  onSnapshotChange: (snapshot) => {
    // Heart rate
    if (snapshot.heartRate.available) {
      console.log('HR:', snapshot.heartRate.value, 'bpm');
    }
    // Respiration (chest-motion or BVP-derived)
    if (snapshot.respiration.available) {
      console.log('Breath:', snapshot.respiration.value, 'bpm');
    }
    // Movement stability (observable motion, 0-1)
    if (snapshot.movementStability.available) {
      console.log('Stability:', snapshot.movementStability.value.score);
    }
  },
});

await hub.start();`,
    },
    {
      title: 'Available adapters',
      description: 'Adapters are priority-ordered. The first successful adapter for each capability wins.',
      code: `// Adapter registry (priority order)
const registry = {
  heartRate: ['vitalcamera-sdk', 'green-channel-rppg'],
  bvp: ['vitalcamera-sdk', 'green-channel-rppg'],
  prv: ['vitalcamera-sdk', 'green-channel-rppg'],
  respiration: ['chest-motion-respiration', 'respiration-derived'],
  movementStability: ['movement-stability-derived'],
  faceDetection: ['vitalcamera-sdk', 'mediapipe-fallback'],
  // ... more capabilities
};`,
    },
    {
      title: 'Reading the snapshot',
      description: 'Every field follows the SensorField<T> pattern: value, available, source, timestamp.',
      code: `interface SensorField<T> {
  value: T | null;
  available: boolean;
  reason?: string;     // why unavailable
  source: string;      // adapter id
  derived?: boolean;   // computed from another signal
  timestamp: number;
}

// Example: check quality before using a value
if (snapshot.respiration.available && snapshot.respiration.derived === false) {
  // Direct chest-motion measurement
  useBreathingRate(snapshot.respiration.value);
}`,
    },
  ],
  assessment: [
    {
      title: 'Generating a protocol',
      description: 'Create a randomized assessment protocol with quick or deep mode.',
      code: `import { generateProtocol, FACTORS } from './lib/assessment/engine';

// Quick: 1 pass, ~3 minutes
const quick = generateProtocol('quick');
console.log(quick.trials.length, 'trials');
console.log(quick.factorOrder); // randomized factor order

// Deep: 2 passes, ~8 minutes
const deep = generateProtocol('deep');
console.log(deep.trials.length, 'trials');

// Each trial has:
// { id, factorId, variantId, taskId, repeatIndex }`,
    },
    {
      title: 'Applying variants',
      description: 'Transform default tokens based on a variant ID.',
      code: `import { applyVariant, defaultTokens } from './lib/assessment/engine';

// Apply a specific variant
const tokens = applyVariant(defaultTokens.focus, 'type-large');
// tokens.typography.scale === 'large'

// Apply sequentially for multi-factor results
let best = defaultTokens.focus;
best = applyVariant(best, 'type-large');
best = applyVariant(best, 'space-comfortable');
best = applyVariant(best, 'contrast-high');
best = applyVariant(best, 'color-cyan');
best = applyVariant(best, 'motion-reduced');`,
    },
    {
      title: 'Scoring results',
      description: 'Compute scores from trial results with effect-size-based confidence.',
      code: `import { scoreAssessment } from './lib/assessment/engine';

const score = scoreAssessment(trialResults);

// Per-factor breakdown
score.factorScores.forEach(fs => {
  console.log(fs.factorId, ':', fs.bestVariantId);
  console.log('  Confidence:', Math.round(fs.confidence * 100) + '%');
  console.log('  Variant scores:', fs.variantScores);
});

// Overall
console.log('Overall confidence:', score.overallConfidence);
console.log('Recommendation:', score.recommendation);
// { typography: 'type-large', contrast: 'contrast-high', ... }`,
    },
    {
      title: 'Export formats',
      description: 'Export tokens as CSS variables, JSON, or flat key-value pairs.',
      code: `import { tokensToCSS, tokensToJSON } from './lib/assessment/engine';

// CSS custom properties
const css = tokensToCSS(bestTokens);
// :root { --canvas: #071318; --accent: #67E8D4; ... }

// Versioned JSON
const json = tokensToJSON(bestTokens, '1.0.0');
// { version: "1.0.0", exportedAt: "...", tokens: { ... } }`,
    },
  ],
  breathing: [
    {
      title: 'State machine',
      description: 'Map breathing rate to world states with smooth interpolation.',
      code: `import { BreathingStateMachine } from './lib/breathe/stateMachine';

const sm = new BreathingStateMachine((newState) => {
  console.log('World state:', newState.label);
  // 'Storm' → 'Gale' → 'Overcast' → 'Clearing' → 'Calm' → 'Serene'
});

// Update at ~2Hz with breathing data
const worldState = sm.update(breathRate, quality);

// Access current visual parameters
console.log(worldState.sky.top);        // gradient color
console.log(worldState.clouds.opacity); // 0-1
console.log(worldState.water.roughness);// 0-1
console.log(worldState.wind.strength);  // 0-1
console.log(worldState.threats.visible); // boolean

// Quality gating
if (sm.isFrozen()) {
  // Signal is poor — don't update the UI
}`,
    },
    {
      title: 'BPM thresholds',
      description: 'How breathing rate maps to world states.',
      code: `// State transitions
const BPM_THRESHOLDS = [
  { bpm: 22, stateId: 'storm' },    // fast/irregular
  { bpm: 18, stateId: 'gale' },     // slowing
  { bpm: 14, stateId: 'overcast' }, // steady emerging
  { bpm: 10, stateId: 'clearing' }, // calm and rhythmic
  { bpm: 7,  stateId: 'calm' },     // slow and deep
  { bpm: 0,  stateId: 'serene' },   // sustained deep breathing
];`,
    },
  ],
  export: [
    {
      title: 'Session export',
      description: 'Export session data as a versioned JSON file.',
      code: `import { exportAssessmentSession, downloadExport } from './lib/consent';

const data = exportAssessmentSession({
  sessionId: '1234567890',
  mode: 'focus',
  assessmentMode: 'deep',
  results: trialResults,
  score: assessmentScore,
  tokens: bestTokens,
});

// Download as JSON file
downloadExport(data);
// File: emocean-assessment-1234567890.json`,
    },
    {
      title: 'Consent management',
      description: 'Manage research participation consent.',
      code: `import { grantConsent, hasConsent, withdrawConsent, getConsent } from './lib/consent';

// Grant consent
const record = grantConsent('both'); // 'assessment' | 'breathing' | 'both'
console.log(record.participantId); // random, not linked to identity

// Check consent
if (hasConsent()) {
  // User has opted in
}

// Withdraw (revocable)
withdrawConsent();`,
    },
    {
      title: 'JSON structure',
      description: 'The exported session file structure.',
      code: `{
  "exportVersion": "1.0.0",
  "exportedAt": "2026-08-16T12:00:00Z",
  "sessionId": "1234567890",
  "participantId": "a1b2c3d4...",
  "experimentType": "assessment",  // or "breathing"
  "experimentMode": "deep",
  "protocol": { ... },
  "trials": [
    {
      "trialId": "typography-type-large-r0",
      "factorId": "typography",
      "variantId": "type-large",
      "taskId": "reading",
      "repeatIndex": 0,
      "skipped": false,
      "taskMetrics": { "correct": true, "responseTimeMs": 4200 },
      "selfReport": 4,
      "timestamp": 1723824000000
    }
  ],
  "metadata": {
    "userAgent": "...",
    "screenResolution": "1920x1080",
    "timezone": "America/New_York",
    "version": "1.0.0"
  }
}`,
    },
  ],
};

export default function SandboxPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#071318', color: '#F5F7F2' }}>
      <nav className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#67E8D4' }}>
            <svg className="w-6 h-6" fill="none" stroke="#071318" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
          <span className="font-semibold text-lg">EMOCEAN</span>
        </Link>
        <Link
          href="/lab"
          className="px-5 py-2.5 rounded-full text-sm font-medium transition-colors"
          style={{ backgroundColor: '#67E8D4', color: '#071318' }}
        >
          Enter the lab
        </Link>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12 md:py-20">
        <p className="text-sm font-medium uppercase tracking-widest mb-4" style={{ color: '#67E8D4' }}>
          Developer sandbox
        </p>
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Integration guide
        </h1>
        <p className="text-lg mb-10 max-w-2xl" style={{ color: '#A9BAB8' }}>
          EMOCEAN exposes modular libraries you can integrate into your own products. Use the sensor pipeline for real-time physiology, the assessment engine for adaptive UI testing, or the breathing state machine for biofeedback experiences.
        </p>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-10 border-b pb-4" style={{ borderColor: 'rgba(245,247,242,.12)' }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: activeTab === tab.id ? '#67E8D4' : 'transparent',
                color: activeTab === tab.id ? '#071318' : '#A9BAB8',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Code examples */}
        <div className="space-y-8">
          {CODE_EXAMPLES[activeTab].map((example, i) => (
            <div key={i} className="rounded-2xl border overflow-hidden" style={{ backgroundColor: '#10242B', borderColor: 'rgba(245,247,242,.12)' }}>
              <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(245,247,242,.12)' }}>
                <h3 className="font-semibold">{example.title}</h3>
                <p className="text-sm mt-1" style={{ color: '#A9BAB8' }}>{example.description}</p>
              </div>
              <div className="relative">
                <pre className="p-6 overflow-x-auto text-sm font-mono leading-relaxed" style={{ color: '#A9BAB8' }}>
                  <code>{example.code}</code>
                </pre>
                <button
                  onClick={() => handleCopy(example.code, i)}
                  className="absolute top-3 right-3 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: copiedIndex === i ? '#67E8D4' : 'rgba(245,247,242,0.1)',
                    color: copiedIndex === i ? '#071318' : '#A9BAB8',
                  }}
                >
                  {copiedIndex === i ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Links */}
        <div className="mt-12 p-6 rounded-2xl border" style={{ backgroundColor: '#10242B', borderColor: 'rgba(245,247,242,.12)' }}>
          <h3 className="font-semibold mb-3">Next steps</h3>
          <div className="space-y-2 text-sm" style={{ color: '#A9BAB8' }}>
            <p>· Read the <Link href="/methods" className="underline" style={{ color: '#67E8D4' }}>methods and limitations</Link> page for scientific details</p>
            <p>· Check the <Link href="/research" className="underline" style={{ color: '#67E8D4' }}>research</Link> page for published findings</p>
            <p>· <Link href="/for-teams" className="underline" style={{ color: '#67E8D4' }}>Talk to the lab</Link> about integration partnerships</p>
          </div>
        </div>
      </main>
    </div>
  );
}
