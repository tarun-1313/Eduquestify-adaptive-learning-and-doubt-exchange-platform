import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function checkNotes() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'edumate',
  });

  try {
    console.log('🔍 Checking database for notes...');
    
    // Check if notes table exists
    const [tables] = await connection.query("SHOW TABLES LIKE 'notes'");
    if (Array.isArray(tables) && tables.length === 0) {
      console.log('❌ Notes table does not exist!');
      return;
    }

    // Count total notes
    const [countResult] = await connection.query('SELECT COUNT(*) as count FROM notes');
    const countData = countResult as any;
    const totalNotes = countData[0].count;
    console.log(`📊 Total notes in database: ${totalNotes}`);

    if (totalNotes > 0) {
      // Show sample notes
      console.log('\n📝 Sample notes (first 5):');
      const [notes] = await connection.query('SELECT id, title, subject_id, is_private, created_at FROM notes LIMIT 5');
      console.table(notes);
      
      // Check if any notes are public
      const [publicNotes] = await connection.query("SELECT COUNT(*) as count FROM notes WHERE is_private = FALSE");
      const publicData = publicNotes as any;
      console.log(`\n🔓 Public notes: ${publicData[0].count}`);
      console.log(`🔒 Private notes: ${totalNotes - publicData[0].count}`);
    }

    // Check users table
    const [users] = await connection.query('SELECT id, name, email FROM users LIMIT 3');
    console.log('\n👥 Sample users:');
    console.table(users);

  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await connection.end();
  }
}

checkNotes().catch(console.error);
