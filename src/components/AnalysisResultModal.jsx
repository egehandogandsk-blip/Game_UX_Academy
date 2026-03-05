import React, { useState } from 'react';
import './AnalysisResultModal.css';

const AnalysisResultModal = ({ result, submission, onClose, onComplete }) => {
    const [activeTab, setActiveTab] = useState('heatmap');

    if (!result) return null;

    return (
        <div className="analysis-overlay" onClick={onClose}>
            <div className="analysis-modal" onClick={e => e.stopPropagation()}>
                <div className="analysis-header">
                    <div className="analysis-title">
                        <h2>🤖 GDA AI Analysis Result</h2>
                        <span className="analysis-date">{new Date().toLocaleDateString()}</span>
                    </div>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="analysis-content">
                    {/* Left Column: Visual & Heatmap */}
                    <div className="analysis-visual">
                        <div className="heatmap-container">
                            {/* Display first image or placeholder */}
                            {submission.images && submission.images[0] ? (
                                <div className="heatmap-wrapper">
                                    <img src={submission.images[0]} alt="Analyzed Design" className="analyzed-image" />
                                    {activeTab === 'heatmap' && (
                                        <div className="heatmap-overlay">
                                            {result.heatmapData.map((point, index) => (
                                                <div
                                                    key={index}
                                                    className="heat-point"
                                                    style={{
                                                        left: `${point.x}%`,
                                                        top: `${point.y}%`,
                                                        opacity: point.value
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="no-image-placeholder">
                                    <span>🔗 External Link Analyzed</span>
                                </div>
                            )}
                        </div>

                        <div className="analysis-tabs">
                            <button
                                className={`tab-btn ${activeTab === 'heatmap' ? 'active' : ''}`}
                                onClick={() => setActiveTab('heatmap')}
                            >
                                🔥 Heatmap
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'focus' ? 'active' : ''}`}
                                onClick={() => setActiveTab('focus')}
                            >
                                👁️ Focus Order
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Stats & Score */}
                    <div className="analysis-stats">
                        <div className="score-card">
                            <div className="score-circle">
                                <svg viewBox="0 0 36 36" className="circular-chart">
                                    <path className="circle-bg"
                                        d="M18 2.0845
                                        a 15.9155 15.9155 0 0 1 0 31.831
                                        a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                    <path className="circle"
                                        strokeDasharray={`${result.score * 10}, 100`}
                                        d="M18 2.0845
                                        a 15.9155 15.9155 0 0 1 0 31.831
                                        a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                    <text x="18" y="20.35" className="percentage">{result.score}</text>
                                </svg>
                            </div>
                            <div className="score-info">
                                <h3>Overall Score</h3>
                                <p>{result.summary}</p>
                            </div>
                        </div>

                        <div className="metrics-grid">
                            <div className="metric-box">
                                <h4>Color Harmony</h4>
                                <div className="metric-value">{result.colorAnalysis.harmony}</div>
                                <div className="color-swatches">
                                    <span style={{ background: result.colorAnalysis.primary }}></span>
                                    <span style={{ background: result.colorAnalysis.secondary }}></span>
                                    <span style={{ background: result.colorAnalysis.accent }}></span>
                                </div>
                            </div>
                            <div className="metric-box">
                                <h4>Contrast</h4>
                                <div className="metric-value highlight">{result.colorAnalysis.contrastScore}</div>
                            </div>
                        </div>

                        <div className="feedback-section">
                            <h4>💡 AI Insights</h4>
                            <ul>
                                {result.feedback.map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="action-footer">
                            <button className="btn btn-primary btn-block" onClick={onComplete}>
                                ✅ Complete Mission
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalysisResultModal;
