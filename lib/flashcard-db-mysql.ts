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
export async function createFlashcardSessionMySQL(data: FlashcardSessionData) {
  const db = getDb();
  try {
    const [result] = await db.execute(
      `INSERT INTO flashcard_sessions (user_id, subject, topic, total_flashcards, difficulty_level, status, created_at) 
       VALUES (?, ?, ?, ?, ?, 'in_progress', NOW())`,
      [data.userId, data.subject, data.topic, data.totalFlashcards, data.difficultyLevel || 'Medium']
    );
    
    const sessionId = (result as any).insertId;
    
    // Return the created session
    const [rows] = await db.execute(
      'SELECT * FROM flashcard_sessions WHERE id = ?',
      [sessionId]
    );
    
    return (rows as any[])[0];
  } catch (error) {
    console.error('Error creating flashcard session:', error);
    throw error;
  }
}

// Update flashcard session progress
export async function updateFlashcardSessionMySQL(sessionId: number, data: {
  completedFlashcards?: number;
  correctAnswers?: number;
  sessionDurationSeconds?: number;
  status?: 'in_progress' | 'completed' | 'abandoned';
}) {
  const db = getDb();
  try {
    const fields = [];
    const values = [];
    
    if (data.completedFlashcards !== undefined) {
      fields.push('completed_flashcards = ?');
      values.push(data.completedFlashcards);
    }
    if (data.correctAnswers !== undefined) {
      fields.push('correct_answers = ?');
      values.push(data.correctAnswers);
    }
    if (data.sessionDurationSeconds !== undefined) {
      fields.push('session_duration_seconds = ?');
      values.push(data.sessionDurationSeconds);
    }
    if (data.status !== undefined) {
      fields.push('status = ?');
      values.push(data.status);
      if (data.status === 'completed') {
        fields.push('completed_at = NOW()');
      }
    }
    
    values.push(sessionId);
    
    const query = `UPDATE flashcard_sessions SET ${fields.join(', ')} WHERE id = ?`;
    
    await db.execute(query, values);
    
    // Return the updated session
    const [rows] = await db.execute(
      'SELECT * FROM flashcard_sessions WHERE id = ?',
      [sessionId]
    );
    
    return (rows as any[])[0];
  } catch (error) {
    console.error('Error updating flashcard session:', error);
    throw error;
  }
}

// Record flashcard performance
export async function recordFlashcardPerformanceMySQL(data: FlashcardPerformanceData) {
  const db = getDb();
  try {
    const [result] = await db.execute(
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
        data.isCorrect || false, 
        data.difficulty || 'Medium', 
        data.timeSpentSeconds || 0
      ]
    );
    
    const performanceId = (result as any).insertId;
    
    // Return the created performance record
    const [rows] = await db.execute(
      'SELECT * FROM flashcard_performance WHERE id = ?',
      [performanceId]
    );
    
    return (rows as any[])[0];
  } catch (error) {
    console.error('Error recording flashcard performance:', error);
    throw error;
  }
}

