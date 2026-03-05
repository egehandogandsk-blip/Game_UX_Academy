import React, { useState } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import AdminSidebar from './AdminSidebar';
import AdminDashboard from './modules/AdminDashboard';
import UserManager from './modules/UserManager';
import BridgeManager from './modules/BridgeManager';
import ContentManager from './modules/ContentManager';
import PageManager from './modules/PageManager';
import MissionManager from './modules/MissionManager';
import './AdminPanel.css';

const AdminPanel = () => {
    const { adminUser, adminLogout } = useAdmin();
    const [activeTab, setActiveTab] = useState('dashboard');

    const renderModule = () => {
        switch (activeTab) {
            case 'dashboard':
                return <AdminDashboard />;
            case 'users':
                return <UserManager />;
            case 'content':
                return <ContentManager />;
            case 'pages':
                return <PageManager />;
            case 'bridge':
                return <BridgeManager />;
            case 'missions':
                return <MissionManager />;
            case 'admins':
                return (
                    <div className="module-placeholder">
                        <h2>Admin Settings</h2>
                        <p>Phase 5: Role management pending.</p>
                    </div>
                );
            default:
                return <AdminDashboard />;
        }
    };

    return (
        <div className="admin-layout">
            <AdminSidebar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onLogout={adminLogout}
            />
            <main className="admin-content-area">
                <header className="admin-topbar">
                    <div className="breadcrumbs">
                        Admin / {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                    </div>
                    <div className="admin-profile">
                        <span>{adminUser?.name || 'Admin'}</span>
                        <span className="badge">{adminUser?.role}</span>
                    </div>
                </header>
                <div className="module-container">
                    {renderModule()}
                </div>
            </main>
        </div>
    );
};

export default AdminPanel;
