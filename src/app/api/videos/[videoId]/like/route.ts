import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuth } from "@/lib/auth"

interface Props {
  params: Promise<{ videoId: string }>
}

export async function POST(request: NextRequest, { params }: Props) {
  try {
    const session = await getAuth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { videoId } = await params
    const { isLike } = await request.json()

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_videoId: {
          userId: session.user.id,
          videoId,
        },
      },
    })

    let userLike: boolean | null = null

    if (existingLike) {
      if (existingLike.isLike === isLike) {
        // Remove like if clicking same button
        await prisma.like.delete({
          where: { id: existingLike.id },
        })
        userLike = null
      } else {
        // Update like
        await prisma.like.update({
          where: { id: existingLike.id },
          data: { isLike },
        })
        userLike = isLike
      }
    } else {
      // Create new like
      await prisma.like.create({
        data: {
          userId: session.user.id,
          videoId,
          isLike,
        },
      })
      userLike = isLike
    }

    // Get updated counts
    const likes = await prisma.like.count({
      where: { videoId, isLike: true },
    })
    const dislikes = await prisma.like.count({
      where: { videoId, isLike: false },
    })

    return NextResponse.json({ likes, dislikes, userLike })
  } catch {
    return NextResponse.json({ error: "Failed to like video" }, { status: 500 })
  }
}
