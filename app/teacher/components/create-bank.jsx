"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"

const subjects = [
  "Mathematics", "Physics", "Chemistry", "Biology", "History", "Geography",
  "Literature", "Computer Science", "Economics", "Psychology"
]

export default function CreateBank({
  newBankForm,
  setNewBankForm,
  handleCreateBank,
  setActiveTab
}) {
  return (
    <Card className="bg-background/80 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Plus className="h-6 w-6 text-primary" />
          Create New Question Bank
        </CardTitle>
        <CardDescription>
          Set up a new question bank for your students
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="title">Bank Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Physics - Newton's Laws of Motion"
              value={newBankForm.title}
              onChange={(e) => setNewBankForm(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Select value={newBankForm.subject} onValueChange={(value) => setNewBankForm(prev => ({ ...prev, subject: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map(subject => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="topic">Topic *</Label>
            <Input
              id="topic"
              placeholder="e.g., Kinematics, Cell Structure"
              value={newBankForm.topic}
              onChange={(e) => setNewBankForm(prev => ({ ...prev, topic: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Brief description of what this question bank covers..."
              value={newBankForm.description}
              onChange={(e) => setNewBankForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleCreateBank} className="flex-1">
            <Plus className="h-4 w-4 mr-2" />
            Create Question Bank
          </Button>
          <Button variant="outline" onClick={() => setActiveTab("banks")}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
