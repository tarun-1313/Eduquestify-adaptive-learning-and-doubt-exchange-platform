"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X, Save, ArrowLeft } from 'lucide-react';

export default function CreateQuestionBank() {
  const router = useRouter();
  
  // Form state
  const [formData, setFormData] = useState({
    department: '',
    year: '',
    subject: '',
    topic: '',
    questions: [
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: '',
        difficulty: 'medium'
      }
    ]
  });

  // Available options
  const departments = ['Science', 'Humanities', 'Engineering', 'Arts', 'Commerce'];
  const years = ['First Year', 'Second Year', 'Third Year', 'Fourth Year', 'Grade 10', 'Grade 11', 'Grade 12'];
  const difficulties = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' },
  ];

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle question changes
  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setFormData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  // Handle option changes
  const handleOptionChange = (qIndex, oIndex, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[qIndex].options[oIndex] = value;
    setFormData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  // Add new question
  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
          explanation: '',
          difficulty: 'medium'
        }
      ]
    }));
  };

  // Remove question
  const removeQuestion = (index) => {
    if (formData.questions.length === 1) return; // Keep at least one question
    const updatedQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // TODO: Add API call to save the question bank
      console.log('Submitting:', formData);
      // Redirect to question banks list after successful save
      router.push('/teacher/question-bank');
    } catch (error) {
      console.error('Error saving question bank:', error);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Question Banks
        </Button>
        <h1 className="text-2xl font-bold">Create New Question Bank</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select
              name="department"
              value={formData.department}
              onValueChange={(value) => setFormData({...formData, department: value})}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">Year/Grade</Label>
            <Select
              name="year"
              value={formData.year}
              onValueChange={(value) => setFormData({...formData, year: value})}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select year/grade" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="e.g., Physics, Mathematics"
              required
            />
          </div>

          <div className="space-y-2 md:col-span-3">
            <Label htmlFor="topic">Topic</Label>
            <Input
              type="text"
              id="topic"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              placeholder="e.g., Newton's Laws of Motion, Cell Structure"
              required
            />
          </div>
        </div>

        <div className="space-y-6">
          {formData.questions.map((q, qIndex) => (
            <Card key={qIndex} className="relative">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Question {qIndex + 1}</CardTitle>
                  {formData.questions.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeQuestion(qIndex)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`question-${qIndex}`}>Question Text</Label>
                  <Input
                    id={`question-${qIndex}`}
                    value={q.question}
                    onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                    placeholder="Enter the question"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Options</Label>
                  {q.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={`correct-${qIndex}`}
                        checked={q.correctAnswer === oIndex}
                        onChange={() => handleQuestionChange(qIndex, 'correctAnswer', oIndex)}
                        className="h-4 w-4 text-blue-600"
                      />
                      <Input
                        value={option}
                        onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                        placeholder={`Option ${oIndex + 1}`}
                        required
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`explanation-${qIndex}`}>Explanation</Label>
                  <textarea
                    id={`explanation-${qIndex}`}
                    value={q.explanation}
                    onChange={(e) => handleQuestionChange(qIndex, 'explanation', e.target.value)}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Add explanation for the correct answer"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`difficulty-${qIndex}`}>Difficulty</Label>
                  <Select
                    value={q.difficulty}
                    onValueChange={(value) => handleQuestionChange(qIndex, 'difficulty', value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {difficulties.map((diff) => (
                        <SelectItem key={diff.value} value={diff.value}>
                          {diff.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={addQuestion}
              className="mt-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Question
            </Button>

            <div className="space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/teacher/question-bank')}
                className="mt-4"
              >
                Cancel
              </Button>
              <Button type="submit" className="mt-4">
                <Save className="h-4 w-4 mr-2" />
                Save Question Bank
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
