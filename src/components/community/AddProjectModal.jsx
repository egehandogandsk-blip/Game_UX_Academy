import React, { useState } from 'react';
import { useT } from '../../contexts/LanguageContext';
import '../Community.css';

const AddProjectModal = ({ isOpen, onClose, onAdd, platform }) => {
    const t = useT();
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
        onAdd({
            ...formData,
            id: Date.now(),
            platform: platform,
            likes: 0,
            views: 0,
            author: 'You'
        });
        setFormData({ title: '', link: '', coverImage: '', tools: '', team: '' });
        onClose();
    };

    const getModalTitle = () => {
        if (platform === 'files') return t('uploadNewFile');
        if (platform === 'behance') return t('addBehanceProject');
        if (platform === 'artstation') return t('addArtstationProject');
        if (platform === 'figma') return t('addFigmaProject');
        return t('addNewProject');
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content community-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{getModalTitle()}</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>{platform === 'files' ? t('fileName') : t('projectTitle')}</label>
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
                            <label>{platform === 'files' ? t('linkToFile') : t('projectLink')}</label>
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
                                <label>{t('description')}</label>
                                <textarea
                                    name="description"
                                    value={formData.description || ''}
                                    onChange={handleChange}
                                    placeholder="Short description..."
                                    className="modal-textarea"
                                    rows="3"
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label>{t('coverImageURL')}</label>
                            <input
                                type="url"
                                name="coverImage"
                                value={formData.coverImage}
                                onChange={handleChange}
                                placeholder="https://images.unsplash.com/..."
                                required
                                className="input"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>{t('toolsUsed')}</label>
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
                                <label>{t('companyTeam')}</label>
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
                            <button type="button" className="btn btn-secondary" onClick={onClose}>{t('cancel')}</button>
                            <button type="submit" className="btn btn-primary">
                                {platform === 'files' ? t('uploadNow') : t('addProject')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddProjectModal;
