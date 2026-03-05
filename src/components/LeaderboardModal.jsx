import React, { useState, useEffect } from 'react';
import { dbOperations } from '../database/schema';
import { useAuth } from '../contexts/AuthContext';
import { seedLeaderboardUsers } from '../utils/demoData';
import './LeaderboardModal.css';

const LeaderboardModal = ({ onClose }) => {
    const [leaders, setLeaders] = useState([]);
    const [currentUserRank, setCurrentUserRank] = useState(null);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();

    useEffect(() => {
        const fetchLeaders = async () => {
            try {
                // Ensure demo users are seeded
                await seedLeaderboardUsers();

                const users = await dbOperations.getAll('users');
                // Sort users by XP descending
                const sortedUsers = users.sort((a, b) => (b.xp || 0) - (a.xp || 0));

                // Add rank to each user
                const rankedUsers = sortedUsers.map((user, index) => ({
                    ...user,
                    rank: index + 1
                }));

                setLeaders(rankedUsers.slice(0, 10)); // Top 10

                // Find current user's rank
                if (currentUser) {
                    const userRank = rankedUsers.find(u => u.email === currentUser.email);
                    if (userRank) {
                        setCurrentUserRank(userRank);
                    }
                }
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaders();
    }, [currentUser]);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content leaderboard-modal" onClick={e => e.stopPropagation()}>
                <div className="leaderboard-glass-container">
                    <div className="modal-header">
                        <div className="header-title-group">
                            <span className="header-icon">🏆</span>
                            <div>
                                <h2>Leaderboard</h2>
                                <p className="subtitle">Top Architects of the Community</p>
                            </div>
                        </div>
                        <button className="close-btn" onClick={onClose}>&times;</button>
                    </div>

                    <div className="leaderboard-body">
                        {loading ? (
                            <div className="leaderboard-loading">
                                <div className="spinner"></div>
                                <span>Calculating Ranks...</span>
                            </div>
                        ) : (
                            <div className="leaderboard-list">
                                <div className="leaderboard-header-row">
                                    <span className="rank-col">RANK</span>
                                    <span className="user-col">DESIGNER</span>
                                    <span className="level-col">LVL</span>
                                    <span className="xp-col">TOTAL XP</span>
                                </div>

                                <div className="scroll-area">
                                    {leaders.map((user) => (
                                        <div
                                            key={user.id}
                                            className={`leaderboard-row rank-${user.rank} ${user.email === currentUser?.email ? 'is-self' : ''}`}
                                        >
                                            <div className="rank-badge">
                                                {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : user.rank}
                                            </div>
                                            <div className="user-col">
                                                <div className="leader-photo">
                                                    {user.profilePhoto || user.photoURL ? (
                                                        <img src={user.profilePhoto || user.photoURL} alt="" />
                                                    ) : (
                                                        <span className="photo-init">{(user.fullName || user.username)?.[0]?.toUpperCase() || '👤'}</span>
                                                    )}
                                                </div>
                                                <div className="leader-info">
                                                    <span className="leader-name">{user.fullName || user.username}</span>
                                                    <span className="leader-role">{user.workField || 'GDA Member'}</span>
                                                </div>
                                            </div>
                                            <span className="level-col">{user.level || 1}</span>
                                            <span className="xp-col">
                                                <span className="xp-value">{(user.xp || 0).toLocaleString()}</span>
                                                <span className="xp-unit">XP</span>
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {currentUserRank && currentUserRank.rank > 10 && (
                                    <>
                                        <div className="leaderboard-divider">
                                            <span>YOUR POSITION</span>
                                        </div>
                                        <div className="leaderboard-row is-self personal-rank">
                                            <div className="rank-badge">{currentUserRank.rank}</div>
                                            <div className="user-col">
                                                <div className="leader-photo">
                                                    {currentUserRank.profilePhoto || currentUserRank.photoURL ? (
                                                        <img src={currentUserRank.profilePhoto || currentUserRank.photoURL} alt="" />
                                                    ) : (
                                                        <span className="photo-init">{(currentUserRank.fullName || currentUserRank.username)?.[0]?.toUpperCase() || '👤'}</span>
                                                    )}
                                                </div>
                                                <div className="leader-info">
                                                    <span className="leader-name">You (Current User)</span>
                                                    <span className="leader-role">{currentUserRank.workField || 'Design Associate'}</span>
                                                </div>
                                            </div>
                                            <span className="level-col">{currentUserRank.level || 1}</span>
                                            <span className="xp-col">
                                                <span className="xp-value">{(currentUserRank.xp || 0).toLocaleString()}</span>
                                                <span className="xp-unit">XP</span>
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeaderboardModal;
