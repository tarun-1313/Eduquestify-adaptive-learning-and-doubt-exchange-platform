"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getUserFromToken } from "@/lib/jwt-utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Trophy,
  Target,
  TrendingUp,
  Calendar,
  BookOpen,
  Award,
  Users,
  Clock,
  CheckCircle,
  Flame,
  Star,
  Zap,
  Brain,
  FileText,
  HelpCircle,
  ChevronRight,
  Gift,
  Crown,
  Medal,
  Info
} from "lucide-react"

// Mock data for demonstration
const mockStudentData = {
  name: "Alex Chen",
  level: 12,
  xp: 3420,
  coins: 680,
  streak: 7,
  nextLevelXP: 3800,
  todayQuest: {
    title: "Complete 1 Adaptive Quiz",
    reward: "+50 XP & +10 Coins",
    completed: false
  },
  subjectMastery: {
    Mathematics: 75,
    Physics: 85,
    Chemistry: 60,
    Biology: 45,
    History: 70,
    Literature: 55
  },
  stats: {
    totalQuestions: 1247,
    accuracy: 78,
    doubtsSolved: 23
  },
  recentActivity: [
    {
      type: "note",
      title: "Chapter 5: The Cold War",
      subject: "History",
      timestamp: "2 hours ago"
    },
    {
      type: "question-bank",
      title: "Physics - Kinematics Practice Set",
      subject: "Physics",
      timestamp: "1 day ago"
    },
    {
      type: "doubt",
      title: "Help with Quadratic Equations",
      subject: "Mathematics",
      timestamp: "2 days ago"
    }
  ],
  recommendations: [
    {
      type: "quiz",
      title: "Photosynthesis Mastery Quiz",
      reason: "You seem to be struggling with Photosynthesis. This targeted quiz will help!",
      subject: "Biology"
    }
  ],
  assignments: [
    {
      title: "Chapter 4 Quiz",
      subject: "Physics",
      dueDate: "Due in 2 days",
      priority: "high"
    },
    {
      title: "History Essay",
      subject: "History",
      dueDate: "Due in 5 days",
      priority: "medium"
    },
    {
      title: "Math Worksheet",
      subject: "Mathematics",
      dueDate: "Due in 1 week",
      priority: "low"
    }
  ],
  achievements: [
    {
      name: "7-Day Streak Badge",
      icon: "🔥",
      rarity: "common",
      earnedAt: "2024-01-08"
    },
    {
      name: "Level 10 Reached",
      icon: "⭐",
      rarity: "uncommon",
      earnedAt: "2024-01-05"
    },
    {
      name: "Quiz Master",
      icon: "🎯",
      rarity: "rare",
      earnedAt: "2024-01-03"
    }
  ],
  communityUpdates: [
    {
      type: "achievement",
      user: "Rahul",
      message: "just reached Level 15!",
      timestamp: "1 hour ago"
    },
    {
      type: "content",
      user: "Teacher Smith",
      message: "added new notes for 'Modern History'",
      timestamp: "3 hours ago"
    },
    {
      type: "solution",
      user: "Community",
      message: "answered your question about 'Calculus'",
      timestamp: "5 hours ago"
    }
  ]
}

