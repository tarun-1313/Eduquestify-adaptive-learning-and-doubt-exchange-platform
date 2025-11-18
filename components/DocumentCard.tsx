import Link from 'next/link';
import { FileText, Download } from 'lucide-react';

interface DocumentCardProps {
  id: number;
  title: string;
  filename: string;
  fileType: string;
  size: string;
  subjectName?: string;
  createdAt: string;
}

export function DocumentCard({
  id,
  title,
  filename,
  fileType,
  size,
  subjectName,
  createdAt,
}: DocumentCardProps) {
  // Get file icon based on file type
  const getFileIcon = (type: string) => {
    const typeLower = type.toLowerCase();
    
    if (typeLower.includes('pdf')) return '📄';
    if (typeLower.includes('word') || typeLower.includes('document')) return '📝';
    if (typeLower.includes('excel') || typeLower.includes('spreadsheet')) return '📊';
    if (typeLower.includes('powerpoint') || typeLower.includes('presentation')) return '📑';
    if (typeLower.includes('image')) return '🖼️';
    if (typeLower.includes('audio')) return '🎵';
    if (typeLower.includes('video')) return '🎥';
    if (typeLower.includes('zip') || typeLower.includes('compressed')) return '🗜️';
    return '📎'; // Default document icon
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow p-4">
      <div className="flex items-start">
        <div className="text-3xl mr-3 mt-1">
          {getFileIcon(fileType)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {title || filename}
            </h3>
            <a 
              href={`/api/notes/${id}/download`} 
              className="text-gray-400 hover:text-blue-500 ml-2"
              onClick={(e) => e.stopPropagation()}
              title="Download"
            >
              <Download className="w-4 h-4" />
            </a>
          </div>
          
          <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
            <span className="truncate">{filename}</span>
            <span className="mx-2">•</span>
            <span>{size}</span>
          </div>
          
          <div className="mt-2 flex flex-wrap gap-2">
            {subjectName && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {subjectName}
              </span>
            )}
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
              {fileType}
            </span>
          </div>
          
          <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
            Uploaded {new Date(createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}
