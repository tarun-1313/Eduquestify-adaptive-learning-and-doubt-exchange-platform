"use client"

import { useEffect, useState } from "react"

/**
 * ThemeToggle Component
 *
 * A theme toggle button that switches between light and dark modes.
 * - Saves user preference to localStorage for persistence across sessions
 * - Respects system preference (prefers-color-scheme) if no saved preference exists
 * - Applies theme by toggling the 'dark' class on the document root element
 * - Uses inline SVGs for icons to avoid external dependencies
 * - Provides proper accessibility with dynamic aria-labels
 */
export default function ThemeToggle() {
  // Track if component is mounted to avoid hydration mismatch
  const [mounted, setMounted] = useState(false)
  // Current theme state
  const [theme, setTheme] = useState("light")

  useEffect(() => {
    // Mark as mounted to prevent hydration issues
    setMounted(true)

    try {
      // Check for saved theme in localStorage
      const stored = localStorage.getItem("theme")

      // Check system preference for dark mode
      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches

      // Determine initial theme (saved preference takes priority over system preference)
      const initial = stored || (prefersDark ? "dark" : "light")

      // Update state and apply theme class to document root
      setTheme(initial)
      document.documentElement.classList.toggle("dark", initial === "dark")
    } catch (error) {
      // Handle localStorage errors gracefully (e.g., in private browsing mode)
      console.warn("Failed to access localStorage for theme:", error)
    }
  }, [])

  /**
   * Toggles between light and dark themes
   * Updates state, applies theme class to document, and saves preference
   */
  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark"
    setTheme(next)

    // Apply theme by toggling dark class on html element (compatible with Tailwind CSS)
    document.documentElement.classList.toggle("dark", next === "dark")

    try {
      // Save user preference to localStorage for persistence
      localStorage.setItem("theme", next)
    } catch (error) {
      // Handle localStorage errors gracefully
      console.warn("Failed to save theme preference:", error)
    }
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) return null

  return (
    <button
      onClick={toggle}
      className="inline-flex items-center justify-center rounded-md p-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? (
        // Sun icon for dark mode (click to switch to light)
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      ) : (
        // Moon icon for light mode (click to switch to dark)
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  )
}
