import React, { useState } from 'react';

const CompanyList = () => {
    // Mock Data for Companies
    const companies = [
        {
            id: 1,
            name: "Pixel Forge Studios",
            logo: "https://ui-avatars.com/api/?name=Pixel+Forge&background=0D8ABC&color=fff&size=128",
            openJobs: 3,
            city: "İstanbul",
            description: "Mobil oyun dünyasında yenilikçi deneyimler yaratan ödüllü stüdyo.",
            tags: ["Mobile", "Casual", "Unity"]
        },
        {
            id: 2,
            name: "Nebula Games",
            logo: "https://ui-avatars.com/api/?name=Nebula+Games&background=6C3483&color=fff&size=128",
            openJobs: 5,
            city: "Ankara",
            description: "AAA kalitesinde PC ve konsol oyunları geliştiren teknoloji odaklı ekip.",
            tags: ["PC", "Console", "Unreal 5"]
        },
        {
            id: 3,
            name: "Vart Game",
            logo: "https://ui-avatars.com/api/?name=Vart+Game&background=27AE60&color=fff&size=128",
            openJobs: 2,
            city: "İzmir",
            description: "Hikaye odaklı bağımsız oyunlar geliştiren yaratıcı stüdyo.",
            tags: ["Indie", "Narrative", "2D"]
        },
        {
            id: 4,
            name: "CyberCore Interactive",
            logo: "https://ui-avatars.com/api/?name=Cyber+Core&background=E74C3C&color=fff&size=128",
            openJobs: 8,
            city: "Remote",
            description: "Espor odaklı rekabetçi oyunlar ve teknolojiler.",
            tags: ["Esports", "Multiplayer", "C++"]
        },
        {
            id: 5,
            name: "Dreambox",
            logo: "https://ui-avatars.com/api/?name=Dreambox&background=F39C12&color=fff&size=128",
            openJobs: 1,
            city: "İstanbul",
            description: "Çocuklar için eğitici ve eğlenceli oyunlar.",
            tags: ["Kids", "Education", "HTML5"]
        }
    ];

    const [selectedCompany, setSelectedCompany] = useState(null);

    return (
        <div className="bridge-section">
            <div className="section-intro">
                <h2>Anlaşmalı Şirketler</h2>
                <p>GDA mezunlarını tercih eden sektör lideri stüdyolar.</p>
            </div>

            <div className="company-grid">
                {companies.map(company => (
                    <div
                        key={company.id}
                        className="company-card"
                        onClick={() => setSelectedCompany(company)}
                    >
                        <div className="company-logo-wrapper">
                            <img src={company.logo} alt={company.name} className="company-logo" />
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
                                {company.tags.map(tag => (
                                    <span key={tag} className="tag-pill">{tag}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Simple Modal for Company Details */}
            {selectedCompany && (
                <div className="company-modal-overlay" onClick={() => setSelectedCompany(null)}>
                    <div className="company-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <img src={selectedCompany.logo} alt={selectedCompany.name} className="modal-logo" />
                            <div>
                                <h2>{selectedCompany.name}</h2>
                                <p className="modal-subtitle">📍 {selectedCompany.city}</p>
                            </div>
                            <button className="close-btn" onClick={() => setSelectedCompany(null)}>×</button>
                        </div>
                        <div className="modal-body">
                            <p className="company-desc">{selectedCompany.description}</p>

                            <h4>Açık Pozisyonlar</h4>
                            {selectedCompany.openJobs > 0 ? (
                                <ul className="modal-job-list">
                                    <li>Game Designer (Mid-Level)</li>
                                    <li>UI/UX Artist</li>
                                    <li>Unity Developer</li>
                                </ul>
                            ) : (
                                <p className="no-jobs">Şu anda açık pozisyon bulunmamaktadır.</p>
                            )}

                            <div className="modal-actions">
                                <button className="btn-primary">Şirket Profili</button>
                                <button className="btn-secondary">Takip Et</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompanyList;
