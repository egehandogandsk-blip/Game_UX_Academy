import React, { useState } from 'react';
import JobApplication from './JobApplication';
import './Career.css'; // We'll create this for specific job detail styles if needed

const Career = ({ user }) => {
    // Dropdown States
    const [filters, setFilters] = useState({
        field: '',
        city: '',
        workType: ''
    });

    const [applyingJob, setApplyingJob] = useState(null);
    const [viewingJob, setViewingJob] = useState(null);

    // Mock Options
    const fields = ["Game Design", "Level Design", "UI/UX", "Art", "Programming", "Audio", "3D Art"];
    const cities = ["İstanbul", "Ankara", "İzmir", "Remote", "Yurt Dışı"];
    const workTypes = ["Full-time", "Part-time", "Freelance", "Internship", "Permanent"];

    // Mock Job Listing (Updated with Real Data from Request)
    const jobListings = [
        {
            id: 1,
            title: "3D Artist",
            company: "Alpha AR",
            location: "Remote",
            type: "Permanent",
            field: "3D Art",
            logo: "https://ui-avatars.com/api/?name=Alpha+AR&background=000&color=fff&size=128", // Placeholder for Alpha AR
            posted: "Posted 13 days ago",
            summary: "Modeling and texturing shoes, watches, bags, wearables, and other fashion-related products for various metaverse platforms.",
            description: `
                <p>We are looking for a talented 3D Artist to join our team!</p>
                
                <h3>What you will do:</h3>
                <ul>
                    <li>Modeling and texturing shoes, watches, bags, wearables, and other fashion-related products for various metaverse platforms.</li>
                    <li>Creating high-quality assets for real-time rendering applications.</li>
                    <li>Collaborating with the design and technical teams to ensure assets meet quality and performance standards.</li>
                </ul>

                <h3>Requirements:</h3>
                <ul>
                    <li>Solid working knowledge of Substance Painter.</li>
                    <li>Proficiency in Blender or 3ds Max.</li>
                    <li>Experience in creating optimized 3D assets for games or real-time applications.</li>
                    <li>Strong portfolio showcasing 3D modeling and texturing skills.</li>
                </ul>

                <h3>About Alpha AR:</h3>
                <p>Alpha AR is an AI-based 3D content creation platform. We make it easy for anyone to create 3D content for the metaverse, AR, and VR.</p>
            `
        },
        {
            id: 2,
            title: "Junior Level Designer",
            company: "Nebula Games",
            location: "Ankara",
            type: "Full-time",
            field: "Level Design",
            logo: "https://ui-avatars.com/api/?name=Nebula+Games&background=6C3483&color=fff&size=128",
            posted: "5 gün önce",
            summary: "Unreal Engine 5 ile bölüm tasarımları yapacak, yaratıcı ve öğrenmeye açık ekip arkadaşı.",
            description: "<p>Unreal Engine 5 ile bölüm tasarımları yapacak, yaratıcı ve öğrenmeye açık ekip arkadaşı.</p>"
        },
        {
            id: 3,
            title: "Senior UI/UX Game Artist",
            company: "Pixel Forge Studios",
            location: "İstanbul (Hybrid)",
            type: "Full-time",
            field: "UI/UX",
            logo: "https://ui-avatars.com/api/?name=Pixel+Forge&background=0D8ABC&color=fff&size=128",
            posted: "2 gün önce",
            summary: "Mobil RPG projemiz için deneyimli, oyun arayüzleri konusunda uzman, Unity bilgisi olan UI sanatçısı arıyoruz.",
            description: "<p>Mobil RPG projemiz için deneyimli, oyun arayüzleri konusunda uzman, Unity bilgisi olan UI sanatçısı arıyoruz.</p>"
        }
    ];

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const filteredJobs = jobListings.filter(job => {
        return (
            (filters.field === '' || job.field === filters.field) &&
            (filters.city === '' || job.location.includes(filters.city) || (filters.city === 'Remote' && job.location.includes('Remote'))) &&
            (filters.workType === '' || job.type === filters.workType)
        );
    });

    // Close detail view handler
    const closeDetail = () => setViewingJob(null);

    return (
        <div className="bridge-section">
            {/* If viewing a job, show the detail view instead of the list */}
            {viewingJob ? (
                <div className="job-detail-view animation-fade-in">
                    <div className="job-detail-header">
                        <button className="btn-back" onClick={closeDetail}>← Geri Dön</button>
                    </div>

                    <div className="job-detail-content">
                        <div className="job-detail-top">
                            <img src={viewingJob.logo} alt={viewingJob.company} className="job-detail-logo" />
                            <div className="job-detail-title-block">
                                <h1>{viewingJob.title}</h1>
                                <div className="job-detail-meta-row">
                                    <span className="meta-company">{viewingJob.company}</span>
                                    <span className="meta-separator">•</span>
                                    <span>{viewingJob.location}</span>
                                    <span className="meta-separator">•</span>
                                    <span>{viewingJob.type}</span>
                                </div>
                                <span className="meta-posted">{viewingJob.posted}</span>
                            </div>
                            <div className="job-detail-actions">
                                <button className="btn-apply-large" onClick={() => setApplyingJob(viewingJob)}>Başvur</button>
                                <button className="btn-save">Kaydet</button>
                            </div>
                        </div>

                        <div className="job-detail-body">
                            <div className="job-description-html" dangerouslySetInnerHTML={{ __html: viewingJob.description }} />
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="section-intro">
                        <h2>Kariyer Fırsatları</h2>
                        <p>Yeteneklerinize uygun en yeni iş ilanlarına göz atın.</p>
                    </div>

                    {/* Filters */}
                    <div className="career-filters">
                        <div className="filter-group">
                            <label>Alan (Field)</label>
                            <select
                                value={filters.field}
                                onChange={(e) => handleFilterChange('field', e.target.value)}
                                className="filter-select"
                            >
                                <option value="">Tümü</option>
                                {fields.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>Şehir (City)</label>
                            <select
                                value={filters.city}
                                onChange={(e) => handleFilterChange('city', e.target.value)}
                                className="filter-select"
                            >
                                <option value="">Tümü</option>
                                {cities.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>Çalışma Tipi</label>
                            <select
                                value={filters.workType}
                                onChange={(e) => handleFilterChange('workType', e.target.value)}
                                className="filter-select"
                            >
                                <option value="">Tümü</option>
                                {workTypes.map(w => <option key={w} value={w}>{w}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Job List */}
                    <div className="job-list">
                        {filteredJobs.length > 0 ? (
                            filteredJobs.map(job => (
                                <div key={job.id} className="job-card">
                                    <img src={job.logo} alt={job.company} className="job-logo" />
                                    <div className="job-info">
                                        <h3>{job.title}</h3>
                                        <div className="job-meta">
                                            <span className="job-company">{job.company}</span>
                                            <span className="job-location">📍 {job.location}</span>
                                            <span className="job-type">💼 {job.type}</span>
                                        </div>
                                        <p className="job-desc">{job.summary}</p>
                                    </div>
                                    <div className="job-actions">
                                        <span className="job-posted">{job.posted}</span>
                                        <div className="job-btn-group">
                                            <button className="btn-view" onClick={() => setViewingJob(job)}>İlanı Görüntüle</button>
                                            <button className="btn-apply" onClick={() => setApplyingJob(job)}>Başvur</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-jobs-found">
                                <p>Arama kriterlerinize uygun ilan bulunamadı.</p>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Application Modal */}
            {applyingJob && (
                <JobApplication
                    job={applyingJob}
                    user={user}
                    onClose={() => setApplyingJob(null)}
                />
            )}
        </div>
    );
};

export default Career;
