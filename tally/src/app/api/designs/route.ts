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

    // Handle FormData for file uploads
    const formData = await request.formData()
    const file = formData.get('file') as File
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const tags = formData.get('tags') as string

    if (!name) {
      return NextResponse.json(
        { error: 'Design name is required' },
        { status: 400 }
      )
    }

    if (!file) {
      return NextResponse.json(
        { error: 'Design file is required' },
        { status: 400 }
      )
    }

    // In production, you would upload the file to a storage service like Supabase Storage, AWS S3, etc.
    // For now, we'll create a mock file URL and store file metadata
    const mockFileUrl = `/uploads/designs/${Date.now()}-${file.name}`
    const parsedTags = tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : []

    const design = await prisma.design.create({
      data: {
        userId: session.user.id,
        name,
        description: description || null,
        fileUrl: mockFileUrl,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        tags: parsedTags.length > 0 ? JSON.stringify(parsedTags) : null
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