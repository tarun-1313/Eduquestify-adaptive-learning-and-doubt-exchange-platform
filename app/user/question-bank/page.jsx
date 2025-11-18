'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import QuestionBankChatbot from '@/app/study/components/QuestionBankChatbot';

export default function UserQuestionBankPage() {
  const [showChatbot, setShowChatbot] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Question Bank</h1>
        <Button onClick={() => setShowChatbot(!showChatbot)}>
          {showChatbot ? 'Hide Assistant' : 'Find Question Bank'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content area */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Question Banks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Browse through the available question banks or use the assistant to find specific ones.
              </p>
              {/* Question banks list will be populated here */}
            </CardContent>
          </Card>
        </div>

        {/* Chatbot sidebar */}
        <div className={`lg:col-span-1 ${showChatbot ? 'block' : 'hidden lg:block'}`}>
          <QuestionBankChatbot />
        </div>
      </div>
    </div>
  );
}
