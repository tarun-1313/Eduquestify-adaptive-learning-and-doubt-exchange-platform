const mysql = require('mysql2/promise');

async function testLimitFix() {
  try {
    // Connect to MySQL
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'eduquestify_user',
      password: 'Tarun@2005',
      database: 'eduquestify',
      port: 3307
    });

    console.log('Connected to MySQL database');

    const userId = 1;

    console.log(`\n=== Testing different LIMIT approaches ===`);
    
    // Test 1: Hardcoded limit
    console.log('Test 1: Hardcoded limit');
    try {
      const [rows1] = await connection.execute(
        'SELECT * FROM flashcard_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
        [userId]
      );
      console.log(`✅ Hardcoded limit works: ${rows1.length} rows`);
    } catch (err) {
      console.log('❌ Hardcoded limit failed:', err.message);
    }

    // Test 2: Number parameter
    console.log('\nTest 2: Number parameter');
    try {
      const limit = 10;
      const [rows2] = await connection.execute(
        'SELECT * FROM flashcard_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
        [userId, limit]
      );
      console.log(`✅ Number parameter works: ${rows2.length} rows`);
    } catch (err) {
      console.log('❌ Number parameter failed:', err.message);
    }

    // Test 3: String parameter
    console.log('\nTest 3: String parameter');
    try {
      const limit = '10';
      const [rows3] = await connection.execute(
        'SELECT * FROM flashcard_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
        [userId, limit]
      );
      console.log(`✅ String parameter works: ${rows3.length} rows`);
    } catch (err) {
      console.log('❌ String parameter failed:', err.message);
    }

    // Test 4: ParseInt parameter
    console.log('\nTest 4: ParseInt parameter');
    try {
      const limit = parseInt('10');
      const [rows4] = await connection.execute(
        'SELECT * FROM flashcard_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
        [userId, limit]
      );
      console.log(`✅ ParseInt parameter works: ${rows4.length} rows`);
    } catch (err) {
      console.log('❌ ParseInt parameter failed:', err.message);
    }

    await connection.end();
    console.log('\n✅ All limit tests completed!');

  } catch (error) {
    console.error('❌ Connection error:', error.message);
  }
}

testLimitFix();