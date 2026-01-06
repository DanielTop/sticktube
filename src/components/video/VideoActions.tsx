"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { ThumbsUp, ThumbsDown, Share2, Download, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatViews } from "@/lib/youtube"
import { cn } from "@/lib/utils"

interface VideoActionsProps {
  videoId: string
  likes: number
  dislikes: number
  userLike?: boolean | null
}

export function VideoActions({
  videoId,
  likes: initialLikes,
  dislikes: initialDislikes,
  userLike: initialUserLike,
}: VideoActionsProps) {
  const { data: session } = useSession()
  const [likes, setLikes] = useState(initialLikes)
  const [dislikes, setDislikes] = useState(initialDislikes)
  const [userLike, setUserLike] = useState<boolean | null>(initialUserLike ?? null)

  const handleLike = async (isLike: boolean) => {
    if (!session) return

    try {
      const res = await fetch(`/api/videos/${videoId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isLike }),
      })

      if (res.ok) {
        const data = await res.json()
        setLikes(data.likes)
        setDislikes(data.dislikes)
        setUserLike(data.userLike)
      }
    } catch (error) {
      console.error("Failed to like video:", error)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Смотри видео на StikTube",
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center rounded-full bg-neutral-800">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "rounded-l-full rounded-r-none px-4 hover:bg-neutral-700",
            userLike === true && "text-blue-500"
          )}
          onClick={() => handleLike(true)}
        >
          <ThumbsUp className="mr-2 h-5 w-5" />
          {formatViews(likes)}
        </Button>
        <div className="h-6 w-px bg-neutral-700" />
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "rounded-l-none rounded-r-full px-4 hover:bg-neutral-700",
            userLike === false && "text-blue-500"
          )}
          onClick={() => handleLike(false)}
        >
          <ThumbsDown className="h-5 w-5" />
        </Button>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="rounded-full bg-neutral-800 px-4 hover:bg-neutral-700"
        onClick={handleShare}
      >
        <Share2 className="mr-2 h-5 w-5" />
        Поделиться
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="rounded-full bg-neutral-800 px-4 hover:bg-neutral-700"
      >
        <Download className="mr-2 h-5 w-5" />
        Скачать
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-neutral-800 hover:bg-neutral-700"
          >
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-neutral-800 text-white border-neutral-700">
          <DropdownMenuItem className="cursor-pointer hover:bg-neutral-700">
            Добавить в плейлист
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer hover:bg-neutral-700">
            Смотреть позже
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer hover:bg-neutral-700">
            Пожаловаться
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
