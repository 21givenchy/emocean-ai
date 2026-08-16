"use client";

import React from 'react';
import Link from 'next/link';

export default function BreathePage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#071318', color: '#F5F7F2' }}>
      <nav className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between w-full">
        <Link href="/lab" className="flex items-center gap-2" style={{ color: '#A9BAB8' }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Lab
        </Link>
        <span className="text-sm" style={{ color: '#A9BAB8' }}>Breathe the World Open</span>
      </nav>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-lg">
          <div className="text-6xl mb-6">🌊</div>
          <h1 className="text-4xl font-bold mb-4">Breathe the World Open</h1>
          <p className="text-lg mb-8" style={{ color: '#A9BAB8' }}>
            A stormed-over world responds as your breathing becomes slower and steadier.
            Restore light, calm the weather, and learn a regulation skill you can take with you.
          </p>

          <div className="space-y-4 mb-8">
            <div className="p-4 rounded-xl border text-left" style={{ backgroundColor: '#10242B', borderColor: 'rgba(245,247,242,.12)' }}>
              <h3 className="font-medium mb-1">📷 Camera mode</h3>
              <p className="text-sm" style={{ color: '#A9BAB8' }}>Uses your webcam to detect breathing patterns from chest motion.</p>
            </div>
            <div className="p-4 rounded-xl border text-left" style={{ backgroundColor: '#10242B', borderColor: 'rgba(245,247,242,.12)' }}>
              <h3 className="font-medium mb-1">🎯 Guided mode</h3>
              <p className="text-sm" style={{ color: '#A9BAB8' }}>Follow visual breathing cues without any camera. No permission needed.</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl border" style={{ backgroundColor: '#10242B', borderColor: 'rgba(245,247,242,.12)' }}>
            <p className="text-sm" style={{ color: '#A9BAB8' }}>
              This experience is currently in development. The breathing detection pipeline is being validated against reference recordings before public release.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
