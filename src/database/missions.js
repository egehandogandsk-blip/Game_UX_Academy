// Mission generation engine for UI/UX case study assignments with 27 UI types
import { dbOperations } from './schema.js';
import { getGameScreenshot, getAvailableUITypes, getAllGames, GAME_GENRES, UI_SCREEN_TYPES } from './missionScreenshots.js';

// Mission templates organized by difficulty and UI type
const missionTemplates = {
    beginner: [
        // HUD missions
        {
            type: "HUD Icon Redesign",
            uiType: UI_SCREEN_TYPES.HUD,
            description: "The current HUD iconography for {game} suffers from clarity issues during high-intensity moments. Your objective is to redesign 5 key HUD icons (e.g., Health, Ammo, Map, Abilities, Inventory) to ensure they are distinct yet cohesive. Focus on vector-based, scalable designs that maintain legibility at various screen sizes, ensuring players can instantly recognize them in the heat of battle.",
            requirements: ["Vector icons", "Multiple sizes", "Consistency documentation"],
            estimatedTime: "1-2 hours",
            xp: 100
        },
        {
            type: "Health Bar Redesign",
            uiType: UI_SCREEN_TYPES.HUD,
            description: "The health and status bars in {game} are functional but lack visual flair and feedback. Design an alternative health/status bar concept that better integrates with the game's art direction. Consider how the bar reacts to damage, healing, and low-health states (e.g., animations, color shifts) to provide immediate, visceral feedback to the player.",
            requirements: ["Visual mockup", "Animation notes", "Accessibility considerations"],
            estimatedTime: "45-60 minutes",
            xp: 90
        },

        // Menu missions
        {
            type: "Main Menu Refresh",
            uiType: UI_SCREEN_TYPES.MENU,
            description: "The main menu is the first point of contact for players in {game}. Your task is to refresh the main menu with a modern, clean aesthetic that improves navigation flow. Prioritize clear hierarchy for primary actions like 'Play' and 'Settings', while incorporating visual elements (backgrounds, typography) that immediately immerse the player in the game's world.",
            requirements: ["Mockup design", "Navigation flow", "Button states"],
            estimatedTime: "2-3 hours",
            xp: 120
        },
        {
            type: "Settings Menu Organization",
            uiType: UI_SCREEN_TYPES.MENU,
            description: "Players often struggle to find specific options in {game}'s current settings menu. Redesign the settings interface to improve information architecture and usability. Group related options logically (e.g., Graphics, Audio, Controls) and design clear toggles, sliders, and dropdowns that make customization intuitive and frustration-free.",
            requirements: ["Information architecture", "Visual design", "Category grouping"],
            estimatedTime: "1-2 hours",
            xp: 100
        },

        // Loading Screen
        {
            type: "Loading Screen Concept",
            uiType: UI_SCREEN_TYPES.LOADING_SCREEN,
            description: "Loading screens are an opportunity to keep players engaged even when they wait. Design a captivating loading screen for {game} that reflects the game's theme. Include a clear progress indicator, interesting lore or gameplay tips, and a visual composition that prevents boredom during load times.",
            requirements: ["Visual design", "Progress indicator", "Tip display area"],
            estimatedTime: "1 hour",
            xp: 80
        },

        // Title Screen
        {
            type: "Title Screen Overhaul",
            uiType: UI_SCREEN_TYPES.TITLE_SCREEN,
            description: "Create a fresh title screen design for {game} that captures the true essence and mood of the game. Focus on the placement of the game logo, the 'Press Start' prompt, and the background imagery. The goal is to create a moment of anticipation and excitement before the player even starts the game.",
            requirements: ["Logo placement", "Background concept", "Button layout"],
            estimatedTime: "1-2 hours",
            xp: 110
        },

        // Button & Controls
        {
            type: "Button Component Library",
            uiType: UI_SCREEN_TYPES.BUTTON_CONTROLS,
            description: "Consistency is key in UI design. Design a complete button component system for {game} that covers all interaction states: Default, Hover, Pressed, and Disabled. Ensure the design language matches the game's aesthetic, whether it's sci-fi, fantasy, or modern.",
            requirements: ["Primary/secondary/tertiary buttons", "All states documented", "Size variants"],
            estimatedTime: "1-2 hours",
            xp: 100
        },

        // Tutorial
        {
            type: "Tutorial Onboarding Flow",
            uiType: UI_SCREEN_TYPES.TUTORIAL,
            description: "New players often feel overwhelmed by complex mechanics. Design an intuitive tutorial overlay or onboarding flow for {game} that teaches a core mechanic (e.g., movement, combat, or crafting) without breaking immersion. Use clear visual aids, concise text, and adequate spacing.",
            requirements: ["Step-by-step flow", "Visual aids", "Skip option"],
            estimatedTime: "2 hours",
            xp: 130
        },

        // Dialog
        {
            type: "Dialogue Box Redesign",
            uiType: UI_SCREEN_TYPES.DIALOGUE,
            description: "Narrative delivery is crucial for {game}. Create a modern dialogue box interface that enhances readability and character expression. Consider placement (bottom vs. dynamic), speaker identification (names/portraits), and how player choices are presented to ensure the story flows smoothly.",
            requirements: ["Speaker identification", "Text formatting", "Choice display"],
            estimatedTime: "1-2 hours",
            xp: 100
        },

        // Inventory
        {
            type: "Inventory Grid Layout",
            uiType: UI_SCREEN_TYPES.INVENTORY,
            description: "Inventory management can be tedious if not designed well. Design an efficient and visually appealing inventory grid for {game}. Focus on how items are categorized, improving readability of item icons, and ensuring quick access to frequently used items.",
            requirements: ["Grid system", "Item categorization", "Quick actions"],
            estimatedTime: "2-3 hours",
            xp: 130
        }
    ],

    intermediate: [
        // Maps
        {
            type: "Interactive Map System",
            uiType: UI_SCREEN_TYPES.MAPS,
            description: "Navigation is essential for exploring the world of {game}. Design a comprehensive map interface that allows players to seamlessly plan their journey. detailed legend, distinct icons for different points of interest, clarity at different zoom levels, and filter options to de-clutter the view.",
            requirements: ["Map design", "Icon system", "Zoom functionality", "Filter options"],
            estimatedTime: "3-4 hours",
            xp: 250
        },

        // Character Select
        {
            type: "Character Selection Screen",
            uiType: UI_SCREEN_TYPES.CHARACTER_SELECT,
            description: "The character selection screen sets the stage for the player's identity. Create an engaging interface for {game} that showcases character models, key stats, and unique abilities. Consider the flow of browsing through a roster and the visual feedback when a character is locked vs. selected.",
            requirements: ["Character preview", "Stats display", "Locking mechanism", "Animation notes"],
            estimatedTime: "3-4 hours",
            xp: 280
        },

        // Weapon Select
        {
            type: "Loadout Configuration",
            uiType: UI_SCREEN_TYPES.WEAPON_SELECT,
            description: "Optimizing gear is a core loop in {game}. Design a weapon/loadout selection screen that makes comparing stats (damage, fire rate, accuracy) intuitive. The interface should allow players to easily swap attachments or mods and see the immediate impact on performance.",
            requirements: ["Weapon preview", "Stats comparison", "Customization options"],
            estimatedTime: "2-3 hours",
            xp: 240
        },

        // Level Select
        {
            type: "Level Selection Interface",
            uiType: UI_SCREEN_TYPES.LEVEL_SELECT,
            description: "Design a level or mission selection screen for {game} that clearly communicates progress and challenge. Include elements like mission difficulty indicators, potential rewards, and completion status (e.g., stars, medals). The layout should encourage players to tackle the next challenge.",
            requirements: ["Progress tracking", "Difficulty indicators", "Rewards preview"],
            estimatedTime: "2-3 hours",
            xp: 250
        },

        // Skills
        {
            type: "Skill Tree Visualization",
            uiType: UI_SCREEN_TYPES.SKILLS,
            description: "Skill trees can arguably be the most complex UI screen effectively. Create an intuitive skill tree interface for {game} that visualizes progression paths clearly. Address how prerequisites are shown, how available points are displayed, and ensure the player understands the benefits of each upgrade at a glance.",
            requirements: ["Tree structure", "Prerequisites display", "Point allocation", "Respec option"],
            estimatedTime: "3-5 hours",
            xp: 300
        },

        // Upgrades
        {
            type: "Upgrade System Interface",
            uiType: UI_SCREEN_TYPES.UPGRADES,
            description: "Design a dedicated upgrade or enhancement interface for {game}. The screen should communicate the cost (resources/currency) and the benefit (stat increase) of an upgrade clearly. Consider visual payoffs, like a 'Success' animation or a 'Before/After' comparison, to make spending resources feel rewarding.",
            requirements: ["Before/after comparison", "Resource requirements", "Confirmation flow"],
            estimatedTime: "2-3 hours",
            xp: 260
        },

        // Crafting
        {
            type: "Crafting Station Design",
            uiType: UI_SCREEN_TYPES.CRAFTING,
            description: "Crafting involves combining multiple resources to create value. Create a crafting interface for {game} that streamlines recipe management. Users need to easily see what they can build, what materials are missing, and queue items for production. Visually represent the 'assembly' process.",
            requirements: ["Recipe browser", "Material requirements", "Crafting queue", "Success rate"],
            estimatedTime: "3-4 hours",
            xp: 280
        },

        // Buying/Selling/Trade
        {
            type: "Trading Interface",
            uiType: UI_SCREEN_TYPES.BUYING_SELLING_TRADE,
            description: "Design a vendor or trading interface for {game} where commerce happens. The challenge is showing two inventories (Player vs. Vendor) side-by-side or in a unified view without clutter. Ensure currency is always visible, and prevent accidental sales with clear transaction confirmations.",
            requirements: ["Inventory comparison", "Currency display", "Transaction confirmation", "Filter system"],
            estimatedTime: "3-4 hours",
            xp: 270
        },

        // Loot Selection
        {
            type: "Loot Distribution Screen",
            uiType: UI_SCREEN_TYPES.LOOT_SELECTION,
            description: "After a victory, players want to claim their spoils. Create a loot selection or reward claim interface for {game}. Use rarity color coding (common, rare, legendary) to create excitement. Include comparison tooltips so players can decide whether to 'Equip Now' or 'Send to Stash'.",
            requirements: ["Item preview", "Rarity indicators", "Comparison tooltips", "Quick equip"],
            estimatedTime: "2-3 hours",
            xp: 250
        },

        // Customization
        {
            type: "Character Customization Hub",
            uiType: UI_SCREEN_TYPES.CUSTOMIZATION,
            description: "Self-expression is vital. Design a comprehensive character customization interface for {game}. Organize complex options (Face, Hair, Body, Clothing) into manageable categories. Provide a large, rotatable preview of the character so players can see their changes in real-time.",
            requirements: ["Category navigation", "Preview system", "Color picker", "Save presets"],
            estimatedTime: "4-5 hours",
            xp: 320
        }
    ],

    expert: [
        // Complete UI Overhaul
        {
            type: "Complete HUD Redesign",
            uiType: UI_SCREEN_TYPES.HUD,
            description: "This is a holistic design challenge. Create a comprehensive HUD redesign for {game} that completely rethinks the information hierarchy. You must balance immersion with information density. Consider dynamic elements that hide when not needed, accessibility options (colorblind modes, scaling), and how the HUD adapts to different gameplay states (combat vs. exploration).",
            requirements: ["Full mockup", "Responsive scaling", "Customization options", "Accessibility features", "Animation specifications"],
            estimatedTime: "8-10 hours",
            xp: 500
        },

        // Game Setup
        {
            type: "Pre-Match Setup Flow",
            uiType: UI_SCREEN_TYPES.GAME_SETUP,
            description: "Design the entire flow from 'Main Menu' to 'Gameplay' for {game}. This includes lobby management, map voting/selection, game rule customization, and player readiness checks. The content is dense, so your goal is to make the configuration process feel smooth, organized, and quick.",
            requirements: ["Player management", "Rule customization", "Map selection", "Advanced settings", "Save presets"],
            estimatedTime: "5-7 hours",
            xp: 450
        },

        // Result Screen
        {
            type: "Match Results Dashboard",
            uiType: UI_SCREEN_TYPES.RESULT_SCREEN,
            description: "The end of a match is where players analyze their performance. Create a comprehensive results dashboard for {game}. It needs to display K/D ratios, score breakdowns, experience gained, and progression towards challenges. Use graphs or visualizers to make abstract data feel tangible and rewarding.",
            requirements: ["Player stats", "Performance graphs", "Achievements", "Sharing options", "Next match flow"],
            estimatedTime: "4-6 hours",
            xp: 420
        },

        // Reward Screen
        {
            type: "Reward Celebration Screen",
            uiType: UI_SCREEN_TYPES.REWARD_SCREEN,
            description: "Opening a reward should feel like a major event. Design an exciting reward unlock screen for {game} (e.g., Loot Box opening or Level Up summary). Focus heavily on the 'juice'—the animation, lighting, and sound cues (implied) that make the reveal satisfying. Show progress bars filling up and items popping out with impact.",
            requirements: ["Reveal animation", "Reward showcase", "Progress tracking", "Share functionality", "Collection view"],
            estimatedTime: "4-5 hours",
            xp: 400
        },

        // Level Complete
        {
            type: "Victory Summary Screen",
            uiType: UI_SCREEN_TYPES.LEVEL_COMPLETE,
            description: "Create a satisfying level completion screen for {game} (e.g., for a mobile puzzle or campaign mission). Clearly show the 'Star Rating' or 'Rank' achieved. Provide a breakdown of score, collectibles found, and a preview of the next level to encourage the 'just one more game' loop.",
            requirements: ["Score breakdown", "Star rating", "Collectibles found", "Next level preview", "Replay option"],
            estimatedTime: "3-5 hours",
            xp: 380
        },

        // Failure/Game Over
        {
            type: "Game Over Experience",
            uiType: UI_SCREEN_TYPES.FAILURE_GAMEOVER,
            description: "Failure is a learning opportunity. Design a 'Game Over' screen for {game} that motivates rather than discourages. Instead of just 'You Died', show the player *why* they failed (e.g., 'Damage taken source') and offer quick improvement tips. Ensure the 'Quick Restart' action is prominent to minimize friction.",
            requirements: ["Failure analysis", "Improvement suggestions", "Quick restart", "Exit flow", "Progress preservation"],
            estimatedTime: "3-4 hours",
            xp: 350
        },

        // Difficulty
        {
            type: "Difficulty Selection System",
            uiType: UI_SCREEN_TYPES.DIFFICULTY,
            description: "Selecting a difficulty mode is often the first significant choice a player makes. Create a difficulty selection interface for {game} that goes beyond text labels. Use visuals to represent the challenge difference (e.g., enemy aggression, resource scarcity). Provide detailed descriptions of what changes mechanically.",
            requirements: ["Difficulty explanations", "Modifier previews", "Recommended level", "Custom options", "Confirmation"],
            estimatedTime: "2-3 hours",
            xp: 330
        },

        // Credits
        {
            type: "Interactive Credits Screen",
            uiType: UI_SCREEN_TYPES.CREDITS,
            description: "Credits don't have to be boring scrolling text. Design an engaging, perhaps interactive, credits sequence for {game}. It could showcase concept art in the background, allow players to fast-forward, or even be playable. The goal is to make the team recognition feel like a part of the game's premium experience.",
            requirements: ["Scrolling system", "Category organization", "Skip option", "Background theming", "Special thanks section"],
            estimatedTime: "3-4 hours",
            xp: 360
        },

        // Item & Unlocks
        {
            type: "Progression & Unlocks Hub",
            uiType: UI_SCREEN_TYPES.ITEM_UNLOCKS,
            description: "Long-term engagement relies on progression. Create a central hub for {game} where players track their unlocks (skins, concept art, cheats). Use a grid or carousel layout that clearly separates 'Unlocked' from 'Locked' content, motivating players to complete tasks to fill the collection.",
            requirements: ["Progress visualization", "Unlock conditions", "Collection view", "Filters & search", "Sharing"],
            estimatedTime: "5-6 hours",
            xp: 480
        },

        // Experiences (XP/Progression)
        {
            type: "Experience & Progression Dashboard",
            uiType: UI_SCREEN_TYPES.EXPERIENCES,
            description: "Design a dedicated 'Profile' or 'Career' dashboard for {game}. This is the player's resume. Visualize their overall Level, XP curve, Season Pass progress, and career milestones. The interface should feel personal and rewarding, celebrating the time they've invested in the game.",
            requirements: ["Level progression", "XP breakdown", "Milestone rewards", "Seasonal content", "Leaderboards"],
            estimatedTime: "6-8 hours",
            xp: 520
        }
    ]
};

