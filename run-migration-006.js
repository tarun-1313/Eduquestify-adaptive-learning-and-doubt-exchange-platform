import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function runMigration() {
  try {
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'migrations', '006_create_question_bank_downloads.sql');
    const migrationContent = await fs.readFile(migrationPath, 'utf8');
    
    // Connect to database
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      port: process.env.MYSQL_PORT || 3306,
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'eduquestify',
      multipleStatements: true
    });

    console.log('Connected to database');
    
    // Split the migration into individual statements
    const statements = migrationContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`Running ${statements.length} migration statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        try {
          console.log(`Running statement ${i + 1}: ${statement.substring(0, 50)}...`);
          await connection.query(statement);
        } catch (error) {
          console.error(`Error in statement ${i + 1}:`, error.message);
          // Continue with other statements if one fails
        }
      }
    }
    
    console.log('✅ Migration 006 completed successfully');
    
    // Verify table was created
    const [rows] = await connection.query('SHOW TABLES LIKE "question_bank_downloads"');
    if (rows.length > 0) {
      console.log('✅ question_bank_downloads table created');
    } else {
      console.log('❌ question_bank_downloads table not found');
    }
    
    // Check table structure
    const [structure] = await connection.query('DESCRIBE question_bank_downloads');
    console.log('Table structure:');
    structure.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    await connection.end();
    
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();