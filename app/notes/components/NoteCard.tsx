import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Clock, ThumbsUp, MessageCircle, Download, BookOpen } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"

interface NoteCardProps {
  note: {
    id: number
    title: string
    description?: string
    subject?: string
    created_at: string
    file_size_bytes: number
    views_count: number
    likes_count: number
    comments_count: number
  }
  onView: (id: number) => void
  onLike: (id: number) => void
}

export function NoteCard({ note, onView, onLike }: NoteCardProps) {
  const router = useRouter()
  
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-lg line-clamp-2">{note.title}</h3>
          {note.subject && (
            <Badge variant="outline" className="ml-2 whitespace-nowrap">
              {note.subject}
            </Badge>
          )}
        </div>
        
        {note.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {note.description}
          </p>
        )}
        
        <div className="mt-auto pt-3 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
            </div>
            <div className="flex items-center space-x-2">
              <span className="flex items-center">
                <Eye className="h-3 w-3 mr-1" />
                {note.views_count}
              </span>
              <span>{formatFileSize(note.file_size_bytes)}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2"
                onClick={() => onLike(note.id)}
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                {note.likes_count}
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <MessageCircle className="h-4 w-4 mr-1" />
                {note.comments_count}
              </Button>
            </div>
            
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onView(note.id)}
            >
              View
            </Button>
            <Button 
              size="sm" 
              variant="default"
              onClick={() => router.push(`/notes/study/${note.id}`)}
              className="flex items-center gap-1"
            >
              <BookOpen className="h-3 w-3" />
              Study
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
