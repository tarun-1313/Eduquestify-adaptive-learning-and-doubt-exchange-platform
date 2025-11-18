"use client";

import { useState, useEffect, useCallback } from 'react';
import { bus as realtimeBus } from '@/lib/realtime-bus';

export function useRealTimeDashboard() {
  const [dashboardData, setDashboardData] = useState({
    user: {
      xp: 0,
      level: 1,
      streak: 0,
      xpToNext: 2000,
      dailyGoal: { completed: false, type: "Complete 1 Quiz", progress: 0 },
    },
    recommendedTopics: [],
    recentActivity: [],
    isLoading: true,
    error: null,
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      setDashboardData(prev => ({ ...prev, isLoading: true, error: null }));
      
      // In a real app, this would be an API call
      // const response = await fetch('/api/dashboard');
      // const data = await response.json();
      
      // For now, using mock data
      const mockData = {
        user: {
          xp: 1250,
          level: 8,
          streak: 5,
          xpToNext: 1750,
          dailyGoal: { completed: false, type: "Complete 1 Quiz", progress: 0 },
        },
        recommendedTopics: [
          { id: 1, name: "Algebraic Equations", difficulty: "Medium", reason: "3 incorrect answers in last week" },
          { id: 2, name: "Cell Mitosis", difficulty: "Easy", reason: "Review needed for upcoming test" }
        ],
        recentActivity: [
          { id: 1, message: "You completed a 5-day streak!", type: "streak", time: "2 hours ago" },
          { id: 2, message: "Answered 3 questions in Doubt Exchange", type: "help", time: "1 day ago" },
          { id: 3, message: "Mastered the 'Photosynthesis' flashcard deck", type: "achievement", time: "2 days ago" }
        ]
      };
      
      setDashboardData(prev => ({
        ...prev,
        ...mockData,
        isLoading: false
      }));
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setDashboardData(prev => ({
        ...prev,
        error: err.message || 'Failed to load dashboard data',
        isLoading: false
      }));
    }
  }, []);

  useEffect(() => {
    // Initial data fetch
    fetchDashboardData();

    // Set up real-time subscription
    const handleRealTimeUpdate = (event) => {
      const { type, data } = event.detail;
      
      setDashboardData(prev => {
        const updates = { ...prev };
        
        switch (type) {
          case 'xp_update':
            updates.user.xp = data.newXP;
            updates.user.level = data.newLevel || prev.user.level;
            break;
            
          case 'streak_update':
            updates.user.streak = data.newStreak;
            break;
            
          case 'activity_added':
            updates.recentActivity = [
              data.activity,
              ...prev.recentActivity.slice(0, 9)
            ];
            break;
            
          case 'recommendations_updated':
            updates.recommendedTopics = data.topics;
            break;
        }
        
        return updates;
      });
    };

    // Subscribe to real-time events
    realtimeBus.on('update', handleRealTimeUpdate);

    // Clean up
    return () => {
      realtimeBus.off('update', handleRealTimeUpdate);
    };
  }, [fetchDashboardData]);

  const refreshDashboard = useCallback(() => {
    return fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    ...dashboardData,
    refreshDashboard
  };
}

export default useRealTimeDashboard;