"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/hooks/auth-context";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast" // <-- FIXED: Added missing import
import Galaxy from "@/components/Galaxy"
import { 
  FileText, 
  Folder, 
  Search, 
  Filter, 
  Star, 
  StarOff, 
  Download, 
  MoreVertical,
  Clock,
  Eye,
  MessageCircle,
  ThumbsUp,
  Plus,
  Sparkles
} from "lucide-react"
import UploadModal from "./components/UploadModal"
import { formatDistanceToNow } from "date-fns"
import dynamic from "next/dynamic";

const LiquidEther = dynamic(() => import("@/components/LiquidEther"), {
  ssr: false,
});

// Types
type Note = {
  id: number
  user_id: number
  title: string
  description: string
  subject: string
  file_path: string
  original_filename: string
  file_mime_type: string
  file_size_bytes: number
  views_count: number
  likes_count: number
  comments_count: number
  created_at: string
  updated_at: string
  is_starred?: boolean
  user?: {
    name: string
    email: string
    image: string
  }
}

type SubjectCount = {
  subject: string
  count: number
}

function NotesContent() {
  const { user, isLoading: loading } = useAuth()
  const { toast } = useToast() // <-- FIXED: Initialized hook
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [notes, setNotes] = useState<Note[]>([])
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([])
  const [subjectCounts, setSubjectCounts] = useState<SubjectCount[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch notes and subject counts
  const fetchNotes = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Fetching notes...');
      
      const notesResponse = await fetch('/api/notes', {
        credentials: 'include'
      });
      console.log('Notes response status:', notesResponse.status);
      
      if (!notesResponse.ok) {
        const errorData = await notesResponse.json();
        throw new Error(errorData.error || 'Failed to fetch notes');
      }
      
      const notesData = await notesResponse.json();
      console.log('Notes data:', notesData);
      
      if (notesData.data) {
        console.log(`Found ${notesData.data.length} notes`);
        
        // Transform the data to match our Note type
        const formattedNotes = notesData.data.map((note: any) => ({
          ...note,
          user: {
            name: note.user_name,
            email: note.user_email,
            image: note.user_image
          }
        }));
        
        setNotes(formattedNotes);
        setFilteredNotes(formattedNotes);
        
        // Extract unique subjects from notes
        const uniqueSubjects = new Map<string, number>();
        formattedNotes.forEach((note: Note) => {
          if (note.subject) {
            const count = uniqueSubjects.get(note.subject) || 0;
            uniqueSubjects.set(note.subject, count + 1);
          }
        });
        
        const subjects = Array.from(uniqueSubjects.entries()).map(([name, count]) => ({
          subject: name,
          count
        }));
        
        console.log('Extracted subjects:', subjects);
        setSubjectCounts(subjects);
      }
    } catch (error) {
      console.error('Error in fetchNotes:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load notes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]) // <-- FIXED: Added toast to dependency array

  // Filter notes based on search query and selected subject
  useEffect(() => {
    let result = [...notes];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(note => 
        (note.title?.toLowerCase().includes(query) || false) ||
        (note.description?.toLowerCase().includes(query) || false) ||
        (note.subject?.toLowerCase().includes(query) || false)
      );
    }
    
    if (selectedSubject) {
      result = result.filter(note => note.subject === selectedSubject);
    }
    
    // Sort by most recent first
    result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    setFilteredNotes(result);
  }, [searchQuery, selectedSubject, notes]);

  // Initial data fetch
  useEffect(() => {
    console.log('Component mounted, fetching notes...');
    fetchNotes();
    
    // Set up a timer to refresh notes every 30 seconds
    const refreshInterval = setInterval(fetchNotes, 30000);
    
    // Clean up interval on unmount
    return () => clearInterval(refreshInterval);
  }, [fetchNotes])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Handle note view
  const handleViewNote = async (noteId: number) => {
    try {
      // Increment view count
      const response = await fetch(`/api/notes/${noteId}/view`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to update view count');
      }
      
      // Open note in new tab
      window.open(`/notes/view/${noteId}`, '_blank');
      
      // Refresh notes to update the view count
      fetchNotes();
    } catch (error) {
      console.error('Error viewing note:', error);
      toast({
        title: 'Error',
        description: 'Failed to open note. Please try again.',
        variant: 'destructive',
      });
    }
  }

  // Handle note like
  const handleLikeNote = async (noteId: number) => {
    try {
      const response = await fetch(`/api/notes/${noteId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })
      
      if (response.ok) {
        // Update local state
        setNotes(prevNotes => 
          prevNotes.map(note => 
            note.id === noteId 
              ? { ...note, likes_count: note.likes_count + 1 } 
              : note
          )
        )
      }
    } catch (error) {
      console.error('Error liking note:', error)
    }
  }

  // Handle note star toggle
  const handleStarToggle = async (noteId: number) => {
    try {
      const response = await fetch(`/api/notes/${noteId}/star`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Update local state to reflect the change
        setNotes(prevNotes => 
          prevNotes.map(note => 
            note.id === noteId 
              ? { ...note, is_starred: data.isStarred } 
              : note
          )
        );
        
        toast({
          title: data.isStarred ? 'Note starred' : 'Note unstarred',
          description: data.isStarred 
            ? 'This note has been added to your starred notes.' 
            : 'This note has been removed from your starred notes.',
        });
      }
    } catch (error) {
      console.error('Error toggling star status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update star status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle note upload success
  const handleUploadSuccess = () => {
    setIsUploadModalOpen(false)
    fetchNotes() // Refresh the notes list
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Notes</h1>
          <p className="text-muted-foreground">Manage and organize your study materials</p>
        </div>
        <Button onClick={() => setIsUploadModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Upload Notes
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Notes</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="starred">Starred</TabsTrigger>
          </TabsList>
          
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search notes..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          {/* Sidebar with subjects */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-2">Subjects</h3>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedSubject(null)}
                className={`w-full text-left px-4 py-2 rounded-md ${
                  !selectedSubject 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                All Subjects ({notes.length})
              </button>
              {subjectCounts.map(({ subject, count }) => (
                <button
                  key={subject}
                  onClick={() => setSelectedSubject(subject)}
                  className={`w-full text-left px-4 py-2 rounded-md flex justify-between items-center ${
                    selectedSubject === subject
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <span>{subject}</span>
                  <span className="text-xs bg-background text-foreground rounded-full px-2 py-1">
                    {count}
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Main content */}
          <div className="md:col-span-3">
            <TabsContent value="all" className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : filteredNotes.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredNotes.map((note) => (
                    // <-- FIXED: Replaced entire broken Card layout
                    <Card key={note.id} className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow group">
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg line-clamp-2 pr-6">{note.title}</h3>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleStarToggle(note.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-yellow-400 focus:outline-none"
                              aria-label={note.is_starred ? 'Remove from starred' : 'Add to starred'}
                            >
                              {note.is_starred ? (
                                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                              ) : (
                                <Star className="h-5 w-5 text-gray-300 hover:text-yellow-400" />
                              )}
                            </button>
                            {note.subject && (
                              <Badge variant="outline" className="whitespace-nowrap">
                                {note.subject}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {note.description && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                            {note.description}
                          </p>
                        )}
                        
                        {/* Spacer to push content to top and bottom */}
                        <div className="flex-grow" /> 
                        
                        <div className="pt-2 border-t">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                            </div>
                            <span>{formatFileSize(note.file_size_bytes)}</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 px-2"
                                onClick={() => handleLikeNote(note.id)}
                              >
                                <ThumbsUp className="h-4 w-4 mr-1" />
                                {note.likes_count}
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 px-2">
                                <MessageCircle className="h-4 w-4 mr-1" />
                                {note.comments_count}
                              </Button>
                              <div className="flex items-center space-x-1 text-sm text-muted-foreground pl-1">
                                <Eye className="h-4 w-4" />
                                <span>{note.views_count}</span>
                              </div>
                            </div>
                            
                            <Button 
                              size="sm" 
                              onClick={() => handleViewNote(note.id)}
                            >
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                    // <-- END FIXED Card
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-1">No notes found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {searchQuery || selectedSubject 
                      ? 'Try adjusting your search or filter' 
                      : 'Get started by uploading your first note'}
                  </p>
                  <Button onClick={() => setIsUploadModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Upload Notes
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="recent" className="space-y-4">
              {/* <-- FIXED: Added proper empty state */}
              <div className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-1">No recent notes</h3>
                <p className="text-sm text-muted-foreground">
                  Notes you've viewed recently will appear here.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="starred" className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : notes.filter(note => note.is_starred).length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {notes.filter(note => note.is_starred).map((note) => (
                    <Card key={note.id} className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow group">
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg line-clamp-2 pr-6">{note.title}</h3>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleStarToggle(note.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-yellow-400 focus:outline-none"
                              aria-label={note.is_starred ? 'Remove from starred' : 'Add to starred'}
                            >
                              {note.is_starred ? (
                                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                              ) : (
                                <Star className="h-5 w-5 text-gray-300 hover:text-yellow-400" />
                              )}
                            </button>
                            {note.subject && (
                              <Badge variant="outline" className="whitespace-nowrap">
                                {note.subject}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {note.description && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                            {note.description}
                          </p>
                        )}
                        <div className="flex-grow" />
                        <div className="pt-2 border-t">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                            </div>
                            <span>{formatFileSize(note.file_size_bytes)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 px-2"
                                onClick={() => handleLikeNote(note.id)}
                              >
                                <ThumbsUp className="h-4 w-4 mr-1" />
                                {note.likes_count}
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 px-2">
                                <MessageCircle className="h-4 w-4 mr-1" />
                                {note.comments_count}
                              </Button>
                              <div className="flex items-center space-x-1 text-sm text-muted-foreground pl-1">
                                <Eye className="h-4 w-4" />
                                <span>{note.views_count}</span>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              onClick={() => handleViewNote(note.id)}
                            >
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Star className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-1">No starred notes</h3>
                  <p className="text-sm text-muted-foreground">
                    Star notes to easily find them later
                  </p>
                </div>
              )}
            </TabsContent>
          </div>
        </div>
      </Tabs>

 
      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)}
        onUploadComplete={handleUploadSuccess}
      />
    </div>
  )
}

export default function NotesPage() {
  return (
    <div className="relative min-h-screen">
      {/* Liquid Ether Background */}
      <div className="fixed inset-0 z-0">
        <LiquidEther 
          mouseForce={15}
          cursorSize={120}
          isViscous={true}
          viscous={25}
          colors={["#3b82f6", "#8b5cf6", "#ec4899"]}
          autoDemo={true}
          autoIntensity={2.0}
        />
      </div>
      {/* Content with relative positioning to appear above background */}
      <div className="relative z-10">
        <NotesContent />
      </div>
    </div>
  )
}

