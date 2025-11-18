"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import StarsBackground from "../../components/stars-background.jsx"
import LetterGlitch from "@/components/LetterGlitch.jsx"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  BookOpen, 
  Target, 
  Zap, 
  Trophy, 
  Plus, 
  Calendar, 
  TrendingUp,
  X,
  Check,
  AlertCircle,
  BarChart3
} from "lucide-react"
import { useRealTimeDashboard } from "@/app/hooks/useRealTimeDashboard"
import { AnimatedXPProgress } from "@/app/components/AnimatedXPProgress"
import { RealTimeRecommendedTopics } from "@/app/components/RealTimeRecommendedTopics"
import { RealTimeActivityFeed } from "@/app/components/RealTimeActivityFeed"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import "@/components/Letterglitch.css"

// Quiz configuration
const QUIZ_CONFIG = {
  subjects: [
    {
      id: 'math',
      name: 'Mathematics',
      topics: ['Algebra', 'Geometry', 'Calculus', 'Trigonometry', 'Statistics']
    },
    {
      id: 'science',
      name: 'Science',
      topics: ['Physics', 'Chemistry', 'Biology', 'Astronomy', 'Earth Science']
    },
    {
      id: 'history',
      name: 'History',
      topics: ['World History', 'US History', 'European History', 'Ancient Civilizations']
    },
    {
      id: 'literature',
      name: 'Literature',
      topics: ['American Literature', 'British Literature', 'World Literature', 'Poetry']
    },
    {
      id: 'computer-science',
      name: 'Computer Science',
      topics: ['Algorithms', 'Data Structures', 'Web Development', 'Machine Learning']
    }
  ],
  difficulties: ['Easy', 'Medium', 'Hard'],
  xpToNextLevel: 2000
}

// Mock data - in a real app, this would come from an API/database
const mockUserData = {
  streak: 5,
  xp: 1250,
  level: 8,
  xpToNext: 1750,
  dailyGoal: { completed: false, type: "Complete 1 Quiz", progress: 0 },
  recommendedTopics: [
    { id: 1, name: "Algebraic Equations", difficulty: "Medium", reason: "3 incorrect answers in last week" },
    { id: 2, name: "Cell Mitosis", difficulty: "Easy", reason: "Review needed for upcoming test" }
  ],
  studyDecks: [
    { id: 1, name: "Chapter 3: Key Terms", cards: 25, mastered: 18, nextReview: "2024-01-15" },
    { id: 2, name: "Calculus Formulas", cards: 15, mastered: 12, nextReview: "2024-01-16" }
  ],
  recentActivity: [
    { id: 1, message: "You completed a 5-day streak!", type: "streak", time: "2 hours ago" },
    { id: 2, message: "Answered 3 questions in Doubt Exchange", type: "help", time: "1 day ago" },
    { id: 3, message: "Mastered the 'Photosynthesis' flashcard deck", type: "achievement", time: "2 days ago" }
  ],
  badges: [
    { id: 1, name: "Quiz Master", description: "Completed 10 quizzes", icon: "🏆" },
    { id: 2, name: "Study Streak", description: "7-day streak", icon: "🔥" }
  ]
}

