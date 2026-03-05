import React, { useState, useEffect } from 'react';
import { dbOperations } from '../../../database/schema';
import * as XLSX from 'xlsx';
import './AdminModules.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        totalMissions: 0,
        pendingSubmissions: 0,
        revenue: 0,
        topMissions: []
    });
    const [loading, setLoading] = useState(true);

    const loadStats = async () => {
        try {
            const users = await dbOperations.getAll('users');
            const missions = await dbOperations.getAll('missions');
            const submissions = await dbOperations.getAll('submissions');

            // Calculate active users (Logged in within last 24h - simulated)
            // Since we don't have real login logs yet, we take 20% of users as "active" for demo
            const activeCount = Math.floor(users.length * 0.4) || 1;

            // Calculate Revenue (Mock based on Tier)
            const revenue = users.reduce((acc, user) => {
                if (user.subscriptionTier === 'Pro') return acc + 19.90;
                if (user.subscriptionTier === 'Team') return acc + 49.90;
                return acc;
            }, 0);

            // Top Missions
            const missionCounts = {};
            submissions.forEach(sub => {
                missionCounts[sub.missionId] = (missionCounts[sub.missionId] || 0) + 1;
            });

            const sortedMissionIds = Object.keys(missionCounts).sort((a, b) => missionCounts[b] - missionCounts[a]).slice(0, 5);
            const topMissionsData = sortedMissionIds.map(id => {
                const mission = missions.find(m => m.id.toString() === id);
                return {
                    title: mission?.title || 'Unknown Mission',
                    count: missionCounts[id]
                };
            });

            setStats({
                totalUsers: users.length,
                activeUsers: activeCount,
                totalMissions: missions.length,
                pendingSubmissions: submissions.length, // Assuming all for now
                revenue: revenue,
                topMissions: topMissionsData
            });

            setLoading(false);
        } catch (error) {
            console.error('Failed to load admin stats', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStats();
    }, []);

    const handleExportSubscriptions = async () => {
        try {
            const users = await dbOperations.getAll('users');
            // Filter only paid users
            const subscribers = users
                .filter(u => u.subscriptionTier && u.subscriptionTier !== 'Free')
                .map(u => ({
                    UserID: u.id,
                    Username: u.username,
                    Email: u.email,
                    Plan: u.subscriptionTier,
                    JoinDate: u.joinDate || new Date().toLocaleDateString(),
                    Status: 'Active',
                    Price: u.subscriptionTier === 'Pro' ? 19.90 : 49.90
                }));

            if (subscribers.length === 0) {
                alert('No active subscribers found to export.');
                return;
            }

            // Create Worksheet
            const ws = XLSX.utils.json_to_sheet(subscribers);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Subscriptions");

            // Save File
            XLSX.writeFile(wb, "GDA_Subscriptions_Report.xlsx");

        } catch (error) {
            console.error("Export failed", error);
            alert("Export failed");
        }
    };

    if (loading) return <div className="admin-loading">Loading Analytics...</div>;

    return (
        <div className="admin-dashboard">
            <h2 className="module-title">Dashboard Overview</h2>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="failed-icon">👥</div>
                    <div className="stat-value">{stats.totalUsers}</div>
                    <div className="stat-label">Total Users</div>
                </div>
                <div className="stat-card highlight">
                    <div className="stat-icon">🔥</div>
                    <div className="stat-value">{stats.activeUsers}</div>
                    <div className="stat-label">Daily Active Users</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-value">${stats.revenue.toFixed(2)}</div>
                    <div className="stat-label">Est. Monthly Revenue</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📝</div>
                    <div className="stat-value">{stats.pendingSubmissions}</div>
                    <div className="stat-label">Total Submissions</div>
                </div>
            </div>

            <div className="dashboard-sections">
                <div className="section-panel top-missions">
                    <h3>🏆 Most Popular Missions</h3>
                    <ul className="top-list">
                        {stats.topMissions.map((m, idx) => (
                            <li key={idx}>
                                <span className="rank">#{idx + 1}</span>
                                <span className="title">{m.title}</span>
                                <span className="count">{m.count} completions</span>
                            </li>
                        ))}
                        {stats.topMissions.length === 0 && <li className="empty">No data yet</li>}
                    </ul>
                </div>

                <div className="section-panel subscription-actions">
                    <h3>💳 Subscription Management</h3>
                    <p>Manage pricing tiers and export reports.</p>

                    <div className="action-buttons">
                        <button className="btn-admin primary" onClick={handleExportSubscriptions}>
                            📥 Export Report (Excel)
                        </button>
                        <button className="btn-admin secondary">
                            ⚙️ Configure Plans
                        </button>
                    </div>

                    <div className="mini-stats">
                        <div>Pro Plans: <strong>{stats.revenue > 0 ? 'Active' : 'None'}</strong></div>
                        <div>Next Payout: <strong>End of Month</strong></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
