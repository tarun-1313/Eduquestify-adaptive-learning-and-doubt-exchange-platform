import { getDb } from '@/lib/db.ts';

async function addLikesCountColumn() {
  try {
    const db = await getDb();
    
    console.log('Checking if likes_count column exists in notes table...');
    
    // Check if column already exists
    const [columns] = await db.execute('SHOW COLUMNS FROM notes');
    const likesCountExists = columns.some(col => col.Field === 'likes_count');
    
    if (likesCountExists) {
      console.log('✅ likes_count column already exists');
      return;
    }
    
    console.log('Adding likes_count column to notes table...');
    
    // Add the likes_count column
    await db.execute(`
      ALTER TABLE notes 
      ADD COLUMN likes_count INT DEFAULT 0
    `);
    
    console.log('✅ likes_count column added successfully');
    
    // Verify the change
    const [updatedColumns] = await db.execute('SHOW COLUMNS FROM notes');
    const updatedLikesCountExists = updatedColumns.some(col => col.Field === 'likes_count');
    
    if (updatedLikesCountExists) {
      console.log('✅ Column addition verified');
    } else {
      console.log('❌ Column addition verification failed');
    }
    
    await db.end();
  } catch (error) {
    console.error('Error adding likes_count column:', error.message);
  }
}

addLikesCountColumn();