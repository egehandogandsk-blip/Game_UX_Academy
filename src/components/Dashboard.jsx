import React, { useState, useEffect } from 'react';
import { dbOperations } from '../database/schema';
import { badgedata } from '../data/badges';
import { designTips } from '../data/designTips';
import { useT } from '../contexts/LanguageContext';
import './Dashboard.css';

// Import Showcase Images
import showcaseCyberpunk from '../assets/showcase/cyberpunk.png';
import showcaseFantasy from '../assets/showcase/fantasy.png';
import showcaseScifi from '../assets/showcase/scifi.png';
import showcaseMobile from '../assets/showcase/mobile.png';

const Dashboard = ({ user, onGameBrowse, onMissionSelect }) => {
    const t = useT();
    const [latestMissions, setLatestMissions] = useState([]);
    const [stats, setStats] = useState({ completedCount: 0 });
    const [loading, setLoading] = useState(true);

    // Tips State
    const [currentTip, setCurrentTip] = useState(designTips[0]);

    // News State
    const [newsItems, setNewsItems] = useState([]);
    const [newsLoading, setNewsLoading] = useState(true);

    // Tip Logic: Auto update every 5 mins
    useEffect(() => {
        setCurrentTip(designTips[Math.floor(Math.random() * designTips.length)]);

        const interval = setInterval(() => {
            handleRefreshTip();
        }, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    const handleRefreshTip = () => {
        const randomIndex = Math.floor(Math.random() * designTips.length);
        setCurrentTip(designTips[randomIndex]);
    };

    // News Logic: Fetch from FRPNET via RSS2JSON
    const fetchNews = async () => {
        setNewsLoading(true);
        try {
            const response = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://frpnet.net/feed');
            const data = await response.json();
            if (data.status === 'ok' && data.items) {
                setNewsItems(data.items);
            } else {
                throw new Error('RSS fetch failed');
            }
        } catch (error) {
            console.error('News fetch error:', error);
            setNewsItems([
                { title: 'Oyun Sektörü Raporu 2024 Yayınlandı', link: 'https://frpnet.net', pubDate: new Date() },
                { title: 'Yeni Nesil Konsollar Hakkında Sızıntılar', link: 'https://frpnet.net', pubDate: new Date() }
            ]);
        } finally {
            setNewsLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, []);

    const handleRefreshNews = () => {
        fetchNews();
    };

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const allMissions = await dbOperations.getAll('missions');
                const games = await dbOperations.getAll('games');

                const lastMissionsByGame = new Map();
                [...allMissions].reverse().forEach(mission => {
                    if (!lastMissionsByGame.has(mission.gameId)) {
                        lastMissionsByGame.set(mission.gameId, mission);
                    }
                });

                let displayMissions = Array.from(lastMissionsByGame.values()).slice(0, 4);

                if (displayMissions.length < 4) {
                    const existingIds = new Set(displayMissions.map(m => m.id));
                    const remainingNeeded = 4 - displayMissions.length;
                    const others = [...allMissions].reverse().filter(m => !existingIds.has(m.id)).slice(0, remainingNeeded);
                    displayMissions = [...displayMissions, ...others];
                }

                const missionsWithGames = displayMissions.map(mission => ({
                    ...mission,
                    game: games.find(g => g.id === mission.gameId)
                }));
                setLatestMissions(missionsWithGames);

                if (user) {
                    const submissions = await dbOperations.getAll('submissions');
                    const userCompleted = submissions.filter(s => s.userId === user.id && s.status === 'completed');
                    setStats({ completedCount: userCompleted.length });
                }

                setLoading(false);
            } catch (error) {
                console.error("Dashboard data load error:", error);
                setLoading(false);
            }
        };

        loadDashboardData();
    }, [user]);

    useEffect(() => {
        if (user && (!user.badges || user.badges.length < 5)) {
            const unlockDemoBadges = async () => {
                const demoBadges = badgedata.slice(0, 5).map(b => b.id);
                const currentBadges = user.badges || [];
                const newBadges = [...new Set([...currentBadges, ...demoBadges])];

                if (newBadges.length !== currentBadges.length) {
                    await dbOperations.update('users', user.id, { ...user, badges: newBadges });
                    window.location.reload();
                }
            };
            unlockDemoBadges();
        }
    }, [user]);

    const educationCourses = [
        {
            id: 1,
            title: "Baştan Sona Uzmanlık Bireysel",
            subtitle: "4 Ay, Full Time",
            description: "GDA'nın Oyun Tasarımı Sertifikası, oyun tasarımı konusunda 4 aylık eğitimden oluşan tam zamanlı bir programdır.",
            tags: ["4 Ay", "72+ Saat", "Bireysel"],
            type: "INDUSTRY PASS",
            level: "LEVEL 3",
            image: "linear-gradient(135deg, #1a1a1a 0%, #2d3436 100%)"
        },
        {
            id: 2,
            title: "Baştan Sona Uzmanlık Sınıf",
            subtitle: "4 Ay, Full Time",
            description: "Sınıfa özel takvimlendirme ile size özel hazırlanmış en kapsamlı giriş ve orta seviye içeriktir.",
            tags: ["4 Ay", "72+ Saat", "Sınıf"],
            type: "INDUSTRY PASS",
            level: "LEVEL 3",
            image: "linear-gradient(135deg, #1a1a1a 0%, #2d3436 100%)"
        },
        {
            id: 3,
            title: "Oyun Dünyasına Hazırlan!",
            subtitle: "Cumartesi - Pazar",
            description: "Mini program, özellikle oyun sektörüne yeni adım atmayı düşünenler için rehber niteliğinde bir başlangıç sunar.",
            tags: ["1 Gün", "4 Saat", "Sınıf"],
            type: "INDUSTRY PASS",
            level: "LEVEL 1",
            image: "linear-gradient(135deg, #1a1a1a 0%, #2d3436 100%)"
        },
        {
            id: 4,
            title: "Oyun Sektörüne Giriş 101",
            subtitle: "1 Ay, Full Time",
            description: "Oyun Tasarımı, UI, UX ve Pazarlama konularını ayrı ayrı deneyimleyebileceğiniz bir aylık özel kurslardır.",
            tags: ["4 Hafta", "16+ Saat", "Sınıf"],
            type: "INDUSTRY PASS",
            level: "LEVEL 1",
            image: "linear-gradient(135deg, #1a1a1a 0%, #2d3436 100%)"
        }
    ];

    const communityShowcase = React.useMemo(() => {
        const showcaseImages = [showcaseCyberpunk, showcaseFantasy, showcaseScifi, showcaseMobile];
        return Array(16).fill(null).map((_, i) => ({
            id: i,
            designer: `Artist${Math.floor(100 + Math.floor(Math.random() * 900))}`,
            game: ['Cyberpunk UI', 'Fantasy HUD', 'Sci-Fi Menu', 'Mobile RPG'][i % 4],
            time: `${Math.floor(2 + Math.floor(Math.random() * 10))}h`,
            badge: ['🏆', '⚡', '🎨'][i % 3],
            image: showcaseImages[i % 4]
        }));
    }, []);

    if (loading) return <div className="dashboard-loading">{t('loadingDashboard')}</div>;

    return (
        <div className="dashboard-container">
            {/* Top Stats Section */}
            <section className="dashboard-header animate-fade-in">
                <div className="dashboard-top-bar">
                    <div className="header-greeting">
                        <h1>{t('welcomeBack')}, {user?.username}! 👋</h1>
                        <p className="subtitle animate-fade-in animate-stagger-1">{t('readyToCreate')}</p>
                    </div>

                    <div className="header-actions">
                        {/* Live Ticker Panel */}
                        <a href="https://www.gameuxacademy.com" target="_blank" rel="noopener noreferrer" className="live-ticker-panel">
                            <div className="ticker-content">
                                <div className="ticker-track">
                                    {[...educationCourses, ...educationCourses].map((course, idx) => (
                                        <div key={`ticker-${idx}`} className="ticker-item">
                                            <span className="live-indicator">
                                                <span className="blink-dot">●</span> LIVE
                                            </span>
                                            <span className="course-name">{course.title}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </a>

                        {/* Notification Icon */}
                        <button className="btn-notification">
                            <span className="notification-bell">🔔</span>
                            <span className="notification-badge-dot"></span>
                        </button>
                    </div>
                </div>

                <div className="stats-minimal-row">
                    <div className="stat-pill glass animate-scale-in animate-stagger-1">
                        <div className="stat-info">
                            <span className="stat-value">{user?.xp || 0}</span>
                            <span className="stat-label">{t('totalXP')}</span>
                        </div>
                    </div>
                    <div className="stat-pill glass animate-scale-in animate-stagger-2">
                        <div className="stat-info">
                            <span className="stat-value">{user?.level || 1}</span>
                            <span className="stat-label">{t('level')}</span>
                        </div>
                    </div>
                    <div className="stat-pill glass animate-scale-in animate-stagger-3">
                        <div className="stat-info">
                            <span className="stat-value">{user?.badges?.length || 0}</span>
                            <span className="stat-label">{t('badges')}</span>
                        </div>
                    </div>
                    <div className="stat-pill glass animate-scale-in animate-stagger-4">
                        <div className="stat-info">
                            <span className="stat-value">{stats.completedCount}</span>
                            <span className="stat-label">{t('missions_label')}</span>
                        </div>
                    </div>
                    <div className="stat-pill glass animate-scale-in animate-stagger-1">
                        <div className="stat-info">
                            <span className="stat-value">{user?.certificates?.length || 0}</span>
                            <span className="stat-label">{t('certificates')}</span>
                        </div>
                    </div>
                </div>
            </section>

            <div className="dashboard-grid">
                {/* Main Content Column */}
                <div className="main-col">
                    {/* Active Missions */}
                    <section className="dashboard-section">
                        <div className="section-header">
                            <h3>{t('newMissions')}</h3>
                            <button className="btn-view-all" onClick={onGameBrowse}>{t('viewAll')}</button>
                        </div>
                        <div className="latest-missions-grid">
                            {latestMissions.map((mission, idx) => (
                                <div key={mission.id} className={`mission-card-small glass-hover animate-scale-in animate-stagger-${(idx % 4) + 1}`} onClick={() => onMissionSelect && onMissionSelect(mission)}>
                                    <div className="mission-card-image">
                                        {(mission.game?.coverImage || mission.game?.thumbnail) ? (
                                            <img src={mission.game?.coverImage || mission.game?.thumbnail} alt={mission.game?.title || 'Game'} />
                                        ) : (
                                            <div className="mission-image-placeholder">🎮</div>
                                        )}
                                        <div className="mission-difficulty-badge">
                                            <span className={`difficulty-dot ${mission.difficulty?.toLowerCase()}`}></span>
                                            <span>{mission.difficulty}</span>
                                        </div>
                                    </div>
                                    <div className="mission-card-content">
                                        <div className="mission-mini-header">
                                            <span className="mission-game-tag">
                                                🎮 {mission.game?.title || mission.game?.name || 'Unknown Game'}
                                            </span>
                                            <span className="mission-xp">+{mission.xpReward || mission.xp} XP</span>
                                        </div>
                                        <h4>{mission.title || mission.type}</h4>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="dashboard-updates-grid">
                        {/* 1. Design Tips Module */}
                        <div className="update-card tip-card">
                            <div className="update-header">
                                <div className="update-title">
                                    <span className="icon">💡</span>
                                    <h4>{t('designTip')}</h4>
                                </div>
                                <button className="btn-icon-refresh" onClick={handleRefreshTip} title={t('refreshTip')}>
                                    ↻
                                </button>
                            </div>
                            <div className="update-content tip-content-box">
                                <p>"{currentTip}"</p>
                            </div>
                            <div className="update-footer">
                                <span className="update-timer">{t('updatesEvery5min')}</span>
                            </div>
                        </div>

                        {/* 2. Game News Module (FRPNET) */}
                        <div className="update-card news-card">
                            <div className="update-header">
                                <div className="update-title">
                                    <span className="icon">📰</span>
                                    <h4>{t('gameNews')}</h4>
                                </div>
                                <button className="btn-icon-refresh" onClick={handleRefreshNews} disabled={newsLoading} title={t('refresh')}>
                                    {newsLoading ? '...' : '↻'}
                                </button>
                            </div>
                            <div className="update-content news-list">
                                {newsItems.length > 0 ? (
                                    newsItems.slice(0, 2).map((news, idx) => (
                                        <a key={idx} href={news.link} target="_blank" rel="noopener noreferrer" className="news-item">
                                            <div className="news-icon">🎮</div>
                                            <div className="news-info">
                                                <span className="news-title">{news.title}</span>
                                                <span className="news-date">{new Date(news.pubDate).toLocaleDateString()}</span>
                                            </div>
                                        </a>
                                    ))
                                ) : (
                                    <div className="news-empty">{t('newsLoading')}</div>
                                )}
                            </div>
                            <div className="update-footer">
                                <a href="https://frpnet.net/" target="_blank" rel="noopener noreferrer" className="source-link">{t('newsSource')}</a>
                            </div>
                        </div>
                    </section>

                    {/* Education / Courses */}
                    <section className="dashboard-section animate-fade-in animate-stagger-2">
                        <h3>{t('gdaAcademy')}</h3>
                        <div className="education-grid">
                            {educationCourses.map((course, idx) => (
                                <div key={course.id} className={`course-card glass-hover animate-fade-in animate-stagger-${(idx % 4) + 1}`}>
                                    <div className="course-header" style={{ background: course.image }}>
                                        <div className="course-pass-type">
                                            <span className="pass-title">{course.type}</span>
                                            <span className="pass-level">{course.level}</span>
                                        </div>
                                        <div className="course-overlay"></div>
                                    </div>
                                    <div className="course-content">
                                        <div className="course-time">{course.subtitle}</div>
                                        <h4>{course.title}</h4>
                                        <p>{course.description}</p>
                                        <div className="course-tags">
                                            {course.tags.map((tag, idx) => (
                                                <span key={idx} className="course-tag">{tag}</span>
                                            ))}
                                        </div>
                                        <div className="course-footer">
                                            <div className="live-badge">{t('liveLecture')}</div>
                                            <button className="btn-course-action">{t('registerNow')}</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Community Showcase - Horizontal Scroll */}
                    <section className="dashboard-section">
                        <h3>{t('communityShowcase')}</h3>
                        <div className="showcase-scroll-container">
                            <div className="showcase-track">
                                {communityShowcase.map((item) => (
                                    <div key={item.id} className="showcase-card">
                                        <div className="showcase-image" style={{ backgroundImage: `url(${item.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                                            <div className="badge-overlay">{item.badge}</div>
                                        </div>
                                        <div className="showcase-info">
                                            <div className="showcase-designer">
                                                <div className="designer-avatar">{item.designer[0]}</div>
                                                <span>{item.designer}</span>
                                            </div>
                                            <div className="showcase-meta">
                                                <span>{item.game}</span>
                                                <span className="showcase-time">{item.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className="showcase-more-card">
                                    <div className="showcase-more-circle">→</div>
                                    <span>{t('seeMore')}</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
