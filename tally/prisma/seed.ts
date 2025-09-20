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
        quantity: 8,
        packSize: 12,
      },
    }),
    prisma.material.create({
      data: {
        userId: user.id,
        name: 'Gildan 18000 Heavy Blend Crewneck',
        color: 'Black',
        size: 'L',
        quantity: 12,
        packSize: 12,
      },
    }),
    prisma.material.create({
      data: {
        userId: user.id,
        name: 'Gildan 18000 Heavy Blend Crewneck',
        color: 'Black',
        size: 'XL',
        quantity: 6,
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

  // Create realistic orders that will trigger yellow states
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

  const orders = await Promise.all([
    // Order 1: University bookstore - HIGH SHORTAGE scenario
    prisma.order.create({
      data: {
        userId: user.id,
        name: 'State University Bookstore - Finals Week',
        status: 'PENDING',
        priority: 2,
        dueDate: new Date('2025-01-15'),
        orderItems: {
          create: [
            { materialId: blackCrewneckS!.id, quantityNeeded: 25 }, // Have 15, need 25 (short 10)
            { materialId: blackCrewneckM!.id, quantityNeeded: 30 }, // Have 8, need 30 (short 22)
            { materialId: blackCrewneckL!.id, quantityNeeded: 20 }, // Have 12, need 20 (short 8)
            { materialId: blackCrewneckXL!.id, quantityNeeded: 15 }, // Have 6, need 15 (short 9)
          ],
        },
      },
    }),

    // Order 2: Corporate client - SUFFICIENT stock
    prisma.order.create({
      data: {
        userId: user.id,
        name: 'TechCorp Employee Shirts',
        status: 'IN_PROGRESS',
        priority: 1,
        dueDate: new Date('2025-01-20'),
        orderItems: {
          create: [
            { materialId: whiteTeeS!.id, quantityNeeded: 20 }, // Have 24, need 20 ✓
            { materialId: whiteTeeM!.id, quantityNeeded: 15 }, // Have 18, need 15 ✓
            { materialId: whiteTeeL!.id, quantityNeeded: 18 }, // Have 20, need 18 ✓
            { materialId: whiteTeeXL!.id, quantityNeeded: 12 }, // Have 14, need 12 ✓
          ],
        },
      },
    }),

    // Order 3: Local gym - MINOR shortages
    prisma.order.create({
      data: {
        userId: user.id,
        name: 'FitLife Gym Merchandise',
        status: 'PENDING',
        priority: 0,
        dueDate: new Date('2025-01-25'),
        orderItems: {
          create: [
            { materialId: navyM!.id, quantityNeeded: 8 }, // Have 5, need 8 (short 3)
            { materialId: navyL!.id, quantityNeeded: 10 }, // Have 8, need 10 (short 2)
          ],
        },
      },
    }),

    // Order 4: Custom hoodies - CRITICAL shortage
    prisma.order.create({
      data: {
        userId: user.id,
        name: 'Custom Startup Hoodies - Series A',
        status: 'PENDING',
        priority: 1,
        dueDate: new Date('2025-02-01'),
        orderItems: {
          create: [
            { materialId: hoodieM!.id, quantityNeeded: 6 }, // Have 3, need 6 (short 3)
            { materialId: hoodieL!.id, quantityNeeded: 8 }, // Have 4, need 8 (short 4)
          ],
        },
      },
    }),

    // Order 5: Completed wedding order (no impact on inventory)
    prisma.order.create({
      data: {
        userId: user.id,
        name: 'Johnson Wedding Party',
        status: 'COMPLETED',
        priority: 0,
        dueDate: new Date('2025-01-10'),
        orderItems: {
          create: [
            { materialId: whiteTeeS!.id, quantityNeeded: 4 },
            { materialId: whiteTeeM!.id, quantityNeeded: 3 },
            { materialId: whiteTeeL!.id, quantityNeeded: 2 },
          ],
        },
      },
    }),

    // Order 6: MASSIVE festival order - EXTREME shortages
    prisma.order.create({
      data: {
        userId: user.id,
        name: 'Summer Music Festival 2025',
        status: 'PENDING',
        priority: 2,
        dueDate: new Date('2025-02-15'),
        orderItems: {
          create: [
            { materialId: whiteTeeS!.id, quantityNeeded: 50 }, // Have 24, need 50 (short 26)
            { materialId: whiteTeeM!.id, quantityNeeded: 75 }, // Have 18, need 75 (short 57)
            { materialId: whiteTeeL!.id, quantityNeeded: 60 }, // Have 20, need 60 (short 40)
            { materialId: whiteTeeXL!.id, quantityNeeded: 40 }, // Have 14, need 40 (short 26)
            { materialId: blackCrewneckS!.id, quantityNeeded: 30 }, // Have 15, need 30 (short 15)
            { materialId: blackCrewneckM!.id, quantityNeeded: 45 }, // Have 8, need 45 (short 37)
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
        name: 'University Logo',
        description: 'Official university logo in vector format',
        fileName: 'university-logo.svg',
        mimeType: 'image/svg+xml',
        tags: JSON.stringify(['education', 'logo', 'official'])
      }
    }),
    prisma.design.create({
      data: {
        userId: user.id,
        name: 'Tech Startup Logo',
        description: 'Modern startup branding with clean typography',
        fileName: 'startup-logo.png',
        mimeType: 'image/png',
        tags: JSON.stringify(['startup', 'tech', 'modern'])
      }
    }),
    prisma.design.create({
      data: {
        userId: user.id,
        name: 'Gym Motivational Quote',
        description: '"No Pain, No Gain" typography design',
        fileName: 'gym-quote.png',
        mimeType: 'image/png',
        tags: JSON.stringify(['fitness', 'motivation', 'typography'])
      }
    }),
    prisma.design.create({
      data: {
        userId: user.id,
        name: 'Music Festival Lineup',
        description: '2025 festival artist lineup graphic',
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
        name: 'University Logo T-Shirt',
        description: 'Official university branded t-shirt for students and alumni',
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
        name: 'Corporate Team Sweatshirt',
        description: 'Premium branded sweatshirts for company events and teams',
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
        name: 'FitLife Gym Tee',
        description: 'Motivational workout shirt for gym members',
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
        name: 'Music Festival 2025 Tee',
        description: 'Limited edition festival merchandise with full lineup',
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
        name: 'Premium Startup Hoodie',
        description: 'High-quality hoodie for startup employees and supporters',
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
  console.log('📊 Expected yellow states (shortages):')
  console.log('   • Black Crewnecks: All sizes have shortages')
  console.log('   • Navy Tees: Medium and Large sizes short')
  console.log('   • Grey Hoodies: Both sizes critically short')
  console.log('   • White Tees: Festival order creates massive shortages')
  console.log('')
  console.log('🎯 Product catalog:')
  console.log('   • University Logo T-Shirt: Can make (sufficient materials)')
  console.log('   • Corporate Team Sweatshirt: Limited (black crewneck shortage)')
  console.log('   • FitLife Gym Tee: Limited (navy tee shortage)')
  console.log('   • Music Festival 2025 Tee: Limited (white tee shortage)')
  console.log('   • Premium Startup Hoodie: Cannot make (hoodie shortage)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })