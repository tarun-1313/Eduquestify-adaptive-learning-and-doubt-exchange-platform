"use client"

import { useEffect, useRef, useState } from "react"

export default function ChatPanel({ channel = "notes", currentUser }) {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState("")
  const [connected, setConnected] = useState(false)
  const listRef = useRef(null)

  useEffect(() => {
    const es = new EventSource(`/api/realtime/${channel}/stream`)
    es.onopen = () => setConnected(true)
    es.onerror = () => setConnected(false)
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        if (data?.type === "message") {
          setMessages((prev) => [...prev, data])
          queueMicrotask(() => {
            listRef.current?.scrollTo?.({ top: listRef.current.scrollHeight, behavior: "smooth" })
          })
        }
      } catch {}
    }
    return () => es.close()
  }, [channel])

  async function sendMessage() {
    const t = text.trim()
    if (!t) return
    setText("")
    const res = await fetch(`/api/realtime/${channel}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: t,
        user: {
          id: currentUser?.id || "anon",
          name: currentUser?.name || "Guest",
          role: currentUser?.role || "student",
        },
      }),
    })
    if (!res.ok) {
      // Revert text on failure
      setText(t)
    }
  }

  return (
    <div className="rounded-lg border bg-panel p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-pretty">
          {channel === "doubts" ? "Doubt Exchange (Live)" : "Notes Chat (Live)"}
        </h3>
        <div
          className={`px-2 py-1 text-xs rounded ${connected ? "bg-accent-success text-accent-success-foreground" : "bg-muted text-muted-foreground"}`}
        >
          {connected ? "Connected" : "Reconnecting"}
        </div>
      </div>

      <div ref={listRef} className="h-64 overflow-y-auto rounded-md bg-muted/40 p-3 space-y-2">
        {messages.map((m, i) => (
          <div key={i} className="flex gap-2 items-start group">
            <div
              className="h-8 w-8 flex-shrink-0 rounded-full bg-primary/15 grid place-items-center text-xs text-primary font-medium"
              aria-label={`Message from ${m.user?.name || "Guest"}`}
            >
              {(m.user?.name || "G")[0]}
            </div>
            <div className="max-w-[80%]">
              <div className="text-xs text-muted-foreground">
                {m.user?.name || "Guest"} • {new Date(m.ts).toLocaleTimeString()}
              </div>
              <div className="rounded-md bg-card px-3 py-2 border hover:shadow-sm transition-shadow">{m.text}</div>
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="text-sm text-muted-foreground">No messages yet. Be the first to start the discussion!</div>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          className="flex-1 rounded-md border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
          placeholder={`Write a ${channel === "doubts" ? "doubt" : "note"} message...`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => (e.key === "Enter" ? sendMessage() : null)}
          aria-label="Message input"
        />
        <button onClick={sendMessage} className="btn-primary" disabled={text.trim().length === 0}>
          Send
        </button>
      </div>
    </div>
  )
}
