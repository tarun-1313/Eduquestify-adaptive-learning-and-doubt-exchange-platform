import React, { useContext, useRef, useState, useCallback, useEffect } from 'react';
import './Main.css';
import { assets } from '../../assets/assets';
import { Context } from '../../context/Context';

const Main = () => {
  const {
    conversation,
    loading,
    input,
    setInput,
    onSent,
    uploadedFiles,
    handleFileUpload,
    removeFile,
    newChat
  } = useContext(Context);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Auto-scroll to bottom of chat when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

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

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      for (const file of files) {
        await handleFileUpload(file);
      }
    }
  }, [handleFileUpload]);

  const handleFileInputChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of files) {
      await handleFileUpload(file);
    }
    
    // Reset the file input's value to allow uploading the same file again
    e.target.value = null;
  };

  const triggerFileInput = useCallback((e) => {
    e?.stopPropagation();
    fileInputRef.current?.click();
  }, []);

  const handleSend = useCallback(() => {
    if ((!input || input.trim() === '') && uploadedFiles.length === 0) return;
    onSent(input || "");
  }, [input, onSent, uploadedFiles]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderFilePreview = (file, index, messageId) => {
    const handleRemove = (e) => {
      e.stopPropagation();
      if (messageId) {
        // For files in message history, we can't remove them, just show a tooltip
        return;
      }
      removeFile(index);
    };

    const previewContent = () => {
      if (file.type === 'image') {
        return <img src={file.data} alt={file.name} className="file-thumbnail" />;
      } else if (file.type === 'pdf') {
        return <div className="file-icon pdf">PDF</div>;
      } else {
        return <div className="file-icon">{file.name.split('.').pop().toUpperCase()}</div>;
      }
    };

    return (
      <div 
        key={`${messageId || 'input'}-${index}`} 
        className={`file-preview ${messageId ? 'history-file' : ''}`}
        title={messageId ? 'This file was part of the original message' : 'Click to remove'}
      >
        {previewContent()}
        <span className="file-name">{file.name}</span>
        {!messageId && (
          <button className="remove-file" onClick={handleRemove}>×</button>
        )}
      </div>
    );
  };

  const renderMessage = (message) => {
    const isUser = message.role === 'user';
    const messageClass = isUser ? 'user-message' : 'assistant-message';
    
    return (
      <div key={message.id} className={`message ${messageClass}`}>
        <div className="message-avatar">
          {isUser ? '👤' : '🤖'}
        </div>
        <div className="message-content">
          {message.files && message.files.length > 0 && (
            <div className="message-files">
              {message.files.map((file, idx) => renderFilePreview(file, idx, message.id))}
            </div>
          )}
          {message.content && (
            <div className="message-text" 
                 dangerouslySetInnerHTML={{ __html: message.content }} 
            />
          )}
          {message.isLoading && (
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
          <div className="message-timestamp">
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="main">
      <div className="nav">
        <div className="nav-left">
          <button className="new-chat-btn" onClick={newChat}>
            <span>+ New Chat</span>
          </button>
        </div>
        <div className="nav-right">
          <img src={assets.user_icon} alt="User" className="user-avatar" />
        </div>
      </div>
      
      <div className="chat-container">
        {conversation.length === 0 ? (
          <div className="welcome-message">
            <h1>Hello, I'm Gemini</h1>
            <p>How can I help you today?</p>
            <div className="suggestions">
              <button>Explain quantum computing</button>
              <button>Suggest fun activities</button>
              <button>Help me plan a trip</button>
            </div>
          </div>
        ) : (
          <div className="messages-container">
            {conversation.map(renderMessage)}
            <div ref={messagesEndRef} />
          </div>
        )}
        
        <div 
          className={`input-container ${isDragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="file-previews">
            {uploadedFiles.map((file, index) => renderFilePreview(file, index))}
          </div>
          
          <div className="input-box">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message Gemini..."
              className="search-input"
            />
            <div className="search-actions">
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={handleFileInputChange}
                multiple
              />
              <button 
                type="button"
                className="icon-button"
                onClick={triggerFileInput}
                title="Attach files"
              >
                <img src={assets.gallery_icon} alt="Attach files" width={24} />
              </button>
              
              <button 
                className="icon-button" 
                type="button"
                title="Voice input"
                disabled={true}  // Disabled as it's not implemented
              >
                <img src={assets.mic_icon} alt="Voice input" width={24} />
              </button>
              
              {(input.trim() || uploadedFiles.length > 0) && (
                <button 
                  className="icon-button send-button" 
                  onClick={handleSend}
                  disabled={loading}
                  type="button"
                >
                  <img 
                    src={assets.send_icon} 
                    alt="Send" 
                    width={24} 
                    style={{ opacity: loading ? 0.5 : 1 }}
                  />
                </button>
              )}
            </div>
          </div>
          
          <p className="bottom-info">
            Gemini may display inaccurate info, including about people, so double-check its responses.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Main;