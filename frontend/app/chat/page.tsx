"use client"

import { useAuth } from "@/hooks/use-auth"
import { ChatRoom } from "@/components/chat/chat-room"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ChatPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth")
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

  if (!user) {
    return null
  }

  return <ChatRoom />
}
