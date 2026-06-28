import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  const dir = path.join(process.cwd(), 'public', 'images', 'products')
  const files = fs
    .readdirSync(dir)
    .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
    .sort()
  if (files.length === 0) throw new Error('No local product images found')

  const localPaths = files.map((f) => `/images/products/${f}`)
  console.log(`Found ${localPaths.length} local product images`)

  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'asc' },
    include: { images: true },
  })
  console.log(`Updating ${products.length} products...`)

  let i = 0
  for (const p of products) {
    const url = localPaths[i % localPaths.length]
    i++
    // Update existing primary image, or create one
    const primary = p.images.find((img) => img.isPrimary) ?? p.images[0]
    if (primary) {
      await prisma.productImage.update({ where: { id: primary.id }, data: { url } })
    } else {
      await prisma.productImage.create({
        data: { productId: p.id, url, altText: p.name, isPrimary: true, sortOrder: 0 },
      })
    }
  }
  console.log('✅ Local images assigned to all products')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
