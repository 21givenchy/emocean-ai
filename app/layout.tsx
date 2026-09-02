import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ROUTES, SITE_NAME, SITE_URL } from './lib/site';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

const home = ROUTES[0];

/**
 * Root metadata. `metadataBase` is what lets per-route `alternates.canonical`
 * and Open Graph URLs be written as relative paths and resolved to absolutes.
 * Without it, Next emits relative OG URLs, which crawlers ignore.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: home.title,
    // Routes set their own full title; this only applies to any that don't.
    template: `%s — ${SITE_NAME}`,
  },
  description: home.description,
  applicationName: SITE_NAME,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: home.title,
    description: home.description,
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: home.title,
    description: home.description,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-full bg-black text-white`}>{children}</body>
    </html>
  );
}
