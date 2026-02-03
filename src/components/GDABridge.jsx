import React, { useState } from 'react';
import CompanyList from './bridge/CompanyList';
import Career from './bridge/Career';
import CertificateVerify from './bridge/CertificateVerify';
import './GDABridge.css';

const GDABridge = ({ user }) => {
    const [activeTab, setActiveTab] = useState('companies');

    const tabs = [
        { id: 'companies', label: 'GDA Bridge Companies', icon: '🏢' },
        { id: 'career', label: 'Kariyer', icon: '💼' },
        { id: 'verify', label: 'Sertifika Verify', icon: '✅' }
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'companies':
                return <CompanyList />;
            case 'career':
                return <Career user={user} />;
            case 'verify':
                return <CertificateVerify user={user} />;
            default:
                return null;
        }
    };

    return (
        <div className="bridge-container">
            <header className="bridge-header">
                <div className="bridge-title-section">
                    <h1>GDA Bridge</h1>
                    <p>Endüstri ile öğrenciler arasında köprü: İş fırsatları, stüdyolar ve sertifika doğrulama.</p>
                </div>
            </header>

            <div className="bridge-tabs">
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

            <div className="bridge-content-area">
                {renderContent()}
            </div>
        </div>
    );
};

export default GDABridge;
