const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');

// Import the actual functions from the lib files
const { getUserFlashcardSessionsMySQL, getAllUserFlashcardMasteryMySQL, getUserFlashcardStatsMySQL } = require('./lib/flashcard-db-mysql.ts');

async function testFullDashboardAPI() {
  try {
    console.log('=== Testing Full Dashboard API ===');
    
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
    
    // Verify the token
    const decoded = jwt.verify(testToken, JWT_SECRET);
    console.log('✅ Token verified, userId:', decoded.id);
    
    // Test the database functions
    console.log('\n=== Testing Database Functions ===');
    
    // Test sessions
    console.log('Testing getUserFlashcardSessionsMySQL...');
    const sessions = await getUserFlashcardSessionsMySQL(1, 10);
    console.log(`✅ Found ${sessions.length} sessions`);
    
    // Test mastery
    console.log('Testing getAllUserFlashcardMasteryMySQL...');
    const mastery = await getAllUserFlashcardMasteryMySQL(1);
    console.log(`✅ Found ${mastery.length} mastery records`);
    
    // Test stats
    console.log('Testing getUserFlashcardStatsMySQL...');
    const stats = await getUserFlashcardStatsMySQL(1);
    console.log('✅ Stats:', stats);
    
    // Simulate the full dashboard response
    const dashboardData = {
      sessions,
      mastery,
      stats
    };
    
    console.log('\n=== Full Dashboard Data ===');
    console.log(JSON.stringify(dashboardData, null, 2));
    
    console.log('\n✅ All tests passed! The dashboard API should now work.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code) {
      console.error('Error Code:', error.code);
    }
    if (error.sql) {
      console.error('SQL:', error.sql);
      console.error('Error Message:', error.sqlMessage);
    }
  }
}

testFullDashboardAPI();