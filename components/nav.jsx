"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import ThemeToggle from "@/components/theme-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Settings, LogOut } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function NavClient() {
  const router = useRouter()
  const { user, isAuthenticated, signOut, isLoading } = useAuth()

  // 3. ADD THIS LOADING BLOCK
  // This renders a placeholder *while* your auth hook is
  // checking the user's session.
  if (isLoading) {
    return (
      <header className="border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="mx-auto max-w-6xl flex items-center justify-between p-4">
          <Link href="/" className="font-semibold text-foreground">
            EduQuestify
          </Link>
          <nav className="flex items-center gap-4">
            {/* Show simple placeholders */}
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </nav>
        </div>
      </header>
    )
  }

  // Ensure correct logged-in check
  const isLoggedIn = Boolean(user && isAuthenticated)

  const userRole = user?.role
  const dashboardPath =
    userRole === "Teacher" || userRole === "teacher" ? "/teacher" : "/student"

  const guard = (path) =>
    isLoggedIn ? path : "/login?next=" + encodeURIComponent(path)

  // Handle logout + redirect
  const handleLogout = async () => {
    try {
      await signOut()
      router.push("/login")
    } catch (err) {
      console.error("Logout failed:", err)
    }
  }

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="mx-auto max-w-6xl flex items-center justify-between p-4">
        <Link href="/" className="font-semibold text-foreground">
          EduQuestify
        </Link>

        <nav className="flex items-center gap-4">
          <Link href="/" className="text-sm hover:underline text-foreground">
            Overview
          </Link>
          <Link href="/study" className="text-sm hover:underline text-foreground">
            Study
          </Link>
          <Link href="/question-bank" className="text-sm hover:underline text-foreground">
            Question Bank
          </Link>
          <Link href="/notes" className="text-sm hover:underline text-foreground">
            Notes
          </Link>
          <Link href="/doubts" className="text-sm hover:underline text-foreground">
            Doubt Exchange
          </Link>
          <Link href="/leaderboard" className="text-sm hover:underline text-foreground">
            Leaderboard
          </Link>
          <Link href="/question-bank/download-analytics" className="text-sm hover:underline text-foreground">
            Analytics
          </Link>
          <ThemeToggle />

          {/* Show Login/Register only if NOT logged in */}
          {!isLoggedIn ? (
            <>
              <Link href="/login" className="text-sm hover:underline text-foreground">
                Login
              </Link>
              <Link href="/register" className="text-sm hover:underline text-foreground">
                Register
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href={guard(dashboardPath)}
                className="text-sm hover:underline text-foreground"
              >
                Dashboard
              </Link>

              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full p-0"
                    aria-label="Profile menu"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        alt="User avatar"
                        src="/diverse-user-avatars.png"
                      />
                      <AvatarFallback>
                        {user?.name?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.name || "User"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/profile"
                        className="flex items-center cursor-pointer"
                      >
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/profile#settings"
                        className="flex items-center cursor-pointer"
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}