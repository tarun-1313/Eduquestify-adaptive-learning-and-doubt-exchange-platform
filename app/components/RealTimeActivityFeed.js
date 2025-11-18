import { useState, useEffect } from 'react';
import { bus as realtimeBus } from '@/lib/realtime-bus';

export function RealTimeActivityFeed({ initialActivities = [] }) {
  const [activities, setActivities] = useState(initialActivities);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setActivities(initialActivities);
  }, [initialActivities]);

  useEffect(() => {
    const handleActivityUpdate = (data) => {
      if (data.data) {
        setActivities(prev => {
          const newActivity = {
            ...data.data,
            id: data.data.id || Date.now(),
            time: data.data.time || new Date().toISOString(),
            isNew: true
          };
          
          // Add to top and keep only 10 most recent activities
          const updated = [newActivity, ...prev.slice(0, 9)];
          return updated;
        });
        
        // Remove 'isNew' flag after animation
        setTimeout(() => {
          setActivities(prev => 
            prev.map(activity => ({ ...activity, isNew: false }))
          );
        }, 1000);
      }
    };

    const handleDashboardUpdate = (data) => {
      if (data.type === 'QUIZ_COMPLETED' && data.data) {
        handleActivityUpdate(data);
      }
    };

    realtimeBus.on('quiz:completed', handleActivityUpdate);
    realtimeBus.on('dashboard:update', handleDashboardUpdate);

    return () => {
      realtimeBus.off('quiz:completed', handleActivityUpdate);
      realtimeBus.off('dashboard:update', handleDashboardUpdate);
    };
  }, []);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'achievement': return '🏆';
      case 'quiz': return '📝';
      case 'study': return '📚';
      case 'milestone': return '🎯';
      case 'badge': return '🎖️';
      default: return '⭐';
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start space-x-3 animate-pulse">
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            <div className="flex-1">
              <div className="h-3 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">📈</div>
        <p>No recent activity</p>
        <p className="text-sm">Start studying to see your activity here!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {activities.map((activity, index) => (
        <div 
          key={activity.id || index}
          className={`flex items-start space-x-3 p-3 rounded-lg transition-all duration-500 ${
            activity.isNew ? 'bg-blue-50 border-l-4 border-blue-500 animate-pulse' : 'bg-white border border-gray-200'
          }`}
        >
          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm">
            {getActivityIcon(activity.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900 font-medium">
              {activity.message}
            </p>
            
            {activity.percentage && (
              <div className="mt-1 flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${activity.percentage}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500 font-medium">
                  {activity.percentage}%
                </span>
              </div>
            )}
            
            <p className="text-xs text-gray-500 mt-1">
              {getTimeAgo(activity.time)}
            </p>
          </div>
        </div>
      ))}
      
      {activities.length > 0 && (
        <div className="text-center pt-2">
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200">
            View All Activity →
          </button>
        </div>
      )}
    </div>
  );
}