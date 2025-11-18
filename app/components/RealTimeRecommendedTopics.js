import { useState, useEffect } from 'react';
import { bus as realtimeBus } from '@/lib/realtime-bus';

export function RealTimeRecommendedTopics({ initialTopics = [] }) {
  const [topics, setTopics] = useState(initialTopics);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setTopics(initialTopics);
  }, [initialTopics]);

  useEffect(() => {
    const handleRecommendationsUpdate = (data) => {
      if (data.data && data.data.topics) {
        setTopics(data.data.topics);
        setIsLoading(false);
      }
    };

    const handleQuizCompleted = (data) => {
      // Trigger recommendations refresh when quiz is completed
      setIsLoading(true);
      // In a real implementation, you might fetch fresh recommendations here
      setTimeout(() => setIsLoading(false), 1000);
    };

    realtimeBus.on('recommendations:updated', handleRecommendationsUpdate);
    realtimeBus.on('quiz:completed', handleQuizCompleted);

    return () => {
      realtimeBus.off('recommendations:updated', handleRecommendationsUpdate);
      realtimeBus.off('quiz:completed', handleQuizCompleted);
    };
  }, []);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getScoreColor = (avgScore) => {
    if (avgScore < 50) return 'text-red-600';
    if (avgScore < 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg p-4 border border-gray-200 animate-pulse">
            <div className="flex items-center justify-between mb-2">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-3 bg-gray-300 rounded w-16"></div>
            </div>
            <div className="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!topics || topics.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">📚</div>
        <p>No recommendations available</p>
        <p className="text-sm">Complete some quizzes to get personalized recommendations!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {topics.map((topic) => (
        <div key={topic.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900">{topic.name}</h4>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(topic.difficulty)}`}>
              {topic.difficulty}
            </span>
          </div>
          
          <div className="text-sm text-gray-600 mb-2">
            {topic.subject}
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">
              Avg Score: <span className={`font-medium ${getScoreColor(topic.avgScore)}`}>
                {topic.avgScore}%
              </span>
            </span>
            <span className="text-gray-500">
              {topic.attempts} attempt{topic.attempts !== 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="mt-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
            {topic.reason}
          </div>
          
          <button className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium">
            Practice Now
          </button>
        </div>
      ))}
      
      {topics.length > 0 && (
        <div className="text-center pt-2">
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200">
            View All Recommendations →
          </button>
        </div>
      )}
    </div>
  );
}