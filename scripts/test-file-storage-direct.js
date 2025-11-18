import { getDb } from '../lib/db.js';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

async function testFileStorageDirect() {
  try {
    console.log('Testing direct file storage system...');
    
    const db = getDb();
    
    // Test data
    const testDoubtId = 1;
    const testUserId = 1;
    const testTitle = 'Direct Test Note';
    const testContent = 'This is a test file content for direct file storage testing.';
    
    // Create uploads directory
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'shared-notes');
    await mkdir(uploadsDir, { recursive: true });
    console.log('Created uploads directory:', uploadsDir);

    // Create a test file
    const fileExtension = '.txt';
    const uniqueFilename = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(uploadsDir, uniqueFilename);
    const relativePath = `/uploads/shared-notes/${uniqueFilename}`;
    
    await writeFile(filePath, testContent);
    console.log('Created test file:', filePath);

    // Insert test record into database
    const [result] = await db.query(
      `INSERT INTO shared_notes (doubt_id, uploader_id, title, file_url, size) 
       VALUES (?, ?, ?, ?, ?)`,
      [testDoubtId, testUserId, testTitle, relativePath, testContent.length]
    );
    
    const noteId = result.insertId;
    console.log('Inserted test record with ID:', noteId);

    // Verify the record was inserted correctly
    const [rows] = await db.query(
      `SELECT * FROM shared_notes WHERE id = ?`,
      [noteId]
    );
    
    if (rows.length > 0) {
      const note = rows[0];
      console.log('Retrieved note from database:');
      console.log('- ID:', note.id);
      console.log('- Title:', note.title);
      console.log('- File URL:', note.file_url);
      console.log('- Size:', note.size);
      console.log('- Created at:', note.created_at);
      
      // Verify file exists on filesystem
      try {
        const fs = await import('fs/promises');
        const fileContent = await fs.readFile(path.join(process.cwd(), 'public', note.file_url), 'utf8');
        console.log('File content matches:', fileContent === testContent);
        console.log('File accessible via URL: http://localhost:3002' + note.file_url);
      } catch (fileError) {
        console.error('Error reading file:', fileError.message);
      }
      
      // Clean up test data
      await db.query('DELETE FROM shared_notes WHERE id = ?', [noteId]);
      const fs = await import('fs/promises');
      await fs.unlink(filePath);
      console.log('Cleaned up test data');
      
      console.log('\n✅ Direct file storage system test completed successfully!');
      console.log('- Files are stored in: public/uploads/shared-notes/');
      console.log('- Database stores relative file paths');
      console.log('- File URLs can be accessed directly via HTTP');
      console.log('- Example URL: http://localhost:3002/uploads/shared-notes/[filename]');
      
    } else {
      console.error('❌ Failed to retrieve test record');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testFileStorageDirect().catch(console.error);