"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Upload,
  FileText,
  Sparkles,
  Plus,
  BookOpen,
  Eye,
  Edit,
  Trash2,
  Check,
  X,
  Globe,
  Lock,
  Users,
  Target,
  Clock,
  Star,
  Filter,
  Search,
  MessageCircle,
  HelpCircle,
  AlertTriangle,
  UserCheck,
  TrendingUp,
  Award,
  Pin,
  BarChart3,
  FileQuestion,
  BookOpenCheck,
  Info,
  GraduationCap,
  Bell,
  LogOut
} from "lucide-react"

// Import components
import Dashboard from "./components/dashboard"
import Doubts from "./components/doubts"
import Analytics from "./components/analytics"
import Profile from "./components/profile"
import Assignments from "./components/assignments"
import Overview from "./components/overview"
import QuestionBanks from "./components/question-banks"
import CreateBank from "./components/CreateBank"

// Mock data for demonstration
const mockQuestionBanks = [
  
   {
    id: 1,
    title: "Data Structures - Trees and Graphs",
    subject: "Data Structures",
    topic: "Non-linear Data Structures",
    status: "published",
    questionCount: 40,
    createdAt: "2024-01-15",
    lastModified: "2024-01-20",
    isPublic: true,
    studentCount: 120,
    avgPerformance: 85
  },
  {
    id: 2,
    title: "Operating Systems - Process Management",
    subject: "Operating Systems (OS)",
    topic: "Process Scheduling",
    status: "draft",
    questionCount: 22,
    createdAt: "2024-01-18",
    lastModified: "2024-01-22",
    isPublic: false,
    studentCount: 0,
    avgPerformance: 0
  },
  {
    id: 3,
    title: "DBMS - SQL Joins and Normalization",
    subject: "Database Management Systems (DBMS)",
    topic: "Relational Databases",
    status: "published",
    questionCount: 35,
    createdAt: "2024-01-11",
    lastModified: "2024-01-19",
    isPublic: true,
    studentCount: 95,
    avgPerformance: 76
  }
]

const subjects = [
  "Data Structures",
  "Database Management Systems (DBMS)",
  "Operating Systems (OS)",
  "Computer Networks",
  "Object-Oriented Programming (OOP)",
  "Design and Analysis of Algorithms",
  "Software Engineering",
  "Computer Architecture",
  "Machine Learning",
  "Artificial Intelligence",
  "Web Development",
  "Cybersecurity"
]

