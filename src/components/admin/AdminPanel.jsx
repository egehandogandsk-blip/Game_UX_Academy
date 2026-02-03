import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { dbOperations } from '../../database/schema';
import GameList from './GameList';
import MissionList from './MissionList';
import './AdminPanel.css';

const AdminPanel = () => {
    const { adminUser, adminLogout } = useAdmin();
    const [currentTab, setCurrentTab] = useState('games');
    const [games, setGames] = useState([]);
    const [missions, setMissions] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [gamesData, missionsData, usersData] = await Promise.all([
                dbOperations.getAll('games'),
                dbOperations.getAll('missions'),
                dbOperations.getAll('users')
            ]);

            setGames(gamesData || []);
            setMissions(missionsData || []);
            setUsers(usersData || []);
        } catch (error) {
            console.error('Error loading admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const menuItems = [
        { id: 'games', icon: '🎮', label: 'Oyun Yönetimi', count: games.length },
        { id: 'missions', icon: '🎯', label: 'Görev Yönetimi', count: missions.length },
        { id: 'users', icon: '👥', label: 'Kullanıcılar', count: users.length },
    ];

    return (
        <div className="admin-panel">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="admin-sidebar-header">
                    <div className="admin-logo">
                        <img src="/gda-logo.png" alt="GDA" />
                    </div>
                    <h2>Admin Panel</h2>
                </div>

                <nav className="admin-nav">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            className={`admin-nav-item ${currentTab === item.id ? 'active' : ''}`}
                            onClick={() => setCurrentTab(item.id)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                            {item.count > 0 && (
                                <span className="nav-count">{item.count}</span>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="admin-sidebar-footer">
                    <div className="admin-user-info">
                        <div className="admin-avatar">A</div>
                        <div className="admin-user-details">
                            <div className="admin-user-name">{adminUser?.name || 'Admin'}</div>
                            <div className="admin-user-role">{adminUser?.role || 'Super Admin'}</div>
                        </div>
                    </div>
                    <button className="admin-logout-btn" onClick={adminLogout}>
                        🚪 Çıkış
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                <div className="admin-header">
                    <h1>
                        {menuItems.find(item => item.id === currentTab)?.label || 'Admin Panel'}
                    </h1>
                    <div className="admin-header-actions">
                        <span className="admin-timestamp">
                            {new Date().toLocaleDateString('tr-TR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            })}
                        </span>
                    </div>
                </div>

                <div className="admin-content">
                    {loading ? (
                        <div className="admin-loading">
                            <div className="loading-spinner"></div>
                            <p>Veriler yükleniyor...</p>
                        </div>
                    ) : (
                        <>
                            {currentTab === 'games' && (
                                <GameList games={games} onDataChange={loadData} />
                            )}

                            {currentTab === 'missions' && (
                                <MissionList missions={missions} onDataChange={loadData} />
                            )}

                            {currentTab === 'users' && (
                                <div className="admin-section">
                                    <div className="section-header">
                                        <h2>Kullanıcılar ({users.length})</h2>
                                    </div>

                                    {users.length === 0 ? (
                                        <div className="placeholder-content">
                                            <p>👥 Henüz kullanıcı kaydı yok</p>
                                        </div>
                                    ) : (
                                        <div className="data-table">
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>Kullanıcı Adı</th>
                                                        <th>Email</th>
                                                        <th>Level</th>
                                                        <th>XP</th>
                                                        <th>Kayıt Tarihi</th>
                                                        <th>İşlemler</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {users.map(user => (
                                                        <tr key={user.id}>
                                                            <td>{user.username}</td>
                                                            <td>{user.email}</td>
                                                            <td>{user.level || 1}</td>
                                                            <td>{user.xp || 0} XP</td>
                                                            <td>
                                                                {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                                                            </td>
                                                            <td>
                                                                <button className="btn-icon" title="Detay">👁️</button>
                                                                <button className="btn-icon" title="Düzenle">✏️</button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminPanel;
