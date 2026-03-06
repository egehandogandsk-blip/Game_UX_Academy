import React, { useState } from 'react';
import { useT } from '../../contexts/LanguageContext';
import '../Community.css';

const CommunityRoom = ({ user }) => {
    const t = useT();
    const [filter, setFilter] = useState('all'); // all, discussion, question, showcase

    // Dummy Posts Data - Real app would fetch this
    const [posts, setPosts] = useState([
        {
            id: 1,
            author: 'Sarah Jenkins',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
            type: 'question',
            title: 'How do you handle dark mode colors in Figma variables?',
            content: 'I am struggling with organizing my color variables for a multi-theme system. Do you separate primitives and semantic tokens from the start?',
            tags: ['Figma', 'Design System'],
            likes: 12,
            comments: 2,
            time: '2h ago',
            commentList: [
                { id: 101, author: 'Alex D.', avatar: 'https://via.placeholder.com/30', content: 'I usually keep them separate. Primitives for hex values, Semantics for usage.', time: '1h ago' },
                { id: 102, author: 'Sarah J.', avatar: 'https://via.placeholder.com/30', content: 'Agreed! It makes dark mode mapping so much easier.', time: '45m ago' }
            ]
        },
        {
            id: 2,
            author: 'Mike Chen',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
            type: 'discussion',
            title: 'The state of UX in 2026',
            content: 'With AI taking over asset generation, I feel like UX research and genuine empathy are becoming more valuable than ever. Thoughts?',
            tags: ['UX', 'Career', 'AI'],
            likes: 45,
            comments: 1,
            time: '5h ago',
            commentList: [
                { id: 201, author: 'Jessica K.', avatar: 'https://via.placeholder.com/30', content: 'Soft skills are the new hard skills. AI can generate UI, but it cannot feel user pain.', time: '2h ago' }
            ]
        },
        {
            id: 3,
            author: 'Elara V.',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
            type: 'showcase',
            title: t('justLaunchedPortfolio') || 'Just launched my new portfolio! 🚀',
            content: 'Would love some feedback on the case studies.',
            tags: ['Portfolio', 'Feedback'],
            likes: 89,
            comments: 0,
            time: '1d ago',
            commentList: []
        }
    ]);

    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [newPostContent, setNewPostContent] = useState({ title: '', content: '', type: 'discussion' });

    // Interaction States
    const [likedPosts, setLikedPosts] = useState(new Set());
    const [activeCommentId, setActiveCommentId] = useState(null); // Which post has comments open
    const [copiedPostId, setCopiedPostId] = useState(null);
    const [commentInput, setCommentInput] = useState(''); // Text for the new comment

    const handlePostSubmit = (e) => {
        e.preventDefault();
        const newPost = {
            id: Date.now(),
            author: user ? user.fullName : 'You',
            avatar: user ? user.profilePhoto : 'https://via.placeholder.com/150',
            ...newPostContent,
            tags: ['Community'],
            likes: 0,
            comments: 0,
            time: 'Just now',
            commentList: []
        };
        setPosts([newPost, ...posts]);
        setIsPostModalOpen(false);
        setNewPostContent({ title: '', content: '', type: 'discussion' });
    };

    const handleLike = (postId) => {
        setPosts(posts.map(post => {
            if (post.id === postId) {
                const isLiked = likedPosts.has(postId);
                const newLikes = isLiked ? post.likes - 1 : post.likes + 1;

                // Update liked set
                const newLikedPosts = new Set(likedPosts);
                if (isLiked) newLikedPosts.delete(postId);
                else newLikedPosts.add(postId);
                setLikedPosts(newLikedPosts);

                return { ...post, likes: newLikes };
            }
            return post;
        }));
    };

    const handleShare = (postId) => {
        // Mock copy to clipboard
        navigator.clipboard.writeText(`https://gdatool.com/community/post/${postId}`);
        setCopiedPostId(postId);
        setTimeout(() => setCopiedPostId(null), 2000);
    };

    const toggleComments = (postId) => {
        if (activeCommentId === postId) {
            setActiveCommentId(null);
        } else {
            setActiveCommentId(postId);
            setCommentInput(''); // Clear input when switching posts
        }
    };

    const handleCommentSubmit = (postId) => {
        if (!commentInput.trim()) return;

        setPosts(posts.map(post => {
            if (post.id === postId) {
                const newComment = {
                    id: Date.now(),
                    author: user ? user.fullName : 'You',
                    avatar: user ? user.profilePhoto : 'https://via.placeholder.com/30',
                    content: commentInput,
                    time: 'Just now'
                };
                return {
                    ...post,
                    comments: post.comments + 1,
                    commentList: [...(post.commentList || []), newComment]
                };
            }
            return post;
        }));
        setCommentInput('');
    };

    const filteredPosts = filter === 'all' ? posts : posts.filter(p => p.type === filter);

    return (
        <div className="community-room">
            <div className="room-layout">
                {/* Left Sidebar: Filters & Stats */}
                <div className="room-sidebar">
                    <button className="btn-new-post" onClick={() => setIsPostModalOpen(true)}>
                        + {t('startDiscussion')}
                    </button>

                    <div className="room-filters">
                        <h3>{t('feeds')}</h3>
                        <button
                            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            🌍 {t('allPosts')}
                        </button>
                        <button
                            className={`filter-btn ${filter === 'discussion' ? 'active' : ''}`}
                            onClick={() => setFilter('discussion')}
                        >
                            💬 {t('discussions')}
                        </button>
                        <button
                            className={`filter-btn ${filter === 'question' ? 'active' : ''}`}
                            onClick={() => setFilter('question')}
                        >
                            ❓ {t('qa')}
                        </button>
                        <button
                            className={`filter-btn ${filter === 'showcase' ? 'active' : ''}`}
                            onClick={() => setFilter('showcase')}
                        >
                            🔥 {t('showcase')}
                        </button>
                    </div>

                    <div className="room-stats">
                        <h3>{t('communityStats')}</h3>
                        <div className="stat-row">
                            <span>{t('members')}</span>
                            <strong>1.2k</strong>
                        </div>
                        <div className="stat-row">
                            <span>{t('online')}</span>
                            <strong className="online-dot">142</strong>
                        </div>
                    </div>
                </div>

                {/* Main Feed */}
                <div className="room-feed">
                    {filteredPosts.map(post => (
                        <div key={post.id} className="post-card">
                            <div className="post-header">
                                <img src={post.avatar} alt={post.author} className="post-avatar" />
                                <div className="post-meta">
                                    <div className="post-author">{post.author}</div>
                                    <div className="post-time">{post.time} • <span className={`tag-${post.type}`}>{t(post.type)}</span></div>
                                </div>
                            </div>
                            <div className="post-body">
                                <h4>{post.title}</h4>
                                <p>{post.content}</p>
                            </div>
                            <div className="post-footer">
                                <div className="post-tags">
                                    {post.tags.map((tag, i) => (
                                        <span key={i} className="post-tag">#{tag}</span>
                                    ))}
                                </div>
                                <div className="post-actions">
                                    <button
                                        className={likedPosts.has(post.id) ? 'active-like' : ''}
                                        onClick={() => handleLike(post.id)}
                                    >
                                        {likedPosts.has(post.id) ? '❤️' : '🤍'} {post.likes}
                                    </button>
                                    <button onClick={() => toggleComments(post.id)}>
                                        🗨️ {post.comments} {activeCommentId === post.id ? '▲' : '▼'}
                                    </button>
                                    <button onClick={() => handleShare(post.id)}>
                                        {copiedPostId === post.id ? `✅ ${t('copied')}!` : `🔗 ${t('share')}`}
                                    </button>
                                </div>
                            </div>

                            {/* Comment Section */}
                            {activeCommentId === post.id && (
                                <div className="comment-section open">
                                    <div className="comment-header-row">
                                        <h5>{t('comments')} ({post.comments})</h5>
                                        <button className="btn-collapse" onClick={() => setActiveCommentId(null)}>
                                            {t('collapse')} ▲
                                        </button>
                                    </div>

                                    <div className="comments-list">
                                        {post.commentList && post.commentList.map(comment => (
                                            <div key={comment.id} className="comment-item">
                                                <img src={comment.avatar} alt={comment.author} className="comment-avatar" />
                                                <div className="comment-content">
                                                    <div className="comment-meta">
                                                        <strong>{comment.author}</strong>
                                                        <span>{comment.time}</span>
                                                    </div>
                                                    <p>{comment.content}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {(!post.commentList || post.commentList.length === 0) && (
                                            <p className="no-comments">{t('noCommentsYet')}</p>
                                        )}
                                    </div>

                                    <div className="comment-input-area">
                                        <input
                                            type="text"
                                            placeholder={t('writeAComment')}
                                            value={commentInput}
                                            onChange={(e) => setCommentInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleCommentSubmit(post.id);
                                            }}
                                        />
                                        <button
                                            className="btn-primary btn-sm"
                                            onClick={() => handleCommentSubmit(post.id)}
                                        >
                                            {t('send')}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Standardized Post Modal */}
            {isPostModalOpen && (
                <div className="modal-overlay" onClick={() => setIsPostModalOpen(false)}>
                    <div className="modal-content community-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{t('createNewPost')}</h2>
                            <button className="close-btn" onClick={() => setIsPostModalOpen(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handlePostSubmit}>
                                <div className="form-group">
                                    <label>{t('topicType')}</label>
                                    <select
                                        value={newPostContent.type}
                                        onChange={(e) => setNewPostContent({ ...newPostContent, type: e.target.value })}
                                        className="input"
                                    >
                                        <option value="discussion">{t('discussion')}</option>
                                        <option value="question">{t('question')}</option>
                                        <option value="showcase">{t('showcase')}</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>{t('title')}</label>
                                    <input
                                        type="text"
                                        placeholder={t('tellUsAboutYou')}
                                        value={newPostContent.title}
                                        onChange={(e) => setNewPostContent({ ...newPostContent, title: e.target.value })}
                                        required
                                        className="input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{t('content')}</label>
                                    <textarea
                                        rows="5"
                                        placeholder={t('bio')}
                                        value={newPostContent.content}
                                        onChange={(e) => setNewPostContent({ ...newPostContent, content: e.target.value })}
                                        className="modal-textarea"
                                        required
                                    ></textarea>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setIsPostModalOpen(false)}>{t('cancel')}</button>
                                    <button type="submit" className="btn btn-primary">{t('post')}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommunityRoom;
