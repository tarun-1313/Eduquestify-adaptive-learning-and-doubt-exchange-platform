const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');

async function testDashboardAPI() {
  try {
    // Test database connection
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3307,
      user: 'eduquestify_user',
      password: 'Tarun@2005',
      database: 'eduquestify'
    });

    console.log('Connected to MySQL database');

    // Create a test JWT token (similar to what the app uses)
    const JWT_SECRET = 'cb96c4b6e27155ea28c9c2c91c1ba2e1ffe1b5779f80634e217933dbeaa4f879e5568bdff53593a664b2754a918283b1f41fdfccfcc59edba1b046b833450eea24e76d6a2ec12c1313399d78db97f598a5e76cd49afaea9371bd16756fe6e60f9b835bb4a5ae4ee597b3c51a4654519ce22a80f8db1c886d6085353e820bcbccb3f1e366fea7';
    
    const testUser = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      role: 'Student'
    };

    const token = jwt.sign(testUser, JWT_SECRET, { expiresIn: '30d' });
    console.log('Created test JWT token:', token.substring(0, 50) + '...');

    // Test the database functions directly
    console.log('\n=== TESTING DATABASE FUNCTIONS ===');

    // Test getUserFlashcardSessionsMySQL
    const [sessions] = await connection.execute(
      'SELECT * FROM flashcard_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
      [1, 50]
    );
    console.log(`Sessions for user 1: ${sessions.length} records`);
    sessions.forEach(session => {
      console.log(`- Session ${session.id}: ${session.subject}/${session.topic} - Status: ${session.status} - Completed: ${session.completed_flashcards}/${session.total_flashcards}`);
    });

    // Test getAllUserFlashcardMasteryMySQL
    const [mastery] = await connection.execute(
      'SELECT * FROM flashcard_mastery WHERE user_id = ? ORDER BY updated_at DESC',
      [1]
    );
    console.log(`\nMastery records for user 1: ${mastery.length} records`);
    mastery.forEach(record => {
      console.log(`- ${record.subject}/${record.topic}: Level ${record.mastery_level}, Score: ${record.average_score}%`);
    });

    // Test getUserFlashcardStatsMySQL
    const [totalSessionsResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM flashcard_sessions WHERE user_id = ?',
      [1]
    );
    const totalSessions = totalSessionsResult[0]?.total || 0;

    const [completedSessionsResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM flashcard_sessions WHERE user_id = ? AND status = "completed"',
      [1]
    );
    const completedSessions = completedSessionsResult[0]?.total || 0;

    const [totalPerformanceResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM flashcard_performance WHERE user_id = ?',
      [1]
    );
    const totalPerformance = totalPerformanceResult[0]?.total || 0;

    const [correctAnswersResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM flashcard_performance WHERE user_id = ? AND is_correct = true',
      [1]
    );
    const correctAnswers = correctAnswersResult[0]?.total || 0;

    const [avgScoreResult] = await connection.execute(
      'SELECT AVG(CASE WHEN is_correct THEN 100 ELSE 0 END) as avg_score FROM flashcard_performance WHERE user_id = ?',
      [1]
    );
    const averageScore = avgScoreResult[0]?.avg_score || 0;

    console.log(`\nStats for user 1:`);
    console.log(`- Total Sessions: ${totalSessions}`);
    console.log(`- Completed Sessions: ${completedSessions}`);
    console.log(`- Total Performance Records: ${totalPerformance}`);
    console.log(`- Correct Answers: ${correctAnswers}`);
    console.log(`- Average Score: ${Math.round(averageScore)}%`);

    // Test token verification
    console.log('\n=== TESTING TOKEN VERIFICATION ===');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token decoded successfully:', decoded);

    await connection.end();
    console.log('\n✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testDashboardAPI();