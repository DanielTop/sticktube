export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { getAuth } from "@/lib/auth"
import { VideoPlayer } from "@/components/video/VideoPlayer"
import { VideoActions } from "@/components/video/VideoActions"
import { VideoCard } from "@/components/video/VideoCard"
import { SubscribeButton } from "@/components/channel/SubscribeButton"
import { ChannelBadge } from "@/components/channel/ChannelBadge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatViews, formatRelativeTime, getYoutubeThumbnail } from "@/lib/youtube"
import { CommentSection } from "@/components/comments/CommentSection"

interface Props {
  params: Promise<{ videoId: string }>
}

async function getVideo(videoId: string, userId?: string) {
  const video = await prisma.video.findUnique({
    where: { id: videoId },
    include: {
      channel: {
        include: {
          _count: {
            select: { subscribers: true },
          },
        },
      },
      likes: true,
      _count: {
        select: { comments: true },
      },
    },
  })

  // Calculate total subscribers for badge
  const channelWithFakeSubs = video ? await prisma.channel.findUnique({
    where: { id: video.channelId },
    select: { fakeSubscribers: true },
  }) : null

  if (!video) return null

  // Get user's like status
  let userLike: boolean | null = null
  let isSubscribed = false

  if (userId) {
    const like = await prisma.like.findUnique({
      where: {
        userId_videoId: { userId, videoId },
      },
    })
    userLike = like?.isLike ?? null

    const subscription = await prisma.subscription.findUnique({
      where: {
        userId_channelId: { userId, channelId: video.channelId },
      },
    })
    isSubscribed = !!subscription
  }

  // Increment view count
  await prisma.video.update({
    where: { id: videoId },
    data: { views: { increment: 1 } },
  })

  const likes = video.likes.filter((l) => l.isLike).length
  const dislikes = video.likes.filter((l) => !l.isLike).length

  return {
    ...video,
    likes,
    dislikes,
    userLike,
    isSubscribed,
    fakeSubscribers: channelWithFakeSubs?.fakeSubscribers ?? 0,
  }
}

async function getRelatedVideos(videoId: string, channelId: string) {
  return prisma.video.findMany({
    where: {
      isPublic: true,
      id: { not: videoId },
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
    take: 10,
  })
}

export default async function WatchPage({ params }: Props) {
  const { videoId } = await params
  const session = await getAuth()
  const video = await getVideo(videoId, session?.user?.id)

  if (!video) {
    notFound()
  }

  const relatedVideos = await getRelatedVideos(videoId, video.channelId)
  const totalSubscribers = video.channel._count.subscribers + video.fakeSubscribers

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6">
      {/* Main content */}
      <div className="flex-1 min-w-0">
        <VideoPlayer youtubeId={video.youtubeId} title={video.title} />

        {/* Video info */}
        <div className="mt-3">
          <h1 className="text-xl font-semibold text-white">{video.title}</h1>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
            {/* Channel info */}
            <div className="flex items-center gap-3">
              <Link href={`/channel/${video.channel.id}`}>
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={video.channel.avatar || ""}
                    alt={video.channel.name}
                  />
                  <AvatarFallback className="bg-purple-600 text-white">
                    {video.channel.name[0]}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/channel/${video.channel.id}`}
                    className="font-medium text-white hover:text-blue-400"
                  >
                    {video.channel.name}
                  </Link>
                  <ChannelBadge subscribers={totalSubscribers} />
                </div>
                <p className="text-sm text-neutral-400">
                  {formatViews(totalSubscribers)} подписчиков
                </p>
              </div>
              <SubscribeButton
                channelId={video.channel.id}
                isSubscribed={video.isSubscribed}
                subscriberCount={totalSubscribers}
              />
            </div>

            {/* Actions */}
            <VideoActions
              videoId={video.id}
              likes={video.likes}
              dislikes={video.dislikes}
              userLike={video.userLike}
            />
          </div>

          {/* Description */}
          <div className="mt-4 rounded-xl bg-neutral-800 p-3">
            <div className="flex gap-2 text-sm text-white">
              <span>{formatViews(video.views)} просмотров</span>
              <span>•</span>
              <span>{formatRelativeTime(video.createdAt)}</span>
            </div>
            {video.description && (
              <p className="mt-2 text-sm text-neutral-300 whitespace-pre-wrap">
                {video.description}
              </p>
            )}
            {video.tags && (
              <div className="mt-2 flex flex-wrap gap-1">
                {video.tags.split(",").map((tag) => (
                  <Link
                    key={tag}
                    href={`/search?q=${encodeURIComponent(tag.trim())}`}
                    className="text-sm text-blue-400 hover:underline"
                  >
                    #{tag.trim()}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="mt-6">
            <h2 className="mb-4 text-lg font-medium text-white">
              {video._count.comments} комментариев
            </h2>
            <CommentSection videoId={video.id} />
          </div>
        </div>
      </div>

      {/* Related videos */}
      <div className="w-full lg:w-96 flex-shrink-0">
        <h3 className="mb-4 font-medium text-white">Рекомендации</h3>
        <div className="flex flex-col gap-3">
          {relatedVideos.map((v) => (
            <VideoCard
              key={v.id}
              id={v.id}
              title={v.title}
              thumbnail={v.thumbnail || getYoutubeThumbnail(v.youtubeId)}
              duration={v.duration}
              views={v.views}
              createdAt={v.createdAt}
              channel={{
                id: v.channel.id,
                name: v.channel.name,
                avatar: v.channel.avatar,
              }}
              horizontal
            />
          ))}
        </div>
      </div>
    </div>
  )
}
