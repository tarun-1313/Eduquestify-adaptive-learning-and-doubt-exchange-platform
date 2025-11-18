"use client"

import { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { FileText, Loader2, ZoomIn as ZoomInIcon, ZoomOut as ZoomOutIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`
}

interface PDFViewerProps {
  fileUrl: string
  pageNumber: number
  scale: number
  onDocumentLoadSuccess: (numPages: number) => void
  onPrevPage: () => void
  onNextPage: () => void
  onZoomIn: () => void
  onZoomOut: () => void
}

export function PDFViewer({
  fileUrl,
  pageNumber,
  scale,
  onDocumentLoadSuccess,
  onPrevPage,
  onNextPage,
  onZoomIn,
  onZoomOut,
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')

  const handleLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setIsLoading(false)
    onDocumentLoadSuccess(numPages)
  }

  const handleLoadError = (error: Error) => {
    console.error('Error loading PDF:', error)
    setError('Failed to load PDF. Please try again.')
    setIsLoading(false)
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-full">
      <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={onPrevPage}
            disabled={pageNumber <= 1}
            className="p-2 dark:text-gray-300 dark:hover:bg-gray-700"
            aria-label="Previous page"
          >
            ←
          </Button>
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Page {pageNumber} of {numPages || '...'}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={onNextPage}
            disabled={!numPages || pageNumber >= numPages}
            className="p-2 dark:text-gray-300 dark:hover:bg-gray-700"
            aria-label="Next page"
          >
            →
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={onZoomOut}
            className="p-2 dark:text-gray-300 dark:hover:bg-gray-700"
            aria-label="Zoom out"
          >
            <ZoomOutIcon className="w-4 h-4" />
          </Button>
          <span className="text-sm text-gray-600 dark:text-gray-300 w-12 text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={onZoomIn}
            className="p-2 dark:text-gray-300 dark:hover:bg-gray-700"
            aria-label="Zoom in"
          >
            <ZoomInIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="p-4 overflow-auto flex-1 flex items-center justify-center min-h-[500px]">
        {error ? (
          <div className="text-center p-8">
            <FileText className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <p className="text-red-500 dark:text-red-400 mb-2">Error loading PDF</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
          </div>
        ) : (
          <Document
            file={fileUrl}
            onLoadSuccess={handleLoadSuccess}
            onLoadError={handleLoadError}
            loading={
              <div className="flex flex-col items-center justify-center p-8">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Loading PDF...</p>
              </div>
            }
            className="w-full h-full flex items-center justify-center"
          >
            <Page 
              pageNumber={pageNumber} 
              scale={scale}
              width={1000}
              className="border border-gray-200 dark:border-gray-700 shadow-sm"
              renderTextLayer={true}
              renderAnnotationLayer={true}
              loading={
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                </div>
              }
            />
          </Document>
        )}
      </div>
    </div>
  )
}
