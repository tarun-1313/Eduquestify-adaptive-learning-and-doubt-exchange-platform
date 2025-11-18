import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function checkNotes() {
  const host = MYSQL_HOST || 'localhost';
    const user = MYSQL_USER || 'eduquestify_user';
    const password = MYSQL_PASSWORD || 'Tarun@2005';
    const database = MYSQL_DATABASE || 'eduquestify';
    const port = MYSQL_PORT ? Number.parseInt(MYSQL_PORT, 10) : 3307;


  try {
    console.log('🔍 Checking database for notes...');
    
    // Check if notes table exists
    const [tables] = await connection.execute("SHOW TABLES LIKE 'notes'");
    if (tables.length === 0) {
      console.log('❌ Notes table does not exist!');
      return;
    }

    // Check users table structure
    console.log('\n👥 Users table structure:');
    const [userColumns] = await connection.execute("DESCRIBE users");
    console.table(userColumns);

    // Check notes table structure
    console.log('\n📝 Notes table structure:');
    const [noteColumns] = await connection.execute("DESCRIBE notes");
    console.table(noteColumns);

    // Check if there are any notes
    const [countResult] = await connection.execute('SELECT COUNT(*) as count FROM notes');
    const totalNotes = countResult[0].count;
    console.log(`\n📊 Total notes in database: ${totalNotes}`);

    if (totalNotes > 0) {
      // Show sample notes with their privacy status
      console.log('\n📝 Sample notes (first 5):');
      const [notes] = await connection.execute(
        `SELECT n.id, n.title, n.is_private, n.created_at, 
                u.name as user_name, u.email as user_email,
                s.name as subject_name
         FROM notes n
         LEFT JOIN users u ON n.user_id = u.id
         LEFT JOIN subjects s ON n.subject_id = s.id
         LIMIT 5`
      );
      console.table(notes);
      
      // Count public vs private notes
      const [privacyCounts] = await connection.execute(
        'SELECT is_private, COUNT(*) as count FROM notes GROUP BY is_private'
      );
      console.log('\n🔒 Note Privacy Counts:');
      console.table(privacyCounts);
    }

  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await connection.end();
  }
}

checkNotes().catch(console.error);
