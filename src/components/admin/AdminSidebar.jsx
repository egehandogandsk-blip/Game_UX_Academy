import React from 'react';
import './AdminPanel.css'; // Reusing admin styles

const AdminSidebar = ({ activeTab, onTabChange, onLogout }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'users', label: 'User Management', icon: '👥' },
        { id: 'content', label: 'Content CMS', icon: '🖼️' },
        { id: 'pages', label: 'Page Manager', icon: '📄' },
        { id: 'bridge', label: 'Bridge (Jobs/Partners)', icon: '🌉' },
        { id: 'missions', label: 'Mission Manager', icon: '🎯' },
        { id: 'admins', label: 'Admin Settings', icon: '🛡️' },
    ];

    return (
        <div className="admin-sidebar">
            <div className="admin-sidebar-header">
                <h2>GDA Util 🛠️</h2>
            </div>

            <nav className="admin-nav-menu">
                {menuItems.map(item => (
                    <button
                        key={item.id}
                        className={`admin-nav-item ${activeTab === item.id ? 'active' : ''}`}
                        onClick={() => onTabChange(item.id)}
                    >
                        <span className="icon">{item.icon}</span>
                        {item.label}
                    </button>
                ))}
            </nav>

            <div className="admin-sidebar-footer">
                <button className="admin-logout-btn" onClick={onLogout}>
                    Exit Panel
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;
