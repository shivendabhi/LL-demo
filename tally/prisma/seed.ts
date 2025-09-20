import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create a demo user
  const user = await prisma.user.upsert({
    where: { email: 'shiven.dabhi@gmail.com' },
    update: {},
    create: {
      email: 'shiven.dabhi@gmail.com',
      name: 'Shiven Dabhi',
    },
  })

  // Seed materials resembling the mock UI
  const materials = [
    { name: 'Gildan T-Shirt', color: 'Red', size: 'M', quantity: 13 },
    { name: 'Gildan T-Shirt', color: 'Red', size: 'L', quantity: 46 },
    { name: 'Gildan T-Shirt', color: 'Black', size: 'S', quantity: 21 },
    { name: 'Gildan T-Shirt', color: 'Black', size: 'M', quantity: 34 },
    { name: 'Gildan T-Shirt', color: 'Black', size: 'L', quantity: 27 },
    { name: 'Gildan T-Shirt', color: 'White', size: 'S', quantity: 34 },
    { name: 'Gildan T-Shirt', color: 'White', size: 'M', quantity: 51 },
    { name: 'Gildan T-Shirt', color: 'White', size: 'L', quantity: 29 },
  ]

  for (const m of materials) {
    await prisma.material.create({
      data: {
        userId: user.id,
        name: m.name,
        color: m.color,
        size: m.size,
        quantity: m.quantity,
        packSize: 24,
      }
    })
  }

  console.log('Seeded user and materials')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })