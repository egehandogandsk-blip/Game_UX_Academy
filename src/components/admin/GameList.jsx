import React, { useState } from 'react';
import AddGameForm from './AddGameForm';
import EditGameForm from './EditGameForm';
import ImportGameForm from './ImportGameForm';
import { dbOperations } from '../../database/schema';
import './AdminPanel.css';

const GameList = ({ games, onDataChange }) => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedGame, setSelectedGame] = useState(null);

    const handleAddGame = () => {
        setShowAddModal(true);
    };

    const handleEditGame = (game) => {
        setSelectedGame(game);
        setShowEditModal(true);
    };

    const handleDeleteGame = (game) => {
        setSelectedGame(game);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!selectedGame) return;

        try {
            await dbOperations.delete('games', selectedGame.id);
            setShowDeleteConfirm(false);
            setSelectedGame(null);

            if (onDataChange) {
                onDataChange();
            }
        } catch (error) {
            console.error('Error deleting game:', error);
            alert('Oyun silinirken bir hata oluştu');
        }
    };

    const handleDataChange = () => {
        if (onDataChange) {
            onDataChange();
        }
    };

    return (
        <div className="admin-section">
            <div className="section-header">
                <h2>Oyunlar ({games.length})</h2>
                <div className="header-actions">
                    <button className="btn btn-secondary" onClick={() => setShowImportModal(true)}>
                        🔗 RAWG'den İçe Aktar
                    </button>
                    <button className="btn btn-primary" onClick={handleAddGame}>
                        + Manuel Ekle
                    </button>
                </div>
            </div>

            {games.length === 0 ? (
                <div className="placeholder-content">
                    <p>🎮 Henüz oyun eklenmemiş</p>
                    <div className="placeholder-actions">
                        <button className="btn btn-secondary" onClick={() => setShowImportModal(true)}>
                            🔗 RAWG'den içe aktar
                        </button>
                        <button className="btn btn-primary" onClick={handleAddGame}>
                            Manuel ekle
                        </button>
                    </div>
                </div>
            ) : (
                <div className="game-grid">
                    {games.map(game => (
                        <div key={game.id} className="game-card">
                            <div className="game-card-visual">
                                <div className="game-icon-large">🎮</div>
                                {
                                    (game.coverImage || game.thumbnail) && (
                                        <img
                                            src={game.coverImage || game.thumbnail}
                                            alt={game.name || game.title}
                                            className="real-game-image"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    )}
                            </div>
                            <div className="game-card-content">
                                <h3>{game.name || game.title}</h3>
                                <p className="developer">{game.developer || 'Unknown Developer'}</p>

                                <div className="game-tags">
                                    {game.genres && game.genres.slice(0, 2).map((genre, i) => (
                                        <span key={i} className="tag tag-genre">{genre}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="game-actions-footer">
                                <button
                                    className="btn-icon"
                                    title="Düzenle"
                                    onClick={() => handleEditGame(game)}
                                >
                                    ✏️
                                </button>
                                <button
                                    className="btn-icon btn-danger"
                                    title="Sil"
                                    onClick={() => handleDeleteGame(game)}
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Game Modal */}
            {showAddModal && (
                <AddGameForm
                    onClose={() => setShowAddModal(false)}
                    onSuccess={handleDataChange}
                />
            )}

            {/* Edit Game Modal */}
            {showEditModal && selectedGame && (
                <EditGameForm
                    game={selectedGame}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedGame(null);
                    }}
                    onSuccess={handleDataChange}
                />
            )}

            {/* Import Game Modal */}
            {showImportModal && (
                <ImportGameForm
                    onClose={() => setShowImportModal(false)}
                    onSuccess={handleDataChange}
                />
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && selectedGame && (
                <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>⚠️ Oyunu Sil</h3>
                            <button className="modal-close" onClick={() => setShowDeleteConfirm(false)}>✕</button>
                        </div>

                        <div className="modal-body">
                            <p>
                                <strong>{selectedGame.name || selectedGame.title}</strong> oyununu silmek istediğinizden emin misiniz?
                            </p>
                            <p className="warning-text">
                                Bu işlem geri alınamaz!
                            </p>
                        </div>

                        <div className="modal-footer">
                            <button
                                className="btn btn-secondary"
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setSelectedGame(null);
                                }}
                            >
                                İptal
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={confirmDelete}
                            >
                                🗑️ Sil
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GameList;
