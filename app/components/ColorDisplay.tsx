"use client";

import React from 'react';

type ColorPreference = 'cool' | 'warm' | 'neutral' | 'vibrant' | 'muted';

type EmotionInfo = {
  label: string;
  confidence: number;
};

const EMOTION_COLORS: Record<string, { base: string; preference: ColorPreference }> = {
  happy: { base: '#facc15', preference: 'vibrant' },
  sad: { base: '#3b82f6', preference: 'cool' },
  angry: { base: '#ef4444', preference: 'warm' },
  neutral: { base: '#6b7280', preference: 'neutral' },
  surprised: { base: '#f87171', preference: 'vibrant' },
  fearful: { base: '#a855f6', preference: 'cool' },
  disgusted: { base: '#10b981', preference: 'neutral' },
};

const PREFERENCE_MODIFIERS: Record<ColorPreference, { lightness: number; saturation: number }> = {
  cool: { lightness: -0.1, saturation: -0.1 },
  warm: { lightness: -0.1, saturation: -0.1 },
  neutral: { lightness: 0, saturation: 0 },
  vibrant: { lightness: 0.2, saturation: 0.3 },
  muted: { lightness: -0.2, saturation: -0.3 },
};

function adjustColor(hex: string, lightness: number, saturation: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;

  const toLinear = (c: number) => {
    const normalized = c / 255;
    return normalized <= 0.04045 ? normalized / 12.92 : Math.pow((normalized + 0.055) / 1.055, 2.4);
  };

  const fromLinear = (c: number) => {
    return c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) * 255;
  };

  const l = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  const a = 0.5 * toLinear(r);
  const b_ = 0.5 * toLinear(b);

  const l_prime = Math.max(0, Math.min(1, l + lightness));
  const a_prime = Math.max(-1, Math.min(1, a + (saturation * 0.5)));
  const b_prime_ = Math.max(-1, Math.min(1, b_ + (saturation * 0.5)));

  const r_prime = Math.max(0, Math.min(1, l_prime + 1.75 * a_prime - 0.655 * b_prime_)) * 255;
  const g_prime = Math.max(0, Math.min(1, l_prime - 0.5 * a_prime - 0.4545 * b_prime_)) * 255;
  const b_prime = Math.max(0, Math.min(1, l_prime - 0.186 * a_prime + 1.66 * b_prime_)) * 255;

  const toHex = (c: number) => {
    const h = Math.round(c).toString(16).padStart(2, '0');
    return h;
  };

  return `#${toHex(r_prime)}${toHex(g_prime)}${toHex(b_prime)}`;
}

export const ColorDisplay: React.FC<{
  emotion: EmotionInfo | null;
  preference: ColorPreference | null;
  onEmotionChange?: (emotion: EmotionInfo) => void;
}> = ({ emotion, preference, onEmotionChange }) => {
  if (!emotion) {
    return (
      <div className="p-4 text-gray-400">No face detected</div>
    );
  }

  const emotionColorInfo = EMOTION_COLORS[emotion.label];
  const modifier = PREFERENCE_MODIFIERS[preference || 'neutral'];

  let displayColor: string;
  if (emotionColorInfo && preference) {
    displayColor = adjustColor(emotionColorInfo.base, modifier.lightness, modifier.saturation);
  } else if (emotionColorInfo) {
    displayColor = emotionColorInfo.base;
  } else {
    displayColor = '#6b7280';
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
      style={{ backgroundColor: displayColor }}
    >
      <span className="text-xl">{emotion.label === 'neutral' ? '😐' : emotion.label}</span>
      <span>{emotion.confidence}%</span>
    </div>
  );
};