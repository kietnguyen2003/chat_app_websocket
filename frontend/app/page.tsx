"use client"

import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle, Users, Shield } from "lucide-react"
import Image from "next/image"

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.push("/chat")
      }
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen chat-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return null
  }

  return (
    <div className="min-h-screen chat-gradient">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <Image
              src="/logo.png"
              alt="Chat App Logo"
              width={120}
              height={120}
              className="rounded-2xl shadow-lg"
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Chat App
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Kết nối với mọi người trên thế giới trong kênh chat toàn cầu. Chia sẻ suy nghĩ, kết bạn và trò chuyện thú
            vị.
          </p>
          <Button size="lg" onClick={() => router.push("/auth")} className="text-lg px-8 py-3">
            Bắt đầu chat ngay
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center p-6 bg-card/50 backdrop-blur-sm rounded-xl">
            <MessageCircle className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Chat Real-time</h3>
            <p className="text-muted-foreground">Nhắn tin tức thời với mọi người trên khắp thế giới</p>
          </div>

          <div className="text-center p-6 bg-card/50 backdrop-blur-sm rounded-xl">
            <Users className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Cộng đồng toàn cầu</h3>
            <p className="text-muted-foreground">Tham gia kênh thế giới và kết nối với mọi người</p>
          </div>

          <div className="text-center p-6 bg-card/50 backdrop-blur-sm rounded-xl">
            <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Bảo mật cao</h3>
            <p className="text-muted-foreground">Hệ thống xác thực an toàn với token management</p>
          </div>
        </div>
      </div>
    </div>
  )
}
