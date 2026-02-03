import React, { useState } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import './Login.css';

const Login = ({ onLogin }) => {
    const [loading, setLoading] = useState(false);
    const [showAdminLogin, setShowAdminLogin] = useState(false);
    const [adminUsername, setAdminUsername] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [adminError, setAdminError] = useState('');

    const { adminLogin } = useAdmin();

    const handleDeveloperLogin = async () => {
        setLoading(true);
        // Simulate login delay
        setTimeout(async () => {
            // Get or create demo user
            const { dbOperations } = await import('../../database/schema');
            const users = await dbOperations.getAll('users');

            let demoUser = users.find(u => u.email === 'demo@gda.com');

            if (!demoUser) {
                // Create demo user if not exists
                const userId = await dbOperations.add('users', {
                    email: 'demo@gda.com',
                    username: 'GDAUser',
                    fullName: '',
                    xp: 0,
                    level: 1,
                    badges: [],
                    createdAt: new Date().toISOString(),
                    bio: '',
                    profilePhoto: '',
                    coverPhoto: '',
                    socialLinks: {
                        behance: '',
                        artstation: '',
                        linkedin: '',
                        instagram: '',
                        facebook: '',
                        github: '',
                        reddit: '',
                        xboxProfile: '',
                        steamProfile: '',
                        epicProfile: '',
                        twitter: '',
                        medium: ''
                    },
                    favoriteSoftware: [],
                    workField: '',
                    hasGDAEducation: false,
                    referralSource: '',
                    hasCompletedOnboarding: false,
                    onboardingStep: 0
                });

                demoUser = { id: userId, email: 'demo@gda.com', hasCompletedOnboarding: false };
            }

            onLogin(demoUser);
            setLoading(false);
        }, 800);
    };

    const handleGoogleLogin = () => {
        // Placeholder for Google OAuth
        alert('Google Sign-In coming soon! Use Developer Login for now.');
    };

    const handleAdminLogin = (e) => {
        e.preventDefault();
        setAdminError('');

        const success = adminLogin(adminUsername, adminPassword);

        if (success) {
            // Redirect to admin panel
            window.location.href = '/admin';
        } else {
            setAdminError('Invalid admin credentials');
            setAdminPassword('');
        }
    };

    return (
        <div className="login-container">
            <div className="login-content">
                {/* Logo */}
                <div className="login-logo">
                    <img src="/gda-logo.png" alt="GDA Logo" className="logo-image" />
                    <h1 className="logo-text">Game Design Academia</h1>
                    <p className="logo-subtitle">Master Game UI/UX Through Real Case Studies</p>
                </div>

                {/* Login Buttons */}
                <div className="login-buttons">
                    <button
                        className="btn btn-google"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                    >
                        <span className="google-icon">G</span>
                        Continue with Google
                    </button>

                    <div className="login-divider">
                        <span>or</span>
                    </div>

                    <button
                        className="btn btn-developer"
                        onClick={handleDeveloperLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="loading-spinner"></span>
                        ) : (
                            <>
                                <span className="dev-icon">👨‍💻</span>
                                Developer Login
                            </>
                        )}
                    </button>
                </div>

                {/* Footer */}
                <div className="login-footer">
                    <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
                </div>
            </div>

            {/* Admin Login Button (Bottom Right) */}
            <button
                className="admin-login-trigger"
                onClick={() => setShowAdminLogin(true)}
                title="Admin Login"
            >
                🔐
            </button>

            {/* Admin Login Modal */}
            {showAdminLogin && (
                <div className="admin-login-modal-overlay" onClick={() => setShowAdminLogin(false)}>
                    <div className="admin-login-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h3>🔐 Admin Login</h3>
                            <button
                                className="admin-modal-close"
                                onClick={() => setShowAdminLogin(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleAdminLogin} className="admin-login-form">
                            <div className="form-group">
                                <label>Username</label>
                                <input
                                    type="text"
                                    value={adminUsername}
                                    onChange={(e) => setAdminUsername(e.target.value)}
                                    placeholder="Enter admin username"
                                    autoFocus
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Password</label>
                                <input
                                    type="password"
                                    value={adminPassword}
                                    onChange={(e) => setAdminPassword(e.target.value)}
                                    placeholder="Enter admin password"
                                    required
                                />
                            </div>

                            {adminError && (
                                <div className="admin-error">
                                    {adminError}
                                </div>
                            )}

                            <button type="submit" className="btn btn-admin-login">
                                Login to Admin Panel
                            </button>
                        </form>

                        <div className="admin-hint">
                            <small>Default: admin / admin123</small>
                        </div>
                    </div>
                </div>
            )}

            {/* Animated Background */}
            <div className="login-background">
                <div className="bg-grid"></div>
                <div className="bg-gradient"></div>
            </div>
        </div>
    );
};

export default Login;
