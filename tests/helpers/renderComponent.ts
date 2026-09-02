/**
 * Static-render helper for component tests.
 *
 * Node's built-in TypeScript support strips types but cannot transform JSX, so
 * `.tsx` component files can't be imported by the test runner directly
 * (ERR_UNKNOWN_FILE_EXTENSION). esbuild — already present as a Next dependency
 * — bundles the component tree to plain JS first, which the runner can import.
 *
 * The bundle is cached per entry so a suite with several cases pays the build
 * cost once.
 */

import { build } from 'esbuild';
import { mkdir, mkdtemp, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const cache = new Map<string, Promise<Record<string, unknown>>>();

export function loadTsx(entry: string): Promise<Record<string, unknown>> {
  const existing = cache.get(entry);
  if (existing) return existing;

  const built = (async () => {
    // Deliberately inside the project, not the OS temp dir: `react` is kept
    // external so the test and the bundle share one React instance, and a
    // bundle in /tmp cannot resolve it (no node_modules above it).
    const cacheDir = join(process.cwd(), 'node_modules', '.cache');
    await mkdir(cacheDir, { recursive: true });
    const dir = await mkdtemp(join(cacheDir, 'emocean-test-'));
    const outfile = join(dir, 'bundle.mjs');
    await build({
      entryPoints: [entry],
      outfile,
      bundle: true,
      format: 'esm',
      platform: 'node',
      jsx: 'automatic',
      // React and react-dom stay external so the test and the bundle share one
      // React instance; two copies would break rendering.
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      // `@/` is the app's tsconfig path alias.
      alias: { '@': process.cwd() },
      logLevel: 'silent',
    });
    // Confirm something was actually emitted before importing it.
    const code = await readFile(outfile, 'utf8');
    if (code.trim().length === 0) throw new Error(`empty bundle for ${entry}`);
    return import(pathToFileURL(outfile).href) as Promise<Record<string, unknown>>;
  })();

  cache.set(entry, built);
  return built;
}