// Update or create flashcard mastery record
export async function updateFlashcardMasteryMySQL(data: FlashcardMasteryData) {
  const db = getDb();
  try {
    // Check if existing mastery record exists
    const [existingRows] = await db.execute(
      'SELECT * FROM flashcard_mastery WHERE user_id = ? AND subject = ? AND topic = ?',
      [data.userId, data.subject, data.topic]
    );
    
    const existingMastery = (existingRows as any[])[0];
    
    if (existingMastery) {
      // Update existing mastery
      const fields = [];
      const values = [];
      
      if (data.masteryLevel !== undefined) {
        fields.push('mastery_level = ?');
        values.push(data.masteryLevel);
      }
      if (data.totalFlashcardsAttempted !== undefined) {
        fields.push('total_flashcards_attempted = ?');
        values.push(data.totalFlashcardsAttempted);
      }
      if (data.totalCorrectAnswers !== undefined) {
        fields.push('total_correct_answers = ?');
        values.push(data.totalCorrectAnswers);
      }
      if (data.averageScore !== undefined) {
        fields.push('average_score = ?');
        values.push(data.averageScore);
      }
      if (data.streakDays !== undefined) {
        fields.push('streak_days = ?');
        values.push(data.streakDays);
      }
      
      fields.push('last_practice_date = NOW()');
      
      if (data.nextReviewDate !== undefined) {
        fields.push('next_review_date = ?');
        values.push(data.nextReviewDate);
      }
      
      values.push(existingMastery.id);
      
      const query = `UPDATE flashcard_mastery SET ${fields.join(', ')} WHERE id = ?`;
      await db.execute(query, values);
      
      // Return updated mastery
      const [updatedRows] = await db.execute(
        'SELECT * FROM flashcard_mastery WHERE id = ?',
        [existingMastery.id]
      );
      
      return (updatedRows as any[])[0];
    } else {
      // Create new mastery record
      const [result] = await db.execute(
        `INSERT INTO flashcard_mastery (user_id, subject, topic, mastery_level, total_flashcards_attempted, total_correct_answers, average_score, streak_days, last_practice_date, next_review_date) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
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
      
      const masteryId = (result as any).insertId;
      
      // Return created mastery
      const [rows] = await db.execute(
        'SELECT * FROM flashcard_mastery WHERE id = ?',
        [masteryId]
      );
      
      return (rows as any[])[0];
    }
  } catch (error) {
    console.error('Error updating flashcard mastery:', error);
    throw error;
  }
}

// Get user's flashcard sessions
export async function getUserFlashcardSessionsMySQL(userId: number, limit = 50) {
  const db = getDb();
  try {
    const [rows] = await db.execute(
      'SELECT * FROM flashcard_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
      [userId, limit.toString()]
    );
    return rows as any[];
  } catch (error) {
    console.error('Error getting user flashcard sessions:', error);
    throw error;
  }
}

// Get user's flashcard mastery for a specific subject/topic
export async function getUserFlashcardMasteryMySQL(userId: number, subject: string, topic: string) {
  const db = getDb();
  try {
    const [rows] = await db.execute(
      'SELECT * FROM flashcard_mastery WHERE user_id = ? AND subject = ? AND topic = ?',
      [userId, subject, topic]
    );
    return (rows as any[])[0] || null;
  } catch (error) {
    console.error('Error getting user flashcard mastery:', error);
    throw error;
  }
}

// Get all user's flashcard mastery records
export async function getAllUserFlashcardMasteryMySQL(userId: number) {
  const db = getDb();
  try {
    const [rows] = await db.execute(
      'SELECT * FROM flashcard_mastery WHERE user_id = ? ORDER BY updated_at DESC',
      [userId]
    );
    return rows as any[];
  } catch (error) {
    console.error('Error getting all user flashcard mastery:', error);
    throw error;
  }
}

// Get user flashcard statistics
export async function getUserFlashcardStatsMySQL(userId: number) {
  const db = getDb();
  try {
    // Get total sessions
    const [totalSessionsResult] = await db.execute(
      'SELECT COUNT(*) as total FROM flashcard_sessions WHERE user_id = ?',
      [userId]
    );
    const totalSessions = (totalSessionsResult as any[])[0]?.total || 0;

    // Get completed sessions
    const [completedSessionsResult] = await db.execute(
      'SELECT COUNT(*) as total FROM flashcard_sessions WHERE user_id = ? AND status = "completed"',
      [userId]
    );
    const completedSessions = (completedSessionsResult as any[])[0]?.total || 0;

    // Get total performance records
    const [totalPerformanceResult] = await db.execute(
      'SELECT COUNT(*) as total FROM flashcard_performance WHERE user_id = ?',
      [userId]
    );
    const totalPerformance = (totalPerformanceResult as any[])[0]?.total || 0;

    // Get correct answers
    const [correctAnswersResult] = await db.execute(
      'SELECT COUNT(*) as total FROM flashcard_performance WHERE user_id = ? AND is_correct = true',
      [userId]
    );
    const correctAnswers = (correctAnswersResult as any[])[0]?.total || 0;

    // Get average score
    const [avgScoreResult] = await db.execute(
      'SELECT AVG(CASE WHEN is_correct THEN 100 ELSE 0 END) as avg_score FROM flashcard_performance WHERE user_id = ?',
      [userId]
    );
    const averageScore = (avgScoreResult as any[])[0]?.avg_score || 0;

    return {
      totalSessions,
      completedSessions,
      totalPerformance,
      correctAnswers,
      averageScore: Math.round(averageScore)
    };
  } catch (error) {
    console.error('Error getting user flashcard stats:', error);
    throw error;
  }
}