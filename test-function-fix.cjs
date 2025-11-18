const mysql = require('mysql2/promise');

async function getUserFlashcardSessionsMySQL(userId, limit = 50) {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'eduquestify_user',
    password: 'Tarun@2005',
    database: 'eduquestify',
    port: 3307
  });

  try {
    const [rows] = await connection.execute(
      'SELECT * FROM flashcard_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
      [userId, limit.toString()]
    );
    return rows;
  } catch (error) {
    console.error('Error getting user flashcard sessions:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

async function testFunction() {
  try {
    console.log('Testing getUserFlashcardSessionsMySQL function...');
    const sessions = await getUserFlashcardSessionsMySQL(1, 10);
    console.log(`✅ Function works! Found ${sessions.length} sessions`);
    
    sessions.forEach((session, index) => {
      console.log(`Session ${index + 1}:`, {
        id: session.id,
        subject: session.subject,
        topic: session.topic,
        total_flashcards: session.total_flashcards,
        status: session.status,
        created_at: session.created_at
      });
    });
  } catch (error) {
    console.error('❌ Function failed:', error.message);
  }
}

testFunction();