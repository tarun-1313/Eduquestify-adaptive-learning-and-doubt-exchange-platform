"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  BookOpen,
  Eye,
  Edit,
  Trash2,
  Globe,
  Lock,
  Search
} from "lucide-react"

const subjects = [
  "Mathematics", "Physics", "Chemistry", "Biology", "History", "Geography",
  "Literature", "Computer Science", "Economics", "Psychology"
]

export default function QuestionBanks({
  questionBanks,
  searchTerm,
  setSearchTerm,
  selectedSubject,
  setSelectedSubject,
  selectedStatus,
  setSelectedStatus,
  handleTogglePublish,
  handleDeleteBank,
  setActiveTab
}) {
  const filteredBanks = questionBanks.filter(bank => {
    const matchesSearch = bank.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bank.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = selectedSubject === "all" || bank.subject === selectedSubject
    const matchesStatus = selectedStatus === "all" || bank.status === selectedStatus
    return matchesSearch && matchesSubject && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-300 to-emerald-300 text-transparent bg-clip-text mb-4">
            My Question Banks
          </h1>
          <p className="text-muted-foreground text-lg">
            Create and manage your official question banks for students
          </p>
        </div>
        <Button onClick={() => setActiveTab("create")}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Bank
        </Button>
      </div>

      {/* Search and Filter Controls */}
      <Card className="bg-background/80 backdrop-blur-sm border-border/50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search question banks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map(subject => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Question Banks Grid */}
      <div className="grid gap-6">
        {filteredBanks.map((bank) => (
          <Card key={bank.id} className="bg-background/80 backdrop-blur-sm border-border/50">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-xl font-semibold">{bank.title}</h3>
                    <Badge variant={bank.status === 'published' ? 'default' : 'secondary'}>
                      {bank.status === 'published' ? (
                        <div className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          Published
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Lock className="h-3 w-3" />
                          Draft
                        </div>
                      )}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                    <span>{bank.subject} • {bank.topic}</span>
                    <span>{bank.questionCount} questions</span>
                    <span>Modified: {bank.lastModified}</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-1" />
                    Manage
                  </Button>
                  <Button
                    size="sm"
                    variant={bank.status === 'published' ? 'secondary' : 'default'}
                    onClick={() => handleTogglePublish(bank.id)}
                  >
                    {bank.status === 'published' ? 'Unpublish' : 'Publish'}
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteBank(bank.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {bank.status === 'published' && (
                <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{bank.studentCount}</div>
                    <div className="text-xs text-muted-foreground">Students Using</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">{bank.avgPerformance}%</div>
                    <div className="text-xs text-muted-foreground">Avg Performance</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">{bank.questionCount}</div>
                    <div className="text-xs text-muted-foreground">Questions</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBanks.length === 0 && (
        <Card className="bg-background/80 backdrop-blur-sm border-border/50">
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No question banks found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedSubject !== "all" || selectedStatus !== "all"
                ? "Try adjusting your filters"
                : "Create your first question bank to get started"}
            </p>
            <Button onClick={() => setActiveTab("create")}>
              <Plus className="h-4 w-4 mr-2" />
              Create Question Bank
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
