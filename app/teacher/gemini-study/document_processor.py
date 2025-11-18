import re
from typing import List, Dict, Optional
import textwrap

class DocumentProcessor:
    def __init__(self):
        self.current_document: Optional[str] = None
        self.ready = False

    def upload_document(self, content: str) -> str:
        """Store the document content and mark as ready for processing."""
        self.current_document = content.strip()
        self.ready = True
        return "Document received and ready for processing. Please provide your instruction."

    def process_instruction(self, instruction: str) -> str:
        """Process the document based on the given instruction."""
        if not self.ready or not self.current_document:
            return "No document has been uploaded yet. Please upload a document first."

        instruction = instruction.lower().strip()
        
        if any(word in instruction for word in ['question', 'quiz']):
            return self._generate_questions()
        elif 'summar' in instruction:
            return self._summarize()
        elif any(word in instruction for word in ['key point', 'main point']):
            return self._extract_key_points()
        elif any(word in instruction for word in ['extract', 'find']):
            return self._extract_entities(instruction)
        else:
            return "I'm not sure how to process that instruction. Please try asking to generate questions, summarize, or extract key points."

    def _generate_questions(self) -> str:
        """Generate questions based on the document content."""
        sentences = re.split(r'(?<=[.!?])\s+', self.current_document)
        questions = []
        
        for i, sentence in enumerate(sentences[:5]):  # Limit to 5 questions
            if len(sentence.split()) > 5:  # Only use reasonably long sentences
                questions.append(f"{i+1}. What is the main point of: '{sentence}...'")
        
        if not questions:
            return "I couldn't generate meaningful questions from the document. The content might be too short."
            
        return "Here are some questions based on the document:\n" + "\n".join(questions)

    def _summarize(self) -> str:
        """Generate a summary of the document."""
        # Simple summarization: take first few sentences
        sentences = re.split(r'(?<=[.!?])\s+', self.current_document)
        summary = ' '.join(sentences[:3])  # First 3 sentences as summary
        return f"Summary:\n{summary}..."

    def _extract_key_points(self) -> str:
        """Extract key points from the document."""
        # Simple implementation: split into sentences and take important ones
        sentences = re.split(r'(?<=[.!?])\s+', self.current_document)
        key_points = []
        
        for i, sentence in enumerate(sentences[:5]):  # Limit to 5 key points
            if len(sentence) > 20:  # Only include substantial sentences
                key_points.append(f"• {sentence}")
        
        return "Key points from the document:\n" + "\n".join(key_points)

    def _extract_entities(self, instruction: str) -> str:
        """Extract entities like dates, names, etc. based on instruction."""
        if 'date' in instruction:
            # Simple date extraction (very basic)
            dates = re.findall(r'\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4})', 
                             self.current_document, re.IGNORECASE)
            return f"Dates found in the document:\n" + "\n".join(dates) if dates else "No dates found in the document."
        
        elif 'proper noun' in instruction:
            # Simple proper noun extraction (very basic)
            proper_nouns = re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b', self.current_document)
            return f"Proper nouns found in the document:\n" + "\n".join(set(proper_nouns)) if proper_nouns else "No proper nouns found."
        
        return "I can extract dates or proper nouns. Please specify which one you'd like to extract."

def main():
    processor = DocumentProcessor()
    print("""Welcome to Document Processor!
    I can help you analyze documents. Here's how it works:
    1. Type 'upload' followed by your document content
    2. Then provide an instruction like:
       - 'generate questions'
       - 'summarize this'
       - 'extract key points'
       - 'find dates in the document'
    Type 'exit' to quit.
    """)
    
    while True:
        user_input = input("\nYour input: ").strip()
        
        if user_input.lower() == 'exit':
            print("Goodbye!")
            break
            
        if user_input.lower() == 'upload':
            print("Please paste your document content (type 'END' on a new line when finished):")
            content = []
            while True:
                line = input()
                if line.strip().upper() == 'END':
                    break
                content.append(line)
            response = processor.upload_document('\n'.join(content))
            print(f"\n{response}")
        else:
            if processor.ready:
                response = processor.process_instruction(user_input)
                print(f"\n{response}")
            else:
                print("Please upload a document first by typing 'upload'")

if __name__ == "__main__":
    main()
