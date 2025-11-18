"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  User,
  Settings,
  Shield,
  BookOpen,
  Trophy,
  Target,
  Bell,
  Eye,
  EyeOff,
  Camera,
  Save,
  Key,
  Smartphone,
  Mail,
  Lock,
  CheckCircle,
  AlertCircle,
  Star,
  TrendingUp,
  Award,
  Calendar,
  Clock,
  Users
} from "lucide-react"

// Mock profile data
const mockProfileData = {
  user: {
    id: 1,
    name: "Tarun",
    email: "Tarun@student.eduquestify.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tarun&backgroundColor=b6e3f4", // Default avatar
    bio: "Passionate about physics and mathematics. Love helping others understand complex concepts through simple explanations.",
    level: 12,
    joinDate: "2023-09-15",
    role: "Student",
    location: "India",
    emailVerified: true
  },
  stats: {
    totalXP: 15420,
    currentLevel: 12,
    nextLevelXP: 18000,
    levelProgress: 85,
    totalStudyTime: 247,
    questionsAnswered: 1247,
    doubtsSolved: 45,
    streak: 23,
    accuracy: 78,
    subjects: {
      OperatingSystem : 85,
      DataStructures: 75,
      DBMS: 60,
      OS: 45,
      CAO: 70,
      SE: 55
    }
  },
  achievements: [
    {
      id: 1,
      name: "DBMS Master",
      description: "Achieved 90%+ mastery in DBMS",
      icon: "⚛️",
      earnedAt: "2024-01-15",
      rarity: "legendary"
    },
    {
      id: 2,
      name: "Study Streak",
      description: "Maintained a 30-day study streak",
      icon: "🔥",
      earnedAt: "2024-01-10",
      rarity: "epic"
    },
    {
      id: 3,
      name: "Community Helper",
      description: "Helped 50+ students with their doubts",
      icon: "🤝",
      earnedAt: "2024-01-05",
      rarity: "rare"
    },
    {
      id: 4,
      name: "Quiz Champion",
      description: "Scored 100% on 25 quizzes",
      icon: "🏆",
      earnedAt: "2023-12-28",
      rarity: "epic"
    }
  ],
  preferences: {
    notifications: {
      email: true,
      push: true,
      achievements: true,
      studyReminders: true,
      communityUpdates: false
    },
    privacy: {
      showProfile: true,
      showStats: true,
      showAchievements: true,
      allowMessages: true
    },
    study: {
      preferredSubjects: ["TOC", "DBMS"],
      learningStyle: "visual",
      studyTime: "evening",
      notifications: true
    }
  },
  security: {
    twoFactorEnabled: false,
    lastPasswordChange: "2024-01-01",
    loginDevices: [
      { name: "Chrome on Windows", location: "Maharashtra ,India", lastSeen: "2 hours ago" },
      { name: "Safari on iPhone", location: "Maharashtra , India", lastSeen: "1 day ago" }
    ]
  }
}

