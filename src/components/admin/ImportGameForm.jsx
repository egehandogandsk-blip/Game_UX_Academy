import React, { useState } from 'react';
import { searchRAWGGames, getRAWGGameDetails, validateGameData } from '../../utils/rawgApi';
import { dbOperations } from '../../database/schema';
import './AdminPanel.css';

const ImportGameForm = ({ onClose, onSuccess }) => {
    const [step, setStep] = useState(1); // 1: Search, 2: Select, 3: Review
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedGame, setSelectedGame] = useState(null);
    const [gameData, setGameData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        setError('');

        if (!searchQuery.trim()) {
            setError('Lütfen bir oyun adı girin');
            return;
        }

        setLoading(true);

        try {
            const results = await searchRAWGGames(searchQuery);
            setSearchResults(results);
            setStep(2);
        } catch (err) {
            setError('Oyun arama başarısız. Lütfen tekrar deneyin.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectGame = async (game) => {
        setLoading(true);
        setError('');

        try {
            const details = await getRAWGGameDetails(game.id);
            const cleanData = validateGameData(details);
            setGameData(cleanData);
            setSelectedGame(game);
            setStep(3);
        } catch (err) {
            setError('Oyun detayları alınamadı. Lütfen tekrar deneyin.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async () => {
        setLoading(true);
        setError('');

        try {
            const finalData = {
                ...gameData,
                // Ensure coverImage is empty/text-based if needed, but keeping the URL is fine if we handle display with onError elsewhere.
                // However, per user request to "not use images", we can just clear it or keep it for data but not display it.
                // For now, keeping the data is safer, but UI won't show it.
                addedBy: 'admin_import',
                sourceUrl: `https://rawg.io/games/${selectedGame.slug}`,
                importedAt: new Date().toISOString(),
                createdAt: new Date().toISOString()
            };

            await dbOperations.add('games', finalData);

            if (onSuccess) {
                onSuccess();
            }

            onClose();
        } catch (err) {
            setError('Oyun eklenirken bir hata oluştu');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>🔗 RAWG'den Oyun İçe Aktar</h3>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body">
                    {error && (
                        <div className="error-message">
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Step 1: Search */}
                    {step === 1 && (
                        <div className="import-step">
                            <h4>Oyun Ara</h4>
                            <p className="step-description">
                                RAWG veritabanında oyun arayın. 300,000+ oyun içerisinden otomatik olarak bilgileri çekin.
                            </p>

                            <form onSubmit={handleSearch} className="search-form">
                                <div className="form-group">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="örn: The Last of Us"
                                        autoFocus
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary btn-block"
                                    disabled={loading}
                                >
                                    {loading ? 'Aranıyor...' : '🔍 Ara'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Step 2: Select from results */}
                    {step === 2 && (
                        <div className="import-step">
                            <div className="step-header">
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setStep(1)}
                                >
                                    ← Geri
                                </button>
                                <h4>Sonuçlar ({searchResults.length})</h4>
                            </div>

                            <div className="search-results">
                                {searchResults.map(game => (
                                    <div
                                        key={game.id}
                                        className={`search-result-item ${selectedGame?.id === game.id ? 'selected' : ''}`}
                                        onClick={() => handleSelectGame(game)}
                                    >
                                        <div className="result-icon">
                                            <div className="result-placeholder">🎮</div>
                                        </div>
                                        <div className="result-info">
                                            <h5>{game.name}</h5>
                                            <p>
                                                {game.released && `📅 ${game.released.split('-')[0]}`}
                                                {game.rating && ` | ⭐ ${game.rating}/5`}
                                            </p>
                                            <div className="result-platforms">
                                                {game.platforms?.slice(0, 3).map((p, idx) => (
                                                    <span key={idx} className="platform-badge">
                                                        {p.platform.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Review and confirm */}
                    {step === 3 && gameData && (
                        <div className="import-step">
                            <div className="step-header">
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setStep(2)}
                                >
                                    ← Geri
                                </button>
                                <h4>Önizleme ve Onayla</h4>
                            </div>

                            <div className="game-preview">
                                {/* Removed Image, used placeholder icon */}
                                <div className="game-card-visual" style={{ height: '100px', marginBottom: '20px' }}>
                                    <div className="game-icon-large">🎮</div>
                                </div>

                                <div className="preview-details">
                                    <h3>{gameData.name}</h3>
                                    <p className="preview-meta">
                                        {gameData.developer} | {gameData.releaseDate}
                                    </p>

                                    <div className="preview-section">
                                        <strong>Açıklama:</strong>
                                        <p>{gameData.description?.substring(0, 200)}...</p>
                                    </div>

                                    <div className="preview-section">
                                        <strong>Platformlar:</strong>
                                        <div className="preview-tags">
                                            {gameData.platforms.map((p, idx) => (
                                                <span key={idx} className="tag">{p}</span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="preview-section">
                                        <strong>Türler:</strong>
                                        <div className="preview-tags">
                                            {gameData.genres.map((g, idx) => (
                                                <span key={idx} className="tag">{g}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button
                        className="btn btn-secondary"
                        onClick={onClose}
                        disabled={loading}
                    >
                        İptal
                    </button>

                    {step === 3 && (
                        <button
                            className="btn btn-primary"
                            onClick={handleImport}
                            disabled={loading}
                        >
                            {loading ? 'Ekleniyor...' : '✓ Oyunu İçe Aktar'}
                        </button>
                    )}
                </div>
            </div >
        </div >
    );
};

export default ImportGameForm;
