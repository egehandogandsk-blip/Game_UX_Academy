import React, { useState } from 'react';
import VisualMarker from './VisualMarker';
import './AIFeedback.css';

const AIFeedback = ({ feedback, onClose }) => {
    const [selectedMarkerIndex, setSelectedMarkerIndex] = useState(null);

    if (!feedback) return null;

    const selectedFinding = selectedMarkerIndex !== null
        ? feedback.textualFeedback.detailedFindings[selectedMarkerIndex]
        : null;

    return (
        <div className="ai-feedback-modal">
            <div className="ai-feedback-header">
                <h2>AI Design Analysis</h2>
                <button className="btn btn-ghost" onClick={onClose}>✕</button>
            </div>

            <div className="ai-feedback-content">
                {/* Overall Assessment */}
                <div className="feedback-section">
                    <div className="feedback-score">
                        <div className="score-circle">
                            <div className="score-value">{feedback.overallScore}</div>
                            <div className="score-label">Score</div>
                        </div>
                        <div className="score-summary">
                            <h3>Overall Assessment</h3>
                            <p>{feedback.textualFeedback.summary}</p>
                        </div>
                    </div>
                </div>

                {/* Visual Feedback with Markers */}
                {feedback.visualFeedback && feedback.visualFeedback.length > 0 && (
                    <div className="feedback-section">
                        <h3>Visual Feedback</h3>
                        <p className="section-description">
                            Click on the numbered markers below to see detailed feedback for each area.
                        </p>
                        <VisualMarker
                            image="https://picsum.photos/seed/analysis/800/600"
                            markers={feedback.visualFeedback}
                            onMarkerClick={(marker, index) => setSelectedMarkerIndex(index)}
                        />
                    </div>
                )}

                {/* Detailed Findings */}
                <div className="feedback-section">
                    <h3>Detailed Analysis</h3>
                    <div className="findings-list">
                        {feedback.textualFeedback.detailedFindings.map((finding, index) => (
                            <div
                                key={index}
                                className={`finding-card priority-${finding.priority} ${selectedMarkerIndex === index ? 'selected' : ''}`}
                                onClick={() => setSelectedMarkerIndex(index)}
                            >
                                <div className="finding-header">
                                    <div className="finding-number">{index + 1}</div>
                                    <div className="finding-title">
                                        <strong>{finding.screen}</strong> · {finding.element}
                                    </div>
                                    <div className={`priority-badge priority-${finding.priority}`}>
                                        {finding.priority}
                                    </div>
                                </div>

                                <div className="finding-body">
                                    <div className="finding-item">
                                        <div className="finding-label">❌ Problem</div>
                                        <div className="finding-text">{finding.problem}</div>
                                    </div>

                                    <div className="finding-item">
                                        <div className="finding-label">💡 Reason</div>
                                        <div className="finding-text">{finding.reason}</div>
                                    </div>

                                    <div className="finding-item">
                                        <div className="finding-label">✅ Solution</div>
                                        <div className="finding-text solution">{finding.solution}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Strengths */}
                {feedback.textualFeedback.strengths && feedback.textualFeedback.strengths.length > 0 && (
                    <div className="feedback-section">
                        <h3>What You Did Well ✨</h3>
                        <ul className="strengths-list">
                            {feedback.textualFeedback.strengths.map((strength, index) => (
                                <li key={index}>{strength}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Learning Resources */}
                {feedback.resources && feedback.resources.length > 0 && (
                    <div className="feedback-section">
                        <h3>Recommended Resources 📚</h3>
                        <div className="resources-list">
                            {feedback.resources.map((resource, index) => (
                                <a
                                    key={index}
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="resource-card"
                                >
                                    <div className="resource-icon">
                                        {resource.type === 'accessibility' ? '♿' : '🎨'}
                                    </div>
                                    <div className="resource-info">
                                        <div className="resource-title">{resource.title}</div>
                                        <div className="resource-type">{resource.type}</div>
                                    </div>
                                    <div className="resource-arrow">→</div>
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="ai-feedback-footer">
                <button className="btn btn-secondary" onClick={onClose}>
                    Close
                </button>
                <button className="btn btn-primary">
                    Revise Submission
                </button>
            </div>
        </div>
    );
};

export default AIFeedback;
