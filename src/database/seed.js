// Seed database with REAL game titles across all genres and platforms
import { dbOperations } from './schema.js';

// Helper for consistent high-quality images
// Steam: https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/{APP_ID}/library_600x900_2x.jpg
// Twitch: https://static-cdn.jtvnw.net/ttv-boxart/{GAME_NAME}-285x380.jpg (Using larger size if available or just resizing in CSS)

const getSteamImage = (appId) => `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/library_600x900_2x.jpg`;
const getTwitchImage = (gameName) => `https://static-cdn.jtvnw.net/ttv-boxart/${encodeURIComponent(gameName)}-600x800.jpg`;

export const gamesData = [
    // === FPS GAMES ===
    { title: "Counter-Strike 2", platform: ["Steam"], genres: ["FPS", "Shooter"], thumbnail: getSteamImage(730) },
    { title: "Call of Duty: Modern Warfare III", platform: ["Steam", "PlayStation", "Xbox"], genres: ["FPS", "Shooter"], thumbnail: getSteamImage(2519060) },
    { title: "Valorant", platform: ["PC"], genres: ["FPS", "Shooter", "Strategy"], thumbnail: getTwitchImage("VALORANT") },
    { title: "Overwatch 2", platform: ["Steam", "PlayStation", "Xbox"], genres: ["FPS", "Shooter"], thumbnail: getSteamImage(2357570) },
    { title: "Apex Legends", platform: ["Steam", "PlayStation", "Xbox", "Mobile"], genres: ["FPS", "Shooter"], thumbnail: getSteamImage(1172470) },
    { title: "Halo Infinite", platform: ["Xbox", "Steam"], genres: ["FPS", "Shooter"], thumbnail: getSteamImage(1240440) },
    { title: "Destiny 2", platform: ["Steam", "PlayStation", "Xbox"], genres: ["FPS", "RPG", "Shooter"], thumbnail: getSteamImage(1085660) },
    { title: "Team Fortress 2", platform: ["Steam"], genres: ["FPS", "Shooter"], thumbnail: getSteamImage(440) },
    { title: "Call of Duty: Mobile", platform: ["Mobile"], genres: ["FPS", "Shooter"], thumbnail: getTwitchImage("Call of Duty: Mobile") },
    { title: "Tom Clancy's Rainbow Six Siege", platform: ["Steam", "PlayStation", "Xbox"], genres: ["FPS", "Shooter", "Strategy"], thumbnail: getSteamImage(359550) },
    { title: "Battlefield 2042", platform: ["Steam", "PlayStation", "Xbox"], genres: ["FPS", "Shooter"], thumbnail: getSteamImage(1517290) },
    { title: "Titanfall 2", platform: ["Steam", "PlayStation", "Xbox"], genres: ["FPS", "Shooter", "Action"], thumbnail: getSteamImage(1237970) },
    { title: "DOOM Eternal", platform: ["Steam", "PlayStation", "Xbox"], genres: ["FPS", "Shooter", "Action"], thumbnail: getSteamImage(782330) },
    { title: "PAYDAY 2", platform: ["Steam"], genres: ["FPS", "Shooter", "Action"], thumbnail: getSteamImage(218620) },
    { title: "Far Cry 6", platform: ["Steam", "PlayStation", "Xbox"], genres: ["FPS", "Shooter", "Open World"], thumbnail: getSteamImage(2369390) }, // Using Steam ID if available or fallback

    // === RPG GAMES ===
    { title: "Elden Ring", platform: ["Steam", "PlayStation", "Xbox"], genres: ["RPG", "Action", "Open World"], thumbnail: getSteamImage(1245620) },
    { title: "The Witcher 3: Wild Hunt", platform: ["Steam", "PlayStation", "Xbox"], genres: ["RPG", "Open World"], thumbnail: getSteamImage(292030) },
    { title: "Cyberpunk 2077", platform: ["Steam", "PlayStation", "Xbox"], genres: ["RPG", "Open World", "Shooter"], thumbnail: getSteamImage(1091500) },
    { title: "The Elder Scrolls V: Skyrim Special Edition", platform: ["Steam", "PlayStation", "Xbox"], genres: ["RPG", "Open World"], thumbnail: getSteamImage(489830) },
    { title: "Baldur's Gate 3", platform: ["Steam", "PlayStation"], genres: ["RPG", "Strategy"], thumbnail: getSteamImage(1086940) },
    { title: "Final Fantasy XIV Online", platform: ["Steam", "PlayStation"], genres: ["RPG", "MMO"], thumbnail: getSteamImage(39210) },
    { title: "Dark Souls III", platform: ["Steam", "PlayStation", "Xbox"], genres: ["RPG", "Action"], thumbnail: getSteamImage(374320) },
    { title: "Persona 5 Royal", platform: ["Steam", "PlayStation"], genres: ["RPG", "Story/Novel"], thumbnail: getSteamImage(1687950) },
    { title: "Dragon Quest XI S: Echoes of an Elusive Age", platform: ["Steam", "PlayStation", "Xbox"], genres: ["RPG"], thumbnail: getSteamImage(1295510) },
    { title: "Monster Hunter: World", platform: ["Steam", "PlayStation", "Xbox"], genres: ["Action", "RPG"], thumbnail: getSteamImage(582010) },
    { title: "NieR: Automata", platform: ["Steam", "PlayStation", "Xbox"], genres: ["Action", "RPG"], thumbnail: getSteamImage(524220) },
    { title: "Fallout 4", platform: ["Steam", "PlayStation", "Xbox"], genres: ["RPG", "Open World", "Shooter"], thumbnail: getSteamImage(377160) },
    { title: "Divinity: Original Sin 2", platform: ["Steam", "PlayStation", "Xbox"], genres: ["RPG", "Strategy"], thumbnail: getSteamImage(435150) },
    { title: "Genshin Impact", platform: ["Mobile", "PC", "PlayStation"], genres: ["RPG", "Action", "Open World"], thumbnail: getTwitchImage("Genshin Impact") },
    { title: "Diablo IV", platform: ["Steam", "PlayStation", "Xbox"], genres: ["RPG", "Action"], thumbnail: getSteamImage(2344520) },
    { title: "Path of Exile", platform: ["Steam", "PlayStation", "Xbox"], genres: ["RPG", "Action"], thumbnail: getSteamImage(238960) },
    { title: "Hades", platform: ["Steam", "PlayStation", "Xbox"], genres: ["Action", "RPG"], thumbnail: getSteamImage(1145360) },
    { title: "Undertale", platform: ["Steam", "PlayStation", "Xbox"], genres: ["RPG", "Story/Novel"], thumbnail: getSteamImage(391540) },
    { title: "Starfield", platform: ["Xbox", "Steam"], genres: ["RPG", "Open World"], thumbnail: getSteamImage(1716740) },

    // === ACTION GAMES ===
    { title: "God of War", platform: ["Steam", "PlayStation"], genres: ["Action", "RPG"], thumbnail: getSteamImage(1593500) },
    { title: "Marvel's Spider-Man Remastered", platform: ["Steam", "PlayStation"], genres: ["Action", "Open World"], thumbnail: getSteamImage(1817070) },
    { title: "Horizon Forbidden West", platform: ["Steam", "PlayStation"], genres: ["Action", "RPG", "Open World"], thumbnail: getSteamImage(2420110) },
    { title: "Hollow Knight", platform: ["Steam", "PlayStation", "Xbox"], genres: ["Action"], thumbnail: getSteamImage(367520) },
    { title: "Celeste", platform: ["Steam", "PlayStation", "Xbox"], genres: ["Action"], thumbnail: getSteamImage(504230) },
    { title: "Dead Cells", platform: ["Steam", "PlayStation", "Xbox"], genres: ["Action"], thumbnail: getSteamImage(588650) },
    { title: "Cuphead", platform: ["Steam", "PlayStation", "Xbox"], genres: ["Action"], thumbnail: getSteamImage(268910) },
    { title: "Ori and the Will of the Wisps", platform: ["Steam", "Xbox"], genres: ["Action"], thumbnail: getSteamImage(1057090) },
    { title: "Warframe", platform: ["Steam", "PlayStation", "Xbox"], genres: ["Action", "Shooter"], thumbnail: getSteamImage(230410) },
    { title: "Devil May Cry 5", platform: ["Steam", "PlayStation", "Xbox"], genres: ["Action"], thumbnail: getSteamImage(601150) },
    { title: "Sekiro: Shadows Die Twice", platform: ["Steam", "PlayStation", "Xbox"], genres: ["Action", "RPG"], thumbnail: getSteamImage(814380) },
    { title: "Brawl Stars", platform: ["Mobile"], genres: ["Action", "Shooter"], thumbnail: getTwitchImage("Brawl Stars") },
    { title: "Subway Surfers", platform: ["Mobile"], genres: ["Casual", "Action"], thumbnail: getTwitchImage("Subway Surfers") },
    { title: "Fall Guys", platform: ["Steam", "PlayStation"], genres: ["Casual", "Action"], thumbnail: getSteamImage(1097150) },
    { title: "Sifu", platform: ["Steam", "PlayStation"], genres: ["Action", "Fighting"], thumbnail: getSteamImage(2138710) },
    { title: "Hi-Fi RUSH", platform: ["Steam", "Xbox"], genres: ["Action", "Music"], thumbnail: getSteamImage(1817230) },

    // === STRATEGY GAMES ===
    { title: "Dota 2", platform: ["Steam"], genres: ["Strategy", "Action"], thumbnail: getSteamImage(570) },
    { title: "League of Legends", platform: ["PC"], genres: ["Strategy", "Action"], thumbnail: getTwitchImage("League of Legends") },
    { title: "Sid Meier's Civilization VI", platform: ["Steam", "PlayStation", "Xbox"], genres: ["Strategy", "Management"], thumbnail: getSteamImage(289070) },
    { title: "XCOM 2", platform: ["Steam", "PlayStation", "Xbox"], genres: ["Strategy", "Action"], thumbnail: getSteamImage(268500) },
    { title: "Total War: WARHAMMER III", platform: ["Steam"], genres: ["Strategy"], thumbnail: getSteamImage(1142710) },
    { title: "Age of Empires IV", platform: ["Steam", "Xbox"], genres: ["Strategy"], thumbnail: getSteamImage(1466860) },
    { title: "Factorio", platform: ["Steam"], genres: ["Strategy", "Management"], thumbnail: getSteamImage(427520) },
    { title: "StarCraft II", platform: ["PC"], genres: ["Strategy"], thumbnail: getTwitchImage("StarCraft II") },
    { title: "Crusader Kings III", platform: ["Steam", "PlayStation", "Xbox"], genres: ["Strategy", "Management"], thumbnail: getSteamImage(1158310) },
    { title: "Europa Universalis IV", platform: ["Steam"], genres: ["Strategy", "Management"], thumbnail: getSteamImage(236850) },
    { title: "Hearts of Iron IV", platform: ["Steam"], genres: ["Strategy"], thumbnail: getSteamImage(394360) },
    { title: "Stellaris", platform: ["Steam", "PlayStation", "Xbox"], genres: ["Strategy", "Management"], thumbnail: getSteamImage(281990) },
    { title: "Clash of Clans", platform: ["Mobile"], genres: ["Strategy", "Management"], thumbnail: getTwitchImage("Clash of Clans") },
    { title: "Clash Royale", platform: ["Mobile"], genres: ["Strategy", "Card"], thumbnail: getTwitchImage("Clash Royale") },
    { title: "Among Us", platform: ["Steam", "Mobile"], genres: ["Casual", "Strategy"], thumbnail: getSteamImage(945360) },

    // === SHOOTER GAMES (non-FPS) ===
    { title: "Grand Theft Auto V", platform: ["Steam", "PlayStation", "Xbox"], genres: ["Open World", "Action", "Shooter"], thumbnail: getSteamImage(271590) },
    { title: "Red Dead Redemption 2", platform: ["Steam", "PlayStation", "Xbox"], genres: ["Open World", "Action", "Shooter"], thumbnail: getSteamImage(1174180) },
    { title: "PUBG: BATTLEGROUNDS", platform: ["Steam"], genres: ["Shooter", "Action"], thumbnail: getSteamImage(578080) },
    { title: "Fortnite", platform: ["PC", "Console", "Mobile"], genres: ["Shooter", "Action"], thumbnail: getTwitchImage("Fortnite") },
    { title: "Gears 5", platform: ["Xbox", "Steam"], genres: ["Shooter", "Action"], thumbnail: getSteamImage(1097840) },
    { title: "Tom Clancy's The Division 2", platform: ["Steam", "PlayStation", "Xbox"], genres: ["Shooter", "Action", "RPG"], thumbnail: getSteamImage(2221490) },
    { title: "Borderlands 3", platform: ["Steam", "PlayStation", "Xbox"], genres: ["Shooter", "Action", "RPG"], thumbnail: getSteamImage(397540) },
    { title: "HELLDIVERS 2", platform: ["Steam", "PlayStation"], genres: ["Shooter", "Action"], thumbnail: getSteamImage(553850) },
    { title: "Dead Space", platform: ["Steam", "PlayStation", "Xbox"], genres: ["Shooter", "Survival", "Action"], thumbnail: getSteamImage(1693980) },
    { title: "Resident Evil 4", platform: ["Steam", "PlayStation", "Xbox"], genres: ["Survival", "Action", "Shooter"], thumbnail: getSteamImage(2050650) },

    // === CASUAL GAMES ===
    { title: "Candy Crush Saga", platform: ["Mobile"], genres: ["Match 3", "Casual"], thumbnail: getTwitchImage("Candy Crush Saga") },
    { title: "Pokémon GO", platform: ["Mobile"], genres: ["Casual"], thumbnail: getTwitchImage("Pokémon GO") },
    { title: "Stardew Valley", platform: ["Steam", "PlayStation", "Xbox", "Mobile"], genres: ["Casual", "Management"], thumbnail: getSteamImage(413150) },
    { title: "The Sims 4", platform: ["Steam", "PlayStation", "Xbox"], genres: ["Casual", "Management"], thumbnail: getSteamImage(1222670) },
    { title: "Two Point Hospital", platform: ["Steam", "PlayStation", "Xbox"], genres: ["Management", "Casual"], thumbnail: getSteamImage(535930) },
    { title: "Unpacking", platform: ["Steam", "PlayStation", "Xbox"], genres: ["Casual"], thumbnail: getSteamImage(1135690) },
    { title: "Tetris Effect: Connected", platform: ["Steam", "PlayStation", "Xbox"], genres: ["Casual"], thumbnail: getSteamImage(1003590) },
    { title: "Plants vs. Zombies", platform: ["Mobile", "Steam"], genres: ["Casual", "Strategy"], thumbnail: getSteamImage(3590) },
    { title: "Angry Birds 2", platform: ["Mobile"], genres: ["Casual"], thumbnail: getTwitchImage("Angry Birds 2") },

    // === CARD GAMES ===
    { title: "Hearthstone", platform: ["PC", "Mobile"], genres: ["Card", "Strategy"], thumbnail: getTwitchImage("Hearthstone") },
    { title: "Marvel Snap", platform: ["Mobile", "Steam"], genres: ["Card", "Strategy"], thumbnail: getSteamImage(1997040) },
    { title: "Slay the Spire", platform: ["Steam", "PlayStation", "Xbox"], genres: ["Card", "Strategy"], thumbnail: getSteamImage(646570) },
    { title: "Gwent: The Witcher Card Game", platform: ["Steam", "Mobile"], genres: ["Card", "Strategy"], thumbnail: getSteamImage(1284410) },
    { title: "Yu-Gi-Oh! Master Duel", platform: ["Steam", "PlayStation", "Xbox", "Mobile"], genres: ["Card", "Strategy"], thumbnail: getSteamImage(1449850) },
    { title: "Magic: The Gathering Arena", platform: ["Steam", "Mobile"], genres: ["Card", "Strategy"], thumbnail: getSteamImage(2141910) },
    { title: "Legends of Runeterra", platform: ["PC", "Mobile"], genres: ["Card", "Strategy"], thumbnail: getTwitchImage("Legends of Runeterra") },
    { title: "Inscryption", platform: ["Steam", "PlayStation", "Xbox"], genres: ["Card", "Strategy"], thumbnail: getSteamImage(1092790) },
    { title: "Balatro", platform: ["Steam", "PlayStation", "Xbox"], genres: ["Card", "Strategy"], thumbnail: getSteamImage(2379780) },

    // === MANAGEMENT GAMES ===
    { title: "Cities: Skylines II", platform: ["Steam", "PlayStation", "Xbox"], genres: ["Management", "Strategy"], thumbnail: getSteamImage(949230) },
    { title: "RimWorld", platform: ["Steam"], genres: ["Management", "Strategy"], thumbnail: getSteamImage(294100) },
    { title: "Oxygen Not Included", platform: ["Steam"], genres: ["Management", "Strategy"], thumbnail: getSteamImage(457140) },
    { title: "Planet Coaster", platform: ["Steam", "PlayStation", "Xbox"], genres: ["Management"], thumbnail: getSteamImage(493340) },
    { title: "Planet Zoo", platform: ["Steam", "PlayStation", "Xbox"], genres: ["Management"], thumbnail: getSteamImage(703080) },
    { title: "Frostpunk", platform: ["Steam", "PlayStation", "Xbox"], genres: ["Management", "Strategy", "Survival"], thumbnail: getSteamImage(323190) },
    { title: "Prison Architect", platform: ["Steam", "PlayStation", "Xbox"], genres: ["Management", "Strategy"], thumbnail: getSteamImage(233450) },
    { title: "Football Manager 2024", platform: ["Steam"], genres: ["Management", "Sports"], thumbnail: getSteamImage(2252570) },
    { title: "Farming Simulator 22", platform: ["Steam", "PlayStation", "Xbox"], genres: ["Management"], thumbnail: getSteamImage(1248130) },
    { title: "House Flipper", platform: ["Steam", "PlayStation", "Xbox"], genres: ["Management", "Casual"], thumbnail: getSteamImage(613100) },

    // === SURVIVAL GAMES ===
    { title: "Terraria", platform: ["Steam", "PlayStation", "Xbox", "Mobile"], genres: ["Action", "Survival"], thumbnail: getSteamImage(105600) },
    { title: "Don't Starve Together", platform: ["Steam"], genres: ["Survival", "Strategy"], thumbnail: getSteamImage(322330) },
    { title: "Minecraft", platform: ["PC", "Console", "Mobile"], genres: ["Survival", "Casual"], thumbnail: getTwitchImage("Minecraft") },
    { title: "Valheim", platform: ["Steam"], genres: ["Survival", "RPG", "Open World"], thumbnail: getSteamImage(892970) },
    { title: "Subnautica", platform: ["Steam", "PlayStation", "Xbox"], genres: ["Survival", "Open World"], thumbnail: getSteamImage(264710) },
    { title: "The Last of Us Part I", platform: ["Steam", "PlayStation"], genres: ["Story/Novel", "Action", "Survival"], thumbnail: getSteamImage(1888930) },
    { title: "Rust", platform: ["Steam"], genres: ["Survival"], thumbnail: getSteamImage(252490) },
    { title: "ARK: Survival Ascended", platform: ["Steam", "PlayStation", "Xbox"], genres: ["Survival", "Action"], thumbnail: getSteamImage(2399830) },
    { title: "The Forest", platform: ["Steam", "PlayStation"], genres: ["Survival", "Action"], thumbnail: getSteamImage(242760) },
    { title: "Grounded", platform: ["Steam", "Xbox"], genres: ["Survival", "Action"], thumbnail: getSteamImage(962130) },
    { title: "State of Decay 2", platform: ["Steam", "Xbox"], genres: ["Survival", "Action"], thumbnail: getSteamImage(495420) },
    { title: "DayZ", platform: ["Steam", "PlayStation", "Xbox"], genres: ["Survival", "Shooter"], thumbnail: getSteamImage(221100) },
    { title: "Project Zomboid", platform: ["Steam"], genres: ["Survival", "Strategy"], thumbnail: getSteamImage(108600) },
    { title: "Raft", platform: ["Steam"], genres: ["Survival", "Action"], thumbnail: getSteamImage(648800) },
    { title: "Sons Of The Forest", platform: ["Steam"], genres: ["Survival", "Action"], thumbnail: getSteamImage(1326470) },

    // === FIGHTING GAMES ===
    { title: "Street Fighter 6", platform: ["Steam", "PlayStation", "Xbox"], genres: ["Fighting", "Action"], thumbnail: getSteamImage(1364780) },
    { title: "Mortal Kombat 1", platform: ["Steam", "PlayStation", "Xbox"], genres: ["Fighting", "Action"], thumbnail: getSteamImage(1971870) },
    { title: "TEKKEN 8", platform: ["Steam", "PlayStation", "Xbox"], genres: ["Fighting", "Action"], thumbnail: getSteamImage(1778820) },
    { title: "GUILTY GEAR -STRIVE-", platform: ["Steam", "PlayStation", "Xbox"], genres: ["Fighting", "Action"], thumbnail: getSteamImage(1384160) },
    { title: "Dragon Ball FighterZ", platform: ["Steam", "PlayStation", "Xbox"], genres: ["Fighting", "Action"], thumbnail: getSteamImage(678950) },
    { title: "Super Smash Bros. Ultimate", platform: ["Console"], genres: ["Fighting", "Action"], thumbnail: getTwitchImage("Super Smash Bros. Ultimate") },
    { title: "Brawlhalla", platform: ["Steam", "PlayStation", "Xbox", "Mobile"], genres: ["Fighting", "Action"], thumbnail: getSteamImage(291550) },
    { title: "MultiVersus", platform: ["Steam", "PlayStation", "Xbox"], genres: ["Fighting", "Action"], thumbnail: getSteamImage(1818750) }
];

