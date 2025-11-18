import { processText } from './documentProcessor.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { join } from 'path';
import { tmpdir } from 'os';

const execAsync = promisify(exec);

/**
 * Process a PDF file using pdftotext
 * @param {Buffer} fileBuffer - The PDF file buffer
 * @param {string} action - The action to perform (summarize, questions, keypoints)
 * @returns {Promise<string>} - The processed result
 */
export const processPdf = async (fileBuffer, action) => {
  const tempDir = tmpdir();
  const inputPath = join(tempDir, `${uuidv4()}.pdf`);
  const outputPath = join(tempDir, `${uuidv4()}.txt`);

  try {
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new Error('Empty PDF file provided');
    }

    // Write PDF to temporary file
    await writeFile(inputPath, fileBuffer);

    // Convert PDF to text using pdftotext
    try {
      await execAsync(`pdftotext -layout ${inputPath} ${outputPath}`);
    } catch (error) {
      // If pdftotext is not available, try a fallback method
      console.warn('pdftotext not available, trying fallback method...');
      const { default: pdfjs } = await import('pdfjs-dist/legacy/build/pdf.js');
      const { getDocument, GlobalWorkerOptions } = pdfjs;
      
      GlobalWorkerOptions.workerSrc = await import('pdfjs-dist/legacy/build/pdf.worker.entry.js');
      
      const loadingTask = getDocument(new Uint8Array(fileBuffer));
      const pdf = await loadingTask.promise;
      let text = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(' ') + '\n';
      }
      
      return processText(text.trim(), action);
    }

    // Read the converted text
    const { readFile } = await import('fs/promises');
    const text = (await readFile(outputPath, 'utf-8')).trim();
    
    if (!text) {
      throw new Error('No text could be extracted from the PDF');
    }
    
    // Process the extracted text
    return processText(text, action);
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw new Error(`Failed to process PDF: ${error.message}`);
  } finally {
    // Clean up temporary files
    try {
      await Promise.allSettled([
        unlink(inputPath).catch(() => {}),
        unlink(outputPath).catch(() => {})
      ]);
    } catch (cleanupError) {
      console.warn('Error cleaning up temporary files:', cleanupError);
    }
  }
};
