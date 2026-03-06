import React, { useState, useEffect, useCallback } from 'react';
import { dbOperations } from '../database/schema.js';
import AIFeedback from './AIFeedback';
import { useT } from '../contexts/LanguageContext';
import './Inbox.css';

const Inbox = ({ userId }) => {
    const t = useT();
    const [messages, setMessages] = useState([]);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [filter, setFilter] = useState('all'); // all, unread, read
    const [loading, setLoading] = useState(true);

    const loadMessages = useCallback(async () => {
        try {
            setLoading(true);
            const feedbacks = await dbOperations.getAll('ai_feedback');
            // Combine feedbacks into message format
            const feedbackMessages = feedbacks.map(f => ({
                ...f,
                id: f.id,
                title: 'AI Analysis Result',
                sender: 'GDA AI',
                preview: f.textualFeedback?.summary?.slice(0, 50) || t('aiAnalysisProcessing'),
                time: f.createdAt ? new Date(f.createdAt).toLocaleTimeString() : '',
                read: f.read || false,
                category: 'system'
            }));
            setMessages(feedbackMessages);
            setLoading(false);
        } catch (error) {
            console.error('Error loading messages:', error);
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        loadMessages();
    }, [userId, loadMessages]);

    const filteredMessages = messages.filter(msg => {
        if (filter === 'unread') return !msg.read;
        if (filter === 'read') return msg.read;
        return true;
    });

    const markAsRead = async (messageId) => {
        const message = messages.find(m => m.id === messageId);
        if (message && !message.read) {
            const updatedMessage = { ...message, read: true };
            await dbOperations.update('ai_feedback', updatedMessage);
            setMessages(prev => prev.map(m => m.id === messageId ? updatedMessage : m));
        }
    };

    const handleMessageClick = async (message) => {
        setSelectedMessage(message);
        await markAsRead(message.id);
    };

    const getMessagePreview = (message) => {
        return message.textualFeedback?.summary || t('aiFeedbackReport');
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
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

    if (loading && messages.length === 0) {
        return (
            <div className="inbox-container">
                <div className="loading-state">{t('loading')}...</div>
            </div>
        );
    }

    return (
        <div className="inbox-container">
            <div className="inbox-header">
                <h2>{t('aiFeedbackInbox')}</h2>
                <div className="inbox-stats">
                    <span className="unread-count">
                        {messages.filter(m => !m.read).length} {t('unread')}
                    </span>
                </div>
            </div>

            <div className="inbox-filters">
                <button
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    {t('all')} ({messages.length})
                </button>
                <button
                    className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
                    onClick={() => setFilter('unread')}
                >
                    {t('unreadFilter')} ({messages.filter(m => !m.read).length})
                </button>
                <button
                    className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
                    onClick={() => setFilter('read')}
                >
                    {t('read')} ({messages.filter(m => m.read).length})
                </button>
            </div>

            <div className="inbox-messages">
                {filteredMessages.length === 0 ? (
                    <div className="no-messages">
                        <div className="no-messages-icon">📭</div>
                        <div className="no-messages-text">
                            {filter === 'unread' ? t('noUnreadMessages') : t('noMessagesYet')}
                        </div>
                        <div className="no-messages-subtext">
                            {t('completeForFeedback')}
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
                                        {t('designAnalysisReport')}
                                    </div>
                                    <div className="message-time">{formatDate(message.createdAt)}</div>
                                </div>
                                <div className="message-preview">
                                    {getMessagePreview(message)}
                                </div>
                                <div className="message-footer">
                                    <span className="message-score">
                                        {t('score')} {message.overallScore || 0}/100
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
