// Set worker source for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

const fileInput = document.querySelector('input[type="file"]');
const generateBtn = document.querySelector('button');
const outputDiv = document.querySelector('.output');

generateBtn.addEventListener('click', async () => {
    // Clear previous output
    outputDiv.innerHTML = '';

    // Validate file selection
    if (fileInput.files.length === 0) {
        alert('Please select a PDF file first.');
        return;
    }

    const file = fileInput.files[0];
    if (file.type !== 'application/pdf') {
        alert('Please upload a valid PDF file.');
        return;
    }

    // Show loading state
    outputDiv.innerHTML = '<p style="color: #6366f1;">Generating answers... Please wait.</p>';
    generateBtn.disabled = true;

    try {
        // Step 1: Extract text from PDF
        const text = await extractTextFromPDF(file);

        // Step 2: Send text to backend
        // Step 2: Send text to backend
        const response = await fetch('http://localhost:3000/short-qa', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text })
        });


        if (!response.ok) {
            throw new Error(`Server Error: ${response.statusText}`);
        }

        const data = await response.json();

        // Step 3: Display results
        if (data.result) {
            // Format the output (convert newlines to <br>)
            const formattedResult = data.result.replace(/\n/g, '<br>');
            outputDiv.innerHTML = `
                <div style="background: #667eea; padding: 20px; border-radius: 8px; border: 1px solid #ffffffff;">
                    <h3 style="color: #ffffffff;">Generated Questions & Answers:</h3>
                    <div style="margin-top: 15px; line-height: 1.6; color: #ffffffff;">
                        ${formattedResult}
                    </div>
                </div>
            `;
        } else {
            outputDiv.innerHTML = '<p style="color: red;">Failed to generate answers. Try again.</p>';
        }

    } catch (error) {
        console.error('Error:', error);
        outputDiv.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
    } finally {
        generateBtn.disabled = false;
    }
});

async function extractTextFromPDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    // Loop through all pages
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
    }

    return fullText;
}
