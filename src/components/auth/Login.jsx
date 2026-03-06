import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
    const { loginWithGoogle, demoLogin } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            await loginWithGoogle();
            navigate('/Dashboard');
        } catch (err) {
            console.error("Login failed:", err);

            let msg = 'Failed to sign in via Google.';
            const errString = err.toString().toLowerCase();
            const errCode = err.code || '';

            if (
                errCode === 'auth/unauthorized-domain' ||
                errString.includes('unauthorized-domain') ||
                errString.includes('not authorized')
            ) {
                msg = 'Domain Not Authorized - Please contact administrator to enable Google login for this domain.';
            } else if (
                errCode === 'auth/invalid-api-key' ||
                errString.includes('api-key-not-valid') ||
                errString.includes('api_key')
            ) {
                msg = 'Google Login Setup Required';
            } else if (errCode === 'auth/popup-closed-by-user') {
                msg = 'Sign-in cancelled.';
            } else if (errCode === 'auth/popup-blocked') {
                msg = 'Popup blocked by browser. Please allow popups for this site.';
            } else if (err.message) {
                msg = err.message;
            }
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = async () => {
        setLoading(true);
        try {
            await demoLogin();
            navigate('/Dashboard');
        } catch (err) {
            console.error('Demo login failed:', err);
            setError('Demo login failed. Please reload.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            {/* Background Pattern from Onboarding */}
            <div className="login-background">
                <div className="bg-pattern"></div>
            </div>

            <div className="login-content">
                {/* Pre-login Announcement Banner */}
                <div className="pre-login-banner glass">
                    <div className="banner-header">
                        <h3>Game UX Lectures Coming Soon</h3>
                    </div>
                    <a href="/apply-ux-lectures.html" target="_blank" rel="noopener noreferrer" className="btn-banner">
                        Click for Early Registration and Information
                    </a>
                </div>

                <div className="login-card">
                    <div className="login-header">
                        <div className="logo-badge">GDA</div>
                        <h1>Welcome Back</h1>
                        <p className="subtitle">Game UX Analysis & Certification Hub</p>
                    </div>

                    <div className="login-actions">
                        <button
                            onClick={handleGoogleLogin}
                            className="btn-google"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="spinner"></span>
                            ) : (
                                <>
                                    <span className="icon">G</span>
                                    <span>Sign in with Google</span>
                                </>
                            )}
                        </button>

                        {error && (
                            <div className="error-section">
                                <div className="error-msg">⚠️ {error}</div>
                                <div className="fallback-action">
                                    {error === 'Google Login Setup Required' ? (
                                        <p>No valid API Key found. Use <strong>Demo Mode</strong> to enter.</p>
                                    ) : (
                                        <p>Having trouble?</p>
                                    )}
                                    <button onClick={handleDemoLogin} className="btn-demo highlight">
                                        👉 Enter Demo Mode
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="login-footer">
                        <p>Part of the Game Design Academia ecosystem</p>
                        <div className="admin-access-link" onClick={() => navigate('/admin')}>
                            Admin Access
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
