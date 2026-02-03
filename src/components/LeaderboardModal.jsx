import React from 'react';
import '../App.css';

const LeaderboardModal = ({ onClose }) => {
    // Dummy Data for proper leaderboard visualization
    const leaders = [
        { rank: 1, name: 'CyberNinja', xp: 15420, level: 42, avatar: '🥷' },
        { rank: 2, name: 'PixelMaster', xp: 14200, level: 38, avatar: '🎨' },
        { rank: 3, name: 'UX_Wizard', xp: 13850, level: 36, avatar: '🧙‍♂️' },
        { rank: 4, name: 'DesignBot', xp: 12100, level: 32, avatar: '🤖' },
        { rank: 5, name: 'CreativeSoul', xp: 11500, level: 30, avatar: '✨' },
    ];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content leaderboard-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>🏆 Leaderboard</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="leaderboard-list">
                    <div className="leaderboard-header-row">
                        <span className="rank-col">#</span>
                        <span className="user-col">User</span>
                        <span className="level-col">Lvl</span>
                        <span className="xp-col">XP</span>
                    </div>

                    {leaders.map((user) => (
                        <div key={user.rank} className={`leaderboard-row rank-${user.rank}`}>
                            <span className="rank-col">{user.rank}</span>
                            <div className="user-col">
                                <span className="leader-avatar">{user.avatar}</span>
                                <span className="leader-name">{user.name}</span>
                            </div>
                            <span className="level-col">{user.level}</span>
                            <span className="xp-col">{user.xp.toLocaleString()}</span>
                        </div>
                    ))}

                    <div className="leaderboard-divider"></div>

                    {/* User's own rank (mock) */}
                    <div className="leaderboard-row current-user-rank">
                        <span className="rank-col">142</span>
                        <div className="user-col">
                            <span className="leader-avatar">👤</span>
                            <span className="leader-name">You</span>
                        </div>
                        <span className="level-col">12</span>
                        <span className="xp-col">4,250</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeaderboardModal;
