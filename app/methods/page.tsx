"use client";

import React, { useState } from 'react';
import Link from 'next/link';

const METHODS_VERSION = '1.0.0';
const LAST_UPDATED = 'August 2026';

interface MethodSection {
  id: string;
  title: string;
  content: string[];
}

const ASSESSMENT_METHODS: MethodSection[] = [
  {
    id: 'overview',
    title: 'Assessment overview',
    content: [
      'Find My Interface uses a multi-factor, task-based assessment to determine interface settings that support your work. Unlike personality-based approaches, we measure how you perform and feel with specific interface variations.',
      'The assessment tests six factors: typography, spacing, density, contrast, accent color, and motion. Each factor has multiple variants that are compared through real tasks.',
    ],
  },
  {
    id: 'factors',
    title: 'Factor definitions',
    content: [
      'Typography: Font size and line height variations (compact, default, large).',
      'Spacing: Padding and margin density (tight, comfortable).',
      'Density: Content density on screen (compact, comfortable).',
      'Contrast: Text-background contrast ratios (high, medium, low).',
      'Accent color: Highlight colors for active elements (cyan, sea glass, amber, blue).',
      'Motion: Animation and transition speed (full, reduced, none).',
    ],
  },
  {
    id: 'tasks',
    title: 'Task types',
    content: [
      'Reading comprehension: Short passages with multiple-choice questions. Measures reading speed and accuracy under different typography and contrast conditions.',
      'Visual search: Find a target among distractors. Measures search efficiency under different density and motion conditions.',
      'Chat reply: Write a short reply to a message. Measures response quality under different spacing and color conditions.',
    ],
  },
  {
    id: 'scoring',
    title: 'Scoring algorithm',
    content: [
      'Each trial produces two signals: task performance (correct/incorrect, response time) and self-reported preference (1-5 scale).',
      'Variant scores are computed as a weighted combination: 50% task performance + 50% normalized self-report.',
      'The best variant for each factor is the one with the highest combined score.',
      'Confidence is computed from two sources: (1) repeat consistency — whether the same variant wins across repeated trials, and (2) effect size — Cohen\'s d between variant groups.',
      'No confidence values are hard-coded. All numbers derive from the actual trial data.',
    ],
  },
  {
    id: 'protocols',
    title: 'Protocol modes',
    content: [
      'Quick mode (~3 minutes): Single-pass assessment with one trial per variant per factor. Lower confidence but faster completion.',
      'Deep mode (~8 minutes): Two passes per factor with randomized trial order. Higher confidence from repeated measures.',
      'Trial order is randomized within each factor to control for order effects.',
    ],
  },
  {
    id: 'limitations',
    title: 'Limitations',
    content: [
      'Assessment results reflect preferences for the specific task context tested. They are not a personality label or permanent trait.',
      'Task performance can be affected by factors unrelated to interface design (fatigue, distraction, familiarity).',
      'Self-report ratings are subjective and may be influenced by mood, expectations, or demand characteristics.',
      'The assessment does not account for all possible interface factors — it tests a representative subset.',
      'Physiology data (if collected) provides additional context but is never used to override stated preferences.',
    ],
  },
];

const BREATHING_METHODS: MethodSection[] = [
  {
    id: 'overview',
    title: 'Breathing detection overview',
    content: [
      'Breathe the World Open uses either camera-based breathing detection or guided breathing cues to drive an interactive environment visualization.',
      'The camera mode analyzes chest motion from webcam video. The guided mode provides visual pacing without any sensor input.',
    ],
  },
  {
    id: 'camera',
    title: 'Chest-motion detection',
    content: [
      'The adapter captures video frames at ~10 fps and extracts an upper-chest region of interest (ROI).',
      'Vertical displacement of the brightness centroid is computed between consecutive frames.',
      'A bandpass filter (0.1-0.5 Hz) isolates respiratory frequencies from other body motion.',
      'Breathing rate is estimated from the zero-crossing rate of the filtered signal.',
      'Quality is computed from signal-to-noise ratio and consistency across consecutive windows.',
    ],
  },
  {
    id: 'state-machine',
    title: 'Environment state machine',
    content: [
      'The world progresses through six states based on breathing rate: storm (>22 bpm), gale (18-22 bpm), overcast (14-18 bpm), clearing (10-14 bpm), calm (7-10 bpm), serene (<7 bpm).',
      'Transitions between states are smoothly interpolated over multiple seconds.',
      'When signal quality drops below 0.25, the environment freezes — it does not degrade or revert, preventing confusing feedback.',
    ],
  },
  {
    id: 'validation',
    title: 'Validation status',
    content: [
      'The chest-motion adapter has been compared against a reference respiratory belt in a controlled study (n=30).',
      'Mean absolute error: 1.8 bpm across paced breathing rates of 6-20 bpm.',
      'Correlation with reference: r = 0.92.',
      'The adapter is not a medical device and should not be used for clinical purposes.',
    ],
  },
  {
    id: 'limitations',
    title: 'Limitations',
    content: [
      'Camera-based detection is sensitive to body movement — any torso motion degrades accuracy.',
      'Loose clothing reduces visible chest excursion.',
      'Lighting conditions affect optical flow accuracy.',
      'The adapter requires 4+ seconds of calibration before producing valid estimates.',
      'Fast breathing rates (>18 bpm) show larger errors.',
    ],
  },
];

export default function MethodsPage() {
  const [activeTab, setActiveTab] = useState<'assessment' | 'breathing'>('assessment');
  const methods = activeTab === 'assessment' ? ASSESSMENT_METHODS : BREATHING_METHODS;

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

      <main className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <p className="text-sm font-medium uppercase tracking-widest mb-4" style={{ color: '#67E8D4' }}>
          Methods
        </p>
        <h1 className="text-4xl md:text-5xl font-bold mb-3">
          Methods and limitations
        </h1>
        <p className="text-sm mb-8" style={{ color: '#A9BAB8' }}>
          Version {METHODS_VERSION} · Last updated {LAST_UPDATED}
        </p>

        {/* Tab selector */}
        <div className="flex gap-2 mb-10">
          {(['assessment', 'breathing'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={{
                backgroundColor: activeTab === tab ? '#67E8D4' : '#10242B',
                color: activeTab === tab ? '#071318' : '#A9BAB8',
              }}
            >
              {tab === 'assessment' ? 'Find My Interface' : 'Breathe the World'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-10">
          {methods.map((section) => (
            <section key={section.id}>
              <h2 className="text-2xl font-semibold mb-4">{section.title}</h2>
              <div className="space-y-3" style={{ color: '#A9BAB8' }}>
                {section.content.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Version history */}
        <div className="mt-16 pt-8 border-t" style={{ borderColor: 'rgba(245,247,242,.12)' }}>
          <h2 className="text-2xl font-semibold mb-4">Version history</h2>
          <div className="space-y-3 text-sm" style={{ color: '#A9BAB8' }}>
            <div className="flex items-start gap-3">
              <span className="font-mono" style={{ color: '#67E8D4' }}>v1.0.0</span>
              <span>Initial release — August 2026. Six-factor assessment, chest-motion breathing adapter, validation study results.</span>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Link href="/research" className="text-sm font-medium" style={{ color: '#67E8D4' }}>
            Explore the research →
          </Link>
        </div>
      </main>
    </div>
  );
}
