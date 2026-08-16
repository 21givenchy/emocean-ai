"use client";

import React from 'react';
import Link from 'next/link';
import { CameraFeed } from '@/app/components/CameraFeed';

export default function SensorsPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#071318', color: '#F5F7F2' }}>
      <nav className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/lab" className="flex items-center gap-2" style={{ color: '#A9BAB8' }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Lab
        </Link>
        <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#F4B86A20', color: '#F4B86A' }}>Experimental</span>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-2">Sensor Diagnostics</h1>
        <p className="mb-6" style={{ color: '#A9BAB8' }}>
          Experimental developer tools. Camera data is processed locally and never leaves your device.
        </p>

        <div className="p-4 rounded-xl border mb-6" style={{ backgroundColor: '#F4B86A10', borderColor: '#F4B86A30' }}>
          <p className="text-sm" style={{ color: '#F4B86A' }}>
            ⚠️ These sensors are experimental. Outputs are not validated for clinical or health use.
          </p>
        </div>

        <CameraFeed />
      </main>
    </div>
  );
}
