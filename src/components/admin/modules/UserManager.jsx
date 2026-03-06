import React, { useState, useEffect } from 'react';
import { dbOperations } from '../../../database/schema';
import { useT } from '../../../contexts/LanguageContext';
import './AdminModules.css';

const UserManager = () => {
    const t = useT();
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState(null);

    const loadUsers = async () => {
        const data = await dbOperations.getAll('users');
        setUsers(data || []);
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleEdit = (user) => {
        setEditingUser({ ...user });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        await dbOperations.update('users', editingUser.id, editingUser);
        setEditingUser(null);
        loadUsers();
    };

    const handleBan = async (user) => {
        if (confirm(`Are you sure you want to ban ${user.username}?`)) {
            const bannedUser = { ...user, isBanned: !user.isBanned };
            await dbOperations.update('users', user.id, bannedUser);
            loadUsers();
        }
    };

    const handleApproveSubscription = async (user) => {
        if (!user.pendingTier) return;

        await dbOperations.update('users', user.id, {
            ...user,
            subscriptionTier: user.pendingTier,
            subscriptionStatus: 'active',
            pendingTier: null
        });

        loadUsers();
    };

    const handleCancelSubscription = async (user) => {
        await dbOperations.update('users', user.id, {
            ...user,
            subscriptionStatus: 'active', // Reset to active (but with current/free tier)
            pendingTier: null
        });

        loadUsers();
    };

    const filteredUsers = users.filter(u =>
        u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="user-manager">
            <h2 className="module-title">User Management</h2>

            <div className="actions-bar">
                <input
                    type="text"
                    placeholder="Search users..."
                    className="search-input"
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="user-list-container">
                <div className="user-list-header">
                    <span>User</span>
                    <span>Role / Tier</span>
                    <span>Status</span>
                    <span>Actions</span>
                </div>
                <div className="user-list-content">
                    {filteredUsers.map(user => (
                        <div key={user.id} className="user-card-row">
                            <div className="user-info-cell">
                                <div className="user-avatar-wrapper">
                                    {user.profilePhoto ? (
                                        <img src={user.profilePhoto} className="admin-avatar-small" alt="" />
                                    ) : (
                                        <div className="user-avatar-placeholder">{user.username?.charAt(0).toUpperCase()}</div>
                                    )}
                                </div>
                                <div className="user-text-details">
                                    <span className="user-name">{user.username}</span>
                                    <span className="user-email">{user.email}</span>
                                </div>
                            </div>

                            <div className="user-meta-cell">
                                <span className="user-level-badge">Lvl {user.level || 1}</span>
                                <span className={`tier-badge ${user.subscriptionTier?.toLowerCase() || 'free'}`}>
                                    {user.subscriptionTier || 'Free'}
                                </span>
                            </div>

                            <div className="user-status-cell">
                                {user.isBanned ? (
                                    <span className="status-badge banned">Banned</span>
                                ) : user.subscriptionStatus === 'pending_approval' ? (
                                    <span className="status-badge pending" style={{ background: '#f6cc32', color: '#000' }}>
                                        {t('pending_approval')} ({user.pendingTier})
                                    </span>
                                ) : (
                                    <span className="status-badge active">Active</span>
                                )}
                            </div>

                            <div className="user-actions-cell" style={{ display: 'flex', gap: '8px' }}>
                                {user.subscriptionStatus === 'pending_approval' && (
                                    <>
                                        <button
                                            onClick={() => handleApproveSubscription(user)}
                                            className="action-btn approve"
                                            title={t('approveSubscription')}
                                            style={{ background: 'var(--gda-success)', fontSize: '12px', padding: '4px 8px', borderRadius: '4px', color: '#000', border: 'none', cursor: 'pointer' }}
                                        >
                                            {t('approveSubscription')}
                                        </button>
                                        <button
                                            onClick={() => handleCancelSubscription(user)}
                                            className="action-btn cancel"
                                            title={t('cancel')}
                                            style={{ background: 'var(--gda-error)', fontSize: '12px', padding: '4px 8px', borderRadius: '4px', color: '#fff', border: 'none', cursor: 'pointer' }}
                                        >
                                            {t('cancel')}
                                        </button>
                                    </>
                                )}
                                <button onClick={() => handleEdit(user)} className="action-btn edit" title="Edit">
                                    ✏️
                                </button>
                                <button onClick={() => handleBan(user)} className="action-btn ban" title={user.isBanned ? "Unban" : "Ban"}>
                                    {user.isBanned ? '🔓' : '🚫'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {editingUser && (
                <div className="admin-modal">
                    <form onSubmit={handleSave} className="admin-form">
                        <h3>Edit User: {editingUser.username}</h3>

                        <label>Username</label>
                        <input value={editingUser.username} onChange={e => setEditingUser({ ...editingUser, username: e.target.value })} />

                        <label>Email</label>
                        <input value={editingUser.email} onChange={e => setEditingUser({ ...editingUser, email: e.target.value })} />

                        <label>Subscription Tier</label>
                        <select value={editingUser.subscriptionTier} onChange={e => setEditingUser({ ...editingUser, subscriptionTier: e.target.value })}>
                            <option value="Free">Free</option>
                            <option value="Pro">Pro</option>
                            <option value="Team">Team</option>
                        </select>

                        <div className="form-actions">
                            <button type="submit" className="btn-admin primary">Save Changes</button>
                            <button type="button" onClick={() => setEditingUser(null)} className="btn-admin secondary">Cancel</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default UserManager;
