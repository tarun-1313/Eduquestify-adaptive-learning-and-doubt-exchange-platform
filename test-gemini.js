import { GoogleGenerativeAI } from '@google/generative-ai'

// Simple test to check if Gemini API is working
async function testGeminiAPI() {
  try {
    // Check if API key is set
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY not found in environment variables')
      console.log('Please add your Gemini API key to .env.local file:')
      console.log('GEMINI_API_KEY=your_api_key_here')
      return
    }

    console.log('🔧 Testing Gemini API connection...')

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const prompt = 'Generate a simple multiple choice question about mathematics. Return it as JSON with question, options, correctAnswer, and explanation fields.'

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    console.log('✅ Gemini API test successful!')
    console.log('Response:', text.substring(0, 200) + '...')

  } catch (error) {
    console.error('❌ Gemini API test failed:', error.message)

    if (error.message.includes('API_KEY')) {
      console.log('💡 This usually means the API key is invalid or not set correctly')
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      console.log('💡 This usually means there\'s a network connectivity issue')
    }
  }
}

// Run the test
testGeminiAPI()
