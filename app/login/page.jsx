"use client"

import "@/styles/auth.css"
import Link from "next/link"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: "", password: "" })
  const [flipped, setFlipped] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error("Failed")
      const me = await fetch("/api/me")
      const data = await me.json()
      const role = data?.user?.role
      console.log("User role after login:", role)
      if (role === "Teacher") {
        console.log("Redirecting to /teacher")
        router.push("/teacher")
      } else {
        console.log("Redirecting to /student")
        router.push("/student")
      }
    } catch (err) {
      alert("Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-starfield">
      <main className="auth-stage">
        <div className="auth-card relative">
          <div className="auth-card-glow" aria-hidden />
          <div className={`auth-flip ${flipped ? "is-flipped" : ""}`}>
            {/* FRONT: Login */}
            <section className="auth-side front">
              <h1 className="text-2xl font-semibold mb-1 text-black-900">
                <span className="auth-type">Welcome back</span>
              </h1>
              <p className="text-sm text-black-600 mb-6">
                Continue your learning streak, earn XP, and climb the leaderboard.
              </p>
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-black-900">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="text-black-900 bg-white border-gray-300"
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="text-black-900">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="text-black-900 bg-white border-gray-300"
                  />
                </div>
                <Button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
              <div className="mt-4 flex items-center justify-between text-sm">
                <button
                  type="button"
                  className="underline text-black-600 hover:text-black-900"
                  onClick={() => setFlipped(true)}
                  aria-label="Open create account panel"
                >
                  New here? Create account
                </button>
                <Link href="/" className="underline text-black-600 hover:text-black-900">
                  Back to overview
                </Link>
              </div>
            </section>

            {/* BACK: Sign-up CTA */}
            <section className="auth-side back flex flex-col items-start justify-center">
              <h2 className="text-xl font-semibold mb-2 text-black-900">Join EduQuestify</h2>
              <p className="text-sm text-black-600 mb-6">
                Track topics, earn badges and XP, and get AI-generated practice questions.
              </p>
              <div className="flex gap-3">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700 px-4 py-2 text-white"
                >
                  Create account
                </Link>
                <button
                  className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-black-700 hover:bg-gray-50"
                  onClick={() => setFlipped(false)}
                >
                  Back to sign in
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