// Generate missions for database seeding
export async function seedMissions() {
    // Check if duplicate seeding
    const existingMissions = await dbOperations.getAll('missions');
    if (existingMissions && existingMissions.length > 0) {
        console.log('⚠️ Missions already seeded with', existingMissions.length, 'missions');
        return existingMissions;
    }

    const games = getAllGames();
    const allMissions = [];
    let missionId = 1;

    for (const game of games) {
        const gameData = await dbOperations.getAll('games');
        const gameRecord = gameData.find(g => g.title === game);

        if (!gameRecord) continue;

        const availableUITypes = getAvailableUITypes(game);

        // Generate missions for each difficulty
        const missionCount = Math.floor(Math.random() * 5) + 2; // Random 2 to 6 missions
        let createdCount = 0;

        // Flatten all templates
        const allTemplates = [
            ...missionTemplates.beginner,
            ...missionTemplates.intermediate,
            ...missionTemplates.expert
        ];

        // Shuffle templates
        const shuffledTemplates = allTemplates.sort(() => 0.5 - Math.random());

        for (const template of shuffledTemplates) {
            if (createdCount >= missionCount) break;

            if (availableUITypes.includes(template.uiType)) {
                // Determine difficulty based on template source (reverse lookup or just use stored difficulty if refactored)
                // For now, we finding which array it came from
                let difficulty = 'beginner';
                if (missionTemplates.intermediate.some(t => t.type === template.type)) difficulty = 'intermediate';
                if (missionTemplates.expert.some(t => t.type === template.type)) difficulty = 'expert';

                const referenceImage = getGameScreenshot(game, template.uiType);

                const mission = {
                    id: `mission-${missionId++}`,
                    type: template.type.replace('{game}', game),
                    uiType: template.uiType,
                    difficulty,
                    description: template.description.replace('{game}', game),
                    requirements: template.requirements,
                    estimatedTime: template.estimatedTime,
                    xp: template.xp,
                    gameId: gameRecord.id,
                    game: gameRecord,
                    referenceImages: referenceImage ? [referenceImage] : [],
                    status: 'available',
                    createdAt: new Date().toISOString()
                };

                allMissions.push(mission);
                createdCount++;
            }
        }
    }

    // Store in database
    for (const mission of allMissions) {
        await dbOperations.add('missions', mission);
    }

    console.log(`✅ Seeded ${allMissions.length} missions across ${games.length} games`);
    return allMissions;
}

