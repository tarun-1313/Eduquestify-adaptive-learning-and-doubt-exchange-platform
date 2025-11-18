// JWT-based flashcard data management (in-memory storage for demo)
// In production, this would use a proper database or local storage

interface FlashcardSession {
  id: number;
  user_id: number;
  subject: string;
  topic: string;
  total_flashcards: number;
  completed_flashcards: number;
  correct_answers: number;
  session_duration_seconds: number;
  difficulty_level: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  created_at: string;
  completed_at?: string;
}

interface FlashcardMastery {
  id: number;
  user_id: number;
  subject: string;
  topic: string;
  mastery_level: number;
  total_flashcards_attempted: number;
  total_correct_answers: number;
  average_score: number;
  streak_days: number;
  last_practice_date: string;
  next_review_date?: string;
  updated_at: string;
}

interface FlashcardPerformance {
  id: number;
  session_id: number;
  user_id: number;
  subject: string;
  topic: string;
  question_text: string;
  answer_text: string;
  user_answer?: string;
  is_correct?: boolean;
  difficulty: string;
  time_spent_seconds: number;
  created_at: string;
}

// In-memory storage for demo purposes
const flashcardSessions = new Map<number, FlashcardSession[]>();
const flashcardMastery = new Map<number, FlashcardMastery[]>();
const flashcardPerformance = new Map<number, FlashcardPerformance[]>();

let sessionIdCounter = 1;
let masteryIdCounter = 1;
let performanceIdCounter = 1;

// Create a new flashcard session
export async function createFlashcardSessionJWT(data: {
  userId: number;
  subject: string;
  topic: string;
  totalFlashcards: number;
  difficultyLevel?: string;
}) {
  try {
    const session: FlashcardSession = {
      id: sessionIdCounter++,
      user_id: data.userId,
      subject: data.subject,
      topic: data.topic,
      total_flashcards: data.totalFlashcards,
      completed_flashcards: 0,
      correct_answers: 0,
      session_duration_seconds: 0,
      difficulty_level: data.difficultyLevel || 'Medium',
      status: 'in_progress',
      created_at: new Date().toISOString()
    };

    const userSessions = flashcardSessions.get(data.userId) || [];
    userSessions.push(session);
    flashcardSessions.set(data.userId, userSessions);

    return session;
  } catch (error) {
    console.error('Error creating flashcard session:', error);
    throw error;
  }
}

// Update flashcard session progress
export async function updateFlashcardSessionJWT(sessionId: number, data: {
  userId: number;
  completedFlashcards?: number;
  correctAnswers?: number;
  sessionDurationSeconds?: number;
  status?: 'in_progress' | 'completed' | 'abandoned';
}) {
  try {
    const userSessions = flashcardSessions.get(data.userId) || [];
    const sessionIndex = userSessions.findIndex(s => s.id === sessionId);
    
    if (sessionIndex === -1) {
      throw new Error('Session not found');
    }

    const session = userSessions[sessionIndex];
    const updatedSession = {
      ...session,
      completed_flashcards: data.completedFlashcards ?? session.completed_flashcards,
      correct_answers: data.correctAnswers ?? session.correct_answers,
      session_duration_seconds: data.sessionDurationSeconds ?? session.session_duration_seconds,
      status: data.status ?? session.status,
      completed_at: data.status === 'completed' ? new Date().toISOString() : session.completed_at
    };

    userSessions[sessionIndex] = updatedSession;
    flashcardSessions.set(data.userId, userSessions);

    return updatedSession;
  } catch (error) {
    console.error('Error updating flashcard session:', error);
    throw error;
  }
}

// Record flashcard performance
export async function recordFlashcardPerformanceJWT(data: {
  sessionId: number;
  userId: number;
  subject: string;
  topic: string;
  questionText: string;
  answerText: string;
  userAnswer?: string;
  isCorrect?: boolean;
  difficulty?: string;
  timeSpentSeconds?: number;
}) {
  try {
    const performance: FlashcardPerformance = {
      id: performanceIdCounter++,
      session_id: data.sessionId,
      user_id: data.userId,
      subject: data.subject,
      topic: data.topic,
      question_text: data.questionText,
      answer_text: data.answerText,
      user_answer: data.userAnswer,
      is_correct: data.isCorrect,
      difficulty: data.difficulty || 'Medium',
      time_spent_seconds: data.timeSpentSeconds || 0,
      created_at: new Date().toISOString()
    };

    const userPerformance = flashcardPerformance.get(data.userId) || [];
    userPerformance.push(performance);
    flashcardPerformance.set(data.userId, userPerformance);

    return performance;
  } catch (error) {
    console.error('Error recording flashcard performance:', error);
    throw error;
  }
}

