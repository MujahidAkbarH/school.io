# MCQ Generator from PDF

A modern web application that extracts text from PDF files and generates Multiple Choice Questions (MCQs) using AI.

## Features

- 📄 PDF file upload with drag-and-drop interface
- 🔍 Automatic text extraction from PDF files
- 🤖 AI-powered MCQ generation (20 questions with 4 options each)
- ✅ Correct answers highlighted in green
- 📱 Fully responsive design
- 🎨 Modern, clean UI with smooth animations

## Files Structure

- `index.html` - Main HTML structure
- `style.css` - All styling and responsive design
- `script.js` - JavaScript functionality for PDF processing and MCQ generation

## How to Use

1. **Open the application**: Simply open `index.html` in a modern web browser (Chrome, Firefox, Edge, etc.)

2. **Upload a PDF**: Click on the upload area or use the file input to select a PDF file

3. **Generate MCQs**: Click the "Generate MCQs" button to extract text and generate questions

4. **View Results**: The generated MCQs will appear below with correct answers highlighted

## Integrating with AI API

Currently, the application uses a placeholder function to generate sample MCQs. To integrate with an actual AI API (like Google Gemini), follow these steps:

### Option 1: Google Gemini API

1. Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

2. Replace the `generateMCQs` function in `script.js` with:

```javascript
async function generateMCQs(text) {
    try {
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Generate exactly 20 multiple choice questions from the following text. Each question should have 4 options (A, B, C, D) and indicate the correct answer. Format the response as JSON with this structure:
                        [
                            {
                                "question": "Question text here",
                                "options": ["Option A", "Option B", "Option C", "Option D"],
                                "correctAnswer": 0
                            }
                        ]
                        Here is the text:
                        ${text.substring(0, 30000)}` // Limit text length for API
                    }]
                }]
            })
        });
        
        const data = await response.json();
        const mcqsText = data.candidates[0].content.parts[0].text;
        
        // Parse JSON from response (may need to extract JSON from markdown)
        const jsonMatch = mcqsText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        
        throw new Error('Could not parse MCQ data from API response');
    } catch (error) {
        throw new Error('Failed to generate MCQs: ' + error.message);
    }
}
```

### Option 2: OpenAI API

```javascript
async function generateMCQs(text) {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer YOUR_OPENAI_API_KEY'
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{
                    role: 'user',
                    content: `Generate exactly 20 multiple choice questions from the following text. Each question should have 4 options (A, B, C, D) and indicate the correct answer. Return only valid JSON array with this structure:
                    [
                        {
                            "question": "Question text",
                            "options": ["Option A", "Option B", "Option C", "Option D"],
                            "correctAnswer": 0
                        }
                    ]
                    Text: ${text.substring(0, 30000)}`
                }],
                temperature: 0.7
            })
        });
        
        const data = await response.json();
        const mcqsText = data.choices[0].message.content;
        const jsonMatch = mcqsText.match(/\[[\s\S]*\]/);
        
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        
        throw new Error('Could not parse MCQ data');
    } catch (error) {
        throw new Error('Failed to generate MCQs: ' + error.message);
    }
}
```

## Requirements

- Modern web browser with JavaScript enabled
- Internet connection (for PDF.js library CDN)
- PDF files with extractable text (not scanned images)

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Edge
- Safari

## Limitations

- Maximum file size: 10MB
- PDFs must contain extractable text (not scanned images)
- Currently uses placeholder MCQ generation (requires API integration for production use)

## Security Notes

- Never commit API keys to version control
- Consider using environment variables or a backend proxy for API calls
- Validate and sanitize all user inputs in production

## License

Free to use and modify for personal and commercial projects.

