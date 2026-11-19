document.addEventListener('DOMContentLoaded', () => {
    // ---------------------------------------------------------
    // 1. SELECT DOM ELEMENTS (Using IDs now)
    // ---------------------------------------------------------
    const classInput = document.getElementById('classInput');
    const resourcesInput = document.getElementById('resourcesInput');
    const topicInput = document.getElementById('topicInput');
    const generateBtn = document.getElementById('generateBtn');
    const outputDiv = document.getElementById('outputDiv');

    // ---------------------------------------------------------
    // 2. ACTIVITY DATA TEMPLATES
    // ---------------------------------------------------------

    const ACTIVITY_DRAWING = {
        title: "Creative Nature Drawing",
        objective: "To enhance observation skills and creativity through drawing.",
        steps: [
            "1. Take the students outside or use reference images on the chalkboard.",
            "2. Distribute paper to each student.",
            "3. Ask students to draw a specific nature scene (e.g., a tree, a flower, a mountain).",
            "4. Allow 15 minutes for drawing.",
            "5. Have students share their drawings with the class."
        ]
    };

    const ACTIVITY_IT = {
        title: "Tech Trends Research Presentation",
        objective: "To research current technology trends and present findings.",
        steps: [
            "1. Divide detailed class into groups of 5.",
            "2. Assign each group a clear IT topic (e.g., AI, Cloud Computing, Cyber Security).",
            "3. Use the laptop and internet to research 3 key facts about the topic.",
            "4. Create a 3-minute presentation.",
            "5. Present findings to the class."
        ]
    };

    const ACTIVITY_MATHS = {
        title: "Group Math Problem Solving",
        objective: "To solve complex math problems collaboratively.",
        steps: [
            "1. Divide the large class into pairs or small groups.",
            "2. Write 5 challenging math problems on the board.",
            "3. Students use calculators, paper, and pens to solve them.",
            "4. First group to solve all correctly wins.",
            "5. Review answers together on the board."
        ]
    };

    const ACTIVITY_FALLBACK = {
        title: "General Classroom Discussion",
        objective: "To facilitate open discussion and critical thinking on the chosen topic.",
        steps: [
            "1. Introduce the topic clearly to the class.",
            "2. Write 3 key questions related to the topic on the board.",
            "3. Ask students to think about their answers silently for 2 minutes.",
            "4. Select students randomly to share their thoughts.",
            "5. Summarize the key points discussed at the end."
        ]
    };

    // ---------------------------------------------------------
    // 3. MAIN LOGIC
    // ---------------------------------------------------------

    generateBtn.addEventListener('click', () => {
        // Clear previous output
        outputDiv.innerHTML = '';

        // Read Inputs
        // Convert to lowercase for easy comparison
        const classSize = parseInt(classInput.value.trim()); // Parse number
        const resourcesRaw = resourcesInput.value.toLowerCase();
        const topicRaw = topicInput.value.toLowerCase();

        // Validation: Ensure inputs exist
        if (isNaN(classSize) || resourcesRaw === '' || topicRaw === '') {
            outputDiv.innerHTML = '<p style="color:red;">Please fill in all fields correctly.</p>';
            return;
        }

        // Helper to check includes
        const hasResource = (res) => resourcesRaw.includes(res);

        let selectedActivity = null;

        // ---------------------------------------------------------
        // 4. CONDITIONAL LOGIC (MATCHING)
        // ---------------------------------------------------------

        // OPTION 1: Drawing
        // Class Size: 10, Resources: chalkboard, paper, Topic: drawing
        if (classSize === 10 &&
            hasResource('chalkboard') && hasResource('paper') &&
            topicRaw.includes('drawing')) {

            selectedActivity = ACTIVITY_DRAWING;

            // OPTION 2: IT
            // Class Size: 25, Resources: laptop, internet, Topic: information technolgy
        } else if (classSize === 25 &&
            hasResource('laptop') && hasResource('internet') &&
            topicRaw.includes('information technology')) {

            selectedActivity = ACTIVITY_IT;

            // OPTION 3: Maths
            // Class Size: 50, Resources: calculator, paper, pen, Topic: maths
        } else if (classSize === 50 &&
            hasResource('calculator') && hasResource('paper') && hasResource('pen') &&
            topicRaw.includes('maths')) {

            selectedActivity = ACTIVITY_MATHS;

        } else {
            // FALLBACK
            selectedActivity = ACTIVITY_FALLBACK;
        }

        // ---------------------------------------------------------
        // 5. RENDER OUTPUT
        // ---------------------------------------------------------
        renderActivity(selectedActivity);
    });

    function renderActivity(activity) {
        // Map steps into HTML list items
        const stepsHtml = activity.steps.map(step => `<li style="margin-bottom: 8px;">${step}</li>`).join('');

        // Wrap the whole output in a blue card
        const htmlContent = `
        <div style="
            margin-top: 24px;
            padding: 24px;
            border-radius: 12px;
            background-color: #667eea; /* Blue theme background */
            color: #ffffff; /* White text */
            line-height: 1.6;
        ">
            <h3 style="
                margin-bottom: 16px; 
                font-size: 24px;
            ">${activity.title}</h3>
            
            <div style="margin-bottom: 24px;">
                <strong>Objective:</strong>
                <span>${activity.objective}</span>
            </div>

            <strong style="display: block; margin-bottom: 12px;">Step-by-Step Instructions:</strong>
            <ul style="
                padding-left: 20px; 
            ">
                ${stepsHtml}
            </ul>
        </div>
    `;

        outputDiv.innerHTML = htmlContent;
    }

});
