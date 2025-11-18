import { promises as fs } from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

// Configure dotenv
dotenv.config();

// Get the current directory in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  // Read the migration file
  const migrationPath = path.join(__dirname, '..', 'migrations', '001_create_notes_tables.sql');
  const migrationSQL = await fs.readFile(migrationPath, 'utf8');

  // Get database configuration from environment variables
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
    multipleStatements: true
  });

  try {
    console.log('Connected to MySQL server');
    
    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${MYSQL_DATABASE}\``);
    console.log(`Database ${MYSQL_DATABASE} is ready`);
    
    // Use the database
    await connection.query(`USE \`${MYSQL_DATABASE}\``);
    console.log(`Using database ${MYSQL_DATABASE}`);
    
    // Run the migration
    console.log('Running migration...');
    await connection.query(migrationSQL);
    console.log('Migration completed successfully');
    
  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  } finally {
    await connection.end();
    console.log('Connection closed');
  }
}

// Run the migration
runMigration().catch(console.error);
