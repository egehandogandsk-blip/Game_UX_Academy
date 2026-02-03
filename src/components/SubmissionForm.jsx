import React, { useState, useRef } from 'react';
import { MissionManager } from '../utils/missionManager.js';
import './SubmissionForm.css';

const SubmissionForm = ({ mission, userId, onClose, onSubmit }) => {
    const [images, setImages] = useState([]);
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
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (images.length === 0) {
            alert('Please upload at least one design mockup');
            return;
        }

        setUploading(true);

        // Create submission data
        const submissionData = {
            images: images.map(img => img.preview), // In production, upload to cloud storage
            description
        };

        const result = await MissionManager.submitMission(userId, mission.id, submissionData);

        setUploading(false);

        if (result.success) {
            if (onSubmit) onSubmit(result);
            onClose();
        } else {
            alert('Failed to submit mission: ' + result.error);
        }
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
                        <h3>Original Design</h3>
                        {mission.referenceImages && mission.referenceImages[0] ? (
                            <div className="reference-display">
                                <img
                                    src={mission.referenceImages[0]}
                                    alt="Original design reference"
                                />
                            </div>
                        ) : (
                            <div className="no-reference">No reference available</div>
                        )}
                    </div>

                    {/* Submission Side */}
                    <div className="submission-work">
                        <h3>Your Design</h3>

                        <form onSubmit={handleSubmit}>
                            {/* Upload Area */}
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
                                    Drag and drop images here or click to browse
                                </div>
                                <div className="upload-hint">
                                    Supports PNG, JPG, WebP (max 10MB each)
                                </div>
                            </div>

                            {/* Image Previews */}
                            {images.length > 0 && (
                                <div className="image-previews">
                                    {images.map((img, index) => (
                                        <div key={index} className="image-preview">
                                            <img src={img.preview} alt={`Upload ${index + 1}`} />
                                            <button
                                                type="button"
                                                className="remove-image"
                                                onClick={() => removeImage(index)}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Description */}
                            <div className="submission-field">
                                <label>Design Rationale</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Explain your design decisions, what problems you solved, and what improvements you made..."
                                    rows={6}
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
                                    disabled={uploading || images.length === 0}
                                >
                                    {uploading ? 'Submitting...' : 'Submit for AI Analysis'}
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
