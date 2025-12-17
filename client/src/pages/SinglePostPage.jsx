
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePostStore } from '../stores/usePostStore';
import { useAuthStore } from '../stores/useAuthStore';
import classNames from 'classnames/bind';
import styles from '../assets/css/PostsContainer.module.scss';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';

// We can reuse PostItem if we export it or we can redefine it/import it.
// Ideally, PostItem should be a separate component file.
// For now, I will assume I need to extract PostItem to its own file or duplicate it temporarily 
// to avoid breaking changes in the middle of a refactor.
// Actually, looking at previous steps, PostItem is inside PostsContainer.jsx.
// I should extract it or copypaste it for now to save time, then refactor later.
// I will copy-paste a simplified version or try to import it if I exported it (I didn't).
// Strategy: I will copy the PostItem logic here.

import { Image, Send, Heart, MessageCircle, Trash2, MoreHorizontal, Bookmark, Link as LinkIcon, EyeOff, Flag, Edit } from 'lucide-react';

const cx = classNames.bind(styles);

// --- Duplicated PostItem for now (Refactor TODO: Extract to components/posts/PostItem.jsx) ---
const PostItem = ({ post, currentUser, onLike, onComment, onDelete }) => {
    const [commentText, setCommentText] = useState('');
    const [showOptions, setShowOptions] = useState(false);
    const optionsRef = React.useRef(null);
    
    // Close options menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (optionsRef.current && !optionsRef.current.contains(event.target)) {
                setShowOptions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const isLiked = post.likes.includes(currentUser?._id);
    
    const handleComment = async (e) => {
        if (e.key === 'Enter' && commentText.trim()) {
            await onComment(post._id, commentText);
            setCommentText('');
        }
    };
    
    const handleDelete = () => {
        if(window.confirm("Are you sure you want to delete this post?")) {
             onDelete(post._id);
        }
        setShowOptions(false);
    }
    
     const handleCopyLink = () => {
         navigator.clipboard.writeText(`${window.location.origin}/post/${post._id}`);
         toast.success("Link copied to clipboard");
         setShowOptions(false);
    };

    const handleHidePost = () => {
        toast.info("Post hidden. We'll show fewer posts like this.");
        setShowOptions(false);
    };
    
    const handleReportPost = () => {
        toast.info("Thank you for reporting this post.");
        setShowOptions(false);
    };


    return (
        <div className={cx('post-item')} style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
            <div className={cx('post-header')}>
                <img src={post.author?.avatarURL || '/favicon.png'} alt="avatar" />
                <div className={cx('user-info')}>
                    <h4>{post.author?.displayName || post.author?.username}</h4>
                    <span>{new Date(post.createdAt).toLocaleString()}</span>
                </div>
                
                <div className={cx('more-options-wrapper')} ref={optionsRef}>
                    <button className={cx('more-btn')} onClick={() => setShowOptions(!showOptions)}>
                        <MoreHorizontal size={20} />
                    </button>
                    
                    {showOptions && (
                        <div className={cx('options-menu')}>
                             <button className={cx('menu-option')} onClick={() => {toast.info('Saved to collection'); setShowOptions(false);}}>
                                <Bookmark size={16} />
                                <span>Save Post</span>
                            </button>
                            
                            <button className={cx('menu-option')} onClick={handleCopyLink}>
                                <LinkIcon size={16} />
                                <span>Copy Link</span>
                            </button>

                            <button className={cx('menu-option')} onClick={handleHidePost}>
                                <EyeOff size={16} />
                                <span>Not interested</span>
                            </button>
                            
                            <button className={cx('menu-option')} onClick={handleReportPost}>
                                <Flag size={16} />
                                <span>Report Post</span>
                            </button>
                            
                            {post.author?._id === currentUser?._id && (
                                <>
                                    <div className={cx('menu-separator')}></div>
                                    <button className={cx('menu-option')} onClick={() => {toast.info('Edit feature coming soon'); setShowOptions(false);}}>
                                        <Edit size={16} />
                                        <span>Edit Post</span>
                                    </button>
                                     <button className={cx('menu-option', 'delete-option')} onClick={handleDelete}>
                                        <Trash2 size={16} />
                                        <span>Move to trash</span>
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            <div className={cx('post-content')}>
                {post.content}
            </div>
            
            {post.image && (
                <img 
                    src={post.image.startsWith('http') ? post.image : `http://localhost:5001${post.image}`} 
                    alt="post content" 
                    className={cx('post-image')} 
                />
            )}
            
            <div className={cx('post-actions')}>
                <button 
                    className={cx({ liked: isLiked })}
                    onClick={() => onLike(post._id)}
                >
                    <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                    <span>{post.likes.length} Likes</span>
                </button>
                <button>
                    <MessageCircle size={20} />
                    <span>{post.comments.length} Comments</span>
                </button>
            </div>
            
            <div className={cx('comments-section')}>
                <div className={cx('comment-input')}>
                     <img src={currentUser?.avatarURL || '/favicon.png'} alt="my avatar" style={{width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover'}} />
                     <input 
                        type="text" 
                        placeholder="Write a comment..." 
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={handleComment}
                     />
                     <button onClick={() => {if(commentText.trim()) { onComment(post._id, commentText); setCommentText('') }}} style={{background:'none', border:'none', color:'var(--primary-color)', cursor:'pointer'}}>
                        <Send size={18} />
                     </button>
                </div>
                
                <div className={cx('comment-list')}>
                    {post.comments.map((comment, index) => (
                        <div key={index} className={cx('comment')}>
                            <strong>{comment.postedBy?.displayName || comment.postedBy?.username || 'User'}</strong>
                            <span>{comment.text}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


const SinglePostPage = () => {
    const { postId } = useParams();
    const navigate = useNavigate();
    const { getPostById, likePost, addComment, deletePost } = usePostStore();
    const { user } = useAuthStore();
    
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const data = await getPostById(postId);
                setPost(data);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load post");
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [postId, getPostById]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>
                <h2>Loading post...</h2>
            </div>
        );
    }

    if (error || !post) {
         return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white', gap: '1rem' }}>
                <h2>{error || "Post not found"}</h2>
                <button 
                    onClick={() => navigate('/feed')}
                    style={{ padding: '0.8rem 1.5rem', borderRadius: '2rem', border: 'none', background: 'var(--primary-color)', color: 'white', cursor: 'pointer', fontSize: '1.4rem' }}
                >
                    Go Back to Feed
                </button>
            </div>
        );
    }

    return (
        <div className={cx('posts-container-wrapper')} style={{ height: '100vh', width: '100vw' }}>
             <div className={cx('header')} style={{ justifyContent: 'flex-start', gap: '1.5rem' }}>
                <button onClick={() => navigate('/feed')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
                    <ChevronLeft size={24} />
                </button>
                <h2>Post</h2>
            </div>
            
            <div className={cx('content-area')}>
                <PostItem 
                    post={post}
                    currentUser={user}
                    onLike={async (id) => {
                        await likePost(id);
                        // Refresh post data to show new like state
                        const updated = await getPostById(id);
                        setPost(updated);
                    }}
                    onComment={async (id, text) => {
                         await addComment(id, text);
                         // Refresh post data
                         const updated = await getPostById(id);
                         setPost(updated);
                    }}
                    onDelete={async (id) => {
                        await deletePost(id);
                        navigate('/feed');
                    }}
                />
            </div>
        </div>
    );
};

export default SinglePostPage;
