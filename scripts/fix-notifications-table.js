import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function fixNotificationsTable() {
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
    
    // Check if notifications table exists
    const [tables] = await connection.query(
      'SHOW TABLES LIKE "notifications"'
    );
    
    if (Array.isArray(tables) && tables.length > 0) {
      console.log('Notifications table exists, checking columns...');
      
      // Get current table schema
      const [columns] = await connection.query(
        'SHOW COLUMNS FROM notifications'
      );
      
      console.log('\nCurrent table schema:');
      columns.forEach((col) => {
        console.log(`${col.Field}: ${col.Type}`);
      });
      
      // Check for missing columns
      const columnNames = columns.map((col) => col.Field);
      
      // Add missing columns
      if (!columnNames.includes('type')) {
        console.log('Adding type column...');
        await connection.query('ALTER TABLE notifications ADD COLUMN type VARCHAR(50) DEFAULT "general"');
      }
      
      if (!columnNames.includes('related_id')) {
        console.log('Adding related_id column...');
        await connection.query('ALTER TABLE notifications ADD COLUMN related_id INT NULL');
      }
      
      if (!columnNames.includes('read_at')) {
        console.log('Adding read_at column...');
        await connection.query('ALTER TABLE notifications ADD COLUMN read_at TIMESTAMP NULL');
      }
      
      // Update the seen column to read_at if needed
      if (columnNames.includes('seen') && !columnNames.includes('read_at')) {
        console.log('Converting seen column to read_at...');
        await connection.query('UPDATE notifications SET read_at = CASE WHEN seen = 1 THEN created_at ELSE NULL END');
        await connection.query('ALTER TABLE notifications DROP COLUMN seen');
      }
      
      console.log('Notifications table updated successfully!');
    } else {
      console.log('Notifications table does not exist, creating it...');
      
      // Create the notifications table with the correct schema
      await connection.query(`
        CREATE TABLE notifications (
          id BIGINT AUTO_INCREMENT PRIMARY KEY,
          user_id BIGINT NOT NULL,
          message TEXT NOT NULL,
          type VARCHAR(50) DEFAULT 'general',
          related_id INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          read_at TIMESTAMP NULL,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);
      
      console.log('Created notifications table');
    }
    
  } catch (error) {
    console.error('Error updating table:', error);
    process.exit(1);
  } finally {
    await connection.end();
    console.log('Connection closed');
  }
}

// Run the fix
fixNotificationsTable().catch(console.error);