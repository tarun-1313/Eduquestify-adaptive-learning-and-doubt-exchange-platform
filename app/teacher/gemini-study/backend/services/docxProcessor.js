import mammoth from 'mammoth';
import { processText } from './documentProcessor.js';

/**
 * Process a DOCX file
 * @param {Buffer} fileBuffer - The DOCX file buffer
 * @param {string} action - The action to perform (summarize, questions, keypoints)
 * @returns {Promise<string>} - The processed result
 */
export const processDocx = async (fileBuffer, action) => {
  try {
    // Extract text from DOCX
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    const text = result.value;
    
    if (!text || text.trim().length === 0) {
      throw new Error('No text could be extracted from the DOCX file');
    }
    
    // Process the extracted text
    return await processText(text, action);
  } catch (error) {
    console.error('Error processing DOCX:', error);
    throw new Error('Failed to process DOCX file');
  }
};
