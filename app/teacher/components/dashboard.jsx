"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  BookOpen,
  MessageCircle,
  Users,
  Target,
  Clock,
  AlertTriangle
} from "lucide-react"

// Mock data for demonstration
const mockQuestionBanks = [
  {
    id: 1,
    title: "Physics - Newton's Laws of Motion",
    subject: "Physics",
    topic: "Newton's Laws",
    status: "published",
    questionCount: 25,
    createdAt: "2024-01-10",
    lastModified: "2024-01-15",
    isPublic: true,
    studentCount: 45,
    avgPerformance: 78
  },
  {
    id: 2,
    title: "Mathematics - Quadratic Equations",
    subject: "Mathematics",
    topic: "Algebra",
    status: "draft",
    questionCount: 18,
    createdAt: "2024-01-12",
    lastModified: "2024-01-14",
    isPublic: false,
    studentCount: 0,
    avgPerformance: 0
  },
  {
    id: 3,
    title: "Biology - Cell Structure",
    subject: "Biology",
    topic: "Cell Biology",
    status: "published",
    questionCount: 32,
    createdAt: "2024-01-08",
    lastModified: "2024-01-13",
    isPublic: true,
    studentCount: 67,
    avgPerformance: 82
  }
]

// Mock data for student doubts
const mockStudentDoubts = [
  {
    id: 1,
    title: "How does Newton's Second Law apply to circular motion?",
    content: "I'm confused about the centripetal force in circular motion. The formula shows F = mv²/r, but I don't understand how this relates to Newton's Second Law.",
    student: {
      name: "Alex Chen",
      avatar: "/placeholder-avatar-1.jpg",
      level: "Expert",
      reputation: 1250,
      badge: "Physics Master"
    },
    subject: "Physics",
    tags: ["newton", "circular-motion", "forces"],
    status: "unsolved",
    priority: "high",
    hasNote: true,
    noteTitle: "Physics Chapter 5: Circular Motion",
    timestamp: "2024-01-10T14:30:00Z",
    lastActivity: "2 minutes ago",
    replies: 8,
    upvotes: 15,
    isUrgent: true,
    mentions: ["@TeacherSmith"],
    chatParticipants: 12
  },
  {
    id: 2,
    title: "Explain the photoelectric effect with quantum mechanics",
    content: "The classical wave theory doesn't explain why electrons are emitted immediately. How does the photon model solve this?",
    student: {
      name: "Sarah Kim",
      avatar: "/placeholder-avatar-2.jpg",
      level: "Advanced",
      reputation: 890,
      badge: "Quantum Expert"
    },
    subject: "Physics",
    tags: ["photoelectric-effect", "quantum", "light"],
    status: "trending",
    priority: "medium",
    hasNote: false,
    timestamp: "2024-01-10T13:15:00Z",
    lastActivity: "5 minutes ago",
    replies: 12,
    upvotes: 23,
    isUrgent: false,
    mentions: [],
    chatParticipants: 8
  },
  {
    id: 3,
    title: "World War I Treaty of Versailles impact",
    content: "How did the Treaty of Versailles contribute to the rise of fascism in Europe?",
    student: {
      name: "Marcus Johnson",
      avatar: "/placeholder-avatar-3.jpg",
      level: "Intermediate",
      reputation: 445,
      badge: "History Buff"
    },
    subject: "History",
    tags: ["wwi", "versailles", "fascism"],
    status: "trending",
    priority: "low",
    hasNote: true,
    noteTitle: "European History: Interwar Period",
    timestamp: "2024-01-10T12:45:00Z",
    lastActivity: "12 minutes ago",
    replies: 6,
    upvotes: 18,
    isUrgent: false,
    mentions: [],
    chatParticipants: 15
  },
  {
    id: 4,
    title: "@TeacherSmith please help with calculus integration",
    content: "I'm stuck on integration by parts. The formula seems confusing and I keep getting wrong answers.",
    student: {
      name: "Emma Wilson",
      avatar: "/placeholder-avatar-4.jpg",
      level: "Beginner",
      reputation: 120,
      badge: "Math Learner"
    },
    subject: "Mathematics",
    tags: ["calculus", "integration", "by-parts"],
    status: "unsolved",
    priority: "high",
    hasNote: true,
    noteTitle: "Calculus Notes: Integration Techniques",
    timestamp: "2024-01-10T11:20:00Z",
    lastActivity: "1 minute ago",
    replies: 3,
    upvotes: 5,
    isUrgent: true,
    mentions: ["@TeacherSmith"],
    chatParticipants: 6
  }
]

export default function TeacherDashboard({ teacherProfile, questionBanks, studentDoubts, handleJoinChat }) {
  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-300 to-emerald-300 text-transparent bg-clip-text mb-4">
          Teacher Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">
          Welcome back{teacherProfile?.name ? `, ${teacherProfile.name}` : ''}! Here's an overview of your teaching activities.
        </p>
      </div>

      {/* Dashboard Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-background/80 backdrop-blur-sm border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Banks</p>
                <p className="text-2xl font-bold">{questionBanks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background/80 backdrop-blur-sm border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Doubts</p>
                <p className="text-2xl font-bold">{studentDoubts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background/80 backdrop-blur-sm border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Students</p>
                <p className="text-2xl font-bold">
                  {questionBanks.reduce((acc, bank) => acc + bank.studentCount, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background/80 backdrop-blur-sm border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Performance</p>
                <p className="text-2xl font-bold">
                  {questionBanks.length > 0
                    ? Math.round(questionBanks.reduce((acc, bank) => acc + bank.avgPerformance, 0) / questionBanks.filter(b => b.status === 'published').length)
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-background/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Recent Question Banks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {questionBanks.slice(0, 3).map((bank) => (
              <div key={bank.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium">{bank.title}</p>
                  <p className="text-sm text-muted-foreground">{bank.subject} • {bank.topic}</p>
                </div>
                <Badge variant={bank.status === 'published' ? 'default' : 'secondary'}>
                  {bank.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-background/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              Urgent Doubts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {studentDoubts.filter(d => d.isUrgent || d.mentions.length > 0).slice(0, 3).map((doubt) => (
              <div key={doubt.id} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={doubt.student.avatar} />
                  <AvatarFallback>{doubt.student.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-sm">{doubt.title}</p>
                  <p className="text-xs text-muted-foreground">{doubt.student.name}</p>
                </div>
                <Button size="sm" onClick={() => handleJoinChat(doubt.id)}>
                  Join
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
