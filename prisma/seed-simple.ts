import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")
  
  // Create admin user
  const hashedPassword = await hash("admin123", 12)
  const admin = await prisma.user.upsert({
    where: { primaryEmail: "admin@naturalife.in" },
    update: {},
    create: {
      primaryEmail: "admin@naturalife.in",
      primaryPhone: "+919999900000",
      name: "Admin User",
      password: hashedPassword,
      role: "ADMIN",
      preferredLanguage: "EN",
    },
  })
  
  console.log("✓ Admin user created: admin@naturalife.in / admin123")
  
  // Create categories
  const categories = [
    { name: "Doormats", slug: "doormats" },
    { name: "Rugs", slug: "rugs" },
    { name: "Dhurries", slug: "dhurries" },
    { name: "Carpets", slug: "carpets" },
    { name: "Mats", slug: "mats" },
    { name: "Cushion Covers", slug: "cushion-covers" },
    { name: "Table Mats", slug: "table-mats" },
    { name: "Stools", slug: "stools" },
    { name: "Chef Mats", slug: "chef-mats" },
  ]
  
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
        description: `Premium ${cat.name}`,
      },
    })
  }
  
  console.log("✓ 9 categories created")
  console.log("\n✅ Database seeded successfully!")
  console.log("👤 Login: admin@naturalife.in / admin123")
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
