import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function alterSharedNotesTable() {
  const {
    MYSQL_HOST = 'localhost', 
    MYSQL_USER = 'eduquestify_user',
    MYSQL_PASSWORD = 'Tarun@2005',
    MYSQL_DATABASE = 'eduquestify',
    MYSQL_PORT = 3307
  } = process.env;

  // Create a connection to MySQL server
  const connection = await mysql.createConnection({
    host: MYSQL_HOST,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    port: MYSQL_PORT,
    database: MYSQL_DATABASE
  });

  try {
    console.log('Connected to MySQL server');
    
    // Alter the table
    await connection.query('ALTER TABLE shared_notes MODIFY COLUMN file_url LONGTEXT');
    console.log('Successfully altered shared_notes table');
    
  } catch (error) {
    console.error('Error altering table:', error);
    process.exit(1);
  } finally {
    await connection.end();
    console.log('Connection closed');
  }
}

// Run the migration
alterSharedNotesTable().catch(console.error);