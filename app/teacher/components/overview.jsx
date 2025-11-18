"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BookOpenCheck,
  MessageCircle,
  BarChart3,
  Users,
  Target,
  Sparkles,
  Info
} from "lucide-react"

export default function Overview({ setActiveTab }) {
  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-300 to-emerald-300 text-transparent bg-clip-text mb-4">
          Teacher Portal Overview
        </h1>
        <p className="text-muted-foreground text-lg">
          Your comprehensive guide to the EduQuestify teaching platform
        </p>
      </div>

      {/* Hero Section */}
      <Card className="bg-gradient-to-r from-sky-50 to-emerald-50 dark:from-sky-950/30 dark:to-emerald-950/30 border-border/50">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Your New Teaching Command Center</h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-3xl mx-auto">
              Save Time, Get Actionable Insights, and Directly Support Your Students.
            </p>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Welcome to the EduQuestify Teacher Portal! This platform is designed to supercharge your teaching by automating content creation and providing a direct, real-time connection to your students' learning journey.
            </p>
          </div>

          {/* Key Benefits */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-sky-100 dark:bg-sky-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Sparkles className="h-6 w-6 text-sky-600" />
              </div>
              <h3 className="font-semibold mb-2">AI-Powered Content Creation</h3>
              <p className="text-sm text-muted-foreground">Generate high-quality questions from your lecture notes</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold mb-2">Real-Time Student Support</h3>
              <p className="text-sm text-muted-foreground">Join live discussions and provide immediate guidance</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Data-Driven Performance Analytics</h3>
              <p className="text-sm text-muted-foreground">Track progress and identify areas for improvement</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Specifications */}
      <div className="grid gap-8">
        <Card className="bg-background/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpenCheck className="h-5 w-5 text-primary" />
              Effortless Content Creation: The Question Bank
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Stop spending hours writing practice questions. Simply upload your lecture notes, and our AI assistant will generate a draft of relevant MCQs and short-answer questions. You can also add your own questions, edit anything you like, and then publish the entire bank for your students with one click.
            </p>
            <Button onClick={() => setActiveTab("banks")}>
              Go to My Question Banks
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-background/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Direct Student Mentorship: The Doubt Exchange Hub
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              See where your students are getting stuck in real-time. From your dashboard, you can view all active doubts, filter for urgent questions, and join any live chat session to provide guidance. Your answers are highlighted, and you have the unique ability to mark a response as the 'Teacher Verified Solution,' creating a trusted resource for the whole class.
            </p>
            <Button onClick={() => setActiveTab("doubts")}>
              Go to the Doubt Exchange
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-background/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Actionable Performance Insights: Class Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Move beyond traditional grading. Our analytics dashboard shows you exactly how students are performing on the questions you create. Instantly identify which topics the entire class is struggling with, track individual student progress, and make data-informed decisions about what to review in your next lesson.
            </p>
            <Button onClick={() => setActiveTab("analytics")}>
              View Class Analytics
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Collaborative Workflow */}
      <Card className="bg-background/80 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl">The Teacher-Student Feedback Loop</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            EduQuestify creates a powerful feedback loop. You Create & Curate high-quality content. Your Students Practice with it. Their performance generates Data That Flows Back to you. You then use these insights to Refine Your Teaching and provide targeted support where it's needed most.
          </p>

          <div className="grid md:grid-cols-4 gap-4 text-center">
            <div className="p-4">
              <div className="w-12 h-12 bg-sky-100 dark:bg-sky-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpenCheck className="h-6 w-6 text-sky-600" />
              </div>
              <h4 className="font-semibold mb-1">Create & Curate</h4>
              <p className="text-sm text-muted-foreground">High-quality content</p>
            </div>
            <div className="p-4">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
              <h4 className="font-semibold mb-1">Students Practice</h4>
              <p className="text-sm text-muted-foreground">With your content</p>
            </div>
            <div className="p-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-semibold mb-1">Data Flows Back</h4>
              <p className="text-sm text-muted-foreground">Performance insights</p>
            </div>
            <div className="p-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
              <h4 className="font-semibold mb-1">Refine Teaching</h4>
              <p className="text-sm text-muted-foreground">Targeted support</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Final CTA */}
      <Card className="bg-gradient-to-r from-sky-50 to-emerald-50 dark:from-sky-950/30 dark:to-emerald-950/30 border-border/50">
        <CardContent className="p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Teaching?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join thousands of educators who are already saving time and improving student outcomes with EduQuestify.
          </p>
          <Button size="lg" onClick={() => setActiveTab("dashboard")}>
            Go to My Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
