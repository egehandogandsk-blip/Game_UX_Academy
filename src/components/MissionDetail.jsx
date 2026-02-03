import React, { useState } from 'react';
import { MissionManager } from '../utils/missionManager.js';
import Carousel from './Carousel';
import './MissionDetail.css';

const MissionDetail = ({ mission, userId, onClose, onAccept }) => {
    const [accepting, setAccepting] = useState(false);

    const handleAccept = async () => {
        setAccepting(true);
        const result = await MissionManager.acceptMission(userId, mission.id);
        setAccepting(false);

        if (result.success) {
            if (onAccept) onAccept(result.mission);
            onClose();
        } else {
            alert(result.message || 'Failed to accept mission');
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'beginner': return 'var(--gda-success)';
            case 'intermediate': return 'var(--gda-warning)';
            case 'expert': return 'var(--gda-danger)';
            default: return 'var(--gda-text-secondary)';
        }
    };

    return (
        <div className="mission-detail-overlay" onClick={onClose}>
            <div className="mission-detail-modal" onClick={(e) => e.stopPropagation()}>
                <button className="mission-detail-close" onClick={onClose}>
                    ✕
                </button>

                <div className="mission-detail-content">
                    {/* Reference Screenshots */}
                    <div className="mission-reference-section">
                        <h3>Game & Reference Visuals</h3>
                        <p className="mission-reference-desc">
                            Original {mission.uiType} from {mission.game?.title}
                        </p>

                        {/* Improved Image Logic: Prioritize Game Cover/Thumbnail */}
                        {(() => {
                            // User requested to ONLY show game cover/logo and remove placeholders
                            const images = [
                                mission.game?.thumbnail,
                                mission.game?.coverImage
                            ].filter(url => url && typeof url === 'string'); // Filter valid URLs

                            if (images.length > 0) {
                                // Use the first valid image (Thumbnail/Logo)
                                return (
                                    <div className="mission-reference-image">
                                        <img
                                            src={images[0]}
                                            alt={`${mission.game?.title} ${mission.uiType}`}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.parentElement.innerHTML = '<div class="mission-no-reference">Image not available</div>';
                                            }}
                                        />
                                    </div>
                                );
                            } else {
                                return (
                                    <div className="mission-no-reference">
                                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎮</div>
                                        <div>No images available</div>
                                    </div>
                                );
                            }
                        })()}
                    </div>

                    {/* Mission Info */}
                    <div className="mission-info-section">
                        <div className="mission-detail-header">
                            <div>
                                <h2>{mission.type}</h2>
                                <div className="mission-detail-game">{mission.game?.title}</div>
                            </div>
                            <div
                                className="mission-detail-difficulty-badge"
                                style={{ backgroundColor: getDifficultyColor(mission.difficulty) }}
                            >
                                {mission.difficulty}
                            </div>
                        </div>

                        <div className="mission-detail-meta">
                            <div className="mission-detail-meta-item">
                                <span className="meta-icon">⚡</span>
                                <span className="meta-label">Reward:</span>
                                <span className="meta-value">{mission.xp} XP</span>
                            </div>
                            <div className="mission-detail-meta-item">
                                <span className="meta-icon">⏱️</span>
                                <span className="meta-label">Time:</span>
                                <span className="meta-value">{mission.estimatedTime}</span>
                            </div>
                            <div className="mission-detail-meta-item">
                                <span className="meta-icon">🎯</span>
                                <span className="meta-label">Type:</span>
                                <span className="meta-value">{mission.uiType}</span>
                            </div>
                        </div>

                        <div className="mission-description">
                            <h3>Mission Brief</h3>
                            <p>{mission.description}</p>
                        </div>

                        <div className="mission-requirements">
                            <h3>Requirements</h3>
                            <ul>
                                {mission.requirements?.map((req, index) => (
                                    <li key={index}>{req}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="mission-deliverables">
                            <h3>Expected Deliverables</h3>
                            <ul>
                                <li>Design mockups (PNG, JPG, or Figma link)</li>
                                <li>Brief rationale for your design decisions</li>
                                <li>Before/after comparison (if applicable)</li>
                            </ul>
                        </div>

                        <div className="mission-detail-actions">
                            <button
                                className="btn btn-secondary"
                                onClick={onClose}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary btn-lg"
                                onClick={handleAccept}
                                disabled={accepting}
                            >
                                {accepting ? 'Accepting...' : 'Accept Mission →'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MissionDetail;
