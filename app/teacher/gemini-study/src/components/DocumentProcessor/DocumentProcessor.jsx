import React, { useState } from 'react';
import DocumentUploader from '../DocumentUploader/DocumentUploader';
import './DocumentProcessor.css';
import { processText, processFile } from '../../services/api';

const DocumentProcessor = ({ onProcessDocument }) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [documentText, setDocumentText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState('');
  const [action, setAction] = useState('');
  const [file, setFile] = useState(null);

  const handleDocumentUpload = (content, uploadedFile = null) => {
    setDocumentText(content);
    setFile(uploadedFile);
  };

  const processDocument = async (actionType) => {
    if (!documentText.trim()) {
      alert('Please upload or paste a document first');
      return;
    }

    setProcessing(true);
    setAction(actionType);
    
    try {
      let processedText;
      if (file) {
        processedText = await processFile(file, actionType);
      } else {
        processedText = await processText(documentText, actionType);
      }
      setResult(processedText);
      setProcessing(false);
    } catch (error) {
      console.error('Error processing document:', error);
      setResult(`Error: ${error.message || 'Failed to process document'}`);
      setProcessing(false);
    }
  };

  return (
    <div className="document-processor">
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          Upload Document
        </button>
        <button 
          className={`tab ${activeTab === 'actions' ? 'active' : ''}`}
          onClick={() => setActiveTab('actions')}
          disabled={!documentText}
        >
          Process Document
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'upload' ? (
          <div className="upload-section">
            <DocumentUploader onDocumentProcessed={handleDocumentUpload} />
          </div>
        ) : (
          <div className="actions-section">
            <div className="action-buttons">
              <button 
                className="action-btn" 
                onClick={() => processDocument('summarize')}
                disabled={processing}
              >
                Summarize
              </button>
              <button 
                className="action-btn" 
                onClick={() => processDocument('questions')}
                disabled={processing}
              >
                Generate Questions
              </button>
              <button 
                className="action-btn" 
                onClick={() => processDocument('keypoints')}
                disabled={processing}
              >
                Extract Key Points
              </button>
            </div>

            {processing && (
              <div className="processing-indicator">
                <div className="spinner"></div>
                <span>Processing document... This may take a moment.</span>
              </div>
            )}

            {result && !processing && (
              <div className="result-container">
                <h3>
                  {action === 'summarize' ? 'Summary' : 
                   action === 'questions' ? 'Generated Questions' : 
                   'Key Points'}
                </h3>
                <div className="result-content">
                  {result.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentProcessor;
