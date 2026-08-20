"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';

/**
 * Route-level error boundary.
 *
 * The app previously had none, so any client-side throw — for example the
 * assessment reading past the end of its trial list — escaped to Next's default
 * error screen and destroyed all session state with no route back.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('[EMOCEAN] Unhandled error surfaced to route boundary:', error);
  }, [error]);

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: '#071318', color: '#F5F7F2' }}
    >
      <div className="w-full max-w-md">
        <div className="mb-6 text-4xl">🌊</div>
        <h1 className="mb-3 text-2xl font-semibold">Something broke on our side</h1>
        <p className="mb-8" style={{ color: '#A9BAB8' }}>
          This is a fault in the Lab, not something you did. Nothing was sent anywhere, and any
          session you had in progress stayed on your device.
        </p>

        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full rounded-xl py-4 font-medium transition-colors"
            style={{ backgroundColor: '#67E8D4', color: '#071318' }}
          >
            Try again
          </button>
          <Link
            href="/lab"
            className="block w-full rounded-xl border py-3 text-sm transition-colors"
            style={{ borderColor: 'rgba(245,247,242,.12)', color: '#F5F7F2' }}
          >
            Back to the Lab
          </Link>
        </div>

        {error.digest && (
          <p className="mt-8 font-mono text-xs" style={{ color: '#A9BAB8' }}>
            Reference: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
