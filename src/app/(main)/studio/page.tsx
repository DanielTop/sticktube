export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"
import Link from "next/link"
import { getAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Video, Users, Eye, ThumbsUp, Plus } from "lucide-react"
import { formatViews } from "@/lib/youtube"

async function getChannelStats(userId: string) {
  const channel = await prisma.channel.findUnique({
    where: { userId },
    include: {
      videos: {
        select: {
          id: true,
          views: true,
          likes: {
            select: { isLike: true },
          },
        },
      },
      _count: {
        select: {
          subscribers: true,
          videos: true,
        },
      },
    },
  })

  if (!channel) return null

  const totalViews = channel.videos.reduce((sum, v) => sum + v.views, 0)
  const totalLikes = channel.videos.reduce(
    (sum, v) => sum + v.likes.filter((l) => l.isLike).length,
    0
  )

  return {
    channel,
    totalViews,
    totalLikes,
    videoCount: channel._count.videos,
    subscriberCount: channel._count.subscribers,
  }
}

export default async function StudioPage() {
  const session = await getAuth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const stats = await getChannelStats(session.user.id)

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <div className="text-center">
          <Video className="mx-auto h-16 w-16 text-neutral-500 mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">
            У вас ещё нет канала
          </h1>
          <p className="text-neutral-400 mb-6">
            Создайте канал, чтобы начать загружать видео
          </p>
          <Link href="/studio/create-channel">
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="mr-2 h-4 w-4" />
              Создать канал
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Студия</h1>
        <Link href="/studio/upload">
          <Button className="bg-red-600 hover:bg-red-700">
            <Plus className="mr-2 h-4 w-4" />
            Добавить видео
          </Button>
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-neutral-800 border-neutral-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">
              Подписчики
            </CardTitle>
            <Users className="h-4 w-4 text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatViews(stats.subscriberCount)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-800 border-neutral-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">
              Видео
            </CardTitle>
            <Video className="h-4 w-4 text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats.videoCount}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-800 border-neutral-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">
              Просмотры
            </CardTitle>
            <Eye className="h-4 w-4 text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatViews(stats.totalViews)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-800 border-neutral-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">
              Лайки
            </CardTitle>
            <ThumbsUp className="h-4 w-4 text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatViews(stats.totalLikes)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/studio/videos">
          <Card className="bg-neutral-800 border-neutral-700 hover:bg-neutral-750 transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-4 p-6">
              <Video className="h-10 w-10 text-blue-500" />
              <div>
                <h3 className="font-medium text-white">Мои видео</h3>
                <p className="text-sm text-neutral-400">
                  Управляйте своими видео
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/channel/${stats.channel.id}`}>
          <Card className="bg-neutral-800 border-neutral-700 hover:bg-neutral-750 transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-4 p-6">
              <Users className="h-10 w-10 text-purple-500" />
              <div>
                <h3 className="font-medium text-white">Мой канал</h3>
                <p className="text-sm text-neutral-400">
                  Просмотр страницы канала
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