export default function StudentPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const checkAuth = () => {
      try {
        // Get token from cookies
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('eduq_token='))
          ?.split('=')[1]

        if (!token) {
          router.push('/login')
          return
        }

        // Decode and verify token
        const userData = getUserFromToken(token)
        
        if (!userData) {
          router.push('/login')
          return
        }

        // Check if user is a student
        if (userData.role !== 'Student') {
          router.push('/teacher')
          return
        }

        setUser(userData)
      } catch (error) {
        console.error('Authentication error:', error)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }
  const [studentData, setStudentData] = useState(mockStudentData)
  const [loading, setLoading] = useState(false)

  const handleStartQuest = () => {
    // Navigate to quiz or mark as completed
    console.log("Starting daily quest...")
  }

  const subjects = Object.entries(studentData.subjectMastery)

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Blinking stars background */}
      <div className="stars-container absolute inset-0">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="star absolute bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 3 + 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* ## 1. "Welcome Back" & Daily Quest */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="bg-background/80 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="text-2xl">
                    Welcome back, {studentData.name}! 👋
                  </CardTitle>
                  <CardDescription>
                    Ready for another day of learning and growth?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                  {/* Today's Quest */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 border">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">Today's Quest</h3>
                        <p className="text-muted-foreground">Complete this to keep your streak alive!</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Flame className="h-5 w-5 text-orange-500" />
                        <span className="text-lg font-bold">{studentData.streak} day streak</span>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-3">
                        <Target className="h-6 w-6 text-primary" />
                        <div>
                          <div className="font-medium">{studentData.todayQuest.title}</div>
                          <div className="text-sm text-muted-foreground">Goal for today</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Gift className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium">{studentData.todayQuest.reward}</span>
                      </div>
                      <Button
                        size="lg"
                        className="btn-primary"
                        onClick={handleStartQuest}
                      >
                        Start Quest
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats Sidebar */}
            <div className="space-y-6">
              <Card className="bg-background/80 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{studentData.xp}</div>
                      <div className="text-xs text-muted-foreground">Total XP</div>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-500">{studentData.coins}</div>
                      <div className="text-xs text-muted-foreground">Coins</div>
                    </div>
                  </div>

                  {/* Level Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Level {studentData.level} Scholar</span>
                      <span>{studentData.xp}/{studentData.nextLevelXP} XP</span>
                    </div>
                    <Progress
                      value={(studentData.xp / studentData.nextLevelXP) * 100}
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* ## 2. My Progress Overview */}
          <Card className="bg-background/80 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                My Progress Overview
              </CardTitle>
              <CardDescription>
                Track your learning journey across all subjects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* Subject Mastery Chart */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjects.map(([subject, mastery]) => (
                  <div key={subject} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{subject}</span>
                      <span className="text-muted-foreground">{mastery}%</span>
                    </div>
                    <Progress value={mastery} className="h-2" />
                  </div>
                ))}
              </div>

              {/* Key Stats */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <div className="text-2xl font-bold">{studentData.stats.totalQuestions.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Questions Answered</div>
                </div>

                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <Target className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <div className="text-2xl font-bold">{studentData.stats.accuracy}%</div>
                  <div className="text-sm text-muted-foreground">Overall Accuracy</div>
                </div>

                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <Users className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <div className="text-2xl font-bold">{studentData.stats.doubtsSolved}</div>
                  <div className="text-sm text-muted-foreground">Doubts Solved</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ## 3. Continue Learning */}
          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="bg-background/80 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-primary" />
                  Continue Learning
                </CardTitle>
                <CardDescription>
                  Pick up where you left off
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {studentData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    {activity.type === 'note' && <FileText className="h-4 w-4 text-blue-500" />}
                    {activity.type === 'question-bank' && <BookOpen className="h-4 w-4 text-green-500" />}
                    {activity.type === 'doubt' && <HelpCircle className="h-4 w-4 text-purple-500" />}
                    <div className="flex-1">
                      <div className="font-medium">{activity.title}</div>
                      <div className="text-sm text-muted-foreground">{activity.subject} • {activity.timestamp}</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-background/80 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-6 w-6 text-primary" />
                  Recommended For You
                </CardTitle>
                <CardDescription>
                  AI-powered suggestions based on your performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {studentData.recommendations.map((rec, index) => (
                  <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border">
                    <div className="flex items-center gap-3 mb-2">
                      {rec.type === 'quiz' && <Target className="h-5 w-5 text-blue-500" />}
                      <div>
                        <div className="font-medium">{rec.title}</div>
                        <div className="text-sm text-muted-foreground">{rec.subject}</div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{rec.reason}</p>
                    <Button size="sm" className="w-full">
                      Start Recommended Activity
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* ## 4. Schedule & Upcoming Assignments */}
          <Card className="bg-background/80 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary" />
                Schedule & Assignments
              </CardTitle>
              <CardDescription>
                Stay on top of your deadlines and upcoming work
              </CardDescription>
            </CardHeader>
            <CardContent>

              {/* Mini-Calendar */}
              <div className="grid md:grid-cols-4 gap-6">
                <div className="md:col-span-1">
                  <div className="text-center mb-4">
                    <div className="text-sm font-medium">This Week</div>
                    <div className="text-xs text-muted-foreground">January 2024</div>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-xs">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                      <div key={day} className="text-center py-1 text-muted-foreground">{day}</div>
                    ))}
                    {Array.from({ length: 31 }, (_, i) => i + 1).slice(0, 7).map((day) => (
                      <div
                        key={day}
                        className={`text-center py-1 rounded ${
                          day === new Date().getDate() ? 'bg-primary text-white' : 'hover:bg-muted'
                        }`}
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Assignment List */}
                <div className="md:col-span-3 space-y-3">
                  <h4 className="font-medium">Upcoming Assignments</h4>
                  {studentData.assignments.map((assignment, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className={`w-2 h-2 rounded-full ${
                        assignment.priority === 'high' ? 'bg-red-500' :
                        assignment.priority === 'medium' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`} />
                      <div className="flex-1">
                        <div className="font-medium">{assignment.title}</div>
                        <div className="text-sm text-muted-foreground">{assignment.subject}</div>
                      </div>
                      <Badge variant={assignment.priority === 'high' ? 'destructive' : 'secondary'}>
                        {assignment.dueDate}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ## 5. Achievements & Community Feed */}
          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="bg-background/80 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-6 w-6 text-primary" />
                  My Latest Achievements
                </CardTitle>
                <CardDescription>
                  Celebrate your recent milestones and progress
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {studentData.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <span className="text-2xl">{achievement.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium">{achievement.name}</div>
                      <div className="text-sm text-muted-foreground">{achievement.earnedAt}</div>
                    </div>
                    <Badge variant="outline" className={`text-xs ${
                      achievement.rarity === 'rare' ? 'border-yellow-500 text-yellow-700' :
                      achievement.rarity === 'uncommon' ? 'border-blue-500 text-blue-700' :
                      'border-gray-500 text-gray-700'
                    }`}>
                      {achievement.rarity}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-background/80 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-primary" />
                  Community Updates
                </CardTitle>
                <CardDescription>
                  See what's happening in your learning community
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {studentData.communityUpdates.map((update, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      update.type === 'achievement' ? 'bg-yellow-500' :
                      update.type === 'content' ? 'bg-blue-500' :
                      'bg-green-500'
                    }`} />
                    <div className="flex-1">
                      <div className="text-sm">
                        <span className="font-medium">{update.user}</span> {update.message}
                      </div>
                      <div className="text-xs text-muted-foreground">{update.timestamp}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