// Quiz Question Component
function QuizQuestion({ question, questionNumber, totalQuestions, onAnswer, onClose }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [hasAnswered, setHasAnswered] = useState(false)

  const handleAnswer = (answer) => {
    if (hasAnswered) return
    setSelectedAnswer(answer)
    setHasAnswered(true)
    setTimeout(() => {
      onAnswer(answer)
      setSelectedAnswer(null)
      setHasAnswered(false)
    }, 1000)
  }

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start">
          <div>
            <DialogTitle>Question {questionNumber} of {totalQuestions}</DialogTitle>
            <DialogDescription className="mt-1">
              {question.difficulty} • {question.topic}
            </DialogDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="py-4">
          <p className="text-lg font-medium mb-6">{question.text}</p>
          
          <div className="space-y-3">
            {question.options.map((option, index) => {
              const isCorrect = option === question.correctAnswer
              const isSelected = selectedAnswer === option
              let variant = 'outline'
              
              if (hasAnswered) {
                if (isCorrect) variant = 'success'
                else if (isSelected) variant = 'destructive'
              } else if (isSelected) variant = 'secondary'
              
              return (
                <Button
                  key={index}
                  variant={variant}
                  className={`w-full justify-start text-left h-auto py-3 px-4 ${
                    hasAnswered && !isSelected ? 'opacity-70' : ''
                  }`}
                  onClick={() => handleAnswer(option)}
                  disabled={hasAnswered && !isSelected}
                >
                  <div className="flex items-center w-full">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center mr-3 text-sm font-medium">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="flex-1">{option}</span>
                    {hasAnswered && (
                      <div className="ml-2">
                        {isCorrect ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : isSelected ? (
                          <X className="h-4 w-4 text-red-500" />
                        ) : null}
                      </div>
                    )}
                  </div>
                </Button>
              )
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Quiz Results Component
function QuizResults({ 
  isOpen, 
  onClose, 
  results, 
  userData, 
  onReviewFlashcards 
}) {
  const [isAnimating, setIsAnimating] = useState(true)
  const [currentXP, setCurrentXP] = useState(userData.xp)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [badgeUnlocked, setBadgeUnlocked] = useState(null)
  
  const { score, totalQuestions, xpEarned } = results
  const xpToNextLevel = QUIZ_CONFIG.xpToNextLevel
  const newXP = userData.xp + xpEarned
  const didLevelUp = newXP >= xpToNextLevel
  
  // Animation for XP bar
  useEffect(() => {
    if (!isOpen) return
    
    const timer = setTimeout(() => {
      setCurrentXP(prev => {
        const nextXP = prev + Math.ceil(xpEarned / 20)
        return nextXP >= newXP ? newXP : nextXP
      })
    }, 50)
    
    return () => clearTimeout(timer)
  }, [isOpen, currentXP, xpEarned, newXP])
  
  // Check for level up and badge unlock
  useEffect(() => {
    if (isOpen && currentXP >= xpToNextLevel && !showLevelUp) {
      setShowLevelUp(true)
      // Simulate badge unlock if score is perfect
      if (score === totalQuestions) {
        setTimeout(() => {
          setBadgeUnlocked({
            name: 'Perfect Score!',
            description: `Got ${score}/${totalQuestions} questions correct`,
            icon: '🏆'
          })
        }, 1000)
      }
    }
  }, [currentXP, isOpen, score, totalQuestions, xpToNextLevel, showLevelUp])
  
  // Handle level up animation complete
  const handleLevelUpComplete = () => {
    if (didLevelUp) {
      setCurrentXP(newXP % xpToNextLevel)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            Quiz Complete! 🎉
          </DialogTitle>
          <DialogDescription className="text-center">
            You scored {score} out of {totalQuestions} questions correctly
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* XP Progress */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Level {userData.level}</span>
              <span className="text-sm font-medium">
                +{xpEarned} XP
              </span>
            </div>
            <div className="relative">
              <Progress 
                value={Math.min(100, (currentXP / xpToNextLevel) * 100)} 
                className="h-3"
              />
              <AnimatePresence>
                {showLevelUp && (
                  <motion.div
                    key="level-up"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    onAnimationComplete={handleLevelUpComplete}
                    className="absolute -top-8 left-0 right-0 text-center"
                  >
                    <div className="inline-flex items-center bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                      <span className="mr-1">🎉</span> Level Up! {userData.level + 1}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              {xpToNextLevel - currentXP} XP to next level
            </p>
          </div>
          
          {/* Badge Unlock */}
          {badgeUnlocked && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-primary/5 p-4 rounded-lg border border-primary/10 flex flex-col items-center text-center"
            >
              <div className="text-4xl mb-2">{badgeUnlocked.icon}</div>
              <h4 className="font-semibold">New Badge Unlocked!</h4>
              <p className="text-sm text-muted-foreground">{badgeUnlocked.name}</p>
              <p className="text-xs mt-1">{badgeUnlocked.description}</p>
            </motion.div>
          )}
          
          {/* Review Section */}
          {results.incorrectAnswers.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Review Your Answers</h4>
              <div className="space-y-4">
                {results.incorrectAnswers.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-muted/20">
                    <p className="font-medium mb-2">{item.question}</p>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <span className="text-sm text-muted-foreground w-24">Your answer:</span>
                        <span className="text-destructive flex items-center">
                          <X className="h-4 w-4 mr-1" /> {item.userAnswer}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-muted-foreground w-24">Correct answer:</span>
                        <span className="text-green-600 flex items-center">
                          <Check className="h-4 w-4 mr-1" /> {item.correctAnswer}
                        </span>
                      </div>
                      {item.explanation && (
                        <div className="mt-2 p-3 bg-muted/15 rounded text-sm">
                          <div className="font-medium flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1 text-amber-500" />
                            Explanation
                          </div>
                          <p className="mt-1">{item.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {results.incorrectAnswers.length > 0 && (
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={onReviewFlashcards}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Review Related Flashcards
              </Button>
            )}
            <Button className="flex-1" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}




export default function StudyPage() {
  const { dashboardData, isLoading, error, refreshDashboard } = useRealTimeDashboard();
  const [quizState, setQuizState] = useState({
    isSetupOpen: false,
    isQuizActive: false,
    currentQuestionIndex: 0,
    score: 0,
    showResults: false,
    questions: [] // Initialize questions as an empty array
  })
  const router = useRouter()

  // Use real-time data or fall back to mock data
  const userData = dashboardData?.user || mockUserData;
  const recommendedTopics = dashboardData?.recommendedTopics || mockUserData.recommendedTopics;
  const recentActivity = dashboardData?.recentActivity || mockUserData.recentActivity;
  
  const handleStartQuizClick = () => {
    router.push('/study/quiz/setup')
  }
  
  const handleStartQuiz = (settings) => {
    // Navigate to the quiz page with the selected settings as query parameters
    const queryParams = new URLSearchParams({
      subject: settings.subject || '',
      topic: settings.topic || '',
      difficulty: settings.difficulty || 'Medium',
      questionCount: settings.questionCount || 5
    }).toString()
    
    router.push(`/study/quiz?${queryParams}`)
  }
  
  // Quiz functionality moved to /study/quiz

  const handleReviewFlashcards = () => {
    router.push('/study/flashcards/setup')
  }


  const handleCreateDeck = async () => {
    setIsLoading(true)
    try {
      // Here you would use Gemini API to generate flashcards from notes
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate-flashcards',
          topic: 'General Knowledge', // This should be based on user input or selected topic
          count: 10
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `API Error: ${response.status}`)
      }

      if (!data.flashcards || data.flashcards.length === 0) {
        throw new Error('No flashcards were generated')
      }

      console.log('Generated flashcards:', data.flashcards)

      // Here you would save the flashcards to the database and redirect to deck view
      alert(`Generated ${data.flashcards.length} flashcards!`)

    } catch (error) {
      console.error("Error creating deck:", error)

      // Show more specific error messages
      let errorMessage = "Failed to create flashcard deck. Please try again."
      if (error.message.includes('API key')) {
        errorMessage = "Gemini API key not configured. Please add GEMINI_API_KEY to your .env.local file."
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = "Network error. Please check your internet connection."
      } else if (error.message.includes('No flashcards')) {
        errorMessage = "No flashcards were generated. Please try again."
      }

      alert(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Function to render the quiz setup modal
  const renderQuizSetupModal = () => (
    <Dialog open={quizState.isSetupOpen} onOpenChange={(open) => 
      setQuizState(prev => ({ ...prev, isSetupOpen: open }))
    }>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Quiz Setup</DialogTitle>
          <DialogDescription>
            Customize your quiz by selecting a subject and topic.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => {
          e.preventDefault()
          const formData = new FormData(e.target)
          const subject = formData.get('subject')
          const topic = formData.get('topic')
          const difficulty = formData.get('difficulty') || 'Medium'
          if (subject && topic) {
            handleStartQuiz({ subject, topic, difficulty })
          }
        }} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Select name="subject" required>
              <SelectTrigger>
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {QUIZ_CONFIG.subjects.map((subj) => (
                  <SelectItem key={subj.id} value={subj.name}>
                    {subj.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Input 
              name="topic" 
              placeholder="Enter a topic" 
              required 
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select name="difficulty" defaultValue="Medium">
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                {QUIZ_CONFIG.difficulties.map((diff) => (
                  <SelectItem key={diff} value={diff}>
                    {diff}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setQuizState(prev => ({ ...prev, isSetupOpen: false }))}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Generating...' : 'Start Quiz'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )

  // Function to render the current quiz question
  const renderQuizQuestion = () => {
    if (!quizState.isQuizActive || !quizState.questions.length) return null
    
    const currentQuestion = quizState.questions[quizState.currentQuestion]
    const isLastQuestion = quizState.currentQuestion === quizState.questions.length - 1
    
    return (
      <Dialog open={true} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle>Question {quizState.currentQuestion + 1} of {quizState.questions.length}</DialogTitle>
              <DialogDescription className="mt-1">
                {currentQuestion.difficulty} • {currentQuestion.topic}
              </DialogDescription>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => {
                if (confirm('Are you sure you want to quit the quiz? Your progress will be lost.')) {
                  handleCloseQuiz()
                }
              }} 
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="py-4">
            <p className="text-lg font-medium mb-6">{currentQuestion.question}</p>
            
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = quizState.answers.some(
                  a => a.questionId === currentQuestion.id && a.answer === option
                )
                const isCorrect = option === currentQuestion.options[currentQuestion.correctAnswer]
                
                return (
                  <Button
                    key={index}
                    variant={isSelected ? (isCorrect ? 'success' : 'destructive') : 'outline'}
                    className={`w-full justify-start text-left h-auto py-3 px-4 ${
                      isSelected ? '' : 'hover:bg-accent hover:text-accent-foreground'
                    }`}
                    onClick={() => {
                      if (!isSelected) {
                        handleAnswerQuestion(option)
                      }
                    }}
                  >
                    <div className="flex items-center w-full">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center mr-3 text-sm font-medium">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="flex-1">{option}</span>
                      {isSelected && (
                        <div className="ml-2">
                          {isCorrect ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                  </Button>
                )
              })}
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <div className="text-sm text-muted-foreground">
              Question {quizState.currentQuestion + 1} of {quizState.questions.length}
            </div>
            <div className="space-x-2">
              {quizState.currentQuestion > 0 && (
                <Button 
                  variant="outline" 
                  // Quiz functionality moved to /study/quiz
                >
                  Previous
                </Button>
              )}
              {!isLastQuestion ? (
                <Button 
                  onClick={() => {
                    // Removed quiz logic
                    const currentAnswer = quizState.answers.find(
                      a => a.questionId === currentQuestion.id
                    )
                    if (!currentAnswer) {
                      // If no answer selected, mark as incorrect
                      handleAnswerQuestion('')
                    }
                    setQuizState(prev => ({
                      ...prev,
                      currentQuestion: prev.currentQuestion + 1
                    }))
                  }}
                  disabled={!quizState.answers.some(a => a.questionId === currentQuestion.id)}
                >
                  Next Question
                </Button>
              ) : (
                <Button 
                  onClick={() => {
                    const currentAnswer = quizState.answers.find(
                      a => a.questionId === currentQuestion.id
                    )
                    if (!currentAnswer) {
                      // If no answer selected, mark as incorrect
                      handleAnswerQuestion('')
                    }
                    // The handleAnswerQuestion will automatically show results
                  }}
                  variant="default"
                >
                  Submit Quiz
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Function to render quiz results
  const renderQuizResults = () => {
    if (!quizState.isResultsOpen || !quizState.results) return null
    
    const { score, totalQuestions, xpEarned, incorrectAnswers } = quizState.results
    const percentage = Math.round((score / totalQuestions) * 100)
    const didLevelUp = userData.xp + xpEarned >= userData.xpToNext
    const newLevel = didLevelUp ? userData.level + 1 : userData.level
    
    return (
      <Dialog open={true} onOpenChange={(open) => {
        if (!open) handleCloseQuiz()
      }}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="text-center">
              <div className="text-6xl mb-4">
                {percentage >= 80 ? '🎉' : percentage >= 50 ? '👍' : '💪'}
              </div>
              <DialogTitle className="text-3xl">
                {percentage >= 80 ? 'Great Job!' : percentage >= 50 ? 'Good Work!' : 'Keep Practicing!'}
              </DialogTitle>
              <DialogDescription className="text-lg mt-2">
                You scored {score} out of {totalQuestions} ({percentage}%)
              </DialogDescription>
            </div>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* XP Progress */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Level {userData.level}</span>
                <div className="flex items-center">
                  <span className="text-sm font-medium mr-2">+{xpEarned} XP</span>
                  <Zap className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                </div>
              </div>
              <div className="relative">
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${Math.min(100, (userData.xp / userData.xpToNext) * 100)}%`,
                      backgroundColor: didLevelUp ? '#f59e0b' : '#3b82f6'
                    }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    onAnimationComplete={() => {
                      if (didLevelUp) {
                        // Trigger level up animation
                        setTimeout(() => {
                          setUserData(prev => ({
                            ...prev,
                            xp: (prev.xp + xpEarned) % prev.xpToNext,
                            level: newLevel,
                            xpToNext: Math.floor(prev.xpToNext * 1.2) // Increase XP needed for next level
                          }))
                        }, 500)
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center mt-1">
                  {didLevelUp 
                    ? `Level Up! ${userData.level} → ${newLevel}` 
                    : `${userData.xpToNext - userData.xp} XP to next level`}
                </p>
              </div>
            </div>
            
            {/* Badge Unlock (if applicable) */}
            {percentage === 100 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800 flex flex-col items-center text-center"
              >
                <div className="text-4xl mb-2">🏆</div>
                <h4 className="font-semibold text-amber-900 dark:text-amber-100">Perfect Score!</h4>
                <p className="text-sm text-amber-700 dark:text-amber-300">You got all questions right!</p>
              </motion.div>
            )}
            
            {/* Incorrect Answers */}
            {incorrectAnswers.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-semibold">Review Your Mistakes</h4>
                <div className="space-y-4">
                  {incorrectAnswers.map((item, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-muted/10">
                      <p className="font-medium mb-2">{item.question}</p>
                      <div className="space-y-2">
                        <div className="flex items-start">
                          <span className="text-sm text-muted-foreground w-20">Your answer:</span>
                          <span className="text-destructive flex-1">
                            <X className="h-4 w-4 mr-1 inline" />
                            {item.userAnswer || 'Skipped'}
                          </span>
                        </div>
                        <div className="flex items-start">
                          <span className="text-sm text-muted-foreground w-20">Correct answer:</span>
                          <span className="text-green-600 flex-1">
                            <Check className="h-4 w-4 mr-1 inline" />
                            {item.correctAnswer}
                          </span>
                        </div>
                        {item.explanation && (
                          <div className="mt-2 p-3 bg-muted/20 rounded text-sm">
                            <div className="font-medium flex items-center text-muted-foreground">
                              <AlertCircle className="h-4 w-4 mr-1 text-amber-500" />
                              Explanation
                            </div>
                            <p className="mt-1">{item.explanation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {incorrectAnswers.length > 0 ? (
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    // In a real app, this would navigate to the relevant flashcards
                    alert(`Would navigate to flashcards for missed questions`)
                    handleCloseQuiz()
                  }}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Review Related Flashcards
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    // Restart the quiz with the same settings
                    handleStartQuiz(quizState.quizConfig)
                  }}
                >
                  <RotateCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              )}
              <Button 
                className="flex-1" 
                onClick={handleCloseQuiz}
              >
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="study-page-with-glitch relative overflow-hidden">
      {/* LetterGlitch Background */}
      <div className="letter-glitch-container">
        <LetterGlitch
          glitchSpeed={50}
          centerVignette={true}
          outerVignette={false}
          smooth={true}
          glitchColors={['#2b4539', '#61dca3', '#61b3dc']}
        />
      </div>
      
      {/* Quiz Setup Modal */}
      {renderQuizSetupModal()}
      
      {/* Quiz Question */}
      {renderQuizQuestion()}
      
      {/* Quiz Results */}
      {renderQuizResults()}
      
      {/* Quiz Question Modal */}
      {quizState.isQuizActive && quizState.questions.length > 0 && (
        <QuizQuestion
          question={quizState.questions[quizState.currentQuestion]}
          questionNumber={quizState.currentQuestion + 1}
          totalQuestions={quizState.questions.length}
          onAnswer={handleAnswerQuestion}
          onClose={handleCloseQuiz}
        />
      )}
      
      {/* Quiz Results Modal */}
      {quizState.isResultsOpen && quizState.results && (
        <QuizResults
          isOpen={quizState.isResultsOpen}
          onClose={handleCloseQuiz}
          results={quizState.results}
          userData={userData}
          onReviewFlashcards={handleReviewFlashcards}
        />
      )}
      {/* Blinking stars background */}
      <StarsBackground />

      <div className="study-content">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* ## 1. The "Daily Quest" Section */}
          <Card className="bg-background/20 backdrop-blur-sm border-border/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Target className="h-6 w-6 text-primary" />
                Daily Quest
              </CardTitle>
              <CardDescription>
                Build consistent study habits with your daily learning goals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Today's Streak Goal */}
              <div className="flex items-center justify-between p-4 bg-muted/15 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${userData.dailyGoal.completed ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <div>
                    <p className="font-medium text-foreground">Today's Goal</p>
                    <p className="text-sm text-muted-foreground">{userData.dailyGoal.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-foreground">{userData.streak} day streak!</p>
                  <p className="text-sm text-muted-foreground">Keep it up!</p>
                </div>
              </div>

              {/* XP Progress Bar - Real-time Animated */}
              <AnimatedXPProgress 
                xp={userData.xp} 
                level={userData.level} 
                xpToNext={userData.xpToNext || 2000} 
                className="mb-4"
              />

              {/* Quick Start Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={handleStartQuizClick}
                  disabled={isLoading}
                  className="flex-1 btn-primary"
                >
                  <Zap className="mr-2 h-4 w-4" />
                  {isLoading ? "Loading..." : "Start Today's Adaptive Quiz"}
                </Button>
                <Button
                  onClick={handleReviewFlashcards}
                  variant="outline"
                  className="flex-1"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Review Flashcards
                </Button>
                <Button
                  onClick={() => router.push('/study/flashcards/dashboard')}
                  variant="outline"
                  className="flex-1"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* ## 2. "Recommended For You" Panel */}
          <Card className="bg-background/20 backdrop-blur-sm border-border/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Recommended For You
              </CardTitle>
              <CardDescription>
                AI-powered suggestions based on your learning patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Topics to Strengthen - Real-time */}
              <div>
                <h4 className="font-semibold mb-3">Topics to Strengthen</h4>
                <RealTimeRecommendedTopics initialTopics={recommendedTopics} />
              </div>

              {/* Suggested Resources */}
              <div>
                <h4 className="font-semibold mb-3">Suggested Resources</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="p-4 bg-muted/10">
                    <h5 className="font-medium mb-2">Relevant Notes</h5>
                    <p className="text-sm text-muted-foreground mb-3">
                      Teacher notes and study materials for weak topics
                    </p>
                    <Button size="sm" variant="outline">Browse Notes</Button>
                  </Card>
                  <Card className="p-4 bg-muted/10">
                    <h5 className="font-medium mb-2">Active Doubts</h5>
                    <p className="text-sm text-muted-foreground mb-3">
                      Community questions related to your topics
                    </p>
                    <Button size="sm" variant="outline">View Doubts</Button>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ## 3. "My Study Decks" Overview */}
          <Card className="bg-background/20 backdrop-blur-sm border-border/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                My Study Decks
              </CardTitle>
              <CardDescription>
                Your personal flashcard collections and spaced repetition schedule
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Flashcard Decks */}
              <div className="space-y-4">
                {userData.studyDecks.map((deck) => (
                  <Card key={deck.id} className="p-4 bg-background/10">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h5 className="font-semibold">{deck.name}</h5>
                        <p className="text-sm text-muted-foreground">
                          {deck.mastered} of {deck.cards} cards mastered
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        Review
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Mastery Progress</span>
                        <span>{Math.round((deck.mastered / deck.cards) * 100)}%</span>
                      </div>
                      <Progress value={(deck.mastered / deck.cards) * 100} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        Next review: {new Date(deck.nextReview).toLocaleDateString()}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Create New Deck Button */}
              <Button onClick={handleCreateDeck} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Create New Deck
              </Button>
            </CardContent>
          </Card>

          {/* ## 4. "Recent Activity" & "Badges" Showcase */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card className="bg-background/20 backdrop-blur-sm border-border/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RealTimeActivityFeed initialActivities={recentActivity} />
              </CardContent>
            </Card>

            {/* Latest Badges Earned */}
            <Card className="bg-background/20 backdrop-blur-sm border-border/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Latest Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userData.badges.map((badge) => (
                    <div key={badge.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <span className="text-2xl">{badge.icon}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{badge.name}</p>
                        <p className="text-xs text-muted-foreground">{badge.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
