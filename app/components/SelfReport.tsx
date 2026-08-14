"use client";

import React, { useState } from 'react';

interface SelfReportProps {
  colorName: string;
  colorHex: string;
  onSubmit: (rating: number, label: string) => void;
}

const ratingLabels = [
  { value: 1, label: 'Very Tense', color: 'text-red-600' },
  { value: 2, label: 'Tense', color: 'text-orange-500' },
  { value: 3, label: 'Slightly Tense', color: 'text-yellow-500' },
  { value: 4, label: 'Neutral', color: 'text-gray-500' },
  { value: 5, label: 'Slightly Calm', color: 'text-teal-400' },
  { value: 6, label: 'Calm', color: 'text-blue-500' },
  { value: 7, label: 'Very Calm', color: 'text-indigo-600' },
];

export const SelfReport: React.FC<SelfReportProps> = ({ colorName, colorHex, onSubmit }) => {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (selectedRating === null) return;
    const ratingData = ratingLabels.find(r => r.value === selectedRating);
    onSubmit(selectedRating, ratingData?.label || 'Neutral');
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm text-center">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-gray-600">Rating recorded. Thank you!</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-4 mb-6">
        <div
          className="w-16 h-16 rounded-xl shadow-inner"
          style={{ backgroundColor: colorHex }}
        />
        <div>
          <h3 className="font-semibold text-gray-800">How did {colorName} make you feel?</h3>
          <p className="text-sm text-gray-500">Select the rating that best matches your experience</p>
        </div>
      </div>

      <div className="space-y-2 mb-6">
        {ratingLabels.map((rating) => (
          <button
            key={rating.value}
            onClick={() => setSelectedRating(rating.value)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
              selectedRating === rating.value
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              selectedRating === rating.value
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {rating.value}
            </div>
            <span className={`font-medium ${rating.color}`}>{rating.label}</span>
          </button>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={selectedRating === null}
        className={`w-full rounded-lg px-4 py-3 font-medium transition-colors ${
          selectedRating !== null
            ? 'bg-blue-500 text-white hover:bg-blue-600'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        Submit Rating
      </button>
    </div>
  );
};
