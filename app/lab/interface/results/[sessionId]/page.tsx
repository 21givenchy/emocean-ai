"use client";

import React, { useState, useEffect } from 'react';
import { VisualMode, VisualTokens, modeMeta, defaultTokens } from '@/app/lib/designTokens';
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

interface ResultsPageProps {
  sessionId: string;
  onBack: () => void;
}

interface SessionData {
  mode: VisualMode;
  assessmentMode: AssessmentMode;
  score: AssessmentScore;
  tokens: VisualTokens;
  results: TrialResult[];
  sessionId: string;
}

export default function ResultsPageClient({ sessionId, onBack }: ResultsPageProps) {
  const [session, setSession] = useState<SessionData | null>(null);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  useEffect(() => {
    const data = sessionStorage.getItem(`emocean-session-${sessionId}`);
    if (data) {
      try {
        setSession(JSON.parse(data));
      } catch {
        // ignore
      }
    }
  }, [sessionId]);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#071318', color: '#F5F7F2' }}>
        <div className="text-center">
          <p style={{ color: '#A9BAB8' }}>Loading results…</p>
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
          <p className="text-sm" style={{ color: '#A9BAB8' }}>
            These results reflect your preferences for this specific task context. They are not a
            personality label or a permanent trait. Your best interface may differ for other tasks,
            times of day, or mental states. Physiology data (if collected) provides additional context
            but never overrides your stated preference.
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
            {factor.description} · Confidence: {Math.round(factorScore.confidence * 100)}%
          </p>
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
