'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Send, Paperclip, Download, Star, StarOff, Wifi, WifiOff } from 'lucide-react'
import { useRealTimeChat } from '@/lib/chat-socket'

interface Message {
  id: number
  content: string
  created_at: string
  sender_name: string
  sender_email: string
  user_id: number
}

interface SharedNote {
  id: number
  title: string
  file_url: string
  size: number
  rating: number
  download_count: number
  created_at: string
  uploader_name: string
  avg_rating: number
  rating_count: number
}

interface ChatPanelProps {
  doubtId: number
  doubtTitle: string
  doubtSubject: string
  currentUser: { id: number; name: string; email: string }
  onClose: () => void
}

export function ChatPanel({ doubtId, doubtTitle, doubtSubject, currentUser, onClose }: ChatPanelProps) {
  const [newMessage, setNewMessage] = useState('')
  const [sharedNotes, setSharedNotes] = useState<SharedNote[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  // Local messages state to ensure UI updates even if socket is delayed
  const [localMessages, setLocalMessages] = useState<Message[]>([])

  // Use real-time chat
  const { messages, isConnected, typingUsers: socketTypingUsers, sendMessage: socketSendMessage, sendTyping } = useRealTimeChat(doubtId)

  // Fetch initial messages
  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/doubts/${doubtId}/messages`)
      if (response.ok) {
        const data = await response.json()
        // Populate local state from API to ensure messages render
        setLocalMessages((data.messages || []) as Message[])
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch shared notes
  const fetchSharedNotes = async () => {
    try {
      const response = await fetch(`/api/doubts/${doubtId}/shared-notes`)
      if (response.ok) {
        const data = await response.json()
        setSharedNotes(data.notes || [])
      }
    } catch (error) {
      console.error('Error fetching shared notes:', error)
    }
  }

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || isLoading) return

    setIsLoading(true)
    try {
      // First send via API to persist
      const response = await fetch(`/api/doubts/${doubtId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage })
      })

      if (response.ok) {
        // Optimistically append the persisted message to the UI
        const data = await response.json()
        if (data?.message) {
          setLocalMessages(prev => [...prev, data.message as Message])
        }
        // Then send via socket for real-time delivery
        socketSendMessage(newMessage)
        setNewMessage('')
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle typing indicator
  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true)
      sendTyping()
      
      // Clear typing indicator after 3 seconds
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false)
      }, 3000)
    }
  }

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', file.name)
    formData.append('doubtId', doubtId.toString())

    try {
      const response = await fetch(`/api/doubts/${doubtId}/shared-notes`, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        await fetchSharedNotes()
      }
    } catch (error) {
      console.error('Error uploading file:', error)
    } finally {
      setIsUploading(false)
      event.target.value = ''
    }
  }

  // Rate a note
  const rateNote = async (noteId: number, rating: number) => {
    try {
      const response = await fetch(`/api/doubts/${doubtId}/shared-notes/${noteId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating })
      })

      if (response.ok) {
        await fetchSharedNotes()
      }
    } catch (error) {
      console.error('Error rating note:', error)
    }
  }

  // Download note
  const downloadNote = (note: SharedNote) => {
    try {
      // Check if it's a file URL (new system) or base64 data (old system)
      if (note.file_url.startsWith('/uploads/')) {
        // New system: file is stored on server, download via URL
        const url = note.file_url
        const a = document.createElement('a')
        a.href = url
        a.download = note.title
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      } else {
        // Old system: base64 data stored in database
        try {
          const byteCharacters = atob(note.file_url)
          const byteNumbers = new Array(byteCharacters.length)
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i)
          }
          const byteArray = new Uint8Array(byteNumbers)
          const blob = new Blob([byteArray])
          
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = note.title
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        } catch (base64Error) {
          console.error('Error decoding base64:', base64Error)
        }
      }
    } catch (error) {
      console.error('Error downloading note:', error)
    }
  }

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [localMessages])

  // Initial fetch
  useEffect(() => {
    fetchMessages()
    fetchSharedNotes()
  }, [])

  // Update typing users from socket
  useEffect(() => {
    setTypingUsers(socketTypingUsers)
  }, [socketTypingUsers])

  // Sync socket-provided messages into local state
  useEffect(() => {
    // Replace local messages when socket messages update to avoid duplication
    setLocalMessages(messages as unknown as Message[])
  }, [messages])

  // Initialize
  useEffect(() => {
    fetchMessages()
    fetchSharedNotes()
    
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [doubtId])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-4xl h-[80vh] flex gap-4 p-4">
        {/* Main Chat Area */}
        <Card className="flex-1 bg-gray-900/90 border-gray-800 backdrop-blur-sm">
          <CardHeader className="border-b border-gray-800 bg-gradient-to-r from-purple-900/20 to-cyan-900/20">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white text-lg">{doubtTitle}</CardTitle>
                <p className="text-gray-400 text-sm">{doubtSubject}</p>
                <div className="flex items-center gap-2 mt-1">
                  {isConnected ? (
                    <div className="flex items-center gap-1">
                      <Wifi className="w-3 h-3 text-green-400" />
                      <span className="text-xs text-green-400">Connected</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <WifiOff className="w-3 h-3 text-red-400" />
                      <span className="text-xs text-red-400">Connecting...</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotes(!showNotes)}
                  className="text-gray-300 hover:text-white hover:bg-gray-800"
                >
                  <Paperclip className="w-4 h-4 mr-2" />
                  Notes ({sharedNotes.length})
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  ✕
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col h-full p-0">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {localMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.user_id === currentUser.id ? 'flex-row-reverse' : ''}`}
                  >
                    <Avatar className="w-8 h-8 bg-gradient-to-br from-purple-600 to-cyan-600">
                      <AvatarFallback className="text-white text-xs">
                        {((message as any).sender_name || (message as any).user_name || '?')
                          .charAt(0)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className={`flex-1 max-w-[70%] ${message.user_id === currentUser.id ? 'text-right' : ''}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-300">
                          {(message as any).sender_name || (message as any).user_name || 'You'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(message.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className={`inline-block p-3 rounded-lg ${message.user_id === currentUser.id
                        ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white'
                        : 'bg-gray-800 text-gray-200'
                      }`}>
                        {message.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t border-gray-800 p-4">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value)
                    handleTyping()
                  }}
                  placeholder="Type your message..."
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || isLoading}
                  className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white border-0 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shared Notes Panel */}
        {showNotes && (
          <Card className="w-80 bg-gray-900/90 border-gray-800 backdrop-blur-sm">
            <CardHeader className="border-b border-gray-800">
              <CardTitle className="text-white text-sm">Shared Notes</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.jpg,.jpeg,.png,.gif,.txt,.docx"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer text-gray-400 hover:text-white transition-colors"
                  >
                    <Paperclip className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-sm">
                      {isUploading ? 'Uploading...' : 'Click to upload note'}
                    </p>
                  </label>
                </div>

                {sharedNotes.map((note) => (
                  <div key={note.id} className="bg-gray-800 rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-white text-sm font-medium truncate">
                        {note.title}
                      </h4>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => downloadNote(note)}
                        className="text-gray-400 hover:text-white p-1"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <p className="text-gray-400 text-xs mb-2">
                      by {note.uploader_name}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => rateNote(note.id, star)}
                            className="p-0 hover:scale-110 transition-transform"
                          >
                            {star <= (note.avg_rating || 0) ? (
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            ) : (
                              <StarOff className="w-4 h-4 text-gray-600" />
                            )}
                          </button>
                        ))}
                        <span className="text-xs text-gray-400 ml-1">
                          {note.rating_count}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {(note.size / 1024).toFixed(1)}KB
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}