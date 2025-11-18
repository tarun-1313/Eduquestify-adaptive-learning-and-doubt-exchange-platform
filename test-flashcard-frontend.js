// Test script to check if flashcard data is being stored from frontend
import mysql from 'mysql2/promise';

async function checkFlashcardData() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'eduquestify_user',
    password: 'Tarun@2005',
    database: 'eduquestify',
    port: 3307
  });

  try {
    console.log('=== CHECKING FLASHCARD DATA FROM FRONTEND TEST ===');
    
    // Check recent sessions
    const [sessions] = await connection.execute(`
      SELECT * FROM flashcard_sessions 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    console.log(`Recent Sessions: ${sessions.length}`);
    sessions.forEach(session => {
      console.log(`- Session ${session.id}: ${session.subject}/${session.topic} - User ${session.user_id} - ${session.status}`);
    });
    
    // Check recent performance
    const [performance] = await connection.execute(`
      SELECT * FROM flashcard_performance 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    
    console.log(`\nRecent Performance Records: ${performance.length}`);
    performance.forEach(record => {
      console.log(`- Record ${record.id}: Session ${record.session_id} - ${record.subject}/${record.topic} - Correct: ${record.is_correct} - User ${record.user_id}`);
    });
    
    // Check if there are any records for DBMS/Triggers
    const [dbmsRecords] = await connection.execute(`
      SELECT * FROM flashcard_performance 
      WHERE subject = 'DBMS' AND topic = 'Triggers'
      ORDER BY created_at DESC
    `);
    
    console.log(`\nDBMS Triggers Records: ${dbmsRecords.length}`);
    dbmsRecords.forEach(record => {
      console.log(`- DBMS Triggers: Session ${record.session_id} - Correct: ${record.is_correct} - Time: ${record.response_time}s`);
    });
    
  } catch (error) {
    console.error('Error checking data:', error);
  } finally {
    await connection.end();
  }
}

checkFlashcardData();