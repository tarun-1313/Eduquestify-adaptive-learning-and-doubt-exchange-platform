"use client"

import React from 'react'
import GooeyNav from './GooeyNav'
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
import Link from "next/link"

export default function GooeyNavbar() {
  const { user, isAuthenticated, isLoading, signOut } = useAuth();
  
  console.log('Navigation - isAuthenticated:', isAuthenticated);
  console.log('Navigation - user:', user);
  
  const isLoggedIn = Boolean(user && isAuthenticated);
  const userRole = user?.role;
  const guard = (path) => (isLoggedIn ? path : '/login?next=' + encodeURIComponent(path))
  
  // Determine dashboard path based on user role - handle different cases
  const dashboardPath = userRole === 'Teacher' || userRole === 'teacher' ? '/teacher' : '/student'

  // Navigation items for the gooey nav
  const navItems = [
    { label: 'Overview', href: '/', exact: true },
    { label: 'Study', href: '/study' },
    { label: 'Question Bank', href: '/question-bank', paths: ['/question-bank', '/teacher/question-bank'] },
    { label: 'Notes', href: '/notes' },
    { label: 'Doubt Exchange', href: '/doubts' },
    { label: 'Leaderboard', href: '/leaderboard' }
  ];

  if (isLoading) {
    return (
      <header className="border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="mx-auto max-w-6xl flex items-center justify-between p-4">
          <Link href="/" className="font-semibold text-foreground">
            EduQuestify
          </Link>
          <nav className="flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </nav>
        </div>
      </header>
    )
  }

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = '/login';  // Add redirect to login page
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="mx-auto max-w-6xl flex items-center justify-between p-4">
        <Link href="/" className="font-semibold text-foreground">
          EduQuestify
        </Link>

        <div className="flex items-center gap-4">
          {/* Gooey Navigation */}
          <GooeyNav 
            items={navItems}
            animationTime={500}
            particleCount={12}
            particleDistances={[80, 15]}
            particleR={80}
            timeVariance={250}
            colors={[1, 2, 3, 1, 2, 3]}
          />
          
          <ThemeToggle />
          
          {!isLoggedIn && (
            <>
              <Link href="/login" className="text-sm hover:underline text-foreground">
                Login
              </Link>
              <Link href="/register" className="text-sm hover:underline text-foreground">
                Register
              </Link>
            </>
          )}

          <span className="inline-block w-px h-5 bg-[var(--border)]" aria-hidden="true" />

          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Link href={guard(dashboardPath)} className="text-sm hover:underline text-foreground">
                Dashboard
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="rounded-full p-0 h-8 w-8">
                    <Avatar className="h-8 w-8">
                      <AvatarImage alt="User avatar" src="/diverse-user-avatars.png" />
                      <AvatarFallback>{user?.name?.[0] ?? 'U'}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage alt="User avatar" src="/diverse-user-avatars.png" />
                        <AvatarFallback>{user?.name?.[0] ?? 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{user?.name ?? 'Profile'}</span>
                        <span className="text-xs text-muted-foreground">{user?.email}</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link href={guard('/profile')} className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={guard('/settings')} className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}