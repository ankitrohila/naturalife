import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

const BASE_URL = process.env.NEXTAUTH_URL ?? 'http://localhost:3005'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, pages] = await Promise.all([
    prisma.product.findMany({ where: { status: 'ACTIVE' }, select: { slug: true, updatedAt: true } }),
    prisma.category.findMany({ select: { slug: true } }),
    prisma.page.findMany({ select: { slug: true, updatedAt: true } }).catch(() => []),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/shop`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/contact`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/custom-design`, changeFrequency: 'monthly', priority: 0.6 },
  ]

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${BASE_URL}/shop?category=${c.slug}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE_URL}/shop/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const pageRoutes: MetadataRoute.Sitemap = pages.map((p: any) => ({
    url: `${BASE_URL}/pages/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.4,
  }))

  return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...pageRoutes]
}
