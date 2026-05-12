import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Family Lavage Group',
    short_name: 'Family Lavage',
    description: 'Services de lavage auto premium à Marjane Casablanca.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563eb',
    icons: [
      {
        src: '/favicon.png?v=2',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  }
}
