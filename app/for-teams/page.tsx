"use client";

import React from 'react';
import Link from 'next/link';

export default function ForTeamsPage() {
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
        <Link
          href="/lab"
          className="px-5 py-2.5 rounded-full text-sm font-medium transition-colors"
          style={{ backgroundColor: '#67E8D4', color: '#071318' }}
        >
          Enter the lab
        </Link>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <p className="text-sm font-medium uppercase tracking-widest mb-4" style={{ color: '#67E8D4' }}>
          For teams
        </p>
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Build responsive worlds, together.
        </h1>
        <p className="text-lg mb-12 max-w-2xl" style={{ color: '#A9BAB8' }}>
          We are developing building blocks for adaptive interfaces: games that respond to what a player does, learning tools that pace themselves, focus products that adapt to measured task performance. None of it is validated yet, and we will say so until it is.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <div className="p-8 rounded-2xl border" style={{ backgroundColor: '#10242B', borderColor: 'rgba(245,247,242,.12)' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: '#67E8D415' }}>
              <svg className="w-6 h-6" fill="none" stroke="#67E8D4" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Adaptive mechanics</h3>
            <p className="text-sm" style={{ color: '#A9BAB8' }}>
              Paced breathing, bioadaptive UI, and context-aware pacing modules you can integrate into your product.
            </p>
          </div>

          <div className="p-8 rounded-2xl border" style={{ backgroundColor: '#10242B', borderColor: 'rgba(245,247,242,.12)' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: '#7DD3B015' }}>
              <svg className="w-6 h-6" fill="none" stroke="#7DD3B0" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Research instruments</h3>
            <p className="text-sm" style={{ color: '#A9BAB8' }}>
              Exportable session files with timestamps, signals, self-report and per-field provenance. What a study needs beyond that — protocol review, consent records, retention — is yours to run; we make no compliance claim.
            </p>
          </div>

          <div className="p-8 rounded-2xl border" style={{ backgroundColor: '#10242B', borderColor: 'rgba(245,247,242,.12)' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: '#F4B86A15' }}>
              <svg className="w-6 h-6" fill="none" stroke="#F4B86A" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Privacy-first architecture</h3>
            <p className="text-sm" style={{ color: '#A9BAB8' }}>
              All sensor processing runs in the browser. No data leaves the device without explicit consent. Transparent data policies.
            </p>
          </div>

          <div className="p-8 rounded-2xl border" style={{ backgroundColor: '#10242B', borderColor: 'rgba(245,247,242,.12)' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: '#67E8D415' }}>
              <svg className="w-6 h-6" fill="none" stroke="#67E8D4" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Rapid prototyping</h3>
            <p className="text-sm" style={{ color: '#A9BAB8' }}>
              Test adaptive mechanics in days, not months. Our SDK exposes simple hooks and adapters for quick integration.
            </p>
          </div>
        </div>

        <div className="p-8 rounded-2xl border mb-12" style={{ backgroundColor: '#10242B', borderColor: 'rgba(245,247,242,.12)' }}>
          <h2 className="text-2xl font-semibold mb-4">How partnerships work</h2>
          <div className="space-y-4" style={{ color: '#A9BAB8' }}>
            <div className="flex items-start gap-3">
              <span className="text-lg font-semibold" style={{ color: '#67E8D4' }}>01</span>
              <div>
                <h4 className="font-medium text-white mb-1">Discovery call</h4>
                <p className="text-sm">We learn about your product, audience, and research questions.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg font-semibold" style={{ color: '#67E8D4' }}>02</span>
              <div>
                <h4 className="font-medium text-white mb-1">Scoped pilot</h4>
                <p className="text-sm">A 2–4 week engagement to build and test a specific adaptive mechanic in your environment.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg font-semibold" style={{ color: '#67E8D4' }}>03</span>
              <div>
                <h4 className="font-medium text-white mb-1">Evaluation &amp; integration</h4>
                <p className="text-sm">We review results together, document what the mechanic did and did not show, and hand off the prototype with its known limits written down.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center py-12">
          <p className="text-lg mb-6" style={{ color: '#A9BAB8' }}>
            Ready to explore what adaptive interfaces could look like in your product?
          </p>
          <a
            href="mailto:hello@emocean.studio"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl text-lg font-medium transition-colors"
            style={{ backgroundColor: '#67E8D4', color: '#071318' }}
          >
            Talk to the lab
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </main>
    </div>
  );
}
