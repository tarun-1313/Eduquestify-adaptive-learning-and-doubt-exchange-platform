'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import jsPDF from "jspdf";

const DEPARTMENTS = [
  'Computer Engineering',
  'Civil Engineering',
  'IT',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Data Science',
  'AI and ML',
  'Other'
];

const YEARS = [
  'First Year',
  'Second Year',
  'Third Year',
  'Fourth Year'
];

const CONVERSATION_STEPS = {
  INITIAL: 'initial',
  DEPARTMENT: 'department',
  YEAR: 'year',
  SUBJECT: 'subject',
  TOPIC: 'topic',
  RESULT: 'result'
};

export default function QuestionBankChatbot() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'How can I help you generate questions today?' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [searchParams, setSearchParams] = useState({
    department: '',
    year: '',
    subject: '',
    topic: ''
  });
  const [currentStep, setCurrentStep] = useState(CONVERSATION_STEPS.INITIAL);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim() && currentStep !== CONVERSATION_STEPS.DEPARTMENT && currentStep !== CONVERSATION_STEPS.YEAR) return;

    let messageText = userInput;
    if (currentStep === CONVERSATION_STEPS.DEPARTMENT) {
      messageText = searchParams.department;
    } else if (currentStep === CONVERSATION_STEPS.YEAR) {
      messageText = searchParams.year;
    }

    // Add user message to chat
    const newMessage = { sender: 'user', text: messageText };
    setMessages(prev => [...prev, newMessage]);
    setUserInput('');

    // Handle conversation flow
    if (currentStep === CONVERSATION_STEPS.INITIAL) {
      if (userInput.toLowerCase().includes('question bank') || 
          userInput.toLowerCase().includes('find') || 
          userInput.toLowerCase().includes('search') ||
          userInput.toLowerCase().includes('get')) {
        setCurrentStep(CONVERSATION_STEPS.DEPARTMENT);
        setMessages(prev => [...prev, { 
          sender: 'bot', 
          text: 'Please select your department:',
          showDepartmentDropdown: true
        }]);
      }
    } 
    else if (currentStep === CONVERSATION_STEPS.DEPARTMENT) {
      setCurrentStep(CONVERSATION_STEPS.YEAR);
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: 'Please select your academic year:',
        showYearDropdown: true
      }]);
    } 
    else if (currentStep === CONVERSATION_STEPS.YEAR) {
      setCurrentStep(CONVERSATION_STEPS.SUBJECT);
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: 'What subject are you interested in? (e.g., Software Engineering, Physics, etc.)' 
      }]);
    } 
    else if (currentStep === CONVERSATION_STEPS.SUBJECT) {
      setSearchParams(prev => ({ ...prev, subject: userInput }));
      setCurrentStep(CONVERSATION_STEPS.TOPIC);
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: `Great. And finally, what specific topic for ${userInput} are you looking for?` 
      }]);
    } 
    else if (currentStep === CONVERSATION_STEPS.TOPIC) {
      setSearchParams(prev => ({ ...prev, topic: userInput }));
      setCurrentStep(CONVERSATION_STEPS.RESULT);
      
      // Search for question bank with fuzzy matching
      try {
        const response = await fetch(
          `/api/question-banks/search?` + new URLSearchParams({
            ...searchParams,
            topic: userInput,
            fuzzyMatch: true // Enable fuzzy matching in the backend
          })
        );
        
        if (!response.ok) throw new Error('Failed to search question banks');
        
        const questionBank = await response.json();
        
        if (questionBank) {
          setMessages(prev => [...prev, { 
            sender: 'bot', 
            text: `I found it! Here is the question bank for ${userInput}.`,
            data: questionBank
          }]);
        } else {
          setMessages(prev => [...prev, { 
            sender: 'bot', 
            text: "Sorry, I've checked the database, but I don't have a question bank for that specific department, year, subject, and topic combination."
          }]);
        }
      } catch (error) {
        console.error('Error searching question bank:', error);
        setMessages(prev => [...prev, { 
          sender: 'bot', 
          text: 'Sorry, there was an error searching for the question bank. Please try again.'
        }]);
      }
      
      // Reset to initial state after showing results
      setCurrentStep(CONVERSATION_STEPS.INITIAL);
      setSearchParams({
        department: '',
        year: '',
        subject: '',
        topic: ''
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleDepartmentSelect = (value) => {
    setSearchParams(prev => ({ ...prev, department: value }));
    handleSendMessage({ preventDefault: () => {} });
  };

  const handleYearSelect = (value) => {
    setSearchParams(prev => ({ ...prev, year: value }));
    handleSendMessage({ preventDefault: () => {} });
  };

  return (
    <div className="flex gap-4">
      {/* Main Chat Interface */}
      <Card className="flex-1">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <ScrollArea className="h-[600px] rounded-md border">
              <div className="p-4 space-y-4">
                {messages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.sender === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.text}</p>
                      {message.showDepartmentDropdown && (
                        <Select
                          value={searchParams.department}
                          onValueChange={handleDepartmentSelect}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Select Department" />
                          </SelectTrigger>
                          <SelectContent>
                            {DEPARTMENTS.map((dept) => (
                              <SelectItem key={dept} value={dept}>
                                {dept}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      {message.showYearDropdown && (
                        <Select
                          value={searchParams.year}
                          onValueChange={handleYearSelect}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Select Year" />
                          </SelectTrigger>
                          <SelectContent>
                            {YEARS.map((year) => (
                              <SelectItem key={year} value={year}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      {message.data && (
                        <div className="mt-2 p-2 bg-background rounded">
                          <div className="mb-2">
                            <h2 className="text-lg font-bold">{message.data.title || "Question Bank"}</h2>
                            <p className="text-muted-foreground text-sm mb-1">{message.data.topic ? `Topic: ${message.data.topic}` : ""}</p>
                            <p className="text-muted-foreground text-sm mb-1">{message.data.year ? `Year: ${message.data.year}` : ""}</p>
                            <p className="text-muted-foreground text-sm mb-1">{message.data.department ? `Department: ${message.data.department}` : ""}</p>
                            {message.data.description && (
                              <p className="mb-2 text-base">{message.data.description}</p>
                            )}
                          </div>
                          {/* Render questions as a numbered list */}
                          {(() => {
                            let questionsArr = [];
                            if (Array.isArray(message.data.questions)) {
                              questionsArr = message.data.questions;
                            } else if (typeof message.data.questions === "string") {
                              questionsArr = message.data.questions.split(/\n+/).map(q => q.trim()).filter(q => q.length > 0);
                            }
                            return questionsArr.length > 0 ? (
                              <ol className="list-decimal pl-6 space-y-2">
                                {questionsArr.map((q, idx) => (
                                  <li key={idx} className="text-base">
                                    {q}
                                  </li>
                                ))}
                              </ol>
                            ) : (
                              <p className="italic text-muted-foreground">No questions found in this question bank.</p>
                            );
                          })()}
                          {/* Download PDF Button */}
                          <button
                            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/80"
                            onClick={() => generatePDF(message.data)}
                          >
                            Download as PDF
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} className="h-4" />
              </div>
            </ScrollArea>
            
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message here..."
                className="flex-1 placeholder:text-white/70"
                disabled={currentStep === CONVERSATION_STEPS.DEPARTMENT || currentStep === CONVERSATION_STEPS.YEAR}
              />
              <Button type="submit">Send</Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// PDF generation function with proper text wrapping and download tracking
async function generatePDF(questionBank) {
  try {
    // Record the download first
    const downloadData = {
      questionBankId: questionBank.id || 0,
      subject: questionBank.subject || 'Unknown',
      topic: questionBank.topic || 'Unknown',
      department: questionBank.department || null,
      year: questionBank.year || null
    };

    const response = await fetch('/api/question-banks/download', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(downloadData)
    });

    if (!response.ok) {
      console.warn('Failed to record download tracking:', response.status);
    }
  } catch (error) {
    console.error('Error recording download:', error);
    // Continue with PDF generation even if tracking fails
  }

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  const maxWidth = pageWidth - 2 * margin;
  
  let y = 10;
  
  // Title
  doc.setFontSize(16);
  const titleLines = doc.splitTextToSize(questionBank.title || "Question Bank", maxWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 6 + 2;
  
  // Metadata
  doc.setFontSize(12);
  const metadata = [];
  if (questionBank.topic) metadata.push(`Topic: ${questionBank.topic}`);
  if (questionBank.year) metadata.push(`Year: ${questionBank.year}`);
  if (questionBank.department) metadata.push(`Department: ${questionBank.department}`);
  
  metadata.forEach(line => {
    const lines = doc.splitTextToSize(line, maxWidth);
    doc.text(lines, margin, y);
    y += lines.length * 5 + 1;
  });
  
  // Description
  if (questionBank.description) {
    const descLines = doc.splitTextToSize(questionBank.description, maxWidth);
    doc.text(descLines, margin, y);
    y += descLines.length * 5 + 4;
  }
  
  // Questions
  let questionsArr = [];
  if (Array.isArray(questionBank.questions)) {
    questionsArr = questionBank.questions;
  } else if (typeof questionBank.questions === "string") {
    questionsArr = questionBank.questions.split(/\n+/).map(q => q.trim()).filter(q => q.length > 0);
  }
  
  if (questionsArr.length > 0) {
    doc.setFontSize(12);
    questionsArr.forEach((q, idx) => {
      const questionText = `${idx + 1}. ${q}`;
      const lines = doc.splitTextToSize(questionText, maxWidth);
      
      // Check if we need a new page
      if (y + lines.length * 5 > 280) {
        doc.addPage();
        y = 10;
      }
      
      doc.text(lines, margin, y);
      y += lines.length * 5 + 3; // Add spacing between questions
    });
  }
  
  doc.save((questionBank.title || "question-bank") + ".pdf");
}
