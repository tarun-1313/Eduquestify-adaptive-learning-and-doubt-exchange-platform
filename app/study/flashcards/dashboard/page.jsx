"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  BookOpen, 
  TrendingUp, 
  Clock, 
  Award, 
  Target, 
  BarChart3,
  Calendar,
  Brain,
  Star
} from 'lucide-react'
 
function FlashcardDashboardContent() {
  const [sessions, setSessions] = useState([])
  const [mastery, setMastery] = useState([])
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const getCookie = (name) => {
        const value = `; ${document.cookie}`
        const parts = value.split(`; ${name}=`)
        if (parts.length === 2) return parts.pop()?.split(';').shift() || null
        return null
      }
      const localToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const cookieToken = getCookie('eduq_token')
      const token = localToken || cookieToken

      const headers = token ? { 'Authorization': `Bearer ${token}` } : {}
      const response = await fetch('/api/flashcards/dashboard', { headers })
      const data = await response.json()

      if (response.ok && data) {
        setSessions(data.sessions || [])
        setMastery(data.mastery || [])
        setStats(data.stats || null)
      } else {
        setSessions([])
        setMastery([])
        setStats(null)
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setSessions([])
      setMastery([])
      setStats(null)
      setError(null)
    } finally {
      setIsLoading(false)
    }
  }

  const getTotalStats = () => {
    const totalSessions = sessions.length
    const totalFlashcards = sessions.reduce((sum, session) => sum + session.completed_flashcards, 0)
    const totalCorrect = sessions.reduce((sum, session) => sum + session.correct_answers, 0)
    const totalTime = sessions.reduce((sum, session) => sum + session.session_duration_seconds, 0)
    const averageAccuracy = totalFlashcards > 0 ? (totalCorrect / totalFlashcards) * 100 : 0

    return {
      totalSessions,
      totalFlashcards,
      totalCorrect,
      totalTime,
      averageAccuracy
    }
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900/20 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4 animate-pulse">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Loading Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Preparing your learning analytics...
          </p>
        </div>
      </div>
    )
  }

  

  const totalStats = getTotalStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900/20 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Flashcard Dashboard
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Track your learning progress and mastery
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm h-full border">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-3">
                  <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {totalStats.totalSessions}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Sessions
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm h-full border">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full mb-3">
                  <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {totalStats.totalFlashcards}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Flashcards Completed
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm h-full border">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-3">
                  <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {Math.round(totalStats.averageAccuracy)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Average Accuracy
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm h-full border">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full mb-3">
                  <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {formatTime(totalStats.totalTime)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Study Time
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm h-full border">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mb-3">
                  <Award className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {mastery.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Topics Mastered
                </div>
              </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Sessions by Subject */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <Calendar className="w-6 h-6 mr-2" />
              Recent Sessions by Subject
            </h2>
            <div className="space-y-4">
              {sessions.slice(0, 5).map((session) => (
                  <Card key={session.id} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {session.subject} • {session.topic}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(session.created_at)}
                          </p>
                        </div>
                        <Badge 
                          variant={session.status === 'completed' ? 'default' : 'secondary'}
                          className={session.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : ''}
                        >
                          {session.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Cards:</span>
                          <div className="font-semibold">{session.completed_flashcards}/{session.total_flashcards}</div>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Correct:</span>
                          <div className="font-semibold text-green-600 dark:text-green-400">{session.correct_answers}</div>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Time:</span>
                          <div className="font-semibold">{formatTime(session.session_duration_seconds)}</div>
                        </div>
                      </div>
                      {session.completed_flashcards > 0 && (
                        <div className="mt-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600 dark:text-gray-400">Accuracy</span>
                            <span className="font-semibold">
                              {Math.round((session.correct_answers / session.completed_flashcards) * 100)}%
                            </span>
                          </div>
                          <Progress 
                            value={(session.correct_answers / session.completed_flashcards) * 100} 
                            className="h-2"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
              ))}
              {sessions.length === 0 && (
                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <BookOpen className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      No flashcard sessions yet. Start practicing to see your progress here!
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Subject Mastery Information */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <Star className="w-6 h-6 mr-2" />
              Subject Mastery Information
            </h2>
            <div className="space-y-4">
              {mastery.slice(0, 5).map((masteryItem) => (
                  <Card key={masteryItem.id} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {masteryItem.subject} • {masteryItem.topic}
                          </h3>
                          <Badge 
                            variant="outline"
                            className={`mt-1 ${
                              masteryItem.mastery_level >= 4 ? 'border-green-500 text-green-700 dark:text-green-400' :
                              masteryItem.mastery_level >= 3 ? 'border-yellow-500 text-yellow-700 dark:text-yellow-400' :
                              'border-red-500 text-red-700 dark:text-red-400'
                            }`}
                          >
                            Level {masteryItem.mastery_level}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {Math.round(masteryItem.average_score)}%
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Avg Score
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Attempted:</span>
                          <div className="font-semibold">{masteryItem.total_flashcards_attempted}</div>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Correct:</span>
                          <div className="font-semibold text-green-600 dark:text-green-400">{masteryItem.total_correct_answers}</div>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Streak:</span>
                          <div className="font-semibold">{masteryItem.streak_days} days</div>
                        </div>
                      </div>
                      {masteryItem.total_flashcards_attempted > 0 && (
                        <div className="mt-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600 dark:text-gray-400">Progress to next level</span>
                            <span className="font-semibold">
                              {Math.round((masteryItem.average_score / 100) * 100)}%
                            </span>
                          </div>
                          <Progress 
                            value={masteryItem.average_score} 
                            className="h-2"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
              ))}
              {mastery.length === 0 && (
                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <Star className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      No mastery data yet. Complete some flashcard sessions to build your learning profile!
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 text-center">
          <Button 
            onClick={() => window.location.href = '/study/flashcards/setup'}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white mr-4"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Start New Session
          </Button>
          <Button 
            onClick={loadDashboardData}
            variant="outline"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>
    </div>
  )
}

export default FlashcardDashboardContent