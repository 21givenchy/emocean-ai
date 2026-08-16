"use client";

import React, { useState } from 'react';
import { VisualMode, modeMeta } from '@/app/lib/designTokens';
import { AssessmentMode } from '@/app/lib/assessment/engine';

interface IntentSelectProps {
  onSelect: (mode: VisualMode, assessmentMode: AssessmentMode) => void;
  onBack: () => void;
}

const intents: VisualMode[] = ['focus', 'calm', 'create', 'connect'];

export const IntentSelect: React.FC<IntentSelectProps> = ({ onSelect, onBack }) => {
  const [selectedMode, setSelectedMode] = useState<VisualMode | null>(null);
  const [assessmentMode, setAssessmentMode] = useState<AssessmentMode>('quick');

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: '#071318', color: '#F5F7F2' }}>
      <div className="max-w-lg w-full">
        <button
          onClick={onBack}
          className="mb-8 flex items-center gap-2 text-sm transition-colors"
          style={{ color: '#A9BAB8' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <h2 className="text-3xl font-bold mb-3">
          What do you want your space to help with?
        </h2>
        <p className="mb-8" style={{ color: '#A9BAB8' }}>
          Choose an intent, then decide how thoroughly to assess it.
        </p>

        {/* Intent selection */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {intents.map((mode) => {
            const meta = modeMeta[mode];
            const isSelected = selectedMode === mode;
            return (
              <button
                key={mode}
                onClick={() => setSelectedMode(mode)}
                className="p-6 rounded-2xl border-2 text-left transition-all"
                style={{
                  borderColor: isSelected ? '#67E8D4' : 'rgba(245,247,242,.12)',
                  backgroundColor: isSelected ? '#67E8D410' : '#10242B',
                }}
              >
                <div className="text-3xl mb-3">{meta.icon}</div>
                <p className="font-semibold text-lg">{meta.label}</p>
                <p className="text-sm mt-1" style={{ color: '#A9BAB8' }}>{meta.description}</p>
              </button>
            );
          })}
        </div>

        {/* Assessment mode */}
        {selectedMode && (
          <div className="mb-8">
            <p className="text-sm font-medium mb-3" style={{ color: '#A9BAB8' }}>
              How thorough?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setAssessmentMode('quick')}
                className="p-4 rounded-xl border-2 text-left transition-all"
                style={{
                  borderColor: assessmentMode === 'quick' ? '#67E8D4' : 'rgba(245,247,242,.12)',
                  backgroundColor: assessmentMode === 'quick' ? '#67E8D410' : '#10242B',
                }}
              >
                <p className="font-medium">Quick</p>
                <p className="text-xs mt-1" style={{ color: '#A9BAB8' }}>~3 min · Single pass</p>
              </button>
              <button
                onClick={() => setAssessmentMode('deep')}
                className="p-4 rounded-xl border-2 text-left transition-all"
                style={{
                  borderColor: assessmentMode === 'deep' ? '#67E8D4' : 'rgba(245,247,242,.12)',
                  backgroundColor: assessmentMode === 'deep' ? '#67E8D410' : '#10242B',
                }}
              >
                <p className="font-medium">Deep</p>
                <p className="text-xs mt-1" style={{ color: '#A9BAB8' }}>~8 min · Repeated trials, higher confidence</p>
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => selectedMode && onSelect(selectedMode, assessmentMode)}
          disabled={!selectedMode}
          className="w-full py-4 rounded-xl text-lg font-medium transition-all"
          style={{
            backgroundColor: selectedMode ? '#67E8D4' : '#10242B',
            color: selectedMode ? '#071318' : '#A9BAB8',
          }}
        >
          Begin assessment
        </button>
      </div>
    </div>
  );
};
