const axios = require('axios');
const jwt = require('jsonwebtoken');

async function testCompleteFlow() {
  try {
    console.log('=== Testing Complete Login Flow ===');
    
    // Step 1: Create a test JWT token
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
    
    // Step 2: Test API with Authorization header (like the dashboard page does)
    console.log('\n=== Testing API with Authorization Header ===');
    const apiResponse = await axios.get('http://localhost:3003/api/flashcards/dashboard', {
      headers: {
        'Authorization': `Bearer ${testToken}`
      },
      maxRedirects: 0,
      validateStatus: function (status) {
        return status < 500; // Don't throw on 4xx errors
      }
    });
    
    console.log('✅ API Response Status:', apiResponse.status);
    
    if (apiResponse.status === 200) {
      console.log('✅ API call successful!');
      console.log('✅ Data:', JSON.stringify(apiResponse.data, null, 2));
    } else {
      console.log('❌ API call failed with status:', apiResponse.status);
      if (apiResponse.data) {
        console.log('❌ Response data:', apiResponse.data);
      }
    }
    
    // Step 3: Test API with cookie (like middleware checks)
    console.log('\n=== Testing API with Cookie ===');
    const cookieResponse = await axios.get('http://localhost:3003/api/flashcards/dashboard', {
      headers: {
        'Cookie': `eduq_token=${testToken}`
      },
      maxRedirects: 0,
      validateStatus: function (status) {
        return status < 500; // Don't throw on 4xx errors
      }
    });
    
    console.log('✅ Cookie API Response Status:', cookieResponse.status);
    
    if (cookieResponse.status === 200) {
      console.log('✅ Cookie API call successful!');
      console.log('✅ Data:', JSON.stringify(cookieResponse.data, null, 2));
    } else {
      console.log('❌ Cookie API call failed with status:', cookieResponse.status);
      if (cookieResponse.data) {
        console.log('❌ Response data:', cookieResponse.data);
      }
    }
    
    // Step 4: Test actual login endpoint to see if we can get a real token
    console.log('\n=== Testing Login Endpoint ===');
    const loginResponse = await axios.post('http://localhost:3003/api/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    }, {
      maxRedirects: 0,
      validateStatus: function (status) {
        return status < 500; // Don't throw on 4xx errors
      }
    });
    
    console.log('✅ Login Response Status:', loginResponse.status);
    
    if (loginResponse.status === 200 && loginResponse.data.token) {
      console.log('✅ Login successful!');
      console.log('✅ Token received:', loginResponse.data.token);
      
      // Test with real token
      console.log('\n=== Testing with Real Token ===');
      const realTokenResponse = await axios.get('http://localhost:3003/api/flashcards/dashboard', {
        headers: {
          'Authorization': `Bearer ${loginResponse.data.token}`
        },
        maxRedirects: 0,
        validateStatus: function (status) {
          return status < 500; // Don't throw on 4xx errors
        }
      });
      
      console.log('✅ Real Token API Response Status:', realTokenResponse.status);
      
      if (realTokenResponse.status === 200) {
        console.log('✅ Real token API call successful!');
        console.log('✅ Data:', JSON.stringify(realTokenResponse.data, null, 2));
      }
    } else {
      console.log('❌ Login failed with status:', loginResponse.status);
      if (loginResponse.data) {
        console.log('❌ Response data:', loginResponse.data);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCompleteFlow();