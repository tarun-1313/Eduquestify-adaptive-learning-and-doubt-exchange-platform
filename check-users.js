import mysql from 'mysql2/promise';

async function checkUsers() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'eduquestify_user',
    password: 'Tarun@2005',
    database: 'eduquestify',
    port: 3307
  });

  try {
    console.log('=== CHECKING USERS IN DATABASE ===');
    
    // Check users
    const [users] = await connection.execute(`
      SELECT * FROM users 
      ORDER BY id 
      LIMIT 10
    `);
    
    console.log(`Users found: ${users.length}`);
    users.forEach(user => {
      console.log(`- User ${user.id}: ${user.username} (${user.email})`);
    });
    
    // Check current sessions
    const [sessions] = await connection.execute(`
      SELECT fs.*, u.username 
      FROM flashcard_sessions fs
      JOIN users u ON fs.user_id = u.id
      ORDER BY fs.created_at DESC 
      LIMIT 5
    `);
    
    console.log(`\nFlashcard Sessions: ${sessions.length}`);
    sessions.forEach(session => {
      console.log(`- Session ${session.id}: ${session.subject}/${session.topic} - User ${session.user_id} (${session.username}) - ${session.status}`);
    });
    
  } catch (error) {
    console.error('Error checking data:', error);
  } finally {
    await connection.end();
  }
}

checkUsers();