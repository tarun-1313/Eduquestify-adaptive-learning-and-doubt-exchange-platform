"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  BookOpen, 
  X, 
  Check, 
  AlertCircle, 
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Zap
} from "lucide-react"
import Flashcard from '@/app/components/Flashcard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

// Default quiz configuration
const DEFAULT_QUIZ_CONFIG = {
  subject: '',
  topic: '',
  difficulty: 'Medium',
  questionCount: 5
}

// Custom hook to fetch dashboard data
function useDashboardData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/user/dashboard');
        if (!response.ok) throw new Error('Failed to fetch dashboard data');
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}

// Save quiz attempt to the database
async function saveQuizAttempt(quizData) {
  try {
    console.log('Saving quiz attempt with data:', quizData);
    
    const response = await fetch('/api/quiz/save-attempt', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(quizData)
    });
    
    const data = await response.json();
    console.log('Save attempt response:', data);
    
    if (!response.ok) {
      const error = new Error(data.error || 'Failed to save quiz attempt');
      error.response = response;
      error.data = data;
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in saveQuizAttempt:', {
      error: error.message,
      response: error.response,
      data: error.data,
      stack: error.stack
    });
    throw error;
  }
}

export default function QuizPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [flashcards, setFlashcards] = useState([]);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [showAllFlashcards, setShowAllFlashcards] = useState(false);
  const [isLoadingFlashcards, setIsLoadingFlashcards] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const { data: dashboardData, loading: dashboardLoading } = useDashboardData();
  // Use real-time data from dashboard
  const [userData, setUserData] = useState({
    xp: 0,
    level: 1,
    xpToNext: 1000,
    streak: 0,
    dailyGoal: {
      type: "Complete 1 quiz",
      completed: false,
      progress: 0
    }
  })

  // Update userData when dashboard data is loaded
  useEffect(() => {
    if (dashboardData?.progress) {
      setUserData(prev => ({
        ...prev,
        xp: dashboardData.progress.total_xp || 0,
        level: dashboardData.progress.level || 1,
        xpToNext: dashboardData.progress.xp_to_next_level || 1000,
        streak: dashboardData.progress.streak || 0
      }));
    }
  }, [dashboardData]);

  const [quizState, setQuizState] = useState({
    isSetupOpen: true,
    isQuizActive: false,
    isResultsOpen: false,
    currentQuestionIndex: 0,
    answers: [],
    quizConfig: { ...DEFAULT_QUIZ_CONFIG },
    questions: [],
    results: null,
    customSubject: '',
    customTopic: '',
    useCustom: false
  })

  const QUIZ_CONFIG = {
    difficulties: ['Easy', 'Medium', 'Hard'],
    xpRewards: {
      'Easy': 50,
      'Medium': 100,
      'Hard': 200
    }
  }

  const generateQuestions = async (topic, difficulty, count = 5) => {
    try {
      const response = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          difficulty,
          count,
          timestamp: Date.now() // Ensure unique questions each time
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate quiz questions')
      }

      const data = await response.json()
      return data.questions || []
    } catch (error) {
      console.error('Error generating questions:', error)
      throw error
    }
  }

  // Initialize quiz from URL parameters if they exist
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const hasParams = Array.from(params.keys()).length > 0
    
    if (hasParams) {
      const quizConfig = {
        subject: params.get('subject') || '',
        topic: params.get('topic') || '',
        difficulty: params.get('difficulty') || 'Medium',
        questionCount: parseInt(params.get('questionCount')) || 5
      }
      
      setQuizState(prev => ({
        ...prev,
        quizConfig,
        isSetupOpen: false,
        hasSavedAttempt: false
      }))
      
      // Start the quiz with the configuration
      startQuiz(quizConfig)
    }
  }, [])

  const startQuiz = async (config) => {
    try {
      setIsLoading(true)
      
      // Generate questions based on the config
      const questions = await generateQuestions(
        config.topic || config.subject,
        config.difficulty,
        config.questionCount
      )
      
      setQuizState(prev => ({
        ...prev,
        questions,
        currentQuestionIndex: 0,
        answers: [], // <-- FIX #1: Initialized as empty array
        isQuizActive: true,
        isSetupOpen: false,
        hasSavedAttempt: false
      }))
      
    } catch (error) {
      console.error('Failed to start quiz:', error)
      // Show error state
      setQuizState(prev => ({
        ...prev,
        isSetupOpen: true,
        isQuizActive: false,
        questions: [],
        answers: []
      }))
    } finally {
      setIsLoading(false)
    }
  }

  // <-- FIX #2: Replaced entire function with corrected scope
  const handleStartQuiz = async (e) => {
    e?.preventDefault()
    
    // Get values from state
    const { useCustom, customSubject, customTopic } = quizState

    const form = e?.target || document.querySelector('#quiz-form')
    const formData = new FormData(form)
    
    // Get values from form
    const subject = formData.get('subject') || ''
    const topic = formData.get('topic') || ''
    const difficulty = formData.get('difficulty') || 'Medium'
    // Using a fixed question count as it's not in the form
    const questionCount = 5 

    // --- Validation ---
    if (!useCustom && !subject) {
      alert('Please select a subject')
      return
    }

    if (!useCustom && !topic) {
      alert('Please enter a topic')
      return
    }

    if (useCustom && (!customSubject || !customTopic)) {
      alert('Please enter both custom subject and topic')
      return
    }

    // --- Config ---
    const config = {
      subject: useCustom ? customSubject : subject,
      topic: useCustom ? customTopic : topic,
      difficulty,
      useCustom,
      questionCount
    }

    setIsLoading(true)
    try {
      const questions = await generateQuestions(config.topic, config.difficulty, config.questionCount)
      
      if (questions.length === 0) {
        throw new Error('No questions were generated. Please try a different topic or difficulty.')
      }
      
      setQuizState(prev => ({
        ...prev,
        isSetupOpen: false,
        isQuizActive: true,
        questions,
        quizConfig: config,
        answers: [], // Correctly initialized
        currentQuestionIndex: 0,
        results: null,
        hasSavedAttempt: false
      }))
      
    } catch (error) {
      console.error('Error starting quiz:', error)
      alert(`Failed to start quiz: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnswerQuestion = (answer) => {
    const { questions, currentQuestionIndex, answers } = quizState
    const currentQ = questions[currentQuestionIndex]
    if (!currentQ) return
    
    const isCorrect = answer === currentQ.options[currentQ.correctAnswer]
    
    // Check if we already have an answer for this question
    const answerIndex = answers.findIndex(a => a.questionId === currentQ.id)
    let newAnswers = [...answers]
    
    const answerData = {
      questionId: currentQ.id,
      answer,
      isCorrect,
      question: currentQ.question,
      correctAnswer: currentQ.options[currentQ.correctAnswer],
      explanation: currentQ.explanation,
      userAnswer: answer
    }
    
    if (answerIndex >= 0) {
      // Update existing answer
      newAnswers[answerIndex] = answerData
    } else {
      // Add new answer
      newAnswers = [...newAnswers, answerData]
    }
    
    // Update the answers in state immediately
    setQuizState(prev => ({
      ...prev,
      answers: newAnswers
    }))
    
    // Then move to next question after a short delay
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setQuizState(prev => ({
          ...prev,
          currentQuestionIndex: prev.currentQuestionIndex + 1
        }))
      } else {
        const correctAnswers = newAnswers.filter(a => a.isCorrect).length
        const xpEarned = QUIZ_CONFIG.xpRewards[quizState.quizConfig?.difficulty] || 100
        
        setQuizState(prev => ({
          ...prev,
          isQuizActive: false,
          isResultsOpen: true,
          answers: newAnswers,
          results: {
            score: correctAnswers,
            totalQuestions: questions.length,
            xpEarned,
            incorrectAnswers: newAnswers.filter(a => !a.isCorrect)
          }
        }))
        
        setUserData(prev => ({
          ...prev,
          xp: prev.xp + xpEarned,
          dailyGoal: {
            ...prev.dailyGoal,
            completed: true,
            progress: 100
          }
        }))
      }
    }, 500)
  }

  // Persist results once results view opens (idempotent)
  useEffect(() => {
    if (quizState.isResultsOpen && quizState.results && !quizState.hasSavedAttempt) {
      const payload = {
        subject: quizState.quizConfig.subject || 'General',
        topic: quizState.quizConfig.topic || quizState.quizConfig.subject || 'General',
        difficulty: quizState.quizConfig.difficulty || 'Medium',
        score: quizState.results.score,
        totalQuestions: quizState.results.totalQuestions
      };

      saveQuizAttempt(payload)
        .then(() => {
          setQuizState(prev => ({ ...prev, hasSavedAttempt: true }));
        })
        .catch((err) => {
          console.error('Failed to persist quiz attempt:', err);
        });
    }
  }, [quizState.isResultsOpen, quizState.results, quizState.quizConfig])

  const handleRestartQuiz = () => {
    setQuizState(prev => ({
      ...prev,
      isResultsOpen: false,
      isQuizActive: true,
      currentQuestionIndex: 0,
      answers: [],
      hasSavedAttempt: false
    }))
  }

  const handleCloseQuiz = () => {
    router.push('/study')
  }

  const fetchRelatedFlashcards = async () => {
    if (isLoadingFlashcards) return;
    
    setIsLoadingFlashcards(true);
    try {
      const topic = quizConfig.topic || 'this topic';
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Enhanced flashcards data with more details
      const sampleFlashcards = [
        { 
          id: 1, 
          question: `What is the main concept of ${topic}?`, 
          answer: `The main concept of ${topic} involves understanding its core principles and fundamental ideas. This includes the basic theories, definitions, and key concepts that form the foundation of ${topic}.`,
          details: [
            `Core principles and theories of ${topic}`,
            `Fundamental concepts and their relationships`,
            `Key terminology and definitions`,
            `Historical context and development`
          ],
          example: `For example, if ${topic} is 'Photosynthesis', the main concept would be the process by which green plants use sunlight to synthesize foods with carbon dioxide and water.`
        },
        { 
          id: 2, 
          question: `Key terms in ${topic}`, 
          answer: `Understanding the key terms in ${topic} is crucial for mastering the subject. These terms form the vocabulary of ${topic} and are essential for clear communication and comprehension.`,
          details: [
            `Technical terms and their precise definitions`,
            `Commonly used abbreviations and acronyms`,
            `Related terms and their connections`,
            `Terminology specific to different subfields of ${topic}`
          ],
          example: `In ${topic}, terms like '${topic} Theory', '${topic} Model', and '${topic} Principle' might be fundamental concepts that appear frequently.`
        },
        { 
          id: 3, 
          question: `Common misconceptions about ${topic}`, 
          answer: `There are several common misconceptions about ${topic} that can hinder proper understanding. Being aware of these can help in developing a more accurate and nuanced comprehension.`,
          details: [
            `Widely held but incorrect beliefs about ${topic}`,
            `Common errors in understanding key concepts`,
            `Oversimplifications that lead to misunderstandings`,
            `Myths and their factual corrections`
          ],
          example: `A common misconception might be that ${topic} is simpler than it actually is, when in reality it involves complex interactions between multiple factors.`
        },
      ];
      
      setFlashcards(sampleFlashcards);
      setShowFlashcards(true);
      setShowAnswer(false); // Reset showAnswer when loading new flashcards
    } catch (error) {
      console.error('Error fetching flashcards:', error);
      alert('Failed to load flashcards. Please try again.');
    } finally {
      setIsLoadingFlashcards(false);
    }
  }

// ...

  {showFlashcards && (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-xl"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">Related Flashcards</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full h-8 w-8 p-0"
          onClick={() => setShowFlashcards(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 -mr-2">
        {flashcards.map((card, index) => (
          <motion.div 
            key={card.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative"
          >
            <div className="bg-gray-700/50 hover:bg-gray-700/70 transition-colors p-5 rounded-lg border border-gray-600/50">
              <div className="font-medium text-gray-200 mb-2">{card.question}</div>
              <div className="text-sm text-gray-300">{card.answer}</div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                  onClick={() => {
                    // In a real app, this could mark the flashcard as learned or trigger a study mode
                    console.log('Flashcard action:', card.id);
                  }}
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
        
        <div className="mt-6 pt-4 border-t border-gray-700/50 flex justify-between items-center">
          <div className="text-sm text-gray-400">
            {flashcards.length} {flashcards.length === 1 ? 'flashcard' : 'flashcards'} available
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
            onClick={() => {
              setShowAllFlashcards(true);
              setCurrentCardIndex(0);
            }}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Study All
          </Button>
        </div>
        
        {showAllFlashcards && flashcards.length > 0 && (
          <Flashcard 
            card={flashcards[currentCardIndex]}
            currentIndex={currentCardIndex}
            totalCards={flashcards.length}
            onNext={() => {
              if (currentCardIndex < flashcards.length - 1) {
                setCurrentCardIndex(currentCardIndex + 1);
              }
            }}
            onPrev={() => {
              if (currentCardIndex > 0) {
                setCurrentCardIndex(currentCardIndex - 1);
              }
            }}
            onClose={() => setShowAllFlashcards(false)}
          />
        )}
      </div>
      </motion.div>
    )
  }

  // Show loading state while generating questions
  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-900 text-white flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="flex justify-center mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-blue-400">Crafting Your Quiz</h2>
          <p className="text-gray-300 mb-6">Generating {quizState.quizConfig.questionCount} {quizState.quizConfig.difficulty.toLowerCase()} questions about {quizState.quizConfig.topic || quizState.quizConfig.subject}...</p>
          <div className="w-full bg-gray-700/50 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full animate-pulse" style={{width: '70%'}}></div>
          </div>
          <p className="mt-4 text-sm text-gray-400">This usually takes 5-10 seconds</p>
        </div>
      </div>
    )
  }

  // Show quiz setup form with recommendations
  if (quizState.isSetupOpen) {
    const recommendedTopics = dashboardData?.recommendations || [];
    const recentQuizzes = dashboardData?.recentActivity || [];
    const subjectMastery = dashboardData?.subjectMastery || [];
    const userLevel = dashboardData?.progress?.level || 1;
    
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-900 text-white p-6 flex items-center justify-center">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Create New Quiz</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Level Badge */}
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <span className="font-bold">Level {userLevel}</span>
              </div>
            </div>
            
            {/* Recommended Topics */}
            {recommendedTopics.length > 0 && (
              <div className="space-y-2">
                <Label>Recommended For You</Label>
                <div className="grid grid-cols-1 gap-2">
                  {recommendedTopics.map((rec, index) => (
                    <Button 
                      key={index}
                      variant="outline"
                      className="justify-start text-left h-auto py-2"
                      onClick={() => {
                        setQuizState(prev => ({
                          ...prev,
                          quizConfig: {
                            ...prev.quizConfig,
                            subject: rec.subject,
                            topic: rec.topic,
                            difficulty: rec.difficulty
                          }
                        }));
                      }}
                    >
                      <div>
                        <p className="font-medium">{rec.topic}</p>
                        <p className="text-xs text-gray-400">{rec.subject} • {rec.difficulty}</p>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Recent Activity Section */}
            {recentQuizzes.length > 0 && (
              <div className="space-y-2">
                <Label>Recent Activity</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {recentQuizzes.map((quiz, index) => (
                    <div 
                      key={index}
                      className="p-3 bg-gray-700/50 rounded-lg border border-gray-600 hover:border-blue-500 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{quiz.topic || 'General'}</p>
                          <p className="text-xs text-gray-400">{quiz.subject} • {quiz.difficulty}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{quiz.score}/{quiz.total_questions}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(quiz.completed_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-1.5 mt-2">
                        <div 
                          className="h-1.5 rounded-full" 
                          style={{
                            width: `${quiz.percentage}%`,
                            backgroundColor: quiz.percentage >= 70 ? '#10B981' : 
                                           quiz.percentage >= 40 ? '#F59E0B' : '#EF4444'
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="border-t border-gray-700 my-4"></div>
            <form id="quiz-form" onSubmit={handleStartQuiz} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select name="subject" defaultValue="">
                  <SelectTrigger className="bg-gray-700 border-gray-600">
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="history">History</SelectItem>
                    <SelectItem value="mathematics">Mathematics</SelectItem>
                    <SelectItem value="programming">Programming</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="topic">Topic</Label>
                <Input 
                  id="topic" 
                  name="topic" 
                  placeholder="Enter a topic" 
                  className="bg-gray-700 border-gray-600"
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select name="difficulty" defaultValue="Medium">
                  <SelectTrigger className="bg-gray-700 border-gray-600">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                disabled={isLoading}
              >
                {isLoading ? 'Generating...' : 'Start Quiz'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show quiz questions
  if (quizState.isQuizActive && quizState.questions.length > 0) {
    const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
    const userAnswer = quizState.answers.find(a => a.questionId === currentQuestion.id)?.answer;
    
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-900 text-white p-6">
        <div className="max-w-3xl mx-auto">
          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-300">
                Question {quizState.currentQuestionIndex + 1} of {quizState.questions.length}
              </span>
              <span className="text-sm font-medium text-gray-400">
                {quizState.quizConfig.difficulty}
              </span>
            </div>
            <Progress 
              value={((quizState.currentQuestionIndex) / quizState.questions.length) * 100} 
              className="h-2 bg-gray-700"
            />
          </div>
          
          {/* Question card */}
          <Card className="bg-gray-800 border-gray-700 mb-6">
            <CardHeader>
              <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = userAnswer === option
                const isCorrect = index === currentQuestion.correctAnswer
                let buttonVariant = 'outline'
                
                if (userAnswer) {
                  if (isSelected) {
                    buttonVariant = isCorrect ? 'success' : 'destructive'
                  } else if (isCorrect) {
                    buttonVariant = 'success'
                  }
                }
                
                return (
                  <Button
                    key={index}
                    variant={buttonVariant}
                    className={`w-full justify-start h-auto py-3 px-4 text-left whitespace-normal ${
                      !userAnswer ? 'hover:bg-gray-700 border-gray-600' : ''
                    }`}
                    onClick={() => !userAnswer && handleAnswerQuestion(option)}
                    disabled={!!userAnswer}
                  >
                    <span className="font-mono mr-3 text-gray-400">{String.fromCharCode(65 + index)}.</span>
                    <span className="text-left">{option}</span>
                    {userAnswer && isSelected && (
                      <Check className="ml-auto h-5 w-5" />
                    )}
                  </Button>
                )
              })}
            </CardContent>
          </Card>
          
          {/* Navigation buttons */}
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => {
                setQuizState(prev => ({
                  ...prev,
                  currentQuestionIndex: Math.max(0, prev.currentQuestionIndex - 1)
                }))
              }}
              disabled={quizState.currentQuestionIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            {userAnswer && (
              <Button
                onClick={() => {
                  if (quizState.currentQuestionIndex < quizState.questions.length - 1) {
                    setQuizState(prev => ({
                      ...prev,
                      currentQuestionIndex: prev.currentQuestionIndex + 1
                    }))
                  } else {
                    // Submit quiz if this is the last question
                    const correctAnswers = quizState.answers.filter(a => a.isCorrect).length
                    const xpEarned = QUIZ_CONFIG.xpRewards[quizState.quizConfig.difficulty] || 100
                    
                    setQuizState(prev => ({
                      ...prev,
                      isQuizActive: false,
                      isResultsOpen: true,
                      results: {
                        score: correctAnswers,
                        totalQuestions: quizState.questions.length,
                        xpEarned,
                        incorrectAnswers: quizState.answers.filter(a => !a.isCorrect)
                      }
                    }))
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {quizState.currentQuestionIndex < quizState.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }
  
  // Show results
  if (quizState.isResultsOpen && quizState.results) {
    const { score, totalQuestions, xpEarned, incorrectAnswers } = quizState.results;
    const percentage = Math.round((score / totalQuestions) * 100);
    
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-900 text-white p-6 flex items-center justify-center">
        <Card className="w-full max-w-2xl bg-gray-800 border-gray-700">
          <CardHeader className="text-center">
            <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mb-4">
              <span className="text-3xl font-bold">{percentage}%</span>
            </div>
            <CardTitle className="text-2xl font-bold">
              {percentage >= 70 ? 'Great Job!' : 'Keep Practicing!'}
            </CardTitle>
            <p className="text-gray-400">
              You scored {score} out of {totalQuestions} questions correctly
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <p className="text-sm text-gray-400">Score</p>
                <p className="text-xl font-bold">{score}/{totalQuestions}</p>
              </div>
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <p className="text-sm text-gray-400">XP Earned</p>
                <p className="text-xl font-bold text-yellow-400">+{xpEarned}</p>
              </div>
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <p className="text-sm text-gray-400">Difficulty</p>
                <p className="text-xl font-bold">{quizState.quizConfig.difficulty}</p>
              </div>
            </div>
            
            {incorrectAnswers.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Review Incorrect Answers</h3>
                <div className="space-y-3">
                  {incorrectAnswers.map((item, index) => (
                    <div key={index} className="bg-gray-700/30 p-4 rounded-lg border border-red-500/20">
                      <p className="font-medium">{item.question}</p>
                      <p className="text-sm text-red-400 mt-1">
                        Your answer: {item.userAnswer}
                      </p>
                      <p className="text-sm text-green-400">
                        Correct answer: {item.correctAnswer}
                      </p>
                      {item.explanation && (
                        <p className="text-sm text-gray-400 mt-2">
                          <span className="font-medium">Explanation:</span> {item.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handleRestartQuiz}
              >
                <RotateCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={handleCloseQuiz}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Back to Study
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
}