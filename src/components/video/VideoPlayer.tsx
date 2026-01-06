"use client"

import { getYoutubeEmbedUrl } from "@/lib/youtube"

interface VideoPlayerProps {
  youtubeId: string
  title: string
}

export function VideoPlayer({ youtubeId, title }: VideoPlayerProps) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
      <iframe
        src={`${getYoutubeEmbedUrl(youtubeId)}?autoplay=1&rel=0`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />
    </div>
  )
}
