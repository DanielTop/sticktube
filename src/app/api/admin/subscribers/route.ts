import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getAuth()
    if (!session?.user?.email?.includes("admin@stiktube")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { channelId, count } = await request.json()

    // Update fake subscribers count
    const channel = await prisma.channel.update({
      where: { id: channelId },
      data: {
        fakeSubscribers: {
          increment: count,
        },
      },
    })

    // Ensure fakeSubscribers doesn't go below 0
    if (channel.fakeSubscribers < 0) {
      await prisma.channel.update({
        where: { id: channelId },
        data: { fakeSubscribers: 0 },
      })
    }

    return NextResponse.json({ success: true, fakeSubscribers: Math.max(0, channel.fakeSubscribers) })
  } catch (error) {
    console.error("Admin subscribers error:", error)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
