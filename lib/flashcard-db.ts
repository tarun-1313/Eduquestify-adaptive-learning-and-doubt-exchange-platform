import { getDb } from './db';

export interface FlashcardSessionData {
  userId: number;
  subject: string;
  topic: string;
  totalFlashcards: number;
  difficultyLevel?: 'Easy' | 'Medium' | 'Hard';
}

export interface FlashcardPerformanceData {
  sessionId: number;
  userId: number;
  subject: string;
  topic: string;
  questionText: string;
  answerText: string;
  userAnswer?: string;
  isCorrect?: boolean;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  timeSpentSeconds?: number;
}

export interface FlashcardMasteryData {
  userId: number;
  subject: string;
  topic: string;
  masteryLevel?: number;
  totalFlashcardsAttempted?: number;
  totalCorrectAnswers?: number;
  averageScore?: number;
  streakDays?: number;
  nextReviewDate?: Date;
}

// Create a new flashcard session
export async function createFlashcardSession(data: FlashcardSessionData) {
  try {
    const db = getDb();
    
    const [result] = await db.query(
      `INSERT INTO flashcard_sessions (user_id, subject, topic, total_flashcards, difficulty_level, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [data.userId, data.subject, data.topic, data.totalFlashcards, data.difficultyLevel || 'Medium', 'in_progress']
    );
    
    // Get the created session
    const [sessions] = await db.query(
      'SELECT * FROM flashcard_sessions WHERE id = ?',
      [(result as any).insertId]
    );
    
    const rows = sessions as any[];
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error creating flashcard session:', error);
    throw error;
  }
}

// Update flashcard session progress
export async function updateFlashcardSession(sessionId: number, data: {
  completedFlashcards?: number;
  correctAnswers?: number;
  sessionDurationSeconds?: number;
  status?: 'in_progress' | 'completed' | 'abandoned';
}) {
  try {
    const db = getDb();
    
    const updates = [];
    const values = [];
    
    if (data.completedFlashcards !== undefined) {
      updates.push('completed_flashcards = ?');
      values.push(data.completedFlashcards);
    }
    if (data.correctAnswers !== undefined) {
      updates.push('correct_answers = ?');
      values.push(data.correctAnswers);
    }
    if (data.sessionDurationSeconds !== undefined) {
      updates.push('session_duration_seconds = ?');
      values.push(data.sessionDurationSeconds);
    }
    if (data.status !== undefined) {
      updates.push('status = ?');
      values.push(data.status);
      if (data.status === 'completed') {
        updates.push('completed_at = NOW()');
      }
    }
    
    updates.push('updated_at = NOW()');
    values.push(sessionId);
    
    await db.query(
      `UPDATE flashcard_sessions SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    // Get the updated session
    const [sessions] = await db.query(
      'SELECT * FROM flashcard_sessions WHERE id = ?',
      [sessionId]
    );
    
    return (sessions as any[])[0];
  } catch (error) {
    console.error('Error updating flashcard session:', error);
    throw error;
  }
}

// Record flashcard performance
export async function recordFlashcardPerformance(data: FlashcardPerformanceData) {
  try {
    const db = getDb();
    
    const [result] = await db.query(
      `INSERT INTO flashcard_performance (session_id, user_id, subject, topic, question_text, answer_text, user_answer, is_correct, difficulty, time_spent_seconds, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        data.sessionId,
        data.userId,
        data.subject,
        data.topic,
        data.questionText,
        data.answerText,
        data.userAnswer || null,
        data.isCorrect,
        data.difficulty || 'Medium',
        data.timeSpentSeconds || 0
      ]
    );
    
    // Get the created performance record
    const [performances] = await db.query(
      'SELECT * FROM flashcard_performance WHERE id = ?',
      [(result as any).insertId]
    );
    
    return (performances as any[])[0];
  } catch (error) {
    console.error('Error recording flashcard performance:', error);
    throw error;
  }
}

// Update or create flashcard mastery record
export async function updateFlashcardMastery(data: FlashcardMasteryData) {
  try {
    const db = getDb();
    
    // Check if mastery record exists
    const [existingMastery] = await db.query(
      'SELECT * FROM flashcard_mastery WHERE user_id = ? AND subject = ? AND topic = ?',
      [data.userId, data.subject, data.topic]
    );
    
    if ((existingMastery as any[]).length > 0) {
      // Update existing mastery
      const updates = [];
      const values = [];
      
      if (data.masteryLevel !== undefined) {
        updates.push('mastery_level = ?');
        values.push(data.masteryLevel);
      }
      if (data.totalFlashcardsAttempted !== undefined) {
        updates.push('total_flashcards_attempted = ?');
        values.push(data.totalFlashcardsAttempted);
      }
      if (data.totalCorrectAnswers !== undefined) {
        updates.push('total_correct_answers = ?');
        values.push(data.totalCorrectAnswers);
      }
      if (data.averageScore !== undefined) {
        updates.push('average_score = ?');
        values.push(data.averageScore);
      }
      if (data.streakDays !== undefined) {
        updates.push('streak_days = ?');
        values.push(data.streakDays);
      }
      if (data.nextReviewDate !== undefined) {
        updates.push('next_review_date = ?');
        values.push(data.nextReviewDate);
      }
      
      updates.push('last_practice_date = NOW()');
      updates.push('updated_at = NOW()');
      values.push((existingMastery as any[])[0].id);
      
      await db.query(
        `UPDATE flashcard_mastery SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
      
      // Get the updated mastery
      const [mastery] = await db.query(
        'SELECT * FROM flashcard_mastery WHERE id = ?',
        [(existingMastery as any[])[0].id]
      );
      
      return (mastery as any[])[0];
    } else {
      // Create new mastery record
      const [result] = await db.query(
        `INSERT INTO flashcard_mastery (user_id, subject, topic, mastery_level, total_flashcards_attempted, total_correct_answers, average_score, streak_days, last_practice_date, next_review_date, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, NOW(), NOW())`,
        [
          data.userId,
          data.subject,
          data.topic,
          data.masteryLevel || 1,
          data.totalFlashcardsAttempted || 0,
          data.totalCorrectAnswers || 0,
          data.averageScore || 0,
          data.streakDays || 0,
          data.nextReviewDate || null
        ]
      );
      
      // Get the created mastery
      const [mastery] = await db.query(
        'SELECT * FROM flashcard_mastery WHERE id = ?',
        [(result as any).insertId]
      );
      
      return (mastery as any[])[0];
    }
  } catch (error) {
    console.error('Error updating flashcard mastery:', error);
    throw error;
  }
}

// Get user's flashcard sessions
export async function getUserFlashcardSessions(userId: number, limit = 50) {
  try {
    const db = getDb();
    
    const [sessions] = await db.query(
      'SELECT * FROM flashcard_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
      [userId, limit]
    );
    
    return sessions;
  } catch (error) {
    console.error('Error getting user flashcard sessions:', error);
    throw error;
  }
}

// Get user's flashcard mastery for a specific subject/topic
export async function getUserFlashcardMastery(userId: number, subject: string, topic: string) {
  try {
    const db = getDb();
    
    const [mastery] = await db.query(
      'SELECT * FROM flashcard_mastery WHERE user_id = ? AND subject = ? AND topic = ?',
      [userId, subject, topic]
    );
    
    return (mastery as any[])[0] || null;
  } catch (error) {
    console.error('Error getting user flashcard mastery:', error);
    throw error;
  }
}

// Get all user's flashcard mastery records
export async function getAllUserFlashcardMastery(userId: number) {
  try {
    const db = getDb();
    
    const [mastery] = await db.query(
      'SELECT * FROM flashcard_mastery WHERE user_id = ? ORDER BY updated_at DESC',
      [userId]
    );
    
    return mastery;
  } catch (error) {
    console.error('Error getting all user flashcard mastery:', error);
    throw error;
  }
}