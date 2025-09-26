import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export interface MessageData {
  id: string
  content: string
  username: string
  timestamp: Date
  isOwn?: boolean
}

interface MessageProps {
  message: MessageData
}

export function Message({ message }: MessageProps) {
  return (
    <div className={cn("flex gap-3 p-3", message.isOwn ? "flex-row-reverse" : "flex-row")}>
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarFallback className="text-xs bg-primary/10 text-primary">
          {message.username.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className={cn("flex flex-col gap-1 max-w-[70%]", message.isOwn ? "items-end" : "items-start")}>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium">{message.username}</span>
          <span>
            {message.timestamp.toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <div
          className={cn(
            "rounded-2xl px-4 py-2 text-sm break-words",
            message.isOwn ? "bg-message-bubble-own text-primary-foreground" : "bg-message-bubble text-foreground",
          )}
        >
          {message.content}
        </div>
      </div>
    </div>
  )
}
