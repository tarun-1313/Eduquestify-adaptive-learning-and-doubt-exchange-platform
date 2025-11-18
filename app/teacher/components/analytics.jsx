"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Target, BookOpen, BarChart2, HelpCircle, Clock, PieChart } from "lucide-react"
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip,
  Pie,
  Cell,
  Legend
} from "recharts"

// A simple utility function to format names for avatars
const getInitials = (name) => {
  if (!name) return '?' // Guard against undefined names
  const names = name.split(' ')
  if (names.length === 1) return names[0][0]
  return `${names[0][0]}${names[names.length - 1][0]}`
}

// --- FIX APPLIED HERE ---
// We provide default empty arrays for props that are expected to be arrays.
// This prevents errors if the props are undefined (e.g., during data loading).
export default function Analytics({ questionBanks = [], doubts = [] }) {

  // --- Data Processing ---

  // 1. High-Level Stats
  const publishedBanks = questionBanks.filter(bank => bank.status === 'published')
  const totalStudents = publishedBanks.reduce((acc, bank) => acc + bank.studentCount, 0)
  const overallAvg = publishedBanks.length > 0
    ? Math.round(publishedBanks.reduce((acc, bank) => acc + bank.avgPerformance, 0) / publishedBanks.length)
    : 0
  
  // This line is now safe because 'doubts' will be [] instead of undefined
  const unsolvedDoubtsCount = doubts.filter(doubt => doubt.status === 'unsolved').length

  // 2. Bar Chart: Performance by Subject
  const subjectPerformance = publishedBanks.reduce((acc, bank) => {
    if (!acc[bank.subject]) {
      acc[bank.subject] = { scores: [], count: 0 }
    }
    acc[bank.subject].scores.push(bank.avgPerformance)
    acc[bank.subject].count += 1
    return acc
  }, {})

  const subjectChartData = Object.keys(subjectPerformance).map(subject => ({
    name: subject,
    AverageScore: subjectPerformance[subject].scores.length > 0 
      ? Math.round(subjectPerformance[subject].scores.reduce((a, b) => a + b, 0) / subjectPerformance[subject].scores.length)
      : 0 // Avoid division by zero
  }))

  // 3. Pie Chart: Bank Status
  const draftBanksCount = questionBanks.filter(bank => bank.status === 'draft').length
  const bankStatusData = [
    { name: "Published", value: publishedBanks.length },
    { name: "Drafts", value: draftBanksCount },
  ]
  const COLORS = ["#10b981", "#f59e0b"] // Green, Yellow

  // 4. Recent Doubts List
  // This block is also now safe
  const recentUnsolvedDoubts = doubts
    .filter(doubt => doubt.status === 'unsolved')
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) // Sort by most recent
    .slice(0, 5) // Get top 5

  // --- JSX Output ---

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-300 to-emerald-300 text-transparent bg-clip-text mb-4">
          Class Analytics
        </h1>
        <p className="text-muted-foreground text-lg">
          Data-driven insights into student performance and engagement.
        </p>
      </div>

      {/* 1. High-Level Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">Engaged in published banks</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published Banks</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedBanks.length}</div>
            <p className="text-xs text-muted-foreground">Out of {questionBanks.length} total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Average</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallAvg}%</div>
            <p className="text-xs text-muted-foreground">Across all published banks</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unsolved Doubts</CardTitle>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{unsolvedDoubtsCount}</div>
            <p className="text-xs text-muted-foreground">Require your attention</p>
          </CardContent>
        </Card>
      </div>

      {/* 2. Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-background/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle>Performance by Subject</CardTitle>
            <CardDescription>Average scores across all published question banks.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectChartData}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} unit="%" />
                <Tooltip 
                  cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }}
                  contentStyle={{ backgroundColor: 'black', border: 'none', borderRadius: '0.5rem' }} 
                />
                <Bar dataKey="AverageScore" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="bg-background/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle>Content Status</CardTitle>
            <CardDescription>Your current content pipeline.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bankStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {bankStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'black', border: 'none', borderRadius: '0.5rem' }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 3. Actionable Lists Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-background/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle>Recent Unsolved Doubts</CardTitle>
            <CardDescription>Top questions needing your review.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentUnsolvedDoubts.length > 0 ? recentUnsolvedDoubts.map(doubt => (
              <div key={doubt.id} className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-semibold">
                  {getInitials(doubt.student.name)}
                </div>
                <div className="flex-1">
                  <div className="font-medium truncate">{doubt.title}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <span>{doubt.student.name}</span>
                    <span className="text-xs flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {doubt.lastActivity}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">{doubt.replies}</div>
                  <div className="text-xs text-muted-foreground">replies</div>
                </div>
              </div>
            )) : (
              <p className="text-center text-muted-foreground py-4">No unsolved doubts. Great job!</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-background/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Topic Performance Highlights
            </CardTitle>
            <CardDescription>
              Actionable insights on specific topics.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="font-medium text-red-800 dark:text-red-200">Data Structures - Trees & Graphs</div>
                <div className="text-sm text-red-600 dark:text-red-300">Average score: 62% - Students are struggling with recursion. Add remedial modules.</div>
              </div>
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="font-medium text-yellow-800 dark:text-yellow-200">Operating Systems - Process Scheduling</div>
                <div className="text-sm text-yellow-600 dark:text-yellow-300">Average score: 74% - Good grasp of FCFS, but review SJF and Priority.</div>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="font-medium text-green-800 dark:text-green-200">DBMS - SQL Joins</div>
                <div className="text-sm text-green-600 dark:text-green-300">Average score: 88% - Excellent performance on INNER and LEFT joins!</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}