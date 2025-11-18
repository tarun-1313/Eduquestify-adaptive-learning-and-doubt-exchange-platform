import mysql from 'mysql2/promise';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFile } from 'fs/promises';

export async function checkAndFixTables() {
  const dbConfig = {
    host: 'localhost',
    user: 'eduquestify_user',
    password: 'Tarun@2005',
    database: 'eduquestify',
    port: 3307,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };
  
  const pool = mysql.createPool(dbConfig);

  const connection = await pool.getConnection();
  
  try {
    console.log('Connected to database');
    
    // Check if tables exist
    const [tables] = await connection.query(
      `SHOW TABLES WHERE Tables_in_${dbConfig.database} IN ('quiz_attempts', 'user_progress', 'subject_mastery')`
    );
    
    const existingTables = tables.map(row => Object.values(row)[0]);
    console.log('Existing tables:', existingTables);
    
    console.log(`Found ${tables.length} out of 3 required tables`);
    
    // If any table is missing, create them
    if (tables.length < 3) {
      console.log('Some tables are missing, creating them...');
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      const sql = await readFile(join(__dirname, 'sql/002_quiz_tracking.sql'), 'utf8');
      
      // Split the SQL file into individual statements
      const statements = sql
        .split(';')
        .map(statement => statement.trim())
        .filter(statement => statement.length > 0);
      
      for (const statement of statements) {
        try {
          await connection.query(statement);
          console.log('Executed:', statement.split('\n')[0], '...');
        } catch (error) {
          console.error('Error executing statement:', error.message);
          console.error('Statement:', statement);
        }
      }
    }
    
    // Check for test user
    const [users] = await connection.query('SELECT id FROM users WHERE email = ?', ['test@example.com']);
    let testUserId = users[0]?.id;
    
    if (!testUserId) {
      console.log('Creating test user...');
      await connection.query(
        'INSERT INTO users (email, name, role) VALUES (?, ?, ?)',
        ['test@example.com', 'Test User', 'student']
      );
      testUserId = (await connection.query('SELECT LAST_INSERT_ID() as id'))[0][0].id;
    }
    
    // Check for test data
    const [attempts] = await connection.query('SELECT COUNT(*) as count FROM quiz_attempts');
    if (attempts[0].count === 0) {
      console.log('Adding test quiz attempt...');
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
      await connection.query(
        `INSERT INTO quiz_attempts 
         (user_id, subject, topic, difficulty, score, total_questions, percentage, completed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [testUserId, 'Math', 'Algebra', 'Easy', 8, 10, 80, now]
      );
      
      // Update user progress
      await connection.query(
        `INSERT INTO user_progress 
         (user_id, level, total_xp, xp_to_next_level, last_activity)
         VALUES (?, 1, 100, 1000, ?)
         ON DUPLICATE KEY UPDATE
         total_xp = total_xp + 100,
         xp_to_next_level = xp_to_next_level - 100,
         last_activity = ?`,
        [testUserId, now, now]
      );
      
      // Update subject mastery
      await connection.query(
        `INSERT INTO subject_mastery 
         (user_id, subject, mastery_level, quizzes_taken, average_score, last_quiz_date)
         VALUES (?, ?, 1, 1, 80, ?)
         ON DUPLICATE KEY UPDATE
         quizzes_taken = quizzes_taken + 1,
         average_score = ((average_score * (quizzes_taken - 1)) + 80) / quizzes_taken,
         last_quiz_date = ?,
         mastery_level = LEAST(10, FLOOR((((average_score * (quizzes_taken - 1)) + 80) / quizzes_taken) / 10) + 1)`,
        [testUserId, 'Math', now, now]
      );
      
      console.log('Test data added successfully');
    }
    
    console.log('Database check completed successfully');
  } catch (error) {
    console.error('Error checking/creating tables:', error);
  } finally {
    if (connection) await connection.release();
    await pool.end();
  }
}

// Run the function
checkAndFixTables().catch(console.error);
