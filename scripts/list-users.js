import mysql from 'mysql2/promise';

async function listUsers() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'eduquestify_user',
    password: 'Tarun@2005',
    database: 'eduquestify',
    port: 3307
  });

  try {
    // Get users
    const [users] = await connection.query('SELECT id, email, name, role, created_at FROM users');
    console.log('\n=== EXISTING USERS ===');
    console.table(users);
    
    // Get quiz attempts with formatted date
    const [attempts] = await connection.query(`
      SELECT 
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
    `);
    console.log('\n=== QUIZ ATTEMPTS ===');
    console.table(attempts);
    
    // Get user progress
    const [progress] = await connection.query(`
      SELECT 
        user_id,
        level,
        total_xp,
        xp_to_next_level,
        DATE_FORMAT(last_activity, '%Y-%m-%d %H:%i:%s') as last_activity
      FROM user_progress
    `);
    console.log('\n=== USER PROGRESS ===');
    console.table(progress);
    
    // Get subject mastery
    const [mastery] = await connection.query(`
      SELECT 
        user_id,
        subject,
        mastery_level,
        quizzes_taken,
        CONCAT(average_score, '%') as average_score,
        DATE_FORMAT(last_quiz_date, '%Y-%m-%d %H:%i:%s') as last_quiz_date
      FROM subject_mastery
      ORDER BY user_id, subject
    `);
    console.log('\n=== SUBJECT MASTERY ===');
    console.table(mastery);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

listUsers().catch(console.error);
