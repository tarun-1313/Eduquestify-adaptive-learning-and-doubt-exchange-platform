import { getDb } from './lib/db.ts';

async function checkDatabase() {
  try {
    const db = getDb();
    
    // Check users table structure
    console.log('=== USERS TABLE STRUCTURE ===');
    const [columns] = await db.query('DESCRIBE users');
    console.log('Users table columns:');
    columns.forEach(col => console.log(`- ${col.Field}: ${col.Type}`));
    
    // Check a few users
    console.log('\n=== SAMPLE USERS ===');
    const [users] = await db.query('SELECT id, email, name, role FROM users LIMIT 3');
    users.forEach(user => {
      console.log(`ID: ${user.id}, Email: ${user.email}, Name: ${user.name}, Role: ${user.role}`);
    });
    
    // Check if password column exists
    const passwordColumn = columns.find(col => col.Field === 'password');
    const passwordHashColumn = columns.find(col => col.Field === 'password_hash');
    
    console.log('\n=== PASSWORD COLUMN CHECK ===');
    console.log('password column exists:', !!passwordColumn);
    console.log('password_hash column exists:', !!passwordHashColumn);
    
  } catch (error) {
    console.error('Database check failed:', error);
  } finally {
    process.exit(0);
  }
}

checkDatabase();