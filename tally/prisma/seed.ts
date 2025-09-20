import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create a test user with password
  const hashedPassword = await bcrypt.hash('password123', 12)
  const user = await prisma.user.upsert({
    where: { email: 'shiven.dabhi@gmail.com' },
    update: {},
    create: {
      email: 'shiven.dabhi@gmail.com',
      name: 'Shiven Dabhi',
      password: hashedPassword,
    },
  })

  console.log('👤 Created user:', user.email)

  // Clear existing data
  await prisma.orderItem.deleteMany({ where: { order: { userId: user.id } } })
  await prisma.order.deleteMany({ where: { userId: user.id } })
  await prisma.material.deleteMany({ where: { userId: user.id } })

  // Create realistic materials with varying stock levels
  const materials = await Promise.all([
    // Gildan 18000 - Black Crewnecks (some shortages expected)
    prisma.material.create({
      data: {
        userId: user.id,
        name: 'Gildan 18000 Heavy Blend Crewneck',
        color: 'Black',
        size: 'S',
        quantity: 15,
        packSize: 12,
      },
    }),
    prisma.material.create({
      data: {
        userId: user.id,
        name: 'Gildan 18000 Heavy Blend Crewneck',
        color: 'Black',
        size: 'M',
        quantity: 10,
        packSize: 12,
      },
    }),
    prisma.material.create({
      data: {
        userId: user.id,
        name: 'Gildan 18000 Heavy Blend Crewneck',
        color: 'Black',
        size: 'L',
        quantity: 24,
        packSize: 12,
      },
    }),
    prisma.material.create({
      data: {
        userId: user.id,
        name: 'Gildan 18000 Heavy Blend Crewneck',
        color: 'Black',
        size: 'XL',
        quantity: 12,
        packSize: 12,
      },
    }),

    // Bella Canvas 3001 - White Tees (well stocked)
    prisma.material.create({
      data: {
        userId: user.id,
        name: 'Bella Canvas 3001 Unisex Tee',
        color: 'White',
        size: 'S',
        quantity: 24,
        packSize: 24,
      },
    }),
    prisma.material.create({
      data: {
        userId: user.id,
        name: 'Bella Canvas 3001 Unisex Tee',
        color: 'White',
        size: 'M',
        quantity: 18,
        packSize: 24,
      },
    }),
    prisma.material.create({
      data: {
        userId: user.id,
        name: 'Bella Canvas 3001 Unisex Tee',
        color: 'White',
        size: 'L',
        quantity: 20,
        packSize: 24,
      },
    }),
    prisma.material.create({
      data: {
        userId: user.id,
        name: 'Bella Canvas 3001 Unisex Tee',
        color: 'White',
        size: 'XL',
        quantity: 14,
        packSize: 24,
      },
    }),

    // Gildan 64000 - Navy (limited stock)
    prisma.material.create({
      data: {
        userId: user.id,
        name: 'Gildan 64000 Softstyle Tee',
        color: 'Navy',
        size: 'M',
        quantity: 5,
        packSize: 12,
      },
    }),
    prisma.material.create({
      data: {
        userId: user.id,
        name: 'Gildan 64000 Softstyle Tee',
        color: 'Navy',
        size: 'L',
        quantity: 8,
        packSize: 12,
      },
    }),

    // Champion S800 - Grey Hoodies (very limited)
    prisma.material.create({
      data: {
        userId: user.id,
        name: 'Champion S800 Powerblend Hoodie',
        color: 'Oxford Grey',
        size: 'M',
        quantity: 3,
        packSize: 6,
      },
    }),
    prisma.material.create({
      data: {
        userId: user.id,
        name: 'Champion S800 Powerblend Hoodie',
        color: 'Oxford Grey',
        size: 'L',
        quantity: 4,
        packSize: 6,
      },
    }),
  ])

  console.log('📦 Created materials:', materials.length)

  // Create realistic orders with better quantities and dates
  const blackCrewneckS = materials.find(m => m.name.includes('18000') && m.color === 'Black' && m.size === 'S')
  const blackCrewneckM = materials.find(m => m.name.includes('18000') && m.color === 'Black' && m.size === 'M')
  const blackCrewneckL = materials.find(m => m.name.includes('18000') && m.color === 'Black' && m.size === 'L')
  const blackCrewneckXL = materials.find(m => m.name.includes('18000') && m.color === 'Black' && m.size === 'XL')

  const whiteTeeS = materials.find(m => m.name.includes('3001') && m.color === 'White' && m.size === 'S')
  const whiteTeeM = materials.find(m => m.name.includes('3001') && m.color === 'White' && m.size === 'M')
  const whiteTeeL = materials.find(m => m.name.includes('3001') && m.color === 'White' && m.size === 'L')
  const whiteTeeXL = materials.find(m => m.name.includes('3001') && m.color === 'White' && m.size === 'XL')

  const navyM = materials.find(m => m.name.includes('64000') && m.color === 'Navy' && m.size === 'M')
  const navyL = materials.find(m => m.name.includes('64000') && m.color === 'Navy' && m.size === 'L')

  const hoodieM = materials.find(m => m.name.includes('S800') && m.size === 'M')
  const hoodieL = materials.find(m => m.name.includes('S800') && m.size === 'L')

  // Helper function to get realistic future dates
  const getDate = (daysFromNow: number) => {
    const date = new Date()
    date.setDate(date.getDate() + daysFromNow)
    return date
  }

  const orders = await Promise.all([
    // Order 1: University bookstore - Minor shortages, due next week
    prisma.order.create({
      data: {
        userId: user.id,
        name: 'PSU Bookstore',
        status: 'PENDING',
        priority: 1,
        dueDate: getDate(8), // Due in 8 days
        orderItems: {
          create: [
            { materialId: blackCrewneckS!.id, quantityNeeded: 18 }, // Have 15, need 18 (short 3)
            { materialId: blackCrewneckM!.id, quantityNeeded: 12 }, // Have 8, need 12 (short 4)
            { materialId: blackCrewneckL!.id, quantityNeeded: 10 }, // Have 12, need 10 ✓
            { materialId: blackCrewneckXL!.id, quantityNeeded: 8 }, // Have 6, need 8 (short 2)
          ],
        },
      },
    }),

    // Order 2: Corporate client - All sufficient, in progress
    prisma.order.create({
      data: {
        userId: user.id,
        name: 'Zendesk Team Shirts',
        status: 'IN_PROGRESS',
        priority: 1,
        dueDate: getDate(5), // Due in 5 days
        orderItems: {
          create: [
            { materialId: whiteTeeS!.id, quantityNeeded: 20 }, // Have 24, need 20 ✓
            { materialId: whiteTeeM!.id, quantityNeeded: 15 }, // Have 18, need 15 ✓
            { materialId: whiteTeeL!.id, quantityNeeded: 18 }, // Have 20, need 18 ✓
            { materialId: whiteTeeXL!.id, quantityNeeded: 10 }, // Have 14, need 10 ✓
          ],
        },
      },
    }),

    // Order 3: CrossFit gym - Small order, reasonable shortage
    prisma.order.create({
      data: {
        userId: user.id,
        name: 'CrossFit Heritage',
        status: 'PENDING',
        priority: 0,
        dueDate: getDate(12), // Due in 12 days
        orderItems: {
          create: [
            { materialId: navyM!.id, quantityNeeded: 6 }, // Have 5, need 6 (short 1)
            { materialId: navyL!.id, quantityNeeded: 8 }, // Have 8, need 8 ✓
          ],
        },
      },
    }),

    // Order 4: Custom hoodies - Small batch, manageable shortage
    prisma.order.create({
      data: {
        userId: user.id,
        name: 'Notion Team Hoodies',
        status: 'PENDING',
        priority: 2,
        dueDate: getDate(15), // Due in 15 days
        orderItems: {
          create: [
            { materialId: hoodieM!.id, quantityNeeded: 4 }, // Have 3, need 4 (short 1)
            { materialId: hoodieL!.id, quantityNeeded: 5 }, // Have 4, need 5 (short 1)
          ],
        },
      },
    }),

    // Order 5: Completed wedding order (past due date but completed)
    prisma.order.create({
      data: {
        userId: user.id,
        name: 'Miller Wedding',
        status: 'COMPLETED',
        priority: 0,
        dueDate: getDate(-3), // Was due 3 days ago but completed
        orderItems: {
          create: [
            { materialId: whiteTeeS!.id, quantityNeeded: 6 },
            { materialId: whiteTeeM!.id, quantityNeeded: 4 },
            { materialId: whiteTeeL!.id, quantityNeeded: 2 },
          ],
        },
      },
    }),

    // Order 6: Large festival order - manageable shortages, realistic scale
    prisma.order.create({
      data: {
        userId: user.id,
        name: 'Coachella Merch Stand',
        status: 'PENDING',
        priority: 2,
        dueDate: getDate(25), // Due in 25 days (plenty of time to restock)
        orderItems: {
          create: [
            { materialId: whiteTeeS!.id, quantityNeeded: 28 }, // With Zendesk: 48 total, have 24, short 24 (need 1 pack)
            { materialId: whiteTeeM!.id, quantityNeeded: 20 }, // With Zendesk: 35 total, have 18, short 17 (need 1 pack)
            { materialId: whiteTeeL!.id, quantityNeeded: 15 }, // With Zendesk: 33 total, have 20, short 13 (need 1 pack)
            { materialId: whiteTeeXL!.id, quantityNeeded: 12 }, // With Zendesk: 22 total, have 14, short 8 (manageable)
          ],
        },
      },
    }),

    // Order 7: Urgent rush order - overdue but reasonable
    prisma.order.create({
      data: {
        userId: user.id,
        name: 'Local High School',
        status: 'PENDING',
        priority: 2,
        dueDate: getDate(-1), // Due yesterday (realistic rush scenario)
        orderItems: {
          create: [
            { materialId: blackCrewneckM!.id, quantityNeeded: 6 }, // Have 8, need 6 ✓
            { materialId: blackCrewneckL!.id, quantityNeeded: 8 }, // Have 12, need 8 ✓
          ],
        },
      },
    }),
  ])

  console.log('📋 Created orders:', orders.length)

  // Create realistic designs
  const designs = await Promise.all([
    prisma.design.create({
      data: {
        userId: user.id,
        name: 'PSU Logo',
        description: 'Penn State logo vector',
        fileName: 'university-logo.svg',
        mimeType: 'image/svg+xml',
        tags: JSON.stringify(['education', 'logo', 'official'])
      }
    }),
    prisma.design.create({
      data: {
        userId: user.id,
        name: 'Notion Logo',
        description: 'Company logo design',
        fileName: 'startup-logo.png',
        mimeType: 'image/png',
        tags: JSON.stringify(['startup', 'tech', 'modern'])
      }
    }),
    prisma.design.create({
      data: {
        userId: user.id,
        name: 'CrossFit Logo',
        description: 'Heritage gym branding',
        fileName: 'gym-quote.png',
        mimeType: 'image/png',
        tags: JSON.stringify(['fitness', 'motivation', 'typography'])
      }
    }),
    prisma.design.create({
      data: {
        userId: user.id,
        name: 'Coachella Lineup',
        description: 'Artist lineup design',
        fileName: 'festival-lineup.jpg',
        mimeType: 'image/jpeg',
        tags: JSON.stringify(['music', 'festival', 'event'])
      }
    })
  ])

  console.log('🎨 Created designs:', designs.length)

  // Create realistic products
  const products = await Promise.all([
    // University Logo T-Shirt (uses white tees + university logo)
    prisma.product.create({
      data: {
        userId: user.id,
        name: 'PSU Logo Tee',
        description: 'Official Penn State logo on white tee',
        price: 19.99,
        category: 'apparel',
        sku: 'UNI-TEE-001',
        productMaterials: {
          create: [
            { materialId: whiteTeeM!.id, quantityRequired: 1 },
            { materialId: whiteTeeL!.id, quantityRequired: 1 }
          ]
        },
        productDesigns: {
          create: [
            { designId: designs[0].id, placement: 'front', sizeInfo: '8x10 inches' }
          ]
        }
      }
    }),

    // Corporate Sweatshirt (uses black crewnecks + startup logo)
    prisma.product.create({
      data: {
        userId: user.id,
        name: 'Team Crewneck',
        description: 'Black crewneck with company logo',
        price: 39.99,
        category: 'corporate',
        sku: 'CORP-CREW-001',
        productMaterials: {
          create: [
            { materialId: blackCrewneckM!.id, quantityRequired: 1 },
            { materialId: blackCrewneckL!.id, quantityRequired: 1 },
            { materialId: blackCrewneckXL!.id, quantityRequired: 1 }
          ]
        },
        productDesigns: {
          create: [
            { designId: designs[1].id, placement: 'front', sizeInfo: '6x8 inches' },
            { designId: designs[1].id, placement: 'back', sizeInfo: '12x4 inches' }
          ]
        }
      }
    }),

    // Gym Motivational Tee (uses navy tees + gym quote)
    prisma.product.create({
      data: {
        userId: user.id,
        name: 'CrossFit Tee',
        description: 'Navy tee with gym logo',
        price: 24.99,
        category: 'fitness',
        sku: 'GYM-TEE-001',
        productMaterials: {
          create: [
            { materialId: navyM!.id, quantityRequired: 1 },
            { materialId: navyL!.id, quantityRequired: 1 }
          ]
        },
        productDesigns: {
          create: [
            { designId: designs[2].id, placement: 'front', sizeInfo: '10x6 inches' }
          ]
        }
      }
    }),

    // Festival Merchandise (uses multiple materials + festival design)
    prisma.product.create({
      data: {
        userId: user.id,
        name: 'Coachella Tee',
        description: 'Festival lineup tee',
        price: 29.99,
        category: 'event',
        sku: 'FEST-TEE-2025',
        productMaterials: {
          create: [
            { materialId: whiteTeeS!.id, quantityRequired: 1 },
            { materialId: whiteTeeM!.id, quantityRequired: 1 },
            { materialId: whiteTeeL!.id, quantityRequired: 1 }
          ]
        },
        productDesigns: {
          create: [
            { designId: designs[3].id, placement: 'front', sizeInfo: '12x16 inches' }
          ]
        }
      }
    }),

    // Premium Hoodie (uses grey hoodies + multiple designs)
    prisma.product.create({
      data: {
        userId: user.id,
        name: 'Notion Hoodie',
        description: 'Grey hoodie with logo front and back',
        price: 59.99,
        category: 'premium',
        sku: 'PREM-HOOD-001',
        productMaterials: {
          create: [
            { materialId: hoodieM!.id, quantityRequired: 1 },
            { materialId: hoodieL!.id, quantityRequired: 1 }
          ]
        },
        productDesigns: {
          create: [
            { designId: designs[1].id, placement: 'front', sizeInfo: '4x4 inches' },
            { designId: designs[1].id, placement: 'back', sizeInfo: '10x12 inches' }
          ]
        }
      }
    })
  ])

  console.log('📦 Created products:', products.length)
  console.log('✅ Seed completed successfully!')
  console.log('')
  console.log('🔑 Login credentials:')
  console.log('   Email: shiven.dabhi@gmail.com')
  console.log('   Password: password123')
  console.log('')
  console.log('📊 Expected inventory states:')
  console.log('   • Black Crewnecks: Good stock levels, minor shortages on S and M')
  console.log('   • White Tees: Sufficient for most orders, small festival shortages')
  console.log('   • Navy Tees: Mostly sufficient with minimal shortage on M')
  console.log('   • Grey Hoodies: Limited stock, small shortages on both sizes')
  console.log('')
  console.log('📅 Order status timeline:')
  console.log('   • Zendesk Team Shirts: In progress, due in 5 days (sufficient stock)')
  console.log('   • PSU Bookstore: Pending, due in 8 days (minor shortages on S/M)')
  console.log('   • CrossFit Heritage: Pending, due in 12 days (1 unit short on M)')
  console.log('   • Notion Team Hoodies: Pending, due in 15 days (minimal shortage)')
  console.log('   • Coachella Merch Stand: Pending, due in 25 days (minor shortages)')
  console.log('   • Local High School: Urgent, overdue by 1 day (sufficient stock)')
  console.log('   • Miller Wedding: Completed (was due 3 days ago)')
  console.log('')
  console.log('🎯 Product catalog:')
  console.log('   • PSU Logo Tee: Can make good quantities')
  console.log('   • Team Crewneck: Can make some (limited by shortage)')
  console.log('   • CrossFit Tee: Can make most orders')
  console.log('   • Coachella Tee: Can make good quantities')
  console.log('   • Notion Hoodie: Very limited (hoodie shortage)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })