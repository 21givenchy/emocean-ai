"use client";

import React from 'react';

type EmotionInfo = {
  label: string;
  confidence: number;
};

export const EmotionDisplay: React.FC<{
  emotion: EmotionInfo | null;
  onEmotionChange?: (emotion: EmotionInfo) => void;
}> = ({ emotion, onEmotionChange }) => {
  if (!emotion) {
    return (
      <div className="p-4 text-gray-400">No face detected</div>
    );
  }

  const emotionClasses: Record<string, string> = {
    happy: 'bg-yellow-100 text-yellow-800',
    sad: 'bg-blue-100 text-blue-800',
    angry: 'bg-red-100 text-red-800',
    neutral: 'bg-gray-100 text-gray-800',
    surprised: 'bg-purple-100 text-purple-800',
    fearful: 'bg-cyan-100 text-cyan-800',
    disgusted: 'bg-green-100 text-green-800',
  };

  const cls = emotionClasses[emotion.label] || 'bg-gray-100 text-gray-800';

  return (
    <div className={`p-4 rounded-md ${cls} mb-4 flex items-center gap-3`}
      onClick={() => onEmotionChange && onEmotionChange(emotion)}
    >
      <span className="text-xl">{emotion.label === 'neutral' ? '😐' : emotion.label}</span>
      <span>{emotion.confidence}%</span>
    </div>
  );
};