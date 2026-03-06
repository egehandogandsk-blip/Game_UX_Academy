import React, { useState } from 'react';
import AddProjectModal from './AddProjectModal';
import { useT } from '../../contexts/LanguageContext';
import '../Community.css';

const CommunityGallery = ({ platform }) => {
    const t = useT();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Dummy Data - In a real app, this would come from a backend or Context
    const [projects, setProjects] = useState([
        {
            id: 1,
            title: 'Futuristic Dashboard UI',
            link: 'https://www.behance.net',
            coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
            author: 'Alex Design',
            tools: 'Figma, PS',
            likes: 124,
            views: 1205
        },
        {
            id: 2,
            title: 'Mobile Banking App',
            link: 'https://www.behance.net',
            coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
            author: 'Sarah Studio',
            tools: 'Sketch',
            likes: 89,
            views: 850
        },
        {
            id: 3,
            title: 'Cyberpunk Character Concept',
            link: 'https://www.artstation.com',
            coverImage: 'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?auto=format&fit=crop&w=800&q=80',
            author: 'Dave Art',
            tools: 'Procreate',
            likes: 240,
            views: 3400
        }
    ]);

    const handleAddProject = (newProject) => {
        setProjects([newProject, ...projects]);
    };

    return (
        <div className="community-gallery">
            <div className="gallery-header">
                <h3>{platform === 'behance' ? (t('behanceShowcase') || 'Behance Showcase') : (t('artstationPortfolio') || 'Artstation Portfolio')}</h3>
                <button
                    className="btn-add-project"
                    onClick={() => setIsModalOpen(true)}
                >
                    + {t('addNewProject')}
                </button>
            </div>

            <div className="gallery-grid">
                {projects.map((project) => (
                    <a
                        key={project.id}
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="project-card"
                    >
                        <div className="project-cover">
                            <img src={project.coverImage} alt={project.title} />
                            <div className="project-overlay">
                                <span>{t('viewOn')} {platform === 'behance' ? 'Behance' : 'Artstation'} ↗</span>
                            </div>
                        </div>
                        <div className="project-info">
                            <h4>{project.title}</h4>
                            <div className="project-meta">
                                <span className="author">{t('by')} {project.author}</span>
                                {project.tools && <span className="tools">{project.tools}</span>}
                            </div>
                            {project.team && <div className="project-team">{t('team')}: {project.team}</div>}
                            <div className="project-stats">
                                <span>👍 {project.likes}</span>
                                <span>👁️ {project.views}</span>
                            </div>
                        </div>
                    </a>
                ))}
            </div>

            <AddProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddProject}
                platform={platform}
            />
        </div>
    );
};

export default CommunityGallery;
