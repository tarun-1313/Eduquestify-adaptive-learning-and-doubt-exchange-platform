import { getDb } from '../lib/db.ts';

async function checkMessageTables() {
  const db = getDb();
  
  try {
    console.log('Checking message tables...\n');
    
    // Check if messages table exists
    const [messagesResult] = await db.query('SHOW TABLES LIKE "messages"');
    console.log('✓ messages table exists:', messagesResult.length > 0);
    
    // Check if doubt_messages table exists  
    const [doubtMessagesResult] = await db.query('SHOW TABLES LIKE "doubt_messages"');
    console.log('✓ doubt_messages table exists:', doubtMessagesResult.length > 0);
    
    console.log('\n--- Table Structures ---');
    
    // If doubt_messages exists, check its structure
    if (doubtMessagesResult.length > 0) {
      console.log('\ndoubt_messages table structure:');
      const [columns] = await db.query('DESCRIBE doubt_messages');
      columns.forEach(col => {
        console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
    }
    
    // If messages exists, check its structure
    if (messagesResult.length > 0) {
      console.log('\nmessages table structure:');
      const [columns] = await db.query('DESCRIBE messages');
      columns.forEach(col => {
        console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
    }
    
    console.log('\n--- Sample Data ---');
    
    // Check for data in both tables
    if (doubtMessagesResult.length > 0) {
      const [doubtMessagesData] = await db.query('SELECT COUNT(*) as count FROM doubt_messages');
      console.log(`doubt_messages row count:`, doubtMessagesData[0].count);
      
      if (doubtMessagesData[0].count > 0) {
        const [sampleData] = await db.query('SELECT * FROM doubt_messages LIMIT 3');
        console.log('Sample doubt_messages:', sampleData);
      }
    }
    
    if (messagesResult.length > 0) {
      const [messagesData] = await db.query('SELECT COUNT(*) as count FROM messages');
      console.log(`messages row count:`, messagesData[0].count);
      
      if (messagesData[0].count > 0) {
        const [sampleData] = await db.query('SELECT * FROM messages LIMIT 3');
        console.log('Sample messages:', sampleData);
      }
    }
    
    console.log('\n--- Recommendations ---');
    if (doubtMessagesResult.length > 0 && messagesResult.length > 0) {
      console.log('⚠️  Both tables exist! This could cause confusion.');
      console.log('   The API is using doubt_messages, but migration creates messages table.');
    } else if (messagesResult.length > 0 && doubtMessagesResult.length === 0) {
      console.log('⚠️  Only messages table exists, but API expects doubt_messages.');
      console.log('   You need to either:');
      console.log('   1. Update the API to use messages table, OR');
      console.log('   2. Create doubt_messages table with correct structure.');
    }
    
  } catch (error) {
    console.error('Error checking tables:', error);
  } finally {
    process.exit(0);
  }
}

checkMessageTables();