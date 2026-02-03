import React, { useState } from 'react';
import { dbOperations } from '../../database/schema';
import './AdminPanel.css';

const AddGameForm = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        developer: '',
        publisher: '',
        releaseDate: '',
        platforms: [],
        genres: [],
        coverImage: '',
        screenshots: [],
        videoUrl: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const availablePlatforms = [
        'PC', 'PlayStation', 'PlayStation 4', 'PlayStation 5',
        'Xbox', 'Xbox One', 'Xbox Series X/S',
        'Nintendo Switch', 'iOS', 'Android', 'Mac'
    ];

    const availableGenres = [
        'Action', 'Adventure', 'RPG', 'Strategy', 'Simulation',
        'Puzzle', 'Sports', 'Racing', 'Fighting', 'Platformer',
        'Shooter', 'Horror', 'Survival', 'MOBA', 'Battle Royale',
        'Roguelike', 'Card Game', 'MMO', 'Casual', 'Indie'
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const togglePlatform = (platform) => {
        setFormData(prev => ({
            ...prev,
            platforms: prev.platforms.includes(platform)
                ? prev.platforms.filter(p => p !== platform)
                : [...prev.platforms, platform]
        }));
    };

    const toggleGenre = (genre) => {
        setFormData(prev => ({
            ...prev,
            genres: prev.genres.includes(genre)
                ? prev.genres.filter(g => g !== genre)
                : [...prev.genres, genre]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.name.trim()) {
            setError('Oyun adı zorunludur');
            return;
        }

        if (formData.platforms.length === 0) {
            setError('En az bir platform seçmelisiniz');
            return;
        }

        if (formData.genres.length === 0) {
            setError('En az bir tür seçmelisiniz');
            return;
        }

        setLoading(true);

        try {
            const gameData = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                developer: formData.developer.trim(),
                publisher: formData.publisher.trim() || formData.developer.trim(),
                releaseDate: formData.releaseDate,
                platforms: formData.platforms,
                genres: formData.genres,
                coverImage: formData.coverImage.trim() || '',
                screenshots: formData.screenshots.filter(s => s.trim()),
                videoUrl: formData.videoUrl.trim(),
                addedBy: 'admin',
                createdAt: new Date().toISOString()
            };

            await dbOperations.add('games', gameData);

            if (onSuccess) {
                onSuccess();
            }

            onClose();
        } catch (err) {
            console.error('Error adding game:', err);
            setError('Oyun eklenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>🎮 Yeni Oyun Ekle</h3>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body game-form">
                    {error && (
                        <div className="error-message">
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Basic Info */}
                    <div className="form-section">
                        <h4>Temel Bilgiler</h4>

                        <div className="form-group">
                            <label>Oyun Adı *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="örn: The Last of Us Part II"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Açıklama</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Oyun hakkında kısa açıklama..."
                                rows="4"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Geliştirici *</label>
                                <input
                                    type="text"
                                    name="developer"
                                    value={formData.developer}
                                    onChange={handleInputChange}
                                    placeholder="örn: Naughty Dog"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Yayıncı</label>
                                <input
                                    type="text"
                                    name="publisher"
                                    value={formData.publisher}
                                    onChange={handleInputChange}
                                    placeholder="örn: Sony Interactive"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Çıkış Tarihi</label>
                            <input
                                type="date"
                                name="releaseDate"
                                value={formData.releaseDate}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    {/* Platforms */}
                    <div className="form-section">
                        <h4>Platformlar *</h4>
                        <div className="checkbox-grid">
                            {availablePlatforms.map(platform => (
                                <label key={platform} className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.platforms.includes(platform)}
                                        onChange={() => togglePlatform(platform)}
                                    />
                                    <span>{platform}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Genres */}
                    <div className="form-section">
                        <h4>Türler *</h4>
                        <div className="checkbox-grid">
                            {availableGenres.map(genre => (
                                <label key={genre} className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.genres.includes(genre)}
                                        onChange={() => toggleGenre(genre)}
                                    />
                                    <span>{genre}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Media */}
                    <div className="form-section">
                        <h4>Medya</h4>

                        <div className="form-group">
                            <label>Kapak Görseli URL</label>
                            <input
                                type="url"
                                name="coverImage"
                                value={formData.coverImage}
                                onChange={handleInputChange}
                                placeholder="https://example.com/cover.jpg"
                            />
                            <small className="form-hint">
                                Boş bırakırsanız otomatik placeholder oluşturulur
                            </small>
                        </div>

                        <div className="form-group">
                            <label>Video URL (YouTube, Vimeo, vb.)</label>
                            <input
                                type="url"
                                name="videoUrl"
                                value={formData.videoUrl}
                                onChange={handleInputChange}
                                placeholder="https://youtube.com/watch?v=..."
                            />
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
                            {loading ? 'Ekleniyor...' : '✓ Oyunu Ekle'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddGameForm;
