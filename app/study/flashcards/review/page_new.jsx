"use client"

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, RotateCcw, Sparkles, BookOpen, Brain, BarChart3 } from 'lucide-react'

export default function FlashcardReviewPage() {
  const searchParams = useSearchParams()
  const subject = searchParams.get('subject')
  const topic = searchParams.get('topic')
  const count = searchParams.get('count') || '10'
  
  const [flashcards, setFlashcards] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sessionId, setSessionId] = useState(null)
  const [sessionStartTime, setSessionStartTime] = useState(null)
  const [cardStartTime, setCardStartTime] = useState(null)
  const [completedFlashcards, setCompletedFlashcards] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [userAnswers, setUserAnswers] = useState({})

  useEffect(() => {
    initializeSession()
  }, [])

  const initializeSession = async () => {
    try {
      setIsLoading(true)
      setError(null)
      setSessionStartTime(new Date())
      setCardStartTime(new Date())

      const getCookie = (name) => {
        const value = `; ${document.cookie}`
        const parts = value.split(`; ${name}=`)
        if (parts.length === 2) return parts.pop()?.split(';').shift() || null
        return null
      }
      const token = (typeof window !== 'undefined' ? localStorage.getItem('token') : null) || getCookie('eduq_token')
      const response = await fetch('/api/flashcards/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          subject,
          topic,
          totalFlashcards: parseInt(count)
        })
      })
      const data = await response.json()
      if (data.success) {
        setSessionId(data.sessionId)
      }

      // Generate flashcards
      await generateFlashcards()
    } catch (err) {
      console.error('Error initializing session:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const generateFlashcards = async () => {
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate-flashcards',
          topic: `${subject}: ${topic}`,
          count: parseInt(count)
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `API Error: ${response.status}`)
      }

      if (!data.flashcards || data.flashcards.length === 0) {
        throw new Error('No flashcards were generated')
      }

      // Transform the flashcards to include hidden knowledge
      const transformedFlashcards = data.flashcards.map(card => ({
        ...card,
        question: card.front,
        answer: card.back,
        hiddenKnowledge: `This concept is fundamental to understanding ${topic} and often appears in advanced examinations. Mastering this will help you connect related concepts more effectively.`
      }))

      setFlashcards(transformedFlashcards)
    } catch (err) {
      console.error('Error generating flashcards:', err)
      
      // Fallback to mock flashcards if API fails
      const mockFlashcards = [
        {
          question: `What is the fundamental concept of ${topic}?`,
          answer: `${topic} is a crucial area within ${subject} that forms the foundation for understanding more complex concepts. It involves key principles and applications that are essential for mastery.`,
          hiddenKnowledge: "This topic often appears in advanced examinations and practical applications."
        },
        {
          question: `What are the key components of ${topic}?`,
          answer: `The key components include theoretical foundations, practical applications, problem-solving methodologies, and real-world implementations specific to ${topic}.`,
          hiddenKnowledge: "Understanding these components helps build a comprehensive knowledge framework."
        },
        {
          question: `How does ${topic} relate to other concepts in ${subject}?`,
          answer: `${topic} serves as a bridge between fundamental and advanced concepts, providing essential context for understanding broader principles within ${subject}.`,
          hiddenKnowledge: "This interconnectedness is crucial for developing holistic understanding."
        },
        {
          question: `What are common misconceptions about ${topic}?`,
          answer: `Common misconceptions include oversimplification of complex relationships, incorrect application of principles, and misunderstanding of contextual requirements.`,
          hiddenKnowledge: "Recognizing these misconceptions prevents common errors in application."
        },
        {
          question: `What practical applications exist for ${topic}?`,
          answer: `Practical applications range from academic problem-solving to real-world scenarios, including analytical thinking, systematic approaches, and evidence-based decision making.`,
          hiddenKnowledge: "These applications demonstrate the real-world value of theoretical knowledge."
        }
      ].slice(0, parseInt(count))
      
      setFlashcards(mockFlashcards)
    }
  }

  const handleNext = async () => {
    if (currentIndex < flashcards.length - 1) {
      // Record performance for current card before moving to next
      await recordCurrentCardPerformance()
      
      setCurrentIndex(currentIndex + 1)
      setShowAnswer(false)
      setCardStartTime(new Date())
    }
  }

  const handlePrevious = async () => {
    if (currentIndex > 0) {
      // Record performance for current card before moving to previous
      await recordCurrentCardPerformance()
      
      setCurrentIndex(currentIndex - 1)
      setShowAnswer(false)
      setCardStartTime(new Date())
    }
  }

  const handleFlip = () => {
    setShowAnswer(!showAnswer)
  }

  const handleRestart = async () => {
    // Record performance for current card before restarting
    await recordCurrentCardPerformance()
    
    setCurrentIndex(0)
    setShowAnswer(false)
    setCardStartTime(new Date())
  }

  const recordCurrentCardPerformance = async () => {
    if (!sessionId) return

    try {
      const timeSpent = Math.round((new Date() - cardStartTime) / 1000)
      const currentCard = flashcards[currentIndex]
      const isCorrect = showAnswer
      const getCookie = (name) => {
        const value = `; ${document.cookie}`
        const parts = value.split(`; ${name}=`)
        if (parts.length === 2) return parts.pop()?.split(';').shift() || null
        return null
      }
      const token = (typeof window !== 'undefined' ? localStorage.getItem('token') : null) || getCookie('eduq_token')

      await fetch('/api/flashcards/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          sessionId,
          flashcardId: currentIndex,
          subject,
          topic,
          questionText: currentCard.question,
          answerText: currentCard.answer,
          isCorrect,
          responseTime: timeSpent
        })
      })

      if (isCorrect) {
        setCorrectAnswers(prev => prev + 1)
      }
      setCompletedFlashcards(prev => prev + 1)

      const newScore = Math.round(((correctAnswers + (isCorrect ? 1 : 0)) / (completedFlashcards + 1)) * 100)
      await fetch('/api/flashcards/performance', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          subject,
          topic,
          newScore
        })
      })
    } catch (error) {
      console.error('Error recording card performance:', error)
    }
  }

  const handleSessionComplete = async () => {
    if (!sessionId) return

    try {
      const totalTimeSpent = Math.round((new Date() - sessionStartTime) / 1000)
      const getCookie = (name) => {
        const value = `; ${document.cookie}`
        const parts = value.split(`; ${name}=`)
        if (parts.length === 2) return parts.pop()?.split(';').shift() || null
        return null
      }
      const token = (typeof window !== 'undefined' ? localStorage.getItem('token') : null) || getCookie('eduq_token')
      await fetch('/api/flashcards/session', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          sessionId,
          completedFlashcards,
          correctAnswers,
          sessionDuration: totalTimeSpent,
          status: 'completed'
        })
      })
    } catch (error) {
      console.error('Error completing session:', error)
    }
  }

  // Handle session completion when reaching the last card
  useEffect(() => {
    if (currentIndex === flashcards.length - 1 && completedFlashcards === flashcards.length) {
      handleSessionComplete()
    }
  }, [currentIndex, completedFlashcards, flashcards.length])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900/20 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4 animate-pulse">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Initializing Session
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Setting up your flashcard session for {topic}...
          </p>
        </div>
      </div>
    )
  }

  if (error && flashcards.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900/20 p-8 flex items-center justify-center">
        <Card className="max-w-md w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">
              Session Initialization Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {error}
            </p>
            <Button onClick={initializeSession} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentFlashcard = flashcards[currentIndex]
  const progress = ((currentIndex + 1) / flashcards.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900/20 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Flashcard Review
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {subject} • {topic}
          </p>
          
        </div>

        {/* Stats Bar */}
        <div className="mb-6">
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {completedFlashcards}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Completed
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {correctAnswers}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Correct
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {Math.round((correctAnswers / Math.max(completedFlashcards, 1)) * 100)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Accuracy
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Progress
            </span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {currentIndex + 1} / {flashcards.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Flashcard */}
        <div className="mb-8">
            <Card className="border bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm min-h-[300px]">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <Badge variant="outline" className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                    Question {currentIndex + 1}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleFlip}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Flip Card
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col justify-center min-h-[200px]">
                {!showAnswer ? (
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      {currentFlashcard.question}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Click "Flip Card" or use the controls below to reveal the answer
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Answer:</h4>
                      <p className="text-gray-700 dark:text-gray-300">
                        {currentFlashcard.answer}
                      </p>
                    </div>
                    {currentFlashcard.hiddenKnowledge && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                        <h5 className="font-semibold text-blue-700 dark:text-blue-400 mb-2 flex items-center">
                          <Sparkles className="w-4 h-4 mr-2" />
                          Hidden Knowledge
                        </h5>
                        <p className="text-blue-600 dark:text-blue-300 text-sm">
                          {currentFlashcard.hiddenKnowledge}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center">
          <Button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex gap-2">
            <Button
              onClick={handleRestart}
              variant="ghost"
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Restart
            </Button>
            <Button
              onClick={handleFlip}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
            >
              {showAnswer ? 'Show Question' : 'Show Answer'}
            </Button>
          </div>

          <Button
            onClick={handleNext}
            disabled={currentIndex === flashcards.length - 1}
            variant="outline"
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Session Complete Message */}
        {currentIndex === flashcards.length - 1 && completedFlashcards === flashcards.length && (
          <div className="mt-8 text-center space-y-4">
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
              <CardContent className="p-6">
                <div className="text-2xl mb-2">🎉</div>
                <h3 className="text-xl font-bold text-green-800 dark:text-green-400 mb-2">
                  Session Complete!
                </h3>
                <p className="text-green-700 dark:text-green-300">
                  You completed {flashcards.length} flashcards with {Math.round((correctAnswers / flashcards.length) * 100)}% accuracy.
                  Your progress has been saved to your learning profile.
                </p>
              </CardContent>
            </Card>
            <Button 
              onClick={() => window.location.href = '/study/flashcards/dashboard'}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              View Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}