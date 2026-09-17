import type { MetadataRoute } from 'next';
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Gully Games',
    short_name: 'Gully Games',
    description: 'A neighbourhood of Indian childhood games.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#f4f0e3',
    theme_color: '#284d40',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
