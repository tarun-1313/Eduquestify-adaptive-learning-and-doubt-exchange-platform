"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2, ZoomIn, ZoomOut, Download, FileText, Eye, Clock, User } from 'lucide-react'
import dynamic from 'next/dynamic'
import { formatDistanceToNow } from 'date-fns'

// Dynamically import PDFViewer with SSR disabled
const PDFViewer = dynamic(
  () => import('@/components/PDFViewer').then((mod) => mod.PDFViewer),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[500px]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }
)

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
  user?: {
    name: string
    email: string
    image: string | null
  }
  is_starred?: boolean
  is_owner?: boolean
}

export default function NoteStudyPage() {
  const router = useRouter()
  const params = useParams()
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(1.0)
  const [fileUrl, setFileUrl] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [note, setNote] = useState<Note | null>(null)
  const [studyTime, setStudyTime] = useState(0)

  // Format study time in minutes:seconds
  const formatStudyTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Track study time
  useEffect(() => {
    if (!note) return
    
    const timer = setInterval(() => {
      setStudyTime(prev => prev + 1)
    }, 1000)
    
    return () => clearInterval(timer)
  }, [note])

  useEffect(() => {
    const fetchNote = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/notes/${params.id}`)
        const data = await response.json()
        
        if (response.ok) {
          setNote(data)
          setFileUrl(data.file_path)
          
          // Increment view count
          await fetch(`/api/notes/${params.id}/view`, {
            method: 'POST',
          })
        } else {
          console.error('Failed to fetch note:', data.error)
        }
      } catch (error) {
        console.error('Error fetching note:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (params?.id) {
      fetchNote()
    }
  }, [params?.id])

  const handleDocumentLoadSuccess = (numPages: number) => {
    console.log(`Successfully loaded ${numPages} page(s)`)
  }

  const handlePrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setPageNumber((prev) => prev + 1)
  }

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 2))
  }

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5))
  }

  const handleDownload = () => {
    if (!fileUrl) return
    const link = document.createElement('a')
    link.href = fileUrl
    link.download = note?.original_filename || 'document.pdf'
    link.click()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  if (!note) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <FileText className="w-12 h-12 text-gray-400" />
        <p className="text-gray-500">Failed to load note. Please try again.</p>
        <Button onClick={() => router.back()} variant="outline">
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{note.title}</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">{note.description}</p>
        
        <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center">
            <User className="w-4 h-4 mr-1" />
            <span>{note.user?.name || 'Unknown'}</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span>
              {note.created_at 
                ? `Uploaded ${formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}`
                : 'Upload date not available'}
            </span>
          </div>
          <div className="flex items-center">
            <Eye className="w-4 h-4 mr-1" />
            <span>{note.views_count} views</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span>Study time: {formatStudyTime(studyTime)}</span>
          </div>
        </div>
        
        <div className="mt-2 text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            {note.file_mime_type} • {note.file_size_bytes ? `${(note.file_size_bytes / 1024).toFixed(1)} KB` : 'Unknown size'}
          </span>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {fileUrl ? (
          <PDFViewer
            fileUrl={fileUrl}
            pageNumber={pageNumber}
            scale={scale}
            onDocumentLoadSuccess={handleDocumentLoadSuccess}
            onPrevPage={handlePrevPage}
            onNextPage={handleNextPage}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 p-8 text-center">
            <FileText className="w-12 h-12 mb-4 text-gray-300" />
            <p>No PDF file available for this note.</p>
            <p className="text-sm text-gray-400 mt-2">The document may have been moved or deleted.</p>
          </div>
        )}
      </div>
      
      <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <Button variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
          Back to Notes
        </Button>
        
        <div className="flex flex-wrap justify-center gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={handleZoomOut} size="sm">
            <ZoomOut className="w-4 h-4 mr-2" />
            Zoom Out
          </Button>
          <Button variant="outline" onClick={handleZoomIn} size="sm">
            <ZoomIn className="w-4 h-4 mr-2" />
            Zoom In
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.open(fileUrl, '_blank')}
            size="sm"
            className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <FileText className="w-4 h-4 mr-2" />
            Open in New Tab
          </Button>
          <Button 
            variant="default" 
            onClick={handleDownload} 
            size="sm" 
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Study Progress */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>Study Session Progress</span>
          <span>{formatStudyTime(studyTime)}</span>
        </div>
        <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${Math.min((studyTime / 1800) * 100, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Goal: 30 minutes of focused study
        </p>
      </div>
    </div>
  )
}