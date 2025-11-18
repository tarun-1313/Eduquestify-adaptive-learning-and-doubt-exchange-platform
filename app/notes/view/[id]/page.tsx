"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from '@/hooks/auth-context'
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  FileText, 
  Download, 
  ArrowLeft, 
  Eye,
  MessageCircle,
  ThumbsUp,
  Clock,
  User,
  Calendar,
  Tag,
  ExternalLink,
  BookOpen
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

type Note = {
  id: number
  user_id: number
  title: string
  description: string
  subject: string
  file_path: string
  original_filename: string
  file_mime_type: string
  file_size_bytes: number
  views_count: number
  likes_count: number
  comments_count: number
  created_at: string
  updated_at: string
  user?: {
    name: string
    email: string
    image: string
  }
  is_private?: boolean
}

export default function NoteViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [note, setNote] = useState<Note | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)

  // Unwrap params using React.use() for Next.js 15+
  const unwrappedParams = React.use(params)
  const noteId = unwrappedParams.id

  // Fetch note data
  useEffect(() => {
    const fetchNote = async () => {
      try {
        setIsLoading(true)
        
        const response = await fetch(`/api/notes/${noteId}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Note not found")
          }
          throw new Error("Failed to load note")
        }
        
        const data = await response.json()
        
        if (data.ok && data.note) {
          setNote(data.note)
          
          // Increment view count
          try {
            await fetch(`/api/notes/${noteId}/view`, { 
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
            })
          } catch (viewError) {
            console.error('Failed to increment view count:', viewError)
          }
        } else {
          throw new Error("Invalid note data")
        }
      } catch (error) {
        console.error('Error fetching note:', error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load note",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (noteId) {
      fetchNote()
    }
  }, [noteId, toast])

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Handle file download
  const handleDownload = async () => {
    if (!note) return

    try {
      setIsDownloading(true)
      
      // Create a download link
      const link = document.createElement('a')
      link.href = note.file_path
      link.download = note.original_filename || note.title
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast({
        title: "Download started",
        description: "Your file is being downloaded",
      })
    } catch (error) {
      console.error('Error downloading file:', error)
      toast({
        title: "Download failed",
        description: "Failed to download the file",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  // Handle like
  const handleLike = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Please login",
        description: "You need to login to like notes",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/notes/${noteId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        // Update local state
        setNote(prev => prev ? {
          ...prev,
          likes_count: (prev.likes_count || 0) + 1
        } : null)
        
        toast({
          title: "Note liked",
          description: "You liked this note",
        })
      }
    } catch (error) {
      console.error('Error liking note:', error)
      toast({
        title: "Like failed",
        description: "Failed to like the note",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!note) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Note not found</h3>
            <p className="text-gray-600 mb-4">The note you're looking for doesn't exist or you don't have access to it.</p>
            <Button onClick={() => router.push('/notes')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Notes
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/notes')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Notes
        </Button>
      </div>

      {/* Note Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-primary" />
                <Badge variant="secondary">{note.subject || 'Uncategorized'}</Badge>
                {note.is_private && (
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    Private
                  </Badge>
                )}
              </div>
              <CardTitle className="text-2xl mb-2">{note.title}</CardTitle>
              <CardDescription>{note.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Author Info */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {note.user && (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={note.user.image || ''} />
                  <AvatarFallback>
                    {note.user.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span>{note.user.name}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>{note.views_count || 0} views</span>
            </div>
          </div>

          {/* File Info */}
          {note.file_path && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="font-medium text-sm">{note.original_filename || note.title}</p>
                    <p className="text-xs text-gray-600">
                      {note.file_mime_type} • {formatFileSize(note.file_size_bytes || 0)}
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={handleDownload}
                  disabled={isDownloading}
                  variant="outline"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          )}

          {/* Description */}
          {note.description && (
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Description
              </h3>
              <p className="text-gray-700 leading-relaxed">{note.description}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-4 pt-4 border-t">
            <Button 
              onClick={handleLike}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ThumbsUp className="h-4 w-4" />
              <span>{note.likes_count || 0}</span>
            </Button>
            
            <Button 
              onClick={() => router.push(`/notes/study/${noteId}`)}
              variant="default"
              size="sm"
              className="flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Study Mode
            </Button>
            
            <Button 
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => {
                // Copy note link to clipboard
                navigator.clipboard.writeText(window.location.href)
                toast({
                  title: "Link copied",
                  description: "Note link copied to clipboard",
                })
              }}
            >
              <ExternalLink className="h-4 w-4" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <CardTitle>Comments</CardTitle>
            <Badge variant="secondary">{note.comments_count || 0}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>Comments feature coming soon!</p>
            <p className="text-sm mt-2">You'll be able to discuss and share insights about this note.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}