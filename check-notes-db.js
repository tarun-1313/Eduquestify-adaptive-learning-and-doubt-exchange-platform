import { getDb } from './lib/db.ts';

async function checkNotesStructure() {
  try {
    const db = await getDb();
    console.log('=== NOTES TABLE STRUCTURE ===');
    
    // Get table structure
    const [columns] = await db.execute('SHOW COLUMNS FROM notes');
    
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

    // Check if note_likes table exists
    const [tables] = await db.execute("SHOW TABLES LIKE 'note_likes'");
    if (tables.length > 0) {
      console.log('\n✅ note_likes table exists');
      
      const [likeColumns] = await db.execute('SHOW COLUMNS FROM note_likes');
      console.log('note_likes table columns:');
      likeColumns.forEach(column => {
        console.log(`- ${column.Field}: ${column.Type}`);
      });
    } else {
      console.log('\n❌ note_likes table does NOT exist');
    }

    await db.end();
  } catch (error) {
    console.error('Error checking notes structure:', error.message);
  }
}

checkNotesStructure();