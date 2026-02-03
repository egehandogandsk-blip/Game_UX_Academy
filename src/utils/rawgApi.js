// RAWG API Integration
// Documentation: https://rawg.io/apidocs

const RAWG_API_KEY = '0eaf9ecc733044ac94f8b06ca1bdfd26'; // Free API key from https://rawg.io/apidocs
const RAWG_BASE_URL = 'https://api.rawg.io/api';

export const searchRAWGGames = async (query) => {
    if (RAWG_API_KEY === 'YOUR_KEY_HERE') {
        throw new Error('RAWG API anahtarı eksik. Lütfen src/utils/rawgApi.js dosyasına bir API anahtarı ekleyin.');
    }
    try {
        const response = await fetch(
            `${RAWG_BASE_URL}/games?key=${RAWG_API_KEY}&search=${encodeURIComponent(query)}&page_size=10`
        );

        if (!response.ok) {
            throw new Error('RAWG API request failed');
        }

        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error('RAWG search error:', error);
        throw error;
    }
};

export const getRAWGGameDetails = async (gameId) => {
    try {
        const response = await fetch(
            `${RAWG_BASE_URL}/games/${gameId}?key=${RAWG_API_KEY}`
        );

        if (!response.ok) {
            throw new Error('RAWG API request failed');
        }

        const game = await response.json();

        // Transform RAWG data to our format
        return {
            name: game.name,
            description: game.description_raw || game.description || '',
            developer: game.developers?.[0]?.name || 'Unknown',
            publisher: game.publishers?.[0]?.name || game.developers?.[0]?.name || 'Unknown',
            releaseDate: game.released || '',
            platforms: game.platforms?.map(p => mapRAWGPlatform(p.platform.name)) || [],
            genres: game.genres?.map(g => g.name) || [],
            coverImage: game.background_image || '',
            screenshots: game.short_screenshots?.slice(0, 5).map(s => s.image) || [],
            videoUrl: game.clip?.clip || '',
            rawgId: game.id,
            rawgRating: game.rating,
            rawgMetacritic: game.metacritic
        };
    } catch (error) {
        console.error('RAWG details error:', error);
        throw error;
    }
};

// Map RAWG platform names to our platform names
const mapRAWGPlatform = (rawgPlatform) => {
    const platformMap = {
        'PC': 'PC',
        'PlayStation 5': 'PlayStation 5',
        'PlayStation 4': 'PlayStation 4',
        'PlayStation 3': 'PlayStation',
        'PlayStation 2': 'PlayStation',
        'PlayStation': 'PlayStation',
        'Xbox Series S/X': 'Xbox Series X/S',
        'Xbox One': 'Xbox One',
        'Xbox 360': 'Xbox',
        'Xbox': 'Xbox',
        'Nintendo Switch': 'Nintendo Switch',
        'iOS': 'iOS',
        'Android': 'Android',
        'macOS': 'Mac',
        'Linux': 'PC'
    };

    return platformMap[rawgPlatform] || rawgPlatform;
};

// Validate and clean game data
export const validateGameData = (gameData) => {
    // Remove duplicate platforms
    if (gameData.platforms) {
        gameData.platforms = [...new Set(gameData.platforms)];
    }

    // Remove duplicate genres
    if (gameData.genres) {
        gameData.genres = [...new Set(gameData.genres)];
    }

    // Clean description (remove HTML tags if any)
    if (gameData.description) {
        gameData.description = gameData.description.replace(/<[^>]*>/g, '');
    }

    return gameData;
};
