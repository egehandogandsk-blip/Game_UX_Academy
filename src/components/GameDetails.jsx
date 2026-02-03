import React, { useState, useEffect } from 'react';
import { dbOperations } from '../database/schema';
import './GameDetails.css';

const GameDetails = ({ game, onBack, onMissionSelect }) => {
    const [missions, setMissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadGameMissions();
    }, [game.id]);

    const loadGameMissions = async () => {
        try {
            const allMissions = await dbOperations.getAll('missions');
            const gameMissions = allMissions.filter(m => m.gameId === game.id);
            setMissions(gameMissions);
            setLoading(false);
        } catch (error) {
            console.error('Error loading missions:', error);
            setLoading(false);
        }
    };

    // Platform links mapping
    const platformLinks = {
        'Steam': `https://store.steampowered.com/search/?term=${encodeURIComponent(game.title)}`,
        'PlayStation': `https://store.playstation.com/search/${encodeURIComponent(game.title)}`,
        'Xbox': `https://www.xbox.com/search?q=${encodeURIComponent(game.title)}`,
        'Mobile': `https://play.google.com/store/search?q=${encodeURIComponent(game.title)}`
    };

    // Game metadata (could come from database in real app)
    const gameMetadata = {
        developer: getGameDeveloper(game.title),
        uiDesigner: getGameUIDesigner(game.title),
        releaseYear: getGameReleaseYear(game.title),
        description: getGameDescription(game.title)
    };

    return (
        <div className="game-details-container">
            {/* Back Button */}
            <button className="btn btn-secondary back-btn" onClick={onBack}>
                ← Back to Game Archive
            </button>

            {/* Game Header */}
            <div className="game-details-header">
                <div className="game-details-thumbnail">
                    <img src={game.thumbnail} alt={game.title} />
                </div>

                <div className="game-details-info">
                    <h1 className="game-details-title">{game.title}</h1>

                    <div className="game-meta-tags">
                        {game.genres && game.genres.map((genre, index) => (
                            <span key={index} className="meta-tag genre-tag">{genre}</span>
                        ))}
                    </div>

                    <div className="game-metadata">
                        {gameMetadata.developer && (
                            <div className="metadata-item">
                                <span className="metadata-label">Developer:</span>
                                <span className="metadata-value">{gameMetadata.developer}</span>
                            </div>
                        )}

                        {gameMetadata.uiDesigner && (
                            <div className="metadata-item">
                                <span className="metadata-label">UI Designer:</span>
                                <span className="metadata-value">{gameMetadata.uiDesigner}</span>
                            </div>
                        )}

                        {gameMetadata.releaseYear && (
                            <div className="metadata-item">
                                <span className="metadata-label">Release Year:</span>
                                <span className="metadata-value">{gameMetadata.releaseYear}</span>
                            </div>
                        )}
                    </div>

                    {gameMetadata.description && (
                        <p className="game-description">{gameMetadata.description}</p>
                    )}

                    {/* Platform Links */}
                    <div className="platform-links">
                        <div className="platform-links-label">Available on:</div>
                        <div className="platform-buttons">
                            {game.platform && game.platform.map((platform, index) => (
                                <a
                                    key={index}
                                    href={platformLinks[platform] || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-platform"
                                >
                                    {getPlatformIcon(platform)} {platform}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Missions Section */}
            <div className="game-missions-section">
                <div className="section-header">
                    <h2>Available Missions</h2>
                    <span className="mission-count">{missions.length} missions</span>
                </div>

                {loading ? (
                    <div className="loading-missions">Loading missions...</div>
                ) : missions.length === 0 ? (
                    <div className="no-missions">
                        <div className="no-missions-icon">🎯</div>
                        <div className="no-missions-text">No missions available yet for this game</div>
                        <p className="no-missions-hint">Check back later for new case studies!</p>
                    </div>
                ) : (
                    <div className="missions-grid">
                        {missions.map((mission) => (
                            <div
                                key={mission.id}
                                className="mission-card"
                                onClick={() => onMissionSelect(mission)}
                            >
                                <div className="mission-card-header">
                                    <span className={`difficulty-badge ${mission.difficulty}`}>
                                        {mission.difficulty}
                                    </span>
                                    <span className="mission-xp">+{mission.xp} XP</span>
                                </div>

                                <h3 className="mission-title">{mission.type}</h3>
                                <p className="mission-description">{mission.description}</p>

                                <div className="mission-card-footer">
                                    <span className="mission-ui-type">{mission.uiType}</span>
                                    <span className="mission-time">⏱ {mission.estimatedTime}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// Helper functions to get game metadata
// In a real app, this would come from a database
function getGameDeveloper(title) {
    const developers = {
        'Elden Ring': 'FromSoftware',
        'The Witcher 3': 'CD Projekt Red',
        'Cyberpunk 2077': 'CD Projekt Red',
        'God of War Ragnarök': 'Santa Monica Studio',
        'Horizon Forbidden West': 'Guerrilla Games',
        'The Last of Us Part II': 'Naughty Dog',
        'Spider-Man: Miles Morales': 'Insomniac Games',
        'Halo Infinite': '343 Industries',
        'Counter-Strike 2': 'Valve',
        'Dota 2': 'Valve',
        'League of Legends': 'Riot Games',
        'Valorant': 'Riot Games',
        'Overwatch 2': 'Blizzard Entertainment',
        'Apex Legends': 'Respawn Entertainment',
        'Fortnite': 'Epic Games',
        'Minecraft': 'Mojang Studios',
        'Grand Theft Auto V': 'Rockstar North',
        'Red Dead Redemption 2': 'Rockstar Studios',
        'Genshin Impact': 'HoYoverse',
        'Final Fantasy XIV': 'Square Enix',
        'Baldur\'s Gate 3': 'Larian Studios',
        'Diablo IV': 'Blizzard Entertainment',
        'Street Fighter 6': 'Capcom',
        'Mortal Kombat 1': 'NetherRealm Studios'
    };
    return developers[title] || 'Unknown Developer';
}

function getGameUIDesigner(title) {
    const uiDesigners = {
        'The Last of Us Part II': 'Alexandria Neonakis (Lead UI/UX)',
        'God of War Ragnarök': 'Matt Sophos (UI/UX Director)',
        'Overwatch 2': 'David Castillo (Senior UI Designer)',
        'Cyberpunk 2077': 'Alvin Liu (UI/UX Creative Director)',
        'Apex Legends': 'Chad Grenier (UI/UX Lead)',
        'Fortnite': 'Eric Williamson (Design Director)',
        'Valorant': 'Joe Ziegler (Game Director - UI oversight)',
        'Genshin Impact': 'HoYoverse UI Team',
        'Final Fantasy XIV': 'Naoki Yoshida (Producer & UI Direction)',
        'League of Legends': 'Riot UI/UX Team'
    };
    return uiDesigners[title] || null;
}

function getGameReleaseYear(title) {
    const years = {
        'Elden Ring': '2022',
        'The Witcher 3': '2015',
        'Cyberpunk 2077': '2020',
        'God of War Ragnarök': '2022',
        'The Last of Us Part II': '2020',
        'Counter-Strike 2': '2023',
        'Valorant': '2020',
        'Apex Legends': '2019',
        'Fortnite': '2017',
        'Minecraft': '2011',
        'Grand Theft Auto V': '2013',
        'Genshin Impact': '2020',
        'Final Fantasy XIV': '2010',
        'Baldur\'s Gate 3': '2023',
        'Diablo IV': '2023'
    };
    return years[title] || '2024';
}

function getGameDescription(title) {
    // Simple description generator - in real app would come from database
    return `Explore ${title}'s unique UI/UX design challenges through hands-on case studies. Learn from industry-leading design patterns and create your own solutions.`;
}

function getPlatformIcon(platform) {
    const icons = {
        'Steam': '🎮',
        'PlayStation': '🎮',
        'Xbox': '🎮',
        'Mobile': '📱'
    };
    return icons[platform] || '🎮';
}

export default GameDetails;
