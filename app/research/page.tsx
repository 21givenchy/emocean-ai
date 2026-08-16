"use client";

import React from 'react';
import Link from 'next/link';

export default function ResearchPage() {
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
          Research
        </p>
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Evidence boundaries, not hype.
        </h1>
        <p className="text-lg mb-12 max-w-2xl" style={{ color: '#A9BAB8' }}>
          EMOCEAN is built on published work in bioadaptive interaction, respiratory biofeedback, and adaptive interfaces. Here we lay out what the science supports, what remains exploratory, and where we draw ethical lines.
        </p>

        <div className="space-y-10">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Respiratory biofeedback</h2>
            <p className="mb-3" style={{ color: '#A9BAB8' }}>
              Slow, controlled breathing at roughly 6 breaths per minute has been shown to increase heart-rate variability and improve subjective calm in laboratory settings. Our Breathe the World Open experience applies this principle: as your breathing pattern stabilizes, the virtual environment responds.
            </p>
            <p className="mb-3" style={{ color: '#A9BAB8' }}>
              <strong className="text-white">What we can claim:</strong> Respiratory entrainment is a well-documented phenomenon (Lehrer &amp; Gevirtz, 2014). Real-time breathing measurement via webcam or wearable provides a reasonable proxy for paced breathing.
            </p>
            <p style={{ color: '#A9BAB8' }}>
              <strong className="text-white">What we cannot claim:</strong> That webcam-derived breathing rates are as accurate as medical-grade plethysmography, or that short sessions produce lasting clinical outcomes.
            </p>
          </section>

          <section className="p-8 rounded-2xl border" style={{ backgroundColor: '#10242B', borderColor: 'rgba(245,247,242,.12)' }}>
            <h2 className="text-2xl font-semibold mb-4">Physiology-informed interface adaptation</h2>
            <p className="mb-3" style={{ color: '#A9BAB8' }}>
              Research in affective computing suggests that physiological signals—heart rate, heart-rate variability, skin conductance—carry information about arousal and attention. Several studies have explored using these signals to adapt digital interfaces (e.g., adjusting contrast, spacing, or notification frequency).
            </p>
            <p className="mb-3" style={{ color: '#A9BAB8' }}>
              <strong className="text-white">Our approach:</strong> Find My Interface pairs self-report and task performance with optional physiology. Physiology never overrides your stated preference; it adds context to the assessment.
            </p>
            <p style={{ color: '#A9BAB8' }}>
              <strong className="text-white">Open question:</strong> Whether webcam-derived heart rate is reliable enough for meaningful adaptation remains an active area of research. We publish our methodology and encourage independent validation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">What EMOCEAN is not</h2>
            <ul className="space-y-3" style={{ color: '#A9BAB8' }}>
              <li className="flex items-start gap-3">
                <span style={{ color: '#67E8D4' }}>·</span>
                <span>A medical device. EMOCEAN does not diagnose, treat, or monitor health conditions.</span>
              </li>
              <li className="flex items-start gap-3">
                <span style={{ color: '#67E8D4' }}>·</span>
                <span>A personality test. Interface preferences are contextual, not fixed traits.</span>
              </li>
              <li className="flex items-start gap-3">
                <span style={{ color: '#67E8D4' }}>·</span>
                <span>A surveillance tool. All processing happens locally unless you explicitly opt in to a research study.</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Selected references</h2>
            <div className="space-y-3 text-sm" style={{ color: '#A9BAB8' }}>
              <p>Lehrer, P. M., &amp; Gevirtz, R. (2014). Heart rate variability biofeedback: How and why does it work? <em>Frontiers in Psychology</em>, 5, 756.</p>
              <p>Picard, R. W. (2000). <em>Affective Computing</em>. MIT Press.</p>
              <p>Rickles, D., et al. (2024). Bioadaptive interfaces: A review of physiological signal-driven interaction techniques. <em>ACM Computing Surveys</em>.</p>
              <p>van der Schaar, P. J., et al. (2023). Webcam-based photoplethysmography for heart rate estimation during cognitive tasks. <em>IEEE Access</em>.</p>
            </div>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t" style={{ borderColor: 'rgba(245,247,242,.12)' }}>
          <Link href="/lab" className="text-sm font-medium" style={{ color: '#67E8D4' }}>
            Try the experiments yourself →
          </Link>
        </div>
      </main>
    </div>
  );
}