// Generate missions for a specific game (called by missionManager)
export async function generateMissionsForGame(gameId, game) {
    try {
        if (!game) {
            game = await dbOperations.get('games', gameId);
        }

        if (!game) {
            console.error('Game not found:', gameId);
            return [];
        }

        let availableUITypes = getAvailableUITypes(game.title);

        // Fallback: If no specific UI types found (game not in screenshots DB), use ALL types
        if (!availableUITypes || availableUITypes.length === 0) {
            console.log(`ℹ️ No specific UI types for "${game.title}", enabling all mission types.`);
            availableUITypes = Object.values(UI_SCREEN_TYPES);
        }

        const newMissions = [];

        // Generate missions for each difficulty
        for (const difficulty of ['beginner', 'intermediate', 'expert']) {
            const templates = missionTemplates[difficulty];

            // Filter templates to those with available UI types
            const applicableTemplates = templates.filter(template =>
                availableUITypes.includes(template.uiType)
            );

            // Select 2-3 random templates
            const selectedTemplates = applicableTemplates
                .sort(() => Math.random() - 0.5)
                .slice(0, 3);

            for (const template of selectedTemplates) {
                const referenceImage = getGameScreenshot(game.title, template.uiType);

                const mission = {
                    type: template.type.replace('{game}', game.title),
                    uiType: template.uiType,
                    difficulty,
                    description: template.description.replace('{game}', game.title),
                    requirements: template.requirements,
                    estimatedTime: template.estimatedTime,
                    xp: template.xp,
                    gameId: game.id,
                    game: game,
                    referenceImages: referenceImage ? [referenceImage] : [],
                    status: 'available',
                    createdAt: new Date().toISOString()
                };

                const missionId = await dbOperations.add('missions', mission);
                newMissions.push({ ...mission, id: missionId });
            }
        }

        console.log(`✅ Generated ${newMissions.length} missions for ${game.title}`);
        return newMissions;
    } catch (error) {
        console.error('Error generating missions for game:', error);
        return [];
    }
}

