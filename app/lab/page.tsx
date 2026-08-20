"use client";

import React from 'react';
import Link from 'next/link';

export default function LabPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#071318', color: '#F5F7F2' }}>
      <nav className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#67E8D4' }}>
            <svg className="w-6 h-6" fill="none" stroke="#071318" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
          <span className="font-semibold text-lg">EMOCEAN</span>
        </Link>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-4">The Lab</h1>
        <p className="text-lg mb-12" style={{ color: '#A9BAB8' }}>
          Choose an experiment. Each takes a few minutes and runs entirely in your browser.
        </p>

        <div className="space-y-6">
          <Link href="/lab/interface" className="block p-8 rounded-2xl border transition-all hover:border-[#67E8D4]/30" style={{ backgroundColor: '#10242B', borderColor: 'rgba(245,247,242,.12)' }}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-3xl mb-3">🎯</div>
                <h2 className="text-2xl font-semibold mb-2">Find My Interface</h2>
                <p className="mb-4" style={{ color: '#A9BAB8' }}>
                  Compare typography, spacing, contrast, and motion while you read, search, and reply.
                </p>
                <div className="flex items-center gap-4 text-sm" style={{ color: '#A9BAB8' }}>
                  <span>5–10 min</span>
                  <span>·</span>
                  <span>Camera optional</span>
                  <span>·</span>
                  <span>Exportable settings</span>
                </div>
              </div>
              <svg className="w-6 h-6 shrink-0 mt-2" fill="none" stroke="#A9BAB8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link href="/lab/breathe" className="block p-8 rounded-2xl border transition-all hover:border-[#7DD3B0]/30" style={{ backgroundColor: '#10242B', borderColor: 'rgba(245,247,242,.12)' }}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-3xl mb-3">🌊</div>
                <h2 className="text-2xl font-semibold mb-2">Breathe the World Open</h2>
                <p className="mb-4" style={{ color: '#A9BAB8' }}>
                  A stormed-over world responds as your breathing becomes slower and steadier.
                </p>
                <div className="flex items-center gap-4 text-sm" style={{ color: '#A9BAB8' }}>
                  <span>3–5 min</span>
                  <span>·</span>
                  <span>Webcam or guided mode</span>
                </div>
              </div>
              <svg className="w-6 h-6 shrink-0 mt-2" fill="none" stroke="#A9BAB8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link href="/lab/sensors" className="block p-6 rounded-2xl border transition-all hover:border-[#F4B86A]/30" style={{ backgroundColor: '#10242B', borderColor: 'rgba(245,247,242,.12)' }}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">Sensor Diagnostics</h3>
                <p className="text-sm" style={{ color: '#A9BAB8' }}>Experimental · Developer tools</p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#F4B86A20', color: '#F4B86A' }}>Experimental</span>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
