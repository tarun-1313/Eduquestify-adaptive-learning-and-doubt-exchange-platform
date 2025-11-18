import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, User, Clock, BookOpen } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Doubt {
  id: number
  title: string
  body: string
  subject: string
  status: string
  user_name: string
  user_email: string
  created_at: string
  message_count: number
  last_activity: string | null
}

interface DoubtCardProps {
  doubt: Doubt
  onJoinChat: (doubtId: number) => void
}

export default function DoubtCard({ doubt, onJoinChat }: DoubtCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-500'
      case 'closed': return 'bg-red-500'
      case 'resolved': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'open': return 'default'
      case 'closed': return 'destructive'
      case 'resolved': return 'secondary'
      default: return 'outline'
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm hover:bg-gray-900/70 transition-all duration-300 hover:border-gray-700">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={`/api/avatar/${doubt.user_email}`} />
            <AvatarFallback className="bg-gradient-to-br from-purple-600 to-cyan-600 text-white">
              {getInitials(doubt.user_name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-white text-lg line-clamp-2">
                {doubt.title}
              </h3>
              <div className={`w-2 h-2 rounded-full ${getStatusColor(doubt.status)}`} />
            </div>

            <p className="text-gray-300 text-sm line-clamp-3 mb-3">
              {doubt.body}
            </p>

            <div className="flex items-center gap-2 mb-3">
              <Badge variant={getStatusBadgeVariant(doubt.status)} className="text-xs">
                {doubt.status}
              </Badge>
              <Badge variant="outline" className="text-xs border-purple-500 text-purple-400">
                {doubt.subject}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>{doubt.user_name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatDistanceToNow(new Date(doubt.created_at), { addSuffix: true })}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  <span>{doubt.message_count} replies</span>
                </div>
              </div>

              <Button
                size="sm"
                onClick={() => onJoinChat(doubt.id)}
                className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white border-0 text-xs"
              >
                Join Discussion
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}