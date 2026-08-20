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
          What we know, and what we can prove.
        </h1>
        <p className="text-lg mb-12 max-w-2xl" style={{ color: '#A9BAB8' }}>
          EMOCEAN is built to process signals in your browser. We collect nothing you have not
          explicitly chosen to share. Where we have verified a claim we say so; where verification is
          still outstanding we say that instead of rounding it up to a guarantee.
        </p>

        <div className="space-y-10">
          <section>
            <h2 className="text-2xl font-semibold mb-4">What we process</h2>
            <div className="space-y-3" style={{ color: '#A9BAB8' }}>
              <div className="flex items-start gap-3">
                <span style={{ color: '#67E8D4' }}>·</span>
                <span><strong className="text-white">Camera feed</strong> — If you enable the camera, video frames are processed in your browser for expression estimation and experimental breathing and heart-rate estimates. We do not transmit or store frames ourselves, and we do not operate a server that could receive them. See the verification note below for the limits of what we can currently prove about our third-party dependencies.</span>
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

          <section className="p-8 rounded-2xl border" style={{ backgroundColor: '#10242B', borderColor: '#F4B86A40' }}>
            <div className="flex items-start gap-3">
              <span className="text-xl leading-none" style={{ color: '#F4B86A' }}>⚠</span>
              <div>
                <h2 className="text-2xl font-semibold mb-4">On-device processing: designed, not yet verified</h2>
                <p className="mb-3" style={{ color: '#A9BAB8' }}>
                  EMOCEAN is <strong className="text-white">designed</strong> so that camera frames,
                  physiological estimates and expression estimates are computed in your browser and
                  never sent anywhere. We have written no code that uploads them, and we run no
                  server that could receive them.
                </p>
                <p className="mb-3" style={{ color: '#A9BAB8' }}>
                  An earlier version of this page stated flatly that these things never leave your
                  device. We have removed that wording, because we had not actually verified it. The
                  Lab uses a third-party camera-sensing library, and some libraries in this category
                  offer an optional cloud API. Until we have audited its network behaviour ourselves,
                  an absolute guarantee is more than we can honestly make.
                </p>
                <p style={{ color: '#A9BAB8' }}>
                  <strong className="text-white">What we are doing about it:</strong> we are capturing
                  a full network trace of a live camera session and will publish it, along with the
                  result, on this page. If anything turns out to leave the browser, we will say so
                  plainly and either put it behind explicit consent or remove it.
                </p>
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
                <span><strong className="text-white">Revocable</strong> — You can withdraw at any time, and withdrawal means deletion. See <em>Data retention</em> below for exactly what that does and does not reach.</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Third-party services</h2>
            <p className="mb-3" style={{ color: '#A9BAB8' }}>
              EMOCEAN is hosted on Vercel. Vercel collects standard access logs (IP addresses, user agents, request timestamps) for infrastructure operation. These logs are subject to <a href="https://vercel.com/legal/privacy-policy" className="underline" style={{ color: '#67E8D4' }}>Vercel&rsquo;s privacy policy</a>.
            </p>
            <p style={{ color: '#A9BAB8' }}>
              No analytics, advertising, or tracking scripts are included in the application itself.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Data retention</h2>
            <p className="mb-3" style={{ color: '#A9BAB8' }}>
              Your session data is stored in your browser&rsquo;s own storage. Clearing your browser data
              clears your EMOCEAN data. We cannot read it and we cannot recover it for you.
            </p>
            <p className="mb-3" style={{ color: '#A9BAB8' }}>
              If you opt in to contribute a session to research, that contribution is held until you
              withdraw it. Withdrawal deletes it — we do not keep a copy. We aim to action deletion
              requests within thirty days of receiving them.
            </p>
            <p style={{ color: '#A9BAB8' }}>
              The one thing withdrawal cannot reach is analysis already published before you withdrew.
              If a contribution has already been aggregated into a published result, that result stays
              published; we cannot retract a number from a document that is already in the world. No
              such analysis has been published to date.
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
