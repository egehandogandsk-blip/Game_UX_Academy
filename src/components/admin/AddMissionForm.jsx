import React, { useState, useEffect } from 'react';
import { dbOperations } from '../../database/schema';
import './AdminPanel.css';

const AddMissionForm = ({ onClose, onSuccess }) => {
    const [step, setStep] = useState(1); // 1: Select Game, 2: Fill Details
    const [games, setGames] = useState([]);
    const [selectedGame, setSelectedGame] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        difficulty: 'Medium',
        requirements: [''],
        deliverables: [''],
        xpReward: 100,
        estimatedHours: 4,
        skills: []
    });
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

    const availableSkills = [
        'UI Design', 'UX Research', 'Visual Design', 'Wireframing',
        'Prototyping', 'User Testing', 'Information Architecture',
        'Interaction Design', 'Design Systems', 'Accessibility'
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleListChange = (field, index, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].map((item, i) => i === index ? value : item)
        }));
    };

    const addListItem = (field) => {
        setFormData(prev => ({
            ...prev,
            [field]: [...prev[field], '']
        }));
    };

    const removeListItem = (field, index) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    const toggleSkill = (skill) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.includes(skill)
                ? prev.skills.filter(s => s !== skill)
                : [...prev.skills, skill]
        }));
    };

    const handleGameSelect = (game) => {
        setSelectedGame(game);
        setStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.title.trim()) {
            setError('Görev başlığı zorunludur');
            return;
        }

        const validRequirements = formData.requirements.filter(r => r.trim());
        const validDeliverables = formData.deliverables.filter(d => d.trim());

        if (validRequirements.length === 0) {
            setError('En az bir gereksinim ekleyin');
            return;
        }

        if (validDeliverables.length === 0) {
            setError('En az bir teslim edilecek ekleyin');
            return;
        }

        setLoading(true);

        try {
            const missionData = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                difficulty: formData.difficulty,
                gameId: selectedGame.id,
                gameName: selectedGame.name,
                requirements: validRequirements,
                deliverables: validDeliverables,
                xpReward: parseInt(formData.xpReward),
                estimatedHours: parseInt(formData.estimatedHours),
                skills: formData.skills,
                status: 'active',
                createdAt: new Date().toISOString(),
                createdBy: 'admin'
            };

            await dbOperations.add('missions', missionData);

            if (onSuccess) {
                onSuccess();
            }

            onClose();
        } catch (err) {
            console.error('Error adding mission:', err);
            setError('Görev eklenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>🎯 Yeni Görev Ekle</h3>
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
                        <div className="mission-step">
                            <h4>Adım 1: Oyun Seçin</h4>
                            <p className="step-description">
                                Bu görevin hangi oyun için oluşturulacağını seçin.
                            </p>

                            <div className="game-selection-grid">
                                {games.map(game => (
                                    <div
                                        key={game.id}
                                        className="selectable-game-card-text"
                                        onClick={() => handleGameSelect(game)}
                                    >
                                        <div className="game-icon">🎮</div>
                                        <h5>{game.name}</h5>
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

                    {/* Step 2: Mission Details */}
                    {step === 2 && selectedGame && (
                        <form onSubmit={handleSubmit} className="mission-form">
                            <div className="selected-game-banner">
                                <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setStep(1)}
                                >
                                    ← Oyun Değiştir
                                </button>
                                <span>Seçilen Oyun: <strong>{selectedGame.name}</strong></span>
                            </div>

                            <div className="form-section">
                                <h4>Görev Bilgileri</h4>

                                <div className="form-group">
                                    <label>Başlık *</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="örn: Ana Menü Tasarımı"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Açıklama</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Görev hakkında detaylı açıklama..."
                                        rows="4"
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Zorluk *</label>
                                        <select
                                            name="difficulty"
                                            value={formData.difficulty}
                                            onChange={handleInputChange}
                                        >
                                            <option value="Easy">Easy</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Hard">Hard</option>
                                            <option value="Expert">Expert</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>XP Ödülü</label>
                                        <input
                                            type="number"
                                            name="xpReward"
                                            value={formData.xpReward}
                                            onChange={handleInputChange}
                                            min="50"
                                            step="50"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Tahmini Süre (saat)</label>
                                        <input
                                            type="number"
                                            name="estimatedHours"
                                            value={formData.estimatedHours}
                                            onChange={handleInputChange}
                                            min="1"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h4>Gereksinimler *</h4>
                                {formData.requirements.map((req, index) => (
                                    <div key={index} className="list-item">
                                        <input
                                            type="text"
                                            value={req}
                                            onChange={(e) => handleListChange('requirements', index, e.target.value)}
                                            placeholder={`Gereksinim ${index + 1}`}
                                        />
                                        {formData.requirements.length > 1 && (
                                            <button
                                                type="button"
                                                className="btn-icon btn-danger"
                                                onClick={() => removeListItem('requirements', index)}
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => addListItem('requirements')}
                                >
                                    + Gereksinim Ekle
                                </button>
                            </div>

                            <div className="form-section">
                                <h4>Teslim Edilecekler *</h4>
                                {formData.deliverables.map((del, index) => (
                                    <div key={index} className="list-item">
                                        <input
                                            type="text"
                                            value={del}
                                            onChange={(e) => handleListChange('deliverables', index, e.target.value)}
                                            placeholder={`Teslim edilecek ${index + 1}`}
                                        />
                                        {formData.deliverables.length > 1 && (
                                            <button
                                                type="button"
                                                className="btn-icon btn-danger"
                                                onClick={() => removeListItem('deliverables', index)}
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => addListItem('deliverables')}
                                >
                                    + Teslim Edilecek Ekle
                                </button>
                            </div>

                            <div className="form-section">
                                <h4>Beceriler</h4>
                                <div className="checkbox-grid">
                                    {availableSkills.map(skill => (
                                        <label key={skill} className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={formData.skills.includes(skill)}
                                                onChange={() => toggleSkill(skill)}
                                            />
                                            <span>{skill}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={onClose}
                                    disabled={loading}
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? 'Ekleniyor...' : '✓ Görevi Ekle'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddMissionForm;
