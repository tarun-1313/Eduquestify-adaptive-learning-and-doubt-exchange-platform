import { promises as fs } from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  // Get all migration files
  const migrationsDir = path.join(__dirname, '..', 'migrations');
  const migrationFiles = await fs.readdir(migrationsDir);
  
  // Sort migration files to ensure they run in order
  migrationFiles.sort();

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
    multipleStatements: true // Allow multiple statements in one query
  });

  try {
    console.log('Connected to MySQL server');
    
    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${MYSQL_DATABASE}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`Database '${MYSQL_DATABASE}' is ready`);
    
    // Select the database
    await connection.query(`USE \`${MYSQL_DATABASE}\``);
    
    // Run each migration file
    for (const migrationFile of migrationFiles) {
      console.log(`Running migration: ${migrationFile}`);
      const migrationPath = path.join(migrationsDir, migrationFile);
      const migrationSQL = await fs.readFile(migrationPath, 'utf8');
      
      try {
        await connection.query(migrationSQL);
        console.log(`Successfully applied migration: ${migrationFile}`);
      } catch (error) {
        console.error(`Error applying migration ${migrationFile}:`, error);
        throw error;
      }
    }
    
    console.log('All migrations completed successfully!');
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  } finally {
    await connection.end();
    console.log('Connection closed');
  }
}

// Run the migration
runMigration().catch(console.error);
