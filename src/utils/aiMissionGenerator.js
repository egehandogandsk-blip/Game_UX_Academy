// AI Mission Generation using Gemini API

const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export const generateMissionsWithAI = async (gameData, parameters) => {
    const { difficulty, count, focus } = parameters;

    const prompt = `You are a UX/UI design task generator. Generate ${count} realistic design tasks for the following game.

Game Information:
- Name: ${gameData.name}
- Developer: ${gameData.developer}
- Genres: ${gameData.genres?.join(', ')}
- Description: ${gameData.description}

Task Requirements:
- Difficulty Level: ${difficulty}
- Number of Tasks: ${count}
- Focus Area: ${focus || 'General UX/UI Design'}

For each task, provide:
1. Title (concise, professional)
2. Description (2-3 sentences explaining the task)
3. Requirements (3-5 specific requirements as bullet points)
4. Deliverables (2-4 deliverables expected from the designer)
5. Relevant Skills (choose from: UI Design, UX Research, Visual Design, Wireframing, Prototyping, User Testing, Information Architecture, Interaction Design, Design Systems, Accessibility)
6. Estimated Hours (realistic time estimate)
7. XP Reward (based on difficulty: Easy=50-150, Medium=150-300, Hard=300-500, Expert=500-800)

Return ONLY a valid JSON array with this exact structure:
[
  {
    "title": "string",
    "description": "string",
    "requirements": ["string", "string", ...],
    "deliverables": ["string", "string", ...],
    "skills": ["string", "string", ...],
    "estimatedHours": number,
    "xpReward": number
  }
]

Make the tasks realistic, specific to the game's genre and style. Focus on actual UX/UI design work that would be valuable for this game.`;

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.8,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 2048,
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        const generatedText = data.candidates[0].content.parts[0].text;

        // Extract JSON from the response (in case there's extra text)
        const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            throw new Error('Invalid response format from AI');
        }

        const missions = JSON.parse(jsonMatch[0]);

        // Validate and sanitize the missions
        return missions.map(mission => ({
            title: mission.title || 'Untitled Task',
            description: mission.description || '',
            requirements: Array.isArray(mission.requirements) ? mission.requirements : [],
            deliverables: Array.isArray(mission.deliverables) ? mission.deliverables : [],
            skills: Array.isArray(mission.skills) ? mission.skills : [],
            estimatedHours: parseInt(mission.estimatedHours) || 4,
            xpReward: parseInt(mission.xpReward) || 100,
            difficulty: difficulty,
            gameId: gameData.id,
            gameName: gameData.name
        }));
    } catch (error) {
        console.error('AI generation error:', error);
        throw new Error('AI ile görev oluşturulamadı. Lütfen tekrar deneyin.');
    }
};

// Test function to use when API key is not set
export const generateMockMissions = (gameData, parameters) => {
    const { difficulty, count } = parameters;

    const mockMissions = [];
    const xpMap = { Easy: 100, Medium: 200, Hard: 350, Expert: 600 };

    for (let i = 0; i < count; i++) {
        mockMissions.push({
            title: `${gameData.name} - Design Task ${i + 1}`,
            description: `Create a comprehensive design solution for ${gameData.name}. This task focuses on enhancing user experience and visual appeal.`,
            requirements: [
                'Research current game UI patterns',
                'Create user flow diagrams',
                'Design responsive layouts',
                'Follow brand guidelines'
            ],
            deliverables: [
                'High-fidelity mockups',
                'Interactive prototype',
                'Design documentation'
            ],
            skills: ['UI Design', 'Prototyping', 'Visual Design'],
            estimatedHours: difficulty === 'Easy' ? 4 : difficulty === 'Medium' ? 8 : difficulty === 'Hard' ? 12 : 16,
            xpReward: xpMap[difficulty],
            difficulty: difficulty,
            gameId: gameData.id,
            gameName: gameData.name
        });
    }

    return Promise.resolve(mockMissions);
};