// Mock data for student doubts
const mockStudentDoubts = [
  {
    id: 1,
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
  },
  // Here are the 3 new entries
  {
    id: 2,
    title: "Difference between process and thread in OS?",
    content: "I don't understand the real difference. They both seem to be units of execution. Why do we need both?",
    student: {
      name: "David Lee",
      avatar: "/placeholder-avatar-5.jpg",
      level: "Intermediate",
      reputation: 310,
      badge: "OS Explorer"
    },
    subject: "Operating Systems (OS)",
    tags: ["process", "thread", "concurrency"],
    status: "trending",
    priority: "medium",
    hasNote: false,
    timestamp: "2024-01-10T10:05:00Z",
    lastActivity: "25 minutes ago",
    replies: 7,
    upvotes: 19,
    isUrgent: false,
    mentions: [],
    chatParticipants: 10
  },
  {
    id: 3,
    title: "Help with Big O notation for recursive functions",
    content: "How do I calculate the time complexity for a recursive algorithm like merge sort? The master theorem is confusing.",
    student: {
      name: "Priya Sharma",
      avatar: "/placeholder-avatar-6.jpg",
      level: "Advanced",
      reputation: 750,
      badge: "Algo Pro"
    },
    subject: "Data Structures",
    tags: ["algorithms", "big-o", "recursion", "complexity"],
    status: "solved",
    priority: "medium",
    hasNote: true,
    noteTitle: "DSA: Complexity Analysis",
    timestamp: "2024-01-09T17:30:00Z",
    lastActivity: "1 hour ago",
    replies: 5,
    upvotes: 28,
    isUrgent: false,
    mentions: ["@ProfAnand"],
    chatParticipants: 7
  },
  {
    id: 4,
    title: "What is 3NF (Third Normal Form) in DBMS?",
    content: "I understand 1NF and 2NF, but I'm lost on transitive dependency and how 3NF solves it. Can someone give a simple example?",
    student: {
      name: "Mike Brown",
      avatar: "/placeholder-avatar-7.jpg",
      level: "Beginner",
      reputation: 95,
      badge: "Database Novice"
    },
    subject: "Database Management Systems (DBMS)",
    tags: ["dbms", "normalization", "3nf", "sql"],
    status: "unsolved",
    priority: "high",
    hasNote: false,
    timestamp: "2024-01-10T14:45:00Z",
    lastActivity: "3 minutes ago",
    replies: 2,
    upvotes: 7,
    isUrgent: true,
    mentions: ["@TeacherSmith"],
    chatParticipants: 5
  }
]

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [questionBanks, setQuestionBanks] = useState(mockQuestionBanks)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")

  // Teacher profile state
  const [teacherProfile, setTeacherProfile] = useState(null)
  
  // UI state for dropdowns
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  // Create new bank form state
  const [newBankForm, setNewBankForm] = useState({
    department: "", 
    year: "", 
    subject: "", 
    topic: "", 
    description: "",
    numQuestions: "" 
  })

  // Doubt exchange hub state
  const [doubtSearchTerm, setDoubtSearchTerm] = useState("")
  const [doubtFilter, setDoubtFilter] = useState("unsolved")
  const [selectedDoubtSubject, setSelectedDoubtSubject] = useState("all")
  const [studentDoubts, setStudentDoubts] = useState(mockStudentDoubts)

  // Stars state for client-side rendering
  const [stars, setStars] = useState([])

  // Fetch teacher profile data
  useEffect(() => {
    const fetchTeacherProfile = async () => {
      try {
        const response = await fetch("/api/me")
        if (response.ok) {
          const data = await response.json()
          setTeacherProfile(data.user)
        }
      } catch (error) {
        console.error("Failed to fetch teacher profile:", error)
      }
    }

    fetchTeacherProfile()
  }, [])

  // Initialize stars after component mounts (client-side only)
  useEffect(() => {
    const generateStars = () => {
      return Array.from({ length: 100 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        width: Math.random() * 3 + 1,
        height: Math.random() * 3 + 1,
        delay: Math.random() * 3,
        duration: Math.random() * 3 + 2,
      }))
    }

    setStars(generateStars())
  }, [])

  // Click outside handler for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.notifications-dropdown') && !event.target.closest('.profile-dropdown')) {
        setShowNotifications(false)
        setShowProfileMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filter question banks
  const filteredBanks = questionBanks.filter(bank => {
    const matchesSearch = bank.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bank.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = selectedSubject === "all" || bank.subject === selectedSubject
    const matchesStatus = selectedStatus === "all" || bank.status === selectedStatus
    return matchesSearch && matchesSubject && matchesStatus
  })

  // Filter doubts
  const filteredDoubts = studentDoubts.filter(doubt => {
    const matchesSearch = doubt.title.toLowerCase().includes(doubtSearchTerm.toLowerCase()) ||
                         doubt.content.toLowerCase().includes(doubtSearchTerm.toLowerCase())
    const matchesSubject = selectedDoubtSubject === "all" || doubt.subject === selectedDoubtSubject
    return matchesSearch && matchesSubject
  })

  const handleCreateBank = async () => {
    if (!newBankForm.department || !newBankForm.subject || !newBankForm.topic || !newBankForm.year) {
      alert("Please fill in all required fields: Department, Year/Grade, Subject, and Topic")
      return
    }

    try {
      // Get the current user ID (you'll need to implement this)
      const userId = 1; // Replace with actual user ID from your auth system
      
      const response = await fetch('/api/question-banks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `${newBankForm.subject} - ${newBankForm.topic}`,
          description: newBankForm.description || '',
          subject: newBankForm.subject,
          topic: newBankForm.topic,
          department: newBankForm.department,
          year: newBankForm.year,
          numQuestions: parseInt(newBankForm.numQuestions, 10) || 0,
          userId: userId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create question bank');
      }

      const { id } = await response.json();

      // Update the UI with the new question bank
      const newBank = {
        id,
        title: `${newBankForm.subject} - ${newBankForm.topic}`,
        subject: newBankForm.subject,
        topic: newBankForm.topic,
        department: newBankForm.department,
        year: newBankForm.year,
        description: newBankForm.description,
        status: "draft",
        questionCount: newBankForm.numQuestions ? parseInt(newBankForm.numQuestions, 10) : 0,
        createdAt: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0],
        isPublic: false,
        studentCount: 0,
        avgPerformance: 0
      };

      setQuestionBanks(prev => [newBank, ...prev]);
      setNewBankForm({ 
        department: "", 
        year: "", 
        subject: "", 
        topic: "", 
        description: "",
        numQuestions: "" 
      });
      setActiveTab("banks");
      
      // Show success message
      alert("Question bank created successfully!");
    } catch (error) {
      console.error("Error creating question bank:", error);
      alert(error.message || "Failed to create question bank. Please try again.");
    }
  }

  const handleTogglePublish = (bankId) => {
    setQuestionBanks(prev =>
      prev.map(bank =>
        bank.id === bankId
          ? { ...bank, status: bank.status === "published" ? "draft" : "published" }
          : bank
      )
    )
  }

  const handleDeleteBank = (bankId) => {
    setQuestionBanks(prev => prev.filter(bank => bank.id !== bankId))
  }

  const handleJoinChat = (doubtId) => {
    // Navigate to the main doubts page
    window.location.href = '/doubts';
  }

  useEffect(() => {
    // This effect ensures client-side navigation works properly
  }, [])

  // Get teacher initials for avatar fallback
  const getTeacherInitials = () => {
    if (teacherProfile?.name) {
      return teacherProfile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return "T"
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Blinking stars background */}
      <div className="stars-container absolute inset-0">
        {stars.map((star) => (
          <div
            key={star.id}
            className="star absolute bg-white rounded-full animate-pulse"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.width}px`,
              height: `${star.height}px`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* Teacher Dashboard Navbar */}
        <nav className="bg-background/90 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              {/* Left Side - Branding */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-sky-400 to-emerald-400 rounded-lg flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <div className="text-lg font-bold bg-gradient-to-r from-sky-300 to-emerald-300 text-transparent bg-clip-text">
                  EduQuestify Teacher Portal
                </div>
              </div>

              {/* Center - Core Features Navigation */}
              <div className="hidden md:flex items-center gap-1">
                <Button
                  variant={activeTab === "dashboard" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("dashboard")}
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Dashboard
                </Button>
                <Button
                  variant={activeTab === "banks" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("banks")}
                  className="flex items-center gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  Question Banks
                </Button>
                <Button
                  variant={activeTab === "doubts" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("doubts")}
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Doubt Exchange
                </Button>
                <Button
                  variant={activeTab === "analytics" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("analytics")}
                  className="flex items-center gap-2"
                >
                  <TrendingUp className="h-4 w-4" />
                  Class Analytics
                </Button>
                <Button
                  variant={activeTab === "assignments" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("assignments")}
                  className="flex items-center gap-2"
                >
                  <FileQuestion className="h-4 w-4" />
                  Assignments
                </Button>
                <Button
                  variant={activeTab === "overview" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("overview")}
                  className="flex items-center gap-2"
                >
                  <Info className="h-4 w-4" />
                  Overview
                </Button>
                <Link href="/teacher/question-bank" passHref>
                  <Button
                    variant={location.pathname === "/teacher/question-bank" ? "default" : "ghost"}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    AI Question Bank
                  </Button>
                </Link>
              </div>

              {/* Right Side - User Account & Actions */}
              <div className="flex items-center gap-2">
                {/* Notifications Bell */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative notifications-dropdown"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="h-5 w-5" />
                  {studentDoubts.filter(d => d.isUrgent || d.mentions.length > 0).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                  )}
                </Button>

                {/* Profile Avatar */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full w-8 h-8 p-0"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder-avatar-teacher.jpg" />
                      <AvatarFallback>{getTeacherInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </div>

                {/* Logout Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    console.log("Logging out...")
                    // Add logout functionality here
                  }}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center gap-1 pb-2 overflow-x-auto">
              <Button
                variant={activeTab === "dashboard" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("dashboard")}
                className="flex items-center gap-1 flex-shrink-0"
              >
                <BarChart3 className="h-3 w-3" />
                Dashboard
              </Button>
              <Button
                variant={activeTab === "banks" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("banks")}
                className="flex items-center gap-1 flex-shrink-0"
              >
                <BookOpen className="h-3 w-3" />
                Banks
              </Button>
              <Button
                variant={activeTab === "doubts" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("doubts")}
                className="flex items-center gap-1 flex-shrink-0"
              >
                <MessageCircle className="h-3 w-3" />
                Doubts
              </Button>
              <Button
                variant={activeTab === "analytics" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("analytics")}
                className="flex items-center gap-1 flex-shrink-0"
              >
                <TrendingUp className="h-3 w-3" />
                Analytics
              </Button>
              <Button
                variant={activeTab === "assignments" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("assignments")}
                className="flex items-center gap-1 flex-shrink-0"
              >
                <FileQuestion className="h-3 w-3" />
                Assignments
              </Button>
              <Button
                variant={activeTab === "overview" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("overview")}
                className="flex items-center gap-1 flex-shrink-0"
              >
                <Info className="h-3 w-3" />
                Overview
              </Button>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Dashboard Content - Default View */}
          {activeTab === "dashboard" && <Dashboard teacherProfile={teacherProfile} questionBanks={questionBanks} studentDoubts={studentDoubts} handleJoinChat={handleJoinChat} />}

          {/* Question Banks Tab */}
          {activeTab === "banks" && (
            <QuestionBanks
              questionBanks={questionBanks}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedSubject={selectedSubject}
              setSelectedSubject={setSelectedSubject}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              handleTogglePublish={handleTogglePublish}
              handleDeleteBank={handleDeleteBank}
              setActiveTab={setActiveTab}
            />
          )}

          {/* Create New Bank Tab */}
          {activeTab === "create" && (
            <CreateBank
              newBankForm={newBankForm}
              setNewBankForm={setNewBankForm}
              handleCreateBank={handleCreateBank}
              setActiveTab={setActiveTab}
            />
          )}

          {/* Doubt Exchange Tab */}
          {activeTab === "doubts" && (
            <Doubts
              doubtSearchTerm={doubtSearchTerm}
              setDoubtSearchTerm={setDoubtSearchTerm}
              doubtFilter={doubtFilter}
              setDoubtFilter={setDoubtFilter}
              selectedDoubtSubject={selectedDoubtSubject}
              setSelectedDoubtSubject={setSelectedDoubtSubject}
              filteredDoubts={filteredDoubts}
              handleJoinChat={handleJoinChat}
            />
          )}

          {/* Class Analytics Tab */}
          {activeTab === "analytics" && <Analytics questionBanks={questionBanks} />}

          {/* Assignments Tab */}
          {activeTab === "assignments" && <Assignments />}

          {/* Overview Tab */}
          {activeTab === "overview" && <Overview />}
          {activeTab === "gemini-bank" && (
            <div className="h-[calc(100vh-200px)]">
              <iframe 
                src="/teacher/question-bank" 
                className="w-full h-full border-0 rounded-lg"
                title="Gemini Question Bank"
              />
            </div>
          )}
          {activeTab === "profile" && <Profile />}
        </div>
      </div>
    </div>
  )
}

// Teacher Doubt Card Component
function DoubtCard({ doubt, onJoinChat, isTeacher = false }) {
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