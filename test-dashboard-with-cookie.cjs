const axios = require('axios');
const jwt = require('jsonwebtoken');

async function testDashboardWithCookie() {
  try {
    console.log('=== Testing Dashboard with Cookie Authentication ===');
    
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
    
    // Test the dashboard page with cookie
    const response = await axios.get('http://localhost:3003/study/flashcards/dashboard', {
      headers: {
        'Cookie': `eduq_token=${testToken}`
      },
      maxRedirects: 0,
      validateStatus: function (status) {
        return status < 500; // Don't throw on 4xx errors
      }
    });
    
    console.log('✅ Dashboard Page Response Status:', response.status);
    
    if (response.status === 200) {
      console.log('✅ Dashboard page loaded successfully!');
      // Save response to file for inspection
      const fs = require('fs');
      fs.writeFileSync('dashboard-response.html', response.data);
      console.log('✅ Response saved to dashboard-response.html');
      
      // Check if the page contains dashboard content
      const containsDashboardContent = response.data.includes('Flashcard Dashboard') || 
                                      response.data.includes('Track your learning progress');
      console.log('✅ Contains dashboard content:', containsDashboardContent);
      
      // Check for common page elements
      console.log('✅ Contains "login":', response.data.includes('login'));
      console.log('✅ Contains "signin":', response.data.includes('signin'));
      console.log('✅ Contains "redirect":', response.data.includes('redirect'));
      console.log('✅ Contains "dashboard":', response.data.includes('dashboard'));
    } else {
      console.log('❌ Dashboard page failed with status:', response.status);
      if (response.data) {
        console.log('❌ Response data preview:', response.data.substring(0, 500));
        // Check if it's a login page or redirect
        if (response.data.includes('login') || response.data.includes('signin')) {
          console.log('❌ Page appears to be a login page');
        }
        if (response.data.includes('redirect')) {
          console.log('❌ Page appears to be redirecting');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Dashboard test failed:', error.message);
  }
}

testDashboardWithCookie();