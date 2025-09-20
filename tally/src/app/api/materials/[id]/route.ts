import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { delta } = await request.json()

    if (typeof delta !== 'number') {
      return NextResponse.json(
        { error: 'Delta must be a number' },
        { status: 400 }
      )
    }

    // Verify the material belongs to the user
    const material = await prisma.material.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!material) {
      return NextResponse.json(
        { error: 'Material not found' },
        { status: 404 }
      )
    }

    // Update the quantity
    const updatedMaterial = await prisma.material.update({
      where: { id: params.id },
      data: {
        quantity: Math.max(0, material.quantity + delta) // Ensure quantity doesn't go below 0
      }
    })

    return NextResponse.json({ material: updatedMaterial })
  } catch (error) {
    console.error('Error updating material:', error)
    return NextResponse.json(
      { error: 'Failed to update material' },
      { status: 500 }
    )
  }
}