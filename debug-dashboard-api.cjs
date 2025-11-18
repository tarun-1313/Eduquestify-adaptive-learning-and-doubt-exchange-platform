const mysql = require('mysql2/promise');
require('dotenv').config();

async function debugDashboardAPI() {
  try {
    // Connect to MySQL
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'eduquestify_user',
      password: 'Tarun@2005',
      database: 'eduquestify',
      port: 3307
    });

    console.log('Connected to MySQL database');

    // Test user ID 1
    const userId = 1;
    const limit = 10;

    console.log(`\n=== Testing getUserFlashcardSessionsMySQL for userId: ${userId} ===`);
    
    // Test the exact query that's failing
    const [rows] = await connection.execute(
      'SELECT * FROM flashcard_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
      [userId, limit]
    );
    
    console.log(`Found ${rows.length} sessions:`);
    rows.forEach((row, index) => {
      console.log(`Session ${index + 1}:`, {
        id: row.id,
        subject: row.subject,
        topic: row.topic,
        total_flashcards: row.total_flashcards,
        completed_flashcards: row.completed_flashcards,
        status: row.status,
        created_at: row.created_at
      });
    });

    console.log('\n=== Testing getAllUserFlashcardMasteryMySQL ===');
    
    const [masteryRows] = await connection.execute(
      'SELECT * FROM flashcard_mastery WHERE user_id = ? ORDER BY updated_at DESC',
      [userId]
    );
    
    console.log(`Found ${masteryRows.length} mastery records:`);
    masteryRows.forEach((row, index) => {
      console.log(`Mastery ${index + 1}:`, {
        id: row.id,
        subject: row.subject,
        topic: row.topic,
        mastery_level: row.mastery_level,
        total_flashcards_attempted: row.total_flashcards_attempted,
        average_score: row.average_score
      });
    });

    console.log('\n=== Testing getUserFlashcardStatsMySQL ===');
    
    // Get total sessions
    const [totalSessionsResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM flashcard_sessions WHERE user_id = ?',
      [userId]
    );
    const totalSessions = totalSessionsResult[0]?.total || 0;

    // Get completed sessions
    const [completedSessionsResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM flashcard_sessions WHERE user_id = ? AND status = "completed"',
      [userId]
    );
    const completedSessions = completedSessionsResult[0]?.total || 0;

    // Get total performance records
    const [totalPerformanceResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM flashcard_performance WHERE user_id = ?',
      [userId]
    );
    const totalPerformance = totalPerformanceResult[0]?.total || 0;

    // Get correct answers
    const [correctAnswersResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM flashcard_performance WHERE user_id = ? AND is_correct = true',
      [userId]
    );
    const correctAnswers = correctAnswersResult[0]?.total || 0;

    // Get average score
    const [avgScoreResult] = await connection.execute(
      'SELECT AVG(CASE WHEN is_correct THEN 100 ELSE 0 END) as avg_score FROM flashcard_performance WHERE user_id = ?',
      [userId]
    );
    const averageScore = avgScoreResult[0]?.avg_score || 0;

    console.log('Stats:', {
      totalSessions,
      completedSessions,
      totalPerformance,
      correctAnswers,
      averageScore: Math.round(averageScore)
    });

    await connection.end();
    console.log('\n✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
    console.error('SQL:', error.sql);
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.sqlMessage);
  }
}

debugDashboardAPI();