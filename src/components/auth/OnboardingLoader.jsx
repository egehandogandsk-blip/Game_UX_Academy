import React, { useState, useEffect } from 'react';
import './OnboardingLoader.css';

const OnboardingLoader = ({ onComplete }) => {
    const [messageIndex, setMessageIndex] = useState(0);

    const messages = [
        'Senin için sistemi hazırlıyoruz.',
        'Database yükleniyor.',
        'Artık hazırız! Başlayalım!'
    ];

    useEffect(() => {
        // Message 1: 0-2s
        const timer1 = setTimeout(() => setMessageIndex(1), 2000);

        // Message 2: 2-4s
        const timer2 = setTimeout(() => setMessageIndex(2), 4000);

        // Complete and transition: after 5s
        const timer3 = setTimeout(() => {
            onComplete();
        }, 5000);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, [onComplete]);

    return (
        <div className="loader-container">
            <div className="loader-content">
                {/* Logo Animation */}
                <div className="logo-animation">
                    {/* Animated Logo Center */}
                    <div className="loader-center">
                        <div className="logo-container">
                            <img src="/gda-logo.png" alt="GDA" className="center-logo" />
                        </div>

                        {/* Expanding Rings */}
                        <div className="expanding-ring ring-1"></div>
                        <div className="expanding-ring ring-2"></div>
                        <div className="expanding-ring ring-3"></div>

                        {/* Gradient Orbs */}
                        <div className="gradient-orb orb-1"></div>
                        <div className="gradient-orb orb-2"></div>
                        <div className="gradient-orb orb-3"></div>
                    </div>
                </div>

                {/* Loading Messages */}
                <div className="message-container">
                    <p className="loading-message" key={messageIndex}>
                        {messages[messageIndex]}
                    </p>
                </div>

                {/* Progress Indicator */}
                <div className="progress-dots">
                    <span className={messageIndex >= 0 ? 'active' : ''}></span>
                    <span className={messageIndex >= 1 ? 'active' : ''}></span>
                    <span className={messageIndex >= 2 ? 'active' : ''}></span>
                </div>
            </div>

            {/* Animated Background */}
            <div className="loader-background">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
                <div className="gradient-orb orb-3"></div>
            </div>
        </div>
    );
};

export default OnboardingLoader;
