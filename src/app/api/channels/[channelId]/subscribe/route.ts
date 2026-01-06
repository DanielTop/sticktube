import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuth } from "@/lib/auth"

interface Props {
  params: Promise<{ channelId: string }>
}

export async function POST(request: NextRequest, { params }: Props) {
  try {
    const session = await getAuth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { channelId } = await params

    const existingSubscription = await prisma.subscription.findUnique({
      where: {
        userId_channelId: {
          userId: session.user.id,
          channelId,
        },
      },
    })

    let subscribed = false

    if (existingSubscription) {
      // Unsubscribe
      await prisma.subscription.delete({
        where: { id: existingSubscription.id },
      })
      subscribed = false
    } else {
      // Subscribe
      await prisma.subscription.create({
        data: {
          userId: session.user.id,
          channelId,
        },
      })
      subscribed = true
    }

    const subscriberCount = await prisma.subscription.count({
      where: { channelId },
    })

    return NextResponse.json({ subscribed, subscriberCount })
  } catch {
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 })
  }
}
