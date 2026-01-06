import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuth } from "@/lib/auth"
import { getYoutubeThumbnail } from "@/lib/youtube"

export async function POST(request: NextRequest) {
  try {
    const session = await getAuth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's channel
    const channel = await prisma.channel.findUnique({
      where: { userId: session.user.id },
    })

    if (!channel) {
      return NextResponse.json(
        { error: "You need to create a channel first" },
        { status: 400 }
      )
    }

    const { youtubeId, title, description, tags, isShort } = await request.json()

    if (!youtubeId?.trim() || !title?.trim()) {
      return NextResponse.json(
        { error: "YouTube ID and title are required" },
        { status: 400 }
      )
    }

    const video = await prisma.video.create({
      data: {
        youtubeId,
        title,
        description,
        tags: tags || "",
        thumbnail: getYoutubeThumbnail(youtubeId, "hq"),
        channelId: channel.id,
        isShort: isShort || false,
      },
    })

    return NextResponse.json(video)
  } catch {
    return NextResponse.json(
      { error: "Failed to add video" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const channelId = searchParams.get("channelId")
    const limit = parseInt(searchParams.get("limit") || "20")

    const videos = await prisma.video.findMany({
      where: {
        isPublic: true,
        ...(channelId && { channelId }),
      },
      include: {
        channel: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    })

    return NextResponse.json(videos)
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch videos" },
      { status: 500 }
    )
  }
}
