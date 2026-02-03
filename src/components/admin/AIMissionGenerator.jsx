import React, { useState, useEffect } from 'react';
import { dbOperations } from '../../database/schema';
import { generateMissionsWithAI, generateMockMissions } from '../../utils/aiMissionGenerator';
import './AdminPanel.css';

const AIMissionGenerator = ({ onClose, onSuccess }) => {
    const [step, setStep] = useState(1); // 1: Select Game, 2: Set Parameters, 3: Preview
    const [games, setGames] = useState([]);
    const [selectedGame, setSelectedGame] = useState(null);
    const [parameters, setParameters] = useState({
        difficulty: 'Medium',
        count: 3,
        focus: 'General UX/UI Design'
    });
    const [generatedMissions, setGeneratedMissions] = useState([]);
    const [selectedMissions, setSelectedMissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadGames();
    }, []);

    const loadGames = async () => {
        try {
            const gamesData = await dbOperations.getAll('games');
            setGames(gamesData || []);
        } catch (error) {
            console.error('Error loading games:', error);
        }
    };

    const focusAreas = [
        'General UX/UI Design',
        'Main Menu & Navigation',
        'HUD & In-Game UI',
        'Character & Inventory',
        'Settings & Options',
        'Mobile Optimization',
        'Accessibility Features'
    ];

    const handleGameSelect = (game) => {
        setSelectedGame(game);
        setStep(2);
    };

    const handleParameterChange = (e) => {
        const { name, value } = e.target;
        setParameters(prev => ({
            ...prev,
            [name]: name === 'count' ? parseInt(value) : value
        }));
    };

    const handleGenerate = async () => {
        setLoading(true);
        setError('');

        try {
            // Try real AI first, fall back to mock if API key not set
            let missions;
            try {
                missions = await generateMissionsWithAI(selectedGame, parameters);
            } catch (apiError) {
                console.warn('AI generation failed, using mock data:', apiError);
                missions = await generateMockMissions(selectedGame, parameters);
            }

            setGeneratedMissions(missions);
            setSelectedMissions(missions.map((_, idx) => idx)); // Select all by default
            setStep(3);
        } catch (err) {
            setError(err.message || 'Görevler oluşturulamadı');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleMissionSelection = (index) => {
        setSelectedMissions(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    const handleImport = async () => {
        setLoading(true);
        setError('');

        try {
            const missionsToImport = selectedMissions.map(idx => generatedMissions[idx]);

            for (const mission of missionsToImport) {
                await dbOperations.add('missions', {
                    ...mission,
                    status: 'active',
                    createdAt: new Date().toISOString(),
                    createdBy: 'ai_generator'
                });
            }

            if (onSuccess) {
                onSuccess();
            }

            onClose();
        } catch (err) {
            setError('Görevler eklenirken bir hata oluştu');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>🤖 AI ile Görev Oluştur</h3>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body">
                    {error && (
                        <div className="error-message">
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Step 1: Select Game */}
                    {step === 1 && (
                        <div className="ai-step">
                            <h4>Adım 1: Oyun Seçin</h4>
                            <p className="step-description">
                                Hangi oyun için AI ile görevler oluşturulacak?
                            </p>

                            <div className="game-selection-grid">
                                {games.map(game => (
                                    <div
                                        key={game.id}
                                        className="selectable-game-card-text"
                                        onClick={() => handleGameSelect(game)}
                                    >
                                        <div className="game-icon">🎮</div>
                                        <h5>{game.name || game.title}</h5>
                                        <p className="game-dev">{game.developer}</p>
                                        {game.genres && game.genres.length > 0 && (
                                            <div className="game-genres">
                                                {game.genres.slice(0, 2).map((genre, idx) => (
                                                    <span key={idx} className="genre-tag">{genre}</span>
                                                ))}
                                            </div>
                                        )}
                                        {game.platforms && game.platforms.length > 0 && (
                                            <div className="game-platforms">
                                                {game.platforms.slice(0, 3).map((platform, idx) => (
                                                    <span key={idx} className="platform-tag">{platform}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Set Parameters */}
                    {step === 2 && selectedGame && (
                        <div className="ai-step">
                            <div className="step-header">
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setStep(1)}
                                >
                                    ← Geri
                                </button>
                                <h4>Adım 2: Parametreler</h4>
                            </div>

                            <div className="selected-game-banner">
                                <span>Seçilen Oyun: <strong>{selectedGame.name || selectedGame.title}</strong></span>
                            </div>

                            <div className="ai-parameters">
                                <div className="form-group">
                                    <label>Zorluk Seviyesi</label>
                                    <select
                                        name="difficulty"
                                        value={parameters.difficulty}
                                        onChange={handleParameterChange}
                                    >
                                        <option value="Easy">Easy (Kolay)</option>
                                        <option value="Medium">Medium (Orta)</option>
                                        <option value="Hard">Hard (Zor)</option>
                                        <option value="Expert">Expert (Uzman)</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Görev Sayısı</label>
                                    <input
                                        type="number"
                                        name="count"
                                        value={parameters.count}
                                        onChange={handleParameterChange}
                                        min="1"
                                        max="10"
                                    />
                                    <small className="form-hint">1-10 arası görev oluşturulabilir</small>
                                </div>

                                <div className="form-group">
                                    <label>Odak Alanı</label>
                                    <select
                                        name="focus"
                                        value={parameters.focus}
                                        onChange={handleParameterChange}
                                    >
                                        {focusAreas.map(area => (
                                            <option key={area} value={area}>{area}</option>
                                        ))}
                                    </select>
                                </div>

                                <button
                                    className="btn btn-primary btn-block"
                                    onClick={handleGenerate}
                                    disabled={loading}
                                >
                                    {loading ? '🤖 AI Oluşturuyor...' : '✨ Görevleri Oluştur'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Preview and Select */}
                    {step === 3 && generatedMissions.length > 0 && (
                        <div className="ai-step">
                            <div className="step-header">
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setStep(2)}
                                >
                                    ← Geri
                                </button>
                                <h4>Adım 3: Önizleme ve Seç ({selectedMissions.length} seçili)</h4>
                            </div>

                            <div className="ai-missions-preview">
                                {generatedMissions.map((mission, index) => (
                                    <div
                                        key={index}
                                        className={`ai-mission-card ${selectedMissions.includes(index) ? 'selected' : ''}`}
                                        onClick={() => toggleMissionSelection(index)}
                                    >
                                        <div className="mission-card-header">
                                            <input
                                                type="checkbox"
                                                checked={selectedMissions.includes(index)}
                                                onChange={() => { }}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            <h5>{mission.title}</h5>
                                            <span className={`badge badge-${mission.difficulty.toLowerCase()}`}>
                                                {mission.difficulty}
                                            </span>
                                        </div>

                                        <p className="mission-description">{mission.description}</p>

                                        <div className="mission-details">
                                            <div className="detail-section">
                                                <strong>Gereksinimler:</strong>
                                                <ul>
                                                    {mission.requirements.map((req, idx) => (
                                                        <li key={idx}>{req}</li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className="detail-section">
                                                <strong>Teslim Edilecekler:</strong>
                                                <ul>
                                                    {mission.deliverables.map((del, idx) => (
                                                        <li key={idx}>{del}</li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className="mission-meta">
                                                <span>⏱️ {mission.estimatedHours}h</span>
                                                <span>⭐ {mission.xpReward} XP</span>
                                                <div className="mission-skills">
                                                    {mission.skills.map((skill, idx) => (
                                                        <span key={idx} className="skill-badge">{skill}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
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
                            disabled={loading || selectedMissions.length === 0}
                        >
                            {loading ? 'Ekleniyor...' : `✓ ${selectedMissions.length} Görevi Ekle`}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIMissionGenerator;
