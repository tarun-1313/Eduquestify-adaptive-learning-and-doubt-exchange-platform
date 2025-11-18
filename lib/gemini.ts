import { GoogleGenerativeAI } from '@google/generative-ai'

// Function to get Gemini model with API key
export function getGeminiModel(apiKey: string) {
  if (!apiKey) {
    throw new Error('API key is required for Gemini')
  }
  const genAI = new GoogleGenerativeAI(apiKey)
  // Use the standard, latest Flash model
  return genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
}

export interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  topic: string
}

export interface Flashcard {
  id: string
  front: string
  back: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  topic: string
}

/**
 * Gets the text content from a Gemini API response.
 */
function getTextFromGeminiResponse(response: any): string {
  if (response?.candidates?.[0]?.content?.parts?.[0]?.text) {
    return response.candidates[0].content.parts[0].text
  }
  throw new Error('Unexpected response format from Gemini API')
}

/**
 * Generate adaptive questions based on topic and difficulty
 */
export async function generateQuestions(
  apiKey: string,
  topic: string,
  difficulty: 'Easy' | 'Medium' | 'Hard',
  count: number = 5
): Promise<Question[]> {
  try {
    const model = getGeminiModel(apiKey)
    const prompt = `
Generate ${count} multiple-choice questions about "${topic}" at ${difficulty} difficulty level.
Each question should have:
- 4 options (A, B, C, D)
- One correct answer (as an index 0-3)
- A brief explanation
- The topic "${topic}"

Format the response as JSON array with this structure:
[
  {
    "question": "Question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Brief explanation of why this is correct",
    "difficulty": "${difficulty}",
    "topic": "${topic}"
  }
]

Make questions educational and accurate.`

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      // Force the model to output JSON
      generationConfig: { responseMimeType: "application/json" },
    })

    // Standardized way to get text
    const text = getTextFromGeminiResponse(result.response)

    // No need for regex, as we forced JSON output
    const questions: Question[] = JSON.parse(text)

    // Add unique IDs to each question
    return questions.map((q) => ({
      ...q,
      id: crypto.randomUUID(), // Use crypto.randomUUID() for truly unique IDs
      difficulty: difficulty,
      topic: topic,
    }))
  } catch (error) {
    console.error('Error generating questions:', error)
    throw new Error('Failed to generate questions. Please try again.')
  }
}

/**
 * Generate flashcards from notes or topics
 */
export async function generateFlashcards(
  apiKey: string,
  topic: string,
  notes?: string,
  count: number = 10
): Promise<Flashcard[]> {
  try {
    const model = getGeminiModel(apiKey)
    const prompt = notes
      ? `Create ${count} flashcards about "${topic}" based on these notes:\n\n${notes}\n\n`
      : `Create ${count} flashcards about "${topic}" covering key concepts.\n\n`

    const fullPrompt = `${prompt}
For each flashcard, provide:
- Front: A question or term
- Back: The answer or definition
- Difficulty: Easy, Medium, or Hard
- Topic: "${topic}"

Format the response as a JSON array with this structure:
[
  {
    "front": "Question or term",
    "back": "Answer or definition",
    "difficulty": "Easy|Medium|Hard",
    "topic": "${topic}"
  }
]`

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
      // Force the model to output JSON
      generationConfig: { responseMimeType: "application/json" },
    })

    // Standardized way to get text
    const text = getTextFromGeminiResponse(result.response)

    // No need for regex
    const flashcards = JSON.parse(text) as Flashcard[]

    // Add unique IDs to each flashcard
    return flashcards.map((card) => ({
      ...card,
      id: crypto.randomUUID(), // Use crypto.randomUUID()
      topic: topic,
    }))
  } catch (error) {
    console.error('Error generating flashcards:', error)
    throw new Error('Failed to generate flashcards. Please try again.')
  }
}

/**
 * Analyze student performance and suggest topics to strengthen
 */
export async function analyzePerformance(
  apiKey: string,
  recentScores: { topic: string; score: number; totalQuestions: number }[]
): Promise<{ topic: string; reason: string; priority: 'High' | 'Medium' | 'Low' }[]> {
  try {
    const model = getGeminiModel(apiKey)
    const prompt = `Analyze these quiz results and suggest which topics the student should focus on:
${JSON.stringify(recentScores, null, 2)}

For each topic that needs improvement, provide:
- Topic name
- Reason for improvement
- Priority (High, Medium, or Low)

Format the response as a JSON array with this structure:
[
  {
    "topic": "Topic Name",
    "reason": "Reason for improvement",
    "priority": "High|Medium|Low"
  }
]`

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      // Force the model to output JSON
      generationConfig: { responseMimeType: "application/json" },
    })

    // Standardized way to get text
    const text = getTextFromGeminiResponse(result.response)

    // No need for regex
    return JSON.parse(text)
  } catch (error) {
    console.error('Error analyzing performance:', error)
    throw new Error('Failed to analyze performance.')
  }
}