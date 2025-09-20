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

    const { name, description, price, sku, category } = await request.json()
    const { id } = await params

    // Verify the product belongs to the user
    const product = await prisma.product.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Update the product
    const updatedProduct = await prisma.product.update({
      where: { id: id },
      data: {
        name,
        description,
        price,
        sku,
        category,
        updatedAt: new Date()
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

    return NextResponse.json({ product: updatedProduct })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}