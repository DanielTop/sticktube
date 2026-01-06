import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getAuth()
    if (!session?.user?.email?.includes("admin@stiktube")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { channelId, userId } = await request.json()

    // Check if subscription already exists
    const existing = await prisma.subscription.findUnique({
      where: {
        userId_channelId: { userId, channelId },
      },
    })

    if (existing) {
      return NextResponse.json({ error: "Already subscribed" }, { status: 400 })
    }

    const subscription = await prisma.subscription.create({
      data: { userId, channelId },
    })

    return NextResponse.json({ success: true, subscription })
  } catch (error) {
    console.error("Admin subscription error:", error)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
