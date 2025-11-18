import mysql from 'mysql2/promise';

async function listQuizAttempts() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'eduquestify_user',
    password: 'Tarun@2005',
    database: 'eduquestify',
    port: 3307
  });

  try {
    // Get the 10 most recent quiz attempts
    const [attempts] = await connection.execute(
      `SELECT 
        id, 
        user_id,
        subject,
        topic,
        difficulty,
        score,
        total_questions,
        CONCAT(percentage, '%') as score_percentage,
        DATE_FORMAT(completed_at, '%Y-%m-%d %H:%i:%s') as completed_at
      FROM quiz_attempts 
      ORDER BY completed_at DESC
      LIMIT 10`
    );
    
    console.log('\n=== RECENT QUIZ ATTEMPTS ===');
    console.table(attempts);
    
    // Count attempts by user
    const [userStats] = await connection.execute(
      `SELECT 
        user_id,
        COUNT(*) as total_attempts,
        AVG(percentage) as avg_score,
        MAX(completed_at) as last_attempt
      FROM quiz_attempts
      GROUP BY user_id`
    );
    
    console.log('\n=== USER QUIZ STATS ===');
    console.table(userStats);
    
  } catch (error) {
    console.error('Error fetching quiz attempts:', error);
    if (error.sql) {
      console.error('SQL:', error.sql);
      console.error('SQL Message:', error.sqlMessage);
    }
  } finally {
    await connection.end();
  }
}

listQuizAttempts().catch(console.error);
