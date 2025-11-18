"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, HelpCircle, AlertTriangle, Pin } from "lucide-react"

export default function DoubtCard({ doubt, onJoinChat, isTeacher = false }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'trending': return 'bg-green-500'
      case 'unsolved': return 'bg-yellow-500'
      case 'solved': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-500'
      case 'medium': return 'text-yellow-500'
      case 'low': return 'text-green-500'
      default: return 'text-gray-500'
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-background/80 backdrop-blur-sm border-border/50">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={doubt.student?.avatar || "/placeholder-avatar.jpg"} />
            <AvatarFallback>{doubt.student?.name?.[0] || "U"}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h3 className="font-semibold text-lg line-clamp-2">{doubt.title || "Untitled Doubt"}</h3>
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusColor(doubt.status)}`} />
              {doubt.isUrgent && (
                <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 rounded-full text-xs">
                  <AlertTriangle className="h-3 w-3" />
                  Urgent
                </div>
              )}
            </div>

            <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
              {doubt.content || "No content available"}
            </p>

            {doubt.hasNote && doubt.noteTitle && (
              <div className="flex items-center gap-2 mb-3 p-2 bg-muted/30 rounded-lg">
                <Pin className="h-3 w-3 text-primary" />
                <span className="text-xs text-muted-foreground">Attached: {doubt.noteTitle}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-xs">
                    {doubt.student?.badge || "Student"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {doubt.student?.reputation || 0} XP
                  </span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {doubt.tags?.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{doubt.replies || 0} replies</span>
                  <span>{doubt.upvotes || 0} upvotes</span>
                  <span>{doubt.chatParticipants || 0} in chat</span>
                </div>
              </div>

              {isTeacher && (
                <Button size="sm" onClick={() => onJoinChat(doubt.id)} className="flex-shrink-0">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Join Chat
                </Button>
              )}
            </div>

            {doubt.mentions && doubt.mentions.length > 0 && (
              <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                Mentions: {doubt.mentions.join(", ")}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
