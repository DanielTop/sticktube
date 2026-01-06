"use client"

import { useState } from "react"
import { Header } from "@/components/layout/Header"
import { Sidebar } from "@/components/layout/Sidebar"
import { cn } from "@/lib/utils"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Начинаем с открытого sidebar - это избегает мерцания
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main
        className={cn(
          "pt-14 transition-all duration-200 md:ml-60",
          !sidebarOpen && "md:ml-[72px]"
        )}
      >
        {children}
      </main>
    </div>
  )
}