// Check for games with 0 missions and generate them
export async function fillMissingMissions() {
    try {
        const [games, missions] = await Promise.all([
            dbOperations.getAll('games'),
            dbOperations.getAll('missions')
        ]);

        if (!games || games.length === 0) return;

        let filledCount = 0;

        for (const game of games) {
            const gameMissions = missions.filter(m => m.gameId === game.id);

            if (gameMissions.length === 0) {
                console.log(`✨ Generating missions for empty game: ${game.title}`);
                await generateMissionsForGame(game.id, game);
                filledCount++;
            }
        }

        if (filledCount > 0) {
            console.log(`✅ Auto-generated missions for ${filledCount} empty games.`);
        }
    } catch (error) {
        console.error('Error filling missing missions:', error);
    }
}

// Sync existing missions with new descriptions
export async function syncMissionDescriptions() {
    try {
        const missions = await dbOperations.getAll('missions');
        if (!missions || missions.length === 0) return;

        let updatedCount = 0;

        // Flatten templates for easy lookup
        const allTemplates = [
            ...missionTemplates.beginner,
            ...missionTemplates.intermediate,
            ...missionTemplates.expert
        ];

        for (const mission of missions) {
            // Find matching template by UI Type
            const matchingTemplate = allTemplates.find(t => t.uiType === mission.uiType);

            if (matchingTemplate && mission.game) {
                const newDescription = matchingTemplate.description.replace('{game}', mission.game.title);

                // Only update if different to save DB writes
                if (mission.description !== newDescription) {
                    mission.description = newDescription;
                    await dbOperations.update('missions', mission.id, mission);
                    updatedCount++;
                }
            }
        }

        if (updatedCount > 0) {
            console.log(`✅ Synced descriptions for ${updatedCount} missions.`);
        }
    } catch (error) {
        console.error('Error syncing mission descriptions:', error);
    }
}

export default missionTemplates;
