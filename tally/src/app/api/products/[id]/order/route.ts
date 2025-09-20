import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { quantity, orderName, dueDate, priority } = await request.json()
    const { id } = await params

    if (!quantity || quantity <= 0) {
      return NextResponse.json(
        { error: 'Valid quantity is required' },
        { status: 400 }
      )
    }

    // Get the product with its materials
    const product = await prisma.product.findFirst({
      where: {
        id: id,
        userId: session.user.id
      },
      include: {
        productMaterials: {
          include: {
            material: true
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    if (product.productMaterials.length === 0) {
      return NextResponse.json(
        { error: 'Product has no materials defined' },
        { status: 400 }
      )
    }

    // Calculate total material requirements
    const orderItems = product.productMaterials.map(pm => ({
      materialId: pm.materialId,
      quantityNeeded: pm.quantityRequired * quantity
    }))

    // Create the order
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        name: orderName || `${product.name} (${quantity} units)`,
        priority: priority || 0,
        dueDate: dueDate ? new Date(dueDate) : null,
        orderItems: {
          create: orderItems
        }
      },
      include: {
        orderItems: {
          include: {
            material: true
          }
        }
      }
    })

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error('Error creating order from product:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}