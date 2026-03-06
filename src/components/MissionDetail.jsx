import React, { useState } from 'react';
import { MissionManager } from '../utils/missionManager.js';
import Carousel from './Carousel';
import { useT } from '../contexts/LanguageContext';
import './MissionDetail.css';

const MissionDetail = ({ mission, userId, onClose, onAccept }) => {
    const t = useT();
    const [accepting, setAccepting] = useState(false);

    const handleAccept = async () => {
        setAccepting(true);
        const result = await MissionManager.acceptMission(userId, mission.id);
        setAccepting(false);

        if (result.success) {
            if (onAccept) onAccept(result.mission);
            onClose();
        } else {
            alert(result.message || result.error || t('error'));
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
                        <h3>{t('gameAndRefVisuals')}</h3>
                        <p className="mission-reference-desc">
                            Original {mission.uiType} from {mission.game?.title}
                        </p>

                        {/* Improved Image Logic: Prioritize Game Cover/Thumbnail */}
                        {(() => {
                            const images = [
                                mission.game?.thumbnail,
                                mission.game?.coverImage
                            ].filter(url => url && typeof url === 'string');

                            if (images.length > 0) {
                                return (
                                    <div className="mission-reference-image">
                                        <img
                                            src={images[0]}
                                            alt={`${mission.game?.title} ${mission.uiType}`}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.parentElement.innerHTML = `<div class="mission-no-reference">${t('imageNotAvailable')}</div>`;
                                            }}
                                        />
                                    </div>
                                );
                            } else {
                                return (
                                    <div className="mission-no-reference">
                                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎮</div>
                                        <div>{t('noImagesAvailable')}</div>
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
                                {t(mission.difficulty)}
                            </div>
                        </div>

                        <div className="mission-detail-meta">
                            <div className="mission-detail-meta-item">
                                <span className="meta-icon">⚡</span>
                                <span className="meta-label">{t('reward')}</span>
                                <span className="meta-value">{mission.xp} XP</span>
                            </div>
                            <div className="mission-detail-meta-item">
                                <span className="meta-icon">⏱️</span>
                                <span className="meta-label">{t('time')}</span>
                                <span className="meta-value">{mission.estimatedTime}</span>
                            </div>
                            <div className="mission-detail-meta-item">
                                <span className="meta-icon">🎯</span>
                                <span className="meta-label">{t('type')}</span>
                                <span className="meta-value">{mission.uiType}</span>
                            </div>
                        </div>

                        <div className="mission-description">
                            <h3>{t('missionBrief')}</h3>
                            <p>{mission.description}</p>
                        </div>

                        <div className="mission-requirements">
                            <h3>{t('requirements')}</h3>
                            <ul>
                                {mission.requirements?.map((req, index) => (
                                    <li key={index}>{req}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="mission-deliverables">
                            <h3>{t('expectedDeliverables')}</h3>
                            <ul>
                                <li>{t('deliverable1')}</li>
                                <li>{t('deliverable2')}</li>
                                <li>{t('deliverable3')}</li>
                            </ul>
                        </div>

                        <div className="mission-detail-actions">
                            <button
                                className="btn btn-secondary"
                                onClick={onClose}
                            >
                                {t('cancel')}
                            </button>
                            <button
                                className="btn btn-primary btn-lg"
                                onClick={handleAccept}
                                disabled={accepting}
                            >
                                {accepting ? t('accepting') : `${t('acceptMission')} →`}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MissionDetail;
