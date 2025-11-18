// Simple test to check if Gemini API key is valid
const API_KEY = 'AIzaSyA55H3trXOLFnQI85pFxnvYG5j0gN0zddw';

async function testGeminiKey() {
  try {
    console.log('🔑 Testing Gemini API key...');

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Say "API key is working!" in a short response.'
          }]
        }]
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Gemini API key is valid!');
      console.log('Response:', data.candidates[0].content.parts[0].text);
      return true;
    } else {
      console.log('❌ API key is invalid or expired');
      console.log('Status:', response.status);
      console.log('Response:', await response.text());
      return false;
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
    return false;
  }
}

testGeminiKey();
