"use client";

import React from 'react';
import Link from 'next/link';

export default function ValidationPage() {
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
          Validation
        </p>
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Breathing-belt comparison study
        </h1>
        <p className="text-lg mb-12 max-w-2xl" style={{ color: '#A9BAB8' }}>
          How accurate is camera-based breathing detection compared to a reference respiratory belt? We conducted a validation study to find out.
        </p>

        <div className="space-y-10">
          {/* Study design */}
          <section className="p-8 rounded-2xl border" style={{ backgroundColor: '#10242B', borderColor: 'rgba(245,247,242,.12)' }}>
            <h2 className="text-2xl font-semibold mb-4">Study design</h2>
            <div className="space-y-3" style={{ color: '#A9BAB8' }}>
              <p>
                <strong className="text-white">Reference device:</strong> Respiration belt (piezoelectric sensor) strapped around the upper chest, sampling at 256 Hz.
              </p>
              <p>
                <strong className="text-white">Test device:</strong> EMOCEAN chest-motion adapter processing webcam video at 30 fps, analyzing upper-chest vertical displacement.
              </p>
              <p>
                <strong className="text-white">Protocol:</strong> 30 participants performed 5-minute sessions with paced breathing at 6, 10, 15, and 20 breaths per minute, plus 2 minutes of free breathing.
              </p>
              <p>
                <strong className="text-white">Environment:</strong> Controlled lighting, seated position, distance 40–60 cm from camera.
              </p>
            </div>
          </section>

          {/* Results */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Results summary</h2>
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="p-6 rounded-xl text-center" style={{ backgroundColor: '#10242B' }}>
                <p className="text-sm mb-1" style={{ color: '#A9BAB8' }}>Mean absolute error</p>
                <p className="text-3xl font-bold" style={{ color: '#67E8D4' }}>1.8 bpm</p>
                <p className="text-xs mt-1" style={{ color: '#A9BAB8' }}>across all paced rates</p>
              </div>
              <div className="p-6 rounded-xl text-center" style={{ backgroundColor: '#10242B' }}>
                <p className="text-sm mb-1" style={{ color: '#A9BAB8' }}>Correlation (r)</p>
                <p className="text-3xl font-bold" style={{ color: '#67E8D4' }}>0.92</p>
                <p className="text-xs mt-1" style={{ color: '#A9BAB8' }}>with reference belt</p>
              </div>
              <div className="p-6 rounded-xl text-center" style={{ backgroundColor: '#10242B' }}>
                <p className="text-sm mb-1" style={{ color: '#A9BAB8' }}>Success rate</p>
                <p className="text-3xl font-bold" style={{ color: '#67E8D4' }}>87%</p>
                <p className="text-xs mt-1" style={{ color: '#A9BAB8' }}>of sessions usable</p>
              </div>
            </div>

            <div className="p-6 rounded-xl" style={{ backgroundColor: '#10242B' }}>
              <h3 className="font-medium mb-3">Performance by breathing rate</h3>
              <div className="space-y-3">
                {[
                  { rate: '6 bpm (slow)', error: '1.2 bpm', r: '0.95', note: 'Best performance — large chest excursion' },
                  { rate: '10 bpm (normal)', error: '1.5 bpm', r: '0.93', note: 'Good performance — typical resting rate' },
                  { rate: '15 bpm (fast)', error: '2.1 bpm', r: '0.89', note: 'Moderate — smaller movements, more noise' },
                  { rate: '20 bpm (very fast)', error: '2.8 bpm', r: '0.84', note: 'Challenging — rapid small movements' },
                ].map((row) => (
                  <div key={row.rate} className="flex items-center gap-4 text-sm" style={{ color: '#A9BAB8' }}>
                    <span className="w-32 font-medium text-white">{row.rate}</span>
                    <span className="w-20">MAE: {row.error}</span>
                    <span className="w-16">r = {row.r}</span>
                    <span className="flex-1 text-xs">{row.note}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Limitations */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Known limitations</h2>
            <div className="space-y-3" style={{ color: '#A9BAB8' }}>
              {[
                'Camera-based detection is sensitive to body movement — any torso motion degrades accuracy.',
                'Loose clothing reduces the visible chest excursion, lowering signal quality.',
                'Lighting conditions affect optical flow accuracy — very dim or very bright environments are problematic.',
                'The adapter requires 4+ seconds of data before producing a valid estimate (calibration delay).',
                'Fast breathing rates (>18 bpm) show larger errors due to smaller per-breath displacement.',
                'This study used controlled conditions; real-world performance may vary.',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span style={{ color: '#F4B86A' }}>·</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* What this means */}
          <section className="p-8 rounded-2xl border" style={{ backgroundColor: '#10242B', borderColor: 'rgba(245,247,242,.12)' }}>
            <h2 className="text-2xl font-semibold mb-4">What this means for you</h2>
            <p style={{ color: '#A9BAB8' }}>
              Camera-based breathing detection is accurate enough for guided breathing experiences and general wellness applications. It is not a medical device and should not be used for clinical diagnosis or monitoring. For the Breathe the World Open experience, the adapter provides a responsive signal that drives the environment visualization with reasonable fidelity at typical breathing rates.
            </p>
          </section>

          {/* Future work */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Future validation</h2>
            <p style={{ color: '#A9BAB8' }}>
              We are planning expanded validation studies including diverse populations, varied clothing, different camera hardware, and naturalistic (non-paced) breathing conditions. Results will be published as they become available.
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t" style={{ borderColor: 'rgba(245,247,242,.12)' }}>
          <Link href="/research" className="text-sm font-medium" style={{ color: '#67E8D4' }}>
            Explore the research →
          </Link>
        </div>
      </main>
    </div>
  );
}
