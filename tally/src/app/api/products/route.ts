import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const products = await prisma.product.findMany({
      where: {
        userId: session.user.id,
        isActive: true
      },
      include: {
        productMaterials: {
          include: {
            material: true
          }
        },
        productDesigns: {
          include: {
            design: true
          }
        }
      },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    })

    // Calculate if each product can be made with current inventory
    const productsWithAvailability = products.map(product => {
      const canMake = product.productMaterials.every(pm =>
        pm.material.quantity >= pm.quantityRequired
      )

      const maxQuantity = Math.min(
        ...product.productMaterials.map(pm =>
          Math.floor(pm.material.quantity / pm.quantityRequired)
        )
      )

      return {
        ...product,
        canMake,
        maxQuantity: maxQuantity >= 0 ? maxQuantity : 0
      }
    })

    return NextResponse.json({ products: productsWithAvailability })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      name,
      description,
      price,
      sku,
      category,
      materials, // Array of { materialId, quantityRequired }
      designs    // Array of { designId, placement?, sizeInfo? }
    } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Product name is required' },
        { status: 400 }
      )
    }

    // Validate materials exist and belong to user
    if (materials && materials.length > 0) {
      const materialIds = materials.map((m: any) => m.materialId)
      const userMaterials = await prisma.material.findMany({
        where: {
          id: { in: materialIds },
          userId: session.user.id
        }
      })

      if (userMaterials.length !== materialIds.length) {
        return NextResponse.json(
          { error: 'One or more materials not found' },
          { status: 400 }
        )
      }
    }

    // Validate designs exist and belong to user
    if (designs && designs.length > 0) {
      const designIds = designs.map((d: any) => d.designId)
      const userDesigns = await prisma.design.findMany({
        where: {
          id: { in: designIds },
          userId: session.user.id
        }
      })

      if (userDesigns.length !== designIds.length) {
        return NextResponse.json(
          { error: 'One or more designs not found' },
          { status: 400 }
        )
      }
    }

    const product = await prisma.product.create({
      data: {
        userId: session.user.id,
        name,
        description,
        price,
        sku,
        category,
        productMaterials: materials ? {
          create: materials.map((m: any) => ({
            materialId: m.materialId,
            quantityRequired: m.quantityRequired,
            notes: m.notes
          }))
        } : undefined,
        productDesigns: designs ? {
          create: designs.map((d: any) => ({
            designId: d.designId,
            placement: d.placement,
            sizeInfo: d.sizeInfo,
            notes: d.notes
          }))
        } : undefined
      },
      include: {
        productMaterials: {
          include: {
            material: true
          }
        },
        productDesigns: {
          include: {
            design: true
          }
        }
      }
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}