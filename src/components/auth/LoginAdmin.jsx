import React, { useState } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Reusing Login styles for consistency

const LoginAdmin = () => {
    const { adminLogin } = useAdmin();
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const success = await adminLogin(credentials.username, credentials.password);
            if (success) {
                // Admin state updated in context, App.jsx handles the redirect/render
                navigate('/admin');
            } else {
                setError('Invalid credentials');
            }
        } catch (err) {
            setError('System error during login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-background">
                <div className="bg-pattern" style={{ filter: 'hue-rotate(180deg)' }}></div>
            </div>

            <div className="login-content">
                <div className="login-card" style={{ borderColor: '#64b5f6' }}>
                    <div className="login-header">
                        <div className="logo-badge" style={{ borderColor: '#64b5f6', color: '#64b5f6' }}>ADM</div>
                        <h1>Admin Access</h1>
                        <p className="subtitle">System Management Portal</p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-actions">
                        <div className="form-group">
                            <input
                                type="text"
                                className="input"
                                placeholder="Username"
                                value={credentials.username}
                                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                                style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="password"
                                className="input"
                                placeholder="Password"
                                value={credentials.password}
                                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn-google"
                            disabled={loading}
                            style={{ background: '#64b5f6', color: '#000', justifyContent: 'center' }}
                        >
                            {loading ? <span className="spinner"></span> : 'Login to Console'}
                        </button>

                        {error && (
                            <div className="error-section">
                                <div className="error-msg">⚠️ {error}</div>
                            </div>
                        )}
                    </form>

                    <div className="login-footer">
                        <div className="admin-access-link" onClick={() => navigate('/login')}>
                            ← Back to User Login
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginAdmin;
