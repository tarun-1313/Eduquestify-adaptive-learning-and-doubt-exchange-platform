"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import "../globals.css"

export default function TeacherLayout({ children }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
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

  return (
    <div className="antialiased bg-level-aura min-h-screen flex flex-col">
      <main className="flex-1">
        <Suspense fallback={
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
          </div>
        }>
          {children}
        </Suspense>
      </main>
    </div>
  )
}