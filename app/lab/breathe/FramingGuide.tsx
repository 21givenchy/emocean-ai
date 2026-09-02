"use client";

import React from 'react';

interface FramingGuideProps {
  visible: boolean;
}

export const FramingGuide: React.FC<FramingGuideProps> = ({ visible }) => {
  if (!visible) return null;

  // Simple head-and-shoulders silhouette positioned over the video preview.
  // Drawn at 4:3 aspect ratio to match the video container, with low opacity
  // so the live video remains visible beneath.
  return (
    <svg viewBox="0 0 400 300" className="absolute inset-0 w-full h-full pointer-events-none">
      <defs>
        <style>{`
          .framing-guide {
            stroke: #67E8D4;
            stroke-width: 2;
            fill: none;
            opacity: 0.5;
          }
        `}</style>
      </defs>

      {/* Head circle */}
      <circle cx="200" cy="90" r="40" className="framing-guide" />

      {/* Shoulder line */}
      <line x1="140" y1="130" x2="260" y2="130" className="framing-guide" />

      {/* Body bounds (roughly to mid-chest) */}
      <line x1="140" y1="130" x2="130" y2="200" className="framing-guide" />
      <line x1="260" y1="130" x2="270" y2="200" className="framing-guide" />
      <line x1="130" y1="200" x2="270" y2="200" className="framing-guide" />

      {/* Horizontal center guide (optional, helps with centering) */}
      <line x1="50" y1="150" x2="350" y2="150" className="framing-guide" style={{ opacity: 0.2 }} />
    </svg>
  );
};
