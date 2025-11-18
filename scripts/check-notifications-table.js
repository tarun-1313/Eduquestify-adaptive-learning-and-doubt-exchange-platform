import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function checkNotificationsTable() {
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
      console.log('Notifications table exists');
      
      // Get table schema
      const [columns] = await connection.query(
        'SHOW COLUMNS FROM notifications'
      );
      
      console.log('\nTable schema:');
      console.log(columns);
    } else {
      console.log('Notifications table does not exist');
      
      // Create the notifications table
      await connection.query(`
        CREATE TABLE notifications (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
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
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await connection.end();
    console.log('Connection closed');
  }
}

// Run the check
checkNotificationsTable().catch(console.error);