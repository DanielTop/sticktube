export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getAuth } from "@/lib/auth"
import { AdminPanel } from "@/components/admin/AdminPanel"

export default async function AdminPage() {
  const session = await getAuth()

  if (!session?.user?.email?.includes("admin@stiktube")) {
    redirect("/")
  }

  // Get all channels with subscriber counts
  const channels = await prisma.channel.findMany({
    include: {
      user: true,
      _count: {
        select: { subscribers: true, videos: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  // Get all subscriptions
  const subscriptions = await prisma.subscription.findMany({
    include: {
      user: true,
      channel: true,
    },
    orderBy: { createdAt: "desc" },
  })

  // Get all users
  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: { subscriptions: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">
        Панель администратора
      </h1>

      <AdminPanel
        channels={channels}
        subscriptions={subscriptions}
        users={users}
      />
    </div>
  )
}
