import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CommunityGallery from './community/CommunityGallery';
import FigmaLive from './community/FigmaLive';
import FileLibrary from './community/FileLibrary';
import CommunityRoom from './community/CommunityRoom';
import './Community.css';

const Community = ({ user }) => {
    const { tabName } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('behance');

    // Tabs configuration
    // Adding 'path' for URL mapping
    const tabs = [
        { id: 'behance', label: 'Behance', icon: 'B̄', path: 'Behance' },
        { id: 'artstation', label: 'Artstation', icon: 'A', path: 'Artstation' },
        { id: 'figma', label: 'Figma Live', icon: 'F', path: 'Figma_Live' },
        { id: 'files', label: 'Design Files', icon: '📁', path: 'Design_Files' },
        { id: 'room', label: 'Community Room', icon: '💬', path: 'Community_Room' }
    ];

    // Sync URL with Tab State
    useEffect(() => {
        if (tabName) {
            // Find tab where path matches tabName (case insensitive to catch manual types)
            const matchedTab = tabs.find(t => t.path.toLowerCase() === tabName.toLowerCase());
            if (matchedTab) {
                setActiveTab(matchedTab.id);
            }
        } else {
            // Default URL if none provided? Or just stick to default state?
            // Let's replace URL with default tab Behance if visiting /Community root
            // But usually, root /Community stays, and default content renders.
            // Let's just keep 'behance' as default activeTab state.
        }
    }, [tabName]);

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
