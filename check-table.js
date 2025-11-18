import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function checkTable() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      port: process.env.MYSQL_PORT || 3306,
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'eduquestify'
    });
    
    // Check if our new table exists
    const [tableRows] = await connection.query("SHOW TABLES LIKE 'question_bank_downloads'");
    if (tableRows.length > 0) {
      console.log('✅ question_bank_downloads table exists');
      
      // Get table structure
      const [structure] = await connection.query('DESCRIBE question_bank_downloads');
      console.log('Table structure:');
      structure.forEach(col => {
        console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
      
      // Check if there are any records
      const [count] = await connection.query('SELECT COUNT(*) as count FROM question_bank_downloads');
      console.log(`Current records: ${count[0].count}`);
      
    } else {
      console.log('❌ question_bank_downloads table does not exist');
    }
    
    await connection.end();
  } catch (error) {
    console.error('Database error:', error.message);
  }
}

checkTable();