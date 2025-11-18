import mysql from 'mysql2/promise';

async function checkUsersStructure() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'eduquestify_user',
    password: 'Tarun@2005',
    database: 'eduquestify',
    port: 3307
  });

  try {
    console.log('=== CHECKING USERS TABLE STRUCTURE ===');
    
    // Check table structure
    const [columns] = await connection.execute(`
      SHOW COLUMNS FROM users
    `);
    
    console.log('Users table columns:');
    columns.forEach(column => {
      console.log(`- ${column.Field}: ${column.Type} ${column.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    // Check users with proper query
    const [users] = await connection.execute(`
      SELECT id, email, name, created_at 
      FROM users 
      ORDER BY id 
      LIMIT 10
    `);
    
    console.log(`\nUsers found: ${users.length}`);
    users.forEach(user => {
      console.log(`- User ${user.id}: ${user.name || 'No Name'} (${user.email})`);
    });
    
  } catch (error) {
    console.error('Error checking data:', error);
  } finally {
    await connection.end();
  }
}

checkUsersStructure();