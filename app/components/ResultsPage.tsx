"use client";

import React, { useState } from 'react';
import { modeMeta } from '@/app/lib/designTokens';
import type { VisualMode, VisualTokens } from '@/app/lib/designTokens';

interface ResultsPageProps {
  mode: VisualMode;
  name: string;
  tokens: VisualTokens;
  onSave: () => void;
  onMyModes: () => void;
}

const sampleConversation = [
  { sender: 'other', text: 'Hey! How are you doing today?' },
  { sender: 'me', text: 'Pretty good, just finishing up some work.' },
  { sender: 'other', text: 'Nice! Want to grab coffee later?' },
  { sender: 'me', text: 'Sounds great, let me know when you\'re free.' },
];

export const ResultsPage: React.FC<ResultsPageProps> = ({
  mode,
  name,
  tokens,
  onSave,
  onMyModes,
}) => {
  const [copied, setCopied] = useState(false);
  const meta = modeMeta[mode];

  const handleCopyPalette = () => {
    const palette = `Background: ${tokens.color.canvas}\nSurface: ${tokens.color.surface}\nText: ${tokens.color.textPrimary}\nAccent: ${tokens.color.accent}`;
    navigator.clipboard.writeText(palette);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCSS = () => {
    const css = `:root {
  --canvas: ${tokens.color.canvas};
  --surface: ${tokens.color.surface};
  --text-primary: ${tokens.color.textPrimary};
  --text-secondary: ${tokens.color.textSecondary};
  --accent: ${tokens.color.accent};
  --border: ${tokens.color.border};
}`;
    navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <nav className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <button
          onClick={onMyModes}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          My modes
        </button>
        <span className="text-sm text-gray-500">Your visual profile</span>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
            Your {meta.label} mode is ready
          </p>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">{name}</h1>
          <p className="text-lg text-gray-600">{meta.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200">
            <div
              className="px-4 py-3 border-b flex items-center gap-3"
              style={{
                backgroundColor: tokens.color.surface,
                borderColor: tokens.color.border,
              }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                style={{ backgroundColor: tokens.color.accent, color: tokens.color.accentText }}
              >
                A
              </div>
              <div style={{ color: tokens.color.textPrimary }}>
                <p className="font-medium text-sm">Amina</p>
                <p className="text-xs" style={{ color: tokens.color.textSecondary }}>Active now</p>
              </div>
            </div>

            <div
              className="p-4 space-y-3"
              style={{ backgroundColor: tokens.color.canvas, minHeight: '280px' }}
            >
              {sampleConversation.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className="max-w-[75%] px-4 py-2 text-sm"
                    style={{
                      backgroundColor: msg.sender === 'me'
                        ? tokens.color.outgoingBubble
                        : tokens.color.incomingBubble,
                      color: msg.sender === 'me'
                        ? tokens.color.outgoingBubbleText
                        : tokens.color.incomingBubbleText,
                      borderRadius: '1rem',
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div
              className="px-4 py-3 border-t"
              style={{
                backgroundColor: tokens.color.surface,
                borderColor: tokens.color.border,
              }}
            >
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm"
                style={{
                  backgroundColor: tokens.color.surfaceRaised,
                  color: tokens.color.textSecondary,
                }}
              >
                Write a message...
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl p-6 border border-gray-200 bg-white">
              <h3 className="font-semibold text-gray-800 mb-4">Your palette</h3>
              <div className="space-y-3">
                {[
                  { label: 'Background', color: tokens.color.canvas },
                  { label: 'Surface', color: tokens.color.surface },
                  { label: 'Text', color: tokens.color.textPrimary },
                  { label: 'Accent', color: tokens.color.accent },
                ].map(({ label, color }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg border border-gray-200"
                      style={{ backgroundColor: color }}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-700">{label}</p>
                      <p className="text-xs text-gray-500 font-mono">{color}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-6 border border-gray-200 bg-white">
              <h3 className="font-semibold text-gray-800 mb-4">Match confidence</h3>
              <p className="text-sm text-gray-500 italic">
                Complete the full assessment to see your match confidence based on repeated within-person evidence.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 justify-center mb-12">
          <button
            onClick={onSave}
            className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Save mode
          </button>
          <button
            onClick={handleCopyPalette}
            className="flex items-center gap-2 border border-gray-300 px-6 py-3 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {copied ? 'Copied!' : 'Copy palette'}
          </button>
          <button
            onClick={handleCopyCSS}
            className="flex items-center gap-2 border border-gray-300 px-6 py-3 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            View CSS
          </button>
        </div>

        <div className="text-center">
          <button
            onClick={onMyModes}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Go to My Modes →
          </button>
        </div>
      </main>
    </div>
  );
};
