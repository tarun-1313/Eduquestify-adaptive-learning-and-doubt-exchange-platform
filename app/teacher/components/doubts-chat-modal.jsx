"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { ChatPanel } from "@/components/ChatPanel"

export default function DoubtsChat({ doubt, onClose }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/me')
        if (!response.ok) throw new Error('Failed to fetch user')
        const userData = await response.json()
        setCurrentUser(userData)
      } catch (error) {
        console.error('Error fetching current user:', error)
        // Fallback to a mock user for demo purposes
        setCurrentUser({
          id: 1,
          name: 'Teacher',
          email: 'teacher@example.com'
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCurrentUser()
  }, [])

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-4xl h-[80vh]">
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-muted-foreground">Loading chat...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-4xl h-[80vh]">
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-destructive">Failed to load user data</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl h-[80vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <CardTitle className="text-lg font-semibold">
            Chat: {doubt?.title || 'Doubt Discussion'}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1 h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-hidden">
          <ChatPanel
            doubtId={doubt?.id}
            doubtTitle={doubt?.title}
            doubtSubject={doubt?.subject}
            currentUser={currentUser}
            onClose={onClose}
          />
        </CardContent>
      </Card>
    </div>
  )
}