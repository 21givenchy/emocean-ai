"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { VisualMode, VisualTokens, defaultTokens, modeMeta } from '@/app/lib/designTokens';

interface ThemeCandidate {
  id: string;
  name: string;
  description: string;
  tokens: VisualTokens;
}

interface AssessmentFlowProps {
  mode: VisualMode;
  onComplete: (profile: { mode: VisualMode; name: string; tokens: VisualTokens }) => void;
  onBack: () => void;
}

function generateThemeCandidates(mode: VisualMode): ThemeCandidate[] {
  const base = defaultTokens[mode];
  const candidates: ThemeCandidate[] = [];

  const variations = [
    { name: 'Ocean', accent: '#0EA5E9', desc: 'Cool blue tones' },
    { name: 'Forest', accent: '#22C55E', desc: 'Natural green hues' },
    { name: 'Sunset', accent: '#F59E0B', desc: 'Warm amber glow' },
    { name: 'Lavender', accent: '#A78BFA', desc: 'Soft purple mist' },
    { name: 'Coral', accent: '#FB7185', desc: 'Gentle pink warmth' },
    { name: 'Slate', accent: '#64748B', desc: 'Neutral clarity' },
    { name: 'Teal', accent: '#14B8A6', desc: 'Balanced calm' },
    { name: 'Indigo', accent: '#6366F1', desc: 'Deep focus' },
  ];

  variations.forEach((v, i) => {
    candidates.push({
      id: `${mode}-${i}`,
      name: `${v.name} ${modeMeta[mode].label}`,
      description: v.desc,
      tokens: {
        ...base,
        color: {
          ...base.color,
          accent: v.accent,
          outgoingBubble: v.accent,
        },
      },
    });
  });

  return candidates;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const sampleMessages = [
  { sender: 'other', text: 'Hey, are you ready to start?' },
  { sender: 'me', text: 'Yes, let me just grab my notes.' },
  { sender: 'other', text: 'Take your time. I\'ll be here.' },
  { sender: 'me', text: 'Okay, I\'m ready now.' },
  { sender: 'other', text: 'Great! Let\'s go through the plan.' },
];

export const AssessmentFlow: React.FC<AssessmentFlowProps> = ({ mode, onComplete, onBack }) => {
  const [candidates] = useState(() => shuffleArray(generateThemeCandidates(mode)));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [showPrompt, setShowPrompt] = useState(false);

  const current = candidates[currentIndex];
  const progress = ((currentIndex + 1) / candidates.length) * 100;

  useEffect(() => {
    const timer = setTimeout(() => setShowPrompt(true), 5000);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  const handleRate = useCallback((rating: number) => {
    setRatings((prev) => ({ ...prev, [current.id]: rating }));
    setShowPrompt(false);

    setTimeout(() => {
      if (currentIndex < candidates.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        const bestCandidate = candidates.reduce((best, c) => {
          const score = ratings[c.id] || 0;
          return score > (ratings[best.id] || 0) ? c : best;
        }, candidates[0]);
        onComplete({
          mode,
          name: bestCandidate.name,
          tokens: bestCandidate.tokens,
        });
      }
    }, 300);
  }, [currentIndex, candidates, ratings, mode, onComplete]);

  const handleSkip = useCallback(() => {
    setRatings((prev) => ({ ...prev, [current.id]: -1 }));
    setShowPrompt(false);

    setTimeout(() => {
      if (currentIndex < candidates.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        const rated = candidates.filter((c) => ratings[c.id] !== undefined && ratings[c.id] !== -1);
        const bestCandidate = rated.length > 0
          ? rated.reduce((best, c) => (ratings[c.id] > (ratings[best.id] || 0) ? c : best), rated[0])
          : candidates[0];
        onComplete({
          mode,
          name: bestCandidate.name,
          tokens: bestCandidate.tokens,
        });
      }
    }, 300);
  }, [currentIndex, candidates, ratings, mode, onComplete, current.id]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <nav className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <div className="text-sm text-gray-500">
          Building your {modeMeta[mode].label} mode · {currentIndex + 1}/{candidates.length}
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 pb-12">
        <div className="h-1 bg-gray-200 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-gray-900 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div
          className="rounded-2xl overflow-hidden shadow-xl border border-gray-200 mb-6"
          style={{
            backgroundColor: current.tokens.color.canvas,
            color: current.tokens.color.textPrimary,
          }}
        >
          <div
            className="px-4 py-3 border-b flex items-center justify-between"
            style={{ borderColor: current.tokens.color.border }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                style={{ backgroundColor: current.tokens.color.accent, color: current.tokens.color.accentText }}
              >
                A
              </div>
              <div>
                <p className="font-medium text-sm">Amina</p>
                <p className="text-xs opacity-60">Active now</p>
              </div>
            </div>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: current.tokens.color.surfaceRaised }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>
          </div>

          <div className="p-4 space-y-3" style={{ minHeight: '240px' }}>
            {sampleMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className="max-w-[75%] px-4 py-2 rounded-2xl text-sm"
                  style={{
                    backgroundColor: msg.sender === 'me'
                      ? current.tokens.color.outgoingBubble
                      : current.tokens.color.incomingBubble,
                    color: msg.sender === 'me'
                      ? current.tokens.color.outgoingBubbleText
                      : current.tokens.color.incomingBubbleText,
                    borderRadius: current.tokens.layout.radius === 'rounded' ? '1rem' : '0.5rem',
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div
            className="px-4 py-3 border-t"
            style={{ borderColor: current.tokens.color.border }}
          >
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm"
              style={{
                backgroundColor: current.tokens.color.surfaceRaised,
                color: current.tokens.color.textSecondary,
              }}
            >
              <span>Write a message...</span>
            </div>
          </div>
        </div>

        {showPrompt && (
          <div
            className="rounded-2xl p-6 text-center"
            style={{
              backgroundColor: current.tokens.color.surface,
              border: `1px solid ${current.tokens.color.border}`,
            }}
          >
            <p className="font-medium mb-4" style={{ color: current.tokens.color.textPrimary }}>
              How does this space feel?
            </p>
            <div className="flex justify-center gap-2 mb-4">
              {[
                { value: 1, label: 'Too much' },
                { value: 2, label: '' },
                { value: 3, label: '' },
                { value: 4, label: '' },
                { value: 5, label: 'Feels right' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => handleRate(value)}
                  className="w-10 h-10 rounded-full border-2 transition-all hover:scale-110"
                  style={{
                    borderColor: current.tokens.color.border,
                    backgroundColor: current.tokens.color.surfaceRaised,
                  }}
                >
                  {value}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs" style={{ color: current.tokens.color.textSecondary }}>
              <span>Too much</span>
              <span>Feels right</span>
            </div>
          </div>
        )}

        {!showPrompt && (
          <button
            onClick={handleSkip}
            className="w-full py-3 rounded-xl text-sm font-medium transition-colors"
            style={{
              backgroundColor: current.tokens.color.surface,
              color: current.tokens.color.textSecondary,
              border: `1px solid ${current.tokens.color.border}`,
            }}
          >
            Skip this one
          </button>
        )}
      </div>
    </div>
  );
};
