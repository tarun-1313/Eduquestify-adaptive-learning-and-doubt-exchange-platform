import { summarizeText, generateQuestions, extractKeyPoints } from './aiService.js';

export const processText = async (text, action) => {
  try {
    switch (action) {
      case 'summarize':
        return await summarizeText(text);
      case 'questions':
        return await generateQuestions(text);
      case 'keypoints':
        return await extractKeyPoints(text);
      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Error in processText:', error);
    throw error;
  }
};
