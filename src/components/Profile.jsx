import React, { useState, useEffect } from 'react';
import { dbOperations } from '../database/schema';
import { badgedata } from '../data/badges';
import './Profile.css';

const Profile = ({ userId }) => {
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(null);
    const [completedMissions, setCompletedMissions] = useState([]);
    const [feedbacks, setFeedbacks] = useState([]);
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

    const softwareOptions = [
        'Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator',
        'After Effects', 'Unity', 'Unreal Engine', 'Blender',
        'InVision', 'Principle', 'Framer'
    ];

    const loadUserData = async () => {
        try {
            const users = await dbOperations.getAll('users');
            const userData = users.find(u => u.id === userId);
            setUser(userData);
            setEditData(userData);

            // Load completed missions (submissions with status 'completed')
            const submissions = await dbOperations.getAll('submissions');
            const userSubmissions = submissions.filter(s => s.userId === userId);
            setCompletedMissions(userSubmissions);

            // Load feedback
            const allFeedback = await dbOperations.getAll('ai_feedback');
            const userFeedback = allFeedback.filter(f =>
                userSubmissions.some(s => s.id === f.submissionId)
            );
            setFeedbacks(userFeedback);

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
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Error updating profile. Please try again.');
        }
    };

    // Photo upload handlers
    const handleCoverPhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                alert('File size must be less than 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setEditData({
                    ...editData,
                    coverPhoto: reader.result
                });
            };
            reader.readAsDataURL(file);
        }
    };

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

    const toggleSoftware = (software) => {
        const currentSoftware = editData.favoriteSoftware || [];
        const newSoftware = currentSoftware.includes(software)
            ? currentSoftware.filter(s => s !== software)
            : [...currentSoftware, software];

        setEditData({
            ...editData,
            favoriteSoftware: newSoftware
        });
    };

    if (loading) {
        return (
            <div className="profile-loading">
                <div className="loading-spinner"></div>
                <p>Loading profile...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="profile-error">
                <p>User not found</p>
            </div>
        );
    }

    const displayData = isEditing ? editData : user;

    return (
        <div className="profile-container">
            {/* Edit/Save Controls */}
            <div className="profile-controls">
                {!isEditing ? (
                    <button className="btn-edit-profile" onClick={handleEdit}>
                        ✏️ Edit Profile
                    </button>
                ) : (
                    <div className="edit-controls">
                        <button className="btn btn-secondary" onClick={handleCancel}>
                            Cancel
                        </button>
                        <button className="btn btn-primary" onClick={handleSave}>
                            💾 Save Changes
                        </button>
                    </div>
                )}
            </div>

            {/* Cover Photo */}
            <div className="profile-cover">
                {displayData.coverPhoto ? (
                    <img src={displayData.coverPhoto} alt="Cover" />
                ) : (
                    <div className="cover-placeholder">
                        <span>📷</span>
                        {isEditing && <p>Upload a cover photo</p>}
                    </div>
                )}
                {isEditing && (
                    <div className="cover-upload">
                        <label htmlFor="cover-upload" className="upload-btn">
                            📷 Upload Cover Photo
                            <input
                                id="cover-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleCoverPhotoUpload}
                                style={{ display: 'none' }}
                            />
                        </label>
                        {editData.coverPhoto && (
                            <button
                                className="remove-btn"
                                onClick={() => setEditData({ ...editData, coverPhoto: '' })}
                            >
                                ✕ Remove
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Profile Header */}
            <div className="profile-header">
                <div className="profile-photo-container">
                    {displayData.profilePhoto ? (
                        <img src={displayData.profilePhoto} alt="Profile" className="profile-photo" />
                    ) : (
                        <div className="profile-photo-placeholder">
                            <span>👤</span>
                        </div>
                    )}
                    {isEditing && (
                        <div className="photo-upload-controls">
                            <label htmlFor="profile-upload" className="upload-btn upload-btn-small">
                                📷 Upload Photo
                                <input
                                    id="profile-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleProfilePhotoUpload}
                                    style={{ display: 'none' }}
                                />
                            </label>
                            {editData.profilePhoto && (
                                <button
                                    className="remove-btn remove-btn-small"
                                    onClick={() => setEditData({ ...editData, profilePhoto: '' })}
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className="profile-info">
                    {isEditing ? (
                        <input
                            type="text"
                            className="input profile-name-input"
                            value={editData.fullName || ''}
                            onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                            placeholder="Your full name"
                        />
                    ) : (
                        <h1 className="profile-name">{displayData.fullName || 'Anonymous User'}</h1>
                    )}

                    <div className="profile-badges">
                        <span className="badge badge-work">{displayData.workField || 'Designer'}</span>
                        <span className="badge badge-level">Level {displayData.level || 1}</span>
                        <span className="badge badge-xp">{displayData.xp || 0} XP</span>
                    </div>

                    {isEditing ? (
                        <textarea
                            className="input bio-input"
                            value={editData.bio || ''}
                            onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                            placeholder="Tell us about yourself..."
                            rows="3"
                        />
                    ) : displayData.bio ? (
                        <p className="profile-bio">{displayData.bio}</p>
                    ) : (
                        <p className="profile-bio-empty">No bio yet</p>
                    )}
                </div>
            </div>

            {user?.badges && user.badges.length > 0 && (
                <div className="profile-latest-badges">
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
                </div>
            )}

            {/* BADGE COLLECTION - FULL GRID */}
            <div className="profile-section">
                <h2>🏆 Badge Collection ({user?.badges?.length || 0}/50)</h2>
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
            </div>

            {/* Settings Section - Only visible in edit mode */}
            {isEditing && (
                <div className="profile-section settings-section">
                    <h2>⚙️ Account Settings</h2>

                    <div className="settings-grid">
                        {/* Account Information */}
                        <div className="settings-group">
                            <h3 className="settings-group-title">👤 Account Information</h3>
                            <div className="setting-item">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    className="input"
                                    value={editData.email || ''}
                                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                    placeholder="your.email@example.com"
                                />
                            </div>
                            <div className="setting-item">
                                <label>Username</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={editData.username || ''}
                                    onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                                    placeholder="Your username"
                                />
                            </div>
                        </div>

                        {/* Career Information */}
                        <div className="settings-group">
                            <h3 className="settings-group-title">💼 Career Information</h3>
                            <div className="setting-item">
                                <label>Work Field</label>
                                <select
                                    className="input"
                                    value={editData.workField || ''}
                                    onChange={(e) => setEditData({ ...editData, workField: e.target.value })}
                                >
                                    <option value="">Select your field...</option>
                                    <option value="Game UI Designer">Game UI Designer</option>
                                    <option value="Game UX Designer">Game UX Designer</option>
                                    <option value="Game Designer">Game Designer</option>
                                    <option value="UI/UX Developer">UI/UX Developer</option>
                                    <option value="Student">Student</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="setting-item">
                                <label>GDA Education</label>
                                <div className="toggle-group-inline">
                                    <button
                                        type="button"
                                        className={`toggle-option ${!editData.hasGDAEducation ? 'active' : ''}`}
                                        onClick={() => setEditData({ ...editData, hasGDAEducation: false })}
                                    >
                                        No
                                    </button>
                                    <button
                                        type="button"
                                        className={`toggle-option ${editData.hasGDAEducation ? 'active' : ''}`}
                                        onClick={() => setEditData({ ...editData, hasGDAEducation: true })}
                                    >
                                        Yes
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Privacy & Preferences */}
                        <div className="settings-group">
                            <h3 className="settings-group-title">🔒 Privacy & Preferences</h3>
                            <div className="setting-item">
                                <label>Profile Visibility</label>
                                <select className="input">
                                    <option value="public">Public</option>
                                    <option value="private">Private</option>
                                    <option value="friends">Friends Only</option>
                                </select>
                            </div>
                            <div className="setting-item">
                                <label>Email Notifications</label>
                                <div className="toggle-group-inline">
                                    <button type="button" className="toggle-option active">On</button>
                                    <button type="button" className="toggle-option">Off</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Social Links */}
            <div className="profile-section">
                <h2>🔗 Social Links</h2>
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
                {!isEditing && !socialPlatforms.some(p => displayData.socialLinks?.[p.key]) && (
                    <p className="section-empty">No social links added yet</p>
                )}
            </div>

            {/* Favorite Software */}
            <div className="profile-section">
                <h2>🛠️ Favorite Software</h2>
                <div className="software-grid">
                    {isEditing ? (
                        softwareOptions.map(software => (
                            <button
                                key={software}
                                className={`software-tag ${(editData.favoriteSoftware || []).includes(software) ? 'active' : ''}`}
                                onClick={() => toggleSoftware(software)}
                            >
                                {software}
                            </button>
                        ))
                    ) : (displayData.favoriteSoftware || []).length > 0 ? (
                        (displayData.favoriteSoftware || []).map(software => (
                            <span key={software} className="software-tag active">
                                {software}
                            </span>
                        ))
                    ) : (
                        <p className="section-empty">No software selected yet</p>
                    )}
                </div>
            </div>

            {/* Completed Missions */}
            <div className="profile-section">
                <h2>✅ Completed Missions ({completedMissions.length})</h2>
                {completedMissions.length > 0 ? (
                    <div className="missions-grid">
                        {completedMissions.map(mission => (
                            <div key={mission.id} className="mission-card-mini">
                                <div className="mission-score">{mission.score || 'N/A'}</div>
                                <div className="mission-details">
                                    <h4>{mission.missionTitle || 'Case Study'}</h4>
                                    <p>{new Date(mission.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="section-empty">No completed missions yet. Start your first case study!</p>
                )}
            </div>

            {/* Feedback & Scores */}
            <div className="profile-section">
                <h2>💬 AI Feedback & Scores</h2>
                {feedbacks.length > 0 ? (
                    <div className="feedback-list">
                        {feedbacks.slice(0, 5).map((feedback, index) => (
                            <div key={index} className="feedback-item">
                                <div className="feedback-score">
                                    Score: {feedback.overallScore || 'N/A'}/10
                                </div>
                                <div className="feedback-preview">
                                    {feedback.summary || 'Feedback available'}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="section-empty">No feedback received yet</p>
                )}
            </div>
        </div>
    );
};

export default Profile;
