import mysql from 'mysql2/promise';

async function testConnection() {
  const config = {
    host: 'localhost',
    user: 'eduquestify_user',
    password: 'Tarun@2005',
    database: 'eduquestify',
    port: 3307
  };

  console.log('Attempting to connect to database with config:', {
    ...config,
    password: '***' // Don't log the actual password
  });

  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ Successfully connected to MySQL database!');
    
    // Test a simple query
    const [rows] = await connection.execute('SELECT 1 + 1 AS result');
    console.log('✅ Test query result:', rows[0]);
    
    // Check if quiz_attempts table exists
    const [tables] = await connection.execute(
      `SHOW TABLES LIKE 'quiz_attempts'`
    );
    console.log('✅ quiz_attempts table exists:', tables.length > 0);
    
    // Check table structure
    if (tables.length > 0) {
      const [columns] = await connection.execute(
        `SHOW COLUMNS FROM quiz_attempts`
      );
      console.log('✅ quiz_attempts columns:', columns.map(c => c.Field));
    }
    
    await connection.end();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    if (error.code) console.error('Error code:', error.code);
    if (error.errno) console.error('Error number:', error.errno);
    if (error.sqlMessage) console.error('SQL Message:', error.sqlMessage);
    
    // Check if MySQL service is running
    if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  MySQL server is not running or not accessible.');
      console.error('Please make sure MySQL server is running on port 3307');
    }
  }
}

testConnection().catch(console.error);
