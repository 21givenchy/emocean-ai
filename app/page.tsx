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
          <Link href="/lab" className="hover:text-white transition-colors">Lab</Link>
          <Link href="/research" className="hover:text-white transition-colors">Research</Link>
          <Link href="/for-teams" className="hover:text-white transition-colors">For teams</Link>
          <Link href="/about" className="hover:text-white transition-colors">About</Link>
        </div>
        <Link
          href="/lab"
          className="px-5 py-2.5 rounded-full text-sm font-medium transition-colors"
          style={{ backgroundColor: '#67E8D4', color: '#071318' }}
        >
          Enter the lab
        </Link>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        <div className="max-w-3xl mb-20">
          <p className="text-sm font-medium uppercase tracking-widest mb-4" style={{ color: '#67E8D4' }}>
            EMOCEAN · Bioadaptive Experience Lab
          </p>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
            Your interface can learn
            <span className="block" style={{ color: '#67E8D4' }}>
              how you work best.
            </span>
          </h1>
          <p className="text-xl mb-8 max-w-xl" style={{ color: '#A9BAB8' }}>
            Try two short, private experiments. Discover interface settings that support a real task—or use your breath to change a living digital world.
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
              Breathe the world open
            </Link>
          </div>
          <p className="mt-4 text-sm" style={{ color: '#A9BAB8' }}>
            No account required · Camera optional · Processing stays on this device unless you explicitly join a study
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-20">
          <Link href="/lab/interface" className="group p-8 rounded-2xl border transition-all hover:border-[#67E8D4]/30" style={{ backgroundColor: '#10242B', borderColor: 'rgba(245,247,242,.12)' }}>
            <div className="text-3xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">Find My Interface</h3>
            <p className="text-sm mb-4" style={{ color: '#A9BAB8' }}>
              Compare typography, spacing, contrast, and motion while you read, search, and reply. Leave with a context-specific interface kit—not a personality label.
            </p>
            <div className="flex items-center gap-4 text-xs" style={{ color: '#A9BAB8' }}>
              <span>5–10 min</span>
              <span>·</span>
              <span>Camera optional</span>
              <span>·</span>
              <span>Exportable settings</span>
            </div>
          </Link>

          <Link href="/lab/breathe" className="group p-8 rounded-2xl border transition-all hover:border-[#7DD3B0]/30" style={{ backgroundColor: '#10242B', borderColor: 'rgba(245,247,242,.12)' }}>
            <div className="text-3xl mb-4">🌊</div>
            <h3 className="text-xl font-semibold mb-2">Breathe the World Open</h3>
            <p className="text-sm mb-4" style={{ color: '#A9BAB8' }}>
              A stormed-over world responds as your breathing becomes slower and steadier. Restore light, calm the weather, and learn a regulation skill you can take with you.
            </p>
            <div className="flex items-center gap-4 text-xs" style={{ color: '#A9BAB8' }}>
              <span>3–5 min</span>
              <span>·</span>
              <span>Webcam, wearable, or guided mode</span>
            </div>
          </Link>
        </div>

        <div className="mb-20">
          <h2 className="text-2xl font-semibold mb-8">How it works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Choose a goal', desc: 'The same interface is not best for every task.' },
              { step: '2', title: 'Complete short comparisons', desc: 'We measure task outcomes and ask what felt better.' },
              { step: '3', title: 'Add signals if you want', desc: 'Physiology can provide context; it never overrules your result.' },
              { step: '4', title: 'Take something useful', desc: 'Export a theme, a breathing summary, or a research-ready session file.' },
            ].map((item) => (
              <div key={item.step} className="p-6 rounded-xl" style={{ backgroundColor: '#10242B' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-3" style={{ backgroundColor: '#67E8D4', color: '#071318' }}>
                  {item.step}
                </div>
                <h3 className="font-medium mb-1">{item.title}</h3>
                <p className="text-sm" style={{ color: '#A9BAB8' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-20 p-8 rounded-2xl border" style={{ backgroundColor: '#10242B', borderColor: 'rgba(245,247,242,.12)' }}>
          <h2 className="text-2xl font-semibold mb-4">Bioadaptive, not mind-reading.</h2>
          <p style={{ color: '#A9BAB8' }}>
            EMOCEAN estimates observable signals and task outcomes. It does not know your inner emotion, diagnose health, or claim one permanent &ldquo;best&rdquo; design. When signal quality is low, the experience pauses adaptation and tells you.
          </p>
        </div>

        <div className="mb-20">
          <h2 className="text-2xl font-semibold mb-4">A decade of making digital worlds respond to the body.</h2>
          <p className="mb-4" style={{ color: '#A9BAB8' }}>
            The team previously explored VR breath biofeedback and environments that became calmer as participants regained physiological control. EMOCEAN turns that lineage into open, testable web experiences.
          </p>
          <Link href="/research" className="text-sm font-medium" style={{ color: '#67E8D4' }}>
            Explore the research →
          </Link>
        </div>

        <div className="p-8 rounded-2xl border" style={{ backgroundColor: '#10242B', borderColor: 'rgba(245,247,242,.12)' }}>
          <h2 className="text-2xl font-semibold mb-4">Build the next responsive world with us.</h2>
          <p className="mb-4" style={{ color: '#A9BAB8' }}>
            We are developing validated building blocks for games, learning tools, focus products, and generated media. Partners can test adaptive mechanics before integrating them.
          </p>
          <Link href="/for-teams" className="text-sm font-medium" style={{ color: '#67E8D4' }}>
            Talk to the lab →
          </Link>
        </div>
      </main>

      <footer className="border-t py-8" style={{ borderColor: 'rgba(245,247,242,.12)' }}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-sm" style={{ color: '#A9BAB8' }}>
          <span>© EMOCEAN</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/research" className="hover:text-white transition-colors">Research</Link>
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
