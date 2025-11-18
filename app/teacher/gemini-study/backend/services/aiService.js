import fetch from 'node-fetch';

// Environment variables are loaded by dotenv/config in server.js

// Configuration
const API_KEY = process.env.GEMINI_API_KEY;
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

if (!API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in environment variables');
}

/**
 * Generate content using Gemini API
 * @param {string} prompt - The prompt to send to the model
 * @returns {Promise<string>} - The generated content
 */
const generateWithGemini = async (prompt) => {
  try {
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No content generated';
  } catch (error) {
    console.error('Error generating with Gemini:', error);
    throw new Error('Failed to generate content with AI');
  }
};

/**
 * Summarize the given text
 * @param {string} text - The text to summarize
 * @returns {Promise<string>} - The summary
 */
export const summarizeText = async (text) => {
  const prompt = `Please provide a concise summary of the following text. Focus on the main points and key information.\n\n${text.substring(0, 30000)}`;
  return generateWithGemini(prompt);
};

/**
 * Generate questions based on the text
 * @param {string} text - The text to generate questions from
 * @returns {Promise<string>} - The generated questions
 */
export const generateQuestions = async (text) => {
  const prompt = `Generate 5 relevant questions based on the following text. Make sure the questions are specific and test understanding of the key concepts.\n\n${text.substring(0, 30000)}`;
  return generateWithGemini(prompt);
};

/**
 * Extract key points from the text
 * @param {string} text - The text to extract key points from
 * @returns {Promise<string>} - The extracted key points
 */
export const extractKeyPoints = async (text) => {
  const prompt = `Extract the key points from the following text. Present them as a bulleted list.\n\n${text.substring(0, 30000)}`;
  return generateWithGemini(prompt);
};
