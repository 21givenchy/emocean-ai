"use client";

import React from 'react';
import Link from 'next/link';
import { IntentSelect } from '@/app/components/IntentSelect';

export default function InterfacePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#071318', color: '#F5F7F2' }}>
      <nav className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/lab" className="flex items-center gap-2" style={{ color: '#A9BAB8' }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Lab
        </Link>
        <span className="text-sm" style={{ color: '#A9BAB8' }}>Find My Interface</span>
      </nav>
      <IntentSelect
        onSelect={(mode) => {
          window.location.href = `/lab/interface/session?mode=${mode}`;
        }}
        onBack={() => window.location.href = '/lab'}
      />
    </div>
  );
}
