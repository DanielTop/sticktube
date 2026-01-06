export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { VideoCard } from "@/components/video/VideoCard"
import { getYoutubeThumbnail } from "@/lib/youtube"

async function getVideos() {
  const videos = await prisma.video.findMany({
    where: { isPublic: true },
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
    take: 50,
  })
  return videos
}

export default async function HomePage() {
  const videos = await getVideos()

  return (
    <div className="p-6">
      {videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 rounded-full bg-neutral-800 p-6">
            <svg
              className="h-12 w-12 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white">
            Пока нет видео
          </h2>
          <p className="mt-2 text-neutral-400">
            Станьте первым, кто загрузит видео на StikTube!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {videos.map((video) => (
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
    </div>
  )
}
