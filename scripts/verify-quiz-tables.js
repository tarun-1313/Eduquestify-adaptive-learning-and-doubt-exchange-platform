import mysql from 'mysql2/promise';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFile } from 'fs/promises';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3307'),
  user: process.env.MYSQL_USER || 'eduquestify_user',
  password: process.env.MYSQL_PASSWORD || 'Tarun@2005',
  database: process.env.MYSQL_DATABASE || 'eduquestify',
  multipleStatements: true
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function checkTables() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    // Check if tables exist
    const [tables] = await connection.query(
      `SELECT table_name 
       FROM information_schema.tables 
       WHERE table_schema = ? 
       AND table_name IN ('quiz_attempts', 'user_progress', 'subject_mastery')`,
      [dbConfig.database]
    );

    const existingTables = tables.map(t => t.TABLE_NAME || t.table_name);
    const missingTables = ['quiz_attempts', 'user_progress', 'subject_mastery']
      .filter(table => !existingTables.includes(table));

    if (missingTables.length > 0) {
      console.log('Some quiz tables are missing. Creating them now...');
      const sqlPath = join(__dirname, 'sql', '002_quiz_tracking.sql');
      const sql = await readFile(sqlPath, 'utf-8');
      await connection.query(sql);
      console.log('Quiz tables created successfully!');
    } else {
      console.log('All quiz tables exist.');
    }

    // Add sample data if tables are empty
    await addSampleData(connection);
    
  } catch (error) {
    console.error('Error setting up quiz tables:', error);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

async function addSampleData(connection) {
  try {
    // Check if we have any users
    const [users] = await connection.query('SELECT id FROM users LIMIT 1');
    if (users.length === 0) {
      console.log('No users found. Please create a user first.');
      return;
    }
    
    const userId = users[0].id;
    
    // Check if we already have quiz attempts
    const [existingAttempts] = await connection.query('SELECT id FROM quiz_attempts LIMIT 1');
    
    if (existingAttempts.length === 0) {
      console.log('Adding sample quiz data...');
      
      // Add sample quiz attempts
      const now = new Date();
      const oneDay = 24 * 60 * 60 * 1000; // 1 day in milliseconds
      
      const sampleAttempts = [
        {
          user_id: userId,
          subject: 'Science',
          topic: 'Biology',
          difficulty: 'Medium',
          score: 4,
          total_questions: 5,
          percentage: 80.0,
          completed_at: new Date(now - (oneDay * 1)).toISOString().slice(0, 19).replace('T', ' ')
        },
        {
          user_id: userId,
          subject: 'Mathematics',
          topic: 'Algebra',
          difficulty: 'Hard',
          score: 3,
          total_questions: 5,
          percentage: 60.0,
          completed_at: new Date(now - (oneDay * 2)).toISOString().slice(0, 19).replace('T', ' ')
        },
        {
          user_id: userId,
          subject: 'History',
          topic: 'World War II',
          difficulty: 'Easy',
          score: 5,
          total_questions: 5,
          percentage: 100.0,
          completed_at: new Date(now - (oneDay * 3)).toISOString().slice(0, 19).replace('T', ' ')
        }
      ];

      // Insert sample quiz attempts
      for (const attempt of sampleAttempts) {
        await connection.query(
          `INSERT INTO quiz_attempts 
           (user_id, subject, topic, difficulty, score, total_questions, percentage, completed_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            attempt.user_id,
            attempt.subject,
            attempt.topic,
            attempt.difficulty,
            attempt.score,
            attempt.total_questions,
            attempt.percentage,
            attempt.completed_at
          ]
        );

        // Update or create user progress
        await connection.query(
          `INSERT INTO user_progress 
           (user_id, level, total_xp, xp_to_next_level, last_activity)
           VALUES (?, 1, 1000, 2000, ?)
           ON DUPLICATE KEY UPDATE
           total_xp = total_xp + 100,
           last_activity = VALUES(last_activity)`,
          [userId, attempt.completed_at]
        );

        // Update subject mastery
        await connection.query(
          `INSERT INTO subject_mastery 
           (user_id, subject, mastery_level, quizzes_taken, average_score, last_quiz_date)
           VALUES (?, ?, 1, 1, ?, ?)
           ON DUPLICATE KEY UPDATE
           quizzes_taken = quizzes_taken + 1,
           average_score = ((average_score * (quizzes_taken - 1)) + ?) / quizzes_taken,
           last_quiz_date = VALUES(last_quiz_date),
           mastery_level = LEAST(10, FLOOR((((average_score * (quizzes_taken - 1)) + ?) / quizzes_taken) / 10) + 1)`,
          [
            userId,
            attempt.subject,
            attempt.percentage,
            attempt.completed_at,
            attempt.percentage,
            attempt.percentage
          ]
        );
      }

      console.log('Added sample quiz data successfully!');
    } else {
      console.log('Quiz data already exists.');
    }
  } catch (error) {
    console.error('Error adding sample data:', error);
  }
}

// Run the setup
checkTables().catch(console.error);
