import React from 'react';
import './BottomNav.css';

const BottomNav = ({ currentPage, onNavigate }) => {
    const navItems = [
        { id: 'dashboard', icon: '🏠', label: 'Home' },
        { id: 'games', icon: '🎮', label: 'Games' },
        { id: 'missions', icon: '🎯', label: 'Missions' },
        { id: 'inbox', icon: '📬', label: 'Inbox' },
        { id: 'profile', icon: '👤', label: 'Profile' },
    ];

    return (
        <nav className="bottom-nav">
            {navItems.map(item => (
                <button
                    key={item.id}
                    className={`bottom-nav-item ${currentPage === item.id ? 'active' : ''}`}
                    onClick={() => onNavigate(item.id)}
                >
                    <span className="bottom-nav-icon">{item.icon}</span>
                    <span className="bottom-nav-label">{item.label}</span>
                </button>
            ))}
        </nav>
    );
};

export default BottomNav;
