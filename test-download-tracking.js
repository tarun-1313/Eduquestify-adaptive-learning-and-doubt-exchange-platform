import jwt from 'jsonwebtoken';

// The JWT secret is hardcoded in the auth.ts file
const JWT_SECRET = Buffer.from('cb96c4b6e27155ea28c9c2c91c1ba2e1ffe1b5779f80634e217933dbeaa4f879e5568bdff53593a664b2754a918283b1f41fdfccfcc59edba1b046b833450eea24e76d6a2ec12c1313399d78db97f598a5e76cd49afaea9371bd16756fe6e60f9b835bb4a5ae4ee597b3c51a4654519ce22a80f8db1c886d6085353e820bcbccb3f1e366fea7ec676f1481984089c57b9bd5a58c2c7287d440c062b52eb256c2d2de440dc46f3adb', 'hex');

async function testDownloadTracking() {
  try {
    // Create a test JWT token using an existing user
    const testUser = { id: 1, email: 'kakaji131919@gmail.com', name: 'User 1' };
    const token = jwt.sign(testUser, JWT_SECRET, { algorithm: 'HS256', expiresIn: '1h' });
    
    console.log('Testing download tracking API...');
    
    const downloadData = {
      questionBankId: 1,
      subject: 'Mathematics',
      topic: 'Calculus',
      department: 'Engineering',
      year: '2024'
    };
    
    const response = await fetch('http://localhost:3002/api/question-banks/download', {
      method: 'POST',
      headers: {
        'Cookie': `eduq_token=${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(downloadData)
    });
    
    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testDownloadTracking();