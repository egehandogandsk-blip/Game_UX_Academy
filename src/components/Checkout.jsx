import React, { useState, useEffect, useCallback } from 'react';
import { useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement, PaymentRequestButtonElement } from '@stripe/react-stripe-js';
import { dbOperations } from '../database/schema';
import { StripeService } from '../services/StripeService';
import './Checkout.css';

const Checkout = ({ plan, user, refreshUser, onBack, onComplete }) => {
    const stripe = useStripe();
    const elements = useElements();

    const [step, setStep] = useState(1); // 1: Billing, 2: Payment, 3: Success, 4: Error
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('card'); // 'card', 'link', 'express'

    // Express Payment (Apple/Google Pay)
    const [paymentRequest, setPaymentRequest] = useState(null);

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

    // Link Payment Demo Info
    const [linkInfo, setLinkInfo] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: '',
        address: ''
    });

    // Card state for visual display only
    const [cardVisual, setCardVisual] = useState({
        number: '•••• •••• •••• ••••',
        holderName: user?.username || 'FULL NAME',
        expiry: 'MM/YY',
        cvc: '•••'
    });
    const [cardType, setCardType] = useState('Unknown');
    const [isFlipped, setIsFlipped] = useState(false);

    // Validation Errors
    const [errors, setErrors] = useState({});

    // Stripe Payment Request Effect
    useEffect(() => {
        if (stripe && plan) {
            const pr = stripe.paymentRequest({
                country: 'US',
                currency: 'usd',
                total: {
                    label: `${plan.name} Plan`,
                    amount: Math.round(parseFloat(plan.price.replace('$', '')) * 100),
                },
                requestPayerName: true,
                requestPayerEmail: true,
            });

            pr.canMakePayment().then(result => {
                if (result) {
                    setPaymentRequest(pr);
                }
            });

            pr.on('paymentmethod', async (ev) => {
                ev.complete('success');
                handleSuccess(ev.paymentMethod.id);
            });
        }
    }, [stripe, plan, handleSuccess]);

    // Scroll to top
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [step]);

    // Handle Billing Inputs
    const handleBillingChange = (e) => {
        const { name, value } = e.target;
        setBillingInfo(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));

        if (name === 'firstName' || name === 'lastName') {
            setCardVisual(prev => ({ ...prev, holderName: `${billingInfo.firstName} ${billingInfo.lastName}`.toUpperCase() }));
        }
    };

    const handleLinkChange = (e) => {
        const { name, value } = e.target;
        setLinkInfo(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleStripeChange = (event, field) => {
        if (event.error) {
            setErrors(prev => ({ ...prev, [field]: event.error.message }));
        } else {
            setErrors(prev => ({ ...prev, [field]: null }));
        }

        if (field === 'number' && event.brand) {
            setCardType(event.brand.charAt(0).toUpperCase() + event.brand.slice(1));
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

    const validateLinkInfo = () => {
        const newErrors = {};
        if (!linkInfo.firstName) newErrors.firstName = 'First Name is required';
        if (!linkInfo.lastName) newErrors.lastName = 'Last Name is required';
        if (!linkInfo.email) newErrors.email = 'Email is required';
        if (!linkInfo.phone) newErrors.phone = 'Phone is required';
        if (!linkInfo.address) newErrors.address = 'Address is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const goToPayment = () => {
        if (validateBilling()) setStep(2);
    };

    const handleSuccess = useCallback(async (trxId = 'TEST_TRX') => {
        if (user) {
            await dbOperations.update('users', user.id, {
                ...user,
                subscriptionTier: plan.name,
                planId: plan.id,
                subscriptionStatus: 'active'
            });

            await dbOperations.add('subscriptions', {
                userId: user.id,
                plan: plan.name,
                date: new Date().toISOString(),
                amount: plan.price,
                transactionId: trxId
            });

            if (refreshUser) await refreshUser();
        }

        setStep(3); // Success Screen
        setTimeout(() => onComplete(), 5000);
    }, [user, plan, refreshUser, onComplete]);

    const handleCardPayment = useCallback(async () => {
        if (!stripe || !elements) return;
        setLoading(true);
        setErrors({});

        try {
            const result = await StripeService.confirmPayment(stripe, elements, billingInfo);
            if (result.error) {
                setErrors({ stripe: result.error.message });
                setLoading(false);
                return;
            }
            handleSuccess(result.paymentMethod?.id);
        } catch (error) {
            console.error('Payment Error', error);
            setStep(4);
        } finally {
            setLoading(false);
        }
    }, [stripe, elements, billingInfo, handleSuccess]);

    const handleLinkSubmit = async () => {
        if (!validateLinkInfo()) return;
        setLoading(true);
        // Simulate demo "Send" action
        setTimeout(() => {
            console.log('Link Payment Info Submitted (Demo):', linkInfo);
            handleSuccess('LINK_DEMO_TRX');
        }, 2000);
    };

    if (!plan) return <div className="p-8">No plan selected. <button className="btn-primary" onClick={onBack}>Go Back</button></div>;

    const taxAmount = (parseFloat(plan.price.replace('$', '')) * 0.18).toFixed(2);
    const totalAmount = plan.price;

    const stripeElementOptions = {
        style: {
            base: {
                color: '#ffffff',
                fontFamily: 'Inter, sans-serif',
                fontSmoothing: 'antialiased',
                fontSize: '16px',
                '::placeholder': {
                    color: 'rgba(255, 255, 255, 0.3)',
                },
            },
            invalid: {
                color: '#ff4757',
                iconColor: '#ff4757',
            },
        },
    };

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
                                <input name="firstName" value={billingInfo.firstName} onChange={handleBillingChange} placeholder="John" />
                                {errors.firstName && <span className="error-msg">{errors.firstName}</span>}
                            </div>
                            <div className="form-group">
                                <label>Last Name</label>
                                <input name="lastName" value={billingInfo.lastName} onChange={handleBillingChange} placeholder="Doe" />
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
                                <input name="address" value={billingInfo.address} onChange={handleBillingChange} placeholder="Main St 123" />
                                {errors.address && <span className="error-msg">{errors.address}</span>}
                            </div>
                            <div className="form-group">
                                <label>City</label>
                                <input name="city" value={billingInfo.city} onChange={handleBillingChange} placeholder="New York" />
                                {errors.city && <span className="error-msg">{errors.city}</span>}
                            </div>
                            <div className="form-group">
                                <label>Zip Code</label>
                                <input name="zip" value={billingInfo.zip} onChange={handleBillingChange} placeholder="10001" />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button className="btn-secondary" onClick={onBack}>Back</button>
                            <button className="btn-primary" onClick={goToPayment}>Continue to Payment</button>
                        </div>
                    </div>
                )}

                {/* Step 2: Payment */}
                {step === 2 && (
                    <div className="checkout-form-section">
                        <h2>Secure Payment</h2>

                        {/* Payment Method Tabs */}
                        <div className="payment-method-tabs">
                            <button className={`method-tab ${paymentMethod === 'card' ? 'active' : ''}`} onClick={() => setPaymentMethod('card')}>Credit Card</button>
                            {paymentRequest && (
                                <button className={`method-tab ${paymentMethod === 'express' ? 'active' : ''}`} onClick={() => setPaymentMethod('express')}>Apple/Google Pay</button>
                            )}
                            <button className={`method-tab ${paymentMethod === 'link' ? 'active' : ''}`} onClick={() => setPaymentMethod('link')}>Link ile Ödeme</button>
                        </div>

                        {paymentMethod === 'card' && (
                            <>
                                {/* 3D Card Visual */}
                                <div className="credit-card-visual-wrapper">
                                    <div className={`credit-card-visual ${isFlipped ? 'flipped' : ''}`}>
                                        <div className="card-inner">
                                            <div className="card-front">
                                                <div className="card-chip"></div>
                                                <div className="card-logo">{cardType !== 'Unknown' ? cardType : 'Stripe'}</div>
                                                <div className="card-number-display">{cardVisual.number}</div>
                                                <div className="card-details-row">
                                                    <div>
                                                        <div className="card-label">Card Holder</div>
                                                        <div>{cardVisual.holderName}</div>
                                                    </div>
                                                    <div>
                                                        <div className="card-label">Expires</div>
                                                        <div>{cardVisual.expiry}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card-back">
                                                <div className="magnetic-strip"></div>
                                                <div className="cvc-display">{cardVisual.cvc}</div>
                                                <div className="card-logo" style={{ textAlign: 'right', marginTop: 'auto' }}>SECURE</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-grid">
                                    <div className="form-group full-width">
                                        <label>Card Number</label>
                                        <div className={`stripe-input-wrapper ${errors.number ? 'error' : ''}`}>
                                            <CardNumberElement
                                                options={stripeElementOptions}
                                                onChange={(e) => handleStripeChange(e, 'number')}
                                                onFocus={() => setIsFlipped(false)}
                                            />
                                        </div>
                                        {errors.number && <span className="error-msg">{errors.number}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label>Expiry Date</label>
                                        <div className={`stripe-input-wrapper ${errors.expiry ? 'error' : ''}`}>
                                            <CardExpiryElement
                                                options={stripeElementOptions}
                                                onChange={(e) => handleStripeChange(e, 'expiry')}
                                                onFocus={() => setIsFlipped(false)}
                                            />
                                        </div>
                                        {errors.expiry && <span className="error-msg">{errors.expiry}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label>CVC / CVV</label>
                                        <div className={`stripe-input-wrapper ${errors.cvc ? 'error' : ''}`}>
                                            <CardCvcElement
                                                options={stripeElementOptions}
                                                onChange={(e) => handleStripeChange(e, 'cvc')}
                                                onFocus={() => setIsFlipped(true)}
                                            />
                                        </div>
                                        {errors.cvc && <span className="error-msg">{errors.cvc}</span>}
                                    </div>

                                    {errors.stripe && (
                                        <div className="form-group full-width">
                                            <span className="error-msg" style={{ textAlign: 'center', display: 'block' }}>{errors.stripe}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="form-actions">
                                    <button className="btn-secondary" onClick={() => setStep(1)} disabled={loading}>Back</button>
                                    <button className="btn-primary" onClick={handleCardPayment} disabled={loading || !stripe}>
                                        {loading ? 'Processing...' : `Pay ${plan.price}`}
                                    </button>
                                </div>
                            </>
                        )}

                        {paymentMethod === 'express' && paymentRequest && (
                            <div className="express-payment-section">
                                <p className="subtitle" style={{ marginBottom: '20px', textAlign: 'center', color: '#aaa' }}>Fast checkout with Apple/Google Pay</p>
                                <PaymentRequestButtonElement options={{ paymentRequest }} />
                                <div className="form-actions" style={{ marginTop: '40px' }}>
                                    <button className="btn-secondary" onClick={() => setStep(1)}>Back</button>
                                </div>
                            </div>
                        )}

                        {paymentMethod === 'link' && (
                            <div className="link-payment-section">
                                <p className="subtitle" style={{ marginBottom: '20px', color: '#aaa' }}>Link ile Ödeme Formu (Demo)</p>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>İsim</label>
                                        <input name="firstName" value={linkInfo.firstName} onChange={handleLinkChange} placeholder="İsim" />
                                        {errors.firstName && <span className="error-msg">{errors.firstName}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Soyisim</label>
                                        <input name="lastName" value={linkInfo.lastName} onChange={handleLinkChange} placeholder="Soyisim" />
                                        {errors.lastName && <span className="error-msg">{errors.lastName}</span>}
                                    </div>
                                    <div className="form-group full-width">
                                        <label>E-posta</label>
                                        <input name="email" value={linkInfo.email} onChange={handleLinkChange} placeholder="ornek@mail.com" />
                                        {errors.email && <span className="error-msg">{errors.email}</span>}
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Telefon</label>
                                        <input name="phone" value={linkInfo.phone} onChange={handleLinkChange} placeholder="+90 5xx xxx xx xx" />
                                        {errors.phone && <span className="error-msg">{errors.phone}</span>}
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Adres</label>
                                        <textarea
                                            name="address"
                                            value={linkInfo.address}
                                            onChange={handleLinkChange}
                                            placeholder="Açık adresiniz..."
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                borderRadius: 'var(--radius-md)',
                                                padding: '12px',
                                                color: '#fff',
                                                minHeight: '100px'
                                            }}
                                        />
                                        {errors.address && <span className="error-msg">{errors.address}</span>}
                                    </div>
                                </div>
                                <div className="form-actions" style={{ marginTop: '30px' }}>
                                    <button className="btn-secondary" onClick={() => setStep(1)}>Geri</button>
                                    <button className="btn-primary" onClick={handleLinkSubmit} disabled={loading}>
                                        {loading ? 'Gönderiliyor...' : 'Gönder'}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="secure-badge" style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.8rem', color: '#aaa' }}>
                            🔒 PCI-DSS Compliant • 256-bit SSL Encrypted • Powered by Stripe
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
                        <p style={{ color: '#ccc', margin: '15px 0' }}>An error occurred while processing your payment. Please try again.</p>
                        <button className="btn-primary" onClick={() => setStep(2)}>Try Again</button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Checkout;
