import { getDb } from './lib/db.ts';

async function testDb() {
  try {
    const db = getDb();
    
    // Check if our new table exists
    const [tableRows] = await db.query("SHOW TABLES LIKE 'question_bank_downloads'");
    if (tableRows.length > 0) {
      console.log('✅ question_bank_downloads table exists');
      
      // Get some stats from the table
      const [stats] = await db.query('SELECT COUNT(*) as total_downloads, COUNT(DISTINCT user_id) as unique_users FROM question_bank_downloads');
      console.log('Download stats:', stats[0]);
      
      // Get recent downloads
      const [recent] = await db.query('SELECT * FROM question_bank_downloads ORDER BY download_timestamp DESC LIMIT 5');
      console.log('Recent downloads:', recent);
      
    } else {
      console.log('❌ question_bank_downloads table does not exist');
    }

    await db.end();
  } catch (err) {
    console.error('Database error:', err.message);
    console.error('Full error:', err);
  }
}

testDb();
