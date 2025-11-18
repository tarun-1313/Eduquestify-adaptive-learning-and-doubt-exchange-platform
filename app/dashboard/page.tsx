"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  Brain,
  MessageCircle,
  Target,
  Clock,
  Award,
  TrendingUp
} from 'lucide-react';
import {
  getActivityHistory,
  getActivityStats,
  initializeActivityStorage,
  type ActivityItem
} from '@/lib/activity-storage';

export default function DashboardPage() {
  const [activityStats, setActivityStats] = useState<any>(null);
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Initialize activity storage if needed
    initializeActivityStorage();
    
    // Load activity data
    const stats = getActivityStats();
    const history = getActivityHistory();
    
    setActivityStats(stats);
    setRecentActivities(stats.recentActivities);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-300 to-emerald-300 text-transparent bg-clip-text mb-4">
            Learning Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Track your progress across all learning activities
          </p>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="question-banks">Question Banks</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
            <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
            <TabsTrigger value="doubts">Doubts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-background/80 backdrop-blur-sm border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Target className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Average Quiz Score</p>
                      <p className="text-2xl font-bold">
                        {activityStats?.averageScore.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-background/80 backdrop-blur-sm border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <Brain className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Flashcards Reviewed</p>
                      <p className="text-2xl font-bold">{activityStats?.totalFlashcards}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-background/80 backdrop-blur-sm border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Question Banks Used</p>
                      <p className="text-2xl font-bold">{activityStats?.totalQuestionBanks}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-background/80 backdrop-blur-sm border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                      <MessageCircle className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Doubts Resolved</p>
                      <p className="text-2xl font-bold">{activityStats?.totalDoubts}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-background/80 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          {activity.type === 'quiz' && <Target className="h-4 w-4" />}
                          {activity.type === 'flashcard' && <Brain className="h-4 w-4" />}
                          {activity.type === 'question_bank' && <BookOpen className="h-4 w-4" />}
                          {activity.type === 'doubt' && <MessageCircle className="h-4 w-4" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium">{activity.title}</h4>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(activity.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {activity.type === 'quiz' && `Score: ${activity.details.score}%`}
                            {activity.type === 'flashcard' && `Cards reviewed: ${activity.details.cardsReviewed}`}
                            {activity.type === 'question_bank' && activity.details.topic}
                            {activity.type === 'doubt' && activity.details.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="question-banks" className="space-y-4">
            <Card className="bg-background/80 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Question Bank History</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {getActivityHistory().questionBanks.map((activity) => (
                      <div
                        key={activity.id}
                        className="p-4 bg-muted/30 rounded-lg space-y-2"
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">{activity.title}</h4>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(activity.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Subject: {activity.details.subject} • Topic: {activity.details.topic}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quizzes" className="space-y-4">
            <Card className="bg-background/80 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Quiz History</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {getActivityHistory().quizzes.map((activity) => (
                      <div
                        key={activity.id}
                        className="p-4 bg-muted/30 rounded-lg space-y-2"
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">{activity.title}</h4>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(activity.timestamp)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-muted-foreground">
                            Score: {activity.details.score}% • Questions: {activity.details.totalQuestions}
                          </p>
                          <div className="flex items-center gap-2">
                            {activity.details?.score !== undefined && activity.details.score >= 80 && (
                              <Award className="h-4 w-4 text-yellow-500" />
                            )}
                            {activity.details?.score !== undefined && activity.details.score >= 90 && (
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                        </div>
                        <Progress value={activity.details.score} className="h-2" />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="flashcards" className="space-y-4">
            <Card className="bg-background/80 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Flashcard History</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {getActivityHistory().flashcards.map((activity) => (
                      <div
                        key={activity.id}
                        className="p-4 bg-muted/30 rounded-lg space-y-2"
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">{activity.title}</h4>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(activity.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Cards Reviewed: {activity.details.cardsReviewed} / {activity.details.totalCards}
                        </p>
                        <Progress 
                          value={activity.details.cardsReviewed && activity.details.totalCards ? (activity.details.cardsReviewed / activity.details.totalCards) * 100 : 0}
                          className="h-2" 
                        />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="doubts" className="space-y-4">
            <Card className="bg-background/80 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Doubt History</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {getActivityHistory().doubts.map((activity) => (
                      <div
                        key={activity.id}
                        className="p-4 bg-muted/30 rounded-lg space-y-2"
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">{activity.title}</h4>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(activity.timestamp)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-muted-foreground">
                            Status: {activity.details.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}