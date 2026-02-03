import React, { useState } from 'react';

const JobApplication = ({ job, user, onClose }) => {
    const [formData, setFormData] = useState({
        fullName: user?.username || '',
        email: user?.email || '', // In real app, user object might have email
        portfolioUrl: '',
        coverLetter: '',
        cvFile: null
    });

    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitting(true);

        // Mock API call
        setTimeout(() => {
            setSubmitting(false);
            setSuccess(true);
        }, 1500);
    };

    if (success) {
        return (
            <div className="application-modal-overlay">
                <div className="application-modal success-state">
                    <div className="success-icon">🎉</div>
                    <h2>Başvurunuz Alındı!</h2>
                    <p><strong>{job.company}</strong> ekibi başvurunuzu inceleyip size dönüş yapacaktır.</p>
                    <button className="btn-primary" onClick={onClose}>Tamam</button>
                </div>
            </div>
        );
    }

    return (
        <div className="application-modal-overlay">
            <div className="application-modal">
                <div className="modal-header">
                    <h2>{job.title} Başvurusu</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="application-form">
                    <div className="form-group">
                        <label>Ad Soyad</label>
                        <input
                            type="text"
                            required
                            value={formData.fullName}
                            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            placeholder="ornek@email.com"
                        />
                    </div>

                    <div className="form-group">
                        <label>Portfolio URL</label>
                        <input
                            type="url"
                            required
                            value={formData.portfolioUrl}
                            onChange={e => setFormData({ ...formData, portfolioUrl: e.target.value })}
                            placeholder="https://artstation.com/username"
                        />
                    </div>

                    <div className="form-group">
                        <label>Ön Yazı (Cover Letter)</label>
                        <textarea
                            required
                            rows="4"
                            value={formData.coverLetter}
                            onChange={e => setFormData({ ...formData, coverLetter: e.target.value })}
                            placeholder="Neden bu pozisyon için uygunsunuz?"
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label>CV Yükle (PDF)</label>
                        <div className="file-upload-box">
                            <input
                                type="file"
                                accept=".pdf"
                                required
                                onChange={e => setFormData({ ...formData, cvFile: e.target.files[0] })}
                            />
                            {formData.cvFile ? (
                                <span className="file-name">📄 {formData.cvFile.name}</span>
                            ) : (
                                <span className="file-placeholder">Dosya seçin veya sürükleyin</span>
                            )}
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-ghost" onClick={onClose}>İptal</button>
                        <button type="submit" className="btn-primary" disabled={submitting}>
                            {submitting ? 'Gönderiliyor...' : 'Başvuruyu Gönder'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default JobApplication;
