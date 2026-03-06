import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, MessageSquare } from 'lucide-react';
import { useT } from '../contexts/LanguageContext';
import './AIAssistant.css';

const AIAssistant = () => {
    const t = useT();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            type: 'ai',
            text: t('aiWelcome'),
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [hasNotification, setHasNotification] = useState(false);
    const [conversationStep, setConversationStep] = useState(0);
    const [userContext, setUserContext] = useState({});
    const chatEndRef = useRef(null);

    // Course packages with detailed info - Now using translation keys
    const courses = {
        gameDesign: {
            name: t('courseGameDesign'),
            price: '34.000 TL',
            duration: '6 ' + (t('perMonth').includes('month') ? 'months' : 'ay'),
            topics: ['game design', 'oyun tasarım', 'tasarım', 'mekanik', 'sistem'],
            benefits: ['Sertifika', 'Mentörlük', 'Portfolio desteği', 'İş garantisi']
        },
        uiUx: {
            name: t('courseUIUX'),
            price: '28.000 TL',
            duration: '4 ' + (t('perMonth').includes('month') ? 'months' : 'ay'),
            topics: ['ui', 'ux', 'interface', 'arayüz', 'user experience'],
            benefits: ['Gerçek proje deneyimi', 'Portfolio', 'Sektör rehberliği']
        },
        caseStudy: {
            name: t('courseCaseStudy'),
            price: '15.000 TL',
            duration: '2 ' + (t('perMonth').includes('month') ? 'months' : 'ay'),
            topics: ['case', 'case study', 'analiz', 'portfolio', 'inceleme'],
            benefits: ['Hızlı başlangıç', 'Portfolio güçlendirme', 'Pratik odaklı']
        },
        mobile: {
            name: t('courseMobile'),
            price: '22.000 TL',
            duration: '3 ' + (t('perMonth').includes('month') ? 'months' : 'ay'),
            topics: ['mobile', 'mobil', 'ios', 'android', 'touch'],
            benefits: ['Mobil uzmanlaşma', 'Trend bilgisi', 'Publish desteği']
        }
    };

    // Auto-scroll
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = () => {
        if (!inputValue.trim()) return;

        const userMessage = {
            type: 'user',
            text: inputValue,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        const currentInput = inputValue;
        setInputValue('');

        // Generate AI response with 3-step flow
        setTimeout(() => {
            const aiResponse = generateSmartResponse(currentInput, conversationStep);
            setMessages(prev => [...prev, {
                type: 'ai',
                text: aiResponse.text,
                timestamp: new Date()
            }]);

            if (aiResponse.nextStep !== undefined) {
                setConversationStep(aiResponse.nextStep);
            }
            if (aiResponse.context) {
                setUserContext(prev => ({ ...prev, ...aiResponse.context }));
            }
        }, 800);
    };

    const generateSmartResponse = (userInput, step) => {
        const input = userInput.toLowerCase();

        // Step 0: Initial interest detection
        if (step === 0) {
            // Detect area of interest
            if (input.includes('ui') || input.includes('ux') || input.includes('arayüz') || input.includes('interface')) {
                return {
                    text: t('aiSelectionUI'),
                    nextStep: 1,
                    context: { interest: 'uiUx' }
                };
            }

            if (input.includes('game design') || input.includes('oyun tasarım') || input.includes('mekanik') || input.includes('mechanic')) {
                return {
                    text: t('aiSelectionGD'),
                    nextStep: 1,
                    context: { interest: 'gameDesign' }
                };
            }

            if (input.includes('mobil') || input.includes('mobile')) {
                return {
                    text: t('aiSelectionMobile'),
                    nextStep: 1,
                    context: { interest: 'mobile' }
                };
            }

            if (input.includes('portfolio') || input.includes('case')) {
                return {
                    text: t('aiSelectionPortfolio'),
                    nextStep: 1,
                    context: { interest: 'caseStudy' }
                };
            }

            // General response
            return {
                text: t('aiGeneralDetail'),
                nextStep: 0
            };
        }

        // Step 1: Experience level & goal clarification
        if (step === 1) {
            let experienceLevel = 'beginner';

            if (input.includes('profesyonel') || input.includes('uzman') || input.includes('ileri') || input.includes('professional') || input.includes('expert') || input.includes('advanced')) {
                experienceLevel = 'advanced';
            } else if (input.includes('deneyim') || input.includes('orta') || input.includes('biraz') || input.includes('experience') || input.includes('intermediate') || input.includes('some')) {
                experienceLevel = 'intermediate';
            }

            return {
                text: t('aiStep1Response'),
                nextStep: 2,
                context: { level: experienceLevel }
            };
        }

        // Step 2: Final recommendation
        if (step === 2) {
            const interest = userContext.interest || 'gameDesign';
            const course = courses[interest];

            let goalText = t('home').toLowerCase(); // Placeholder for 'goals' until better key
            if (input.includes('kariyer') || input.includes('iş') || input.includes('career') || input.includes('job')) {
                goalText = 'career';
            } else if (input.includes('geliştir') || input.includes('improve')) {
                goalText = 'skills';
            } else if (input.includes('freelance')) {
                goalText = 'freelance';
            }

            const benefitsList = course.benefits.map(b => `• ${b}`).join('\n');

            return {
                text: `${t('aiFinalRecommendation')}\n\n📚 **${course.name}**\n\n💰 ${t('aiInvestment')}: ${course.price}\n⏱️ ${t('aiDuration')}: ${course.duration}\n\n✨ ${t('aiBenefits')}:\n${benefitsList}\n\n${t('aiIdealFor').replace('{goal}', goalText)}\n\n📧 ${t('aiApplyNow')}: **info@gameuxacademy.com**\n\n${t('aiThanks')} 💪`,
                nextStep: 3,
                context: { recommended: course.name }
            };
        }

        // Step 3+: Post-recommendation chat
        if (input.includes('fiyat') || input.includes('ücret') || input.includes('taksit') || input.includes('price') || input.includes('cost') || input.includes('payment')) {
            return {
                text: t('aiPaymentInfo') + '\n\n📧 info@gameuxacademy.com\n\n' + t('aiAnythingElse'),
                nextStep: 3
            };
        }

        if (input.includes('tarih') || input.includes('ne zaman') || input.includes('başla') || input.includes('date') || input.includes('when') || input.includes('start')) {
            return {
                text: t('aiDateInfo') + '\n\n📧 info@gameuxacademy.com\n\n' + t('aiAnythingElse'),
                nextStep: 3
            };
        }

        // Friendly conversational responses
        if (input.includes('teşekkür') || input.includes('sağol') || input.includes('thanks') || input.includes('thank you')) {
            return {
                text: t('aiThanks') + '\n\n📧 info@gameuxacademy.com\n\n' + t('aiAnythingElse'),
                nextStep: 3
            };
        }

        return {
            text: t('aiAnythingElse') + '\n\n📧 **info@gameuxacademy.com**',
            nextStep: 3
        };
    };

    // Expose trigger function to parent
    useEffect(() => {
        const handleAssistantEvent = (event, data) => {
            setIsOpen(true);
            setHasNotification(true);

            if (event === 'submission_processing') {
                const msg = {
                    type: 'ai',
                    text: t('aiAnalysisProcessing'),
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, msg]);
            }

            if (event === 'analysis_ready') {
                const msg = {
                    type: 'ai',
                    text: t('aiAnalysisReady').replace('{score}', data.score),
                    timestamp: new Date(),
                    isAction: true,
                    actionText: t('viewReport'),
                    onAction: data.onClick
                };
                setMessages(prev => [...prev, msg]);
            }
        };

        window.triggerAIAssistant = handleAssistantEvent;
        return () => {
            delete window.triggerAIAssistant;
        };
    }, [t]);

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
        setHasNotification(false);
    };

    const quickActions = [
        t('courseUIUX'),
        t('courseGameDesign'),
        t('aiInvestment'),
        t('courseCaseStudy')
    ];

    return (
        <div className="ai-assistant-container">
            {/* Floating Button */}
            <button
                className={`ai-assistant-btn ${hasNotification ? 'has-notification' : ''}`}
                onClick={toggleChat}
                aria-label="AI Assistant"
            >
                <span className="ai-icon"><MessageSquare size={24} /></span>
                {hasNotification && <span className="notification-badge"></span>}
            </button>

            {/* Chat Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="ai-chat-panel glass-strong"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                    >
                        {/* Header */}
                        <div className="ai-chat-header">
                            <div className="ai-header-info">
                                <span className="ai-avatar"><Bot size={20} /></span>
                                <div>
                                    <h3>{t('aiAssistant')}</h3>
                                    <p className="ai-status">
                                        <span className="status-dot"></span> {t('online')}
                                    </p>
                                </div>
                            </div>
                            <button className="close-btn" onClick={toggleChat}><X size={20} /></button>
                        </div>

                        {/* Messages */}
                        <div className="ai-chat-messages">
                            {messages.map((msg, index) => (
                                <motion.div
                                    key={index}
                                    className={`message ${msg.type}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {msg.type === 'ai' && <span className="msg-avatar"><Bot size={18} /></span>}
                                    <div className="message-content">
                                        <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                                        {msg.isAction && (
                                            <button
                                                className="action-btn"
                                                onClick={msg.onAction}
                                                style={{
                                                    marginTop: '10px',
                                                    padding: '8px 16px',
                                                    background: 'var(--gda-primary)',
                                                    border: 'none',
                                                    borderRadius: '20px',
                                                    color: 'white',
                                                    cursor: 'pointer',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                {msg.actionText}
                                            </button>
                                        )}
                                        <span className="message-time">
                                            {msg.timestamp.toLocaleTimeString(undefined, {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Quick Actions */}
                        {messages.length === 1 && (
                            <div className="quick-actions">
                                <p className="quick-label">{t('quickOptions')}:</p>
                                {quickActions.map((action, idx) => (
                                    <button
                                        key={idx}
                                        className="quick-action-btn"
                                        onClick={() => {
                                            setInputValue(action);
                                            setTimeout(sendMessage, 100);
                                        }}
                                    >
                                        {action}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input */}
                        <div className="ai-chat-input">
                            <input
                                type="text"
                                placeholder={t('typeMessage')}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                            />
                            <button
                                className="send-btn"
                                onClick={sendMessage}
                                disabled={!inputValue.trim()}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AIAssistant;
