"use client";

import React from 'react';
import { VisualMode, modeMeta } from '@/app/lib/designTokens';

interface LandingProps {
  onStart: () => void;
}

const examples: { mode: VisualMode; preview: string }[] = [
  { mode: 'focus', preview: 'Focus workspace' },
  { mode: 'calm', preview: 'Quiet chat' },
  { mode: 'night', preview: 'Night-study mode' },
  { mode: 'connect', preview: 'Warm social mode' },
];

export const Landing: React.FC<LandingProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <nav className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
          <span className="font-semibold text-gray-800 text-lg">EMOCEAN</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Private by default
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        <div className="max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Make your digital space
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
              feel more like you.
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-xl">
            Discover visual modes for focus, calm, warmth, and energy.
            Apply them to chat, websites, and your workspace.
          </p>

          <button
            onClick={onStart}
            className="inline-flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-xl text-lg font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20"
          >
            Find my visual style
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>

          <p className="mt-4 text-sm text-gray-500">
            No signup needed · Your choices stay local
          </p>
        </div>

        <div className="mt-20">
          <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-6">
            Examples
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {examples.map(({ mode, preview }) => {
              const meta = modeMeta[mode];
              return (
                <div
                  key={mode}
                  className="p-4 rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition-colors cursor-pointer group"
                >
                  <div className="text-2xl mb-2">{meta.icon}</div>
                  <p className="font-medium text-gray-800">{preview}</p>
                  <p className="text-sm text-gray-500 mt-1">{meta.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto px-6 py-8 border-t border-gray-100">
        <p className="text-sm text-gray-400 text-center">
          Camera data never leaves your device · No cloud accounts · Local result generation
        </p>
      </footer>
    </div>
  );
};
