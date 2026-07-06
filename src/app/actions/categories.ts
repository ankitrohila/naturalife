'use server'

import { prisma } from '@/lib/prisma'

export interface NavigationCategory {
  id: string
  name: string
  slug: string
  image: string | null
  children: { id: string; name: string; slug: string; productCount: number }[]
  featuredProducts: { id: string; name: string; slug: string; image: string | null; price: number | null }[]
}

export async function getNavigationCategories(): Promise<NavigationCategory[]> {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { sortOrder: 'asc' },
    include: {
      children: {
        orderBy: { sortOrder: 'asc' },
        include: { _count: { select: { products: true } } },
      },
      _count: { select: { products: true } },
    },
  })

  const featuredByCategory = await Promise.all(
    categories.map((cat) =>
      prisma.product.findMany({
        where: { status: 'ACTIVE', category: { id: cat.id } },
        orderBy: [{ isFeatured: 'desc' }, { isOnSale: 'desc' }, { createdAt: 'desc' }],
        take: 3,
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          variants: { orderBy: { price: 'asc' }, take: 1 },
        },
      })
    )
  )

  return categories.map((cat, i) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    image: cat.image,
    children: cat.children.map((child) => ({
      id: child.id,
      name: child.name,
      slug: child.slug,
      productCount: child._count.products,
    })),
    featuredProducts: featuredByCategory[i].map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      image: p.images[0]?.url ?? null,
      price: p.variants[0] ? Number(p.variants[0].price) : null,
    })),
  }))
}
