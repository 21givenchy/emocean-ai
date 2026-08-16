"use client";

import React, { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { VisualMode } from '@/app/lib/designTokens';
import { AssessmentFlow } from '@/app/components/AssessmentFlow';

function SessionContent() {
  const searchParams = useSearchParams();
  const mode = (searchParams.get('mode') || 'focus') as VisualMode;
  const [sessionId] = useState(() => Date.now().toString());

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#071318', color: '#F5F7F2' }}>
      <AssessmentFlow
        mode={mode}
        onComplete={(profile) => {
          sessionStorage.setItem(`emocean-session-${sessionId}`, JSON.stringify(profile));
          window.location.href = `/lab/interface/results/${sessionId}`;
        }}
        onBack={() => window.location.href = '/lab/interface'}
      />
    </div>
  );
}

export default function SessionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#071318', color: '#F5F7F2' }}>
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: '#67E8D4', borderTopColor: 'transparent' }} />
            <p style={{ color: '#A9BAB8' }}>Loading session…</p>
          </div>
        </div>
      }
    >
      <SessionContent />
    </Suspense>
  );
}
