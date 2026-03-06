import React, { useState, useEffect } from 'react';
import { MissionManager } from '../utils/missionManager.js';
import { GAME_GENRES, UI_SCREEN_TYPES } from '../database/missionScreenshots.js';
import LeaderboardModal from './LeaderboardModal';
import { useT } from '../contexts/LanguageContext';
import './MissionBrowser.css';

const MissionBrowser = ({ onMissionSelect }) => {
    const t = useT();
    const [missions, setMissions] = useState([]);
    const [filteredMissions, setFilteredMissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showLeaderboard, setShowLeaderboard] = useState(false);

    // Filters
    const [difficultyFilter, setDifficultyFilter] = useState('all');
    const [platformFilter, setPlatformFilter] = useState('all');
    const [genreFilter, setGenreFilter] = useState('all');
    const [uiTypeFilter, setUiTypeFilter] = useState('all');

    const loadMissions = React.useCallback(async () => {
        setLoading(true);
        const available = await MissionManager.getAvailableMissions();
        // Shuffle missions to avoid grouping by game (Fisher-Yates)
        for (let i = available.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [available[i], available[j]] = [available[j], available[i]];
        }

        setMissions(available);
        setLoading(false);
    }, []);

    const applyFilters = React.useCallback(() => {
        let filtered = [...missions];

        if (difficultyFilter !== 'all') {
            filtered = filtered.filter(m => m.difficulty === difficultyFilter);
        }

        if (platformFilter !== 'all') {
            filtered = filtered.filter(m => m.game?.platform?.includes(platformFilter));
        }

        if (genreFilter !== 'all') {
            filtered = filtered.filter(m => m.game?.genres?.includes(genreFilter));
        }

        if (uiTypeFilter !== 'all') {
            filtered = filtered.filter(m => m.uiType === uiTypeFilter);
        }

        setFilteredMissions(filtered);
    }, [missions, difficultyFilter, platformFilter, genreFilter, uiTypeFilter]);

    useEffect(() => {
        loadMissions();
    }, [loadMissions]);

    useEffect(() => {
        applyFilters();
    }, [applyFilters]);

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'beginner': return 'var(--gda-success)';
            case 'intermediate': return 'var(--gda-warning)';
            case 'expert': return '#ff4757'; // Vibrant Red
            default: return 'var(--gda-text-secondary)';
        }
    };

    const formatUIType = (uiType) => {
        if (!uiType) return '';
        return uiType.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    if (loading) {
        return (
            <div className="mission-browser-loading">
                <div className="loading-spinner"></div>
                <div>{t('loadingMissions')}</div>
            </div>
        );
    }

    return (
        <div className="mission-browser">
            <div className="mission-browser-header">
                <div className="header-content">
                    <h2>{t('browseMissions')}</h2>
                    <p>{t('chooseChallenge')}</p>
                </div>
                <button className="btn-leaderboard" onClick={() => setShowLeaderboard(true)}>
                    {t('leaderboard')}
                </button>
            </div>

            <div className="mission-filters">
                <div className="filter-row">
                    <div className="filter-group">
                        <label>{t('difficulty')}</label>
                        <select
                            value={difficultyFilter}
                            onChange={(e) => setDifficultyFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">{t('allDifficulties')}</option>
                            <option value="beginner">{t('beginner')}</option>
                            <option value="intermediate">{t('intermediate')}</option>
                            <option value="expert">{t('expert')}</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>{t('genre')}</label>
                        <select
                            value={genreFilter}
                            onChange={(e) => setGenreFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">{t('allGenres')}</option>
                            {Object.values(GAME_GENRES).map(genre => (
                                <option key={genre} value={genre}>{genre}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>{t('uiScreenType')}</label>
                        <select
                            value={uiTypeFilter}
                            onChange={(e) => setUiTypeFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">{t('allScreenTypes')}</option>
                            {Object.entries(UI_SCREEN_TYPES).map(([, value]) => (
                                <option key={value} value={value}>
                                    {formatUIType(value)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>{t('platform')}</label>
                        <select
                            value={platformFilter}
                            onChange={(e) => setPlatformFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">{t('allPlatforms')}</option>
                            <option value="Steam">Steam</option>
                            <option value="PlayStation">PlayStation</option>
                            <option value="Xbox">Xbox</option>
                            <option value="Mobile">Mobile</option>
                        </select>
                    </div>
                </div>

                <div className="filter-results">
                    <span className="results-count">{filteredMissions.length}</span> {t('missionsAvailable')}
                    {(difficultyFilter !== 'all' || genreFilter !== 'all' || uiTypeFilter !== 'all' || platformFilter !== 'all') && (
                        <button
                            className="clear-filters-btn"
                            onClick={() => {
                                setDifficultyFilter('all');
                                setGenreFilter('all');
                                setUiTypeFilter('all');
                                setPlatformFilter('all');
                            }}
                        >
                            {t('clearAllFilters')}
                        </button>
                    )}
                </div>
            </div>

            <div className="mission-grid">
                {filteredMissions.map((mission) => (
                    <div
                        key={mission.id}
                        className="mission-card"
                        onClick={() => onMissionSelect(mission)}
                    >
                        <div className="mission-card-image">
                            {(mission.game?.thumbnail || mission.game?.coverImage) ? (
                                <img
                                    src={mission.game?.thumbnail || mission.game?.coverImage}
                                    alt={`${mission.game?.title || mission.game?.name}`}
                                    loading="lazy"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                            ) : null}

                            {/* Fallback Icon */}
                            <div className="mission-image-placeholder" style={{ display: (mission.game?.thumbnail || mission.game?.coverImage) ? 'none' : 'flex' }}>
                                🎮
                            </div>

                            <div
                                className="mission-difficulty-badge"
                                style={{
                                    backgroundColor: getDifficultyColor(mission.difficulty),
                                    boxShadow: mission.difficulty === 'expert' ? '0 0 10px rgba(255, 71, 87, 0.6)' : 'none'
                                }}
                            >
                                <span className={`difficulty-dot ${mission.difficulty?.toLowerCase()}`}></span>
                                <span>{t(mission.difficulty)}</span>
                            </div>
                        </div>

                        <div className="mission-card-content">
                            <h3 className="mission-title">{mission.type}</h3>
                            <div className="mission-game">{mission.game?.title}</div>

                            <div className="mission-meta">
                                <div className="mission-xp">
                                    <span className="mission-xp-icon">⚡</span>
                                    {mission.xp} XP
                                </div>
                                <div className="mission-time">
                                    <span className="mission-time-icon">⏱️</span>
                                    {mission.estimatedTime}
                                </div>
                            </div>

                            <div className="mission-badges">
                                <span className="ui-type-badge">{formatUIType(mission.uiType)}</span>
                                {mission.game?.genres && mission.game.genres.length > 0 && (
                                    <span className="genre-badge">{mission.game.genres[0]}</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredMissions.length === 0 && (
                <div className="no-missions">
                    <div className="no-missions-icon">🔍</div>
                    <div className="no-missions-text">{t('noMissionsMatch')}</div>
                    <button
                        className="btn btn-secondary"
                        onClick={() => {
                            setDifficultyFilter('all');
                            setPlatformFilter('all');
                            setGenreFilter('all');
                            setUiTypeFilter('all');
                        }}
                    >
                        {t('clearAllFilters')}
                    </button>
                </div>
            )}

            {/* Leaderboard Modal */}
            {showLeaderboard && (
                <LeaderboardModal onClose={() => setShowLeaderboard(false)} />
            )}
        </div>
    );
};

export default MissionBrowser;
