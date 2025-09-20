import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get materials with their total required quantities from pending/in_progress orders
    const materialsWithRequirements = await prisma.material.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        orderItems: {
          where: {
            order: {
              status: {
                in: ['PENDING', 'IN_PROGRESS']
              }
            }
          },
          select: {
            quantityNeeded: true,
            order: {
              select: {
                id: true,
                name: true,
                status: true,
                dueDate: true
              }
            }
          }
        }
      },
      orderBy: [
        { name: 'asc' },
        { color: 'asc' },
        { size: 'asc' }
      ]
    })

    // Calculate requirements and status for each material
    const materialsWithStatus = materialsWithRequirements.map(material => {
      const totalRequired = material.orderItems.reduce((sum, item) => sum + item.quantityNeeded, 0)
      const status = totalRequired > material.quantity ? 'insufficient' : 'sufficient'

      return {
        ...material,
        totalRequired,
        status,
        shortage: Math.max(0, totalRequired - material.quantity)
      }
    })

    return NextResponse.json({ materials: materialsWithStatus })
  } catch (error) {
    console.error('Error fetching material requirements:', error)
    return NextResponse.json(
      { error: 'Failed to fetch material requirements' },
      { status: 500 }
    )
  }
}