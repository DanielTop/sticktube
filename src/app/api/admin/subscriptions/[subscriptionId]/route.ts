import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuth } from "@/lib/auth"

interface Props {
  params: Promise<{ subscriptionId: string }>
}

export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    const session = await getAuth()
    if (!session?.user?.email?.includes("admin@stiktube")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { subscriptionId } = await params

    await prisma.subscription.delete({
      where: { id: subscriptionId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin delete subscription error:", error)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
