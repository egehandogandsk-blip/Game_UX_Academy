import React, { useState, useRef } from 'react';
import { MissionManager } from '../utils/missionManager.js';
import { useT } from '../contexts/LanguageContext';
import './SubmissionForm.css';

const SubmissionForm = ({ mission, onClose, onSubmit }) => {
    const t = useT();
    const [submissionType, setSubmissionType] = useState('image'); // 'image' or 'link'
    const [images, setImages] = useState([]);
    const [figmaLink, setFigmaLink] = useState('');
    const [description, setDescription] = useState('');
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files);
        }
    };

    const handleFiles = (files) => {
        const imageFiles = Array.from(files).filter(file =>
            file.type.startsWith('image/')
        );

        imageFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImages(prev => [...prev, {
                    file,
                    preview: reader.result
                }]);
            };
            reader.readAsDataURL(file);
        });

        // Auto-switch to image mode if files are dropped
        setSubmissionType('image');
        setFigmaLink(''); // Clear link
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleLinkChange = (e) => {
        setFigmaLink(e.target.value);
        if (e.target.value) {
            setSubmissionType('link');
            setImages([]); // Clear images
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (submissionType === 'image' && images.length === 0) {
            alert(t('error'));
            return;
        }

        if (submissionType === 'link' && !figmaLink) {
            alert(t('error'));
            return;
        }

        setUploading(true);

        const submissionData = {
            type: submissionType,
            images: submissionType === 'image' ? images.map(img => img.preview) : [],
            link: submissionType === 'link' ? figmaLink : null,
            description,
            timestamp: new Date().toISOString()
        };

        if (onSubmit) {
            await onSubmit(submissionData);
        }

        if (onClose) {
            onClose();
        }
        setUploading(false);
    };

    return (
        <div className="submission-overlay" onClick={onClose}>
            <div className="submission-modal" onClick={(e) => e.stopPropagation()}>
                <button className="submission-close" onClick={onClose}>✕</button>

                <h2 className="submission-title">{t('submitWork')}</h2>
                <p className="submission-subtitle">{mission.type} - {mission.game?.title}</p>

                <div className="submission-layout">
                    {/* Reference Side */}
                    <div className="submission-reference">
                        <h3>{t('gameAndRefVisuals')}</h3>
                        {mission.referenceImages && mission.referenceImages[0] ? (
                            <div className="reference-display">
                                <img src={mission.referenceImages[0]} alt="Reference" />
                            </div>
                        ) : mission.game?.coverImage ? (
                            <div className="reference-display">
                                <img src={mission.game.coverImage} alt="Reference" />
                            </div>
                        ) : (
                            <div className="no-reference">{t('noImagesAvailable')}</div>
                        )}

                        <div className="mission-requirements-mini">
                            <h4>{t('requirements')}</h4>
                            <ul>
                                {mission.requirements?.slice(0, 3).map((req, i) => (
                                    <li key={i}>{req}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Submission Side */}
                    <div className="submission-work">
                        <h3>{t('type')}</h3>

                        {/* Toggle Controls */}
                        <div className="submission-type-toggle">
                            <button
                                type="button"
                                className={`type-btn ${submissionType === 'image' ? 'active' : ''}`}
                                onClick={() => { setSubmissionType('image'); setFigmaLink(''); }}
                            >
                                🖼️ {t('uploadScreenshots')}
                            </button>
                            <button
                                type="button"
                                className={`type-btn ${submissionType === 'link' ? 'active' : ''}`}
                                onClick={() => { setSubmissionType('link'); setImages([]); }}
                            >
                                🔗 {t('gdaBridge')} Link
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Option 1: Image Upload */}
                            {submissionType === 'image' && (
                                <div className="input-section fade-in">
                                    <div
                                        className={`upload-area ${dragActive ? 'drag-active' : ''}`}
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={handleDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleChange}
                                            style={{ display: 'none' }}
                                        />
                                        <div className="upload-icon">📤</div>
                                        <div className="upload-text">
                                            {t('dropFiles')}
                                        </div>
                                    </div>

                                    {/* Previews */}
                                    {images.length > 0 && (
                                        <div className="image-previews">
                                            {images.map((img, index) => (
                                                <div key={index} className="image-preview">
                                                    <img src={img.preview} alt={`Upload ${index + 1}`} />
                                                    <button
                                                        type="button"
                                                        className="remove-image"
                                                        onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Option 2: Figma Link */}
                            {submissionType === 'link' && (
                                <div className="input-section fade-in">
                                    <label>Figma File URL</label>
                                    <input
                                        type="url"
                                        className="input-field"
                                        placeholder="https://www.figma.com/file/..."
                                        value={figmaLink}
                                        onChange={handleLinkChange}
                                    />
                                    <p className="input-hint">Make sure the link is accessible.</p>
                                </div>
                            )}

                            {/* Description */}
                            <div className="submission-field">
                                <label>{t('description')}</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder={t('bio')}
                                    rows={4}
                                />
                            </div>

                            {/* Actions */}
                            <div className="submission-actions">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={onClose}
                                >
                                    {t('cancel')}
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary btn-lg"
                                    disabled={uploading}
                                >
                                    {uploading ? t('submitting') : `${t('submit')} ✨`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubmissionForm;
