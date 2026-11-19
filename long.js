/*
  IMPORTANT: 
  To use this file, make sure your long.html includes it as a module:
  <script type="module" src="long.js"></script>
*/

// PDF.js is now loaded via script tag in HTML
// No imports needed here


// DOM Elements
const fileInput = document.querySelector('input[type="file"]');
const generateBtn = document.querySelector('button');
const outputDiv = document.querySelector('.output');

// Function to extract text from PDF
async function extractTextFromPDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(" ");
        fullText += pageText + " ";
    }
    return fullText;
}

// Event Listener
generateBtn.addEventListener('click', async () => {
    const file = fileInput.files[0];

    // Basic Validation
    if (!file) {
        alert("Please select a PDF file first!");
        return;
    }

    // Show Loading State
    outputDiv.innerHTML = "Generating long answer... Please wait...";
    generateBtn.disabled = true;

    try {
        // 1. Extract Text
        const text = await extractTextFromPDF(file);

        // 2. Send to Server
        const response = await fetch('http://localhost:3001/long-qa', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: text })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to generate answer");
        }

        // 3. Display Result
        // Replace newlines with <br> for HTML display
        const formattedText = data.result.replace(/\n/g, '<br>');
        outputDiv.innerHTML = `
                <div style="background: #667eea; padding: 20px; border-radius: 8px; border: 1px solid #ffffffff;">
                    <h3 style="color: #ffffffff;">Generated Questions & Answers:</h3>
                    <div style="margin-top: 15px; line-height: 1.6; color: #ffffffff;">
                        ${formattedText}
                    </div>
                </div>
            `;

    } catch (error) {
        console.error("Error:", error);
        outputDiv.innerHTML = `<span style="color: red;">Error: ${error.message}</span>`;
    } finally {
        generateBtn.disabled = false;
    }
});
