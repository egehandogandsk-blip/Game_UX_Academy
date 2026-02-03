import React, { useState, useEffect, useRef } from 'react';
import './GameGrid.css';

const GameGrid = ({ games, onGameSelect }) => {
    const [filteredGames, setFilteredGames] = useState(games);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('all');
    const [selectedPlatform, setSelectedPlatform] = useState('all');
    const [visibleGames, setVisibleGames] = useState(20);
    const [showMissionGamesOnly, setShowMissionGamesOnly] = useState(false);
    const loadMoreRef = useRef(null);

    // Extract unique genres and platforms from arrays
    const genres = ['all', ...new Set(
        games.flatMap(g => g.genres || []).filter(Boolean)
    )].sort();

    const platforms = ['all', ...new Set(
        games.flatMap(g => g.platforms || []).filter(Boolean)
    )].sort();

    // Filter games
    useEffect(() => {
        let filtered = games;

        if (searchTerm) {
            filtered = filtered.filter(game =>
                (game.name && game.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (game.title && game.title.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        if (selectedGenre !== 'all') {
            filtered = filtered.filter(game =>
                game.genres && game.genres.includes(selectedGenre)
            );
        }

        if (selectedPlatform !== 'all') {
            filtered = filtered.filter(game =>
                game.platforms && game.platforms.includes(selectedPlatform)
            );
        }

        if (showMissionGamesOnly) {
            filtered = filtered.filter(game => game.missionCount > 0);
        }

        setFilteredGames(filtered);
        setVisibleGames(20); // Reset visible count when filters change
    }, [searchTerm, selectedGenre, selectedPlatform, showMissionGamesOnly, games]);

    // ... (rest of useEffects)

    return (
        <div className="game-grid-container">
            <div className="game-grid-header">
                <h2>Game Archive</h2>
                <div className="game-count">
                    {filteredGames.length} {filteredGames.length === 1 ? 'game' : 'games'}
                </div>
            </div>

            <div className="game-grid-filters">
                <div className="search-input-wrapper">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        className="input game-search"
                        placeholder="Search games..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button
                            className="clear-search-btn"
                            onClick={() => setSearchTerm('')}
                            aria-label="Clear search"
                        >
                            ✕
                        </button>
                    )}
                </div>

                <label className="checkbox-filter">
                    <input
                        type="checkbox"
                        checked={showMissionGamesOnly}
                        onChange={(e) => setShowMissionGamesOnly(e.target.checked)}
                    />
                    <span>Sadece Görev Olanlar</span>
                </label>

                <select
                    className="input game-filter"
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                >
                    <option value="all">All Genres ({genres.length - 1})</option>
                    {genres.slice(1).map(genre => (
                        <option key={genre} value={genre}>{genre}</option>
                    ))}
                </select>

                <select
                    className="input game-filter"
                    value={selectedPlatform}
                    onChange={(e) => setSelectedPlatform(e.target.value)}
                >
                    <option value="all">All Platforms ({platforms.length - 1})</option>
                    {platforms.slice(1).map(platform => (
                        <option key={platform} value={platform}>{platform}</option>
                    ))}
                </select>
            </div>

            <div className="game-grid">
                {filteredGames.slice(0, visibleGames).map((game) => (
                    <div
                        key={game.id}
                        className="game-card"
                        onClick={() => onGameSelect(game)}
                    >
                        <div className="game-thumbnail">
                            {/* Mission Count Badge */}
                            {game.missionCount > 0 && (
                                <div className="mission-count-badge">
                                    🎯 {game.missionCount} Görev
                                </div>
                            )}

                            {/* Game Image - Support both coverImage (Admin) and thumbnail (Seed) */}
                            {(game.coverImage || game.thumbnail) ? (
                                <img
                                    src={game.coverImage || game.thumbnail}
                                    alt={game.name || game.title}
                                    loading="lazy"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                            ) : null}

                            {/* Fallback Icon */}
                            <div className="game-fallback-icon" style={{ display: (game.coverImage || game.thumbnail) ? 'none' : 'flex' }}>
                                🎮
                            </div>

                            <div className="game-overlay">
                                <button className="btn btn-primary btn-sm">
                                    Görevleri İncele
                                </button>
                            </div>
                        </div>
                        <div className="game-info">
                            <div className="game-title">{game.name || game.title}</div>
                            <div className="game-meta">
                                {game.genres && game.genres[0] && (
                                    <span className="game-genre">{game.genres[0]}</span>
                                ) || (
                                        <span className="game-genre">General</span>
                                    )}
                                {game.platforms && game.platforms[0] && (
                                    <span className="game-platform">{game.platforms[0]}</span>
                                ) || (
                                        <span className="game-platform">Multiplatform</span>
                                    )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {visibleGames < filteredGames.length && (
                <div ref={loadMoreRef} className="load-more">
                    <div className="skeleton game-card-skeleton"></div>
                    <div className="skeleton game-card-skeleton"></div>
                    <div className="skeleton game-card-skeleton"></div>
                </div>
            )}

            {filteredGames.length === 0 && (
                <div className="no-results">
                    <div className="no-results-icon">🎮</div>
                    <div className="no-results-text">No games found</div>
                    <button
                        className="btn btn-secondary"
                        onClick={() => {
                            setSearchTerm('');
                            setSelectedGenre('all');
                            setSelectedPlatform('all');
                        }}
                    >
                        Clear Filters
                    </button>
                </div>
            )}
        </div>
    );
};

export default GameGrid;
