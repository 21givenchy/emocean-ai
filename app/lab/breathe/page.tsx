"use client";

import React, { Suspense } from 'react';
import BreatheExperience from './experience';

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#071318', color: '#F5F7F2' }}>
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: '#67E8D4', borderTopColor: 'transparent' }} />
        <p style={{ color: '#A9BAB8' }}>Loading experience…</p>
      </div>
    </div>
  );
}

export default function BreathePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <BreatheExperience />
    </Suspense>
  );
}
