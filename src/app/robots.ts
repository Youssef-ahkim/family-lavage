import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  // Use environment variable for base URL or fallback to a placeholder
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://familylavage.com'
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/profile/', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
