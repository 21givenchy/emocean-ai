"use client";

import React from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
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
          Privacy
        </p>
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Your data stays with you.
        </h1>
        <p className="text-lg mb-12 max-w-2xl" style={{ color: '#A9BAB8' }}>
          EMOCEAN is designed to process signals locally. We only collect what you explicitly choose to share, and we explain every data flow before it happens.
        </p>

        <div className="space-y-10">
          <section>
            <h2 className="text-2xl font-semibold mb-4">What we process</h2>
            <div className="space-y-3" style={{ color: '#A9BAB8' }}>
              <div className="flex items-start gap-3">
                <span style={{ color: '#67E8D4' }}>·</span>
                <span><strong className="text-white">Camera feed</strong> — If you enable camera, video frames are processed on-device for expression estimation and vital signs (heart rate, breathing rate). Frames are never transmitted or stored.</span>
              </div>
              <div className="flex items-start gap-3">
                <span style={{ color: '#67E8D4' }}>·</span>
                <span><strong className="text-white">Self-report</strong> — Responses to mood, stress, and preference prompts. Stored locally in your browser.</span>
              </div>
              <div className="flex items-start gap-3">
                <span style={{ color: '#67E8D4' }}>·</span>
                <span><strong className="text-white">Session results</strong> — Interface comparison outcomes and breathing summaries. Generated on-device, exportable at your discretion.</span>
              </div>
            </div>
          </section>

          <section className="p-8 rounded-2xl border" style={{ backgroundColor: '#10242B', borderColor: 'rgba(245,247,242,.12)' }}>
            <h2 className="text-2xl font-semibold mb-4">What never leaves your device</h2>
            <div className="space-y-3" style={{ color: '#A9BAB8' }}>
              <div className="flex items-start gap-3">
                <span style={{ color: '#FF7A85' }}>×</span>
                <span>Camera or video data</span>
              </div>
              <div className="flex items-start gap-3">
                <span style={{ color: '#FF7A85' }}>×</span>
                <span>Physiological signals (heart rate, breathing rate)</span>
              </div>
              <div className="flex items-start gap-3">
                <span style={{ color: '#FF7A85' }}>×</span>
                <span>Expression or emotion estimates</span>
              </div>
              <div className="flex items-start gap-3">
                <span style={{ color: '#FF7A85' }}>×</span>
                <span>Any identifying information</span>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Research participation</h2>
            <p className="mb-3" style={{ color: '#A9BAB8' }}>
              EMOCEAN may offer you the option to contribute anonymized session data to a research dataset. This is always:
            </p>
            <ul className="space-y-2 ml-6" style={{ color: '#A9BAB8' }}>
              <li className="flex items-start gap-3">
                <span style={{ color: '#67E8D4' }}>·</span>
                <span><strong className="text-white">Opt-in only</strong> — You are never asked automatically.</span>
              </li>
              <li className="flex items-start gap-3">
                <span style={{ color: '#67E8D4' }}>·</span>
                <span><strong className="text-white">De-identified</strong> — No names, emails, or device identifiers are attached.</span>
              </li>
              <li className="flex items-start gap-3">
                <span style={{ color: '#67E8D4' }}>·</span>
                <span><strong className="text-white">Revocable</strong> — You can withdraw your data at any time.</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Third-party services</h2>
            <p className="mb-3" style={{ color: '#A9BAB8' }}>
              EMOCEAN is hosted on Vercel. Vercel collects standard access logs (IP addresses, user agents, request timestamps) for infrastructure operation. These logs are subject to <a href="https://vercel.com/legal/privacy-policy" className="underline" style={{ color: '#67E8D4' }}>Vercel's privacy policy</a>.
            </p>
            <p style={{ color: '#A9BAB8' }}>
              No analytics, advertising, or tracking scripts are included in the application itself.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Data retention</h2>
            <p className="mb-3" style={{ color: '#A9BAB8' }}>
              Your session data is stored in your browser's local storage. Clearing your browser data clears EMOCEAN data. Server-side research contributions are retained indefinitely unless you request deletion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact</h2>
            <p style={{ color: '#A9BAB8' }}>
              For privacy questions, data deletion requests, or to discuss research participation, email <a href="mailto:privacy@emocean.studio" className="underline" style={{ color: '#67E8D4' }}>privacy@emocean.studio</a>.
            </p>
          </section>

          <section className="p-6 rounded-xl" style={{ backgroundColor: '#10242B' }}>
            <p className="text-sm" style={{ color: '#A9BAB8' }}>
              <strong className="text-white">Last updated:</strong> August 2026. We will update this page and provide notice in the application when data practices change.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
