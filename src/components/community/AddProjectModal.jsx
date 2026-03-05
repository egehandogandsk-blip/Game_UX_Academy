import React, { useState } from 'react';
import '../Community.css'; // We'll keep styles consolidated for now

const AddProjectModal = ({ isOpen, onClose, onAdd, platform }) => {
    const [formData, setFormData] = useState({
        title: '',
        link: '',
        coverImage: '',
        tools: '',
        team: ''
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Validation could go here
        onAdd({
            ...formData,
            id: Date.now(),
            platform: platform,
            likes: 0,
            views: 0,
            author: 'You' // In real app, get from user context
        });
        setFormData({ title: '', link: '', coverImage: '', tools: '', team: '' });
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content community-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        {platform === 'files' ? 'Upload New File' :
                            platform === 'behance' ? 'Add Behance Project' :
                                platform === 'artstation' ? 'Add Artstation Project' :
                                    platform === 'figma' ? 'Add Figma Project' :
                                        'Add Project'}
                    </h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>{platform === 'files' ? 'File Name' : 'Project Title'}</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder={platform === 'files' ? 'e.g. Cyberpunk UI Kit' : 'e.g. Futuristic Dashboard UI'}
                                required
                                className="input"
                            />
                        </div>

                        <div className="form-group">
                            <label>{platform === 'files' ? 'Link to File (Drive/Cloud)' : 'Project Link'}</label>
                            <input
                                type="url"
                                name="link"
                                value={formData.link}
                                onChange={handleChange}
                                placeholder={platform === 'figma' ? 'https://www.figma.com/file/...' :
                                    platform === 'files' ? 'https://drive.google.com/...' :
                                        `https://www.${platform}.com/...`}
                                required
                                className="input"
                            />
                        </div>

                        {platform === 'figma' && (
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description || ''}
                                    onChange={handleChange}
                                    placeholder="Short description of the file..."
                                    className="modal-textarea"
                                    rows="3"
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label>Cover Image URL</label>
                            <input
                                type="url"
                                name="coverImage"
                                value={formData.coverImage}
                                onChange={handleChange}
                                placeholder="https://images.unsplash.com/..."
                                required
                                className="input"
                            />
                            {formData.coverImage && (
                                <div className="image-preview" style={{ marginTop: '12px' }}>
                                    <p style={{ fontSize: '12px', color: 'var(--gda-text-secondary)', marginBottom: '4px' }}>Preview:</p>
                                    <img src={formData.coverImage} alt="Preview" style={{ borderRadius: '8px', border: '1px solid var(--gda-border)' }} />
                                </div>
                            )}
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Tools Used</label>
                                <input
                                    type="text"
                                    name="tools"
                                    value={formData.tools}
                                    onChange={handleChange}
                                    placeholder="Figma, Blender, PS"
                                    className="input"
                                />
                            </div>
                            <div className="form-group">
                                <label>Company / Team</label>
                                <input
                                    type="text"
                                    name="team"
                                    value={formData.team}
                                    onChange={handleChange}
                                    placeholder="Self / Studio Name"
                                    className="input"
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                            <button type="submit" className="btn btn-primary">
                                {platform === 'files' ? 'Upload Now' : 'Add Project'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddProjectModal;
