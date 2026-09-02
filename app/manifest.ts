import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'EMOCEAN — Bioadaptive Experience Lab',
    short_name: 'EMOCEAN',
    description:
      'Find the interface that helps you read and focus better, and a breathing-responsive world.',
    start_url: '/',
    display: 'standalone',
    // Matches the ink-black base of the visual system.
    background_color: '#071318',
    theme_color: '#071318',
    icons: [{ src: '/favicon.ico', sizes: 'any', type: 'image/x-icon' }],
  };
}
