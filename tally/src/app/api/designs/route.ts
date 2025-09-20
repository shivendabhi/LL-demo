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

    const designs = await prisma.design.findMany({
      where: {
        userId: session.user.id,
        isActive: true
      },
      include: {
        productDesigns: {
          include: {
            product: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({ designs })
  } catch (error) {
    console.error('Error fetching designs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch designs' },
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
      fileUrl,
      fileName,
      fileSize,
      mimeType,
      tags
    } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Design name is required' },
        { status: 400 }
      )
    }

    const design = await prisma.design.create({
      data: {
        userId: session.user.id,
        name,
        description,
        fileUrl,
        fileName,
        fileSize,
        mimeType,
        tags: tags ? JSON.stringify(tags) : null
      }
    })

    return NextResponse.json({ design }, { status: 201 })
  } catch (error) {
    console.error('Error creating design:', error)
    return NextResponse.json(
      { error: 'Failed to create design' },
      { status: 500 }
    )
  }
}