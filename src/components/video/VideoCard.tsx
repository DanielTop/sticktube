"use client"

import Link from "next/link"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatViews, formatRelativeTime, formatDuration } from "@/lib/youtube"

interface VideoCardProps {
  id: string
  title: string
  thumbnail: string
  duration?: number | null
  views: number
  createdAt: Date
  channel: {
    id: string
    name: string
    avatar?: string | null
  }
  horizontal?: boolean
}

export function VideoCard({
  id,
  title,
  thumbnail,
  duration,
  views,
  createdAt,
  channel,
  horizontal = false,
}: VideoCardProps) {
  if (horizontal) {
    return (
      <div className="flex gap-2">
        <Link
          href={`/watch/${id}`}
          className="relative aspect-video w-40 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-800"
        >
          <Image
            src={thumbnail}
            alt={title}
            fill
            className="object-cover"
          />
          {duration && (
            <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-0.5 text-xs text-white">
              {formatDuration(duration)}
            </span>
          )}
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/watch/${id}`}>
            <h3 className="line-clamp-2 text-sm font-medium text-white hover:text-blue-400">
              {title}
            </h3>
          </Link>
          <Link
            href={`/channel/${channel.id}`}
            className="text-xs text-neutral-400 hover:text-white"
          >
            {channel.name}
          </Link>
          <p className="text-xs text-neutral-400">
            {formatViews(views)} просмотров • {formatRelativeTime(new Date(createdAt))}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="group">
      <Link
        href={`/watch/${id}`}
        className="relative aspect-video overflow-hidden rounded-xl bg-neutral-800 block"
      >
        <Image
          src={thumbnail}
          alt={title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
        {duration && (
          <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
            {formatDuration(duration)}
          </span>
        )}
      </Link>
      <div className="mt-3 flex gap-3">
        <Link href={`/channel/${channel.id}`}>
          <Avatar className="h-9 w-9">
            <AvatarImage src={channel.avatar || ""} alt={channel.name} />
            <AvatarFallback className="bg-purple-600 text-white text-sm">
              {channel.name[0]}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/watch/${id}`}>
            <h3 className="line-clamp-2 font-medium text-white leading-snug hover:text-blue-400">
              {title}
            </h3>
          </Link>
          <Link
            href={`/channel/${channel.id}`}
            className="text-sm text-neutral-400 hover:text-white"
          >
            {channel.name}
          </Link>
          <p className="text-sm text-neutral-400">
            {formatViews(views)} просмотров • {formatRelativeTime(new Date(createdAt))}
          </p>
        </div>
      </div>
    </div>
  )
}
