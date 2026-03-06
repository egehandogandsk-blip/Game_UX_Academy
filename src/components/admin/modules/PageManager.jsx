import React, { useState, useEffect } from 'react';
import { dbOperations } from '../../../database/schema';
import './AdminModules.css';

const PageManager = () => {
    const [pages, setPages] = useState([]);
    const [editingPage, setEditingPage] = useState(null);

    // Default routes to seed if empty
    const DEFAULT_ROUTES = [
        { route: '/Dashboard', title: 'Dashboard', description: 'User dashboard and overview' },
        { route: '/Games', title: 'Games Library', description: 'Explore UX analysis of top games' },
        { route: '/Community', title: 'Community', description: 'Connect with other designers' },
        { route: '/GDA_Bridge', title: 'GDA Bridge', description: 'Jobs and Career opportunities' },
    ];

    const loadPages = async () => {
        let loadedPages = await dbOperations.getAll('page_configs');

        // Seed if empty (Mocking initial state)
        if (loadedPages.length === 0) {
            loadedPages = DEFAULT_ROUTES;
            // Optionally save them to DB? Keep in memory for demo unless saved.
        }
        setPages(loadedPages || []);
    };

    useEffect(() => {
        loadPages();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        await dbOperations.add('page_configs', editingPage); // Add or Update (keyPath needs handling, let's use put if updated schema supports it, or add with overwrite)
        // Since schema has keyPath 'route', 'put' (update/add) works if we use dbOperations.update logic or direct put.
        // Our dbOperations.update uses 'put'.
        await dbOperations.update('page_configs', editingPage.route, editingPage);

        setEditingPage(null);
        loadPages();
    };

    return (
        <div className="page-manager">
            <h2 className="module-title">Page Manager</h2>
            <p className="module-subtitle">Manage SEO metadata and route configurations.</p>

            <div className="data-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Route</th>
                            <th>Page Title</th>
                            <th>Meta Description</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pages.map((page, idx) => (
                            <tr key={idx}>
                                <td className="font-mono text-accent">{page.route}</td>
                                <td>{page.title}</td>
                                <td>{page.description}</td>
                                <td><span className="status-badge active">Active</span></td>
                                <td>
                                    <button onClick={() => setEditingPage(page)} className="btn-icon">⚙️</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {editingPage && (
                <div className="admin-modal">
                    <form onSubmit={handleSave} className="admin-form">
                        <h3>Configure: {editingPage.route}</h3>

                        <label>Page Title</label>
                        <input
                            value={editingPage.title}
                            onChange={e => setEditingPage({ ...editingPage, title: e.target.value })}
                        />

                        <label>Meta Description</label>
                        <textarea
                            value={editingPage.description}
                            onChange={e => setEditingPage({ ...editingPage, description: e.target.value })}
                            className="admin-textarea"
                        />

                        <div className="form-actions">
                            <button type="submit" className="btn-admin primary">Save Configuration</button>
                            <button type="button" onClick={() => setEditingPage(null)} className="btn-admin secondary">Cancel</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default PageManager;
