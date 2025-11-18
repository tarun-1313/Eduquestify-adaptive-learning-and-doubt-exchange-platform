"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useEffect, useState, useRef, ReactNode } from "react"
import { Typewriter } from "@/components/ui/typewriter"
import { AnimateIn } from "@/components/ui/animate-in"
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion"
import ThemeToggle from "@/components/theme-toggle"
import { ThemeProvider } from "@/components/theme-provider"
import LiquidEther from "@/components/LiquidEther"

// Glow effect component
interface GlowCardProps {
  children: React.ReactNode
  className?: string
}

const GlowCard: React.FC<GlowCardProps> = ({ children, className = "" }: GlowCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const glowX = useMotionValue(0)
  const glowY = useMotionValue(0)
  const opacity = useMotionValue(0)

  useEffect(() => {
    if (isHovered) {
      glowX.set(mousePosition.x)
      glowY.set(mousePosition.y)
      opacity.set(1)
    } else {
      opacity.set(0)
    }
  }, [mousePosition, isHovered, glowX, glowY, opacity])

  const glowGradient = useTransform(
    [glowX, glowY],
    ([x, y]) => `radial-gradient(600px circle at ${x}px ${y}px, rgba(99, 102, 241, 0.15), transparent 50%)`
  )

  return (
    <div
      ref={cardRef}
      className={`relative group overflow-hidden rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: glowGradient,
          opacity,
          transition: "opacity 0.3s ease-out",
        }}
      />
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  )
}

type Star = {
  id: number
  left: string
  top: string
  size: string
  delay: string
  duration: string
}

const HomePage: React.FC = () => {
  const [stars, setStars] = useState<Star[]>([])

  useEffect(() => {
    // Generate stars on client side to avoid hydration mismatch
    const generatedStars = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: `${Math.random() * 3 + 1}px`,
      delay: `${Math.random() * 3}s`,
      duration: `${Math.random() * 3 + 2}s`,
    }))
    setStars(generatedStars)
  }, [])

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
        {/* LiquidEther background */}
        <div className="liquid-ether-background">
          <LiquidEther 
            mouseForce={15}
            cursorSize={120}
            isViscous={true}
            viscous={25}
            colors={['#3b82f6', '#8b5cf6', '#ec4899']}
            autoDemo={true}
            autoIntensity={1.8}
          />
        </div>
        
        {/* Blinking stars background (as subtle overlay) */}
        <div className="absolute inset-0 -z-10 opacity-40">
          {stars.map((star) => (
            <div
              key={star.id}
              className="absolute bg-foreground/80 rounded-full animate-pulse"
              style={{
                left: star.left,
                top: star.top,
                width: star.size,
                height: star.size,
                animationDelay: star.delay,
                animationDuration: star.duration,
              }}
              aria-hidden="true"
            />
          ))}
        </div>

        {/* Main Content */}
        <main className="relative z-10 container mx-auto px-4 py-12">
          {/* Hero section with relative positioning to appear above stars */}
          <div className="relative h-[40vh] md:h-[50vh] mb-12 rounded-lg overflow-hidden">
            {/* Full-bleed image */}
            <img
              src="/images/overview-hero.png"
              alt="A vibrant, abstract representation of a digital learning network with glowing nodes and connecting lines, symbolizing knowledge exchange."
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Subtle dark gradient for title readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/40" />
            <div className="absolute inset-0 flex items-center justify-center px-4 text-center">
              <AnimateIn direction="up" delay={0.3}>
                <h1 className="text-4xl md:text-6xl font-semibold tracking-wide bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text drop-shadow-[0_4px_18px_rgba(0,0,0,0.6)]">
                  <Typewriter
                    text={[
                      "EduQuestify Study Studio",
                      "Learn Without Limits",
                      "Education Reimagined",
                    ]}
                    speed={50}
                    delay={2000}
                    loop={true}
                  />
                </h1>
              </AnimateIn>
            </div>
          </div>

          <AnimateIn direction="up" delay={0.4}>
            <section className="mx-auto max-w-6xl px-4 py-16 bg-card rounded-lg shadow-lg my-8">
              <div className="hero p-6">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-4">
                    <h2 className="text-3xl md:text-4xl font-semibold text-balance">
                      <Typewriter
                        text={[
                          "Adaptive Learning & Knowledge Exchange",
                          "Personalized Education Journey",
                          "Smart Learning Platform",
                        ]}
                        speed={40}
                        delay={2000}
                        loop={true}
                      />
                    </h2>
                    <p className="text-muted-foreground text-pretty">
                      Build streaks, earn XP and coins, get personalized questions
                      and feedback, and collaborate with teachers and peers. Our
                      platform uses advanced AI algorithms to dynamically generate
                      questions tailored to your learning style and progress. You
                      can track your study progress on a daily basis, and earn
                      rewards for answering questions correctly. Our gamified
                      system promotes healthy competition and keeps you motivated
                      to achieve your learning goals.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Link href="/register">
                        <Button className="relative overflow-hidden group px-8 py-6 text-lg font-medium rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105">
                          <span className="relative z-10">Get Started</span>
                          <span className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                        </Button>
                      </Link>
                      <Link href="/login">
                        <Button variant="outline" className="relative overflow-hidden group px-8 py-6 text-lg font-medium rounded-xl border-2 border-blue-600 text-blue-600 hover:text-white hover:bg-blue-600 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105">
                          <span className="relative z-10">I already have an account</span>
                          <span className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div className="rounded-lg border p-6 card hover-raise mt-6 md:mt-10 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/10 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
                    <ul className="space-y-3">
                      {[
                        {
                          text: "AI-powered dynamic questions (MCQ/Short/Long by day)",
                          color: "from-purple-500 to-blue-500"
                        },
                        {
                          text: "Gamified streaks, XP, coins, and leaderboard",
                          color: "from-green-500 to-emerald-500"
                        },
                        {
                          text: "Teacher tools: notes → question bank",
                          color: "from-amber-500 to-orange-500"
                        },
                        {
                          text: "Notes & Doubt Exchange with upvotes and rewards",
                          color: "from-rose-500 to-pink-500"
                        },
                        {
                          text: "Optional SMS habit reminders",
                          color: "from-indigo-500 to-violet-500"
                        }
                      ].map((item, index) => (
                        <motion.li 
                          key={index}
                          className="flex items-start group"
                          whileHover={{ x: 5 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <span className={`w-2 h-2 mt-2 mr-3 rounded-full bg-gradient-to-r ${item.color} flex-shrink-0 transform group-hover:scale-125 transition-transform duration-300`}></span>
                          <span className="text-foreground/90 group-hover:text-foreground transition-colors duration-300">
                            {item.text}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                    <hr className="token-sep my-4" />
                    <div aria-label="study progress" className="progress-track">
                      <div
                        className="progress-fill"
                        style={{ width: "42%" }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature specifications with images */}
              <div className="mt-12 grid md:grid-cols-2 gap-6">
                <GlowCard className="hover:shadow-lg hover:shadow-purple-500/20">
                  <motion.article
                    className="p-6 h-full"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <motion.div
                        className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600"
                        animate={{
                          boxShadow: [
                            "0 0 0 0 rgba(139, 92, 246, 0.7)",
                            "0 0 0 10px rgba(139, 92, 246, 0)",
                            "0 0 0 0 rgba(139, 92, 246, 0)",
                          ],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                      <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent">
                        AI Question Generation
                      </h3>
                    </div>
                    <p className="mt-4 text-base text-muted-foreground leading-relaxed">
                      Generate topic‑aligned practice sets (MCQ, short, long) so
                      learners always study what matters most. Difficulty scales
                      day by day to gently raise the challenge curve while
                      preserving confidence. Each set includes hints and
                      explanations to close knowledge gaps, and adapts based on
                      recent results. Teachers can review, edit, and publish the
                      final questions to keep full academic control.
                    </p>
                    <img
                      src="/ai-question-generation-diagram.png"
                      alt="A flowchart illustrating how student notes are processed by an AI to generate multiple-choice, short, and long-answer questions."
                      className="mt-6 h-72 w-full object-cover rounded"
                    />
                  </motion.article>
                </GlowCard>

                <GlowCard className="hover:shadow-lg hover:shadow-blue-500/20">
                  <motion.article
                    className="p-6 h-full"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <motion.div
                        className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-600"
                        animate={{
                          boxShadow: [
                            "0 0 0 0 rgba(59, 130, 246, 0.7)",
                            "0 0 0 10px rgba(59, 130, 246, 0)",
                            "0 0 0 0 rgba(59, 130, 246, 0)",
                          ],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                      <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-500 to-cyan-600 bg-clip-text text-transparent">
                        Flashcards & Spaced Repetition
                      </h3>
                    </div>
                    <p className="mt-4 text-base text-muted-foreground leading-relaxed">
                      Convert any note or concept into spaced‑repetition flashcards
                      automatically, then schedule reviews at the right moment
                      before forgetting kicks in. Track ease, lapses, and mastery
                      with gentle reminders that fit your routine. Spend less time
                      organizing and more time learning with smart, bite‑sized
                      review sessions.
                    </p>
                    <img
                      src="/flashcards-and-spaced-repetition.png"
                      alt="A user interface showing digital flashcards for a biology topic, with a calendar icon indicating a future review date based on spaced repetition."
                      className="mt-6 h-72 w-full object-cover rounded"
                    />
                  </motion.article>
                </GlowCard>

                <GlowCard className="hover:shadow-lg hover:shadow-green-500/20">
                  <motion.article
                    className="p-6 h-full"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <motion.div
                        className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-600"
                        animate={{
                          boxShadow: [
                            "0 0 0 0 rgba(16, 185, 129, 0.7)",
                            "0 0 0 10px rgba(16, 185, 129, 0)",
                            "0 0 0 0 rgba(16, 185, 129, 0)",
                          ],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                      <h3 className="text-xl font-semibold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
                        Real-time Doubt Exchange
                      </h3>
                    </div>
                    <p className="mt-4 text-base text-muted-foreground leading-relaxed">
                      Ask doubts in real time and get help from classmates and
                      teachers within a focused, moderated space. Upvotes
                      highlight high‑quality responses so the best explanations
                      float to the top. Earn coins for being helpful, build
                      reputation over time, and turn resolved threads into
                      reusable Q&A resources for the class.
                    </p>
                    <img
                      src="/real-time-doubt-exchange-chat.png"
                      alt="A chat interface where a student asks a complex math question and receives a helpful, upvoted answer from a peer."
                      className="mt-6 h-72 w-full object-cover rounded"
                    />
                  </motion.article>
                </GlowCard>

                <GlowCard className="hover:shadow-lg hover:shadow-yellow-500/20">
                  <motion.article
                    className="p-6 h-full"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <motion.div
                        className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-500 to-amber-600"
                        animate={{
                          boxShadow: [
                            "0 0 0 0 rgba(234, 179, 8, 0.7)",
                            "0 0 0 10px rgba(234, 179, 8, 0)",
                            "0 0 0 0 rgba(234, 179, 8, 0)",
                          ],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                      <h3 className="text-xl font-semibold bg-gradient-to-r from-yellow-500 to-amber-600 bg-clip-text text-transparent">
                        Leaderboard, Badges & XP
                      </h3>
                    </div>
                    <p className="mt-4 text-base text-muted-foreground leading-relaxed">
                      Build positive study habits with gentle streaks, XP
                      progression, and collectible badges. Daily targets keep
                      tasks achievable, while leaderboards encourage friendly
                      competition across friends, classes, or schools. Progress
                      bars and milestones provide instant feedback so learners
                      always know what to do next.
                    </p>
                    <img
                      src="/leaderboard-badges-and-xp.png"
                      alt="A gamified dashboard displaying a leaderboard with student rankings, collectible badges like 'Streak Master', and a bright green experience points (XP) bar."
                      className="mt-6 h-72 w-full object-cover rounded"
                    />
                  </motion.article>
                </GlowCard>

                <GlowCard className="hover:shadow-lg hover:shadow-purple-500/20">
                  <motion.article
                    className="p-6 h-full"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <motion.div
                        className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600"
                        animate={{
                          boxShadow: [
                            "0 0 0 0 rgba(139, 92, 246, 0.7)",
                            "0 0 0 10px rgba(139, 92, 246, 0)",
                            "0 0 0 0 rgba(139, 92, 246, 0)",
                          ],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                      <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent">
                        AI-powered Learning Analytics
                      </h3>
                    </div>
                    <p className="mt-4 text-base text-muted-foreground leading-relaxed">
                      Get detailed insights into your learning progress with our
                      AI-powered analytics. Track your strengths, weaknesses, and
                      knowledge gaps to optimize your study sessions. Identify
                      areas where you need improvement and focus on those topics to
                      achieve your learning goals.
                    </p>
                    <img
                      src="/Learning-analytics.png"
                      alt="A dashboard displaying a student's learning progress, with charts and graphs showing their strengths, weaknesses, and knowledge gaps."
                      className="mt-6 h-72 w-full object-cover rounded"
                    />
                  </motion.article>
                </GlowCard>
              </div>

              {/* Teacher's Question Bank Section */}
              <div className="mt-16">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Teacher's Question Bank
                  </h2>
                  <p className="text-muted-foreground max-w-3xl mx-auto">
                    Create, manage, and share comprehensive question banks for your students with our powerful tools.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  {/* Upload Questions Card */}
                  <GlowCard className="hover:shadow-lg hover:shadow-blue-500/20">
                    <motion.div 
                      className="p-6 h-full flex flex-col"
                      whileHover={{ y: -5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                      <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold mb-3">Upload Questions</h3>
                      <p className="text-muted-foreground mb-4 flex-grow">
                        Easily upload questions in bulk using our templates or create them directly in our editor.
                      </p>
                      <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                        <li className="flex items-center">
                          <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Support for multiple question types
                        </li>
                        <li className="flex items-center">
                          <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Import from CSV/Excel
                        </li>
                        <li className="flex items-center">
                          <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Rich text formatting
                        </li>
                      </ul>
                      <Button className="mt-auto w-full" variant="outline">
                        Start Uploading
                      </Button>
                    </motion.div>
                  </GlowCard>

                  {/* Organize by Subject */}
                  <GlowCard className="hover:shadow-lg hover:shadow-purple-500/20">
                    <motion.div 
                      className="p-6 h-full flex flex-col"
                      whileHover={{ y: -5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                      <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold mb-3">Organize by Subject</h3>
                      <p className="text-muted-foreground mb-4 flex-grow">
                        Categorize your questions by subject, topic, and difficulty level for easy access and management.
                      </p>
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Mathematics</span>
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs">
                            250 Questions
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Science</span>
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-xs">
                            180 Questions
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">History</span>
                          <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-full text-xs">
                            120 Questions
                          </span>
                        </div>
                      </div>
                      <Button className="mt-auto w-full" variant="outline">
                        View All Subjects
                      </Button>
                    </motion.div>
                  </GlowCard>

                  {/* Share & Collaborate */}
                  <GlowCard className="hover:shadow-lg hover:shadow-rose-500/20">
                    <motion.div 
                      className="p-6 h-full flex flex-col"
                      whileHover={{ y: -5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                      <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold mb-3">Share & Collaborate</h3>
                      <p className="text-muted-foreground mb-4 flex-grow">
                        Collaborate with other teachers and share question banks across your institution.
                      </p>
                      <div className="flex -space-x-2 mb-4">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center text-xs font-medium">
                            {i === 4 ? '+5' : `T${i}`}
                          </div>
                        ))}
                      </div>
                      <Button className="mt-auto w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:opacity-90 transition-opacity">
                        Start Collaborating
                      </Button>
                    </motion.div>
                  </GlowCard>
                </div>

                {/* Additional Features */}
                <div className="mt-16 grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-2xl font-semibold mb-4">Advanced Analytics</h3>
                    <p className="text-muted-foreground mb-6">
                      Track question performance, student engagement, and learning outcomes with our comprehensive analytics dashboard.
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Question difficulty analysis</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Student performance tracking</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Automated progress reports</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-6 border border-border/50">
                    <div className="aspect-video bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg flex items-center justify-center">
                      <div className="text-center p-6">
                        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <h4 className="font-medium mb-1">Performance Dashboard</h4>
                        <p className="text-sm text-muted-foreground">Real-time insights and analytics</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </AnimateIn>

          {/* Quick Links / Secondary Features Section */}
          <div className="space-y-4 my-16">
            <h4 className="font-semibold text-2xl text-center mb-8">
              Core Platform Features
            </h4>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Personalized Learning",
                  description:
                    "Adaptive algorithms that tailor content to your learning style and pace.",
                  icon: "🎯",
                  color: "from-purple-500 to-indigo-600",
                  shadow: "hover:shadow-purple-500/20"
                },
                {
                  title: "Interactive Content",
                  description:
                    "Engaging lessons with quizzes, videos, and interactive exercises.",
                  icon: "✨",
                  color: "from-pink-500 to-rose-600",
                  shadow: "hover:shadow-pink-500/20"
                },
                {
                  title: "Track Progress",
                  description:
                    "Monitor your learning journey with detailed analytics and insights.",
                  icon: "📊",
                  color: "from-blue-500 to-cyan-600",
                  shadow: "hover:shadow-blue-500/20"
                },
              ].map((feature, index) => (
                <AnimateIn
                  key={feature.title}
                  direction="up"
                  delay={0.4 + index * 0.1}
                >
                  <GlowCard className={`hover:shadow-lg ${feature.shadow}`}>
                    <motion.div
                      className="p-6 h-full"
                      whileHover={{ y: -5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                      <div
                        className={`w-16 h-16 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center text-2xl mb-4`}
                      >
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground group-hover:text-foreground/90 transition-colors">
                        {feature.description}
                      </p>
                    </motion.div>
                  </GlowCard>
                </AnimateIn>
              ))}
            </div>
          </div>
        </main>

    </div>
  )
}

export default HomePage
