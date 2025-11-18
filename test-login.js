// Test login functionality
async function testLogin() {
  try {
    const loginData = {
      email: 'kakaji131919@gmail.com',
      password: 'password123' // This might be wrong, let's try common passwords
    };

    console.log('Testing login with:', loginData);
    
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });

    const result = await response.json();
    console.log('Login response:', result);
    console.log('Response status:', response.status);
    
    if (response.ok) {
      console.log('✅ Login successful!');
      
      // Check session
      const sessionResponse = await fetch('http://localhost:3001/api/auth/session');
      const sessionData = await sessionResponse.json();
      console.log('Session check:', sessionData);
    } else {
      console.log('❌ Login failed');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Wait for server to be ready, then test
setTimeout(testLogin, 2000);