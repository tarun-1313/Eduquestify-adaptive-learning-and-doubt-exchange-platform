const { getDb } = require('./lib/db.ts');
const bcrypt = require('bcryptjs');

async function createTestUser() {
  const db = getDb();
  try {
    console.log('Creating test user in MySQL...');
    
    // Check if user already exists
    const [existingRows] = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      ['test@example.com']
    );
    
    if (existingRows.length > 0) {
      console.log('Test user already exists:', existingRows[0]);
      return existingRows[0];
    }

    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const [result] = await db.execute(
      'INSERT INTO users (email, name, password_hash, role, created_at) VALUES (?, ?, ?, ?, NOW())',
      ['test@example.com', 'Test User', hashedPassword, 'Student']
    );
    
    const userId = result.insertId;
    
    console.log('Test user created successfully with ID:', userId);
    
    // Return the created user
    const [newUserRows] = await db.execute(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );
    
    return newUserRows[0];
  } catch (error) {
    console.error('Error creating test user:', error);
    throw error;
  } finally {
    await db.end();
  }
}

createTestUser().then(user => {
  console.log('User created:', user);
  process.exit(0);
}).catch(error => {
  console.error('Failed to create user:', error);
  process.exit(1);
});