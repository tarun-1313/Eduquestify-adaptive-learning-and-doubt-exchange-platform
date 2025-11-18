import { createContext, useState, useCallback } from "react";
import runChat from "../config/gemini";

export const Context = createContext();

const ContextProvider = (props) => {
    // Chat state
    const [conversation, setConversation] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    
    // File handling
    const [uploadedFiles, setUploadedFiles] = useState([]);
    
    // Active chat ID for future implementation of multiple chats
    const [activeChatId] = useState('default');

    function delayPara(index, nextWord) {
        setTimeout(function () {
            setResultData(prev => prev + nextWord);
        }, 75 * index);
    }

    const processFileContent = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    // For PDFs and images, we'll send the file directly
                    const result = {
                        type: file.type.startsWith('image/') ? 'image' : 
                               file.type === 'application/pdf' ? 'pdf' : 'text',
                        name: file.name,
                        data: e.target.result,
                        file: file,
                        mimeType: file.type
                    };
                    resolve(result);
                } catch (error) {
                    console.error('Error processing file content:', error);
                    reject(new Error('Failed to process file content'));
                }
            };
            
            reader.onerror = (error) => {
                console.error('Error reading file:', error);
                reject(new Error('Failed to read file'));
            };
            
            // For images and PDFs, read as data URL
            if (file.type.startsWith('image/') || file.type === 'application/pdf') {
                reader.readAsDataURL(file);
            } else {
                // For text files, read as text
                reader.readAsText(file);
            }
        });
    };

    const handleFileUpload = async (file) => {
        try {
            if (!file) {
                throw new Error('No file provided');
            }
            
            // Check file size (max 20MB)
            if (file.size > 20 * 1024 * 1024) {
                throw new Error('File size should be less than 20MB');
            }
            
            // Check file type
            const validTypes = [
                'application/pdf',
                'image/jpeg',
                'image/png',
                'image/gif',
                'image/webp',
                'text/plain',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ];
            
            if (!validTypes.some(type => file.type.startsWith(type.split('/')[0]))) {
                throw new Error('Unsupported file type');
            }
            
            setLoading(true);
            const fileInfo = await processFileContent(file);
            
            // Update state with the new file
            setUploadedFiles(prev => [...prev, fileInfo]);
            return fileInfo;
            
        } catch (error) {
            console.error('Error in handleFileUpload:', error);
            setResultData(`Error: ${error.message || 'Failed to process file'}`);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const removeFile = (index) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const addMessage = useCallback((role, content, files = []) => {
        const newMessage = {
            id: Date.now(),
            role, // 'user' or 'assistant'
            content,
            timestamp: new Date().toISOString(),
            files: [...files] // Store a copy of the files at the time of sending
        };
        
        setConversation(prev => [...prev, newMessage]);
        return newMessage;
    }, []);

    const onSent = useCallback(async (prompt) => {
        const userPrompt = prompt || input;
        if ((!userPrompt || userPrompt.trim() === '') && uploadedFiles.length === 0) {
            return; // Don't send empty messages with no files
        }
        
        setLoading(true);
        
        try {
            // Add user message to conversation
            const userMessage = addMessage('user', userPrompt, [...uploadedFiles]);
            
            console.log('Sending to Gemini:', {
                prompt: userPrompt,
                fileCount: uploadedFiles.length,
                files: uploadedFiles.map(f => ({
                    name: f.name,
                    type: f.type,
                    size: f.file?.size
                }))
            });
            
            // Add a temporary loading message
            const loadingMessageId = Date.now();
            setConversation(prev => [
                ...prev, 
                { 
                    id: loadingMessageId, 
                    role: 'assistant', 
                    content: '...', 
                    isLoading: true,
                    timestamp: new Date().toISOString()
                }
            ]);
            
            // Get response from Gemini with the uploaded files
            const response = await runChat(userPrompt, uploadedFiles);
            
            if (!response) {
                throw new Error('No response from the server');
            }
            
            // Format the response with basic markdown support
            const formattedResponse = response
                .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')  // Bold
                .replace(/\*(.*?)\*/g, '<i>$1</i>')      // Italic
                .replace(/\n/g, '<br/>')                   // New lines
                .replace(/`([^`]+)`/g, '<code>$1</code>'); // Inline code
            
            // Remove loading message and add the actual response
            setConversation(prev => [
                ...prev.filter(msg => msg.id !== loadingMessageId),
                {
                    id: Date.now(),
                    role: 'assistant',
                    content: formattedResponse,
                    timestamp: new Date().toISOString()
                }
            ]);
            
        } catch (error) {
            console.error('Error in onSent:', error);
            const errorMessage = error.response?.data?.error?.message || 
                               error.message || 
                               'Failed to process your request';
            
            // Add error message to the conversation
            addMessage('assistant', `Error: ${errorMessage}`);
        } finally {
            setLoading(false);
            setInput("");
        }
    }, [input, uploadedFiles, addMessage]);

    const newChat = useCallback(() => {
        setConversation([]);
        setUploadedFiles([]);
    }, []);

    const contextValue = {
        // Chat state
        conversation,
        loading,
        input,
        setInput,
        onSent,
        newChat,
        
        // File handling
        uploadedFiles,
        handleFileUpload,
        removeFile,
        
        // For backward compatibility (update these components later)
        prevPrompts: conversation.filter(m => m.role === 'user').map(m => m.content),
        recentPrompt: conversation.filter(m => m.role === 'user').slice(-1)[0]?.content || "",
        showResult: conversation.length > 0,
        resultData: conversation.filter(m => m.role === 'assistant').slice(-1)[0]?.content || ""
    };

    return (
        <Context.Provider value={contextValue}>
            {props.children}
        </Context.Provider>
    );
};

export default ContextProvider;