import mysql from 'mysql2/promise';

async function checkFlashcardData() {
  try {
    // Create connection using the same configuration as the app
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3307,
      user: 'eduquestify_user',
      password: 'Tarun@2005',
      database: 'eduquestify'
    });

    console.log('Connected to MySQL database');

    // Check flashcard_performance table
    const [performanceRows] = await connection.execute('SELECT * FROM flashcard_performance');
    console.log('\n=== FLASHCARD_PERFORMANCE TABLE ===');
    console.log(`Total records: ${performanceRows.length}`);
    if (performanceRows.length > 0) {
      console.log('Sample records:');
      performanceRows.slice(0, 3).forEach(row => {
        console.log(`- ID: ${row.id}, SessionID: ${row.session_id}, UserID: ${row.user_id}, Subject: ${row.subject}, Topic: ${row.topic}, Correct: ${row.is_correct}, Time: ${row.time_spent_seconds}s`);
      });
    }

    // Check flashcard_mastery table
    const [masteryRows] = await connection.execute('SELECT * FROM flashcard_mastery');
    console.log('\n=== FLASHCARD_MASTERY TABLE ===');
    console.log(`Total records: ${masteryRows.length}`);
    if (masteryRows.length > 0) {
      console.log('Sample records:');
      masteryRows.slice(0, 3).forEach(row => {
        console.log(`- ID: ${row.id}, UserID: ${row.user_id}, Subject: ${row.subject}, Topic: ${row.topic}, MasteryLevel: ${row.mastery_level}`);
      });
    }

    // Check flashcard_sessions table
    const [sessionRows] = await connection.execute('SELECT * FROM flashcard_sessions');
    console.log('\n=== FLASHCARD_SESSIONS TABLE ===');
    console.log(`Total records: ${sessionRows.length}`);
    if (sessionRows.length > 0) {
      console.log('All records:');
      sessionRows.forEach(row => {
        console.log(`- ID: ${row.id}, UserID: ${row.user_id}, Subject: ${row.subject}, Topic: ${row.topic}, Status: ${row.status}`);
      });
    }

    // Check sessions specifically for user ID 1
    const [user1Sessions] = await connection.execute('SELECT * FROM flashcard_sessions WHERE user_id = 1');
    console.log('\n=== SESSIONS FOR USER ID 1 ===');
    console.log(`Total records for user 1: ${user1Sessions.length}`);
    if (user1Sessions.length > 0) {
      user1Sessions.forEach(row => {
        console.log(`- ID: ${row.id}, Subject: ${row.subject}, Topic: ${row.topic}, Status: ${row.status}`);
      });
    }

    // Check flashcard_subjects table
    const [subjectRows] = await connection.execute('SELECT * FROM flashcard_subjects');
    console.log('\n=== FLASHCARD_SUBJECTS TABLE ===');
    console.log(`Total records: ${subjectRows.length}`);
    if (subjectRows.length > 0) {
      console.log('Sample records:');
      subjectRows.slice(0, 3).forEach(row => {
        console.log(`- ID: ${row.id}, Name: ${row.name}, Description: ${row.description}`);
      });
    }

    await connection.end();
    console.log('\nDatabase connection closed.');

  } catch (error) {
    console.error('Error checking database:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('MySQL server is not running or not accessible on port 3307');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('Access denied - check username/password');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('Database does not exist');
    }
  }
}

checkFlashcardData();