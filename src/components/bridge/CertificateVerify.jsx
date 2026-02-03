import React, { useState } from 'react';

const CertificateVerify = ({ user }) => {
    const [code, setCode] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [verifiedData, setVerifiedData] = useState(null);

    const handleVerify = (e) => {
        e.preventDefault();

        if (code.length < 10) return;

        setStatus('loading');

        // Mock Verification Logic
        setTimeout(() => {
            // Simulate a valid code pattern (e.g., starts with GDA)
            if (code.toUpperCase().startsWith('GDA')) {
                setStatus('success');
                setVerifiedData({
                    studentName: user?.username || "Öğrenci Adı",
                    course: "Game Design Masterclass",
                    issueDate: "15.01.2025",
                    specialization: "Level Design & Mechanics"
                });
            } else {
                setStatus('error');
                setVerifiedData(null);
            }
        }, 1500);
    };

    return (
        <div className="bridge-section verify-section">
            <div className="verify-container">
                <div className="verify-card">
                    <div className="verify-icon">🎓</div>
                    <h2>Sertifika Doğrulama</h2>
                    <p>Sertifikanızın orijinalliğini doğrulayın ve GDA Bridge ağındaki şirketlerle profilinizi eşleştirin.</p>

                    <form onSubmit={handleVerify} className="verify-form">
                        <div className="input-with-button">
                            <input
                                type="text"
                                placeholder="Sertifika Kodu (örn: GDA-2025-XC9)"
                                value={code}
                                onChange={e => setCode(e.target.value)}
                                className="verify-input"
                            />
                            <button type="submit" className="btn-verify" disabled={status === 'loading'}>
                                {status === 'loading' ? 'Kontrol Ediliyor...' : 'Doğrula'}
                            </button>
                        </div>
                    </form>

                    {status === 'error' && (
                        <div className="verify-result error">
                            <span className="result-icon">❌</span>
                            <div className="result-text">
                                <h4>Geçersiz Kod</h4>
                                <p>Girdiğiniz kod sistemde bulunamadı. Lütfen kontrol edip tekrar deneyin.</p>
                            </div>
                        </div>
                    )}

                    {status === 'success' && verifiedData && (
                        <div className="verify-result success">
                            <span className="result-icon">✅</span>
                            <div className="result-text">
                                <h4>Sertifika Doğrulandı!</h4>
                                <div className="cert-details">
                                    <p><strong>Öğrenci:</strong> {verifiedData.studentName}</p>
                                    <p><strong>Program:</strong> {verifiedData.course}</p>
                                    <p><strong>Uzmanlık:</strong> {verifiedData.specialization}</p>
                                    <p><strong>Tarih:</strong> {verifiedData.issueDate}</p>
                                </div>
                                <div className="bridge-connect-message">
                                    <span>🚀</span>
                                    <p>Harika! Profiliniz ve portfolyonuz artık <strong>GDA Bridge Partners</strong> ağında görünür durumda.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CertificateVerify;
