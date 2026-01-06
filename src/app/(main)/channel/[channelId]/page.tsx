export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import { getAuth } from "@/lib/auth"
import { VideoCard } from "@/components/video/VideoCard"
import { SubscribeButton } from "@/components/channel/SubscribeButton"
import { ChannelBadge } from "@/components/channel/ChannelBadge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatViews, getYoutubeThumbnail } from "@/lib/youtube"

interface Props {
  params: Promise<{ channelId: string }>
}

async function getChannel(channelId: string, userId?: string) {
  const channel = await prisma.channel.findUnique({
    where: { id: channelId },
    include: {
      videos: {
        where: { isPublic: true },
        orderBy: { createdAt: "desc" },
        include: {
          channel: {
            select: {
              id: true,
              name: true,
              avatar: true,
              fakeSubscribers: true,
            },
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

  let isSubscribed = false
  if (userId) {
    const subscription = await prisma.subscription.findUnique({
      where: {
        userId_channelId: { userId, channelId },
      },
    })
    isSubscribed = !!subscription
  }

  return { ...channel, isSubscribed }
}

export default async function ChannelPage({ params }: Props) {
  const { channelId } = await params
  const session = await getAuth()
  const channel = await getChannel(channelId, session?.user?.id)

  if (!channel) {
    notFound()
  }

  const totalViews = channel.videos.reduce((sum, v) => sum + v.views, 0)
  const totalSubscribers = channel._count.subscribers + channel.fakeSubscribers

  return (
    <div>
      {/* Banner */}
      <div className="relative h-32 sm:h-48 lg:h-56 bg-gradient-to-r from-purple-900 to-blue-900">
        {channel.banner && (
          <Image
            src={channel.banner}
            alt={channel.name}
            fill
            className="object-cover"
          />
        )}
      </div>

      {/* Channel info */}
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:items-center">
          <Avatar className="h-20 w-20 sm:h-28 sm:w-28 border-4 border-neutral-900 -mt-10 sm:-mt-14">
            <AvatarImage src={channel.avatar || ""} alt={channel.name} />
            <AvatarFallback className="bg-purple-600 text-white text-3xl">
              {channel.name[0]}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">{channel.name}</h1>
              <ChannelBadge subscribers={totalSubscribers} />
            </div>
            <p className="text-neutral-400">@{channel.handle}</p>
            <p className="mt-1 text-sm text-neutral-400">
              {formatViews(totalSubscribers)} подписчиков • {channel._count.videos} видео
            </p>
            {channel.description && (
              <p className="mt-2 text-sm text-neutral-300 line-clamp-2">
                {channel.description}
              </p>
            )}
          </div>

          <SubscribeButton
            channelId={channel.id}
            isSubscribed={channel.isSubscribed}
            subscriberCount={totalSubscribers}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="videos" className="mt-6">
          <TabsList className="bg-transparent border-b border-neutral-800 rounded-none w-full justify-start gap-4 h-auto p-0">
            <TabsTrigger
              value="videos"
              className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white rounded-none pb-3 text-neutral-400"
            >
              Видео
            </TabsTrigger>
            <TabsTrigger
              value="playlists"
              className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white rounded-none pb-3 text-neutral-400"
            >
              Плейлисты
            </TabsTrigger>
            <TabsTrigger
              value="about"
              className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white rounded-none pb-3 text-neutral-400"
            >
              О канале
            </TabsTrigger>
          </TabsList>

          <TabsContent value="videos" className="mt-6">
            {channel.videos.length === 0 ? (
              <div className="py-12 text-center text-neutral-400">
                На этом канале пока нет видео
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {channel.videos.map((video) => (
                  <VideoCard
                    key={video.id}
                    id={video.id}
                    title={video.title}
                    thumbnail={video.thumbnail || getYoutubeThumbnail(video.youtubeId)}
                    duration={video.duration}
                    views={video.views}
                    createdAt={video.createdAt}
                    channel={{
                      id: video.channel.id,
                      name: video.channel.name,
                      avatar: video.channel.avatar,
                    }}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="playlists" className="mt-6">
            <div className="py-12 text-center text-neutral-400">
              Плейлисты пока не созданы
            </div>
          </TabsContent>

          <TabsContent value="about" className="mt-6">
            <div className="max-w-2xl space-y-4">
              <div>
                <h3 className="text-sm font-medium text-neutral-400">Описание</h3>
                <p className="mt-1 text-white whitespace-pre-wrap">
                  {channel.description || "Описание не добавлено"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-neutral-400">Статистика</h3>
                <p className="mt-1 text-white">
                  Всего просмотров: {formatViews(totalViews)}
                </p>
                <p className="text-white">
                  Дата регистрации: {new Date(channel.createdAt).toLocaleDateString("ru")}
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
