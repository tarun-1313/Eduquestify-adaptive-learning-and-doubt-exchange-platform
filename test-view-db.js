import { getDb } from './lib/db.js';

// Test the view API functionality
async function testViewAPI() {
  try {
    console.log('Testing view API functionality...');
    
    // Get database connection
    const db = getDb();

    console.log('Connected to database');

    // Check if views_count column exists
    const [columns] = await db.execute(
      'SHOW COLUMNS FROM notes LIKE ?',
      ['views_count']
    );

    if (columns.length === 0) {
      console.log('❌ views_count column does not exist in notes table');
      
      // Add the column
      await db.execute(
        'ALTER TABLE notes ADD COLUMN views_count INT DEFAULT 0'
      );
      console.log('✅ Added views_count column to notes table');
    } else {
      console.log('✅ views_count column exists:', columns[0]);
    }

    // Check if there are any notes
    const [notes] = await db.execute('SELECT id, title, views_count FROM notes LIMIT 5');
    console.log('Available notes:', notes);

    if (notes.length > 0) {
      const testNote = notes[0];
      console.log(`Testing with note ${testNote.id}: "${testNote.title}" (current views: ${testNote.views_count})`);
      
      // Test view count update
      await db.execute(
        'UPDATE notes SET views_count = views_count + 1 WHERE id = ?',
        [testNote.id]
      );
      console.log('✅ Successfully incremented view count');
    } else {
      console.log('⚠️  No notes found in database to test with');
    }

    console.log('Test completed successfully');

  } catch (error) {
    console.error('Database test failed:', error);
  }
}

testViewAPI();