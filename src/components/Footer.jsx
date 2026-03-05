import React, { useState } from 'react';
import { dbOperations } from '../database/schema';
import './Footer.css';

const Footer = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error

    const handleSubscribe = async (e) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');
        try {
            await dbOperations.add('newsletter', {
                email,
                subscribedAt: new Date().toISOString()
            });
            setStatus('success');
            setEmail('');
        } catch (error) {
            console.error('Newsletter error:', error);
            setStatus('error');
        }
    };

    return (
        <footer className="footer">
            <div className="footer-content">
                {/* Brand Column */}
                <div className="footer-col brand-col">
                    <div className="footer-logo">
                        <span className="logo-text">GDA</span>
                        <span className="logo-sub">Game Design Academia</span>
                    </div>
                    <p className="footer-slogan">
                        Level Up Your Game Design Skills.<br />
                        Sektörün lider eğitim platformu.
                    </p>
                    <div className="social-links">
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
                        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">YouTube</a>
                    </div>
                </div>

                {/* Links Column */}
                <div className="footer-col links-col">
                    <h4>Site Haritası</h4>
                    <ul>
                        <li><a href="#">Ana Sayfa</a></li>
                        <li><a href="#">Görevler</a></li>
                        <li><a href="#">Community</a></li>
                        <li><a href="#">Kariyer (Bridge)</a></li>
                    </ul>
                </div>

                {/* Contact Column */}
                <div className="footer-col contact-col">
                    <h4>İletişim</h4>
                    <p>Sorularınız için bize ulaşın:</p>
                    <a href="mailto:info@gameuxacademy.com" className="contact-mail">
                        info@gameuxacademy.com
                    </a>
                    <p className="address">
                        İstanbul, Türkiye<br />
                        Teknopark
                    </p>
                </div>

                {/* Newsletter Column */}
                <div className="footer-col newsletter-col">
                    <h4>Bülten Aboneliği</h4>
                    <p>En yeni eğitimlerden ve sektör haberlerinden ilk siz haberdar olun.</p>
                    <form onSubmit={handleSubscribe} className="newsletter-form">
                        <div className="input-group">
                            <input
                                type="email"
                                placeholder="E-posta adresiniz"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={status === 'loading' || status === 'success'}
                            />
                            <button type="submit" disabled={status === 'loading' || status === 'success'}>
                                {status === 'loading' ? '...' : (status === 'success' ? '✓' : 'Kaydol')}
                            </button>
                        </div>
                        {status === 'success' && <span className="msg success">Başarıyla kaydoldunuz!</span>}
                        {status === 'error' && <span className="msg error">Bir hata oluştu. Tekrar deneyin.</span>}
                    </form>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} Game Design Academia. Tüm hakları saklıdır.</p>
            </div>
        </footer>
    );
};

export default Footer;
