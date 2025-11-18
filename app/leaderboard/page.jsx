"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  Trophy,
  Medal,
  Award,
  TrendingUp,
  Users,
  Target,
  Star,
  Clock,
  HelpCircle,
  BookOpen,
  Zap,
  Crown,
  ChevronUp,
  Info,
  Gift,
  Flame,
  Lightbulb,
  CheckCircle,
  Lock
} from "lucide-react"

export default function LeaderboardPage() {
  const [leaderboardData, setLeaderboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedView, setSelectedView] = useState('weekly')
  const [selectedPeriod, setSelectedPeriod] = useState('weekly')
  const [selectedSubject, setSelectedSubject] = useState('')

  useEffect(() => {
    fetchLeaderboardData()
  }, [selectedView, selectedPeriod, selectedSubject])

  const fetchLeaderboardData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        view: selectedView,
        period: selectedPeriod,
        ...(selectedSubject && { subject: selectedSubject }),
        userId: 'current-user' // In real app, get from auth context
      })

      const response = await fetch(`/api/leaderboard?${params}`)
      const data = await response.json()
      setLeaderboardData(data)
    } catch (error) {
      console.error('Error fetching leaderboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading leaderboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Blinking stars background */}
      <div className="stars-container absolute inset-0">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="star absolute bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 3 + 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-300 to-emerald-300 text-transparent bg-clip-text mb-4">
              Leaderboards & Achievements
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Track your progress, compete with peers, and celebrate achievements in your learning journey
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">

            {/* Main Content Area (Center) */}
            <div className="lg:col-span-4 space-y-8">

              {/* ## 1. Dynamic and Filterable Leaderboards */}
              <Card className="bg-background/80 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-primary" />
                    Dynamic Leaderboards
                  </CardTitle>
                  <CardDescription>
                    Multiple views to keep competition fresh and motivating
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                  {/* Filter Controls - Above Leaderboard */}
                  <div className="flex flex-wrap gap-4 justify-center">
                    <div className="flex gap-2">
                      <Button
                        variant={selectedPeriod === 'weekly' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedPeriod('weekly')}
                      >
                        Weekly
                      </Button>
                      <Button
                        variant={selectedPeriod === 'monthly' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedPeriod('monthly')}
                      >
                        Monthly
                      </Button>
                      <Button
                        variant={selectedView === 'overall' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedView('overall')}
                      >
                        All-Time
                      </Button>
                    </div>

                    <select
                      value={selectedView}
                      onChange={(e) => setSelectedView(e.target.value)}
                      className="px-3 py-2 border border-border rounded-md bg-background"
                    >
                      <option value="weekly">Overall XP</option>
                      <option value="subjects">Subject-Specific</option>
                      <option value="doubtHelpers">Top Helpers</option>
                    </select>

                    {selectedView === 'subjects' && (
                      <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="px-3 py-2 border border-border rounded-md bg-background"
                      >
                        <option value="">All Subjects</option>
                        <option value="Physics">Physics</option>
                        <option value="Mathematics">Mathematics</option>
                        <option value="Chemistry">Chemistry</option>
                        <option value="Biology">Biology</option>
                        <option value="History">History</option>
                      </select>
                    )}
                  </div>

                  {/* Top 3 Showcase */}
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    {leaderboardData?.leaderboard?.slice(0, 3).map((entry, index) => (
                      <div key={entry.user.id} className={`relative p-6 rounded-lg border-2 text-center ${
                        index === 0 ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20' :
                        index === 1 ? 'border-gray-400 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20' :
                        'border-amber-600 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20'
                      }`}>
                        <div className="text-center p-6">
                          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary text-2xl font-bold mb-3">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                          </div>
                          <Avatar className="h-16 w-16 mx-auto mb-3">
                            <AvatarImage src={entry?.user?.avatar || ''} />
                            <AvatarFallback>{(entry?.user?.name?.[0] || 'U').toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <h3 className="text-lg font-bold mb-1">{entry?.user?.name || 'Unknown User'}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{entry.user.level}</p>
                          <div className="text-xl font-bold">{entry.xp.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">XP</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Leaderboard Table */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-4 p-3 bg-muted/30 dark:bg-muted/10 rounded-lg font-medium text-sm text-foreground">
                      <div className="col-span-1 text-center font-semibold">Rank</div>
                      <div className="col-span-6 font-semibold">Player</div>
                      <div className="col-span-3 text-right font-semibold">XP</div>
                      <div className="col-span-2 text-right font-semibold">Weekly</div>
                    </div>

                    {leaderboardData?.leaderboard?.slice(3).map((entry) => (
                      <div
                        key={entry.user.id}
                        className={`grid grid-cols-12 gap-4 p-4 rounded-lg border items-center ${
                          entry.user.id === 8 ? 'border-primary bg-primary/5' : 'border-border'
                        }`}
                      >
                        <div className="col-span-1 text-center font-bold text-foreground dark:text-foreground/90">
                          #{entry.rank}
                        </div>
                        <div className="col-span-6 flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={entry?.user?.avatar || ''} />
                            <AvatarFallback>{(entry?.user?.name?.[0] || 'U').toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium flex items-center gap-2 text-foreground dark:text-foreground/90">
                              {entry.user.name}
                              {entry.user.id === 8 && <Badge variant="default" className="text-xs bg-primary/90 hover:bg-primary">You</Badge>}
                            </div>
                            <div className="text-sm text-muted-foreground dark:text-muted-foreground/80">{entry.user.level}</div>
                          </div>
                        </div>
                        <div className="col-span-3 text-right">
                          <div className="font-bold text-foreground dark:text-foreground/90">{entry.xp.toLocaleString()}</div>
                        </div>
                        <div className="col-span-2 text-right">
                          {entry.weeklyGain && (
                            <div className="font-medium text-green-600 dark:text-green-400">+{entry.weeklyGain}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ## 2. Right Sidebar (Personal Stats) */}
            <div className="lg:col-span-4">
              <div className="grid lg:grid-cols-4 gap-8">

                {/* Personal Stats - Main Focus */}
                <div className="lg:col-span-2">
                  <Card className="bg-background/80 backdrop-blur-sm border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        My Personal Stats
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-primary mb-1">
                          #{leaderboardData?.personalStats?.rank || '?'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Current Rank ({selectedPeriod})
                        </div>
                      </div>

                      {/* Next Rank Goal - Progress Bar */}
                      <div className="space-y-3">
                        <h4 className="font-medium">Next Rank Goal</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress to next rank</span>
                            <span>{leaderboardData?.personalStats?.nextRankTarget ? `${leaderboardData.personalStats.nextRankTarget} XP needed` : 'Keep earning!'}</span>
                          </div>
                          <Progress value={leaderboardData?.personalStats?.nextRankTarget ? 60 : 0} className="h-3" />
                          <div className="text-xs text-muted-foreground text-center">
                            {leaderboardData?.personalStats?.nextRankTarget
                              ? `Earn ${leaderboardData.personalStats.nextRankTarget} more XP to pass the next player!`
                              : 'Complete activities to see your next goal'
                            }
                          </div>
                        </div>
                      </div>

                      {/* Recent Achievements */}
                      <div className="space-y-3">
                        <h4 className="font-medium">Recent Achievements</h4>
                        <div className="space-y-2">
                          {leaderboardData?.personalStats?.recentAchievements?.slice(0, 3).map((achievement) => (
                            <div key={achievement.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                              <span className="text-xl">{achievement.icon}</span>
                              <div className="flex-1">
                                <div className="text-sm font-medium">{achievement.name}</div>
                                <div className="text-xs text-muted-foreground">{achievement.earnedAt}</div>
                              </div>
                              <Badge variant="default" className="text-xs">Earned</Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* How It Works Link */}
                      <div className="text-center pt-4 border-t">
                        <Button variant="outline" className="w-full">
                          <Info className="mr-2 h-4 w-4" />
                          ℹ️ How is XP calculated?
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Stats Overview */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="bg-background/80 backdrop-blur-sm border-border/50">
                    <CardHeader>
                      <CardTitle className="text-lg">Quick Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-muted/30 rounded-lg">
                          <div className="text-2xl font-bold text-primary">{leaderboardData?.personalStats?.xp || 0}</div>
                          <div className="text-xs text-muted-foreground">Total XP</div>
                        </div>
                        <div className="text-center p-3 bg-muted/30 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">+{leaderboardData?.personalStats?.weeklyGain || 0}</div>
                          <div className="text-xs text-muted-foreground">This Week</div>
                        </div>
                      </div>

                      {/* XP Breakdown */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">XP Sources</h4>
                        {leaderboardData?.personalStats?.xpBreakdown && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>Quizzes</span>
                              <span>{leaderboardData.personalStats.xpBreakdown.quizzes}%</span>
                            </div>
                            <Progress value={leaderboardData.personalStats.xpBreakdown.quizzes} className="h-1" />

                            <div className="flex justify-between text-xs">
                              <span>Flashcards</span>
                              <span>{leaderboardData.personalStats.xpBreakdown.flashcards}%</span>
                            </div>
                            <Progress value={leaderboardData.personalStats.xpBreakdown.flashcards} className="h-1" />

                            <div className="flex justify-between text-xs">
                              <span>Helping</span>
                              <span>{leaderboardData.personalStats.xpBreakdown.helping}%</span>
                            </div>
                            <Progress value={leaderboardData.personalStats.xpBreakdown.helping} className="h-1" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* ## 3. Full-Width Sections (Below Main Leaderboard) */}
            <div className="lg:col-span-4 space-y-8">

              {/* Hall of Fame */}
              <Card className="bg-background/80 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-6 w-6 text-primary" />
                    Hall of Fame
                  </CardTitle>
                  <CardDescription>
                    Past champions who dominated their respective periods
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Weekly Champions</h4>
                      {leaderboardData?.hallOfFame?.weeklyWinners?.slice(0, 5).map((winner, index) => (
                        <div key={winner.week} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                          <div className={`text-lg ${
                            index === 0 ? 'text-yellow-500' :
                            index === 1 ? 'text-gray-500' :
                            'text-amber-600'
                          }`}>
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                          </div>
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={winner.user.avatar} />
                            <AvatarFallback>{winner.user.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="font-medium">{winner.user.name}</div>
                            <div className="text-sm text-muted-foreground">Week {winner.week}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{winner.xp.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">XP</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Monthly Champions</h4>
                      {leaderboardData?.hallOfFame?.monthlyWinners?.slice(0, 3).map((winner, index) => (
                        <div key={winner.month} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                          <div className={`text-lg ${
                            index === 0 ? 'text-yellow-500' :
                            index === 1 ? 'text-gray-500' :
                            'text-amber-600'
                          }`}>
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                          </div>
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={winner.user.avatar} />
                            <AvatarFallback>{winner.user.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="font-medium">{winner.user.name}</div>
                            <div className="text-sm text-muted-foreground">{winner.month}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{winner.xp.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">XP</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Badge Collection - Full Width Grid */}
              <Card className="bg-background/80 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-6 w-6 text-primary" />
                    Badge Collection
                  </CardTitle>
                  <CardDescription>
                    Collect badges by completing challenges and reaching milestones
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {leaderboardData?.badges?.map((badge) => (
                      <div
                        key={badge.id}
                        className={`relative p-4 rounded-lg border text-center transition-all hover:scale-105 ${
                          badge.earned
                            ? 'border-primary bg-primary/5 hover:bg-primary/10'
                            : 'border-border bg-muted/20 opacity-60 hover:opacity-80'
                        }`}
                      >
                        <div className="text-3xl mb-2">{badge.icon}</div>
                        <div className="text-sm font-medium mb-1">{badge.name}</div>
                        <div className="text-xs text-muted-foreground mb-2 line-clamp-2">{badge.description}</div>

                        {badge.earned ? (
                          <div className="space-y-1">
                            <Badge variant="default" className="text-xs w-full">Earned</Badge>
                            {badge.earnedAt && (
                              <div className="text-xs text-muted-foreground">{badge.earnedAt}</div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {badge.progress !== undefined ? (
                              <>
                                <div className="text-xs text-muted-foreground">{badge.progress}%</div>
                                <Progress value={badge.progress} className="h-1" />
                              </>
                            ) : (
                              <Badge variant="outline" className="text-xs w-full">Locked</Badge>
                            )}
                          </div>
                        )}

                        {/* Tooltip for locked badges */}
                        {!badge.earned && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                            {badge.description}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
