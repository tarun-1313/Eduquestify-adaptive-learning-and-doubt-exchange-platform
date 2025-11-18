"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileQuestion, Plus } from "lucide-react"

export default function Assignments() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-300 to-emerald-300 text-transparent bg-clip-text mb-4">
          Assignments
        </h1>
        <p className="text-muted-foreground text-lg">
          Create and manage practice assignments for your students
        </p>
      </div>

      <Card className="bg-background/80 backdrop-blur-sm border-border/50">
        <CardContent className="p-12 text-center">
          <FileQuestion className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Assignments Feature</h3>
          <p className="text-muted-foreground mb-4">
            Create custom practice sets and assignments for your students. This feature is coming soon!
          </p>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Create Assignment
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
