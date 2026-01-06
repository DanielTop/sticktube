"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Video, Shield } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [showAdmin, setShowAdmin] = useState(false)
  const [adminCode, setAdminCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleAdminLogin = async () => {
    if (adminCode === "4444") {
      setLoading(true)
      // Создаём сессию админа
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: adminCode }),
      })

      if (res.ok) {
        router.push("/")
        router.refresh()
      } else {
        setError("Ошибка входа")
        setLoading(false)
      }
    } else {
      setError("Неверный код")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 p-4">
      <Card className="w-full max-w-md bg-neutral-900 border-neutral-800">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-red-600">
              <Video className="h-10 w-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-white">
            Войти в StikTube
          </CardTitle>
          <p className="text-neutral-400 mt-2">
            Смотрите видео и создавайте свой контент
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showAdmin ? (
            <>
              <Button
                onClick={() => signIn("google", { callbackUrl: "/" })}
                className="w-full bg-white text-black hover:bg-neutral-200"
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Войти через Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-700"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-neutral-900 px-2 text-neutral-500">или</span>
                </div>
              </div>

              <Button
                onClick={() => setShowAdmin(true)}
                variant="outline"
                className="w-full border-neutral-700 text-white hover:bg-neutral-800"
              >
                <Shield className="mr-2 h-4 w-4" />
                Войти как Админ
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-white">Код администратора</Label>
                <Input
                  id="code"
                  type="password"
                  value={adminCode}
                  onChange={(e) => {
                    setAdminCode(e.target.value)
                    setError("")
                  }}
                  placeholder="Введите код"
                  className="bg-neutral-800 border-neutral-700 text-white text-center text-2xl tracking-widest"
                  maxLength={4}
                />
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              </div>

              <Button
                onClick={handleAdminLogin}
                disabled={loading || adminCode.length !== 4}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {loading ? "Вход..." : "Войти"}
              </Button>

              <Button
                onClick={() => {
                  setShowAdmin(false)
                  setAdminCode("")
                  setError("")
                }}
                variant="ghost"
                className="w-full text-neutral-400"
              >
                Назад
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
