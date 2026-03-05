import React, { useState } from 'react';
import { dbOperations } from '../../database/schema';
import './PassCodeCheck.css';

const PassCodeCheck = () => {
    const [code, setCode] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCheck = async (e) => {
        e.preventDefault();
        if (!code.trim()) return;

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const results = await dbOperations.query('pass_codes', 'number', code.trim());
            if (results && results.length > 0) {
                setResult(results[0]);
            } else {
                setError('Geçersiz Pass Code. Lütfen kontrol edip tekrar deneyin.');
            }
        } catch (err) {
            console.error('Check failed:', err);
            setError('Sorgulama sırasında bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pass-code-check-container">
            <div className="check-card glass-morphism">
                <h3>Pass Code Sorgulama</h3>
                <p>Pass Code'unuzun güncel durumunu ve tanımlı işlevini öğrenmek için aşağıya girin.</p>

                <form onSubmit={handleCheck} className="check-form">
                    <input
                        type="text"
                        placeholder="Örn: GDA-2024-XXXX"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="code-input"
                    />
                    <button type="submit" className="btn-check primary" disabled={loading}>
                        {loading ? 'Sorgulanıyor...' : 'Sorgula'}
                    </button>
                </form>

                {error && <div className="check-error">{error}</div>}

                {result && (
                    <div className="check-result-area animate-fade-in">
                        <div className="result-grid">
                            <div className="result-item">
                                <label>Durum</label>
                                <span className={`status-badge ${result.status === 'active' ? 'active' : 'used'}`}>
                                    {result.status === 'active' ? 'Aktif' : 'Kullanıldı'}
                                </span>
                            </div>
                            <div className="result-item">
                                <label>İşlev / Avantaj</label>
                                <div className="function-text">
                                    {result.function || 'Herhangi bir işlev tanımlanmamış.'}
                                </div>
                            </div>
                            {result.owner && (
                                <div className="result-item">
                                    <label>Kod Sahibi</label>
                                    <div className="owner-text">{result.owner}</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="check-info">
                <h4>Nedir bu Pass Code?</h4>
                <p>GDA Pass Code'lar; program katılımcılarına, çözüm ortaklarına veya kampanya kazananlarına verilen özel kodlardır. Bu kodlar eğitim indirimleri, özel içerik erişimleri veya profil rozetleri için kullanılabilir.</p>
            </div>
        </div>
    );
};

export default PassCodeCheck;
