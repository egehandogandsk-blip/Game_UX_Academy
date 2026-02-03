import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../utils/translations';
import './Sidebar.css';

const Sidebar = ({ user, currentPage, onNavigate, onLogout }) => {
    const { language, changeLanguage } = useLanguage();
    const [showLangMenu, setShowLangMenu] = useState(false);

    const languages = [
        { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
        { code: 'en', label: 'English', flag: '🇬🇧' },
        { code: 'fr', label: 'Français', flag: '🇫🇷' },
        { code: 'de', label: 'Deutsch', flag: '🇩🇪' }
    ];

    const currentLang = languages.find(lang => lang.code === language);

    // Nothing Phone Style Icons (Minimal, Dotted, Tech)
    const icons = {
        dashboard: (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="nothing-icon">
                <path d="M4 13h6v7H4v-7zm0-9h6v7H4V4zm8 7h8v9h-8v-9zm0-7h8v5h-8V4z" fill="currentColor" fillOpacity="0.5" />
                <circle cx="7" cy="7.5" r="1.5" fill="currentColor" />
                <circle cx="7" cy="16.5" r="1.5" fill="currentColor" />
                <circle cx="12" cy="8" r="3" fill="currentColor" />
                <path d="M12 14c-4.42 0-8 1.79-8 4v2h16v-2c0-2.21-3.58-4-8-4z" fill="currentColor" fillOpacity="0.5" />
            </svg>
        ),
        community: (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="nothing-icon">
                <circle cx="12" cy="12" r="3" fill="currentColor" />
                <circle cx="19" cy="12" r="1.5" fill="currentColor" fillOpacity="0.6" />
                <circle cx="5" cy="12" r="1.5" fill="currentColor" fillOpacity="0.6" />
                <circle cx="12" cy="5" r="1.5" fill="currentColor" fillOpacity="0.6" />
                <circle cx="12" cy="19" r="1.5" fill="currentColor" fillOpacity="0.6" />
            </svg>
        ),
        games: (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="nothing-icon">
                <path d="M2 13v-2l2-5h16l2 5v2l-3 6H5l-3-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="8" cy="14" r="1.5" fill="currentColor" />
                <circle cx="16" cy="14" r="1.5" fill="currentColor" />
                <path d="M12 11v6" stroke="currentColor" strokeWidth="1.5" />
                <path d="M9 14h6" stroke="currentColor" strokeWidth="1.5" />
            </svg>
        ),
        missions: (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="nothing-icon">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
                <circle cx="12" cy="12" r="3" fill="currentColor" />
                <circle cx="12" cy="4" r="1" fill="currentColor" />
                <circle cx="12" cy="20" r="1" fill="currentColor" />
                <circle cx="4" cy="12" r="1" fill="currentColor" />
                <circle cx="20" cy="12" r="1" fill="currentColor" />
            </svg>
        ),
        submissions: (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="nothing-icon">
                <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 12h8" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
                <path d="M8 8h8" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
                <path d="M8 16h5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
                <circle cx="17" cy="16" r="1.5" fill="currentColor" />
            </svg>
        ),
        inbox: (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="nothing-icon">
                <path d="M4 6h16v12H4V6z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M4 9l8 5 8-5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
                <circle cx="12" cy="14" r="1.5" fill="currentColor" />
            </svg>
        ),
        profile: (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="nothing-icon">
                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
                <path d="M4 20c0-4 4-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
                <circle cx="12" cy="8" r="1.5" fill="currentColor" />
            </svg>
        ),
        subscription: (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="nothing-icon">
                <path d="M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
                <circle cx="12" cy="12" r="2" fill="currentColor" />
            </svg>
        ),
        bridge: (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="nothing-icon">
                <path d="M2 12h20" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
                <path d="M5 12v6a2 2 0 002 2h2a2 2 0 002-2v-6" stroke="currentColor" strokeWidth="1.5" />
                <path d="M13 12v6a2 2 0 002 2h2a2 2 0 002-2v-6" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="12" cy="7" r="2" fill="currentColor" />
                <circle cx="4" cy="12" r="1.5" fill="currentColor" />
                <circle cx="20" cy="12" r="1.5" fill="currentColor" />
            </svg>
        )
    };

    const navItems = [
        { id: 'dashboard', icon: icons.dashboard, label: t(language, 'dashboard') },
        { id: 'games', icon: icons.games, label: t(language, 'games') },
        { id: 'missions', icon: icons.missions, label: t(language, 'missions') },
        { id: 'community', icon: icons.community, label: 'Community' },
        { id: 'profile', icon: icons.profile, label: t(language, 'profile') },
        { id: 'subscription', icon: icons.subscription, label: 'Subscription' },
        { id: 'bridge', icon: icons.bridge, label: 'GDA Bridge' },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="logo">
                    <img src="/gda-logo.png" alt="GDA" className="logo-image" />
                    <div className="logo-subtitle">Student Community Hub</div>
                </div>
            </div>

            <div className="user-profile-section">
                <div className="user-profile-card" onClick={() => onNavigate('profile')}>
                    <div className="user-avatar-small">
                        {user?.profilePhoto ? (
                            <img src={user.profilePhoto} alt={user.username} className="avatar-img" />
                        ) : (
                            <span className="avatar-initial">{user?.username?.[0]?.toUpperCase() || 'G'}</span>
                        )}
                    </div>
                    <div className="user-info-compact">
                        <div className="user-name-compact">{user?.username || 'GDA User'}</div>
                        <div className="user-meta-compact">
                            <span className="level-badge">Lvl {user?.level || 1}</span>
                            {user?.subscriptionTier && user.subscriptionTier !== 'Free' && (
                                <>
                                    <span className="xp-divider">•</span>
                                    <span className="tier-badge-sidebar">{user.subscriptionTier}</span>
                                </>
                            )}
                            <span className="xp-divider">•</span>
                            <span className="xp-text-compact">{user?.xp || 0} XP</span>
                        </div>
                    </div>
                </div>
            </div>

            <nav className="sidebar-nav">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
                        onClick={() => onNavigate(item.id)}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                        {item.id === 'inbox' && user?.unreadMessages > 0 && (
                            <span className="notification-badge">{user.unreadMessages}</span>
                        )}
                    </button>
                ))}
            </nav>

            <div className="sidebar-footer">
                {/* Language Selector */}
                <div className="language-selector">
                    <button
                        className="lang-btn"
                        onClick={() => setShowLangMenu(!showLangMenu)}
                    >
                        <span className="lang-flag">{currentLang?.flag}</span>
                        <span className="lang-code">{language.toUpperCase()}</span>
                        <span className="lang-arrow">{showLangMenu ? '▲' : '▼'}</span>
                    </button>

                    {showLangMenu && (
                        <div className="lang-menu">
                            {languages.map(lang => (
                                <button
                                    key={lang.code}
                                    className={`lang-option ${language === lang.code ? 'active' : ''}`}
                                    onClick={() => {
                                        changeLanguage(lang.code);
                                        setShowLangMenu(false);
                                    }}
                                >
                                    <span className="lang-flag">{lang.flag}</span>
                                    <span className="lang-label">{lang.label}</span>
                                    {language === lang.code && <span className="check-mark">✓</span>}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Logout Button */}
                <button className="btn btn-ghost btn-sm logout-btn" onClick={onLogout}>
                    🚪 {t(language, 'logout')}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
