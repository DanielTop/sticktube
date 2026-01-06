import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (code !== "4444") {
      return NextResponse.json({ error: "Invalid code" }, { status: 401 })
    }

    // Находим или создаём админа
    let admin = await prisma.user.findFirst({
      where: { email: "admin@stiktube.local" },
    })

    if (!admin) {
      admin = await prisma.user.create({
        data: {
          email: "admin@stiktube.local",
          name: "Администратор",
          image: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
        },
      })

      // Создаём канал для админа
      await prisma.channel.create({
        data: {
          name: "StikTube Official",
          handle: "stiktube",
          description: "Официальный канал StikTube",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
          userId: admin.id,
        },
      })
    }

    // Создаём сессию
    const session = await prisma.session.create({
      data: {
        userId: admin.id,
        sessionToken: `admin-${Date.now()}-${Math.random().toString(36)}`,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 дней
      },
    })

    // Устанавливаем cookie
    const cookieStore = await cookies()
    cookieStore.set("next-auth.session-token", session.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    })

    return NextResponse.json({ success: true, user: admin })
  } catch (error) {
    console.error("Admin login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
