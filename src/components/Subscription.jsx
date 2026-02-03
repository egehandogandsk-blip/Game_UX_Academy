import React from 'react';
import './Subscription.css';

const Subscription = ({ onSelectPlan }) => {
    const plans = [
        {
            id: 1,
            name: 'Starter',
            price: '$3.99',
            period: '/ Month',
            features: [
                '30 Free "Intermediate Missions"',
                '4 "Expert Missions"',
                '10 AI Feedback Sessions',
                'Community Ticket',
                'GDA Level 1 Education - 10% OFF'
            ],
            highlight: false,
            color: 'var(--gda-text-primary)'
        },
        {
            id: 2,
            name: 'Pro',
            price: '$7.99',
            period: '/ Month',
            features: [
                '50 Free "Intermediate Missions"',
                '20 "Expert Missions"',
                '15 AI Feedback Sessions',
                'Community Ticket',
                'GDA Level 1 Education - 20% OFF'
            ],
            highlight: true, // Most popular or middle tier
            color: 'var(--gda-accent-primary)'
        },
        {
            id: 3,
            name: 'Elite',
            price: '$14.99',
            period: '/ Month',
            features: [
                '50 Free "Intermediate Missions"',
                '30 "Expert Missions"',
                '39 AI Feedback Sessions',
                'Community Ticket',
                'GDA Level 1 Education - 25% OFF',
                'GDA Level 2 Education - 10% OFF'
            ],
            highlight: false,
            color: 'var(--gda-accent-secondary)'
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
