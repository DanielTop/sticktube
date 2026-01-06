export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { VideoCard } from "@/components/video/VideoCard"
import { getYoutubeThumbnail } from "@/lib/youtube"
import { Search } from "lucide-react"

interface Props {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams
  const query = q?.trim() || ""

  const videos = query
    ? await prisma.video.findMany({
        where: {
          isPublic: true,
          OR: [
            { title: { contains: query } },
            { description: { contains: query } },
            { tags: { contains: query } },
          ],
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
        orderBy: { views: "desc" },
        take: 50,
      })
    : []

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Search className="h-6 w-6 text-neutral-400" />
        <h1 className="text-xl font-medium text-white">
          {query ? `Результаты поиска: "${query}"` : "Поиск"}
        </h1>
      </div>

      {!query && (
        <p className="text-neutral-400">
          Введите запрос в строку поиска выше
        </p>
      )}

      {query && videos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-neutral-400 text-lg">
            По запросу "{query}" ничего не найдено
          </p>
          <p className="text-neutral-500 mt-2">
            Попробуйте другие ключевые слова
          </p>
        </div>
      )}

      {videos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
