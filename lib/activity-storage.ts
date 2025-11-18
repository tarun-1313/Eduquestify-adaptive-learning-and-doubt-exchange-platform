// Types for activity tracking
export interface ActivityItem {
  id: string;
  type: 'question_bank' | 'quiz' | 'flashcard' | 'doubt';
  title: string;
  timestamp: string;
  details: {
    score?: number;
    totalQuestions?: number;
    subject?: string;
    topic?: string;
    cardsReviewed?: number;
    totalCards?: number;
    status?: string;
  };
}

export interface UserActivity {
  questionBanks: ActivityItem[];
  quizzes: ActivityItem[];
  flashcards: ActivityItem[];
  doubts: ActivityItem[];
}

const STORAGE_KEY = 'eduquest_user_activity';

// Initialize storage with empty activity records
export function initializeActivityStorage(): void {
  if (!localStorage.getItem(STORAGE_KEY)) {
    const emptyActivity: UserActivity = {
      questionBanks: [],
      quizzes: [],
      flashcards: [],
      doubts: []
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(emptyActivity));
  }
}

// Get all activity history
export function getActivityHistory(): UserActivity {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    initializeActivityStorage();
    return getActivityHistory();
  }
  return JSON.parse(data);
}

// Add a new activity item
export function addActivity(type: ActivityItem['type'], activity: Omit<ActivityItem, 'id' | 'timestamp'>): void {
  const history = getActivityHistory();
  const newActivity: ActivityItem = {
    ...activity,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
  };

  switch (type) {
    case 'question_bank':
      history.questionBanks = [newActivity, ...history.questionBanks].slice(0, 50);
      break;
    case 'quiz':
      history.quizzes = [newActivity, ...history.quizzes].slice(0, 50);
      break;
    case 'flashcard':
      history.flashcards = [newActivity, ...history.flashcards].slice(0, 50);
      break;
    case 'doubt':
      history.doubts = [newActivity, ...history.doubts].slice(0, 50);
      break;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

// Get activities by type
export function getActivitiesByType(type: ActivityItem['type']): ActivityItem[] {
  const history = getActivityHistory();
  switch (type) {
    case 'question_bank':
      return history.questionBanks;
    case 'quiz':
      return history.quizzes;
    case 'flashcard':
      return history.flashcards;
    case 'doubt':
      return history.doubts;
    default:
      return [];
  }
}

// Clear all activity history
export function clearActivityHistory(): void {
  initializeActivityStorage();
}

// Get total scores and statistics
export function getActivityStats() {
  const history = getActivityHistory();
  
  return {
    totalQuizzes: history.quizzes.length,
    averageScore: history.quizzes.length > 0
      ? history.quizzes.reduce((acc, quiz) => acc + (quiz.details.score || 0), 0) / history.quizzes.length
      : 0,
    totalFlashcards: history.flashcards.reduce((acc, fc) => acc + (fc.details.cardsReviewed || 0), 0),
    totalQuestionBanks: history.questionBanks.length,
    totalDoubts: history.doubts.length,
    recentActivities: [
      ...history.quizzes,
      ...history.flashcards,
      ...history.questionBanks,
      ...history.doubts
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10)
  };
}