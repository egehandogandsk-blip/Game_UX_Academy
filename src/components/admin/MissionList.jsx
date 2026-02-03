import React, { useState } from 'react';
import AddMissionForm from './AddMissionForm';
import AIMissionGenerator from './AIMissionGenerator';
import { dbOperations } from '../../database/schema';
import './AdminPanel.css';

const MissionList = ({ missions, onDataChange }) => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showAIModal, setShowAIModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedMission, setSelectedMission] = useState(null);

    const handleDeleteMission = (mission) => {
        setSelectedMission(mission);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!selectedMission) return;

        try {
            await dbOperations.delete('missions', selectedMission.id);
            setShowDeleteConfirm(false);
            setSelectedMission(null);

            if (onDataChange) {
                onDataChange();
            }
        } catch (error) {
            console.error('Error deleting mission:', error);
            alert('Görev silinirken bir hata oluştu');
        }
    };

    return (
        <div className="admin-section">
            <div className="section-header">
                <h2>Görevler ({missions.length})</h2>
                <div className="header-actions">
                    <button className="btn btn-secondary" onClick={() => setShowAIModal(true)}>
                        🤖 AI ile Oluştur
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                        + Manuel Ekle
                    </button>
                </div>
            </div>

            {missions.length === 0 ? (
                <div className="placeholder-content">
                    <p>🎯 Henüz görev eklenmemiş</p>
                    <div className="placeholder-actions">
                        <button className="btn btn-secondary" onClick={() => setShowAIModal(true)}>
                            🤖 AI ile oluştur
                        </button>
                        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                            Manuel ekle
                        </button>
                    </div>
                </div>
            ) : (
                <div className="mission-grid">
                    {missions.map(mission => (
                        <div key={mission.id} className="mission-card">
                            <div className="mission-card-header">
                                <span className="mission-game">
                                    🎮 {mission.game?.title || mission.game?.name || 'Unknown Game'}
                                </span>
                                <span className={`badge badge-${mission.difficulty?.toLowerCase()}`}>
                                    {mission.difficulty}
                                </span>
                            </div>

                            <div className="mission-card-body">
                                <h4>{mission.type}</h4>
                                <p className="mission-desc-truncate">{mission.description}</p>
                            </div>

                            <div className="mission-card-footer">
                                <div className="mission-stats">
                                    <span>⚡ {mission.xp} XP</span>
                                    <span>⏱️ {mission.estimatedTime}</span>
                                </div>
                                <button
                                    className="btn-icon btn-danger"
                                    title="Görevi Sil"
                                    onClick={() => handleDeleteMission(mission)}
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Mission Modal */}
            {showAddModal && (
                <AddMissionForm
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        setShowAddModal(false);
                        if (onDataChange) onDataChange();
                    }}
                />
            )}

            {/* AI Mission Generator Modal */}
            {showAIModal && (
                <AIMissionGenerator
                    onClose={() => setShowAIModal(false)}
                    onSuccess={() => {
                        setShowAIModal(false);
                        if (onDataChange) onDataChange();
                    }}
                />
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && selectedMission && (
                <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>⚠️ Görevi Sil</h3>
                            <button className="modal-close" onClick={() => setShowDeleteConfirm(false)}>✕</button>
                        </div>

                        <div className="modal-body">
                            <p>
                                <strong>{selectedMission.title}</strong> görevini silmek istediğinizden emin misiniz?
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
                                    setSelectedMission(null);
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

export default MissionList;
