import React, { useState } from 'react';
import AddProjectModal from './AddProjectModal'; // We can reuse or adapt this if needed
import '../Community.css';

const FileLibrary = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Dummy Data for Files
    const [files, setFiles] = useState([
        {
            id: 1,
            name: 'Cyberpunk UI Icons Pack',
            type: 'ZIP',
            size: '12.5 MB',
            author: 'NeonDev',
            downloads: 1240,
            date: '2 Oct 2025',
            icon: '📦'
        },
        {
            id: 2,
            name: 'Brand Guidelines Template',
            type: 'PDF',
            size: '4.2 MB',
            author: 'Studio One',
            downloads: 85,
            date: '1 Oct 2025',
            icon: '📄'
        },
        {
            id: 3,
            name: 'Social Media Mockups',
            type: 'PSD',
            size: '45 MB',
            author: 'CreativeLabs',
            downloads: 560,
            date: '28 Sep 2025',
            icon: '🎨'
        },
        {
            id: 4,
            name: 'Vector Illustrations Set',
            type: 'SVG',
            size: '1.8 MB',
            author: 'IllustratorPro',
            downloads: 2100,
            date: '25 Sep 2025',
            icon: '✏️'
        }
    ]);

    const handleAddFile = (newFile) => {
        // Adapt the project object to file object
        const fileObj = {
            id: Date.now(),
            name: newFile.title,
            type: 'ZIP', // Defaulting for demo
            size: 'Unknown',
            author: newFile.author || 'You',
            downloads: 0,
            date: 'Just now',
            icon: '📂'
        };
        setFiles([fileObj, ...files]);
    };

    return (
        <div className="community-gallery">
            <div className="gallery-header">
                <h3>Design Resources & Files</h3>
                <button
                    className="btn-add-project"
                    onClick={() => setIsModalOpen(true)}
                >
                    + Upload New File
                </button>
            </div>

            <div className="file-library-list">
                <div className="file-list-header">
                    <span className="col-icon">Type</span>
                    <span className="col-name">File Name</span>
                    <span className="col-meta">Size</span>
                    <span className="col-meta">Author</span>
                    <span className="col-meta">Downloads</span>
                    <span className="col-action">Action</span>
                </div>

                {files.map((file) => (
                    <div key={file.id} className="file-list-row">
                        <div className="col-icon">
                            <span className={`file-type-icon type-${file.type.toLowerCase()}`}>
                                {file.icon}
                            </span>
                        </div>
                        <div className="col-name">
                            <strong>{file.name}</strong>
                            <span className="file-date">{file.date}</span>
                        </div>
                        <div className="col-meta">{file.size}</div>
                        <div className="col-meta">{file.author}</div>
                        <div className="col-meta">{file.downloads}</div>
                        <div className="col-action">
                            <button className="btn-download">Download</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Reusing AddProjectModal for now, treating 'Project Title' as 'File Name' */}
            <AddProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddFile}
                platform="files"
            />
        </div>
    );
};

export default FileLibrary;
