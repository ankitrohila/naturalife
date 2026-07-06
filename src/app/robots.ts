import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXTAUTH_URL ?? 'http://localhost:3005'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/account', '/api', '/checkout', '/cart', '/order-success'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
