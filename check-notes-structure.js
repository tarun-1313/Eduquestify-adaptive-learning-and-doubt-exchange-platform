import mysql from 'mysql2/promise';

async function checkNotesStructure() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'eduquestify'
    });

    console.log('=== NOTES TABLE STRUCTURE ===');
    
    // Get table structure
    const [columns] = await connection.execute('SHOW COLUMNS FROM notes');
    
    if (columns.length === 0) {
      console.log('Notes table does not exist');
      return;
    }

    console.log('Notes table columns:');
    columns.forEach(column => {
      console.log(`- ${column.Field}: ${column.Type} ${column.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${column.Default ? `DEFAULT ${column.Default}` : ''}`);
    });

    // Check if likes_count column exists
    const likesCountColumn = columns.find(col => col.Field === 'likes_count');
    if (likesCountColumn) {
      console.log('\n✅ likes_count column exists');
    } else {
      console.log('\n❌ likes_count column does NOT exist');
      console.log('Available columns:', columns.map(col => col.Field).join(', '));
    }

    await connection.end();
  } catch (error) {
    console.error('Error checking notes structure:', error.message);
  }
}

checkNotesStructure();