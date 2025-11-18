// Simple test to check environment variables
console.log('Environment check:')
console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY)
console.log('GEMINI_API_KEY length:', process.env.GEMINI_API_KEY?.length || 0)
console.log('NODE_ENV:', process.env.NODE_ENV)

// Test the Gemini API if key exists
if (process.env.GEMINI_API_KEY) {
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    console.log('✅ Gemini API initialized successfully')

    // Simple test
    model.generateContent('Say "Hello, World!"')
      .then(result => {
        console.log('✅ Gemini API test successful')
        console.log('Response preview:', result.response.text().substring(0, 50))
      })
      .catch(error => {
        console.error('❌ Gemini API test failed:', error.message)
      })

  } catch (error) {
    console.error('❌ Failed to initialize Gemini API:', error.message)
  }
} else {
  console.error('❌ GEMINI_API_KEY not configured')
}
