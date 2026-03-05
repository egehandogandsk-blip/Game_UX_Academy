import React, { useState, useEffect } from 'react';
import { dbOperations } from '../../../database/schema';
import './AdminModules.css';

const ContentManager = () => {
    const [activeTab, setActiveTab] = useState('news'); // news, tips
    const [items, setItems] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({});

    const loadItems = async () => {
        // In a real schema we might separate these, but we can store them in 'content_assets' with a 'type' field
        // or check if we have specific stores. 
        // Existing schema has 'content_assets' with 'type'.
        const allAssets = await dbOperations.getAll('content_assets');
        const filtered = allAssets.filter(item => item.type === activeTab);
        setItems(filtered || []);
    };

    // Load data on tab change
    useEffect(() => {
        loadItems();
    }, [activeTab]);

    const handleSave = async (e) => {
        e.preventDefault();
        const newItem = {
            ...formData,
            type: activeTab,
            createdAt: new Date().toISOString()
        };

        if (formData.id) {
            await dbOperations.update('content_assets', formData.id, newItem);
        } else {
            await dbOperations.add('content_assets', newItem);
        }

        setShowForm(false);
        setFormData({});
        loadItems();
    };

    const handleDelete = async (id) => {
        if (confirm('Delete this content?')) {
            await dbOperations.delete('content_assets', id);
            loadItems();
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, image: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="content-manager">
            <h2 className="module-title">Content CMS</h2>

            <div className="sub-tabs">
                <button className={`sub-tab ${activeTab === 'news' ? 'active' : ''}`} onClick={() => setActiveTab('news')}>Game News</button>
                <button className={`sub-tab ${activeTab === 'tips' ? 'active' : ''}`} onClick={() => setActiveTab('tips')}>Design Tips</button>
            </div>

            <div className="actions-bar">
                <button className="btn-admin primary small" onClick={() => { setFormData({}); setShowForm(true); }}>
                    + Add New {activeTab === 'news' ? 'News' : 'Tip'}
                </button>
            </div>

            <div className="data-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Title/Content</th>
                            <th>Source/Author</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No content found.</td></tr>}
                        {items.map(item => (
                            <tr key={item.id}>
                                <td>
                                    {item.image ? (
                                        <img src={item.image} alt="" className="table-avatar" style={{ borderRadius: '4px', width: '50px', height: '30px' }} />
                                    ) : 'No Img'}
                                </td>
                                <td>
                                    <div style={{ fontWeight: 500 }}>{item.title}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#888', maxWidth: '300px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                                        {item.content}
                                    </div>
                                </td>
                                <td>{item.source || 'GDA Team'}</td>
                                <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <button onClick={() => { setFormData(item); setShowForm(true); }} className="btn-icon">✏️</button>
                                    <button onClick={() => handleDelete(item.id)} className="btn-icon">🗑️</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showForm && (
                <div className="admin-modal">
                    <form onSubmit={handleSave} className="admin-form">
                        <h3>{formData.id ? 'Edit' : 'Add'} {activeTab === 'news' ? 'News' : 'Tip'}</h3>

                        <input
                            placeholder="Title"
                            value={formData.title || ''}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            required
                        />

                        <textarea
                            placeholder="Content/Description"
                            value={formData.content || ''}
                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                            style={{ width: '100%', background: '#222', border: '1px solid #444', color: 'white', padding: '8px', minHeight: '100px', borderRadius: '6px', marginBottom: '12px' }}
                        />

                        {activeTab === 'news' && (
                            <input
                                placeholder="Source (e.g. IGN, FRPNET)"
                                value={formData.source || ''}
                                onChange={e => setFormData({ ...formData, source: e.target.value })}
                            />
                        )}

                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#aaa' }}>Image (Upload or URL)</label>
                            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ marginBottom: '5px' }} />
                            <div style={{ textAlign: 'center', margin: '5px 0' }}>OR</div>
                            <input
                                placeholder="Image URL"
                                value={formData.image || ''}
                                onChange={e => setFormData({ ...formData, image: e.target.value })}
                            />
                        </div>

                        {formData.image && (
                            <div style={{ margin: '10px 0', textAlign: 'center' }}>
                                <img src={formData.image} alt="Preview" style={{ maxHeight: '100px', borderRadius: '4px' }} />
                            </div>
                        )}

                        <div className="form-actions">
                            <button type="submit" className="btn-admin primary">Save</button>
                            <button type="button" onClick={() => setShowForm(false)} className="btn-admin secondary">Cancel</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ContentManager;
