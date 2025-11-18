'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Filter, MessageCircle, Users, BookOpen, Plus, Send, Paperclip, Download, Star, StarOff } from 'lucide-react'
import DoubtCard from '@/components/DoubtCard'
import { ChatPanel } from '@/components/ChatPanel'
import { initializeSocket, joinRoom, leaveRoom, sendMessage, sendTypingIndicator, shareNote } from '@/lib/socket-client'
const SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'English',
  'History',
  'Geography',
  'Economics',
  'Other'
]

interface Doubt {
  id: number
  title: string
  body: string
  subject: string
  user_id: number
  user_name: string
  status: 'open' | 'closed'
  created_at: string
  message_count: number
  last_activity: string | null
}

interface User {
  id: number
  name: string
  email: string
}

export default function DoubtsPage() {
  const [doubts, setDoubts] = useState<Doubt[]>([])
  const [filteredDoubts, setFilteredDoubts] = useState<Doubt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedDoubt, setSelectedDoubt] = useState<Doubt | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: ''
  })
  const [notifications, setNotifications] = useState<any[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [typingUser, setTypingUser] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)
  const [newMessage, setNewMessage] = useState('')
  const chatMessagesRef = useRef<HTMLDivElement>(null)

  // Fetch doubts
  const fetchDoubts = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/doubts')
      if (response.ok) {
        const data = await response.json()
        setDoubts(data.doubts || [])
        setFilteredDoubts(data.doubts || [])
      } else {
        console.error('Failed to fetch doubts')
        setDoubts([])
        setFilteredDoubts([])
      }
    } catch (error) {
      console.error('Error fetching doubts:', error)
      setDoubts([])
      setFilteredDoubts([])
    } finally {
      setIsLoading(false)
    }
  }

  // Get current user (for all users)
  const getCurrentUser = async () => {

    try {
      const response = await fetch('/api/auth/session')
      if (response.ok) {
        const data = await response.json()
        setCurrentUser(data.user || null)
      } else {
        setCurrentUser(null)
      }
    } catch (error) {
      console.error('Error fetching current user:', error)
      setCurrentUser(null)
    }
  }

  // Create doubt (allow for all users)
  const createDoubt = async () => {

    if (!formData.title.trim() || !formData.description.trim() || !formData.subject) {
      alert('Please fill in all fields')
      return
    }

    try {
      const response = await fetch('/api/doubts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        setDoubts(prev => [data.doubt, ...prev])
        setFilteredDoubts(prev => [data.doubt, ...prev])
        setShowCreateForm(false)
        setFormData({ title: '', description: '', subject: '' })
      } else {
        alert('Error creating doubt')
      }
    } catch (error) {
      console.error('Error creating doubt:', error)
      alert('Error creating doubt')
    }
  }

  // Filter doubts
  const filterDoubts = () => {
    let filtered = doubts

    if (searchTerm) {
      filtered = filtered.filter(doubt =>
        doubt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doubt.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doubt.subject.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedSubject !== 'all') {
      filtered = filtered.filter(doubt => doubt.subject === selectedSubject)
    }

    setFilteredDoubts(filtered)
  }

  // Handle join chat
  const handleJoinChat = (doubtId: number) => {
    // Allow viewing doubts without authentication
    const doubt = doubts.find(d => d.id === doubtId)
    if (doubt) {
      setSelectedDoubt(doubt)
      // Connect to real-time chat room
      if (currentUser) {
        joinRoom(doubtId, currentUser.id.toString(), currentUser.name);
        // Initialize shared notes for this doubt
        fetchSharedNotes(doubtId);
      }
    }
  }
  
  // Fetch shared notes for a doubt
  const fetchSharedNotes = async (doubtId: number) => {
    try {
      const response = await fetch(`/api/doubts/${doubtId}/notes`);
      if (response.ok) {
        const data = await response.json();
        // setSharedNotes is not defined; use fetchSharedNotes or manage state properly
        // For now, we leave it out; if you need shared-notes state, declare it via useState
      }
    } catch (error) {
      console.error('Error fetching shared notes:', error);
      // No-op: shared-notes state not used here; ignore or log error silently
    }
  }
  
  // Handle sharing a note
  const handleShareNote = async (file: File) => {
    if (!file || !selectedDoubt || !currentUser) return;
    
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('doubtId', selectedDoubt.id.toString());
      formData.append('userId', currentUser.id.toString());
      formData.append('userName', currentUser.name);
      
      const response = await fetch('/api/notes', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error('Failed to upload note');
      
      const note = await response.json();
      
      // Add note to local state
      // Note successfully uploaded; if you need to track shared notes locally, declare sharedNotes state and use setSharedNotes
      //
      
      // Emit note shared event via socket
      shareNote(note);
    } catch (error) {
      console.error('Error sharing note:', error);
    } finally {
      setIsLoading(false);
    }
  }

  // Initialize
  useEffect(() => {
    // Initialize Socket.IO client (for typing indicators and legacy handlers)
    try { initializeSocket() } catch {}
    fetchDoubts()
    // Make getCurrentUser optional - don't block page access
    getCurrentUser()
  }, [])

  // Apply filters
  useEffect(() => {
    filterDoubts()
  }, [searchTerm, selectedSubject, doubts])

  // Allow public access - remove authentication check
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-cyan-900/20">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>
      
      {/* Notification Bell */}
      <div className="fixed top-4 right-4 z-50">
        <div className="relative">
          <button 
            className="p-2 bg-gray-800 rounded-full text-white hover:bg-gray-700 transition-colors"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-50">
              <div className="py-2 px-3 bg-gray-100 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notification, index) => (
                    <div key={index} className="px-4 py-3 border-b border-gray-200 hover:bg-gray-50">
                      <p className="text-sm text-gray-800">{notification.content}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(notification.timestamp).toLocaleString()}</p>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500">No notifications</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Doubts & Discussions
            </h1>
            <p className="text-gray-300">Ask questions, get answers, and join discussions with peers and teachers</p>
          </div>
          
          <div className="flex items-center gap-4">
            {currentUser && (
              <div className="text-white">
                Welcome, {currentUser.name}
              </div>
            )}
            <Button
              onClick={() => {
                
                setShowCreateForm(true)
              }}
              className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white border-0 transform hover:scale-105 transition-all duration-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ask Doubt
            </Button>
          </div>
        </div>
        
        {/* Real-time Chat Section */}
        {selectedDoubt && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
              <div className="p-4 border-b flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">{selectedDoubt.title}</h2>
                  <p className="text-sm text-gray-500">{selectedDoubt.subject} • Asked by {selectedDoubt.user_name}</p>
                </div>
                <Button variant="ghost" onClick={() => setSelectedDoubt(null)}>×</Button>
              </div>
              
              <div className="flex-1 flex overflow-hidden">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 scroll-smooth" ref={chatMessagesRef}>
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg p-3 bg-gray-100 dark:bg-gray-700">
                      <p className="text-xs font-semibold mb-1">{selectedDoubt.user_name}</p>
                      <p className="text-sm">{selectedDoubt.body}</p>
                      <p className="text-xs opacity-70 mt-1 text-right">
                        {new Date(selectedDoubt.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {isTyping && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                      {typingUser} is typing...
                    </div>
                  )}
                </div>
                {/* Message Input */}
                <div className="p-3 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newMessage.trim() && currentUser) {
                          fetch(`/api/doubts/${selectedDoubt.id}/messages`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ content: newMessage })
                          });
                          sendMessage({
                            doubtId: selectedDoubt.id,
                            content: newMessage,
                            senderId: currentUser.id,
                            senderName: currentUser.name
                          });
                          setNewMessage('');
                          // Auto-scroll to bottom after sending
                          setTimeout(() => {
                            if (chatMessagesRef.current) {
                              chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
                            }
                          }, 100);
                        }
                      }}
                      placeholder="Type a message..."
                      className="flex-1"
                    />
                    <Button onClick={() => {
                      if (newMessage.trim() && currentUser) {
                        fetch(`/api/doubts/${selectedDoubt.id}/messages`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ content: newMessage })
                        });
                        sendMessage({
                          doubtId: selectedDoubt.id,
                          content: newMessage,
                          senderId: currentUser.id,
                          senderName: currentUser.name
                        });
                        setNewMessage('');
                        setTimeout(() => {
                          if (chatMessagesRef.current) {
                            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
                          }
                        }, 100);
                      }
                    }} disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {/* Shared Notes Panel */}
                <div className="w-64 border-l p-4 overflow-y-auto hidden md:block">
                  <h3 className="font-bold mb-3">Shared Notes</h3>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <p className="font-medium text-sm">Chapter 5 Notes</p>
                      <div className="flex items-center text-yellow-500 my-1">
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                        <StarOff className="h-3 w-3" />
                        <span className="text-xs text-gray-500 ml-1">(4.0)</span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500">PDF • 2.4MB</span>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Button className="w-full text-sm" variant="outline">
                      <Paperclip className="h-3 w-3 mr-1" /> Share Notes
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search doubts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="text-gray-400 w-4 h-4" />
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white w-48">
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="all" className="text-white hover:bg-gray-700">All Subjects</SelectItem>
                    {SUBJECTS.map(subject => (
                      <SelectItem key={subject} value={subject} className="text-white hover:bg-gray-700">
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Doubts</p>
                  <p className="text-2xl font-bold text-white">{doubts.length}</p>
                </div>
                <MessageCircle className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Discussions</p>
                  <p className="text-2xl font-bold text-white">
                    {doubts.filter(d => d.status === 'open').length}
                  </p>
                </div>
                <Users className="w-8 h-8 text-cyan-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Available Subjects</p>
                  <p className="text-2xl font-bold text-white">{SUBJECTS.length}</p>
                </div>
                <BookOpen className="w-8 h-8 text-pink-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Doubts Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="bg-gray-900/50 border-gray-800 animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-700 rounded mb-2" />
                  <div className="h-3 bg-gray-700 rounded mb-4" />
                  <div className="h-20 bg-gray-700 rounded mb-4" />
                  <div className="h-8 bg-gray-700 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredDoubts.length === 0 ? (
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {searchTerm || selectedSubject !== 'all' ? 'No matching doubts' : 'No doubts yet'}
              </h3>
              <p className="text-gray-400 mb-4">
                {searchTerm || selectedSubject !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Be the first to ask a question and start a discussion!'
                }
              </p>
              <Button
                onClick={() => {
                  
                  setShowCreateForm(true)
                }}
                className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white border-0"
              >
                Ask Your First Doubt
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoubts.map(doubt => (
              <DoubtCard
                key={doubt.id}
                doubt={{...doubt, user_email: ''}}
                onJoinChat={handleJoinChat}
              />
            ))}
          </div>
        )}
        
        {/* Chat Panel */}
        {selectedDoubt && (
          <div className="fixed bottom-0 right-0 w-96 h-[500px] bg-white dark:bg-gray-800 shadow-lg rounded-t-lg flex flex-col z-50">
            {/* Chat Header */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-t-lg">
              <div>
                <h3 className="font-semibold">{selectedDoubt.title}</h3>
                <p className="text-xs opacity-90">{selectedDoubt.subject} • Asked by {selectedDoubt.user_name}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedDoubt(null)} className="text-white hover:bg-white/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </Button>
            </div>
            
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 scroll-smooth" ref={chatMessagesRef}>
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg p-3 bg-gray-100 dark:bg-gray-700">
                  <p className="text-xs font-semibold mb-1">{selectedDoubt.user_name}</p>
                  <p className="text-sm">{selectedDoubt.body}</p>
                  <p className="text-xs opacity-70 mt-1 text-right">
                    {new Date(selectedDoubt.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              {isTyping && (
                <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                  {typingUser} is typing...
                </div>
              )}
            </div>
            {/* Message Input */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newMessage.trim() && currentUser) {
                      fetch(`/api/doubts/${selectedDoubt.id}/messages`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ content: newMessage })
                      });
                      sendMessage({
                        doubtId: selectedDoubt.id,
                        content: newMessage,
                        senderId: currentUser.id,
                        senderName: currentUser.name
                      });
                      setNewMessage('');
                      // Auto-scroll to bottom after sending
                      setTimeout(() => {
                        if (chatMessagesRef.current) {
                          chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
                        }
                      }, 100);
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button onClick={() => {
                  if (newMessage.trim() && currentUser) {
                    fetch(`/api/doubts/${selectedDoubt.id}/messages`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ content: newMessage })
                    });
                    sendMessage({
                      doubtId: selectedDoubt.id,
                      content: newMessage,
                      senderId: currentUser.id,
                      senderName: currentUser.name
                    });
                    setNewMessage('');
                    setTimeout(() => {
                      if (chatMessagesRef.current) {
                        chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
                      }
                    }, 100);
                  }
                }} disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Doubt Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md bg-gray-900/95 border-gray-800 backdrop-blur-sm">
            <CardHeader className="border-b border-gray-800 bg-gradient-to-r from-purple-900/20 to-cyan-900/20">
              <CardTitle className="text-white">Ask a Doubt</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Enter subject"
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Brief title of your doubt"
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your doubt in detail..."
                    rows={4}
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => setShowCreateForm(false)}
                  variant="outline"
                  className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={createDoubt}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white border-0"
                >
                  Post Doubt
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Chat Panel */}
      {selectedDoubt && currentUser && (
        <ChatPanel
          doubtId={selectedDoubt.id}
          doubtTitle={selectedDoubt.title}
          doubtSubject={selectedDoubt.subject}
          currentUser={currentUser}
          onClose={() => setSelectedDoubt(null)}
        />
      )}
    </div>
  )
}  