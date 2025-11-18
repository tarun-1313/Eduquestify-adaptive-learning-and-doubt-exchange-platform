// lib/gemini-utils.js
let pdfjsLib;

// Only import PDF.js in the browser
if (typeof window !== 'undefined') {
  // Dynamic import for client-side only
  pdfjsLib = require('pdfjs-dist/build/pdf');
  const pdfjsWorker = require('pdfjs-dist/build/pdf.worker.entry');
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

export async function readPdfText(file) {
  if (typeof window === 'undefined') {
    throw new Error('PDF processing is only available in the browser');
  }

  if (!file) {
    throw new Error('No file provided');
  }

  if (file.type !== 'application/pdf') {
    throw new Error('File must be a PDF');
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    let fullText = '';
    
    // Process up to 10 pages
    const pageLimit = Math.min(10, pdf.numPages);
    
    for (let i = 1; i <= pageLimit; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      
      // Extract text content
      const pageText = content.items
        .filter(item => 'str' in item)
        .map(item => item.str)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      fullText += (fullText ? '\n\n' : '') + pageText;
      
      // Stop if we've extracted enough text
      if (fullText.length > 10000) {
        console.log(`Stopped after page ${i} due to length`);
        break;
      }
    }
    
    if (!fullText.trim()) {
      throw new Error('The PDF appears to be empty or contains no extractable text.');
    }
    
    return fullText;
  } catch (error) {
    console.error('Error reading PDF:', error);
    throw new Error(`Failed to process PDF: ${error.message}`);
  }
}

export async function generateQuestionsFromPdf(pdfText) {
  if (!pdfText) {
    throw new Error('No text provided for question generation');
  }

  const apiKey = 'AIzaSyD7watLiaNdCUuzIX_UOIVdDCnCLip9eIo';
  const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

  const prompt = `You are an expert educator creating high-quality multiple choice questions. 
  Generate 10-15 multiple choice questions based on the following text. Follow these guidelines:

  1. Questions should test understanding of key concepts from the text
  2. Each question should have 4 plausible answer choices (A, B, C, D)
  3. Only one correct answer per question
  4. Include a clear, concise explanation for the correct answer
  5. Categorize each question by difficulty (Easy/Medium/Hard)
  6. Identify the main topic of each question
  7. Add relevant tags to help with categorization

  Format your response as a valid JSON array of objects with these fields:
  - question: string (the question text)
  - options: string[] (exactly 4 options)
  - correctAnswer: number (0-3, index of correct option)
  - explanation: string (why this is the correct answer)
  - difficulty: "Easy" | "Medium" | "Hard"
  - topic: string (main topic of the question)
  - tags: string[] (relevant tags, 2-3 per question)

  Text to generate questions from:
  ${pdfText.substring(0, 15000)}`;

  try {
    const response = await fetch(`${apiUrl}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API Error:', errorData);
      throw new Error(`API Error: ${errorData.error?.message || 'Failed to generate questions'}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    try {
      // Clean up the response to extract valid JSON
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : responseText.replace(/```/g, '').trim();
      const parsed = JSON.parse(jsonString);
      
      // Validate the response structure
      if (!Array.isArray(parsed)) {
        throw new Error('Invalid response format: expected an array of questions');
      }
      
      return parsed.map((q, i) => ({
        id: `gen-${Date.now()}-${i}`,
        question: q.question?.trim() || `Question ${i + 1}`,
        options: (Array.isArray(q.options) ? q.options : []).map(opt => String(opt).trim()),
        correctAnswer: Number.isInteger(q.correctAnswer) ? Math.max(0, Math.min(3, q.correctAnswer)) : 0,
        explanation: String(q.explanation || '').trim(),
        difficulty: ['Easy', 'Medium', 'Hard'].includes(q.difficulty) ? q.difficulty : 'Medium',
        topic: String(q.topic || 'General').trim(),
        tags: Array.isArray(q.tags) ? q.tags.map(String) : [],
        status: 'pending',
        source: 'ai',
        createdAt: new Date().toISOString()
      }));
    } catch (e) {
      console.error('Failed to parse Gemini response:', e);
      console.error('Response was:', responseText);
      throw new Error('Failed to parse the generated questions. The AI response format was invalid.');
    }
  } catch (error) {
    console.error('Error generating questions:', error);
    throw new Error(`Failed to generate questions: ${error.message}`);
  }
}