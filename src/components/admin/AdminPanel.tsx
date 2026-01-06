"use client"

import { useState } from "react"
import { Users, Video, UserPlus, Trash2, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Channel {
  id: string
  name: string
  handle: string
  avatar: string | null
  fakeSubscribers: number
  user: { name: string | null; email: string | null }
  _count: { subscribers: number; videos: number }
}

interface Subscription {
  id: string
  user: { id: string; name: string | null; email: string | null }
  channel: { id: string; name: string }
  createdAt: Date
}

interface User {
  id: string
  name: string | null
  email: string | null
  image: string | null
  _count: { subscriptions: number }
}

interface AdminPanelProps {
  channels: Channel[]
  subscriptions: Subscription[]
  users: User[]
}

export function AdminPanel({ channels, subscriptions, users }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"channels" | "subscribers" | "users">("channels")
  const [loading, setLoading] = useState<string | null>(null)
  const [subCounts, setSubCounts] = useState<Record<string, number>>({})

  const updateSubCount = async (channelId: string, count: number) => {
    setLoading(`update-${channelId}`)
    try {
      await fetch("/api/admin/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelId, count }),
      })
      window.location.reload()
    } catch (e) {
      console.error(e)
    }
    setLoading(null)
  }

  const addSubscriber = async (channelId: string, userId: string) => {
    setLoading(`add-${channelId}-${userId}`)
    try {
      await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelId, userId }),
      })
      window.location.reload()
    } catch (e) {
      console.error(e)
    }
    setLoading(null)
  }

  const removeSubscription = async (subscriptionId: string) => {
    setLoading(`remove-${subscriptionId}`)
    try {
      await fetch(`/api/admin/subscriptions/${subscriptionId}`, {
        method: "DELETE",
      })
      window.location.reload()
    } catch (e) {
      console.error(e)
    }
    setLoading(null)
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === "channels" ? "default" : "secondary"}
          onClick={() => setActiveTab("channels")}
          className="gap-2"
        >
          <Video className="h-4 w-4" />
          Каналы ({channels.length})
        </Button>
        <Button
          variant={activeTab === "subscribers" ? "default" : "secondary"}
          onClick={() => setActiveTab("subscribers")}
          className="gap-2"
        >
          <Users className="h-4 w-4" />
          Подписки ({subscriptions.length})
        </Button>
        <Button
          variant={activeTab === "users" ? "default" : "secondary"}
          onClick={() => setActiveTab("users")}
          className="gap-2"
        >
          <Users className="h-4 w-4" />
          Пользователи ({users.length})
        </Button>
      </div>

      {/* Channels Tab */}
      {activeTab === "channels" && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-white">Управление подписчиками</h2>
          <div className="grid gap-4">
            {channels.map((channel) => (
              <div
                key={channel.id}
                className="p-4 rounded-lg bg-neutral-800"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={channel.avatar || ""} />
                      <AvatarFallback className="bg-purple-600">
                        {channel.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-white">{channel.name}</p>
                      <p className="text-sm text-neutral-400">@{channel.handle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">
                        {(channel._count.subscribers + channel.fakeSubscribers).toLocaleString()}
                      </p>
                      <p className="text-xs text-neutral-400">подписчиков</p>
                      <p className="text-xs text-neutral-500">({channel._count.subscribers} реальных + {channel.fakeSubscribers} добавлено)</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-white">
                        {channel._count.videos}
                      </p>
                      <p className="text-xs text-neutral-400">видео</p>
                    </div>
                  </div>
                </div>

                {/* Subscriber controls */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-neutral-400">Добавить:</span>
                  {[1, 10, 100, 1000, 10000, 100000, 1000000].map((num) => (
                    <Button
                      key={num}
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      disabled={loading !== null}
                      onClick={() => updateSubCount(channel.id, num)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {num.toLocaleString()}
                    </Button>
                  ))}
                </div>

                <div className="flex items-center gap-2 flex-wrap mt-2">
                  <span className="text-sm text-neutral-400">Убрать:</span>
                  {[1, 10, 100, 1000].map((num) => (
                    <Button
                      key={num}
                      size="sm"
                      variant="destructive"
                      className="text-xs"
                      disabled={loading !== null}
                      onClick={() => updateSubCount(channel.id, -num)}
                    >
                      <Minus className="h-3 w-3 mr-1" />
                      {num.toLocaleString()}
                    </Button>
                  ))}
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <Input
                    type="number"
                    placeholder="Своё число"
                    className="w-32 bg-neutral-900 border-neutral-700 text-white"
                    value={subCounts[channel.id] || ""}
                    onChange={(e) => setSubCounts({ ...subCounts, [channel.id]: parseInt(e.target.value) || 0 })}
                  />
                  <Button
                    size="sm"
                    disabled={loading !== null || !subCounts[channel.id]}
                    onClick={() => updateSubCount(channel.id, subCounts[channel.id])}
                  >
                    Установить
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subscriptions Tab */}
      {activeTab === "subscribers" && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-white">Все подписки</h2>
          <div className="grid gap-2">
            {subscriptions.length === 0 ? (
              <p className="text-neutral-400">Нет подписок</p>
            ) : (
              subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-neutral-800"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-white">{sub.user.name || sub.user.email || "Unknown"}</span>
                    <span className="text-neutral-500">→</span>
                    <span className="text-blue-400">{sub.channel.name}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removeSubscription(sub.id)}
                    disabled={loading === `remove-${sub.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-white">Все пользователи</h2>
          <div className="grid gap-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 rounded-lg bg-neutral-800"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={user.image || ""} />
                    <AvatarFallback className="bg-green-600">
                      {(user.name || user.email || "U")[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white">{user.name || "Без имени"}</p>
                    <p className="text-sm text-neutral-400">{user.email || "No email"}</p>
                  </div>
                </div>
                <div className="text-sm text-neutral-400">
                  {user._count.subscriptions} подписок
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
