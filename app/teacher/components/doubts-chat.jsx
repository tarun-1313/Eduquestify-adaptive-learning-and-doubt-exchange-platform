"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageCircle, Search, HelpCircle, AlertTriangle, Eye } from "lucide-react"
import DoubtCard from "./doubt-card"
import DoubtsChat from "./doubts-chat-modal"

const subjects = [
  "Mathematics", "OS", "DS", "DBMS", "DM", "Python",
  "C++", "Computer Science", "SE", "java"
]

export default function Doubts() {
  const [doubts, setDoubts] = useState([])
  const [doubtSearchTerm, setDoubtSearchTerm] = useState('')
  const [selectedDoubtSubject, setSelectedDoubtSubject] = useState('all')
  const [doubtFilter, setDoubtFilter] = useState('all')
  const [selectedDoubt, setSelectedDoubt] = useState(null)

  useEffect(() => {
    const fetchDoubts = async () => {
      try {
        const response = await fetch('/api/doubts')
        if (!response.ok) throw new Error('Failed to fetch doubts')
        const data = await response.json()
        // Ensure every doubt has mentions array to prevent crashes
        // Also normalize student data from user_name field
        const normalized = (data.doubts || []).map(d => ({
          ...d,
          mentions: Array.isArray(d.mentions) ? d.mentions : [],
          student: {
            name: d.user_name || d.student?.name || 'Unknown Student',
            email: d.user_email || d.student?.email,
            avatar: d.student?.avatar,
            badge: d.student?.badge || 'Student',
            reputation: d.student?.reputation || 0
          },
          // Ensure replies count is available
          replies: d.replies || d.message_count || 0
        }))
        setDoubts(normalized)
      } catch (error) {
        console.error('Error fetching doubts:', error)
      }
    }
    fetchDoubts()
  }, [])

  // Filter doubts based on search and subject
  const filteredDoubtsList = doubts.filter(doubt => {
    const matchesSearch =
      doubt.title?.toLowerCase().includes(doubtSearchTerm.toLowerCase()) ||
      doubt.content?.toLowerCase().includes(doubtSearchTerm.toLowerCase())
    const matchesSubject =
      selectedDoubtSubject === 'all' || doubt.subject === selectedDoubtSubject
    return matchesSearch && matchesSubject
  })

  const handleDoubtClick = (doubt) => {
    setSelectedDoubt(doubt)
  }

  const handleCloseChat = () => {
    setSelectedDoubt(null)
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-300 to-emerald-300 text-transparent bg-clip-text mb-4">
          Doubt Exchange Hub
        </h1>
        <p className="text-muted-foreground text-lg">
          Monitor and join student discussions in real-time
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Main Doubt Feed */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="bg-background/80 backdrop-blur-sm border-border/50">
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-6 w-6 text-primary" />
                  Student Doubt Feed
                </CardTitle>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search doubts..."
                      value={doubtSearchTerm}
                      onChange={(e) => setDoubtSearchTerm(e.target.value)}
                      className="pl-10 w-full"
                    />
                  </div>
                  <Select value={selectedDoubtSubject} onValueChange={setSelectedDoubtSubject}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="All Subjects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      {subjects.map(subject => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={doubtFilter} onValueChange={setDoubtFilter} className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="unsolved" className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    Unsolved
                  </TabsTrigger>
                  <TabsTrigger value="urgent" className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Urgent
                  </TabsTrigger>
                  <TabsTrigger value="all" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    All Doubts
                  </TabsTrigger>
                </TabsList>

                {/* Unsolved Doubts */}
                <TabsContent value="unsolved" className="space-y-4">
                  {filteredDoubtsList
                    .filter(d => d.status === 'unsolved')
                    .map((doubt) => (
                      <DoubtCard
                        key={doubt.id}
                        doubt={doubt}
                        onJoinChat={handleDoubtClick}
                        isTeacher={true}
                      />
                    ))}
                </TabsContent>

                {/* Urgent Doubts */}
                <TabsContent value="urgent" className="space-y-4">
                  {filteredDoubtsList
                    .filter(d => d.isUrgent || d.mentions?.length > 0)
                    .map((doubt) => (
                      <DoubtCard
                        key={doubt.id}
                        doubt={doubt}
                        onJoinChat={handleDoubtClick}
                        isTeacher={true}
                      />
                    ))}
                </TabsContent>

                {/* All Doubts */}
                <TabsContent value="all" className="space-y-4">
                  {filteredDoubtsList.map((doubt) => (
                    <DoubtCard
                      key={doubt.id}
                      doubt={doubt}
                      onJoinChat={handleDoubtClick}
                      isTeacher={true}
                    />
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Teacher Stats & Notifications */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-background/80 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                Teacher Hub Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {filteredDoubtsList.length}
                </div>
                <div className="text-sm text-muted-foreground">Total Active Doubts</div>
              </div>

              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {filteredDoubtsList.filter(d => d.isUrgent || d.mentions?.length > 0).length}
                </div>
                <div className="text-sm text-red-600 dark:text-red-300">
                  Urgent/Needs Help
                </div>
              </div>

              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {filteredDoubtsList.filter(d => d.status === 'unsolved').length}
                </div>
                <div className="text-sm text-yellow-600 dark:text-yellow-300">
                  Unsolved
                </div>
              </div>

              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {filteredDoubtsList.filter(d => d.status === 'trending').length}
                </div>
                <div className="text-sm text-green-600 dark:text-green-300">
                  Trending
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="bg-background/80 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                Recent Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="font-medium text-blue-800 dark:text-blue-200">@Tarun CHoudharymentioned you</div>
                <div className="text-sm text-blue-600 dark:text-blue-300">2 minutes ago</div>
              </div>
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="font-medium text-yellow-800 dark:text-yellow-200">Vivek Patil flagged doubt as urgent</div>
                <div className="text-sm text-yellow-600 dark:text-yellow-300">5 minutes ago</div>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="font-medium text-green-800 dark:text-green-200">Gaurav Kumar's doubt is trending</div>
                <div className="text-sm text-green-600 dark:text-green-300">12 minutes ago</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Chat Modal */}
      {selectedDoubt && (
        <DoubtsChat 
          doubt={selectedDoubt} 
          onClose={handleCloseChat}
        />
      )}
    </div>
  )
}
