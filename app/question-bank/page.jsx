'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import Orb from "@/components/Orb";
import { 
  PlusCircle, 
  ChevronsLeft, 
  ChevronsRight,
  MessageCircle
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import dynamic from 'next/dynamic';

// Import the QuestionBankChatbot component with SSR disabled
const QuestionBankChatbot = dynamic(
  () => import('@/app/study/components/QuestionBankChatbot'),
  { ssr: false }
);

export default function QuestionBankPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('questionBankChatHistory');
    if (savedHistory) {
      setChatHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleNewChat = () => {
    setActiveChatId(null);
  };

  const handleSelectChat = (chatId) => {
    setActiveChatId(chatId);
  };

  return (
    <div className="relative min-h-screen">
      {/* Orb Background */}
      <div className="fixed inset-0 z-0">
        <Orb
          hue={220}
          hoverIntensity={0.2}
          rotateOnHover={true}
          forceHoverState={false}
        />
      </div>

      {/* Content with relative positioning to appear above background */}
      <div className="relative z-10 flex h-[calc(100vh-64px)] bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm">
        {/* Sidebar */}
        <div 
          className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
            isSidebarCollapsed ? 'w-16' : 'w-64'
          }`}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              {!isSidebarCollapsed && (
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2"
                  onClick={handleNewChat}
                >
                  <PlusCircle className="h-4 w-4" />
                  New Chat
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="ml-2"
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              >
                {isSidebarCollapsed ? (
                  <ChevronsRight className="h-5 w-5" />
                ) : (
                  <ChevronsLeft className="h-5 w-5" />
                )}
              </Button>
            </div>

            {!isSidebarCollapsed && (
              <ScrollArea className="h-[calc(100vh-180px)]">
                <div className="space-y-2">
                  {chatHistory.map((chat) => (
                    <Button
                      key={chat.id}
                      variant={activeChatId === chat.id ? "secondary" : "ghost"}
                      className={`w-full justify-start text-left ${
                        activeChatId === chat.id ? "font-medium" : "font-normal"
                      }`}
                      onClick={() => handleSelectChat(chat.id)}
                    >
                      <MessageCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                      <div className="truncate">
                        <div className="truncate">{chat.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(chat.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Question Bank Chatbot */}
          <div className="flex-1 overflow-hidden">
            <QuestionBankChatbot />
          </div>
        </div>
      </div>
    </div>
  );
}