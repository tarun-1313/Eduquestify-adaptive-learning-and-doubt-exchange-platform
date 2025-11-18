import { useState, useEffect, useRef } from 'react';

export function AnimatedXPProgress({ xp, level, xpToNext, className = '' }) {
  const [displayXP, setDisplayXP] = useState(xp);
  const [displayLevel, setDisplayLevel] = useState(level);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const animationRef = useRef(null);
  const previousXPRef = useRef(xp);
  const previousLevelRef = useRef(level);

  useEffect(() => {
    // Only animate if values have changed
    if (xp !== previousXPRef.current || level !== previousLevelRef.current) {
      animateXPChange(previousXPRef.current, xp, previousLevelRef.current, level);
      previousXPRef.current = xp;
      previousLevelRef.current = level;
    }
  }, [xp, level]);

  const animateXPChange = (fromXP, toXP, fromLevel, toLevel) => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    setIsAnimating(true);
    
    const duration = 1000; // 1 second animation
    const startTime = Date.now();
    const xpDiff = toXP - fromXP;
    const levelUp = toLevel > fromLevel;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentXP = fromXP + (xpDiff * easeOutQuart);
      
      setDisplayXP(Math.floor(currentXP));
      
      if (levelUp && progress > 0.7) {
        setDisplayLevel(toLevel);
        if (!showLevelUp) {
          setShowLevelUp(true);
          setTimeout(() => setShowLevelUp(false), 2000);
        }
      }
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayXP(toXP);
        setDisplayLevel(toLevel);
        setIsAnimating(false);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  const xpProgress = Math.min((displayXP / xpToNext) * 100, 100);
  const xpInCurrentLevel = displayXP % xpToNext;

  return (
    <div className={`relative ${className}`}>
      {/* Level Up Animation */}
      {showLevelUp && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-lg shadow-2xl animate-bounce">
            <div className="text-2xl font-bold flex items-center">
              <span className="mr-2">🎉</span>
              Level Up!
              <span className="ml-2">🎉</span>
            </div>
            <div className="text-center mt-2">
              You reached Level {displayLevel}!
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Level {displayLevel}</span>
        <span className="text-sm text-gray-500">
          {xpInCurrentLevel.toLocaleString()}/{xpToNext.toLocaleString()} XP
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-300 ease-out ${
            isAnimating ? 'animate-pulse' : ''
          }`}
          style={{ 
            width: `${xpProgress}%`,
            transition: isAnimating ? 'width 0.3s ease-out' : 'none'
          }}
        >
          {isAnimating && (
            <div className="absolute inset-0 bg-white opacity-20 animate-ping"></div>
          )}
        </div>
      </div>
      
      {/* XP Gain Animation */}
      {isAnimating && (
        <div className="absolute -top-6 right-0 text-green-600 font-bold animate-bounce">
          +{(xp - previousXPRef.current).toLocaleString()} XP
        </div>
      )}
    </div>
  );
}