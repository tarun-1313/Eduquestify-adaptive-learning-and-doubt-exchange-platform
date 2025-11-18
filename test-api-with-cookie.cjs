const axios = require('axios');
const jwt = require('jsonwebtoken');

async function testAPIWithCookie() {
  try {
    console.log('=== Testing Dashboard API with Cookie ===');
    
    // Create a test JWT token
    const JWT_SECRET = 'your-secret-key-here';
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
    
    // Test the API endpoint with cookie
    const response = await axios.get('http://localhost:3003/api/flashcards/dashboard', {
      headers: {
        'Cookie': `eduq_token=${testToken}`
      },
      maxRedirects: 0,
      validateStatus: function (status) {
        return status < 500; // Don't throw on 4xx errors
      }
    });
    
    console.log('✅ API Response Status:', response.status);
    
    if (response.status === 200) {
      console.log('✅ API call successful!');
      console.log('✅ Data:', JSON.stringify(response.data, null, 2));
    } else {
      console.log('❌ API call failed with status:', response.status);
      if (response.data) {
        console.log('❌ Response data:', response.data);
      }
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

testAPIWithCookie();