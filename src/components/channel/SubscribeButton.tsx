"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SubscribeButtonProps {
  channelId: string
  isSubscribed?: boolean
  subscriberCount?: number
}

export function SubscribeButton({
  channelId,
  isSubscribed: initialSubscribed = false,
  subscriberCount: initialCount = 0,
}: SubscribeButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isSubscribed, setIsSubscribed] = useState(initialSubscribed)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    if (!session) {
      router.push("/login")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/channels/${channelId}/subscribe`, {
        method: "POST",
      })

      if (res.ok) {
        const data = await res.json()
        setIsSubscribed(data.subscribed)
        setCount(data.subscriberCount)
      }
    } catch (error) {
      console.error("Failed to subscribe:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleSubscribe}
      disabled={loading}
      className={cn(
        "rounded-full px-4 font-medium",
        isSubscribed
          ? "bg-neutral-800 text-white hover:bg-neutral-700"
          : "bg-white text-black hover:bg-neutral-200"
      )}
    >
      {isSubscribed ? (
        <>
          <Bell className="mr-2 h-4 w-4" />
          Вы подписаны
        </>
      ) : (
        "Подписаться"
      )}
    </Button>
  )
}