// Update or create flashcard mastery record
export async function updateFlashcardMasteryJWT(data: {
  userId: number;
  subject: string;
  topic: string;
  masteryLevel?: number;
  totalFlashcardsAttempted?: number;
  totalCorrectAnswers?: number;
  averageScore?: number;
  streakDays?: number;
}) {
  try {
    const userMastery = flashcardMastery.get(data.userId) || [];
    const existingMasteryIndex = userMastery.findIndex(
      m => m.subject === data.subject && m.topic === data.topic
    );

    if (existingMasteryIndex !== -1) {
      // Update existing mastery
      const existingMastery = userMastery[existingMasteryIndex];
      const updatedMastery: FlashcardMastery = {
        ...existingMastery,
        mastery_level: data.masteryLevel ?? existingMastery.mastery_level,
        total_flashcards_attempted: data.totalFlashcardsAttempted ?? existingMastery.total_flashcards_attempted,
        total_correct_answers: data.totalCorrectAnswers ?? existingMastery.total_correct_answers,
        average_score: data.averageScore ?? existingMastery.average_score,
        streak_days: data.streakDays ?? existingMastery.streak_days,
        last_practice_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      userMastery[existingMasteryIndex] = updatedMastery;
      flashcardMastery.set(data.userId, userMastery);
      return updatedMastery;
    } else {
      // Create new mastery record
      const newMastery: FlashcardMastery = {
        id: masteryIdCounter++,
        user_id: data.userId,
        subject: data.subject,
        topic: data.topic,
        mastery_level: data.masteryLevel || 1,
        total_flashcards_attempted: data.totalFlashcardsAttempted || 0,
        total_correct_answers: data.totalCorrectAnswers || 0,
        average_score: data.averageScore || 0,
        streak_days: data.streakDays || 0,
        last_practice_date: new Date().toISOString(),
        next_review_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        updated_at: new Date().toISOString()
      };

      userMastery.push(newMastery);
      flashcardMastery.set(data.userId, userMastery);
      return newMastery;
    }
  } catch (error) {
    console.error('Error updating flashcard mastery:', error);
    throw error;
  }
}

// Get user's flashcard sessions
export async function getUserFlashcardSessionsJWT(userId: number, limit = 50) {
  try {
    const userSessions = flashcardSessions.get(userId) || [];
    return userSessions
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting user flashcard sessions:', error);
    throw error;
  }
}

// Get user's flashcard mastery for a specific subject/topic
export async function getUserFlashcardMasteryJWT(userId: number, subject: string, topic: string) {
  try {
    const userMastery = flashcardMastery.get(userId) || [];
    return userMastery.find(m => m.subject === subject && m.topic === topic) || null;
  } catch (error) {
    console.error('Error getting user flashcard mastery:', error);
    throw error;
  }
}

// Get all user's flashcard mastery records
export async function getAllUserFlashcardMasteryJWT(userId: number) {
  try {
    const userMastery = flashcardMastery.get(userId) || [];
    return userMastery.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  } catch (error) {
    console.error('Error getting all user flashcard mastery:', error);
    throw error;
  }
}

// Get user's flashcard stats
export async function getUserFlashcardStatsJWT(userId: number) {
  try {
    const userSessions = flashcardSessions.get(userId) || [];
    const userMastery = flashcardMastery.get(userId) || [];
    const userPerformance = flashcardPerformance.get(userId) || [];

    const totalSessions = userSessions.length;
    const totalFlashcards = userSessions.reduce((sum, session) => sum + session.completed_flashcards, 0);
    const totalCorrect = userSessions.reduce((sum, session) => sum + session.correct_answers, 0);
    const totalTime = userSessions.reduce((sum, session) => sum + session.session_duration_seconds, 0);
    const averageAccuracy = totalFlashcards > 0 ? (totalCorrect / totalFlashcards) * 100 : 0;

    return {
      total_sessions: totalSessions,
      total_flashcards_completed: totalFlashcards,
      total_correct_answers: totalCorrect,
      total_study_time_seconds: totalTime,
      average_accuracy_percentage: averageAccuracy,
      topics_mastered: userMastery.filter(m => m.mastery_level >= 3).length,
      total_performance_records: userPerformance.length,
      last_practice_date: userSessions.length > 0 ? userSessions[0].created_at : null
    };
  } catch (error) {
    console.error('Error getting user flashcard stats:', error);
    throw error;
  }
}