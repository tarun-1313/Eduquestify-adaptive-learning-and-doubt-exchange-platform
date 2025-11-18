"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, LogOut, Sparkles, BarChart3 } from "lucide-react"
import { usePathname } from 'next/navigation'

export default function QuestionBankLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("gemini-bank")

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check')
        const data = await response.json()
        
        if (!data.isAuthenticated || !data.user) {
          router.push('/login')
          return
        }
        
        setUser(data.user)
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
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const getTeacherInitials = () => {
    if (!user?.name) return 'T'
    return user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="bg-black border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-white">EduQuestify</h1>
            <nav className="hidden md:flex items-center space-x-1">
              <Button
                variant={pathname.startsWith('/teacher') ? "default" : "ghost"}
                size="sm"
                onClick={() => router.push('/teacher')}
                className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-gray-800"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="text-sm font-medium">Dashboard</span>
              </Button>
              <Button
                variant={activeTab === "gemini-bank" ? "default" : "ghost"}
                size="sm"
                className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-gray-800"
              >
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">AI Question Bank</span>
              </Button>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative text-white hover:bg-gray-800">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
            
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8 border border-gray-600">
                <AvatarImage src="/placeholder-avatar-teacher.jpg" />
                <AvatarFallback className="bg-gray-700 text-white">
                  {getTeacherInitials()}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:inline text-sm font-medium text-white">
                {user?.name || 'Teacher'}
              </span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Add logout functionality here
                router.push('/login')
              }}
              className="hidden md:flex items-center gap-2 text-white border-gray-600 hover:bg-gray-800 hover:border-gray-500"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
}
