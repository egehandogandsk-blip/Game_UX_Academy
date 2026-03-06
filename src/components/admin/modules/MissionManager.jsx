import React, { useState, useEffect } from 'react';
import { dbOperations } from '../../../database/schema';
import { generateMissionsForGame } from '../../../database/missions';
import { generateMissionsWithAI } from '../../../utils/aiMissionGenerator';
import rawgService from '../../../services/rawgService';
import { UI_SCREEN_TYPES } from '../../../database/missionScreenshots';
import './AdminModules.css';

const MissionManager = () => {
    const [missions, setMissions] = useState([]);
    const [games, setGames] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [showAIGenerator, setShowAIGenerator] = useState(false);
    const [showRAWGSearch, setShowRAWGSearch] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        gameId: '',
        type: '',
        uiType: '',
        difficulty: 'beginner',
        description: '',
        estimatedTime: '',
        xp: 100
    });
    const [requirements, setRequirements] = useState(['']);

    // AI Generator state
    const [aiGameId, setAiGameId] = useState('');
    const [aiDifficulty, setAiDifficulty] = useState('beginner');
    const [aiCount, setAiCount] = useState(3);
    const [generatedMissions, setGeneratedMissions] = useState([]);
    const [generating, setGenerating] = useState(false);

    // RAWG Search state
    const [rawgQuery, setRawgQuery] = useState('');
    const [rawgResults, setRawgResults] = useState([]);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [missionsData, gamesData] = await Promise.all([
            dbOperations.getAll('missions'),
            dbOperations.getAll('games')
        ]);
        setMissions(missionsData || []);
        setGames(gamesData || []);
    };

    const resetForm = () => {
        setFormData({
            gameId: '',
            type: '',
            uiType: '',
            difficulty: 'beginner',
            description: '',
            estimatedTime: '',
            xp: 100
        });
        setRequirements(['']);
        setEditingId(null);
        setShowForm(false);
    };

    const handleEdit = (mission) => {
        setFormData({
            gameId: mission.gameId,
            type: mission.type,
            uiType: mission.uiType,
            difficulty: mission.difficulty,
            description: mission.description,
            estimatedTime: mission.estimatedTime,
            xp: mission.xp
        });
        setRequirements(mission.requirements || ['']);
        setEditingId(mission.id);
        setShowForm(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();

        const game = games.find(g => g.id === parseInt(formData.gameId));
        if (!game) {
            alert('Please select a game');
            return;
        }

        const missionData = {
            ...formData,
            gameId: parseInt(formData.gameId),
            game: game,
            requirements: requirements.filter(r => r.trim()),
            xp: parseInt(formData.xp),
            referenceImages: [],
            status: 'available',
            createdAt: editingId ? undefined : new Date().toISOString()
        };

        if (editingId) {
            await dbOperations.update('missions', editingId, missionData);
        } else {
            await dbOperations.add('missions', missionData);
        }

        resetForm();
        loadData();
    };

    const handleDelete = async (id) => {
        if (confirm('Delete this mission?')) {
            await dbOperations.delete('missions', id);
            loadData();
        }
    };

    // AI Generation
    const handleAIGenerate = async () => {
        if (!aiGameId) {
            alert('Please select a game');
            return;
        }

        setGenerating(true);
        try {
            const game = games.find(g => g.id === parseInt(aiGameId));

            // Try AI generation first
            try {
                const aiMissions = await generateMissionsWithAI(game, {
                    difficulty: aiDifficulty,
                    count: aiCount,
                    focus: 'UI/UX Design'
                });
                setGeneratedMissions(aiMissions);
            } catch {
                // Fallback to template-based generation
                console.warn('AI generation failed, using templates');
                const templateMissions = await generateMissionsForGame(game.id, game);
                setGeneratedMissions(templateMissions.slice(0, aiCount));
            }
        } catch (error) {
            console.error('Error generating missions:', error);
            alert('Failed to generate missions');
        } finally {
            setGenerating(false);
        }
    };

    const handleSaveGenerated = async () => {
        for (const mission of generatedMissions) {
            await dbOperations.add('missions', mission);
        }
        setGeneratedMissions([]);
        setShowAIGenerator(false);
        loadData();
    };

    // RAWG Search
    const handleRAWGSearch = async () => {
        if (!rawgQuery.trim()) return;

        setSearching(true);
        try {
            const results = await rawgService.searchGames(rawgQuery);
            setRawgResults(results.results);
        } catch (error) {
            console.error('RAWG search error:', error);
            alert('Failed to search games');
        } finally {
            setSearching(false);
        }
    };

    const handleImportGame = async (rawgGame) => {
        try {
            const gameData = await rawgService.importGame(rawgGame.id);
            await dbOperations.add('games', gameData);

            alert(`Game "${gameData.title}" imported successfully!`);
            setShowRAWGSearch(false);
            setRawgQuery('');
            setRawgResults([]);
            loadData();
        } catch (err) {
            console.error('Import error:', err);
            alert('Failed to import game');
        }
    };

    const addRequirement = () => setRequirements([...requirements, '']);
    const removeRequirement = (idx) => setRequirements(requirements.filter((_, i) => i !== idx));
    const updateRequirement = (idx, value) => {
        const newReqs = [...requirements];
        newReqs[idx] = value;
        setRequirements(newReqs);
    };

    return (
        <div className="mission-manager">
            <h2 className="module-title">Mission Management</h2>

            <div className="actions-bar">
                <button className="btn-admin primary small" onClick={() => setShowForm(true)}>+ Add Mission</button>
                <button className="btn-admin secondary small" onClick={() => setShowAIGenerator(true)}>🤖 Generate with AI</button>
                <button className="btn-admin secondary small" onClick={() => setShowRAWGSearch(true)}>🎮 Import from RAWG</button>
            </div>

            {/* Manual Mission Form */}
            {showForm && (
                <div className="admin-modal">
                    <form onSubmit={handleSave} className="admin-form">
                        <h3>{editingId ? 'Edit' : 'Add'} Mission</h3>

                        <select value={formData.gameId} onChange={e => setFormData({ ...formData, gameId: e.target.value })} required>
                            <option value="">Select Game</option>
                            {games.map(game => (
                                <option key={game.id} value={game.id}>{game.title}</option>
                            ))}
                        </select>

                        <input placeholder="Mission Type (e.g., HUD Icon Redesign)" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} required />

                        <select value={formData.uiType} onChange={e => setFormData({ ...formData, uiType: e.target.value })} required>
                            <option value="">Select UI Type</option>
                            {Object.values(UI_SCREEN_TYPES).map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>

                        <select value={formData.difficulty} onChange={e => setFormData({ ...formData, difficulty: e.target.value })}>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="expert">Expert</option>
                        </select>

                        <textarea placeholder="Description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows="4" required />

                        <h4>Requirements</h4>
                        {requirements.map((req, idx) => (
                            <div key={idx} className="requirement-row">
                                <input placeholder="Requirement" value={req} onChange={e => updateRequirement(idx, e.target.value)} className="admin-input-req" />
                                <button type="button" onClick={() => removeRequirement(idx)} className="btn-admin secondary small delete">Remove</button>
                            </div>
                        ))}
                        <button type="button" onClick={addRequirement} className="btn-admin secondary small">+ Add Requirement</button>

                        <input placeholder="Estimated Time (e.g., 2-3 hours)" value={formData.estimatedTime} onChange={e => setFormData({ ...formData, estimatedTime: e.target.value })} required />
                        <input type="number" placeholder="XP Reward" value={formData.xp} onChange={e => setFormData({ ...formData, xp: e.target.value })} required />

                        <div className="form-actions">
                            <button type="submit" className="btn-admin primary">Save</button>
                            <button type="button" onClick={resetForm} className="btn-admin secondary">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* AI Generator Modal */}
            {showAIGenerator && (
                <div className="admin-modal">
                    <div className="admin-form">
                        <h3>🤖 AI Mission Generator</h3>

                        <select value={aiGameId} onChange={e => setAiGameId(e.target.value)} required>
                            <option value="">Select Game</option>
                            {games.map(game => (
                                <option key={game.id} value={game.id}>{game.title}</option>
                            ))}
                        </select>

                        <select value={aiDifficulty} onChange={e => setAiDifficulty(e.target.value)}>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="expert">Expert</option>
                        </select>

                        <input type="number" min="1" max="10" placeholder="Number of missions" value={aiCount} onChange={e => setAiCount(parseInt(e.target.value))} />

                        <button onClick={handleAIGenerate} disabled={generating} className="btn-admin primary">
                            {generating ? 'Generating...' : 'Generate Missions'}
                        </button>

                        {generatedMissions.length > 0 && (
                            <div className="generated-missions">
                                <h4>Generated Missions ({generatedMissions.length})</h4>
                                {generatedMissions.map((mission, idx) => (
                                    <div key={idx} className="mission-preview">
                                        <h5>{mission.title || mission.type}</h5>
                                        <p><strong>Difficulty:</strong> {mission.difficulty}</p>
                                        <p>{mission.description}</p>
                                        <p><strong>XP:</strong> {mission.xpReward || mission.xp}</p>
                                    </div>
                                ))}
                                <div className="form-actions">
                                    <button onClick={handleSaveGenerated} className="btn-admin primary">Save All</button>
                                    <button onClick={() => setGeneratedMissions([])} className="btn-admin secondary">Discard</button>
                                </div>
                            </div>
                        )}

                        <button onClick={() => setShowAIGenerator(false)} className="btn-admin secondary">Close</button>
                    </div>
                </div>
            )}

            {/* RAWG Search Modal */}
            {showRAWGSearch && (
                <div className="admin-modal">
                    <div className="admin-form">
                        <h3>🎮 Import Game from RAWG</h3>

                        <div className="search-row">
                            <input placeholder="Search games..." value={rawgQuery} onChange={e => setRawgQuery(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleRAWGSearch()} className="admin-input-search" />
                            <button onClick={handleRAWGSearch} disabled={searching} className="btn-admin primary">
                                {searching ? 'Searching...' : 'Search'}
                            </button>
                        </div>

                        {rawgResults.length > 0 && (
                            <div className="rawg-results">
                                {rawgResults.map(game => (
                                    <div key={game.id} className="rawg-game-card">
                                        <img src={game.background_image} alt={game.name} className="rawg-thumb" />
                                        <div>
                                            <h5>{game.name}</h5>
                                            <p>{game.genres.join(', ')}</p>
                                            <p>Rating: {game.rating} ⭐</p>
                                        </div>
                                        <button onClick={() => handleImportGame(game)} className="btn-admin primary small">Import</button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button onClick={() => setShowRAWGSearch(false)} className="btn-admin secondary">Close</button>
                    </div>
                </div>
            )}

            {/* Mission List */}
            <div className="data-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Game</th>
                            <th>Type</th>
                            <th>UI Type</th>
                            <th>Difficulty</th>
                            <th>XP</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {missions.map(mission => (
                            <tr key={mission.id}>
                                <td>{mission.id}</td>
                                <td>{mission.game?.title || 'Unknown'}</td>
                                <td>{mission.type}</td>
                                <td>{mission.uiType}</td>
                                <td>{mission.difficulty}</td>
                                <td>{mission.xp}</td>
                                <td>
                                    <button onClick={() => handleEdit(mission)} className="btn-icon">✏️</button>
                                    <button onClick={() => handleDelete(mission.id)} className="btn-icon">🗑️</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MissionManager;
