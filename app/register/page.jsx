"use client"

import "@/styles/auth.css"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "Student",
  })
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phone: false,
    password: false
  })

  function validateForm() {
    if (!form.name.trim()) return 'Name is required'
    if (!form.email.trim()) return 'Email is required'
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Please enter a valid email'
    if (!form.password) return 'Password is required'
    if (form.password.length < 8) return 'Password must be at least 8 characters'
    if (form.phone && !/^\+?[0-9\s-]{10,}$/.test(form.phone)) return 'Please enter a valid phone number'
    return ''
  }

  async function onSubmit(e) {
    e.preventDefault()
    
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          phone: form.phone || undefined, // Don't send empty phone
        }),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed. Please try again.')
      }
      
      // Redirect to dashboard after successful registration
      router.push('/dashboard')
      
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
      console.error('Registration error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-starfield">
      <main className="auth-stage">
        <div className="auth-card">
          {/* Left column - Illustration */}
          <div className="auth-illustration">
            <img 
              src="/register.png" 
              alt="Registration illustration" 
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
          
          {/* Right column - Form */}
          <div className="auth-form-section">
            <div className="auth-branding">
              <h1 className="text-black-900">Join EduQuestify</h1>
              <p className="subtitle text-black-600">Start your learning journey today</p>
            </div>
            
            <div className="auth-main-heading">
              <h2 className="text-black-900">Create your account</h2>
            </div>
            
            <form onSubmit={onSubmit} className="auth-form">
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <div className="auth-form-group">
                <Label htmlFor="name" className="text-black-900">Full Name *</Label>
                <Input 
                  id="name" 
                  value={form.name} 
                  onChange={(e) => {
                    setForm({ ...form, name: e.target.value })
                    setTouched({ ...touched, name: true })
                  }}
                  onBlur={() => setTouched({ ...touched, name: true })}
                  placeholder="Enter your full name"
                  className={`${touched.name && !form.name.trim() ? 'border-red-500' : ''} text-black-900 bg-white border-gray-300`}
                  disabled={loading}
                />
                {touched.name && !form.name.trim() && (
                  <p className="mt-1 text-sm text-red-600">Name is required</p>
                )}
              </div>
              
              <div className="auth-form-group">
                <Label htmlFor="email" className="text-black-900">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => {
                    setForm({ ...form, email: e.target.value })
                    setTouched({ ...touched, email: true })
                  }}
                  onBlur={() => setTouched({ ...touched, email: true })}
                  placeholder="Enter your email"
                  className={`${touched.email && !/\S+@\S+\.\S+/.test(form.email) ? 'border-red-500' : ''} text-black-900 bg-white border-gray-300`}
                  disabled={loading}
                />
                {touched.email && !form.email.trim() ? (
                  <p className="mt-1 text-sm text-red-600">Email is required</p>
                ) : touched.email && !/\S+@\S+\.\S+/.test(form.email) ? (
                  <p className="mt-1 text-sm text-red-600">Please enter a valid email</p>
                ) : null}
              </div>
              
              <div className="auth-form-group">
                <Label htmlFor="phone" className="text-black-900">Phone Number (Optional)</Label>
                <Input 
                  id="phone" 
                  value={form.phone} 
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  onBlur={() => setTouched({ ...touched, phone: true })}
                  placeholder="Enter your phone number"
                  className={`${touched.phone && form.phone && !/^\+?[0-9\s-]{10,}$/.test(form.phone) ? 'border-red-500' : ''} text-black-900 bg-white border-gray-300`}
                  disabled={loading}
                />
                {touched.phone && form.phone && !/^\+?[0-9\s-]{10,}$/.test(form.phone) && (
                  <p className="mt-1 text-sm text-red-600">Please enter a valid phone number</p>
                )}
              </div>
              
              <div className="auth-form-group">
                <Label htmlFor="password" className="text-black-900">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => {
                    setForm({ ...form, password: e.target.value })
                    setTouched({ ...touched, password: true })
                  }}
                  onBlur={() => setTouched({ ...touched, password: true })}
                  placeholder="Create a strong password (min 8 characters)"
                  className={`${touched.password && form.password.length < 8 ? 'border-red-500' : ''} text-black-900 bg-white border-gray-300`}
                  disabled={loading}
                />
                {touched.password && form.password.length < 8 && (
                  <p className="mt-1 text-sm text-red-600">Password must be at least 8 characters</p>
                )}
              </div>
              
              <div className="auth-form-group">
                <Label className="text-black-900">Account Type</Label>
                <Select 
                  value={form.role} 
                  onValueChange={(v) => setForm({ ...form, role: v })}
                  disabled={loading}
                >
                  <SelectTrigger className="text-black-900 bg-white border-gray-300">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent className="text-black-900 bg-white border-gray-300">
                    <SelectItem value="Student" className="hover:bg-gray-100">Student</SelectItem>
                    <SelectItem value="Teacher" className="hover:bg-gray-100">Teacher</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <button 
                type="submit" 
                disabled={loading || !form.name || !form.email || !form.password || form.password.length < 8} 
                className="auth-submit-button bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>

              <div className="auth-secondary-links text-black-600">
                Already have an account? <Link href="/login" className="text-blue-600 hover:text-blue-800">Sign in</Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
