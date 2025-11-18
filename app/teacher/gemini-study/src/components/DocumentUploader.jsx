import React, { useState, useRef } from 'react';
import './DocumentUploader.css';

const DocumentUploader = ({ onDocumentProcessed }) => {
  const [documentText, setDocumentText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = (file) => {
    setIsProcessing(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target.result;
      setDocumentText(content);
      onDocumentProcessed(content);
      setIsProcessing(false);
    };
    
    reader.onerror = () => {
      console.error('Error reading file');
      setIsProcessing(false);
    };

    if (file.type === 'application/pdf') {
      // For PDF files, we'll need a different approach
      // This is a placeholder - you might want to use a library like pdf.js
      reader.readAsText(file);
    } else {
      reader.readAsText(file);
    }
  };

  const handlePaste = (e) => {
    const pastedText = e.clipboardData.getData('text/plain');
    if (pastedText) {
      setDocumentText(pastedText);
      onDocumentProcessed(pastedText);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="document-uploader">
      <div 
        className={`drop-zone ${isDragging ? 'drag-active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <div className="upload-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
        </div>
        <h3>Drag & Drop your document here</h3>
        <p>or click to browse files</p>
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileInput}
          accept=".txt,.pdf,.doc,.docx"
          style={{ display: 'none' }}
        />
      </div>
      
      <div className="paste-section">
        <h4>Or paste your text here:</h4>
        <textarea
          className="text-input"
          value={documentText}
          onChange={(e) => {
            setDocumentText(e.target.value);
            onDocumentProcessed(e.target.value);
          }}
          onPaste={handlePaste}
          placeholder="Paste your document content here..."
          rows={8}
        />
      </div>
      
      {isProcessing && (
        <div className="processing-indicator">
          <div className="spinner"></div>
          <span>Processing document...</span>
        </div>
      )}
    </div>
  );
};

export default DocumentUploader;
