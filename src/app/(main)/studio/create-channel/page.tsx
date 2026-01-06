"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CreateChannelPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [name, setName] = useState("")
  const [handle, setHandle] = useState("")
  const [description, setDescription] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, handle, description }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to create channel")
      }

      router.push("/studio")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при создании канала")
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-neutral-400">Войдите, чтобы создать канал</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="bg-neutral-800 border-neutral-700">
        <CardHeader>
          <CardTitle className="text-white">Создать канал</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">
                Название канала
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Мой крутой канал"
                required
                className="bg-neutral-900 border-neutral-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="handle" className="text-white">
                Уникальный идентификатор
              </Label>
              <div className="flex items-center">
                <span className="text-neutral-400 mr-1">@</span>
                <Input
                  id="handle"
                  value={handle}
                  onChange={(e) =>
                    setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
                  }
                  placeholder="mychannel"
                  required
                  className="bg-neutral-900 border-neutral-700 text-white"
                />
              </div>
              <p className="text-xs text-neutral-500">
                Только латинские буквы, цифры и подчёркивание
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">
                Описание
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Расскажите о своём канале..."
                rows={4}
                className="bg-neutral-900 border-neutral-700 text-white resize-none"
              />
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
                disabled={loading || !name || !handle}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? "Создание..." : "Создать канал"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
