import React, { useState, useEffect } from 'react';
import { dbOperations } from '../database/schema';
import { PaymentService } from '../services/PaymentService';
import './Checkout.css';

const Checkout = ({ plan, user, refreshUser, onBack, onComplete }) => {
    const [step, setStep] = useState(1); // 1: Billing, 2: Payment, 3: Success, 4: Error
    const [loading, setLoading] = useState(false);
    const [show3DSecure, setShow3DSecure] = useState(false);

    // Billing Info
    const [billingType, setBillingType] = useState('individual');
    const [billingInfo, setBillingInfo] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        address: '',
        city: '',
        country: '',
        zip: '',
        companyName: '',
        taxId: ''
    });

    // Payment Info
    const [cardData, setCardData] = useState({
        number: '',
        holderName: '',
        expiry: '',
        cvc: ''
    });
    const [cardType, setCardType] = useState('Unknown');
    const [isFlipped, setIsFlipped] = useState(false);

    // Validation Errors
    const [errors, setErrors] = useState({});

    // Scroll to top
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [step]);

    // Handle Billing Inputs
    const handleBillingChange = (e) => {
        const { name, value } = e.target;
        setBillingInfo(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    // Handle Card Inputs
    const handleCardChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;

        if (name === 'number') {
            formattedValue = PaymentService.formatCardNumber(value);
            setCardType(PaymentService.getCardType(value));
        } else if (name === 'expiry') {
            formattedValue = PaymentService.formatExpiry(value);
        } else if (name === 'cvc') {
            formattedValue = value.replace(/\D/g, '').slice(0, 4);
        }

        setCardData(prev => ({ ...prev, [name]: formattedValue }));

        // Validation on change
        if (name === 'number') {
            const isValid = PaymentService.isValidLuhn(value);
            setErrors(prev => ({
                ...prev,
                number: isValid || value.length < 14 ? null : 'Invalid Card Number'
            }));
        } else {
            if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleFocus = (e) => {
        if (e.target.name === 'cvc') {
            setIsFlipped(true);
        } else {
            setIsFlipped(false);
        }
    };

    // Validation
    const validateBilling = () => {
        const newErrors = {};
        if (!billingInfo.firstName) newErrors.firstName = 'First Name is required';
        if (!billingInfo.lastName) newErrors.lastName = 'Last Name is required';
        if (!billingInfo.address) newErrors.address = 'Address is required';
        if (!billingInfo.city) newErrors.city = 'City is required';
        if (billingType === 'corporate') {
            if (!billingInfo.companyName) newErrors.companyName = 'Company Name is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validatePayment = () => {
        const newErrors = {};
        if (!cardData.holderName) newErrors.holderName = 'Card Holder Name is required';
        if (cardData.number.length < 15 || !PaymentService.isValidLuhn(cardData.number)) {
            newErrors.number = 'Invalid Card Number';
        }
        if (cardData.expiry.length !== 5) newErrors.expiry = 'Invalid Date (MM/YY)';
        if (cardData.cvc.length < 3) newErrors.cvc = 'Invalid CVC';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const goToPayment = () => {
        if (validateBilling()) setStep(2);
    };

    const handlePaymentSubmit = async () => {
        if (!validatePayment()) return;

        setLoading(true);

        // Simulate 3D Secure
        setTimeout(() => {
            setShow3DSecure(true);

            // Auto finish 3D Secure after 3s
            setTimeout(async () => {
                setShow3DSecure(false);

                try {
                    // Call Fake Payment Service
                    await PaymentService.processPayment({
                        ...cardData,
                        amount: plan.price
                    });

                    // Success
                    if (user) {
                        await dbOperations.update('users', user.id, {
                            ...user,
                            subscriptionTier: plan.name
                        });
                        if (refreshUser) await refreshUser();
                    }

                    setStep(3); // Success Screen
                    setTimeout(() => onComplete(), 4000);

                } catch (error) {
                    console.error('Payment Error', error);
                    setStep(4); // Error Screen
                } finally {
                    setLoading(false);
                }
            }, 3000);
        }, 1500);
    };

    if (!plan) return <div>No plan selected. <button onClick={onBack}>Go Back</button></div>;

    const taxAmount = (parseFloat(plan.price.replace('$', '')) * 0.18).toFixed(2);
    const totalAmount = plan.price;

    return (
        <div className="checkout-container">
            {/* Steps */}
            <div className="checkout-steps">
                <div className={`step-item ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                    <div className="step-circle">{step > 1 ? '✓' : '1'}</div>
                    <span>Billing</span>
                </div>
                <div className="step-line"></div>
                <div className={`step-item ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                    <div className="step-circle">{step > 2 ? '✓' : '2'}</div>
                    <span>Payment</span>
                </div>
                <div className="step-line"></div>
                <div className={`step-item ${step >= 3 ? 'active' : ''}`}>
                    <div className="step-circle">3</div>
                    <span>Confirmation</span>
                </div>
            </div>

            <div className="checkout-content">
                {/* 3D Secure Modal */}
                {show3DSecure && (
                    <div className="secure-modal-overlay">
                        <div className="secure-modal">
                            <h3>3D Secure Verification</h3>
                            <p>Connecting to your bank...</p>
                            <div className="secure-loader"></div>
                            <p className="subtitle" style={{ marginTop: '10px', fontSize: '0.9rem' }}>Please do not close this window.</p>
                        </div>
                    </div>
                )}

                {/* Step 1: Billing */}
                {step === 1 && (
                    <div className="checkout-form-section">
                        <h2>Billing Information</h2>

                        <div className="billing-type-selector">
                            <button className={`type-btn ${billingType === 'individual' ? 'active' : ''}`} onClick={() => setBillingType('individual')}>Individual</button>
                            <button className={`type-btn ${billingType === 'corporate' ? 'active' : ''}`} onClick={() => setBillingType('corporate')}>Corporate</button>
                        </div>

                        <div className="form-grid">
                            <div className="form-group">
                                <label>First Name</label>
                                <input name="firstName" value={billingInfo.firstName} onChange={handleBillingChange} />
                                {errors.firstName && <span className="error-msg">{errors.firstName}</span>}
                            </div>
                            <div className="form-group">
                                <label>Last Name</label>
                                <input name="lastName" value={billingInfo.lastName} onChange={handleBillingChange} />
                                {errors.lastName && <span className="error-msg">{errors.lastName}</span>}
                            </div>

                            {billingType === 'corporate' && (
                                <>
                                    <div className="form-group full-width">
                                        <label>Company Name</label>
                                        <input name="companyName" value={billingInfo.companyName} onChange={handleBillingChange} />
                                        {errors.companyName && <span className="error-msg">{errors.companyName}</span>}
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Tax ID</label>
                                        <input name="taxId" value={billingInfo.taxId} onChange={handleBillingChange} />
                                    </div>
                                </>
                            )}

                            <div className="form-group full-width">
                                <label>Address</label>
                                <input name="address" value={billingInfo.address} onChange={handleBillingChange} />
                                {errors.address && <span className="error-msg">{errors.address}</span>}
                            </div>
                            <div className="form-group">
                                <label>City</label>
                                <input name="city" value={billingInfo.city} onChange={handleBillingChange} />
                                {errors.city && <span className="error-msg">{errors.city}</span>}
                            </div>
                            <div className="form-group">
                                <label>Zip Code</label>
                                <input name="zip" value={billingInfo.zip} onChange={handleBillingChange} />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button className="btn-secondary" onClick={onBack}>Back</button>
                            <button className="btn-primary" onClick={goToPayment}>Continue to Payment</button>
                        </div>
                    </div>
                )}

                {/* Step 2: Payment (New Credit Card Form) */}
                {step === 2 && (
                    <div className="checkout-form-section">
                        <h2>Secure Payment</h2>

                        {/* 3D Card Visual */}
                        <div className="credit-card-visual-wrapper">
                            <div className={`credit-card-visual ${isFlipped ? 'flipped' : ''}`}>
                                <div className="card-inner">
                                    <div className="card-front">
                                        <div className="card-chip"></div>
                                        <div className="card-logo">{cardType !== 'Unknown' ? cardType : 'GDA Bank'}</div>
                                        <div className="card-number-display">{cardData.number || '•••• •••• •••• ••••'}</div>
                                        <div className="card-details-row">
                                            <div>
                                                <div className="card-label">Card Holder</div>
                                                <div>{cardData.holderName || 'FULL NAME'}</div>
                                            </div>
                                            <div>
                                                <div className="card-label">Expires</div>
                                                <div>{cardData.expiry || 'MM/YY'}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card-back">
                                        <div className="magnetic-strip"></div>
                                        <div className="cvc-display">{cardData.cvc || 'CVC'}</div>
                                        <div className="card-logo" style={{ textAlign: 'right', marginTop: 'auto' }}>GDA Bank</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label>Card Number</label>
                                <input
                                    name="number"
                                    value={cardData.number}
                                    onChange={handleCardChange}
                                    onFocus={handleFocus}
                                    placeholder="0000 0000 0000 0000"
                                    maxLength="19"
                                    className={errors.number ? 'error' : ''}
                                />
                                {errors.number && <span className="error-msg">{errors.number}</span>}
                            </div>

                            <div className="form-group full-width">
                                <label>Card Holder Name</label>
                                <input
                                    name="holderName"
                                    value={cardData.holderName}
                                    onChange={handleCardChange}
                                    onFocus={handleFocus}
                                    placeholder="MERT DEMIR"
                                    className={errors.holderName ? 'error' : ''}
                                />
                                {errors.holderName && <span className="error-msg">{errors.holderName}</span>}
                            </div>

                            <div className="form-group">
                                <label>Expiry Date</label>
                                <input
                                    name="expiry"
                                    value={cardData.expiry}
                                    onChange={handleCardChange}
                                    onFocus={handleFocus}
                                    placeholder="MM/YY"
                                    maxLength="5"
                                    className={errors.expiry ? 'error' : ''}
                                />
                                {errors.expiry && <span className="error-msg">{errors.expiry}</span>}
                            </div>

                            <div className="form-group">
                                <label>CVC / CVV</label>
                                <input
                                    name="cvc"
                                    value={cardData.cvc}
                                    onChange={handleCardChange}
                                    onFocus={handleFocus}
                                    placeholder="123"
                                    maxLength="4"
                                    className={errors.cvc ? 'error' : ''}
                                />
                                {errors.cvc && <span className="error-msg">{errors.cvc}</span>}
                            </div>
                        </div>

                        <div className="secure-badge" style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.8rem', color: '#aaa' }}>
                            🔒 256-bit SSL Encrypted • {cardType} Secure Payment
                        </div>

                        <div className="form-actions">
                            <button className="btn-secondary" onClick={() => setStep(1)} disabled={loading}>Back</button>
                            <button className="btn-primary" onClick={handlePaymentSubmit} disabled={loading}>
                                {loading ? 'Processing...' : `Pay ${plan.price}`}
                            </button>
                        </div>
                    </div>
                )}

                {/* Summary Panel */}
                {(step === 1 || step === 2) && (
                    <div className="order-summary">
                        <h3>Order Summary</h3>
                        <div className="summary-row">
                            <span className="summary-label">Plan</span>
                            <span className="summary-value highlight">{plan.name} Package</span>
                        </div>
                        <div className="summary-row">
                            <span className="summary-label">Billing Cycle</span>
                            <span className="summary-value">Monthly</span>
                        </div>
                        <div className="summary-row">
                            <span className="summary-label">Price</span>
                            <span className="summary-value">{totalAmount}</span>
                        </div>
                        <div className="summary-row">
                            <span className="summary-label">Tax (18%)</span>
                            <span className="summary-value">${taxAmount}</span>
                        </div>
                        <div className="summary-divider"></div>
                        <div className="summary-row total">
                            <span>Total</span>
                            <span>{totalAmount}</span>
                        </div>
                    </div>
                )}

                {/* Success Screen */}
                {step === 3 && (
                    <div className="success-screen" style={{ gridColumn: 'span 2', textAlign: 'center', padding: '50px' }}>
                        {/* Emoji inside div for React compatibility */}
                        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎉</div>
                        <h2 style={{ color: '#fff', fontSize: '2rem' }}>Subscription Activated!</h2>
                        <p style={{ color: '#ccc', margin: '15px 0' }}>Welcome to the <strong>{plan.name}</strong> plan.</p>
                        <p style={{ color: 'var(--gda-accent-primary)' }}>Redirecting to dashboard...</p>
                    </div>
                )}

                {/* Error Screen */}
                {step === 4 && (
                    <div className="error-screen" style={{ gridColumn: 'span 2', textAlign: 'center', padding: '50px' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>❌</div>
                        <h2 style={{ color: '#ff4757', fontSize: '2rem' }}>Transaction Failed</h2>
                        <p style={{ color: '#ccc', margin: '15px 0' }}>Your bank declined the transaction. Please check your card balance.</p>
                        <button className="btn-primary" onClick={() => setStep(2)}>Try Again</button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Checkout;
