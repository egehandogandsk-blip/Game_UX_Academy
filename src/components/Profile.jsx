import React, { useState, useEffect } from 'react';
import { dbOperations } from '../database/schema';
import { MissionManager } from '../utils/missionManager.js';
import { analyzeSubmission } from '../utils/AIAnalysisService.js';
import SubmissionForm from './SubmissionForm';
import AnalysisResultModal from './AnalysisResultModal';
import { motion, AnimatePresence } from 'framer-motion';
import { badgedata } from '../data/badges';
import { useT } from '../contexts/LanguageContext';
import './Profile.styles.css';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: "spring", stiffness: 100, damping: 20 }
    }
};

const Profile = ({ userId }) => {
    const t = useT();
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(null);

    // Mission States
    const [activeMissions, setActiveMissions] = useState([]);
    const [completedMissions, setCompletedMissions] = useState([]);

    // Modals
    const [showSubmissionForm, setShowSubmissionForm] = useState(false);
    const [currentMissionToSubmit, setCurrentMissionToSubmit] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [analyzingSubmission, setAnalyzingSubmission] = useState(null); // The submission being analyzed

    const [loading, setLoading] = useState(true);

    // Social platform metadata
    const socialPlatforms = [
        { key: 'behance', label: 'Behance', icon: '🎨', baseUrl: 'https://behance.net/' },
        { key: 'artstation', label: 'ArtStation', icon: '🖼️', baseUrl: 'https://artstation.com/' },
        { key: 'linkedin', label: 'LinkedIn', icon: '💼', baseUrl: 'https://linkedin.com/in/' },
        { key: 'instagram', label: 'Instagram', icon: '📸', baseUrl: 'https://instagram.com/' },
        { key: 'facebook', label: 'Facebook', icon: '📘', baseUrl: 'https://facebook.com/' },
        { key: 'github', label: 'GitHub', icon: '💻', baseUrl: 'https://github.com/' },
        { key: 'reddit', label: 'Reddit', icon: '🤖', baseUrl: 'https://reddit.com/user/' },
        { key: 'xboxProfile', label: 'Xbox', icon: '🎮', baseUrl: 'https://xbox.com/' },
        { key: 'steamProfile', label: 'Steam', icon: '🎮', baseUrl: 'https://steamcommunity.com/id/' },
        { key: 'epicProfile', label: 'Epic Games', icon: '🎮', baseUrl: 'https://epicgames.com/' },
        { key: 'twitter', label: 'X (Twitter)', icon: '🐦', baseUrl: 'https://x.com/' },
        { key: 'medium', label: 'Medium', icon: '✍️', baseUrl: 'https://medium.com/@' }
    ];

    const loadUserData = async () => {
        try {
            const users = await dbOperations.getAll('users');
            const userData = users.find(u => u.id === userId);
            setUser(userData);
            setEditData(userData);

            // Load Active Missions
            const active = await MissionManager.getActiveMissions(userId);
            setActiveMissions(active);

            // Load Completed Missions
            const submissions = await dbOperations.getAll('submissions');
            const userSubmissions = submissions.filter(s => s.userId === userId && s.status === 'completed');
            setCompletedMissions(userSubmissions);

            setLoading(false);
        } catch (error) {
            console.error('Error loading user data:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUserData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const handleEdit = () => {
        setIsEditing(true);
        setEditData({ ...user });
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditData({ ...user });
    };

    const handleSave = async () => {
        try {
            await dbOperations.update('users', userId, editData);
            setUser(editData);
            setIsEditing(false);
            alert(t('profileUpdated'));
        } catch (error) {
            console.error('Error updating profile:', error);
            alert(t('error'));
        }
    };

    // Submission Handlers
    const openSubmissionForm = (mission) => {
        setCurrentMissionToSubmit(mission);
        setShowSubmissionForm(true);
    };

    const handleSubmission = async (submissionData) => {
        // 1. Trigger AI Notification logic (Mock)
        if (window.triggerAIAssistant) {
            window.triggerAIAssistant('submission_processing');
        }

        // 2. Perform Analysis
        const analysis = await analyzeSubmission(submissionData);
        setAnalysisResult(analysis);

        // Store submission details temporarily to complete later
        setAnalyzingSubmission({
            mission: currentMissionToSubmit,
            data: submissionData,
            analysis: analysis
        });

        // 3. Notify User
        if (window.triggerAIAssistant) {
            window.triggerAIAssistant('analysis_ready', {
                score: analysis.score,
                onClick: () => {
                    setAnalysisResult(analysis);
                    setShowSubmissionForm(false); // Close submission form when showing result
                }
            });
        }
    };

    const completeMission = async () => {
        if (!analyzingSubmission) return;

        try {
            const { mission, data, analysis } = analyzingSubmission;

            // Save Submission to DB
            const submissionRecord = {
                userId,
                missionId: mission.id,
                missionTitle: mission.type, // or mission.title if available
                gameTitle: mission.game?.title,
                images: data.images,
                link: data.link,
                description: data.description,
                status: 'completed',
                score: analysis.score,
                analysisSummary: analysis.summary,
                submittedAt: new Date().toISOString()
            };

            const subResult = await MissionManager.submitMission(userId, mission.id, submissionRecord);

            if (subResult.success) {
                // Save Detailed Feedback
                await dbOperations.add('ai_feedback', {
                    submissionId: subResult.id,
                    overallScore: analysis.score,
                    heatmapData: analysis.heatmapData,
                    feedback: analysis.feedback,
                    createdAt: new Date().toISOString()
                });

                // Update User XP
                const newXp = (user.xp || 0) + (mission.xp || 100);
                await dbOperations.update('users', userId, { ...user, xp: newXp });

                // Refresh Data
                await loadUserData();

                // Close Modals
                setAnalysisResult(null);
                setAnalyzingSubmission(null);
                alert(`${t('missionCompleted')}! +${mission.xp || 100} XP Earned! 🚀`);
            }
        } catch (error) {
            console.error("Completion Error", error);
            alert(t('error'));
        }
    };

    // Photo upload handlers
    const handleProfilePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                alert('File size must be less than 2MB');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setEditData({
                    ...editData,
                    profilePhoto: reader.result
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSocialLinkChange = (platform, value) => {
        setEditData({
            ...editData,
            socialLinks: {
                ...editData.socialLinks,
                [platform]: value
            }
        });
    };

    if (loading) {
        return (
            <div className="profile-loading">
                <div className="loading-spinner"></div>
                <p>{t('loading')}</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="profile-error">
                <p>{t('noResults')}</p>
            </div>
        );
    }

    const displayData = isEditing ? editData : user;

    return (
        <motion.div
            className="profile-container"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >

            {/* Profile Header Area */}
            <motion.div className="profile-header-wrapper" variants={itemVariants}>
                {/* Clean Profile Card */}
                <div className="profile-glass-card glass-strong">
                    {/* Header Controls Inside Card */}
                    <div className="profile-card-controls">
                        {!isEditing ? (
                            <button className="btn-edit-profile-mini" onClick={handleEdit}>
                                ✏️ {t('edit')}
                            </button>
                        ) : (
                            <div className="edit-controls-mini">
                                <button className="btn-glass-secondary" onClick={handleCancel}>
                                    {t('cancel')}
                                </button>
                                <button className="btn-glass-primary" onClick={handleSave}>
                                    💾 {t('save')}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="profile-photo-wrapper">
                        <div className="profile-photo-container">
                            {displayData.profilePhoto ? (
                                <img src={displayData.profilePhoto} alt="Profile" className="profile-photo" />
                            ) : (
                                <div className="profile-photo-placeholder">
                                    <span>{displayData.fullName?.[0]?.toUpperCase() || '👤'}</span>
                                </div>
                            )}
                            {isEditing && (
                                <label htmlFor="profile-upload" className="photo-upload-trigger">
                                    📸
                                    <input
                                        id="profile-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleProfilePhotoUpload}
                                        style={{ display: 'none' }}
                                    />
                                </label>
                            )}
                        </div>
                        {user?.subscriptionTier && user.subscriptionTier !== 'Free' && (
                            <div className="tier-badge-floating" title={user.subscriptionTier}>
                                ★
                            </div>
                        )}
                    </div>

                    <div className="profile-main-info">
                        <div className="profile-name-row">
                            {isEditing ? (
                                <input
                                    type="text"
                                    className="input profile-name-input"
                                    value={editData.fullName || ''}
                                    onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                                    placeholder={t('tellUsAboutYou')}
                                />
                            ) : (
                                <h1 className="profile-name">{displayData.fullName || 'Anonymous User'}</h1>
                            )}
                        </div>

                        <div className="profile-badges-row">
                            <span className="premium-badge badge-work">
                                <span className="badge-icon">💼</span>
                                {displayData.workField || 'Designer'}
                            </span>
                            <span className="premium-badge badge-level">
                                <span className="badge-icon">⭐</span>
                                {t('level')} {displayData.level || 1}
                            </span>
                            <span className="premium-badge badge-xp">
                                <span className="badge-icon">⚡</span>
                                {displayData.xp || 0} XP
                            </span>
                        </div>

                        <div className="profile-bio-container">
                            {isEditing ? (
                                <textarea
                                    className="input bio-input"
                                    value={editData.bio || ''}
                                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                                    placeholder={t('bio')}
                                    rows="2"
                                />
                            ) : displayData.bio ? (
                                <p className="profile-bio">{displayData.bio}</p>
                            ) : (
                                <p className="profile-bio-empty">Aspiring Game Industry Professional</p>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

            {user?.badges && user.badges.length > 0 && (
                <motion.div className="profile-latest-badges glass" variants={itemVariants}>
                    <span className="latest-badges-title">Latest:</span>
                    {user.badges.slice(-5).reverse().map(badgeId => {
                        const badge = badgedata.find(b => b.id === badgeId);
                        if (!badge) return null;
                        return (
                            <div key={badgeId} className="badge-pill-small" title={badge.description}>
                                {badge.icon} {badge.name}
                            </div>
                        );
                    })}
                </motion.div>
            )}

            {/* ACTIVE MISSIONS - NEW SECTION */}
            <motion.div className="profile-section active-missions-section" variants={itemVariants}>
                <h2>🚀 {t('activeMissions')}</h2>
                {activeMissions.length > 0 ? (
                    <div className="missions-grid">
                        {activeMissions.map(mission => (
                            <div key={mission.id} className="mission-card-active glass-hover">
                                <div className="mission-active-header">
                                    <h4>{mission.type}</h4>
                                    <span className="mission-game-tag">{mission.game?.title}</span>
                                </div>
                                <div className="mission-active-meta">
                                    <span>⏱️ {mission.estimatedTime}</span>
                                    <span>⚡ {mission.xp} XP</span>
                                </div>
                                <button
                                    className="btn btn-primary btn-sm btn-submit-mission"
                                    onClick={() => openSubmissionForm(mission)}
                                >
                                    📤 {t('submitWork')}
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="section-empty">
                        <p>{t('noMissionsAvailable')}</p>
                    </div>
                )}
            </motion.div>

            {/* BADGE COLLECTION - FULL GRID */}
            <motion.div className="profile-section" variants={itemVariants}>
                <h2>🏆 {t('badges')} ({user?.badges?.length || 0}/50)</h2>
                <div className="badge-collection-grid">
                    {badgedata.map(badge => {
                        const isEarned = user?.badges?.includes(badge.id);
                        return (
                            <div key={badge.id} className={`badge-card ${isEarned ? 'earned' : 'locked'}`}>
                                <div className="badge-card-icon">{badge.icon}</div>
                                <div className="badge-card-name">{badge.name}</div>
                                <div className="badge-card-desc">{badge.description}</div>
                            </div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Settings Section - Only visible in edit mode */}
            {isEditing && (
                <motion.div className="profile-section settings-section" variants={itemVariants}>
                    <h2>⚙️ {t('accountSettings')}</h2>
                    <div className="settings-grid">
                        {/* Information Fields... (Same as before) */}
                        <div className="settings-group">
                            <h3 className="settings-group-title">👤 {t('accountInformation')}</h3>
                            <div className="setting-item">
                                <label>{t('emailAddress')}</label>
                                <input
                                    type="email"
                                    className="input"
                                    value={editData.email || ''}
                                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                    placeholder="your.email@example.com"
                                />
                            </div>
                            <div className="setting-item">
                                <label>{t('username')}</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={editData.username || ''}
                                    onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                                    placeholder="Your username"
                                />
                            </div>
                        </div>

                        <div className="settings-group">
                            <h3 className="settings-group-title">💼 {t('careerInformation')}</h3>
                            <div className="setting-item">
                                <label>{t('workField')}</label>
                                <select
                                    className="input"
                                    value={editData.workField || ''}
                                    onChange={(e) => setEditData({ ...editData, workField: e.target.value })}
                                >
                                    <option value="">{t('selectField')}</option>
                                    <option value="Game UI Designer">Game UI Designer</option>
                                    <option value="Game UX Designer">Game UX Designer</option>
                                    <option value="Game Designer">Game Designer</option>
                                    <option value="UI/UX Developer">UI/UX Developer</option>
                                    <option value="Student">Student</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Social Links */}
            <motion.div className="profile-section" variants={itemVariants}>
                <h2>🔗 {t('socialLinks')}</h2>
                <div className="social-links-grid">
                    {socialPlatforms.map(platform => {
                        const hasLink = displayData.socialLinks?.[platform.key];
                        if (!isEditing && !hasLink) return null;
                        return (
                            <div key={platform.key} className="social-link-item">
                                <span className="social-icon">{platform.icon}</span>
                                <span className="social-label">{platform.label}</span>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        className="input social-input"
                                        value={editData.socialLinks?.[platform.key] || ''}
                                        onChange={(e) => handleSocialLinkChange(platform.key, e.target.value)}
                                        placeholder={`Your ${platform.label} username`}
                                    />
                                ) : (
                                    <a
                                        href={`${platform.baseUrl}${hasLink}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="social-link-btn"
                                    >
                                        Visit Profile →
                                    </a>
                                )}
                            </div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Completed Missions */}
            <motion.div className="profile-section" variants={itemVariants}>
                <h2>✅ {t('completedMissions')} ({completedMissions.length})</h2>
                {completedMissions.length > 0 ? (
                    <div className="missions-grid">
                        {completedMissions.map(mission => (
                            <div key={mission.id} className="mission-card-mini">
                                <div className="mission-score">{mission.score || 'N/A'}</div>
                                <div className="mission-details">
                                    <h4>{mission.missionTitle || 'Case Study'}</h4>
                                    <p>{new Date(mission.submittedAt || mission.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="section-empty">{t('noMissionsAvailable')}!</p>
                )}
            </motion.div>

            {/* Modals */}
            {showSubmissionForm && currentMissionToSubmit && (
                <SubmissionForm
                    mission={currentMissionToSubmit}
                    onCancel={() => setShowSubmissionForm(false)}
                    onSubmitSuccess={handleSubmission}
                />
            )}

            {analysisResult && analyzingSubmission && (
                <AnalysisResultModal
                    result={analysisResult}
                    submission={analyzingSubmission.data}
                    onClose={() => setAnalysisResult(null)}
                    onComplete={completeMission}
                />
            )}
        </motion.div>
    );
};

export default Profile;
