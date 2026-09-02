/**
 * Canonical site constants.
 *
 * `SITE_URL` drives canonical URLs, Open Graph URLs, robots and the sitemap.
 * It must be an absolute origin with no trailing slash. Set
 * NEXT_PUBLIC_SITE_URL per environment so preview deploys do not advertise
 * production canonicals (which would have preview URLs competing with
 * production in search results).
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://emocean.studio').replace(
  /\/$/,
  '',
);

export const SITE_NAME = 'EMOCEAN';

/**
 * One entry per public route. Also the sitemap's source of truth, so a new
 * public page cannot be added without deciding its title and description.
 * `/lab/sensors` is deliberately absent: it is not public.
 */
export const ROUTES = [
  {
    path: '/',
    title: 'EMOCEAN — Find the interface that helps you read and focus better',
    description:
      'Complete a few short comparisons and leave with typography, spacing and contrast settings based on how you performed. No account, camera optional.',
    priority: 1,
  },
  {
    path: '/lab',
    title: 'The Lab — EMOCEAN',
    description:
      'Two short experiments that run in your browser: a task-based interface assessment, and a breathing-responsive world.',
    priority: 0.9,
  },
  {
    path: '/lab/interface',
    title: 'Find My Interface — EMOCEAN',
    description:
      'Compare typography, spacing and contrast while you read and search. Leave with an exportable Interface Kit for the task you came to do.',
    priority: 0.9,
  },
  {
    path: '/lab/breathe',
    title: 'Breathe the World Open — EMOCEAN',
    description:
      'A storm changes as you follow a breathing rhythm. Guided mode needs no camera; camera mode is an experimental demonstration of upper-body motion sensing.',
    priority: 0.8,
  },
  {
    path: '/research',
    title: 'Research — EMOCEAN',
    description:
      'What the research suggests, what we are testing, and what we cannot claim. Performance, preference and optional physiology are separate results.',
    priority: 0.6,
  },
  {
    path: '/methods',
    title: 'Methods — EMOCEAN',
    description:
      'How the assessment and the breathing estimate work, including known defects and current implementation gaps.',
    priority: 0.6,
  },
  {
    path: '/validation',
    title: 'Validation — EMOCEAN',
    description:
      'No validation study has been run. There is no accuracy figure here because we do not have one.',
    priority: 0.6,
  },
  {
    path: '/privacy',
    title: 'Privacy — EMOCEAN',
    description:
      'Local-only by design: no upload path, no telemetry endpoint, no server that could receive a session. What that does and does not cover.',
    priority: 0.5,
  },
  {
    path: '/for-teams',
    title: 'For teams — EMOCEAN',
    description:
      'Building blocks for adaptive interfaces, and an honest account of what is not validated yet.',
    priority: 0.4,
  },
  {
    path: '/sandbox',
    title: 'Developers — EMOCEAN',
    description:
      'The sensor pipeline as it exists today. There is no published package yet.',
    priority: 0.3,
  },
  {
    path: '/about',
    title: 'About — EMOCEAN',
    description:
      'A decade of making digital worlds respond to the body, turned into open, testable web experiences.',
    priority: 0.4,
  },
] as const;

export type RouteMeta = (typeof ROUTES)[number];

export function routeMeta(path: string): RouteMeta | undefined {
  return ROUTES.find((r) => r.path === path);
}
