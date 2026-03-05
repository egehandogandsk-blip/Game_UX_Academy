import React from 'react';
import './Subscription.css';

const Subscription = ({ onSelectPlan }) => {
    const plans = [
        {
            id: 'free',
            name: 'Free',
            price: '$0',
            period: '/ Month',
            features: [
                '10 Beginner Missions / Month',
                'Access to Free Community',
                'Basic Profile'
            ],
            highlight: false,
            color: 'var(--gda-text-secondary)',
            buttonText: 'Get Started'
        },
        {
            id: 'starter',
            name: 'Starter',
            price: '$2.99',
            period: '/ Month',
            features: [
                'All Beginner Missions',
                'AI Technical Analysis',
                'Community Access',
                '10% Discount on Education'
            ],
            highlight: false,
            color: 'var(--gda-text-primary)',
            buttonText: 'Subscribe'
        },
        {
            id: 'prime',
            name: 'Prime',
            price: '$4.99',
            period: '/ Month',
            features: [
                'Intermediate Missions',
                'AI Technical Analysis',
                'Exclusive Asset Packs',
                'Community Access',
                '4 Expert Missions',
                '20% Discount on Education'
            ],
            highlight: true,
            color: 'var(--gda-accent-primary)',
            buttonText: 'Subscribe'
        },
        {
            id: 'elite',
            name: 'Elite',
            price: '$7.99',
            period: '/ Month',
            features: [
                'All Expert Missions',
                'GDA Certificate',
                'Leaderboard Ranking Access',
                '3x 20% Discount Coupons',
                'Priority Community Ticket',
                '2 Hours Consultancy'
            ],
            highlight: false,
            color: 'var(--gda-accent-secondary)',
            buttonText: 'Subscribe'
        }
    ];

    return (
        <div className="subscription-container">
            <div className="subscription-header">
                <h1>Upgrade Your Career</h1>
                <p>Unlock more missions, feedback, and exclusive education content.</p>
            </div>

            <div className="plans-grid">
                {plans.map((plan) => (
                    <div key={plan.id} className={`plan-card ${plan.highlight ? 'highlight' : ''}`}>
                        <div className="plan-header">
                            <h2 className="plan-name">{plan.name}</h2>
                            <div className="plan-price">
                                <span className="currency">{plan.price}</span>
                                <span className="period">{plan.period}</span>
                            </div>
                        </div>

                        <div className="plan-features">
                            {plan.features.map((feature, index) => (
                                <div key={index} className="feature-item">
                                    <span className="check-icon">✓</span>
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            className="btn-subscribe"
                            onClick={() => onSelectPlan(plan)}
                        >
                            Subscribe Now
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Subscription;
