"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { extractYoutubeId, getYoutubeThumbnail } from "@/lib/youtube"
import { Video, Link as LinkIcon, Zap } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

export default function UploadVideoPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [youtubeId, setYoutubeId] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState("")
  const [isShort, setIsShort] = useState(false)

  const handleUrlChange = (url: string) => {
    setYoutubeUrl(url)
    const id = extractYoutubeId(url)
    setYoutubeId(id || "")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!youtubeId) {
      setError("Введите корректную ссылку на YouTube видео")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          youtubeId,
          title,
          description,
          tags,
          isShort,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to add video")
      }

      router.push(`/watch/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при добавлении видео")
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-neutral-400">Войдите, чтобы добавить видео</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card className="bg-neutral-800 border-neutral-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Video className="h-5 w-5" />
            Добавить видео
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* YouTube URL */}
            <div className="space-y-2">
              <Label htmlFor="url" className="text-white">
                Ссылка на YouTube видео
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <Input
                    id="url"
                    value={youtubeUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="pl-10 bg-neutral-900 border-neutral-700 text-white"
                  />
                </div>
              </div>
              <p className="text-xs text-neutral-500">
                Вставьте ссылку на YouTube видео или его ID
              </p>
            </div>

            {/* Video preview */}
            {youtubeId && (
              <div className="rounded-lg overflow-hidden bg-neutral-900">
                <div className="relative aspect-video">
                  <Image
                    src={getYoutubeThumbnail(youtubeId, "maxres")}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-3 text-sm text-neutral-400">
                  ID видео: {youtubeId}
                </div>
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-white">
                Название
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Введите название видео"
                required
                maxLength={100}
                className="bg-neutral-900 border-neutral-700 text-white"
              />
              <p className="text-xs text-neutral-500 text-right">
                {title.length}/100
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">
                Описание
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Расскажите о видео..."
                rows={5}
                maxLength={5000}
                className="bg-neutral-900 border-neutral-700 text-white resize-none"
              />
              <p className="text-xs text-neutral-500 text-right">
                {description.length}/5000
              </p>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags" className="text-white">
                Теги
              </Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="gaming, tutorial, funny"
                className="bg-neutral-900 border-neutral-700 text-white"
              />
              <p className="text-xs text-neutral-500">
                Разделяйте теги запятыми
              </p>
            </div>

            {/* Shorts checkbox */}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-neutral-900 border border-neutral-700">
              <Checkbox
                id="isShort"
                checked={isShort}
                onCheckedChange={(checked) => setIsShort(checked === true)}
                className="border-neutral-500"
              />
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <Label htmlFor="isShort" className="text-white cursor-pointer">
                  Это Short (вертикальное видео до 60 сек)
                </Label>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
                className="text-neutral-400"
              >
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={loading || !youtubeId || !title}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? "Добавление..." : "Добавить видео"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
