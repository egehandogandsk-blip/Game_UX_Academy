import React, { useState } from 'react';
import { dbOperations } from '../../database/schema';
import './Onboarding.css';

const Onboarding = ({ userId, onComplete }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        fullName: '',
        workField: '',
        hasGDAEducation: false,
        referralSource: ''
    });
    const [errors, setErrors] = useState({});

    const workFieldOptions = [
        'Game UI Designer',
        'Game UX Designer',
        'Game Designer',
        'UI/UX Developer',
        'Student',
        'Other'
    ];

    const validateStep = () => {
        const newErrors = {};

        if (step === 1 && !formData.fullName.trim()) {
            newErrors.fullName = 'Please enter your full name';
        }

        if (step === 2 && !formData.workField) {
            newErrors.workField = 'Please select your work field';
        }

        // Step 3 is a toggle, always valid
        // Step 4 is optional text input, always valid

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (!validateStep()) return;

        if (step < 4) {
            setStep(step + 1);
        } else {
            handleComplete();
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
            setErrors({});
        }
    };

    const handleComplete = async () => {
        try {
            console.log('🔄 Starting onboarding completion...');
            // Update user with onboarding data
            const users = await dbOperations.getAll('users');
            console.log('📋 Found users:', users.length);

            const user = users.find(u => u.id === userId);
            console.log('👤 Current user:', user);

            if (user) {
                const updatedUser = {
                    ...user,
                    fullName: formData.fullName,
                    workField: formData.workField,
                    hasGDAEducation: formData.hasGDAEducation,
                    referralSource: formData.referralSource,
                    hasCompletedOnboarding: true,
                    onboardingStep: 4
                };

                console.log('💾 Updating user with:', updatedUser);
                await dbOperations.update('users', userId, updatedUser);
                console.log('✅ User updated successfully');
            }

            console.log('🎉 Calling onComplete callback');
            onComplete();
        } catch (error) {
            console.error('❌ Error completing onboarding:', error);
            alert('Error saving your information. Please try again.');
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="onboarding-step">
                        <h2>Welcome to GDA! 👋</h2>
                        <p className="step-description">Let's get to know you better</p>

                        <div className="form-group">
                            <label htmlFor="fullName">What's your full name?</label>
                            <input
                                type="text"
                                id="fullName"
                                className={`input ${errors.fullName ? 'input-error' : ''}`}
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                placeholder="Enter your full name"
                                autoFocus
                            />
                            {errors.fullName && <span className="error-text">{errors.fullName}</span>}
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="onboarding-step">
                        <h2>What do you do? 💼</h2>
                        <p className="step-description">Tell us about your professional focus</p>

                        <div className="form-group">
                            <label htmlFor="workField">Select your work field</label>
                            <select
                                id="workField"
                                className={`input ${errors.workField ? 'input-error' : ''}`}
                                value={formData.workField}
                                onChange={(e) => setFormData({ ...formData, workField: e.target.value })}
                            >
                                <option value="">Choose one...</option>
                                {workFieldOptions.map((option, index) => (
                                    <option key={index} value={option}>{option}</option>
                                ))}
                            </select>
                            {errors.workField && <span className="error-text">{errors.workField}</span>}
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="onboarding-step">
                        <h2>Education Background 🎓</h2>
                        <p className="step-description">Have you had any education at Game Design Academia?</p>

                        <div className="toggle-group">
                            <button
                                className={`toggle-btn ${!formData.hasGDAEducation ? 'active' : ''}`}
                                onClick={() => setFormData({ ...formData, hasGDAEducation: false })}
                            >
                                <span className="toggle-icon">❌</span>
                                <span>No</span>
                            </button>
                            <button
                                className={`toggle-btn ${formData.hasGDAEducation ? 'active' : ''}`}
                                onClick={() => setFormData({ ...formData, hasGDAEducation: true })}
                            >
                                <span className="toggle-icon">✅</span>
                                <span>Yes</span>
                            </button>
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="onboarding-step">
                        <h2>How did you find us? 🔍</h2>
                        <p className="step-description">We'd love to know how you heard about GDA</p>

                        <div className="form-group">
                            <label htmlFor="referralSource">Tell us your story (optional)</label>
                            <textarea
                                id="referralSource"
                                className="input textarea"
                                value={formData.referralSource}
                                onChange={(e) => setFormData({ ...formData, referralSource: e.target.value })}
                                placeholder="E.g., Social media, friend recommendation, search engine..."
                                rows="4"
                            />
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="onboarding-container">
            <div className="onboarding-content">
                {/* Progress Indicator */}
                <div className="progress-indicator">
                    <div className="progress-steps">
                        {[1, 2, 3, 4].map((num) => (
                            <div
                                key={num}
                                className={`progress-step ${step >= num ? 'active' : ''} ${step === num ? 'current' : ''}`}
                            >
                                {num}
                            </div>
                        ))}
                    </div>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${(step / 4) * 100}%` }}
                        />
                    </div>
                    <p className="progress-text">Step {step} of 4</p>
                </div>

                {/* Step Content */}
                {renderStep()}

                {/* Navigation Buttons */}
                <div className="onboarding-actions">
                    {step > 1 && (
                        <button className="btn btn-secondary" onClick={handleBack}>
                            ← Back
                        </button>
                    )}
                    <button className="btn btn-primary" onClick={handleNext}>
                        {step === 4 ? 'Complete' : 'Next'} →
                    </button>
                </div>
            </div>

            {/* Background */}
            <div className="onboarding-background">
                <div className="bg-pattern"></div>
            </div>
        </div>
    );
};

export default Onboarding;
