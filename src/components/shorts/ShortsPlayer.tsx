"use client"

import { useState, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ThumbsUp, MessageCircle, Share2, MoreVertical, ChevronUp, ChevronDown } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { formatViews } from "@/lib/youtube"

interface Short {
  id: string
  youtubeId: string
  title: string
  description: string | null
  views: number
  channel: {
    id: string
    name: string
    avatar: string | null
  }
  _count: {
    likes: number
    comments: number
  }
}

interface ShortsPlayerProps {
  shorts: Short[]
}

export function ShortsPlayer({ shorts }: ShortsPlayerProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const currentShort = shorts[currentIndex]

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const goToNext = () => {
    if (currentIndex < shorts.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        e.preventDefault()
        goToPrevious()
      } else if (e.key === "ArrowDown") {
        e.preventDefault()
        goToNext()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentIndex])

  // Scroll wheel navigation
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let timeout: NodeJS.Timeout

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        if (e.deltaY > 0) {
          goToNext()
        } else {
          goToPrevious()
        }
      }, 50)
    }

    container.addEventListener("wheel", handleWheel, { passive: false })
    return () => container.removeEventListener("wheel", handleWheel)
  }, [currentIndex])

  const handleLike = async () => {
    if (!session) {
      router.push("/login")
      return
    }
    await fetch(`/api/videos/${currentShort.id}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isLike: true }),
    })
  }

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/shorts/${currentShort.id}`)
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 top-14 bg-black flex items-center justify-center"
    >
      {/* Navigation arrows */}
      <div className="absolute right-4 md:right-20 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPrevious}
          disabled={currentIndex === 0}
          className="rounded-full bg-neutral-800/80 text-white hover:bg-neutral-700 disabled:opacity-30"
        >
          <ChevronUp className="h-6 w-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={goToNext}
          disabled={currentIndex === shorts.length - 1}
          className="rounded-full bg-neutral-800/80 text-white hover:bg-neutral-700 disabled:opacity-30"
        >
          <ChevronDown className="h-6 w-6" />
        </Button>
      </div>

      {/* Video container */}
      <div className="relative h-full max-h-[calc(100vh-56px)] aspect-[9/16] bg-neutral-900 rounded-lg overflow-hidden">
        {/* YouTube embed */}
        <iframe
          key={currentShort.id}
          src={`https://www.youtube-nocookie.com/embed/${currentShort.youtubeId}?autoplay=1&loop=1&controls=0&modestbranding=1&playsinline=1`}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

        {/* Action buttons (right side) */}
        <div className="absolute right-3 bottom-32 flex flex-col items-center gap-6">
          <button
            onClick={handleLike}
            className="flex flex-col items-center gap-1 text-white"
          >
            <div className="p-3 rounded-full bg-neutral-800/60 hover:bg-neutral-700/80">
              <ThumbsUp className="h-6 w-6" />
            </div>
            <span className="text-xs">{formatViews(currentShort._count.likes)}</span>
          </button>

          <Link
            href={`/watch/${currentShort.id}`}
            className="flex flex-col items-center gap-1 text-white"
          >
            <div className="p-3 rounded-full bg-neutral-800/60 hover:bg-neutral-700/80">
              <MessageCircle className="h-6 w-6" />
            </div>
            <span className="text-xs">{formatViews(currentShort._count.comments)}</span>
          </Link>

          <button
            onClick={handleShare}
            className="flex flex-col items-center gap-1 text-white"
          >
            <div className="p-3 rounded-full bg-neutral-800/60 hover:bg-neutral-700/80">
              <Share2 className="h-6 w-6" />
            </div>
            <span className="text-xs">Поделиться</span>
          </button>

          <button className="p-3 rounded-full bg-neutral-800/60 hover:bg-neutral-700/80 text-white">
            <MoreVertical className="h-6 w-6" />
          </button>
        </div>

        {/* Video info (bottom) */}
        <div className="absolute left-3 right-16 bottom-6 text-white">
          <Link
            href={`/channel/${currentShort.channel.id}`}
            className="flex items-center gap-3 mb-3"
          >
            <Avatar className="h-10 w-10 border-2 border-white">
              <AvatarImage src={currentShort.channel.avatar || ""} />
              <AvatarFallback className="bg-red-600">
                {currentShort.channel.name[0]}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{currentShort.channel.name}</span>
            <Button size="sm" className="ml-2 rounded-full bg-white text-black hover:bg-neutral-200 text-xs px-3 h-7">
              Подписаться
            </Button>
          </Link>

          <h3 className="font-medium text-sm line-clamp-2 mb-1">
            {currentShort.title}
          </h3>

          {currentShort.description && (
            <p className="text-xs text-neutral-300 line-clamp-1">
              {currentShort.description}
            </p>
          )}
        </div>
      </div>

      {/* Progress indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-neutral-400 text-sm">
        {currentIndex + 1} / {shorts.length}
      </div>
    </div>
  )
}
