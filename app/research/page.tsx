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
              <strong className="text-white">What we can claim:</strong> Respiratory entrainment is a well-documented phenomenon (Lehrer &amp; Gevirtz, 2014). Guided paced breathing, where the pacing comes from the interface rather than from a sensor, rests on that published work.
            </p>
            <p style={{ color: '#A9BAB8' }}>
              <strong className="text-white">What we cannot claim:</strong> That our webcam-derived breathing estimate is accurate. We have not compared it against a reference instrument, so we do not know its error — see <Link href="/validation" className="underline" style={{ color: '#67E8D4' }}>Validation</Link>. We also cannot claim it approaches medical-grade plethysmography, or that short sessions produce lasting clinical outcomes.
            </p>
          </section>

          <section className="p-8 rounded-2xl border" style={{ backgroundColor: '#10242B', borderColor: 'rgba(245,247,242,.12)' }}>
            <h2 className="text-2xl font-semibold mb-4">Physiology-informed interface adaptation</h2>
            <p className="mb-3" style={{ color: '#A9BAB8' }}>
              Research in affective computing suggests that physiological signals—heart rate, heart-rate variability, skin conductance—carry information about arousal and attention. Several studies have explored using these signals to adapt digital interfaces (e.g., adjusting contrast, spacing, or notification frequency).
            </p>
            <p className="mb-3" style={{ color: '#A9BAB8' }}>
              <strong className="text-white">Our approach:</strong> Find My Interface produces three
              kinds of result, and they are not interchangeable. Measured task performance is what
              actually happened. Stated preference is what you said you liked. Optional physiology is
              context only — it never overrules either of the other two. Where preference and measured
              performance disagree, we show you the disagreement rather than quietly resolving it.
            </p>
            <p className="mb-3" style={{ color: '#A9BAB8' }}>
              <strong className="text-white">Why performance is the protected result:</strong> people
              do not reliably prefer the interfaces they perform best with. Reading speed and stated
              preference frequently point in different directions. So a result that lets a
              well-liked-but-slower option win, and then reports it as a measurement, is not a
              measurement.
            </p>
            <p className="mb-3 p-4 rounded-xl text-sm" style={{ color: '#F4B86A', backgroundColor: '#F4B86A10' }}>
              <strong>Current implementation gap:</strong> the sessions running in the Lab today still
              score variants by combining task performance and self-report into a single number, which
              is the thing this section argues against. Separating the three results is the next change
              to the assessment engine. Until it ships, treat a session&rsquo;s recommended variant as a
              blended preference signal, not a performance measurement.
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
                <span>A surveillance tool. Camera processing is designed to run on your device, and we only ask for research data if you explicitly opt in. We are currently auditing our dependencies to verify that no camera-derived data leaves the browser, and will publish the result — see <Link href="/privacy" className="underline" style={{ color: '#67E8D4' }}>Privacy</Link>.</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Selected references</h2>
            <div className="space-y-3 text-sm" style={{ color: '#A9BAB8' }}>
              <p>Lehrer, P. M., &amp; Gevirtz, R. (2014). Heart rate variability biofeedback: How and why does it work? <em>Frontiers in Psychology</em>, 5, 756.</p>
              <p>Picard, R. W. (2000). <em>Affective Computing</em>. MIT Press.</p>
              <p>Bujić, M., &amp; Hamari, J. (2026). SYNAPSE: A sociotechnical taxonomy of bioadaptive media. <em>CHI &rsquo;26</em>. doi:10.1145/3772318.3790860</p>
              {/*
                Two references previously listed here — attributed to
                "Rickles, D., et al. (2024), ACM Computing Surveys" and
                "van der Schaar, P. J., et al. (2023), IEEE Access" — were removed
                on 2026-08-20. Neither could be located in ACM DL, IEEE Xplore, or
                any other index, and both appear to have been fabricated.
                Do not reinstate them. Replacements must come from the verified
                Evidence Index with resolvable DOIs.
              */}
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
