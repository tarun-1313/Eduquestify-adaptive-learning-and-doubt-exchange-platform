const mysql = require('mysql2/promise');

async function testDashboardFunctions() {
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

    const userId = 1;
    const limit = 10;

    console.log(`\n=== Testing direct SQL query ===`);
    
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

    await connection.end();
    console.log('\n✅ Direct SQL test completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
    console.error('SQL:', error.sql);
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.sqlMessage);
  }
}

testDashboardFunctions();