"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export default function QuestionSession() {
  const [topic, setTopic] = useState("")
  const [level, setLevel] = useState("Class 10")
  const [loading, setLoading] = useState(false)
  const [output, setOutput] = useState("")

  async function run() {
    setLoading(true)
    setOutput("")
    try {
      const res = await fetch("/api/ai/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, level }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed")
      setOutput(`Type: ${json.type}\n\n${json.questions}`)
    } catch (e: any) {
      setOutput(`Error: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input placeholder="Topic (e.g., Photosynthesis)" value={topic} onChange={(e) => setTopic(e.target.value)} />
        <Input placeholder="Level (e.g., Class 10)" value={level} onChange={(e) => setLevel(e.target.value)} />
        <Button onClick={run} disabled={loading || !topic}>
          {loading ? "Generating..." : "Generate"}
        </Button>
      </div>
      <Textarea rows={16} value={output} readOnly />
    </div>
  )
}
