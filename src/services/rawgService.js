// RAWG API Service for fetching game data
// Get your free API key from: https://rawg.io/apidocs
// Add to .env file: VITE_RAWG_API_KEY=your_key_here

const RAWG_API_KEY = import.meta.env.VITE_RAWG_API_KEY || 'b0f8e0e8e7c04b1f9f3e8b5a5e7c04b1';
const RAWG_BASE_URL = 'https://api.rawg.io/api';

export const rawgService = {
    /**
     * Search for games by query
     * @param {string} query - Search query
     * @param {number} page - Page number (default 1)
     * @returns {Promise<Object>} Search results
     */
    async searchGames(query, page = 1) {
        try {
            console.log('🔍 Searching RAWG for:', query);

            const url = `${RAWG_BASE_URL}/games?key=${RAWG_API_KEY}&search=${encodeURIComponent(query)}&page=${page}&page_size=10`;
            const response = await fetch(url);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('RAWG API Error:', response.status, errorText);
                throw new Error(`RAWG API error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('✅ RAWG results:', data.count, 'games found');

            return {
                results: data.results.map(game => ({
                    id: game.id,
                    name: game.name,
                    background_image: game.background_image,
                    rating: game.rating,
                    released: game.released,
                    genres: game.genres?.map(g => g.name) || [],
                    platforms: game.platforms?.map(p => p.platform.name) || []
                })),
                count: data.count,
                next: data.next
            };
        } catch (error) {
            console.error('❌ Error searching games:', error);
            throw error;
        }
    },

    /**
     * Get detailed game information
     * @param {number} gameId - RAWG game ID
     * @returns {Promise<Object>} Game details
     */
    async getGameDetails(gameId) {
        try {
            const response = await fetch(
                `${RAWG_BASE_URL}/games/${gameId}?key=${RAWG_API_KEY}`
            );

            if (!response.ok) {
                throw new Error(`RAWG API error: ${response.status}`);
            }

            const game = await response.json();

            return {
                id: game.id,
                name: game.name,
                description: game.description_raw || game.description,
                background_image: game.background_image,
                rating: game.rating,
                released: game.released,
                genres: game.genres?.map(g => g.name) || [],
                platforms: game.platforms?.map(p => p.platform.name) || [],
                developers: game.developers?.map(d => d.name) || [],
                publishers: game.publishers?.map(p => p.name) || [],
                tags: game.tags?.slice(0, 10).map(t => t.name) || [],
                esrb_rating: game.esrb_rating?.name,
                metacritic: game.metacritic,
                playtime: game.playtime,
                website: game.website
            };
        } catch (error) {
            console.error('Error fetching game details:', error);
            throw error;
        }
    },

    /**
     * Get game screenshots
     * @param {number} gameId - RAWG game ID
     * @returns {Promise<Array>} Array of screenshot URLs
     */
    async getGameScreenshots(gameId) {
        try {
            const response = await fetch(
                `${RAWG_BASE_URL}/games/${gameId}/screenshots?key=${RAWG_API_KEY}`
            );

            if (!response.ok) {
                throw new Error(`RAWG API error: ${response.status}`);
            }

            const data = await response.json();
            return data.results.map(screenshot => ({
                id: screenshot.id,
                image: screenshot.image,
                width: screenshot.width,
                height: screenshot.height
            }));
        } catch (error) {
            console.error('Error fetching screenshots:', error);
            throw error;
        }
    },

    /**
     * Import game from RAWG to local database
     * @param {number} rawgId - RAWG game ID
     * @returns {Promise<Object>} Formatted game object for database
     */
    async importGame(rawgId) {
        try {
            const [details, screenshots] = await Promise.all([
                this.getGameDetails(rawgId),
                this.getGameScreenshots(rawgId)
            ]);

            return {
                title: details.name,
                description: details.description,
                genre: details.genres[0] || 'Unknown',
                platform: details.platforms.join(', '),
                releaseDate: details.released,
                rating: details.rating,
                image: details.background_image,
                screenshots: screenshots.slice(0, 5).map(s => s.image),
                developer: details.developers[0] || 'Unknown',
                publisher: details.publishers[0] || 'Unknown',
                tags: details.tags,
                metacritic: details.metacritic,
                rawgId: details.id,
                importedAt: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error importing game:', error);
            throw error;
        }
    }
};

export default rawgService;
