"use client"

import { useState, useEffect, useRef } from "react"
import { Message, type MessageData } from "./message"
import { MessageInput } from "./message-input"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { LogOut, Globe } from "lucide-react"
import Image from "next/image"

export function ChatRoom() {
  const [messages, setMessages] = useState<MessageData[]>([])
  const { user, logout } = useAuth()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Mock initial messages
  useEffect(() => {
    const initialMessages: MessageData[] = [
      {
        id: "1",
        content: "Chào mọi người! 👋",
        username: "Admin",
        timestamp: new Date(Date.now() - 300000),
      },
      {
        id: "2",
        content: "Xin chào! Rất vui được tham gia chat cùng mọi người",
        username: "User123",
        timestamp: new Date(Date.now() - 240000),
      },
      {
        id: "3",
        content: "Hôm nay thời tiết đẹp quá!",
        username: "ChatLover",
        timestamp: new Date(Date.now() - 180000),
      },
    ]
    setMessages(initialMessages)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = (content: string) => {
    if (!user) return

    const newMessage: MessageData = {
      id: Date.now().toString(),
      content,
      username: user.username,
      timestamp: new Date(),
      isOwn: true,
    }

    setMessages((prev) => [...prev, newMessage])
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-card border-b">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Chat App Logo"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-semibold">Kênh Thế Giới</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Xin chào, {user?.username}!</span>
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" />
            Đăng xuất
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1">
          {messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  )
}
