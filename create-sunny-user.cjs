const bcrypt = require('bcryptjs');
const { getDb } = require('./lib/db.ts');

async function createSunnyUser() {
  try {
    console.log('Creating sunny user...');
    const db = await getDb();
    
    // Check if user already exists
    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER(?)',
      ['sunny@gmail.com']
    );
    
    if (existingUsers.length > 0) {
      console.log('User sunny@gmail.com already exists, updating password...');
      
      // Update existing user
      const hashedPassword = await bcrypt.hash('sunny@2005', 10);
      await db.query(
        'UPDATE users SET password_hash = ?, name = ?, role = ? WHERE LOWER(email) = LOWER(?)',
        [hashedPassword, 'Sunny', 'Student', 'sunny@gmail.com']
      );
      
      console.log('✅ User sunny@gmail.com updated successfully!');
    } else {
      // Create new user
      const hashedPassword = await bcrypt.hash('sunny@2005', 10);
      const [result] = await db.query(
        'INSERT INTO users (email, name, password_hash, role, created_at) VALUES (?, ?, ?, ?, NOW())',
        ['sunny@gmail.com', 'Sunny', hashedPassword, 'Student']
      );
      
      console.log('✅ User sunny@gmail.com created successfully!');
      console.log('User ID:', result.insertId);
    }
    
    // Verify the user was created/updated
    const [users] = await db.query(
      'SELECT id, email, name, role, password_hash FROM users WHERE LOWER(email) = LOWER(?)',
      ['sunny@gmail.com']
    );
    
    if (users.length > 0) {
      console.log('✅ User verified:', {
        id: users[0].id,
        email: users[0].email,
        name: users[0].name,
        role: users[0].role
      });
      
      // Test password verification
      const isValid = await bcrypt.compare('sunny@2005', users[0].password_hash);
      console.log('✅ Password verification:', isValid);
    }
    
  } catch (error) {
    console.error('❌ Error creating/updating user:', error);
  }
}

createSunnyUser();