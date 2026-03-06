import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CommunityGallery from './community/CommunityGallery';
import FigmaLive from './community/FigmaLive';
import FileLibrary from './community/FileLibrary';
import CommunityRoom from './community/CommunityRoom';
import { useT } from '../contexts/LanguageContext';
import './Community.css';

const Community = ({ user }) => {
    const t = useT();
    const { tabName } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('behance');

    // Tabs configuration - Memoized to prevent useEffect triggers
    const tabs = useMemo(() => [
        { id: 'behance', label: 'Behance', icon: 'B̄', path: 'Behance' },
        { id: 'artstation', label: 'Artstation', icon: 'A', path: 'Artstation' },
        { id: 'figma', label: 'Figma Live', icon: 'F', path: 'Figma_Live' },
        { id: 'files', label: 'Design Files', icon: '📁', path: 'Design_Files' },
        { id: 'room', label: 'Community Room', icon: '💬', path: 'Community_Room' }
    ], []);

    // Sync URL with Tab State
    useEffect(() => {
        if (tabName) {
            const matchedTab = tabs.find(t => t.path.toLowerCase() === tabName.toLowerCase());
            if (matchedTab && matchedTab.id !== activeTab) {
                setActiveTab(matchedTab.id);
            }
        }
    }, [tabName, tabs, activeTab]);

    const handleTabChange = (tab) => {
        setActiveTab(tab.id);
        navigate(`/Community/${tab.path}`);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'behance':
                return <CommunityGallery platform="behance" />;
            case 'artstation':
                return <CommunityGallery platform="artstation" />;
            case 'figma':
                return <FigmaLive />;
            case 'files':
                return <FileLibrary />;
            case 'room':
                return <CommunityRoom user={user} />;
            default:
                return null;
        }
    };

    return (
        <div className="community-container">
            <header className="community-header">
                <div className="community-title-section">
                    <h1>{t('community')}</h1>
                    <p>{t('communityConnect')}</p>
                </div>
            </header>

            <div className="community-tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => handleTabChange(tab)}
                    >
                        <span className="tab-icon">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="community-content-area">
                {renderContent()}
            </div>
        </div>
    );
};

export default Community;
