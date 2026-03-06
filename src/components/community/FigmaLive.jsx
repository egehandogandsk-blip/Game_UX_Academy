import React, { useState } from 'react';
import AddProjectModal from './AddProjectModal';
import { useT } from '../../contexts/LanguageContext';
import '../Community.css';

const FigmaLive = () => {
    const t = useT();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);

    // Dummy Data
    const [projects, setProjects] = useState([
        {
            id: 1,
            title: 'E-Commerce UI Kit',
            link: 'https://www.figma.com/file/MwQ3...',
            embedSrc: 'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FLQ4jJ1sQ...%2F',
            coverImage: 'https://images.unsplash.com/photo-1586717791821-3f44a5638d4e?auto=format&fit=crop&w=800&q=80',
            author: 'UI Master',
            description: 'A complete e-commerce design system with 50+ components.',
            likes: 342,
            views: 5600
        },
        {
            id: 2,
            title: 'Medical App Prototype',
            link: 'https://www.figma.com/file/...',
            embedSrc: 'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2F...',
            coverImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
            author: 'Dr. Design',
            description: 'Interactive prototype for patient monitoring.',
            likes: 156,
            views: 2100
        }
    ]);

    const handleAddProject = (newProject) => {
        const projectWithEmbed = {
            ...newProject,
            embedSrc: 'https://www.figma.com/embed?embed_host=share&url=' + encodeURIComponent(newProject.link)
        };
        setProjects([projectWithEmbed, ...projects]);
    };

    return (
        <div className="community-gallery">
            <div className="gallery-header">
                <h3>{t('figmaCommunityLive')}</h3>
                <button
                    className="btn-add-project"
                    onClick={() => setIsModalOpen(true)}
                >
                    + {t('addFigmaProject')}
                </button>
            </div>

            <div className="gallery-grid">
                {projects.map((project) => (
                    <div
                        key={project.id}
                        className="project-card figma-card"
                        onClick={() => setSelectedProject(project)}
                    >
                        <div className="project-cover">
                            <img src={project.coverImage} alt={project.title} />
                            <div className="project-overlay">
                                <span>{t('previewLive')} 👁️</span>
                            </div>
                            <div className="figma-badge">F</div>
                        </div>
                        <div className="project-info">
                            <h4>{project.title}</h4>
                            <p className="project-desc">{project.description}</p>
                            <div className="project-meta">
                                <span className="author">{t('by')} {project.author}</span>
                            </div>
                            <div className="project-stats">
                                <span>👍 {project.likes}</span>
                                <span>{t('duplicate')} 24</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Live Preview Modal */}
            {selectedProject && (
                <div className="modal-overlay figma-live-modal" onClick={() => setSelectedProject(null)}>
                    <div className="modal-content live-view-content" onClick={e => e.stopPropagation()}>
                        <div className="live-header">
                            <div className="live-title">
                                <span className="figma-icon">F</span>
                                <h3>{selectedProject.title}</h3>
                            </div>
                            <div className="live-actions">
                                <a href={selectedProject.link} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                                    {t('joinProject')} ↗
                                </a>
                                <button className="close-btn" onClick={() => setSelectedProject(null)}>&times;</button>
                            </div>
                        </div>
                        <div className="live-embed-container">
                            <iframe
                                title={selectedProject.title}
                                src={selectedProject.embedSrc}
                                allowFullScreen
                            ></iframe>
                            <div className="embed-fallback">
                                <p>{t('embedRequiresURL')}</p>
                                <img src={selectedProject.coverImage} alt="Fallback" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <AddProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddProject}
                platform="figma"
            />
        </div>
    );
};

export default FigmaLive;
