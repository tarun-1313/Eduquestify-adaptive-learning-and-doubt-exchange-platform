import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

async function testFileUploadAPI() {
  try {
    // Create form data with test file
    const formData = new FormData();
    const fileContent = fs.readFileSync('test-upload.txt');
    formData.append('file', fileContent, 'test-upload.txt');
    formData.append('doubtId', '1');
    formData.append('title', 'Test API Upload');

    console.log('Testing file upload API...');
    
    // Test the upload endpoint
    const response = await fetch('http://localhost:3002/api/doubts/1/shared-notes', {
      method: 'POST',
      body: formData,
      headers: {
        // Let fetch set the Content-Type with boundary for multipart/form-data
        'Authorization': 'Bearer test-token' // Add if authentication is required
      }
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());
    
    const responseData = await response.text();
    console.log('Response data:', responseData);

    if (response.ok) {
      console.log('✅ File upload API test successful!');
      
      try {
        const jsonData = JSON.parse(responseData);
        console.log('Parsed response:', jsonData);
        
        if (jsonData.success && jsonData.note) {
          console.log('File uploaded successfully:');
          console.log('- Note ID:', jsonData.note.id);
          console.log('- Title:', jsonData.note.title);
          console.log('- File URL:', jsonData.note.file_url);
          console.log('- Size:', jsonData.note.size);
        }
      } catch (parseError) {
        console.log('Could not parse response as JSON:', parseError.message);
      }
    } else {
      console.log('❌ File upload API test failed with status:', response.status);
    }

  } catch (error) {
    console.error('❌ File upload API test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testFileUploadAPI().catch(console.error);