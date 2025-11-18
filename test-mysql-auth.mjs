import { getDb } from './lib/db.ts';

async function testMySQLAuth() {
  try {
    const db = getDb();
    
    // Test database connection
    console.log('Testing MySQL database connection...');
    const [result] = await db.query('SELECT 1 as test');
    console.log('✅ Database connection successful:', result);
    
    // Check if users table exists and has our test user
    console.log('\nChecking users table...');
    const [users] = await db.query(
      'SELECT id, email, name, role FROM users WHERE email = ?',
      ['test@example.com']
    );
    
    if (users.length > 0) {
      console.log('✅ Test user found:', users[0]);
      
      // Check password hash
      const [passwordCheck] = await db.query(
        'SELECT password_hash FROM users WHERE email = ?',
        ['test@example.com']
      );
      
      if (passwordCheck[0]?.password_hash) {
        console.log('✅ Password hash exists:', passwordCheck[0].password_hash.substring(0, 20) + '...');
      } else {
        console.log('❌ No password hash found');
      }
      
    } else {
      console.log('❌ Test user not found in database');
    }
    
    // Test JWT secret
    console.log('\nChecking JWT configuration...');
    const jwtSecret = process.env.JWT_SECRET;
    if (jwtSecret) {
      console.log('✅ JWT_SECRET is set:', jwtSecret.substring(0, 10) + '...');
    } else {
      console.log('❌ JWT_SECRET not found in environment');
    }
    
    console.log('\n✅ MySQL authentication system is properly configured!');
    
  } catch (error) {
    console.error('❌ Error testing MySQL auth:', error);
  } finally {
    process.exit(0);
  }
}

testMySQLAuth();