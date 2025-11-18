import mysql from 'mysql2/promise';

async function addLikesCountColumn() {
  try {
    // Create connection using the same config as the app
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'eduquestify_user',
      password: process.env.MYSQL_PASSWORD || 'Tarun@2005',
      database: process.env.MYSQL_DATABASE || 'eduquestify',
      port: process.env.MYSQL_PORT ? Number.parseInt(process.env.MYSQL_PORT, 10) : 3307
    });

    console.log('Checking if likes_count column exists in notes table...');
    
    // Check if column already exists
    const [columns] = await connection.execute('SHOW COLUMNS FROM notes');
    const likesCountExists = columns.some(col => col.Field === 'likes_count');
    
    if (likesCountExists) {
      console.log('✅ likes_count column already exists');
      return;
    }
    
    console.log('Adding likes_count column to notes table...');
    
    // Add the likes_count column
    await connection.execute(`
      ALTER TABLE notes 
      ADD COLUMN likes_count INT DEFAULT 0
    `);
    
    console.log('✅ likes_count column added successfully');
    
    // Verify the change
    const [updatedColumns] = await connection.execute('SHOW COLUMNS FROM notes');
    const updatedLikesCountExists = updatedColumns.some(col => col.Field === 'likes_count');
    
    if (updatedLikesCountExists) {
      console.log('✅ Column addition verified');
    } else {
      console.log('❌ Column addition verification failed');
    }
    
    await connection.end();
  } catch (error) {
    console.error('Error adding likes_count column:', error.message);
  }
}

addLikesCountColumn();