import React, { useState, useEffect } from 'react';
import { dbOperations } from '../../database/schema';

const CompanyList = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCompany, setSelectedCompany] = useState(null);

    useEffect(() => {
        loadCompanies();
    }, []);

    const loadCompanies = async () => {
        try {
            const data = await dbOperations.getAll('partners');
            setCompanies(data || []);
        } catch (error) {
            console.error('Error loading companies:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bridge-section">
                <div className="section-intro">
                    <h2>Anlaşmalı Şirketler</h2>
                    <p>Yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (companies.length === 0) {
        return (
            <div className="bridge-section">
                <div className="section-intro">
                    <h2>Anlaşmalı Şirketler</h2>
                    <p>Henüz şirket eklenmemiş. Admin panelden şirket ekleyebilirsiniz.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bridge-section">
            <div className="section-intro">
                <h2>Anlaşmalı Şirketler</h2>
                <p>GDA ile iş birliği içinde olan oyun şirketleri ve kariyer fırsatları</p>
            </div>

            <div className="company-grid">
                {companies.map(company => (
                    <div
                        key={company.id}
                        className="company-card"
                        onClick={() => setSelectedCompany(company)}
                    >
                        <div className="company-logo-wrapper">
                            <img
                                src={company.logo}
                                alt={company.name}
                                className="company-logo"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=f6cc32&color=000&size=128`;
                                }}
                            />
                            {company.isLocalPartner && (
                                <span className="local-partner-badge" title="Türkiye Merkezli Partner">🇹🇷</span>
                            )}
                        </div>
                        <div className="company-info">
                            <h3>{company.name}</h3>
                            <div className="company-meta">
                                <span className="meta-item location">📍 {company.city}</span>
                                {company.openJobs > 0 && (
                                    <span className="meta-item jobs-badge">
                                        {company.openJobs} Açık Pozisyon
                                    </span>
                                )}
                            </div>
                            <div className="company-tags">
                                {company.tags && company.tags.map(tag => (
                                    <span key={tag} className="tag-pill">{tag}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {selectedCompany && (
                <div className="company-modal-overlay" onClick={() => setSelectedCompany(null)}>
                    <div className="company-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <img src={selectedCompany.logo} alt={selectedCompany.name} className="modal-logo" />
                            <div>
                                <h2>
                                    {selectedCompany.name}
                                    {selectedCompany.isLocalPartner && (
                                        <span className="local-partner-badge-inline" title="Türkiye Merkezli Partner">🇹🇷 Local Partner</span>
                                    )}
                                </h2>
                                <p className="modal-subtitle">📍 {selectedCompany.city} • {selectedCompany.category}</p>
                            </div>
                            <button className="close-btn" onClick={() => setSelectedCompany(null)}>×</button>
                        </div>
                        <div className="modal-body">
                            <p className="company-desc">{selectedCompany.description}</p>

                            {selectedCompany.careerCriteria && (
                                <div className="career-criteria-section">
                                    <h4>{selectedCompany.careerCriteria.title}</h4>
                                    <div className="criteria-content">
                                        <div className="criteria-block">
                                            <h5>📋 Aranan Nitelikler</h5>
                                            <ul className="requirements-list">
                                                {selectedCompany.careerCriteria.requirements.map((req, idx) => (
                                                    <li key={idx}>{req}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="criteria-block">
                                            <h5>💼 Portfolyo Beklentileri</h5>
                                            <p>{selectedCompany.careerCriteria.portfolio}</p>
                                        </div>
                                        <div className="criteria-block">
                                            <h5>🛠️ Kullanılan Araçlar</h5>
                                            <p>{selectedCompany.careerCriteria.tools}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <h4>Açık Pozisyonlar</h4>
                            {selectedCompany.openJobs > 0 ? (
                                <p className="jobs-count">Bu şirkette {selectedCompany.openJobs} açık pozisyon bulunmaktadır.</p>
                            ) : (
                                <p className="no-jobs">Şu anda açık pozisyon bulunmamaktadır.</p>
                            )}

                            <div className="modal-actions">
                                {selectedCompany.domain && (
                                    <a href={`https://${selectedCompany.domain}`} target="_blank" rel="noopener noreferrer" className="btn-primary">
                                        🌐 Şirket Web Sitesi
                                    </a>
                                )}
                                <button className="btn-secondary">⭐ Takip Et</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompanyList;
