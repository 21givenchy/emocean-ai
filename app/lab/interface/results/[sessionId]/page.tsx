"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { VisualTokens, defaultTokens, modeMeta, VisualMode } from '@/app/lib/designTokens';

interface SessionResult {
  mode: VisualMode;
  name: string;
  tokens: VisualTokens;
}

export default function ResultsPage({ params }: { params: { sessionId: string } }) {
  const [result, setResult] = useState<SessionResult | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(`emocean-session-${params.sessionId}`);
    if (stored) {
      try { setResult(JSON.parse(stored)); } catch {}
    }
  }, [params.sessionId]);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#071318', color: '#F5F7F2' }}>
        <p style={{ color: '#A9BAB8' }}>Loading results...</p>
      </div>
    );
  }

  const meta = modeMeta[result.mode];

  const handleExportCSS = () => {
    const css = `:root {
  --canvas: ${result.tokens.color.canvas};
  --surface: ${result.tokens.color.surface};
  --text-primary: ${result.tokens.color.textPrimary};
  --text-secondary: ${result.tokens.color.textSecondary};
  --accent: ${result.tokens.color.accent};
  --border: ${result.tokens.color.border};
}`;
    navigator.clipboard.writeText(css);
  };

  const handleExportJSON = () => {
    const data = {
      version: '1.0',
      mode: result.mode,
      name: result.name,
      tokens: result.tokens,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emocean-${result.mode}-interface-kit.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#071318', color: '#F5F7F2' }}>
      <nav className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/lab" className="flex items-center gap-2" style={{ color: '#A9BAB8' }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Lab
        </Link>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <p className="text-sm font-medium uppercase tracking-wider mb-2" style={{ color: '#67E8D4' }}>
            Your {meta.label} interface kit
          </p>
          <h1 className="text-4xl font-bold mb-3">{result.name}</h1>
          <p style={{ color: '#A9BAB8' }}>{meta.description}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="rounded-2xl overflow-hidden border" style={{ backgroundColor: result.tokens.color.surface, borderColor: 'rgba(245,247,242,.12)' }}>
            <div className="p-4 space-y-3" style={{ backgroundColor: result.tokens.color.canvas, minHeight: '200px' }}>
              <div className="flex justify-end">
                <div className="px-4 py-2 rounded-2xl text-sm" style={{ backgroundColor: result.tokens.color.outgoingBubble, color: result.tokens.color.outgoingBubbleText }}>
                  Preview of your interface
                </div>
              </div>
              <div className="flex justify-start">
                <div className="px-4 py-2 rounded-2xl text-sm" style={{ backgroundColor: result.tokens.color.incomingBubble, color: result.tokens.color.incomingBubbleText }}>
                  This is how messages will look with your settings.
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-6 rounded-2xl border" style={{ backgroundColor: '#10242B', borderColor: 'rgba(245,247,242,.12)' }}>
              <h3 className="font-semibold mb-4">Your palette</h3>
              {[
                { label: 'Background', color: result.tokens.color.canvas },
                { label: 'Surface', color: result.tokens.color.surface },
                { label: 'Text', color: result.tokens.color.textPrimary },
                { label: 'Accent', color: result.tokens.color.accent },
              ].map(({ label, color }) => (
                <div key={label} className="flex items-center gap-3 mb-2">
                  <div className="w-6 h-6 rounded border" style={{ backgroundColor: color, borderColor: 'rgba(245,247,242,.12)' }} />
                  <span className="text-sm flex-1">{label}</span>
                  <span className="text-xs font-mono" style={{ color: '#A9BAB8' }}>{color}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 justify-center">
          <button onClick={handleExportCSS} className="px-6 py-3 rounded-xl font-medium border transition-colors hover:bg-white/5" style={{ borderColor: 'rgba(245,247,242,.12)' }}>
            Copy CSS variables
          </button>
          <button onClick={handleExportJSON} className="px-6 py-3 rounded-xl font-medium transition-colors" style={{ backgroundColor: '#67E8D4', color: '#071318' }}>
            Export JSON kit
          </button>
        </div>
      </main>
    </div>
  );
}
