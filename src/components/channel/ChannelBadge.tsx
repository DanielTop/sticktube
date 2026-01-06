"use client"

import { cn } from "@/lib/utils"

interface ChannelBadgeProps {
  subscribers: number
  className?: string
}

export function ChannelBadge({ subscribers, className }: ChannelBadgeProps) {
  // Silver: 10,000+ subscribers
  // Gold: 100,000+ subscribers
  // Rainbow: 1,000,000,000+ subscribers

  if (subscribers >= 1000000000) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold",
          "bg-gradient-to-r from-purple-500 via-yellow-400 to-purple-500 text-white animate-pulse",
          className
        )}
        style={{
          background: "linear-gradient(90deg, #a855f7, #d4ff00, #f59e0b, #a855f7)",
          backgroundSize: "200% 100%",
          animation: "rainbow-shift 2s linear infinite",
        }}
        title="1 миллиард+ подписчиков"
      >
        🌈 ЛЕГЕНДА
      </span>
    )
  }

  if (subscribers >= 100000) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold",
          "bg-gradient-to-r from-yellow-400 to-yellow-600 text-black",
          className
        )}
        title="100,000+ подписчиков"
      >
        🥇 ЗОЛОТО
      </span>
    )
  }

  if (subscribers >= 10000) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold",
          "bg-gradient-to-r from-gray-300 to-gray-400 text-black",
          className
        )}
        title="10,000+ подписчиков"
      >
        🥈 СЕРЕБРО
      </span>
    )
  }

  return null
}
