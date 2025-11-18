import React, { useState, useRef, useCallback } from 'react';
import galleryIcon from '../../assets/gallery_icon.png';
import './DocumentUploader.css';

const DocumentUploader = ({ onDocumentProcessed }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [pastedText, setPastedText] = useState('');
  const fileInputRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const triggerFileInput = useCallback((e) => {
    if (e) e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleFileUpload = (file) => {
    setError('');
    
    const validTypes = [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/markdown'
    ];
    
    if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|txt|docx?|md)$/i)) {
      setError('Unsupported file type. Please upload a PDF, TXT, DOC, DOCX, or MD file.');
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('File is too large. Maximum size is 10MB.');
      return;
    }

    setIsProcessing(true);
    
    if (file.type === 'application/pdf') {
      onDocumentProcessed('', file);
      setIsProcessing(false);
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target.result;
      onDocumentProcessed(content, file);
      setIsProcessing(false);
    };
    
    reader.onerror = () => {
      setError('Error reading file. Please try again.');
      setIsProcessing(false);
    };
    
    if (file.type === 'text/plain' || file.type === 'text/markdown') {
      reader.readAsText(file);
    } else {
      onDocumentProcessed('', file);
      setIsProcessing(false);
    }
  };

  const handleTextChange = (e) => {
    const text = e.target.value;
    setPastedText(text);
    onDocumentProcessed(text); 
  };

  return (
    <div className="document-uploader">
      <div 
        className={`drop-zone ${isDragging ? 'drag-active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept=".pdf,.txt,.doc,.docx,.md"
          style={{ display: 'none' }}
        />
        
        {isProcessing ? (
          <div className="processing">Processing file...</div>
        ) : (
          <div className="upload-content">
            <div 
              className="upload-icon" 
              onClick={triggerFileInput}
              style={{ cursor: 'pointer' }}
            >
              <img 
                src={galleryIcon} 
                alt="Upload document"
                style={{ width: '48px', height: '48px', pointerEvents: 'none' }}
              />
            </div>
            <h3>Drag & Drop your file here</h3>
            <p>or</p>
            <button 
              className="browse-btn"
              type="button"
              onClick={triggerFileInput}
            >
              Browse Files
            </button>
            <p className="file-types">Supported formats: PDF, TXT, DOC, DOCX, MD</p>
          </div>
        )}
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="divider">
        <span>OR</span>
      </div>
      
      <div className="paste-section">
        <h4>Paste your text here:</h4>
        <textarea
          value={pastedText}
          onChange={handleTextChange}
          placeholder="Paste your document content here..."
          rows={8}
        />
      </div>
    </div>
  );
};

export default DocumentUploader;