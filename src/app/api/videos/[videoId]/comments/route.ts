import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuth } from "@/lib/auth"

interface Props {
  params: Promise<{ videoId: string }>
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { videoId } = await params

    const comments = await prisma.comment.findMany({
      where: {
        videoId,
        parentId: null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(comments)
  } catch {
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: Props) {
  try {
    const session = await getAuth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { videoId } = await params
    const { text, parentId } = await request.json()

    if (!text?.trim()) {
      return NextResponse.json({ error: "Comment text is required" }, { status: 400 })
    }

    const comment = await prisma.comment.create({
      data: {
        text,
        userId: session.user.id,
        videoId,
        parentId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(comment)
  } catch {
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
  }
}
