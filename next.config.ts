import type { NextConfig } from 'next';

/**
 * Security headers.
 *
 * Camera use and a WASM/worker sensor pipeline both constrain what is safe to
 * set, so the choices below are deliberate:
 *
 *  - `Permissions-Policy` allows `camera=(self)` only. The camera is a first-
 *    party feature; no embedded third party should be able to request it.
 *  - No `Cross-Origin-Embedder-Policy: require-corp`. It would enable
 *    SharedArrayBuffer (useful later for worker frame transfer) but currently
 *    breaks the self-hosted MediaPipe/LiteRT WASM loading path. Revisit when
 *    the worker boundary lands, and test the camera path before shipping it.
 *  - CSP is `Content-Security-Policy-Report-Only` first. The sensor pipeline
 *    needs `wasm-unsafe-eval` and blob workers; shipping it enforcing without
 *    a real-device pass would be how the camera silently dies on iOS. Promote
 *    to enforcing only after the device matrix is green.
 */
const csp = [
  "default-src 'self'",
  // Next injects inline bootstrap scripts; wasm-unsafe-eval is required by the
  // MediaPipe/LiteRT runtimes.
  "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  // Camera frames reach canvas/workers as blob: and data: URLs.
  "media-src 'self' blob:",
  "worker-src 'self' blob:",
  // Local-only: no upload path exists, so no remote connect target is allowed.
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

const nextConfig: NextConfig = {
  distDir: '.next',
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(self), microphone=(), geolocation=(), payment=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains',
          },
          { key: 'Content-Security-Policy-Report-Only', value: csp },
        ],
      },
    ];
  },
};

export default nextConfig;
