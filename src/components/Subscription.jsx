import React from 'react';
import { useT } from '../contexts/LanguageContext';
import './Subscription.css';

const Subscription = ({ onSelectPlan }) => {
    const t = useT();

    const plans = [
        {
            id: 'free',
            name: t('free'),
            price: '$0',
            period: t('perMonth'),
            features: [
                t('feat_10BeginnerMissions'),
                t('feat_FreeCommunity'),
                t('feat_BasicProfile')
            ],
            highlight: false,
            color: 'var(--gda-text-secondary)',
            buttonText: t('getStarted')
        },
        {
            id: 'starter',
            name: t('starter') !== 'starter' ? t('starter') : 'Starter',
            price: '$4.99',
            period: t('perMonth'),
            features: [
                t('feat_AllBeginnerMissions'),
                t('feat_AITechnicalAnalysis'),
                t('feat_CommunityAccess'),
                t('feat_DiscountEducation10')
            ],
            highlight: false,
            color: 'var(--gda-text-primary)',
            buttonText: t('subscribe')
        },
        {
            id: 'prime',
            name: t('prime') !== 'prime' ? t('prime') : 'Prime',
            price: '$9.99',
            period: t('perMonth'),
            features: [
                t('feat_IntermediateMissions'),
                t('feat_AITechnicalAnalysis'),
                t('feat_ExclusiveAssets'),
                t('feat_CommunityAccess'),
                t('feat_4ExpertMissions'),
                t('feat_DiscountEducation20')
            ],
            highlight: true,
            color: 'var(--gda-accent-primary)',
            buttonText: t('subscribe')
        },
        {
            id: 'elite',
            name: t('elite') !== 'elite' ? t('elite') : 'Elite',
            price: '$19.99',
            period: t('perMonth'),
            features: [
                t('feat_AllExpertMissions'),
                t('feat_GDACertificate'),
                t('feat_LeaderboardAccess'),
                t('feat_3xDiscountCoupons'),
                t('feat_PrioritySupport'),
                t('feat_Consultancy2h')
            ],
            highlight: false,
            color: 'var(--gda-accent-secondary)',
            buttonText: t('subscribe')
        }
    ];

    return (
        <div className="subscription-container">
            <div className="subscription-header">
                <h1 className="premium-title">{t('upgradeYourCareer')}</h1>
                <p className="premium-subtitle">{t('subscriptionUnlock')}</p>
            </div>

            <div className="plans-grid">
                {plans.map((plan) => (
                    <div key={plan.id} className={`plan-card ${plan.highlight ? 'highlight' : ''}`}>
                        {plan.highlight && <div className="popular-badge">{t('mostPopular')}</div>}
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
                            {plan.buttonText}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Subscription;
