"use client";

import React, { useState, useEffect } from 'react';

type ColorPreference = 'cool' | 'warm' | 'neutral' | 'vibrant' | 'muted';

const PREFERENCE_QUESTIONS = [
  {
    id: '1',
    question: 'Which temperature of colors do you prefer?',
    options: [
      { label: 'Cool (blues, greens)', value: 'cool' as ColorPreference },
      { label: 'Warm (reds, yellows)', value: 'warm' as ColorPreference },
    ],
  },
  {
    id: '2',
    question: 'Which saturation do you prefer?',
    options: [
      { label: 'Vibrant / bright', value: 'vibrant' as ColorPreference },
      { label: 'Muted / subtle', value: 'muted' as ColorPreference },
    ],
  },
];

export const ColorAssessment: React.FC<{
  onPreferenceSelected: (preference: ColorPreference | null) => void;
}> = ({ onPreferenceSelected }) => {
  const [step, setStep] = useState(0);
  const [preferences, setPreferences] = useState<ColorPreference | null>(null);

  useEffect(() => {
    if (step >= PREFERENCE_QUESTIONS.length) {
      onPreferenceSelected(null);
    }
  }, [step]);

  if (step >= PREFERENCE_QUESTIONS.length) {
    return null;
  }

  const current = PREFERENCE_QUESTIONS[step];

  const handleSelect = (value: ColorPreference) => {
    setPreferences(value);
    setStep(step + 1);
  };

  return (
    <div className="p-8 bg-black text-white max-w-md mx-auto">
      {step < PREFERENCE_QUESTIONS.length ? (
        <div>
          <h2 className="text-2xl mb-6">Color Preference Assessment</h2>
          <p className="mb-6 text-gray-300">{current.question}</p>
          <div className="space-y-3">
            {current.options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`px-4 py-2 rounded border ${
                  preferences === opt.value ? 'border-primary bg-primary/20 text-primary' : 'border-gray-600 text-gray-200 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};