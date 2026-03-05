import React, { useState, useRef } from 'react';
import { MissionManager } from '../utils/missionManager.js';
import './SubmissionForm.css';

const SubmissionForm = ({ mission, userId, onClose, onSubmit }) => {
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
            alert('Lütfen en az bir görsel yükleyin.');
            return;
        }

        if (submissionType === 'link' && !figmaLink) {
            alert('Lütfen geçerli bir Figma linki girin.');
            return;
        }

        setUploading(true);

        // Create submission data
        const submissionData = {
            type: submissionType,
            images: submissionType === 'image' ? images.map(img => img.preview) : [],
            link: submissionType === 'link' ? figmaLink : null,
            description,
            timestamp: new Date().toISOString()
        };

        // If onSubmit is provided (which it is), call it with the data
        // The parent (Profile) will handle the actual DB saving and AI call
        if (onSubmit) {
            await onSubmit(submissionData);
        }

        onClose();
        setUploading(false);
    };

    return (
        <div className="submission-overlay" onClick={onClose}>
            <div className="submission-modal" onClick={(e) => e.stopPropagation()}>
                <button className="submission-close" onClick={onClose}>✕</button>

                <h2 className="submission-title">Submit Your Design</h2>
                <p className="submission-subtitle">{mission.type} - {mission.game?.title}</p>

                <div className="submission-layout">
                    {/* Reference Side */}
                    <div className="submission-reference">
                        <h3>Original Design / Reference</h3>
                        {mission.referenceImages && mission.referenceImages[0] ? (
                            <div className="reference-display">
                                <img src={mission.referenceImages[0]} alt="Reference" />
                            </div>
                        ) : mission.game?.coverImage ? (
                            <div className="reference-display">
                                <img src={mission.game.coverImage} alt="Reference" />
                            </div>
                        ) : (
                            <div className="no-reference">No reference available</div>
                        )}

                        <div className="mission-requirements-mini">
                            <h4>Requirements</h4>
                            <ul>
                                {mission.requirements?.slice(0, 3).map((req, i) => (
                                    <li key={i}>{req}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Submission Side */}
                    <div className="submission-work">
                        <h3>Submission Type</h3>

                        {/* Toggle Controls */}
                        <div className="submission-type-toggle">
                            <button
                                type="button"
                                className={`type-btn ${submissionType === 'image' ? 'active' : ''}`}
                                onClick={() => { setSubmissionType('image'); setFigmaLink(''); }}
                            >
                                🖼️ Image Upload
                            </button>
                            <button
                                type="button"
                                className={`type-btn ${submissionType === 'link' ? 'active' : ''}`}
                                onClick={() => { setSubmissionType('link'); setImages([]); }}
                            >
                                🔗 Figma Link
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
                                            Drag & drop visuals here
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
                                    <p className="input-hint">Make sure the link is accessible (Public or Viewer perms).</p>
                                </div>
                            )}

                            {/* Description */}
                            <div className="submission-field">
                                <label>Design Rationale</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Briefly explain your design decisions..."
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
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary btn-lg"
                                    disabled={uploading}
                                >
                                    {uploading ? 'Analyzing...' : 'Submit to AI Analysis ✨'}
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
