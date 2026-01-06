"use client"

import Link from "next/link"
import { useSession, signIn, signOut } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Menu,
  Search,
  Mic,
  Video,
  Bell,
  User,
  LogOut,
  Settings,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between bg-neutral-900 px-4">
      {/* Left section */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-neutral-800"
          onClick={onMenuClick}
        >
          <Menu className="h-6 w-6" />
        </Button>
        <Link href="/" className="flex items-center gap-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden">
            <svg viewBox="0 0 32 32" className="h-8 w-8">
              <rect x="0" y="0" width="32" height="11" fill="#a020f0"/>
              <rect x="0" y="11" width="32" height="11" fill="#d4ff00"/>
              <rect x="0" y="22" width="32" height="10" fill="#f5b800"/>
              <polygon points="12,8 12,24 22,16" fill="white"/>
            </svg>
          </div>
          <span className="text-xl font-semibold rainbow-text">StikTube</span>
        </Link>
      </div>

      {/* Center section - Search */}
      <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-4">
        <div className="flex w-full">
          <Input
            type="text"
            placeholder="Поиск"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-r-none border-neutral-700 bg-neutral-900 text-white placeholder:text-neutral-400 focus-visible:ring-1 focus-visible:ring-blue-500"
          />
          <Button
            type="submit"
            variant="ghost"
            className="rounded-l-none border border-l-0 border-neutral-700 bg-neutral-800 px-6 text-white hover:bg-neutral-700"
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="ml-2 rounded-full bg-neutral-800 text-white hover:bg-neutral-700"
        >
          <Mic className="h-5 w-5" />
        </Button>
      </form>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {session ? (
          <>
            <Link href="/studio/upload">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-neutral-800"
              >
                <Plus className="h-6 w-6" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-neutral-800"
            >
              <Bell className="h-6 w-6" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={session.user?.image || ""}
                      alt={session.user?.name || ""}
                    />
                    <AvatarFallback className="bg-purple-600 text-white">
                      {session.user?.name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 bg-neutral-800 text-white border-neutral-700"
                align="end"
              >
                <div className="flex items-center gap-3 p-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={session.user?.image || ""}
                      alt={session.user?.name || ""}
                    />
                    <AvatarFallback className="bg-purple-600 text-white">
                      {session.user?.name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{session.user?.name}</p>
                    <p className="text-sm text-neutral-400">
                      {session.user?.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-neutral-700" />
                {session.user?.channelId ? (
                  <DropdownMenuItem
                    className="cursor-pointer hover:bg-neutral-700"
                    onClick={() =>
                      router.push(`/channel/${session.user.channelId}`)
                    }
                  >
                    <User className="mr-2 h-4 w-4" />
                    Мой канал
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    className="cursor-pointer hover:bg-neutral-700"
                    onClick={() => router.push("/studio/create-channel")}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Создать канал
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="cursor-pointer hover:bg-neutral-700"
                  onClick={() => router.push("/studio")}
                >
                  <Video className="mr-2 h-4 w-4" />
                  Студия
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-neutral-700">
                  <Settings className="mr-2 h-4 w-4" />
                  Настройки
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-neutral-700" />
                <DropdownMenuItem
                  className="cursor-pointer hover:bg-neutral-700"
                  onClick={() => signOut()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Выйти
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <Link href="/login">
            <Button
              variant="outline"
              className="border-blue-500 text-blue-500 hover:bg-blue-500/10"
            >
              <User className="mr-2 h-4 w-4" />
              Войти
            </Button>
          </Link>
        )}
      </div>
    </header>
  )
}
