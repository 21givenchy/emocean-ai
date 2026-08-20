"use client";

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { VisualMode, VisualTokens, modeMeta } from '@/app/lib/designTokens';
import {
  AssessmentScore,
  FactorScore,
  TrialResult,
  AssessmentMode,
  FACTORS,
  tokensToCSS,
  tokensToJSON,
  applyVariant,
} from '@/app/lib/assessment/engine';

interface SessionData {
  mode: VisualMode;
  assessmentMode: AssessmentMode;
  score: AssessmentScore;
  tokens: VisualTokens;
  results: TrialResult[];
  sessionId: string;
}

type LoadState = 'loading' | 'found' | 'missing';

/**
 * App Router passes `{ params, searchParams }` to a page — not arbitrary props.
 * The previous signature destructured `{ sessionId, onBack }`, so `sessionId`
 * was always `undefined`, the storage key resolved to
 * `emocean-session-undefined`, and the page sat on "Loading results…" forever
 * while `onBack` was an undefined function waiting to throw.
 *
 * In Next 16 `params` is a promise, unwrapped here with `React.use`.
 */
export default function ResultsPageClient({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const router = useRouter();

  const [session, setSession] = useState<SessionData | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const onBack = () => router.push('/lab');

  useEffect(() => {
    if (!sessionId) {
      setLoadState('missing');
      return;
    }

    const data = sessionStorage.getItem(`emocean-session-${sessionId}`);
    if (!data) {
      setLoadState('missing');
      return;
    }

    try {
      setSession(JSON.parse(data));
      setLoadState('found');
    } catch {
      setLoadState('missing');
    }
  }, [sessionId]);

  if (loadState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#071318', color: '#F5F7F2' }}>
        <div className="text-center">
          <div
            className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
            style={{ borderColor: '#67E8D4', borderTopColor: 'transparent' }}
          />
          <p style={{ color: '#A9BAB8' }}>Loading results…</p>
        </div>
      </div>
    );
  }

  if (loadState === 'missing' || !session) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
        style={{ backgroundColor: '#071318', color: '#F5F7F2' }}
      >
        <div className="w-full max-w-md">
          <h1 className="mb-3 text-2xl font-semibold">These results are no longer available</h1>
          <p className="mb-8" style={{ color: '#A9BAB8' }}>
            Session results are held only in this browser tab and are cleared when it closes. We do
            not keep a copy on a server, so there is nothing for us to restore.
          </p>
          <div className="space-y-3">
            <Link
              href="/lab/interface"
              className="block w-full rounded-xl py-4 font-medium transition-colors"
              style={{ backgroundColor: '#67E8D4', color: '#071318' }}
            >
              Run a new assessment
            </Link>
            <Link
              href="/lab"
              className="block w-full rounded-xl border py-3 text-sm transition-colors"
              style={{ borderColor: 'rgba(245,247,242,.12)', color: '#F5F7F2' }}
            >
              Back to the Lab
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { mode, assessmentMode, score, tokens, results } = session;
  const meta = modeMeta[mode];

  const handleCopy = (format: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const cssExport = tokensToCSS(tokens);
  const jsonExport = tokensToJSON(tokens, '1.0.0');
  const flatExport = JSON.stringify(
    Object.fromEntries(
      Object.entries(tokens.color).map(([k, v]) => [`--${k.replace(/([A-Z])/g, '-$1').toLowerCase()}`, v])
    ),
    null,
    2
  );

  const skippedCount = results.filter((r) => r.skipped).length;
  const completedCount = results.filter((r) => !r.skipped).length;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#071318', color: '#F5F7F2' }}>
      <nav className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between border-b" style={{ borderColor: 'rgba(245,247,242,.12)' }}>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm transition-colors"
          style={{ color: '#A9BAB8' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Lab
        </button>
        <span className="text-sm" style={{ color: '#A9BAB8' }}>
          {assessmentMode === 'quick' ? 'Quick' : 'Deep'} assessment results
        </span>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-sm font-medium uppercase tracking-wider mb-2" style={{ color: '#67E8D4' }}>
            {meta.label} mode
          </p>
          <h1 className="text-4xl font-bold mb-3">Your interface kit</h1>
          <p style={{ color: '#A9BAB8' }}>
            {completedCount} trials completed · {skippedCount} skipped
          </p>
        </div>

        {/* Confidence */}
        <div className="p-6 rounded-2xl border mb-8 text-center" style={{ backgroundColor: '#10242B', borderColor: 'rgba(245,247,242,.12)' }}>
          <p className="text-sm mb-2" style={{ color: '#A9BAB8' }}>Overall confidence</p>
          {score.overallConfidence === null ? (
            <>
              <div className="text-2xl font-semibold mb-2" style={{ color: '#F4B86A' }}>
                Not estimable
              </div>
              <p className="text-sm max-w-md mx-auto" style={{ color: '#A9BAB8' }}>
                This session did not include enough repeated trials to support a confidence
                estimate, so we are not showing one.{' '}
                {assessmentMode === 'quick'
                  ? 'A Deep assessment repeats each comparison, which makes the difference between options measurable.'
                  : 'Completing more trials would make the difference between options measurable.'}
              </p>
            </>
          ) : (
            <>
              <div className="text-5xl font-bold mb-2" style={{ color: '#67E8D4' }}>
                {Math.round(score.overallConfidence * 100)}%
              </div>
              <p className="text-sm" style={{ color: '#A9BAB8' }}>
                {score.overallConfidence >= 0.7
                  ? 'Strong evidence from repeated trials'
                  : score.overallConfidence >= 0.4
                  ? 'Moderate evidence — more trials would improve confidence'
                  : 'Limited evidence — results are preliminary'}
              </p>
            </>
          )}
        </div>

        {/* Factor breakdown */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Factor breakdown</h2>
          <div className="space-y-4">
            {score.factorScores.map((fs) => (
              <FactorBreakdown key={fs.factorId} factorScore={fs} tokens={tokens} />
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Preview</h2>
          <div
            className="rounded-2xl overflow-hidden border"
            style={{ backgroundColor: tokens.color.canvas, borderColor: 'rgba(245,247,242,.12)' }}
          >
            <div className="p-6 space-y-4" style={{ minHeight: '200px' }}>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium"
                  style={{ backgroundColor: tokens.color.accent, color: tokens.color.accentText }}
                >
                  A
                </div>
                <div>
                  <p className="font-medium text-sm">Amina</p>
                  <p className="text-xs" style={{ color: tokens.color.textSecondary }}>Active now</p>
                </div>
              </div>
              {[
                { sender: 'other', text: 'Hey, how is the project going?' },
                { sender: 'me', text: 'Good! Just finishing up the design review.' },
                { sender: 'other', text: 'Nice. Let me know if you need a second pair of eyes.' },
              ].map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className="max-w-[75%] px-4 py-2 rounded-2xl text-sm"
                    style={{
                      backgroundColor: msg.sender === 'me' ? tokens.color.outgoingBubble : tokens.color.incomingBubble,
                      color: msg.sender === 'me' ? tokens.color.outgoingBubbleText : tokens.color.incomingBubbleText,
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Export */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Export</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => handleCopy('css', cssExport)}
              className="p-5 rounded-xl border text-left transition-all hover:border-[#67E8D4]/30"
              style={{ backgroundColor: '#10242B', borderColor: 'rgba(245,247,242,.12)' }}
            >
              <p className="font-medium mb-1">CSS variables</p>
              <p className="text-xs" style={{ color: '#A9BAB8' }}>
                {copiedFormat === 'css' ? 'Copied!' : 'Copy to clipboard'}
              </p>
            </button>
            <button
              onClick={() => handleCopy('json', jsonExport)}
              className="p-5 rounded-xl border text-left transition-all hover:border-[#67E8D4]/30"
              style={{ backgroundColor: '#10242B', borderColor: 'rgba(245,247,242,.12)' }}
            >
              <p className="font-medium mb-1">JSON tokens</p>
              <p className="text-xs" style={{ color: '#A9BAB8' }}>
                {copiedFormat === 'json' ? 'Copied!' : 'Copy to clipboard'}
              </p>
            </button>
            <button
              onClick={() => handleCopy('flat', flatExport)}
              className="p-5 rounded-xl border text-left transition-all hover:border-[#67E8D4]/30"
              style={{ backgroundColor: '#10242B', borderColor: 'rgba(245,247,242,.12)' }}
            >
              <p className="font-medium mb-1">Flat JSON</p>
              <p className="text-xs" style={{ color: '#A9BAB8' }}>
                {copiedFormat === 'flat' ? 'Copied!' : 'Key-value pairs'}
              </p>
            </button>
          </div>
        </div>

        {/* Evidence boundary */}
        <div className="p-6 rounded-2xl border" style={{ backgroundColor: '#10242B', borderColor: 'rgba(245,247,242,.12)' }}>
          <h3 className="font-semibold mb-2">What this tells you</h3>
          <p className="text-sm mb-3" style={{ color: '#A9BAB8' }}>
            These results reflect this one session, in this one task context. They are not a
            personality label or a permanent trait. Your best interface may differ for other tasks,
            times of day, or mental states.
          </p>
          <p className="text-sm" style={{ color: '#A9BAB8' }}>
            The scores above currently combine how you performed with what you said you preferred.
            Those two things often disagree, and blending them can let a well-liked but slower option
            win. Read this as the best option measured in this session, not as &ldquo;the best option
            for you&rdquo;. Separating measured performance from stated preference is the next change
            to this engine.
          </p>
        </div>
      </main>
    </div>
  );
}

// ── Factor Breakdown ────────────────────────────────────────────────

function FactorBreakdown({
  factorScore,
  tokens,
}: {
  factorScore: FactorScore;
  tokens: VisualTokens;
}) {
  const factor = FACTORS.find((f) => f.id === factorScore.factorId);
  if (!factor) return null;

  return (
    <div
      className="p-5 rounded-xl border"
      style={{ backgroundColor: '#10242B', borderColor: 'rgba(245,247,242,.12)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-medium">{factor.label}</h3>
          <p className="text-xs" style={{ color: '#A9BAB8' }}>
            {factor.description} ·{' '}
            {factorScore.confidence === null ? (
              <span
                style={{ color: '#F4B86A' }}
                title={factorScore.confidenceUnavailableReason ?? undefined}
              >
                Confidence not estimable
              </span>
            ) : (
              <>Confidence: {Math.round(factorScore.confidence * 100)}%</>
            )}
          </p>
          {factorScore.confidence === null && factorScore.confidenceUnavailableReason && (
            <p className="text-xs mt-1 max-w-md" style={{ color: '#A9BAB8', opacity: 0.75 }}>
              {factorScore.confidenceUnavailableReason}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-sm font-medium" style={{ color: '#67E8D4' }}>
            {factor.variants.find((v) => v.id === factorScore.bestVariantId)?.label || '—'}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {factor.variants.map((variant) => {
          const vs = factorScore.variantScores[variant.id];
          const isBest = variant.id === factorScore.bestVariantId;
          const barWidth = vs ? Math.round(((vs.taskAvg * 0.5 + ((vs.selfReportAvg - 1) / 4) * 0.5)) * 100) : 0;

          return (
            <div key={variant.id} className="flex items-center gap-3">
              <span className="text-xs w-24 truncate" style={{ color: isBest ? '#67E8D4' : '#A9BAB8' }}>
                {variant.label} {isBest ? '✓' : ''}
              </span>
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#071318' }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: isBest ? '#67E8D4' : '#A9BAB8',
                  }}
                />
              </div>
              <span className="text-xs w-8 text-right" style={{ color: '#A9BAB8' }}>
                {vs ? vs.n : 0}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
