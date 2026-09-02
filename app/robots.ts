import type { MetadataRoute } from 'next';
import { SITE_URL } from './lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Developer diagnostic: 404s outside development anyway, but keep it out
      // of crawl budget and out of search results.
      disallow: ['/lab/sensors'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
