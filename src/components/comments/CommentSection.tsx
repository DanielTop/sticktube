"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ThumbsUp, ThumbsDown, MoreVertical } from "lucide-react"
import { formatRelativeTime } from "@/lib/youtube"

interface Comment {
  id: string
  text: string
  likes: number
  createdAt: string
  user: {
    id: string
    name: string | null
    image: string | null
  }
  replies?: Comment[]
}

interface CommentSectionProps {
  videoId: string
}

export function CommentSection({ videoId }: CommentSectionProps) {
  const { data: session } = useSession()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchComments()
  }, [videoId])

  const fetchComments = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/videos/${videoId}/comments`)
      if (res.ok) {
        const data = await res.json()
        setComments(data)
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!newComment.trim() || !session) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/videos/${videoId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newComment }),
      })

      if (res.ok) {
        const comment = await res.json()
        setComments([comment, ...comments])
        setNewComment("")
      }
    } catch (error) {
      console.error("Failed to post comment:", error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* New comment form */}
      {session && (
        <div className="flex gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
            <AvatarFallback className="bg-purple-600 text-white">
              {session.user?.name?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder="Оставьте комментарий..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[60px] resize-none border-0 border-b border-neutral-700 bg-transparent text-white placeholder:text-neutral-500 focus-visible:ring-0 focus-visible:border-blue-500"
            />
            <div className="mt-2 flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setNewComment("")}
                className="text-neutral-400 hover:text-white"
              >
                Отмена
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={!newComment.trim() || submitting}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Отправить
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="py-8 text-center text-neutral-400">Загрузка...</div>
      ) : comments.length === 0 ? (
        <div className="py-8 text-center text-neutral-400">
          Пока нет комментариев. Будьте первым!
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  )
}

function CommentItem({ comment }: { comment: Comment }) {
  return (
    <div className="flex gap-3">
      <Avatar className="h-10 w-10">
        <AvatarImage src={comment.user.image || ""} alt={comment.user.name || ""} />
        <AvatarFallback className="bg-purple-600 text-white">
          {comment.user.name?.[0] || "U"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">
            {comment.user.name}
          </span>
          <span className="text-xs text-neutral-500">
            {formatRelativeTime(new Date(comment.createdAt))}
          </span>
        </div>
        <p className="mt-1 text-sm text-neutral-300 whitespace-pre-wrap">
          {comment.text}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-neutral-400 hover:text-white"
          >
            <ThumbsUp className="mr-1 h-4 w-4" />
            {comment.likes > 0 && comment.likes}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-neutral-400 hover:text-white"
          >
            <ThumbsDown className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-neutral-400 hover:text-white"
          >
            Ответить
          </Button>
        </div>
      </div>
    </div>
  )
}