const generateGames = () => {
    return [...gamesData];
};

export const seedDatabase = async () => {
    try {
        // Check if already seeded
        const existingGames = await dbOperations.getAll('games');
        if (existingGames && existingGames.length > 0) {
            console.log('⚠️ Games already seeded');
        } else {
            const allGames = generateGames();
            console.log('🌱 Seeding', allGames.length, 'games...');
            for (const game of allGames) {
                try {
                    await dbOperations.add('games', game);
                } catch (error) {
                    if (error.name !== 'ConstraintError') {
                        console.error('Error adding game:', game.title, error);
                    }
                }
            }
            console.log('✅ Games seeded successfully');
        }

        // Ensure user exists regardless of games seeding status
        try {
            const users = await dbOperations.getAll('users');
            if (!users || users.length === 0) {
                console.log('👤 Creating demo user...');
                await dbOperations.add('users', {
                    email: 'demo@gda.com',
                    username: 'GDAUser',
                    fullName: 'Demo User',
                    xp: 0,
                    level: 1,
                    badges: [],
                    createdAt: new Date().toISOString(),
                    bio: 'Gamer & Designer',
                    profilePhoto: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
                    coverPhoto: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1600&q=80',
                    socialLinks: {
                        behance: '', artstation: '', linkedin: '', instagram: '',
                        facebook: '', github: '', reddit: '', xboxProfile: '',
                        steamProfile: '', epicProfile: '', twitter: '', medium: ''
                    },
                    favoriteSoftware: [],
                    workField: '',
                    hasGDAEducation: false,
                    referralSource: '',
                    hasCompletedOnboarding: false,
                    onboardingStep: 0
                });
                console.log('✅ Demo user created');
            } else {
                console.log('👤 Users already exist');
            }
        } catch (error) {
            console.error('Error checking/creating user:', error);
        }
    } catch (error) {
        console.error('Error seeding database:', error);
    }
};

// Helper function to clear and reseed (expose to window for manual reset)
export const clearAndReseed = async () => {
    console.log('🗑️ Clearing database...');
    await dbOperations.clearDatabase();
    console.log('🌱 Reseeding games and missions...');
    await seedDatabase();
    // Re-import and run seedMissions since it's in another file
    // In a real app we might modularize this better, but for now we reload
    console.log('✅ Reseed complete! Refreshing page...');
    window.location.reload();
};

// Expose to window for debugging
if (typeof window !== 'undefined') {
    window.clearAndReseed = clearAndReseed;
    window.dbOperations = dbOperations;
}
