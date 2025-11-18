const axios = require('axios');
const jwt = require('jsonwebtoken');

async function testDashboardAPIEndpoint() {
  try {
    console.log('=== Testing Dashboard API Endpoint ===');
    
    // Create a test JWT token
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET not found in environment');
    }
    
    const testToken = jwt.sign(
      { 
        id: 1, 
        role: 'Student', 
        email: 'test@example.com', 
        name: 'Test User' 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('✅ Created test JWT token');
    
    // Test the API endpoint
    const response = await axios.get('http://localhost:3003/api/flashcards/dashboard', {
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    });
    
    console.log('✅ API Response Status:', response.status);
    console.log('✅ API Response Data:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ API Test Failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testDashboardAPIEndpoint();