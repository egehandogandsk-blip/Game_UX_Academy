import React, { useState, useEffect } from 'react';
import { dbOperations } from '../database/schema';
import './Checkout.css';

const Checkout = ({ plan, user, onBack, onComplete }) => {
    const [step, setStep] = useState(1); // 1: Billing, 2: Payment, 3: Success, 4: Error
    const [loading, setLoading] = useState(false);

    // Billing Info
    const [billingType, setBillingType] = useState('individual'); // individual, corporate
    const [billingInfo, setBillingInfo] = useState({
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        country: '',
        zip: '',
        companyName: '',
        taxId: ''
    });

    // Payment Info
    const [paymentInfo, setPaymentInfo] = useState({
        cardName: '',
        cardNumber: '',
        expiry: '',
        cvc: ''
    });

    // Validation Errors
    const [errors, setErrors] = useState({});

    // Scroll to top on step change
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [step]);

    // Handle Input Changes
    const handleBillingChange = (e) => {
        const { name, value } = e.target;
        setBillingInfo(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handlePaymentChange = (e) => {
        const { name, value } = e.target;
        setPaymentInfo(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    // Format Card Number
    const handleCardNumberChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 16) value = value.slice(0, 16);
        value = value.replace(/(\d{4})/g, '$1 ').trim();
        setPaymentInfo(prev => ({ ...prev, cardNumber: value }));
        if (errors.cardNumber) setErrors(prev => ({ ...prev, cardNumber: null }));
    };

    // Format Expiry
    const handleExpiryChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 4) value = value.slice(0, 4);
        if (value.length > 2) value = value.slice(0, 2) + '/' + value.slice(2);
        setPaymentInfo(prev => ({ ...prev, expiry: value }));
        if (errors.expiry) setErrors(prev => ({ ...prev, expiry: null }));
    };

    // Validation
    const validateBilling = () => {
        const newErrors = {};
        if (!billingInfo.firstName) newErrors.firstName = 'First Name is required';
        if (!billingInfo.lastName) newErrors.lastName = 'Last Name is required';
        if (!billingInfo.address) newErrors.address = 'Address is required';
        if (!billingInfo.city) newErrors.city = 'City is required';
        if (!billingInfo.country) newErrors.country = 'Country is required';

        if (billingType === 'corporate') {
            if (!billingInfo.companyName) newErrors.companyName = 'Company Name is required';
            if (!billingInfo.taxId) newErrors.taxId = 'Tax ID is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validatePayment = () => {
        const newErrors = {};
        if (!paymentInfo.cardName) newErrors.cardName = 'Cardholder Name is required';
        if (!paymentInfo.cardNumber || paymentInfo.cardNumber.length < 19) newErrors.cardNumber = 'Valid Card Number is required';
        if (!paymentInfo.expiry || paymentInfo.expiry.length < 5) newErrors.expiry = 'Valid Expiry Date required';
        if (!paymentInfo.cvc || paymentInfo.cvc.length < 3) newErrors.cvc = 'CVC is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Navigation Steps
    const goToPayment = () => {
        if (validateBilling()) {
            setStep(2);
        }
    };

    const processPayment = async () => {
        if (!validatePayment()) return;

        setLoading(true);

        // Simulate API call
        setTimeout(async () => {
            setLoading(false);

            // Randomly succeed or fail (but for demo we mostly succeed unless hardcoded)
            // Just satisfy the user request: "if info missing -> fail" (already handled by validation)
            // If validation passed, let's succeed.

            try {
                // Update User
                if (user) {
                    await dbOperations.update('users', user.id, {
                        ...user,
                        subscriptionTier: plan.name // Starter, Pro, Elite
                    });
                }
                setStep(3); // Success

                // Redirect after 3 seconds
                setTimeout(() => {
                    onComplete();
                }, 3000);
            } catch (error) {
                console.error("Payment error", error);
                setStep(4); // Error (though unlikely with mock)
            }

        }, 2000);
    };

    if (!plan) return <div>No plan selected. <button onClick={onBack}>Go Back</button></div>;

    return (
        <div className="checkout-container">
            {/* Steps Indicator */}
            <div className="checkout-steps">
                <div className={`step-item ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                    <div className="step-circle">1</div>
                    <span>Billing</span>
                </div>
                <div className="step-line"></div>
                <div className={`step-item ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                    <div className="step-circle">2</div>
                    <span>Payment</span>
                </div>
                <div className="step-line"></div>
                <div className={`step-item ${step >= 3 ? 'active' : ''}`}>
                    <div className="step-circle">3</div>
                    <span>Confirmation</span>
                </div>
            </div>

            <div className="checkout-content">
                {/* Step 1: Billing Info */}
                {step === 1 && (
                    <div className="checkout-form-section">
                        <h2>Billing Information</h2>

                        <div className="billing-type-selector">
                            <button
                                className={`type-btn ${billingType === 'individual' ? 'active' : ''}`}
                                onClick={() => setBillingType('individual')}
                            >
                                Individual
                            </button>
                            <button
                                className={`type-btn ${billingType === 'corporate' ? 'active' : ''}`}
                                onClick={() => setBillingType('corporate')}
                            >
                                Corporate
                            </button>
                        </div>

                        <div className="form-grid">
                            <div className="form-group">
                                <label>First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={billingInfo.firstName}
                                    onChange={handleBillingChange}
                                    className={errors.firstName ? 'error' : ''}
                                />
                                {errors.firstName && <span className="error-msg">{errors.firstName}</span>}
                            </div>
                            <div className="form-group">
                                <label>Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={billingInfo.lastName}
                                    onChange={handleBillingChange}
                                    className={errors.lastName ? 'error' : ''}
                                />
                                {errors.lastName && <span className="error-msg">{errors.lastName}</span>}
                            </div>

                            {billingType === 'corporate' && (
                                <>
                                    <div className="form-group full-width">
                                        <label>Company Name</label>
                                        <input
                                            type="text"
                                            name="companyName"
                                            value={billingInfo.companyName}
                                            onChange={handleBillingChange}
                                            className={errors.companyName ? 'error' : ''}
                                        />
                                        {errors.companyName && <span className="error-msg">{errors.companyName}</span>}
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Tax ID / VKN</label>
                                        <input
                                            type="text"
                                            name="taxId"
                                            value={billingInfo.taxId}
                                            onChange={handleBillingChange}
                                            className={errors.taxId ? 'error' : ''}
                                        />
                                        {errors.taxId && <span className="error-msg">{errors.taxId}</span>}
                                    </div>
                                </>
                            )}

                            <div className="form-group full-width">
                                <label>Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={billingInfo.address}
                                    onChange={handleBillingChange}
                                    className={errors.address ? 'error' : ''}
                                />
                                {errors.address && <span className="error-msg">{errors.address}</span>}
                            </div>
                            <div className="form-group">
                                <label>City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={billingInfo.city}
                                    onChange={handleBillingChange}
                                    className={errors.city ? 'error' : ''}
                                />
                                {errors.city && <span className="error-msg">{errors.city}</span>}
                            </div>
                            <div className="form-group">
                                <label>Zip Code</label>
                                <input
                                    type="text"
                                    name="zip"
                                    value={billingInfo.zip}
                                    onChange={handleBillingChange}
                                />
                            </div>
                            <div className="form-group full-width">
                                <label>Country</label>
                                <select
                                    name="country"
                                    value={billingInfo.country}
                                    onChange={handleBillingChange}
                                    className={errors.country ? 'error' : ''}
                                >
                                    <option value="">Select Country</option>
                                    <option value="Turkey">Turkey</option>
                                    <option value="USA">USA</option>
                                    <option value="UK">UK</option>
                                    <option value="Germany">Germany</option>
                                </select>
                                {errors.country && <span className="error-msg">{errors.country}</span>}
                            </div>
                        </div>

                        <div className="form-actions">
                            <button className="btn-secondary" onClick={onBack}>Back</button>
                            <button className="btn-primary" onClick={goToPayment}>Next To Payment</button>
                        </div>
                    </div>
                )}

                {/* Step 2: Payment Info */}
                {step === 2 && (
                    <div className="checkout-form-section">
                        <h2>Payment Details</h2>
                        <div className="credit-card-preview">
                            <div className="cc-chip"></div>
                            <div className="cc-number">{paymentInfo.cardNumber || '**** **** **** ****'}</div>
                            <div className="cc-holder">
                                <span>{paymentInfo.cardName || 'CARD HOLDER'}</span>
                                <span>{paymentInfo.expiry || 'MM/YY'}</span>
                            </div>
                            <div className="cc-logo">VISA</div>
                        </div>

                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label>Cardholder Name</label>
                                <input
                                    type="text"
                                    name="cardName"
                                    value={paymentInfo.cardName}
                                    onChange={handlePaymentChange}
                                    className={errors.cardName ? 'error' : ''}
                                    placeholder="JOHN DOE"
                                />
                                {errors.cardName && <span className="error-msg">{errors.cardName}</span>}
                            </div>
                            <div className="form-group full-width">
                                <label>Card Number</label>
                                <input
                                    type="text"
                                    name="cardNumber"
                                    value={paymentInfo.cardNumber}
                                    onChange={handleCardNumberChange}
                                    className={errors.cardNumber ? 'error' : ''}
                                    placeholder="0000 0000 0000 0000"
                                    maxLength="19"
                                />
                                {errors.cardNumber && <span className="error-msg">{errors.cardNumber}</span>}
                            </div>
                            <div className="form-group">
                                <label>Expiration Date</label>
                                <input
                                    type="text"
                                    name="expiry"
                                    value={paymentInfo.expiry}
                                    onChange={handleExpiryChange}
                                    className={errors.expiry ? 'error' : ''}
                                    placeholder="MM/YY"
                                    maxLength="5"
                                />
                                {errors.expiry && <span className="error-msg">{errors.expiry}</span>}
                            </div>
                            <div className="form-group">
                                <label>CVC</label>
                                <input
                                    type="text"
                                    name="cvc"
                                    value={paymentInfo.cvc}
                                    onChange={handlePaymentChange}
                                    className={errors.cvc ? 'error' : ''}
                                    placeholder="123"
                                    maxLength="4"
                                />
                                {errors.cvc && <span className="error-msg">{errors.cvc}</span>}
                            </div>
                        </div>

                        <div className="form-actions">
                            <button className="btn-secondary" onClick={() => setStep(1)} disabled={loading}>Back</button>
                            <button className="btn-primary btn-success" onClick={processPayment} disabled={loading}>
                                {loading ? 'Processing...' : `Pay ${plan.price}`}
                            </button>
                        </div>
                    </div>
                )}

                {/* Order Summary - Always Visible on specific steps */}
                {(step === 1 || step === 2) && (
                    <div className="order-summary">
                        <h3>Order Summary</h3>
                        <div className="summary-card">
                            <div className="summary-row">
                                <span className="summary-label">Plan</span>
                                <span className="summary-value highlight">{plan.name}</span>
                            </div>
                            <div className="summary-row">
                                <span className="summary-label">Billing Cycle</span>
                                <span className="summary-value">Monthly</span>
                            </div>
                            <div className="summary-divider"></div>
                            <div className="summary-row total">
                                <span>Total</span>
                                <span>{plan.price}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Success */}
                {step === 3 && (
                    <div className="success-screen">
                        <div className="success-icon">🎉</div>
                        <h2>Payment Successful!</h2>
                        <p>Thank you for subscribing to the <strong>{plan.name}</strong> plan.</p>
                        <p className="redirect-msg">You are being redirected to your dashboard...</p>
                    </div>
                )}

                {/* Step 4: Generic Error (Fallback) */}
                {step === 4 && (
                    <div className="error-screen">
                        <div className="error-icon">❌</div>
                        <h2>Payment Failed</h2>
                        <p>Something went wrong with the transaction.</p>
                        <button className="btn-primary" onClick={() => setStep(2)}>Try Again</button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Checkout;
