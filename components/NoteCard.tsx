import Link from 'next/link';
import { Star } from 'lucide-react';
import { useState } from 'react';

interface NoteCardProps {
  id: number;
  title: string;
  description?: string;
  subjectName?: string;
  updatedAt: string;
  isStarred?: boolean;
  onStarToggle?: (id: number) => Promise<void>;
}

export function NoteCard({
  id,
  title,
  description,
  subjectName,
  updatedAt,
  isStarred = false,
  onStarToggle,
}: NoteCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [starred, setStarred] = useState(isStarred);

  const handleStarClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onStarToggle) {
      setIsLoading(true);
      try {
        await onStarToggle(id);
        setStarred(!starred);
      } catch (error) {
        console.error('Error toggling star:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Link 
      href={`/notes/view/${id}`}
      className="block p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white line-clamp-1">
          {title}
        </h3>
        <button
          onClick={handleStarClick}
          disabled={isLoading}
          className="text-gray-400 hover:text-yellow-400 focus:outline-none"
          aria-label={starred ? 'Remove from starred' : 'Add to starred'}
        >
          <Star 
            className={`w-5 h-5 ${starred ? 'fill-yellow-400 text-yellow-400' : ''}`} 
          />
        </button>
      </div>
      
      {subjectName && (
        <span className="inline-block mt-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 dark:bg-blue-900 dark:text-blue-200 rounded-full">
          {subjectName}
        </span>
      )}
      
      {description && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
          {description}
        </p>
      )}
      
      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        Updated {new Date(updatedAt).toLocaleDateString()}
      </div>
    </Link>
  );
}
