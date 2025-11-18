import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CreateBank({ newBankForm, setNewBankForm, handleCreateBank }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewBankForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name, value) => {
    setNewBankForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            name="department"
            value={newBankForm.department || ''}
            onChange={handleChange}
            placeholder="e.g., Computer Science, Mathematics"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="year">Year/Grade</Label>
          <Select
            value={newBankForm.year}
            onValueChange={(value) => handleSelectChange('year', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select year/grade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="First Year">First Year</SelectItem>
              <SelectItem value="Second Year">Second Year</SelectItem>
              <SelectItem value="Third Year">Third Year</SelectItem>
              <SelectItem value="Fourth Year">Fourth Year</SelectItem>
              <SelectItem value="Grade 10">Grade 10</SelectItem>
              <SelectItem value="Grade 11">Grade 11</SelectItem>
              <SelectItem value="Grade 12">Grade 12</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            name="subject"
            value={newBankForm.subject}
            onChange={handleChange}
            placeholder="e.g., Physics, Mathematics"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="topic">Topic</Label>
          <Input
            id="topic"
            name="topic"
            value={newBankForm.topic}
            onChange={handleChange}
            placeholder="e.g., Newton's Laws, Cell Structure"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="numQuestions">Number of Questions</Label>
          <Input
            id="numQuestions"
            name="numQuestions"
            type="number"
            min="1"
            value={newBankForm.numQuestions || ''}
            onChange={handleChange}
            placeholder="e.g., 10, 20, 50"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="description" className="text-base font-medium">Description</Label>
          <span className="text-sm text-muted-foreground">Optional</span>
        </div>
        <Textarea
          id="description"
          name="description"
          value={newBankForm.description || ''}
          onChange={handleChange}
          placeholder="Add a detailed description of this question bank. You can include topics covered, learning objectives, or any specific instructions for students."
          className="min-h-[150px] text-base"
        />
        <p className="text-sm text-muted-foreground mt-1">
          This will help students understand what to expect from this question bank.
        </p>
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <Button
          variant="outline"
          onClick={() => setNewBankForm(prev => ({ ...prev, isOpen: false }))}
        >
          Cancel
        </Button>
        <Button onClick={handleCreateBank}>
          Create Question Bank
        </Button>
      </div>
    </div>
  );
}
