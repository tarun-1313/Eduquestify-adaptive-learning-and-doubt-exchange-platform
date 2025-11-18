const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Process text with the specified action
 * @param {string} text - The text to process
 * @param {string} action - The action to perform (summarize, questions, keypoints)
 * @returns {Promise<string>} - The processed result
 */
export const processText = async (text, action) => {
  try {
    const response = await fetch(`${API_BASE_URL}/process/text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, action }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to process text');
    }

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('Error in processText:', error);
    throw error;
  }
};

/**
 * Process a file with the specified action
 * @param {File} file - The file to process
 * @param {string} action - The action to perform (summarize, questions, keypoints)
 * @returns {Promise<string>} - The processed result
 */
export const processFile = async (file, action) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('action', action);

  try {
    const response = await fetch(`${API_BASE_URL}/process/file`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to process file');
    }

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('Error in processFile:', error);
    throw error;
  }
};

/**
 * Check if the API is available
 * @returns {Promise<boolean>} - True if the API is available
 */
export const checkApiHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};
