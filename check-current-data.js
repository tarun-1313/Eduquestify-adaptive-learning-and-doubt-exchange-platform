import mysql from 'mysql2/promise';

async function checkCurrentData() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'eduquestify_user',
    password: 'Tarun@2005',
    database: 'eduquestify',
    port: 3307
  });

  try {
    console.log('=== CURRENT FLASHCARD DATA FOR USER 1 (Tarun) ===');
    
    // Check sessions for user 1
    const [sessions] = await connection.execute(`
      SELECT * FROM flashcard_sessions 
      WHERE user_id = 1
      ORDER BY created_at DESC
    `);
    
    console.log(`Sessions for User 1: ${sessions.length}`);
    sessions.forEach(session => {
      console.log(`- Session ${session.id}: ${session.subject}/${session.topic} - ${session.status} - ${session.total_flashcards} cards`);
    });
    
    // Check performance for user 1
    const [performance] = await connection.execute(`
      SELECT * FROM flashcard_performance 
      WHERE user_id = 1
      ORDER BY created_at DESC
    `);
    
    console.log(`\nPerformance records for User 1: ${performance.length}`);
    performance.forEach(record => {
      console.log(`- Record ${record.id}: ${record.subject}/${record.topic} - Correct: ${record.is_correct} - Time: ${record.response_time}s`);
    });
    
    // Check if there are any subjects recorded
    const [subjects] = await connection.execute(`
      SELECT DISTINCT subject, topic 
      FROM flashcard_performance 
      WHERE user_id = 1
      ORDER BY subject, topic
    `);
    
    console.log(`\nUnique subjects/topics for User 1: ${subjects.length}`);
    subjects.forEach(subject => {
      console.log(`- ${subject.subject}: ${subject.topic}`);
    });
    
  } catch (error) {
    console.error('Error checking data:', error);
  } finally {
    await connection.end();
  }
}

checkCurrentData();