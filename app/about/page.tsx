"use client";

import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
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
          About
        </p>
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          A decade of making digital worlds respond to the body.
        </h1>
        <p className="text-lg mb-12 max-w-2xl" style={{ color: '#A9BAB8' }}>
          EMOCEAN emerged from years of work on VR breath biofeedback, responsive environments, and adaptive interaction. We turned that lineage into open, testable web experiences.
        </p>

        <div className="space-y-10">
          <section>
            <h2 className="text-2xl font-semibold mb-4">The origin</h2>
            <p className="mb-3" style={{ color: '#A9BAB8' }}>
              Our team previously built immersive VR environments that responded to participants' breathing—calming storms as breathing stabilized, brightening landscapes as heart-rate variability increased. The work demonstrated that bioadaptive mechanics can be both meaningful and measurable.
            </p>
            <p style={{ color: '#A9BAB8' }}>
              EMOCEAN translates those insights into lightweight, browser-based experiences that anyone can try—no VR headset, no special hardware, no account required.
            </p>
          </section>

          <section className="p-8 rounded-2xl border" style={{ backgroundColor: '#10242B', borderColor: 'rgba(245,247,242,.12)' }}>
            <h2 className="text-2xl font-semibold mb-4">What we believe</h2>
            <div className="space-y-3" style={{ color: '#A9BAB8' }}>
              <div className="flex items-start gap-3">
                <span style={{ color: '#67E8D4' }}>·</span>
                <span><strong className="text-white">Interfaces should adapt to context, not personality.</strong> The same settings are not best for every task. A focus mode for reading may be different from a social mode for messaging.</span>
              </div>
              <div className="flex items-start gap-3">
                <span style={{ color: '#67E8D4' }}>·</span>
                <span><strong className="text-white">Physiology provides context, not answers.</strong> Heart rate and breathing data can inform interface adaptation, but they cannot replace self-report. Your stated preference always takes priority.</span>
              </div>
              <div className="flex items-start gap-3">
                <span style={{ color: '#67E8D4' }}>·</span>
                <span><strong className="text-white">Transparency is non-negotiable.</strong> Every data flow is disclosed. Every processing step is explained. No hidden analytics, no dark patterns, no manipulative mechanics.</span>
              </div>
              <div className="flex items-start gap-3">
                <span style={{ color: '#67E8D4' }}>·</span>
                <span><strong className="text-white">Open research accelerates progress.</strong> We publish our methods, share our data, and invite independent validation. Science advances through scrutiny.</span>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">The team</h2>
            <p className="mb-6" style={{ color: '#A9BAB8' }}>
              EMOCEAN is built by a small team of researchers, designers, and engineers with backgrounds in affective computing, human-computer interaction, and creative technology.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl" style={{ backgroundColor: '#10242B' }}>
                <h4 className="font-medium mb-1">Research &amp; Science</h4>
                <p className="text-sm" style={{ color: '#A9BAB8' }}>
                  Respiratory biofeedback, physiological computing, adaptive interfaces, ethical AI.
                </p>
              </div>
              <div className="p-6 rounded-xl" style={{ backgroundColor: '#10242B' }}>
                <h4 className="font-medium mb-1">Design &amp; Engineering</h4>
                <p className="text-sm" style={{ color: '#A9BAB8' }}>
                  Privacy-first architecture, accessible design, real-time signal processing, open-source tooling.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Open source</h2>
            <p style={{ color: '#A9BAB8' }}>
              EMOCEAN's codebase is available on GitHub. We welcome contributions, bug reports, and research collaborations. If you are building adaptive experiences, we would love to hear from you.
            </p>
          </section>

          <section className="p-8 rounded-2xl border" style={{ backgroundColor: '#10242B', borderColor: 'rgba(245,247,242,.12)' }}>
            <h2 className="text-2xl font-semibold mb-4">Get involved</h2>
            <p className="mb-6" style={{ color: '#A9BAB8' }}>
              Whether you are a researcher, a product team, or someone interested in how adaptive interfaces work—we would like to connect.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="mailto:hello@emocean.studio"
                className="inline-flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-colors"
                style={{ backgroundColor: '#67E8D4', color: '#071318' }}
              >
                Say hello
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <Link
                href="/lab"
                className="inline-flex items-center gap-3 px-6 py-3 rounded-xl font-medium border transition-colors hover:bg-white/5"
                style={{ borderColor: 'rgba(245,247,242,.12)', color: '#F5F7F2' }}
              >
                Try the lab
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