import { useAuth } from "@/hooks/auth-context"

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  // Use real user data if authenticated, otherwise fallback to mockProfileData
  const profileUser = isAuthenticated && user ? user : mockProfileData.user;
  const [profileData, setProfileData] = useState({ ...mockProfileData, user: profileUser });
  const [activeTab, setActiveTab] = useState("overview")
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: profileData.user.name,
    email: profileData.user.email,
    bio: profileData.user.bio,
    location: profileData.user.location,
    avatar: profileData.user.avatar
  })

  const [emailChangePending, setEmailChangePending] = useState(false)
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(profileData.user.avatar)

  const handleSaveProfile = () => {
    // In real app, save to API
    if (editForm.email !== profileData.user.email) {
      // Email changed - require verification
      setEmailChangePending(true)
      // In real app, send verification email
    } else {
      // Handle avatar upload if there's a new file
      if (avatarFile) {
        // For demo purposes, we'll use a placeholder avatar service
        // In real app, upload file to server and get URL
        const savedAvatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileData.user.name}-${Date.now()}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`
        updateFavicon(savedAvatarUrl)
        setProfileData(prev => ({
          ...prev,
          user: { ...prev.user, ...editForm, avatar: savedAvatarUrl }
        }))
        setAvatarPreview(savedAvatarUrl)
      } else {
        setProfileData(prev => ({
          ...prev,
          user: { ...prev.user, ...editForm }
        }))
      }
      setIsEditing(false)
      setAvatarFile(null)
      // Reset preview to the current avatar URL
      setAvatarPreview(profileData.user.avatar)
    }
  }

  const handleAvatarChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }

      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target.result)
        setEditForm(prev => ({ ...prev, avatar: e.target.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const updateFavicon = (avatarUrl) => {
    // Update favicon with user's avatar
    const favicon = document.querySelector('link[rel="icon"]')
    if (favicon) {
      favicon.href = avatarUrl
    } else {
      // Create favicon link if it doesn't exist
      const link = document.createElement('link')
      link.rel = 'icon'
      link.href = avatarUrl
      document.head.appendChild(link)
    }
  }

  const handleEmailVerification = () => {
    // In real app, verify the email change
    setProfileData(prev => ({
      ...prev,
      user: { ...prev.user, ...editForm, emailVerified: true }
    }))
    setEmailChangePending(false)
    setIsEditing(false)
  }

  const handlePreferenceChange = (section, key, value) => {
    setProfileData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [section]: {
          ...prev.preferences[section],
          [key]: value
        }
      }
    }))
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Blinking stars background */}
      <div className="stars-container absolute inset-0">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="star absolute bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 3 + 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">

          {/* Profile Header */}
          <Card className="bg-background/80 backdrop-blur-sm border-border/50 mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={isEditing ? avatarPreview : profileData.user.avatar} />
                    <AvatarFallback className="text-2xl">{profileData.user.name[0]}</AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <div className="absolute -bottom-2 -right-2">
                      <label htmlFor="avatar-upload" className="cursor-pointer">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 rounded-full p-0"
                          asChild
                        >
                          <span>
                            <Camera className="h-4 w-4" />
                          </span>
                        </Button>
                      </label>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </div>
                  )}
                  {!isEditing && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                      onClick={() => setIsEditing(true)}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                  {avatarFile && isEditing && (
                    <div className="absolute -top-2 -right-2">
                      <Badge variant="default" className="text-xs">
                        New
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                    <h1 className="text-3xl font-bold">{profileData.user.name}</h1>
                    <Badge variant="secondary" className="text-sm">
                      Level {profileData.user.level} {profileData.user.role}
                    </Badge>
                    {profileData.user.emailVerified && (
                      <Badge variant="outline" className="text-green-600 border-green-500">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-muted-foreground">{profileData.user.email}</p>
                    {!profileData.user.emailVerified && (
                      <Badge variant="outline" className="text-orange-600 border-orange-500 text-xs">
                        Unverified
                      </Badge>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-3 max-w-md mx-auto md:mx-0">
                      <div>
                        <Label htmlFor="name">Display Name</Label>
                        <Input
                          id="name"
                          value={editForm.name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={editForm.bio}
                          onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={editForm.location}
                          onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveProfile}>
                          <Save className="mr-2 h-4 w-4" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => {
                          setIsEditing(false)
                          setAvatarFile(null)
                          setAvatarPreview(profileData.user.avatar)
                          setEditForm({
                            name: profileData.user.name,
                            email: profileData.user.email,
                            bio: profileData.user.bio,
                            location: profileData.user.location,
                            avatar: profileData.user.avatar
                          })
                        }}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="mb-3">{profileData.user.bio}</p>
                      <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                        <span>📍 {profileData.user.location}</span>
                        <span>📅 Joined {new Date(profileData.user.joinDate).toLocaleDateString()}</span>
                      </div>
                    </>
                  )}

                  {/* Email Verification Notice */}
                  {emailChangePending && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">Email Verification Required</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        We've sent a verification email to <strong>{editForm.email}</strong>.
                        Please check your inbox and click the verification link to confirm the email change.
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleEmailVerification}>
                          I've Verified My Email
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEmailChangePending(false)}>
                          Cancel Change
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {!isEditing && (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <User className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Profile Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="statistics">Statistics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Quick Stats */}
                <Card className="bg-background/80 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Quick Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-primary">{profileData.stats.totalXP.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Total XP</div>
                      </div>
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-orange-500">{profileData.stats.streak}</div>
                        <div className="text-xs text-muted-foreground">Day Streak</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Level Progress</span>
                        <span>{profileData.stats.levelProgress}%</span>
                      </div>
                      <Progress value={profileData.stats.levelProgress} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Achievements */}
                <Card className="bg-background/80 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-primary" />
                      Recent Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {profileData.achievements.slice(0, 3).map((achievement) => (
                      <div key={achievement.id} className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
                        <span className="text-xl">{achievement.icon}</span>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{achievement.name}</div>
                          <div className="text-xs text-muted-foreground">{achievement.earnedAt}</div>
                        </div>
                        <Badge variant="outline" className={`text-xs ${
                          achievement.rarity === 'legendary' ? 'border-purple-500 text-purple-700' :
                            achievement.rarity === 'epic' ? 'border-orange-500 text-orange-700' :
                              achievement.rarity === 'rare' ? 'border-blue-500 text-blue-700' :
                                'border-gray-500 text-gray-700'
                          }`}>
                          {achievement.rarity}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="space-y-6">
              <Card className="bg-background/80 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-6 w-6 text-primary" />
                    Achievement Gallery
                  </CardTitle>
                  <CardDescription>
                    Your collection of badges and milestones
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {profileData.achievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className={`relative p-4 rounded-lg border text-center transition-all hover:scale-105 ${
                          achievement.rarity === 'legendary' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' :
                            achievement.rarity === 'epic' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' :
                              achievement.rarity === 'rare' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' :
                                'border-gray-500 bg-gray-50 dark:bg-gray-900/20'
                          }`}
                      >
                        <div className="text-3xl mb-2">{achievement.icon}</div>
                        <div className="font-medium text-sm mb-1">{achievement.name}</div>
                        <div className="text-xs text-muted-foreground mb-2">{achievement.description}</div>
                        <Badge variant="outline" className={`text-xs w-full ${
                          achievement.rarity === 'legendary' ? 'border-purple-500 text-purple-700' :
                            achievement.rarity === 'epic' ? 'border-orange-500 text-orange-700' :
                              achievement.rarity === 'rare' ? 'border-blue-500 text-blue-700' :
                                'border-gray-500 text-gray-700'
                          }`}>
                          {achievement.rarity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Statistics Tab */}
            <TabsContent value="statistics" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Learning Progress */}
                <Card className="bg-background/80 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Learning Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(profileData.stats.subjects).map(([subject, mastery]) => (
                      <div key={subject} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{subject}</span>
                          <span className="text-muted-foreground">{mastery}%</span>
                        </div>
                        <Progress value={mastery} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Detailed Stats */}
                <Card className="bg-background/80 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      Detailed Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <div className="text-xl font-bold text-blue-500">{profileData.stats.questionsAnswered}</div>
                        <div className="text-xs text-muted-foreground">Questions Answered</div>
                      </div>
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <div className="text-xl font-bold text-green-500">{profileData.stats.accuracy}%</div>
                        <div className="text-xs text-muted-foreground">Accuracy Rate</div>
                      </div>
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <div className="text-xl font-bold text-purple-500">{profileData.stats.doubtsSolved}</div>
                        <div className="text-xs text-muted-foreground">Doubts Solved</div>
                      </div>
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <div className="text-xl font-bold text-orange-500">{profileData.stats.totalStudyTime}h</div>
                        <div className="text-xs text-muted-foreground">Study Time</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">

                {/* Notifications */}
                <Card className="bg-background/80 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5 text-primary" />
                      Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(profileData.preferences.notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</div>
                          <div className="text-sm text-muted-foreground">
                            {key === 'email' ? 'Get notified via email' :
                              key === 'push' ? 'Browser push notifications' :
                                key === 'achievements' ? 'Achievement unlocks' :
                                  key === 'studyReminders' ? 'Daily study reminders' :
                                    'Community activity updates'}
                          </div>
                        </div>
                        <Switch
                          checked={value}
                          onCheckedChange={(checked) => handlePreferenceChange('notifications', key, checked)}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Privacy */}
                <Card className="bg-background/80 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-primary" />
                      Privacy
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(profileData.preferences.privacy).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</div>
                          <div className="text-sm text-muted-foreground">
                            {key === 'showProfile' ? 'Make profile visible to others' :
                              key === 'showStats' ? 'Display learning statistics' :
                                key === 'showAchievements' ? 'Show achievements on profile' :
                                  'Allow other students to message you'}
                          </div>
                        </div>
                        <Switch
                          checked={value}
                          onCheckedChange={(checked) => handlePreferenceChange('privacy', key, checked)}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Study Preferences */}
                <Card className="bg-background/80 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      Study Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Preferred Subjects</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {profileData.preferences.study.preferredSubjects.map((subject) => (
                          <Badge key={subject} variant="secondary">{subject}</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Learning Style</Label>
                      <Select
                        value={profileData.preferences.study.learningStyle}
                        onValueChange={(value) => handlePreferenceChange('study', 'learningStyle', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="visual">Visual</SelectItem>
                          <SelectItem value="auditory">Auditory</SelectItem>
                          <SelectItem value="kinesthetic">Kinesthetic</SelectItem>
                          <SelectItem value="reading">Reading/Writing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Preferred Study Time</Label>
                      <Select
                        value={profileData.preferences.study.studyTime}
                        onValueChange={(value) => handlePreferenceChange('study', 'studyTime', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">Morning</SelectItem>
                          <SelectItem value="afternoon">Afternoon</SelectItem>
                          <SelectItem value="evening">Evening</SelectItem>
                          <SelectItem value="night">Night</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">

                {/* Password */}
                <Card className="bg-background/80 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="h-5 w-5 text-primary" />
                      Password & Authentication
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="font-medium">Password</span>
                      </div>
                      <div className="text-sm text-muted-foreground mb-3">
                        Last changed: {new Date(profileData.security.lastPasswordChange).toLocaleDateString()}
                      </div>
                      <Button variant="outline" size="sm">
                        Change Password
                      </Button>
                    </div>

                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        {profileData.security.twoFactorEnabled ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-orange-500" />
                        )}
                        <span className="font-medium">Two-Factor Authentication</span>
                      </div>
                      <div className="text-sm text-muted-foreground mb-3">
                        {profileData.security.twoFactorEnabled
                          ? 'Enabled - Your account is more secure'
                          : 'Not enabled - Add an extra layer of security'
                        }
                      </div>
                      <Button
                        variant={profileData.security.twoFactorEnabled ? "outline" : "default"}
                        size="sm"
                      >
                        {profileData.security.twoFactorEnabled ? 'Manage 2FA' : 'Enable 2FA'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Active Sessions */}
                <Card className="bg-background/80 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Smartphone className="h-5 w-5 text-primary" />
                      Active Sessions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {profileData.security.loginDevices.map((device, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <div className="font-medium text-sm">{device.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {device.location} • {device.lastSeen}
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Revoke
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}