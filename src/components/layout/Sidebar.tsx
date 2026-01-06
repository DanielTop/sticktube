"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  Home,
  Video,
  Shield,
  Zap,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface SidebarProps {
  isOpen: boolean
  onClose?: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isAdmin = session?.user?.email?.includes("admin@stiktube")

  const mainLinks = [
    { href: "/", icon: Home, label: "Главная" },
    { href: "/shorts", icon: Zap, label: "Shorts" },
  ]

  const studioLinks = session ? [
    { href: "/studio", icon: Video, label: "Студия" },
    ...(isAdmin ? [{ href: "/studio/admin", icon: Shield, label: "Админ" }] : []),
  ] : []

  // Skeleton - узкий sidebar до гидратации
  if (!mounted) {
    return (
      <aside className="fixed left-0 top-14 z-40 hidden w-[72px] flex-col bg-neutral-900 md:flex h-[calc(100vh-56px)] border-r border-neutral-800">
        <div className="flex flex-col items-center gap-1 py-2">
          <div className="flex flex-col items-center justify-center w-16 h-16 rounded-lg text-[10px] text-neutral-400">
            <Home className="h-6 w-6 mb-1" />
            Главная
          </div>
          <div className="flex flex-col items-center justify-center w-16 h-16 rounded-lg text-[10px] text-neutral-400">
            <Zap className="h-6 w-6 mb-1" />
            Shorts
          </div>
        </div>
      </aside>
    )
  }

  // Свернутый sidebar (маленький)
  if (!isOpen) {
    return (
      <aside className="fixed left-0 top-14 z-40 hidden w-[72px] flex-col bg-neutral-900 md:flex h-[calc(100vh-56px)] border-r border-neutral-800">
        <div className="flex flex-col items-center gap-1 py-2">
          <Link
            href="/"
            className={cn(
              "flex flex-col items-center justify-center w-16 h-16 rounded-lg text-[10px] text-neutral-400 hover:bg-neutral-800",
              pathname === "/" && "bg-neutral-800 text-white"
            )}
          >
            <Home className="h-6 w-6 mb-1" />
            Главная
          </Link>
          <Link
            href="/shorts"
            className={cn(
              "flex flex-col items-center justify-center w-16 h-16 rounded-lg text-[10px] text-neutral-400 hover:bg-neutral-800",
              pathname === "/shorts" && "bg-neutral-800 text-white"
            )}
          >
            <Zap className="h-6 w-6 mb-1" />
            Shorts
          </Link>
          {session && (
            <>
              <Link
                href="/studio"
                className={cn(
                  "flex flex-col items-center justify-center w-16 h-16 rounded-lg text-[10px] text-neutral-400 hover:bg-neutral-800",
                  pathname === "/studio" && "bg-neutral-800 text-white"
                )}
              >
                <Video className="h-6 w-6 mb-1" />
                Студия
              </Link>
              {isAdmin && (
                <Link
                  href="/studio/admin"
                  className={cn(
                    "flex flex-col items-center justify-center w-16 h-16 rounded-lg text-[10px] text-neutral-400 hover:bg-neutral-800",
                    pathname === "/studio/admin" && "bg-neutral-800 text-white"
                  )}
                >
                  <Shield className="h-6 w-6 mb-1" />
                  Админ
                </Link>
              )}
            </>
          )}
        </div>
      </aside>
    )
  }

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className="fixed inset-0 z-40 bg-black/50 md:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside className="fixed left-0 top-14 z-50 flex w-60 flex-col bg-neutral-900 h-[calc(100vh-56px)] border-r border-neutral-800">
        <div className="flex-1 overflow-y-auto px-2">
          {/* Main links */}
          <div className="py-2">
            {mainLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-4 rounded-lg px-3 py-2 text-sm text-neutral-400 hover:bg-neutral-800",
                  pathname === link.href && "bg-neutral-800 text-white"
                )}
              >
                <link.icon className="h-5 w-5" />
                {link.label}
              </Link>
            ))}
          </div>

          {session && (
            <>
              <Separator className="bg-neutral-800" />
              <div className="py-2">
                <h3 className="mb-1 px-3 text-sm font-medium text-white">
                  Управление
                </h3>
                {studioLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-4 rounded-lg px-3 py-2 text-sm text-neutral-400 hover:bg-neutral-800",
                      pathname === link.href && "bg-neutral-800 text-white"
                    )}
                  >
                    <link.icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </>
          )}

          <Separator className="bg-neutral-800" />

          {/* Footer */}
          <div className="py-4 px-3">
            <p className="text-xs text-neutral-500">
              StikTube © 2025
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
