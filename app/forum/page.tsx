"use client"

import useSWR from "swr"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function ForumPage() {
  const { data, mutate } = useSWR("/api/forum/posts", fetcher)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [answer, setAnswer] = useState<Record<number, string>>({})

  async function createPost() {
    const res = await fetch("/api/forum/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body }),
    })
    if (res.ok) {
      setTitle("")
      setBody("")
      mutate()
    } else {
      alert("Create post failed")
    }
  }

  async function addAnswer(postId: number) {
    const res = await fetch("/api/answers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, body: answer[postId] }),
    })
    if (res.ok) {
      setAnswer((s) => ({ ...s, [postId]: "" }))
      mutate()
    } else {
      alert("Answer failed")
    }
  }

  async function vote(targetType: "post" | "answer", targetId: number, value: 1 | -1, authorId: number) {
    await fetch("/api/forum/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetType, targetId, value, authorId }),
    })
    mutate()
  }

  const posts = data?.posts || []

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Notes & Doubt Exchange</h1>

      <div className="rounded-lg border p-4 space-y-3">
        <Input placeholder="Question title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea
          rows={5}
          placeholder="Describe your doubt..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <Button onClick={createPost} disabled={!title || !body}>
          Post
        </Button>
      </div>

      <div className="space-y-4">
        {posts.map((p: any) => (
          <div key={p.id} className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{p.title}</h3>
                <p className="text-sm text-muted-foreground">by {p.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => vote("post", p.id, 1, p.user_id)}>
                  ▲
                </Button>
                <span className="text-sm">{p.votes || 0}</span>
                <Button size="sm" variant="outline" onClick={() => vote("post", p.id, -1, p.user_id)}>
                  ▼
                </Button>
              </div>
            </div>
            <p className="mt-2 text-sm">{p.body}</p>
            <div className="mt-3 flex gap-2">
              <Input
                placeholder="Write an answer..."
                value={answer[p.id] || ""}
                onChange={(e) => setAnswer({ ...answer, [p.id]: e.target.value })}
              />
              <Button onClick={() => addAnswer(p.id)} disabled={!answer[p.id]}>
                Answer
              </Button>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
