import type { Metadata } from 'next';
import { routeMeta } from '../../lib/site';

// Route metadata lives in a server-component layout because the page itself is
// a client component, and Next only reads `metadata` from server components.
// Titles and descriptions are centralised in app/lib/site.ts, which is also the
// sitemap's source of truth — so a public route cannot exist without metadata.
const meta = routeMeta('/lab/interface')!;

export const metadata: Metadata = {
  title: { absolute: meta.title },
  description: meta.description,
  alternates: { canonical: '/lab/interface' },
  openGraph: { title: meta.title, description: meta.description, url: '/lab/interface' },
  twitter: { title: meta.title, description: meta.description },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
