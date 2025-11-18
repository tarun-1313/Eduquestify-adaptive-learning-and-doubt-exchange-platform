"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { BookOpen, Sparkles, ArrowRight } from 'lucide-react'
 

export default function FlashcardSetupPage() {
  const router = useRouter()
  const [subject, setSubject] = useState('')
  const [topic, setTopic] = useState('')
  const [flashcardCount, setFlashcardCount] = useState('10')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!subject.trim() || !topic.trim()) {
      alert('Please fill in both subject and topic fields')
      return
    }

    setIsLoading(true)
    
    try {
      // Navigate to the flashcard generation page with parameters
      const params = new URLSearchParams({
        subject: subject.trim(),
        topic: topic.trim(),
        count: flashcardCount
      }).toString()
      
      router.push(`/study/flashcards/review?${params}`)
    } catch (error) {
      console.error('Error navigating to flashcards:', error)
      alert('Failed to generate flashcards. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900/20 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Create Flashcards
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Generate personalized flashcards to boost your learning
          </p>
        </div>

        <Card className="border bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900 dark:text-white">
                Flashcard Setup
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Tell us what you want to learn and we'll create custom flashcards for you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="subject" className="text-gray-900 dark:text-white">
                      Subject
                    </Label>
                    <Input
                      id="subject"
                      placeholder="e.g., Mathematics, Biology, History"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="mt-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="topic" className="text-gray-900 dark:text-white">
                      Topic
                    </Label>
                    <Input
                      id="topic"
                      placeholder="e.g., Photosynthesis, World War II, Calculus"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="mt-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-gray-900 dark:text-white mb-3 block">
                      Number of Flashcards
                    </Label>
                    <RadioGroup value={flashcardCount} onValueChange={setFlashcardCount}>
                      <div className="grid grid-cols-3 gap-4">
                        {[5, 10, 15].map((count) => (
                          <div key={count}>
                            <RadioGroupItem
                              value={count.toString()}
                              id={`count-${count}`}
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor={`count-${count}`}
                              className="flex flex-col items-center justify-between rounded-md border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50 dark:peer-data-[state=checked]:bg-blue-900/20 [&:has([data-state=checked])]:border-blue-500 cursor-pointer transition-all"
                            >
                              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                {count}
                              </span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                flashcards
                              </span>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generating Flashcards...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate Flashcards
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
      </div>
    </div>
  )
}