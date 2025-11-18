import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

// Initialize the Google Generative AI with the API key and configuration
const API_KEY = "AIzaSyA55H3trXOLFnQI85pFxnvYG5j0gN0zddw";

// Debug log
console.log('Initializing Gemini API with key:', API_KEY ? '***' + API_KEY.slice(-4) : 'Not set');

if (!API_KEY) {
  const errorMsg = 'Missing Google AI API key. Please set VITE_GEMINI_API_KEY in your .env.local file';
  console.error(errorMsg);
  // Show user-friendly error
  if (typeof document !== 'undefined') {
    document.body.innerHTML = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 50px auto; border: 1px solid #ff6b6b; border-radius: 8px; background-color: #fff5f5;">
        <h2 style="color: #ff6b6b;">Configuration Error</h2>
        <p>${errorMsg}</p>
        <ol>
          <li>Create a file named <code>.env.local</code> in your project root</li>
          <li>Add: <code>VITE_GEMINI_API_KEY=your_api_key_here</code></li>
          <li>Get your API key from <a href="https://aistudio.google.com/" target="_blank">Google AI Studio</a></li>
          <li>Restart the development server</li>
        </ol>
      </div>
    `;
  }
  throw new Error(errorMsg);
}

// Initialize the Google Generative AI
let genAI;
try {
  genAI = new GoogleGenerativeAI(API_KEY);
  console.log('GoogleGenerativeAI initialized successfully');
} catch (error) {
  console.error('Error initializing GoogleGenerativeAI:', error);
  throw new Error(`Failed to initialize AI: ${error.message}`);
}

// Model configuration
const MODEL_NAME = "gemini-2.0-flash";
console.log(`Using model: ${MODEL_NAME}`);

// Generation configuration
const generationConfig = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 2048,
};

// Safety settings
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

console.log('Gemini configuration loaded successfully');

// Convert file to GoogleGenerativeAI.Part
const fileToGenerativePart = (file) => {
  try {
    // Extract base64 data from data URL
    const base64Data = file.data.split(',')[1];
    if (!base64Data) {
      throw new Error('Invalid file data format');
    }
    
    return {
      inlineData: {
        data: base64Data,
        mimeType: file.mimeType || file.type || 'application/octet-stream',
      },
    };
  } catch (error) {
    console.error('Error in fileToGenerativePart:', error);
    throw new Error(`Failed to process file: ${error.message}`);
  }
};

async function runChat(prompt, files = []) {
  console.log('runChat called with:', { prompt, fileCount: files?.length || 0 });
  
  try {
    // Get the generative model
    const model = genAI.getGenerativeModel({ 
      model: MODEL_NAME,
      generationConfig,
      safetySettings,
    });

    // Process files if any
    const fileParts = [];
    if (files && files.length > 0) {
      for (const file of files) {
        try {
          const part = fileToGenerativePart(file);
          fileParts.push(part);
        } catch (error) {
          console.error('Error processing file:', file.name, error);
          // Continue with other files if one fails
        }
      }
    }
    
    // Prepare the prompt
    let fullPrompt = prompt || 'Please analyze the content.';
    
    // Add file context if we have files
    if (fileParts.length > 0) {
      fullPrompt = `I have some content for you to analyze. ${fullPrompt}\n\n`;
      fullPrompt += `Please provide a detailed analysis of the provided content.`;
    }
    
    console.log('Sending to Gemini:', { 
      prompt: fullPrompt.substring(0, 100) + (fullPrompt.length > 100 ? '...' : ''),
      fileCount: fileParts.length 
    });

    // Prepare the request
    const request = {
      contents: [{
        role: 'user',
        parts: [
          { text: fullPrompt },
          ...fileParts
        ].filter(Boolean) // Remove any null/undefined parts
      }]
    };

    console.log('Sending request to Gemini API...');
    const result = await model.generateContent(request);
    const response = await result.response;
    
    if (!response || !response.text) {
      throw new Error('Invalid response from API');
    }
    
    const text = response.text();
    console.log('Received response from Gemini:', text.substring(0, 100) + (text.length > 100 ? '...' : ''));
    return text;
    
  } catch (error) {
    console.error('Error in runChat:', error);
    
    // More specific error messages
    if (error.message.includes('API key not valid')) {
      return 'Error: The provided API key is invalid. Please check your API key and try again.';
    } else if (error.message.includes('quota')) {
      return 'Error: API quota exceeded. Please check your Google Cloud Console for quota information.';
    } else if (error.message.includes('network')) {
      return 'Error: Network error. Please check your internet connection and try again.';
    } else {
      return `Error: ${error.message || 'Failed to process your request. Please try again.'}`;
    }
  }
}

export default runChat;