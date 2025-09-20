import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        orderItems: {
          include: {
            material: true
          }
        }
      },
      orderBy: [
        { status: 'asc' }, // pending first, then in_progress, completed last
        { priority: 'desc' }, // higher priority first
        { dueDate: 'asc' }, // earliest due date first
        { createdAt: 'desc' } // newest first for same priority/due date
      ]
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
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

    const { name, dueDate, priority, orderItems } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Order name is required' },
        { status: 400 }
      )
    }

    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return NextResponse.json(
        { error: 'Order items are required' },
        { status: 400 }
      )
    }

    // Validate that all materials belong to the user
    const materialIds = orderItems.map(item => item.materialId)
    const materials = await prisma.material.findMany({
      where: {
        id: { in: materialIds },
        userId: session.user.id
      }
    })

    if (materials.length !== materialIds.length) {
      return NextResponse.json(
        { error: 'One or more materials not found' },
        { status: 400 }
      )
    }

    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        name,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || 0,
        orderItems: {
          create: orderItems.map(item => ({
            materialId: item.materialId,
            quantityNeeded: item.quantityNeeded
          }))
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
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}