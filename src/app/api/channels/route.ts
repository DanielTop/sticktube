import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getAuth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, handle, description } = await request.json()

    if (!name?.trim() || !handle?.trim()) {
      return NextResponse.json(
        { error: "Name and handle are required" },
        { status: 400 }
      )
    }

    // Check if user already has a channel
    const existingChannel = await prisma.channel.findUnique({
      where: { userId: session.user.id },
    })

    if (existingChannel) {
      return NextResponse.json(
        { error: "You already have a channel" },
        { status: 400 }
      )
    }

    // Check if handle is taken
    const handleTaken = await prisma.channel.findUnique({
      where: { handle: handle.toLowerCase() },
    })

    if (handleTaken) {
      return NextResponse.json(
        { error: "This handle is already taken" },
        { status: 400 }
      )
    }

    const channel = await prisma.channel.create({
      data: {
        name,
        handle: handle.toLowerCase(),
        description,
        userId: session.user.id,
        avatar: session.user.image,
      },
    })

    return NextResponse.json(channel)
  } catch {
    return NextResponse.json(
      { error: "Failed to create channel" },
      { status: 500 }
    )
  }
}
