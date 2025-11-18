const jwt = require('jsonwebtoken');

// Create a JWT token for the test user
const user = {
  id: 11,
  email: 'test@example.com',
  name: 'Test User',
  role: 'Student'
};

const token = jwt.sign(user, process.env.JWT_SECRET || 'your-secret-key', {
  expiresIn: '7d'
});

console.log('JWT Token for test user:');
console.log(token);
console.log('\nYou can use this token in your browser console:');
console.log(`document.cookie = "auth-token=${token}; path=/"`);