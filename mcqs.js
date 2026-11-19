// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// DOM Elements
const pdfUpload = document.getElementById('pdfUpload');
const uploadText = document.getElementById('uploadText');
const fileName = document.getElementById('fileName');
const generateBtn = document.getElementById('generateBtn');
const outputSection = document.getElementById('outputSection');
const mcqOutput = document.getElementById('mcqOutput');
const errorMessage = document.getElementById('errorMessage');

let uploadedFile = null;
let extractedText = '';

/**
 * Handle PDF file selection
 */
pdfUpload.addEventListener('change', function(event) {
    const file = event.target.files[0];
    
    if (file) {
        // Validate file type
        if (file.type !== 'application/pdf') {
            showError('Please upload a valid PDF file.');
            resetUpload();
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            showError('File size should be less than 10MB.');
            resetUpload();
            return;
        }

        uploadedFile = file;
        uploadText.textContent = 'PDF Selected';
        fileName.textContent = `📄 ${file.name}`;
        fileName.classList.add('show');
        generateBtn.disabled = false;
        hideError();
    }
});

/**
 * Handle Generate MCQs button click
 */
generateBtn.addEventListener('click', async function() {
    if (!uploadedFile) {
        showError('Please upload a PDF file first.');
        return;
    }

    // Show loading state
    generateBtn.disabled = true;
    document.querySelector('.btn-text').textContent = 'Generating...';
    document.getElementById('loader').style.display = 'inline-block';
    hideError();
    outputSection.style.display = 'none';

    try {
        // Extract text from PDF
        extractedText = await extractTextFromPDF(uploadedFile);
        
        if (!extractedText || extractedText.trim().length === 0) {
            throw new Error('No text could be extracted from the PDF. Please ensure the PDF contains readable text.');
        }

        // Generate MCQs (using placeholder function - replace with actual API call)
        const mcqs = await generateMCQs(extractedText);

        // Display MCQs
        displayMCQs(mcqs);
        outputSection.style.display = 'block';

    } catch (error) {
        showError(error.message || 'An error occurred while processing the PDF. Please try again.');
        console.error('Error:', error);
    } finally {
        // Reset button state
        generateBtn.disabled = false;
        document.querySelector('.btn-text').textContent = 'Generate MCQs';
        document.getElementById('loader').style.display = 'none';
    }
});

/**
 * Extract text from PDF using PDF.js
 * @param {File} file - The PDF file to extract text from
 * @returns {Promise<string>} - Extracted text from PDF
 */
async function extractTextFromPDF(file) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        let fullText = '';
        const numPages = pdf.numPages;

        // Extract text from all pages
        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            
            // Combine all text items from the page
            const pageText = textContent.items
                .map(item => item.str)
                .join(' ');
            
            fullText += pageText + '\n';
        }

        return fullText.trim();
    } catch (error) {
        throw new Error('Failed to extract text from PDF: ' + error.message);
    }
}

/**
 * Generate MCQs from extracted text
 * This is a placeholder function - replace with actual API call (e.g., Gemini API)
 * @param {string} text - The text to generate MCQs from
 * @returns {Promise<Array>} - Array of MCQ objects
 */
async function generateMCQs(text) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // PLACEHOLDER: Generate sample MCQs
    // In production, replace this with an actual API call to Gemini or another AI service
    // Example API call structure:
    /*
    const response = await fetch('YOUR_API_ENDPOINT', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer YOUR_API_KEY'
        },
        body: JSON.stringify({
            text: text,
            numQuestions: 20,
            optionsPerQuestion: 4
        })
    });
    const data = await response.json();
    return data.mcqs;
    */

    // For demonstration, generate sample MCQs based on text length
    const sampleMCQs = generateSampleMCQs(text);
    return sampleMCQs;
}

/**
 * Generate sample MCQs (placeholder function)
 * Replace this with actual API integration
 * @param {string} text - The extracted text
 * @returns {Array} - Array of MCQ objects
 */
function generateSampleMCQs(text) {
    const mcqs = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    // Generate 20 MCQs
    for (let i = 0; i < 20; i++) {
        const sentenceIndex = i % sentences.length;
        const baseSentence = sentences[sentenceIndex]?.trim() || `Question ${i + 1} about the document`;
        
        // Create a question from the sentence
        const question = `What is the main point discussed in the following context: "${baseSentence.substring(0, 100)}..."?`;
        
        // Generate options
        const options = [
            `Option A: This relates to the first aspect mentioned in the text`,
            `Option B: This describes the primary concept discussed`,
            `Option C: This explains the secondary detail provided`,
            `Option D: This summarizes the overall theme`
        ];
        
        // Randomly assign correct answer (in production, API will provide this)
        const correctIndex = Math.floor(Math.random() * 4);
        
        mcqs.push({
            question: question,
            options: options,
            correctAnswer: correctIndex
        });
    }
    
    return mcqs;
}

/**
 * Display generated MCQs in the output area
 * @param {Array} mcqs - Array of MCQ objects
 */
function displayMCQs(mcqs) {
    mcqOutput.innerHTML = '';
    
    if (!mcqs || mcqs.length === 0) {
        mcqOutput.innerHTML = '<p style="text-align: center; color: #666;">No MCQs were generated. Please try again.</p>';
        return;
    }

    mcqs.forEach((mcq, index) => {
        const mcqItem = document.createElement('div');
        mcqItem.className = 'mcq-item';
        
        // Question
        const questionDiv = document.createElement('div');
        questionDiv.className = 'mcq-question';
        questionDiv.innerHTML = `<span class="mcq-number">${index + 1}.</span>${mcq.question}`;
        
        // Options
        const optionsList = document.createElement('ul');
        optionsList.className = 'mcq-options';
        
        const optionLabels = ['A', 'B', 'C', 'D'];
        mcq.options.forEach((option, optIndex) => {
            const optionItem = document.createElement('li');
            optionItem.className = 'mcq-option';
            
            // Highlight correct answer
            if (optIndex === mcq.correctAnswer) {
                optionItem.classList.add('correct');
            }
            
            optionItem.innerHTML = `<span class="option-label">${optionLabels[optIndex]}.</span>${option}`;
            optionsList.appendChild(optionItem);
        });
        
        // Assemble MCQ item
        mcqItem.appendChild(questionDiv);
        mcqItem.appendChild(optionsList);
        mcqOutput.appendChild(mcqItem);
    });
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

/**
 * Hide error message
 */
function hideError() {
    errorMessage.style.display = 'none';
}

/**
 * Reset upload state
 */
function resetUpload() {
    uploadedFile = null;
    uploadText.textContent = 'Choose PDF File';
    fileName.classList.remove('show');
    generateBtn.disabled = true;
    pdfUpload.value = '';
}

