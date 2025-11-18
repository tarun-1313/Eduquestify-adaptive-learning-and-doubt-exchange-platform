import { getDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { bus as realtimeBus } from '@/lib/realtime-bus';

export async function POST(request) {
  console.log('Save attempt request received');
  const pool = getDb();
  let connection;
  
  // Log initial request details
  console.log('Request URL:', request.url);
  console.log('Request method:', request.method);
  console.log('Request headers:', Object.fromEntries(request.headers.entries()));
  
  try {
    // Get user from JWT token
    const { user, token } = await getUserFromRequest();
    console.log('Auth check - User:', user ? 'Authenticated' : 'Not authenticated');
    
    if (!user || !token) {
      console.error('Unauthorized: No valid token found');
      return new Response(JSON.stringify({ 
        error: 'Unauthorized',
        message: 'Please log in to save quiz attempts',
        authenticated: false
      }), { 
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'http://localhost:3000',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Credentials': 'true'
        }
      });
    }

    let requestData;
    try {
      requestData = await request.json();
      console.log('Request data:', requestData);
    } catch (error) {
      console.error('Error parsing request JSON:', error);
      return new Response(JSON.stringify({ 
        error: 'Invalid JSON',
        message: error.message 
      }), { 
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'http://localhost:3000',
          'Access-Control-Allow-Credentials': 'true'
        }
      });
    }
    
    const { subject, topic, difficulty, score, totalQuestions } = requestData || {};
    const userId = user.id;
    const userRole = user.role;
    
    if (!userId) {
      console.error('No user ID in session', { session });
      return new Response(JSON.stringify({ 
        error: 'Invalid session',
        message: 'No user ID found in session',
        session: JSON.stringify(session, null, 2)
      }), { 
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'http://localhost:3000',
          'Access-Control-Allow-Credentials': 'true'
        }
      });
    }
    
    console.log('Processing save for user:', userId, 'with data:', {
      subject, topic, difficulty, score, totalQuestions
    });
    
    if (!subject || !topic || !difficulty || score === undefined || !totalQuestions) {
      const errorDetails = { 
        subject: subject || 'missing',
        topic: topic || 'missing',
        difficulty: difficulty || 'missing',
        score: score === undefined ? 'missing' : score,
        totalQuestions: totalQuestions || 'missing'
      };
      
      console.error('Missing required fields:', errorDetails);
      return new Response(JSON.stringify({ 
        error: 'Missing required fields',
        details: errorDetails
      }), { 
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'http://localhost:3000',
          'Access-Control-Allow-Credentials': 'true'
        }
      });
    }
    
    const percentage = Math.round((score / totalQuestions) * 100);
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    // Get a connection from the pool
    console.log('Getting database connection from pool...');
    try {
      connection = await pool.getConnection();
      console.log('Database connection established');
      console.log('Database connection info:', {
        host: connection.config.host,
        database: connection.config.database,
        user: connection.config.user,
        port: connection.config.port
      });
    } catch (connError) {
      console.error('Failed to get database connection:', connError);
      return new Response(JSON.stringify({ 
        error: 'Database connection failed',
        message: connError.message,
        code: connError.code
      }), { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'http://localhost:3000',
          'Access-Control-Allow-Credentials': 'true'
        }
      });
    }

    try {
      // Start transaction
      try {
        await connection.beginTransaction();
        console.log('Transaction started');
      } catch (txError) {
        console.error('Failed to start transaction:', txError);
        return new Response(JSON.stringify({ 
          error: 'Transaction failed',
          message: txError.message,
          code: txError.code
        }), { 
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'http://localhost:3000',
            'Access-Control-Allow-Credentials': 'true'
          }
        });
      }

      // Save quiz attempt
      console.log('Saving quiz attempt to database...');
      const [result] = await connection.execute(
        `INSERT INTO quiz_attempts 
         (user_id, subject, topic, difficulty, score, total_questions, percentage, completed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, subject, topic, difficulty, score, totalQuestions, percentage, now]
      );
      
      if (!result.insertId) {
        throw new Error('Failed to save quiz attempt: No insert ID returned');
      }
      console.log('Quiz attempt saved with ID:', result.insertId);

      // Calculate XP earned
      const xpEarned = calculateXPEarned(score, totalQuestions, difficulty);
      console.log('XP earned:', xpEarned);
      
      // Update or create user progress
      console.log('Updating user progress...');
      const [progressResult] = await connection.execute(
        `INSERT INTO user_progress 
         (user_id, level, total_xp, xp_to_next_level, last_activity)
         VALUES (?, 1, ?, 1000, ?)
         ON DUPLICATE KEY UPDATE
           total_xp = total_xp + ?,
           last_activity = ?`,
        [userId, xpEarned, now, xpEarned, now]
      );
      console.log('User progress updated:', progressResult);

      console.log('User progress updated');

      // Update or create subject mastery
      console.log('Updating subject mastery...');
      const [masteryResult] = await connection.execute(
        `INSERT INTO subject_mastery 
         (user_id, subject, mastery_level, quizzes_taken, average_score, last_quiz_date)
         VALUES (?, ?, 1, 1, ?, ?)
         ON DUPLICATE KEY UPDATE
         quizzes_taken = quizzes_taken + 1,
         average_score = ((average_score * (quizzes_taken - 1)) + ?) / quizzes_taken,
         last_quiz_date = ?,
         mastery_level = LEAST(10, FLOOR(average_score / 10) + 1)`,
        [userId, subject, percentage, now, percentage, now]
      );
      console.log('Subject mastery updated:', masteryResult);

      // Commit transaction
      await connection.commit();
      console.log('Transaction committed successfully');
      
      // Broadcast real-time updates
      try {
        console.log('Broadcasting real-time updates...');
        
        // Get updated user stats for broadcasting
        const [updatedProgress] = await connection.execute(
          `SELECT level, total_xp, xp_to_next_level FROM user_progress WHERE user_id = ?`,
          [userId]
        );
        
        const [updatedMastery] = await connection.execute(
          `SELECT subject, mastery_level, average_score FROM subject_mastery WHERE user_id = ? AND subject = ?`,
          [userId, subject]
        );
        
        // Broadcast quiz completion event
        realtimeBus.emit('quiz:completed', {
          userId,
          quizData: {
            subject,
            topic,
            difficulty,
            score,
            totalQuestions,
            percentage,
            xpEarned,
            completedAt: now
          }
        });
        
        // Broadcast XP update event
        if (updatedProgress.length > 0) {
          realtimeBus.emit('xp:updated', {
            userId,
            xp: updatedProgress[0].total_xp,
            level: updatedProgress[0].level,
            xpToNext: updatedProgress[0].xp_to_next_level,
            xpEarned
          });
        }
        
        // Broadcast mastery update event
        if (updatedMastery.length > 0) {
          realtimeBus.emit('mastery:updated', {
            userId,
            subject,
            masteryLevel: updatedMastery[0].mastery_level,
            averageScore: updatedMastery[0].average_score
          });
        }
        
        // Broadcast dashboard update event
        realtimeBus.emit('dashboard:update', {
          userId,
          type: 'quiz_completed',
          data: {
            subject,
            topic,
            difficulty,
            score,
            percentage,
            xpEarned
          }
        });
        
        console.log('Real-time updates broadcasted successfully');
      } catch (broadcastError) {
        console.error('Error broadcasting real-time updates:', broadcastError);
        // Don't fail the request if broadcasting fails
      }
      
      // Return success response
      return new Response(JSON.stringify({ 
        success: true,
        message: 'Quiz attempt saved successfully',
        attemptId: result.insertId,
        xpEarned
      }), { 
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'http://localhost:3000',
          'Access-Control-Allow-Credentials': 'true'
        }
      });
    } catch (error) {
      // Rollback in case of error
      console.error('Error in transaction:', error);
      if (connection) {
        try {
          await connection.rollback();
          console.log('Transaction rolled back');
        } catch (rollbackError) {
          console.error('Error rolling back transaction:', rollbackError);
        }
      }
      
      // Log detailed error information
      const errorInfo = {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code,
        errno: error.errno,
        sql: error.sql,
        sqlMessage: error.sqlMessage,
        sqlState: error.sqlState
      };
      console.error('Database error details:', errorInfo);
      
      throw error;
    } finally {
      if (connection) {
        try {
          await connection.release(); // Release the connection back to the pool
          console.log('Database connection released');
        } catch (releaseError) {
          console.error('Error releasing database connection:', releaseError);
        }
      }
    }

    // This line is unreachable due to the early return in the try block
    // but we'll keep it as a fallback
  } catch (error) {
    console.error('Error in save attempt endpoint:', error);
    
    // Prepare error response
    const errorResponse = {
      error: 'Failed to save quiz attempt',
      message: error.message,
      name: error.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      details: {
        code: error.code,
        errno: error.errno,
        sql: error.sql ? error.sql.substring(0, 200) + (error.sql.length > 200 ? '...' : '') : undefined,
        sqlMessage: error.sqlMessage,
        sqlState: error.sqlState
      }
    };
    
    return new Response(JSON.stringify(errorResponse), { 
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Access-Control-Allow-Credentials': 'true'
      }
    });
  }
}

function calculateXPEarned(score, totalQuestions, difficulty) {
  const baseXP = {
    'Easy': 10,
    'Medium': 20,
    'Hard': 30
  };
  
  const scorePercentage = score / totalQuestions;
  return Math.round(baseXP[difficulty] * scorePercentage * 10);
}
