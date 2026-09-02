"use client";

import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#071318', color: '#F5F7F2' }}>
      <nav className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#67E8D4' }}>
            <svg className="w-6 h-6" fill="none" stroke="#071318" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
          <span className="font-semibold text-lg">EMOCEAN</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm" style={{ color: '#A9BAB8' }}>
          <Link href="/lab/interface" className="hover:text-white transition-colors">Find my interface</Link>
          <Link href="/lab/breathe" className="hover:text-white transition-colors">Breathe</Link>
          <Link href="/research" className="hover:text-white transition-colors">Research</Link>
          <Link href="/for-teams" className="hover:text-white transition-colors">For teams</Link>
          <Link href="/about" className="hover:text-white transition-colors">About</Link>
        </div>
        <Link
          href="/lab/interface"
          className="px-5 py-2.5 rounded-full text-sm font-medium transition-colors"
          style={{ backgroundColor: '#67E8D4', color: '#071318' }}
        >
          Find my interface
        </Link>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <div className="max-w-3xl mb-24">
          <p className="text-sm font-medium uppercase tracking-widest mb-4" style={{ color: '#67E8D4' }}>
            EMOCEAN · Bioadaptive Experience Lab
          </p>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
            Find the interface that helps you{' '}
            <span className="block" style={{ color: '#67E8D4' }}>
              read and focus better.
            </span>
          </h1>
          <p className="text-xl mb-8 max-w-2xl" style={{ color: '#A9BAB8' }}>
            Complete a few short comparisons. Leave with typography, spacing and contrast settings
            based on how you performed—not a personality label.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/lab/interface"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl text-lg font-medium transition-colors"
              style={{ backgroundColor: '#67E8D4', color: '#071318' }}
            >
              Find my interface
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/lab/breathe"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl text-lg font-medium border transition-colors hover:bg-white/5"
              style={{ borderColor: 'rgba(245,247,242,.12)', color: '#F5F7F2' }}
            >
              See the breathing world
            </Link>
          </div>
          <p className="mt-4 text-sm" style={{ color: '#A9BAB8' }}>
            No account. Camera optional. Results stay in this session unless you export them.
          </p>
        </div>

        {/* ── Primary utility: Find My Interface ───────────────── */}
        <div className="mb-24">
          <div className="p-8 md:p-10 rounded-2xl border" style={{ backgroundColor: '#10242B', borderColor: 'rgba(103,232,212,.28)' }}>
            <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: '#67E8D4' }}>
              Start here
            </p>
            <h2 className="text-3xl font-semibold mb-3">Find My Interface</h2>
            <p className="text-lg mb-6 max-w-2xl" style={{ color: '#A9BAB8' }}>
              Compare typography, spacing, contrast and motion while you read, search and reply. The
              result is a set of settings for the task you came to do—exportable, and specific to
              this session rather than to a type of person.
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm mb-8" style={{ color: '#A9BAB8' }}>
              <span>5–10 min</span>
              <span>·</span>
              <span>No camera needed</span>
              <span>·</span>
              <span>Exportable settings</span>
              <span>·</span>
              <span>&ldquo;No clear difference&rdquo; is a valid outcome</span>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {[
                { step: '1', title: 'Choose a goal', desc: 'The same interface is not best for every task.' },
                { step: '2', title: 'Complete short comparisons', desc: 'We measure task outcomes, and separately ask what felt better.' },
                { step: '3', title: 'Take the settings with you', desc: 'Export the kit, or keep it for this session only.' },
              ].map((item) => (
                <div key={item.step}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-3" style={{ backgroundColor: '#67E8D4', color: '#071318' }}>
                    {item.step}
                  </div>
                  <h3 className="font-medium mb-1">{item.title}</h3>
                  <p className="text-sm" style={{ color: '#A9BAB8' }}>{item.desc}</p>
                </div>
              ))}
            </div>

            <Link
              href="/lab/interface"
              className="inline-flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-colors"
              style={{ backgroundColor: '#67E8D4', color: '#071318' }}
            >
              Find my interface
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>

        {/* ── Bridge to Breathe (secondary showcase) ───────────── */}
        <div className="mb-24">
          <div className="p-8 rounded-2xl border" style={{ borderColor: 'rgba(245,247,242,.12)' }}>
            <div className="md:flex md:items-start md:justify-between md:gap-10">
              <div className="max-w-2xl">
                <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: '#7DD3B0' }}>
                  Also in the lab
                </p>
                <h2 className="text-2xl font-semibold mb-3">Breathe the World Open</h2>
                <p className="mb-4" style={{ color: '#A9BAB8' }}>
                  Software can respond to more than clicks. In Breathe the World Open, a storm changes
                  as you follow a breathing rhythm. Camera mode is an experimental demonstration of
                  upper-body motion sensing.
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm" style={{ color: '#A9BAB8' }}>
                  <span>3–5 min</span>
                  <span>·</span>
                  <span>Guided mode works with no camera</span>
                  <span>·</span>
                  <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#F4B86A20', color: '#F4B86A' }}>
                    Camera mode: experimental
                  </span>
                </div>
              </div>
              <Link
                href="/lab/breathe"
                className="mt-6 md:mt-1 inline-flex shrink-0 items-center gap-2 px-6 py-3 rounded-xl font-medium border transition-colors hover:bg-white/5"
                style={{ borderColor: 'rgba(245,247,242,.2)', color: '#F5F7F2' }}
              >
                See the breathing world
              </Link>
            </div>
          </div>
        </div>

        {/* ── Brand promise ───────────────────────────────────── */}
        <div className="mb-24 max-w-3xl">
          <h2 className="text-2xl font-semibold mb-4">What EMOCEAN claims, and what it does not.</h2>
          <p className="text-lg" style={{ color: '#A9BAB8' }}>
            EMOCEAN explores how digital experiences can adapt to what you do and to signals you
            choose to share. It measures observable behavior and signal quality. It does not claim to
            know how you feel.
          </p>
          <Link href="/methods" className="inline-block mt-4 text-sm font-medium" style={{ color: '#67E8D4' }}>
            Read the methods →
          </Link>
        </div>

        {/* ── Research lineage ────────────────────────────────── */}
        <div className="mb-24 max-w-3xl">
          <h2 className="text-2xl font-semibold mb-4">A decade of making digital worlds respond to the body.</h2>
          <p className="mb-4" style={{ color: '#A9BAB8' }}>
            The team previously explored VR breath biofeedback and environments that became calmer as
            participants regained physiological control. EMOCEAN turns that lineage into open,
            testable web experiences.
          </p>
          <Link href="/research" className="text-sm font-medium" style={{ color: '#67E8D4' }}>
            Explore the research →
          </Link>
        </div>

        {/* ── Future layer: teams ────────────────────────────── */}
        <div className="pt-8 border-t" style={{ borderColor: 'rgba(245,247,242,.12)' }}>
          <div className="md:flex md:items-baseline md:justify-between md:gap-10">
            <div className="max-w-2xl">
              <h2 className="text-lg font-semibold mb-2">Working on adaptive interfaces?</h2>
              <p className="text-sm" style={{ color: '#A9BAB8' }}>
                We are exploring building blocks for teams building focus tools, learning
                products and games. There is no published package yet—these experiences are how the
                mechanics get tested first.
              </p>
            </div>
            <Link href="/for-teams" className="inline-block mt-4 md:mt-0 text-sm font-medium shrink-0" style={{ color: '#67E8D4' }}>
              Talk to the lab →
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t py-8" style={{ borderColor: 'rgba(245,247,242,.12)' }}>
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4 text-sm" style={{ color: '#A9BAB8' }}>
          <span>© EMOCEAN</span>
          <div className="flex flex-wrap gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/research" className="hover:text-white transition-colors">Research</Link>
            <Link href="/methods" className="hover:text-white transition-colors">Methods</Link>
            <Link href="/validation" className="hover:text-white transition-colors">Validation</Link>
            <Link href="/sandbox" className="hover:text-white transition-colors">Developers</Link>
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
