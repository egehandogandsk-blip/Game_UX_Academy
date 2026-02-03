import React, { useState } from 'react';
import { dbOperations } from '../../database/schema';
import './AdminPanel.css';

const EditMissionForm = ({ mission, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        title: mission.title || '',
        description: mission.description || '',
        difficulty: mission.difficulty || 'Medium',
        requirements: mission.requirements || [''],
        deliverables: mission.deliverables || [''],
        xpReward: mission.xpReward || 100,
        estimatedHours: mission.estimatedHours || 4,
        skills: mission.skills || []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
            const updatedMission = {
                ...mission,
                title: formData.title.trim(),
                description: formData.description.trim(),
                difficulty: formData.difficulty,
                requirements: validRequirements,
                deliverables: validDeliverables,
                xpReward: parseInt(formData.xpReward),
                estimatedHours: parseInt(formData.estimatedHours),
                skills: formData.skills,
                lastModified: new Date().toISOString()
            };

            await dbOperations.update('missions', mission.id, updatedMission);

            if (onSuccess) {
                onSuccess();
            }

            onClose();
        } catch (err) {
            console.error('Error updating mission:', err);
            setError('Görev güncellenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>✏️ Görevi Düzenle</h3>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body">
                    {error && (
                        <div className="error-message">
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="mission-form">
                        <div className="selected-game-banner">
                            <span>Oyun: <strong>{mission.gameName || mission.game?.title || 'Unknown'}</strong></span>
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
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Açıklama</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
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
                                    />
                                    <button
                                        type="button"
                                        className="btn-icon btn-danger"
                                        onClick={() => removeListItem('requirements', index)}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => addListItem('requirements')}
                            >
                                + Ekle
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
                                    />
                                    <button
                                        type="button"
                                        className="btn-icon btn-danger"
                                        onClick={() => removeListItem('deliverables', index)}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => addListItem('deliverables')}
                            >
                                + Ekle
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
                                {loading ? 'Güncelleniyor...' : '✓ Görevi Güncelle'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditMissionForm;
