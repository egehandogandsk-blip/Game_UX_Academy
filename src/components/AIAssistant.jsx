import React, { useState, useEffect, useRef } from 'react';
import './AIAssistant.css';

const AIAssistant = ({ onEvent }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            type: 'ai',
            text: 'Merhaba! 👋 Ben senin kişisel GDA rehberin. Oyun tasarımı yolculuğunda sana yardımcı olmak için buradayım!\n\nKendini hangi alanda geliştirmek istersin?',
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [hasNotification, setHasNotification] = useState(false);
    const [conversationStep, setConversationStep] = useState(0);
    const [userContext, setUserContext] = useState({});
    const chatEndRef = useRef(null);

    // Course packages with detailed info
    const courses = {
        gameDesign: {
            name: 'Game Design Sertifikalı Eğitim',
            price: '34.000 TL',
            duration: '6 ay',
            topics: ['game design', 'oyun tasarım', 'tasarım', 'mekanik', 'sistem'],
            benefits: ['Sertifika', 'Mentörlük', 'Portfolio desteği', 'İş garantisi']
        },
        uiUx: {
            name: 'Game UI/UX Mastery',
            price: '28.000 TL',
            duration: '4 ay',
            topics: ['ui', 'ux', 'interface', 'arayüz', 'user experience'],
            benefits: ['Gerçek proje deneyimi', 'Portfolio', 'Sektör rehberliği']
        },
        caseStudy: {
            name: 'Advanced Case Study Workshop',
            price: '15.000 TL',
            duration: '2 ay',
            topics: ['case', 'case study', 'analiz', 'portfolio', 'inceleme'],
            benefits: ['Hızlı başlangıç', 'Portfolio güçlendirme', 'Pratik odaklı']
        },
        mobile: {
            name: 'Mobile Game UI Bootcamp',
            price: '22.000 TL',
            duration: '3 ay',
            topics: ['mobile', 'mobil', 'ios', 'android', 'touch'],
            benefits: ['Mobil uzmanlaşma', 'Trend bilgisi', 'Publish desteği']
        }
    };

    // Proactive suggestions
    const suggestions = {
        afterCaseCompletion: 'Tebrikler! Case study\'ni harika tamamladın! 🎉\n\nBu başarını daha da ileriye taşımak ister misin? Seninle potansiyelini konuşalım!',
        afterFiltering: 'Projelere göz atıyorsun galiba! 🔍\n\nBu alanda uzmanlaşmak için bir yol haritası oluşturmama yardımcı olayım mı?',
        lowScore: 'AI feedback\'ine baktım. Gelişim için harika fırsatlar var! 😊\n\nBir kahve sohbeti yapar gibi konuşalım, sana nasıl yardımcı olabilirim?'
    };

    // Auto-scroll
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (onEvent) {
            console.log('AI Assistant ready');
        }
    }, [onEvent]);

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
            if (input.includes('ui') || input.includes('ux') || input.includes('arayüz')) {
                return {
                    text: 'Harika seçim! UI/UX tasarımı gerçekten önemli bir alan. 🎨\n\nŞu anda hangi seviyedesin?\n\n• Yeni başlıyorum\n• Biraz deneyimim var\n• Profesyonelleşmek istiyorum',
                    nextStep: 1,
                    context: { interest: 'uiUx' }
                };
            }

            if (input.includes('game design') || input.includes('oyun tasarım') || input.includes('mekanik')) {
                return {
                    text: 'Müthiş! Game Design oyun sektörünün kalbi. 🎮\n\nDaha çok hangi yönüyle ilgileniyorsun?\n\n• Genel game design\n• Sistem tasarımı\n• Level design',
                    nextStep: 1,
                    context: { interest: 'gameDesign' }
                };
            }

            if (input.includes('mobil') || input.includes('mobile')) {
                return {
                    text: 'Mobil oyunlar büyük bir pazar! 📱\n\nMobil oyun tasarımında neyi hedefliyorsun?\n\n• Casual oyunlar\n• Hyper-casual\n• Kompleks mobil oyunlar',
                    nextStep: 1,
                    context: { interest: 'mobile' }
                };
            }

            if (input.includes('portfolio') || input.includes('case')) {
                return {
                    text: 'Portfolio güçlendirme çok akıllıca! 💼\n\nŞu an portfolyonda kaç proje var?\n\n• Hiç yok\n• 1-2 proje\n• 3+ proje var',
                    nextStep: 1,
                    context: { interest: 'caseStudy' }
                };
            }

            // General response
            return {
                text: 'Anlıyorum! 😊 Biraz daha detaylandıralım.\n\nŞu alanlardan hangisi daha çok ilgini çekiyor?\n\n• UI/UX Tasarım\n• Game Design\n• Mobil Oyun Tasarımı\n• Portfolio/Case Study',
                nextStep: 0
            };
        }

        // Step 1: Experience level & goal clarification
        if (step === 1) {
            let experienceLevel = 'beginner';

            if (input.includes('profesyonel') || input.includes('uzman') || input.includes('ileri')) {
                experienceLevel = 'advanced';
            } else if (input.includes('deneyim') || input.includes('orta') || input.includes('biraz')) {
                experienceLevel = 'intermediate';
            }

            return {
                text: 'Süper, şimdi daha net görüyorum! 👍\n\nSon bir soru: Bu eğitimden beklentin ne?\n\n• Kariyere başlamak\n• Mevcut işimi geliştirmek\n• Freelance olarak çalışmak\n• Hobby/Kişisel gelişim',
                nextStep: 2,
                context: { level: experienceLevel }
            };
        }

        // Step 2: Final recommendation
        if (step === 2) {
            const interest = userContext.interest || 'gameDesign';
            const course = courses[interest];

            let goalText = 'hedeflerine ulaşmak';
            if (input.includes('kariyer') || input.includes('iş')) {
                goalText = 'kariyerini başlatmak';
            } else if (input.includes('geliştir')) {
                goalText = 'mevcut becerilerini geliştirmek';
            } else if (input.includes('freelance')) {
                goalText = 'freelance kariyerine başlamak';
            }

            const benefitsList = course.benefits.map(b => `• ${b}`).join('\n');

            return {
                text: `Mükemmel! Senin için tam paket buldum! 🎯\n\n📚 **${course.name}**\n\n💰 Yatırım: ${course.price}\n⏱️ Süre: ${course.duration}\n\n✨ Sana özel avantajlar:\n${benefitsList}\n\nBu eğitim ${goalText} için ideal! Seviyene göre özelleştirilmiş bir program sunuyoruz.\n\n📧 Hemen başvurmak için: **info@gamedesignacademia.com**\n\nDetaylı görüşme için mail atabilirsin! Ben buradayım. 💪`,
                nextStep: 3,
                context: { recommended: course.name }
            };
        }

        // Step 3+: Post-recommendation chat
        if (input.includes('fiyat') || input.includes('ücret') || input.includes('taksit')) {
            return {
                text: 'Ödeme konusunda esneklik sağlıyoruz! 💳\n\n• Peşin ödeme indirimleri\n• 6 aya kadar taksit\n• Özel kampanyalar\n\nDetaylar için info@gamedesignacademia.com adresine "Ödeme Seçenekleri" başlığıyla mail at!\n\nBaşka sorun var mı? 😊',
                nextStep: 3
            };
        }

        if (input.includes('tarih') || input.includes('ne zaman') || input.includes('başla')) {
            return {
                text: 'Eğitimlerimiz her ay yeni dönemle başlıyor! 📅\n\nEn yakın dönem için:\n📧 info@gamedesignacademia.com\n\nBaşvurunu yap, seni hemen arıyorlar! ⚡',
                nextStep: 3
            };
        }

        // Friendly conversational responses
        if (input.includes('teşekkür') || input.includes('sağol')) {
            return {
                text: 'Rica ederim! 🤗 Ne zaman istersen buradayım.\n\nBaşvurunu yapmayı unutma: info@gamedesignacademia.com\n\nBaşarılar dilerim! 🚀',
                nextStep: 3
            };
        }

        return {
            text: 'Başka merak ettiğin bir şey var mı? 😊\n\nBaşvuru için: **info@gamedesignacademia.com**\n\nBuradayım! 💬',
            nextStep: 3
        };
    };

    const triggerProactiveMessage = (type) => {
        setHasNotification(true);
        const message = {
            type: 'ai',
            text: suggestions[type] || suggestions.afterCaseCompletion,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, message]);
    };

    // Expose trigger function to parent
    useEffect(() => {
        window.triggerAIAssistant = triggerProactiveMessage;
        return () => {
            delete window.triggerAIAssistant;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
        'UI/UX eğitimi',
        'Game Design eğitimi',
        'Fiyat bilgisi',
        'Portfolio geliştirme'
    ];

    return (
        <div className="ai-assistant-container">
            {/* Floating Button */}
            <button
                className={`ai-assistant-btn ${hasNotification ? 'has-notification' : ''}`}
                onClick={toggleChat}
                aria-label="AI Assistant"
            >
                <span className="ai-icon">🤖</span>
                {hasNotification && <span className="notification-badge"></span>}
            </button>

            {/* Chat Panel */}
            {isOpen && (
                <div className="ai-chat-panel">
                    {/* Header */}
                    <div className="ai-chat-header">
                        <div className="ai-header-info">
                            <span className="ai-avatar">🤖</span>
                            <div>
                                <h3>GDA AI Asistan</h3>
                                <p className="ai-status">
                                    <span className="status-dot"></span> Online
                                </p>
                            </div>
                        </div>
                        <button className="close-btn" onClick={toggleChat}>✕</button>
                    </div>

                    {/* Messages */}
                    <div className="ai-chat-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.type}`}>
                                {msg.type === 'ai' && <span className="msg-avatar">🤖</span>}
                                <div className="message-content">
                                    <p>{msg.text}</p>
                                    <span className="message-time">
                                        {msg.timestamp.toLocaleTimeString('tr-TR', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Quick Actions */}
                    {messages.length === 1 && (
                        <div className="quick-actions">
                            <p className="quick-label">Hızlı Seçenekler:</p>
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
                            placeholder="Mesajını yaz..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                        <button
                            className="send-btn"
                            onClick={sendMessage}
                            disabled={!inputValue.trim()}
                        >
                            ➤
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIAssistant;
