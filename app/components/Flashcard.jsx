'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { BookOpen, X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Flashcard({ 
  card, 
  currentIndex, 
  totalCards,
  onNext, 
  onPrev, 
  onClose 
}) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            Flashcard {currentIndex + 1} of {totalCards}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Card Content */}
        <motion.div 
          className="bg-gray-800/90 rounded-xl p-8 border border-gray-700 shadow-2xl min-h-[400px] flex flex-col"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Question */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">Question:</h3>
            <p className="text-gray-200 text-lg">{card.question}</p>
          </div>

          {/* Answer */}
          <div className="bg-gray-700/50 rounded-lg p-6 mb-6 border border-gray-600/50 flex-1">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-blue-400">
                {showAnswer ? 'Answer' : 'Click to reveal answer'}
              </h3>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setShowAnswer(!showAnswer)}
                className="text-blue-400 border-blue-500/50 hover:bg-blue-500/10"
              >
                {showAnswer ? 'Hide Answer' : 'Show Answer'}
              </Button>
            </div>

            {showAnswer && (
              <div className="space-y-6">
                <p className="text-gray-200 text-lg leading-relaxed">
                  {card.answer}
                </p>

                {card.details && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-300 mb-3">
                      Key Points:
                    </h4>
                    <ul className="space-y-2 pl-5 list-disc text-gray-300">
                      {card.details.map((detail, idx) => (
                        <li key={idx} className="text-gray-300">
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {card.example && (
                  <div className="mt-6 p-4 bg-gray-700/50 rounded-lg border-l-4 border-blue-500">
                    <h4 className="text-md font-medium text-blue-400 mb-2">
                      Example:
                    </h4>
                    <p className="text-gray-300 italic">{card.example}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-700">
            <Button 
              variant="outline" 
              onClick={onPrev}
              disabled={currentIndex === 0}
              className="border-gray-600 text-gray-300 hover:bg-gray-700/50 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <div className="flex space-x-2">
              {Array.from({ length: totalCards }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    // Handle direct navigation to a specific card
                    // This would be implemented in the parent component
                    console.log('Navigate to card', index);
                  }}
                  className={`h-2 w-8 rounded-full transition-colors ${
                    index === currentIndex 
                      ? 'bg-blue-500' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  aria-label={`Go to card ${index + 1}`}
                />
              ))}
            </div>
            
            <Button 
              variant="outline" 
              onClick={onNext}
              disabled={currentIndex === totalCards - 1}
              className="border-gray-600 text-gray-300 hover:bg-gray-700/50 disabled:opacity-50"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
