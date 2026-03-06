import React from 'react';
import { useT } from '../contexts/LanguageContext';
import './BottomNav.css';

const BottomNav = ({ currentPage, onNavigate }) => {
    const t = useT();
    const navItems = [
        { id: 'dashboard', icon: '🏠', label: t('home') },
        { id: 'games', icon: '🎮', label: t('games') },
        { id: 'missions', icon: '🎯', label: t('missions') },
        { id: 'inbox', icon: '📬', label: t('inbox') },
        { id: 'profile', icon: '👤', label: t('profile') },
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
