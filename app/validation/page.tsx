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
          Not yet measured.
        </h1>
        <p className="text-lg mb-12 max-w-2xl" style={{ color: '#A9BAB8' }}>
          We have not run a reference-instrument comparison of our camera-based breathing
          detection. Until we have, this page describes what we intend to do rather than what
          we have found. There is no accuracy figure here because we do not have one.
        </p>

        <div className="space-y-10">
          {/* Status */}
          <section
            className="p-8 rounded-2xl border"
            style={{ backgroundColor: '#10242B', borderColor: '#F4B86A40' }}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl leading-none" style={{ color: '#F4B86A' }}>
                ⚠
              </span>
              <div>
                <h2 className="text-2xl font-semibold mb-3">Current status</h2>
                <p className="mb-3" style={{ color: '#A9BAB8' }}>
                  Belt-referenced validation is <strong className="text-white">planned and has
                  not been carried out</strong>. No participants have been run. No error figure,
                  correlation, or success rate exists for the chest-motion adapter.
                </p>
                <p style={{ color: '#A9BAB8' }}>
                  Treat every breathing signal in the Lab as an{' '}
                  <strong className="text-white">unvalidated, experimental estimate</strong>. It
                  is there to drive a responsive experience, not to tell you anything reliable
                  about your body.
                </p>
              </div>
            </div>
          </section>

          {/* Planned protocol */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">The protocol we plan to run</h2>
            <p className="mb-4" style={{ color: '#A9BAB8' }}>
              Written here in advance so that the design is on record before any data is
              collected, and so the results can be checked against the plan.
            </p>
            <div className="space-y-3" style={{ color: '#A9BAB8' }}>
              <p>
                <strong className="text-white">Reference instrument:</strong> A respiration belt
                worn on the upper chest, recorded simultaneously with the camera signal, serving
                as the comparison standard.
              </p>
              <p>
                <strong className="text-white">Test condition:</strong> The EMOCEAN chest-motion
                adapter running on ordinary consumer webcams, with frame timing measured rather
                than assumed.
              </p>
              <p>
                <strong className="text-white">Breathing conditions:</strong> Both paced
                breathing across a range of rates and unpaced natural breathing, since the two
                behave differently and reporting only the paced case would flatter the adapter.
              </p>
              <p>
                <strong className="text-white">Participants and environment:</strong> Recruited
                to cover a range of skin tones, body types, clothing and lighting conditions.
                A comparison run only under favourable conditions would not tell us what happens
                in real use.
              </p>
            </div>
          </section>

          {/* Reporting commitment */}
          <section
            className="p-8 rounded-2xl border"
            style={{ backgroundColor: '#10242B', borderColor: 'rgba(245,247,242,.12)' }}
          >
            <h2 className="text-2xl font-semibold mb-4">What we will publish</h2>
            <p className="mb-4" style={{ color: '#A9BAB8' }}>
              When the comparison has been run, we will report these together, in one place. An
              error figure on its own is misleading if the sessions it excludes are not counted
              alongside it.
            </p>
            <div className="space-y-3" style={{ color: '#A9BAB8' }}>
              <div className="flex items-start gap-3">
                <span style={{ color: '#67E8D4' }}>·</span>
                <span>
                  <strong className="text-white">Error</strong> — how far the camera estimate
                  sits from the belt reference, broken down by breathing rate rather than
                  averaged into a single headline number.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span style={{ color: '#67E8D4' }}>·</span>
                <span>
                  <strong className="text-white">Valid coverage</strong> — what proportion of
                  recorded time produced a usable estimate at all, rather than only scoring the
                  moments where the adapter was confident.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span style={{ color: '#67E8D4' }}>·</span>
                <span>
                  <strong className="text-white">Failure rate</strong> — how often a session
                  produced nothing usable, and under which conditions it failed.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span style={{ color: '#67E8D4' }}>·</span>
                <span>
                  <strong className="text-white">Comparison to published work</strong> — how our
                  figures sit against peer-reviewed camera-based respiration results, including
                  the ones less favourable to us.
                </span>
              </div>
            </div>
          </section>

          {/* Why the page looks like this */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Why this page has no numbers</h2>
            <p className="mb-3" style={{ color: '#A9BAB8' }}>
              An earlier version of this page presented a completed belt-comparison study with
              specific error and correlation figures. That study was never conducted and those
              figures were not real. They have been removed.
            </p>
            <p style={{ color: '#A9BAB8' }}>
              We are recording that here rather than quietly deleting it, because a lab that
              publishes numbers it did not measure should have to say so. Any figure that appears
              on this page in future will be one we have measured and can show the workings for.
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
