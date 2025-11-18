'use client';

import { useEffect, useState } from 'react';

type TypewriterProps = {
  text: string | string[];
  speed?: number;
  delay?: number;
  loop?: boolean;
  cursor?: boolean;
  className?: string;
};

export function Typewriter({
  text,
  speed = 30,
  delay = 1000,
  loop = true,
  cursor = true,
  className = '',
}: TypewriterProps) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingPaused, setTypingPaused] = useState(false);
  const [currentText, setCurrentText] = useState('');

  useEffect(() => {
    const texts = Array.isArray(text) ? text : [text];
    setCurrentText(texts[currentIndex % texts.length]);
  }, [text, currentIndex]);

  useEffect(() => {
    if (!currentText) return;

    let timer: NodeJS.Timeout;
    
    if (!typingPaused) {
      timer = setTimeout(() => {
        if (isDeleting) {
          setDisplayText((prev) => prev.slice(0, -1));
          if (displayText === '') {
            setIsDeleting(false);
            setCurrentIndex((prev) => (prev + 1) % (Array.isArray(text) ? text.length : 1));
            setTypingPaused(true);
            setTimeout(() => setTypingPaused(false), 500);
          }
        } else {
          setDisplayText(currentText.slice(0, displayText.length + 1));
          if (displayText === currentText) {
            setTypingPaused(true);
            setTimeout(() => {
              setTypingPaused(false);
              if (loop || currentIndex < (Array.isArray(text) ? text.length - 1 : 0)) {
                setIsDeleting(true);
              }
            }, delay);
          }
        }
      }, isDeleting ? speed / 2 : speed);
    }

    return () => clearTimeout(timer);
  }, [displayText, currentText, isDeleting, typingPaused, speed, delay, loop, currentIndex, text]);

  return (
    <span className={`inline-flex items-center ${className}`}>
      {displayText}
      {cursor && (
        <span className="ml-0.5 h-5 w-0.5 bg-foreground animate-pulse"></span>
      )}
    </span>
  );
}
