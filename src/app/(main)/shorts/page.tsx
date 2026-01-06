export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { ShortsPlayer } from "@/components/shorts/ShortsPlayer"

async function getShorts() {
  const shorts = await prisma.video.findMany({
    where: {
      isPublic: true,
      isShort: true,
    },
    include: {
      channel: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
      _count: {
        select: { likes: true, comments: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  })
  return shorts
}

export default async function ShortsPage() {
  const shorts = await getShorts()

  if (shorts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6">
        <div className="text-6xl mb-4">📱</div>
        <h2 className="text-xl font-semibold text-white mb-2">
          Пока нет Shorts
        </h2>
        <p className="text-neutral-400">
          Короткие вертикальные видео скоро появятся!
        </p>
      </div>
    )
  }

  return <ShortsPlayer shorts={shorts} />
}
