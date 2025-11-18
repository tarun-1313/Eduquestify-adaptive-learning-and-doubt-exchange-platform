import mysql from 'mysql2/promise';

// Test the view API functionality
async function testViewAPI() {
  try {
    // Create a simple connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'eduquestify'
    });

    console.log('Connected to database');

    // Check if views_count column exists
    const [columns] = await connection.execute(
      'SHOW COLUMNS FROM notes LIKE ?',
      ['views_count']
    );

    if (columns.length === 0) {
      console.log('❌ views_count column does not exist in notes table');
      
      // Add the column
      await connection.execute(
        'ALTER TABLE notes ADD COLUMN views_count INT DEFAULT 0'
      );
      console.log('✅ Added views_count column to notes table');
    } else {
      console.log('✅ views_count column exists:', columns[0]);
    }

    // Test a view count update
    const testNoteId = 1; // Adjust this to a valid note ID
    
    // Get current views
    const [currentRows] = await connection.execute(
      'SELECT views_count FROM notes WHERE id = ?',
      [testNoteId]
    );

    if (currentRows.length > 0) {
      const currentViews = currentRows[0].views_count || 0;
      console.log(`Current views for note ${testNoteId}: ${currentViews}`);

      // Update views
      await connection.execute(
        'UPDATE notes SET views_count = ? WHERE id = ?',
        [currentViews + 1, testNoteId]
      );
      console.log(`✅ Updated views to ${currentViews + 1}`);
    } else {
      console.log(`❌ No note found with ID ${testNoteId}`);
    }

    await connection.end();
    console.log('Test completed successfully');

  } catch (error) {
    console.error('Database test failed:', error);
  }
}

testViewAPI();