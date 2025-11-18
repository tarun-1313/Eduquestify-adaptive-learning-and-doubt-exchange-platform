import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import { processText } from './services/documentProcessor.js';
import { processPdf } from './services/pdfProcessor.js';
import { processDocx } from './services/docxProcessor.js';

// Verify required environment variables
if (!process.env.GEMINI_API_KEY) {
  console.error('❌ ERROR: GEMINI_API_KEY is not set in environment variables');
  console.log('💡 Please create a .env file in the backend directory with your API key:');
  console.log('GEMINI_API_KEY=your_api_key_here');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Log environment status
console.log('\n🚀 Starting Document Processor API');
console.log('----------------------------');
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Port: ${PORT}`);
console.log(`API Key: ${process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Missing'}`);
console.log('----------------------------\n');

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Document Processor API is running' });
});

// Process text
app.post('/api/process/text', async (req, res) => {
  try {
    const { text, action } = req.body;
    if (!text || !action) {
      return res.status(400).json({ error: 'Text and action are required' });
    }
    
    const result = await processText(text, action);
    res.json({ result });
  } catch (error) {
    console.error('Error processing text:', error);
    res.status(500).json({ error: 'Failed to process text' });
  }
});

// Process file upload
app.post('/api/process/file', async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: 'No files were uploaded' });
    }

    const { file } = req.files;
    const { action } = req.body;
    
    if (!action) {
      return res.status(400).json({ error: 'Action is required' });
    }

    let result;
    const fileType = file.mimetype;
    
    if (fileType === 'application/pdf') {
      result = await processPdf(file.data, action);
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      result = await processDocx(file.data, action);
    } else if (fileType === 'text/plain') {
      result = await processText(file.data.toString(), action);
    } else {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    res.json({ result });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ error: 'Failed to process file' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
