"use client";

import React, { useState } from 'react';
import { VisualMode, modeMeta } from '@/app/lib/designTokens';

interface IntentSelectProps {
  onSelect: (mode: VisualMode) => void;
  onBack: () => void;
}

const intents: VisualMode[] = ['focus', 'calm', 'create', 'connect'];

export const IntentSelect: React.FC<IntentSelectProps> = ({ onSelect, onBack }) => {
  const [selected, setSelected] = useState<VisualMode | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-6">
      <div className="max-w-lg w-full">
        <button
          onClick={onBack}
          className="mb-8 flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          What do you want your space to help with today?
        </h2>
        <p className="text-gray-600 mb-8">
          Choose an intent. You can create more modes later.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {intents.map((mode) => {
            const meta = modeMeta[mode];
            const isSelected = selected === mode;
            return (
              <button
                key={mode}
                onClick={() => setSelected(mode)}
                className={`p-6 rounded-2xl border-2 text-left transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className="text-3xl mb-3">{meta.icon}</div>
                <p className="font-semibold text-gray-800 text-lg">{meta.label}</p>
                <p className="text-sm text-gray-500 mt-1">{meta.description}</p>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => selected && onSelect(selected)}
          disabled={!selected}
          className={`w-full py-4 rounded-xl text-lg font-medium transition-all ${
            selected
              ? 'bg-gray-900 text-white hover:bg-gray-800 shadow-lg shadow-gray-900/20'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
};
