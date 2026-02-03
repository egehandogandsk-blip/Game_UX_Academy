import React, { useState } from 'react';
import CommunityGallery from './community/CommunityGallery';
import FigmaLive from './community/FigmaLive';
import FileLibrary from './community/FileLibrary';
import CommunityRoom from './community/CommunityRoom';
import './Community.css';

const Community = ({ user }) => {
    const [activeTab, setActiveTab] = useState('behance');

    // Tabs configuration
    const tabs = [
        { id: 'behance', label: 'Behance', icon: 'B̄' },
        { id: 'artstation', label: 'Artstation', icon: 'A' },
        { id: 'figma', label: 'Figma Live', icon: 'F' },
        { id: 'files', label: 'Design Files', icon: '📁' },
        { id: 'room', label: 'Community Room', icon: '💬' }
    ];

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
                    <h1>GDA Community</h1>
                    <p>Connect, share, and explore fellow designers' work.</p>
                </div>

                {/* User Stats / Quick Actions could go here */}
            </header>

            <div className="community-tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
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
