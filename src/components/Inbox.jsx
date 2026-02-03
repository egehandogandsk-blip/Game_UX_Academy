import React, { useState, useEffect } from 'react';
import { dbOperations } from '../database/schema.js';
import AIFeedback from './AIFeedback';
import './Inbox.css';

const Inbox = ({ userId }) => {
    const [messages, setMessages] = useState([]);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [filter, setFilter] = useState('all'); // all, unread, read

    useEffect(() => {
        loadMessages();
    }, [userId]);

    const loadMessages = async () => {
        try {
            const feedbacks = await dbOperations.getAll('ai_feedback');
            const userSubmissions = await dbOperations.query('submissions', 'userId', userId);
            const userSubmissionIds = userSubmissions.map(s => s.id);

            const userFeedbacks = feedbacks.filter(f =>
                userSubmissionIds.includes(f.submissionId)
            );

            setMessages(userFeedbacks.sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            ));
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    const filteredMessages = messages.filter(msg => {
        if (filter === 'unread') return !msg.read;
        if (filter === 'read') return msg.read;
        return true;
    });

    const markAsRead = async (messageId) => {
        const message = messages.find(m => m.id === messageId);
        if (message && !message.read) {
            message.read = true;
            await dbOperations.update('ai_feedback', message);
            setMessages([...messages]);
        }
    };

    const handleMessageClick = async (message) => {
        setSelectedMessage(message);
        await markAsRead(message.id);
    };

    const getMessagePreview = (feedback) => {
        return feedback.textualFeedback?.summary || 'AI Feedback Report';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="inbox-container">
            <div className="inbox-header">
                <h2>AI Feedback Inbox</h2>
                <div className="inbox-stats">
                    <span className="unread-count">
                        {messages.filter(m => !m.read).length} unread
                    </span>
                </div>
            </div>

            <div className="inbox-filters">
                <button
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All ({messages.length})
                </button>
                <button
                    className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
                    onClick={() => setFilter('unread')}
                >
                    Unread ({messages.filter(m => !m.read).length})
                </button>
                <button
                    className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
                    onClick={() => setFilter('read')}
                >
                    Read ({messages.filter(m => m.read).length})
                </button>
            </div>

            <div className="inbox-messages">
                {filteredMessages.length === 0 ? (
                    <div className="no-messages">
                        <div className="no-messages-icon">📭</div>
                        <div className="no-messages-text">
                            {filter === 'unread' ? 'No unread messages' : 'No messages yet'}
                        </div>
                        <div className="no-messages-subtext">
                            Complete a mission to receive AI feedback
                        </div>
                    </div>
                ) : (
                    filteredMessages.map(message => (
                        <div
                            key={message.id}
                            className={`message-card ${!message.read ? 'unread' : ''}`}
                            onClick={() => handleMessageClick(message)}
                        >
                            <div className="message-icon">
                                <span className="ai-badge">AI</span>
                            </div>
                            <div className="message-content">
                                <div className="message-header">
                                    <div className="message-title">
                                        Design Analysis Report
                                    </div>
                                    <div className="message-time">{formatDate(message.createdAt)}</div>
                                </div>
                                <div className="message-preview">
                                    {getMessagePreview(message)}
                                </div>
                                <div className="message-footer">
                                    <span className="message-score">
                                        Score: {message.overallScore}/100
                                    </span>
                                    {!message.read && (
                                        <span className="unread-dot"></span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {selectedMessage && (
                <AIFeedback
                    feedback={selectedMessage}
                    onClose={() => setSelectedMessage(null)}
                />
            )}
        </div>
    );
};

export default Inbox;
