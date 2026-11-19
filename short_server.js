const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Serve static files from the current directory
app.use(express.static(__dirname));

// PLACEHOLDER API KEY - User needs to replace this
const API_KEY = 'AIzaSyB5wZ_yHDdLgU-_B0lBBCNxCOfRyTCgeNs';

// Endpoint to generate Short QA
app.post('/short-qa', async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'No text provided' });
        }

        // Construct the prompt
        const prompt = `You are an expert Sindh Board teacher.

Generate 5  questions and answers from the following text:

${text}

Rules:
1. Each answer must be approximately 100 words. If the text is too short, expand the answer using related context, examples, or explanations.
2. Do not give answers shorter than 90 words.
3. Use simple, clear English suitable for school students.
4. Number the questions as Q1 to Q5.
5. Each question should be concise; each answer should fully explain the concept.
6. Format output clearly like this:

Q1: <Question>
A1: <Answer of ~100 words>

Q2: <Question>
A2: <Answer of ~100 words>

... up to Q5/A5.`;

        // Call Gemini API
        // UPDATED: Consistently use only the supported free model gemini-1.5-flash
        const models = [
            'gemini-2.5-flash',
            'gemini-2.5-flash-lite',
            'gemini-2.0-flash-001'
        ];


        let generatedText = null;
        let lastError = null;

        // Function to extract wait time from error message
        const getWaitTime = (errorMessage) => {
            const match = errorMessage.match(/retry in ([0-9.]+)s/);
            return match ? parseFloat(match[1]) * 1000 : 5000; // Default 5s if not found
        };

        // Helper for delay
        const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        for (const model of models) {
            console.log(`Attempting to generate content using model: ${model}`);

            try {
                // UPDATED: MIGRATED TO STABLE v1 API from v1beta
                // Supports gemini-1.5-flash and is the production endpoint
                const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${API_KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }]
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (generatedText) {
                        console.log(`Success with model: ${model}`);
                        break; // Success! Exit loop
                    }
                } else {
                    let errorDetails;
                    try {
                        errorDetails = await response.json();
                    } catch (e) {
                        errorDetails = await response.text();
                    }

                    console.error(`Error with model ${model}:`, errorDetails);
                    lastError = errorDetails;
                }
            } catch (error) {
                console.error(`Network/Server error with model ${model}:`, error);
                lastError = error;
            }
        }

        // Retry logic for 429 errors
        if (!generatedText) {
            if (lastError && (lastError.code === 429 || (lastError.error && lastError.error.code === 429))) {
                const errorMessage = lastError.error?.message || JSON.stringify(lastError);
                const waitTime = getWaitTime(errorMessage);
                console.log(`Model failed with 429. Waiting ${waitTime / 1000}s before final retry...`);

                await wait(waitTime + 1000); // Wait + buffer

                // Final Retry with the primary model
                const model = models[0];
                // UPDATED: Retry also uses v1 API
                const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${API_KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                });

                if (response.ok) {
                    const data = await response.json();
                    generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
                } else {
                    const finalError = await response.text();
                    console.error("Final retry failed:", finalError);
                    return res.status(429).json({ error: 'Quota exceeded even after retry.', details: lastError });
                }
            } else {
                return res.status(500).json({ error: 'Failed to generate content', details: lastError });
            }
        }

        if (!generatedText) {
            return res.status(500).json({ error: 'Failed after retry.', details: lastError });
        }

        res.json({ result: generatedText });

    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Open http://localhost:${port}/short.html to test`);
});
