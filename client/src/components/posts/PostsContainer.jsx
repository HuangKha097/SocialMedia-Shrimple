import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from '../../assets/css/PostsContainer.module.scss';
import { usePostStore } from '../../stores/usePostStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { Image, Send, Heart, MessageCircle, Trash2, MoreHorizontal, Bookmark, EyeOff, Flag, Link as LinkIcon, Edit } from 'lucide-react';
import { toast } from 'sonner';
import PostItem from './PostItem';

const cx = classNames.bind(styles);

const PostsContainer = () => {
    const { posts, fetchPosts, createPost, likePost, addComment, deletePost, isLoading } = usePostStore();
    const { user } = useAuthStore();
    
    // Create Post State
    const [newPostContent, setNewPostContent] = useState('');
    const [newPostImage, setNewPostImage] = useState(''); // Just a string input for now 
    
    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handleCreatePost = async () => {
        if (!newPostContent.trim()) return;
        await createPost({ content: newPostContent, image: newPostImage });
        setNewPostContent('');
        setNewPostImage('');
    };

    return (
        <div className={cx('posts-container-wrapper')}>
            <div className={cx('header')}>
                <h2>News Feed</h2>
            </div>
            
            <div className={cx('content-area')}>
                <CreatePost 
                    user={user} 
                    content={newPostContent} 
                    setContent={setNewPostContent}
                    image={newPostImage}
                    setImage={setNewPostImage}
                    onSubmit={handleCreatePost}
                    isLoading={isLoading}
                />
                
                {posts.map(post => (
                    <PostItem 
                        key={post._id} 
                        post={post} 
                        currentUser={user}
                        onLike={likePost}
                        onComment={addComment}
                        onDelete={deletePost}
                    />
                ))}
            </div>
        </div>
    );
};

const CreatePost = ({ user, content, setContent, image, setImage, onSubmit, isLoading }) => {
    const fileInputRef = React.useRef(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };
    
    // Clear preview when image is reset (e.g. after submit)
    useEffect(() => {
        if (!image) {
            setPreviewUrl(null);
             if (fileInputRef.current) fileInputRef.current.value = "";
        }
    }, [image]);

    return (
        <div className={cx('create-post-card')}>
            <textarea 
                placeholder={`What's on your mind, ${user?.displayName || 'User'}?`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isLoading}
            />
            
            {previewUrl && (
                <div style={{position: 'relative', marginBottom: '1rem'}}>
                    <img src={previewUrl} alt="Preview" style={{maxWidth: '100%', borderRadius: '0.5rem', maxHeight: '300px', objectFit: 'contain'}} />
                    <button 
                        onClick={() => setImage(null)}
                        style={{position: 'absolute', top: '5px', right: '5px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', padding: '5px', cursor: 'pointer', opacity: isLoading ? 0.5 : 1}}
                        disabled={isLoading}
                    >
                        X
                    </button>
                </div>
            )}
            
            <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                style={{display: 'none'}}
                disabled={isLoading}
            />
            
            <div className={cx('actions')}>
                <div 
                    className={cx('upload-btn')} 
                    onClick={() => !isLoading && fileInputRef.current?.click()}
                    style={{opacity: isLoading ? 0.5 : 1, cursor: isLoading ? 'not-allowed' : 'pointer'}}
                >
                    <Image size={20} />
                    <span>Photo/Video</span>
                </div>
                <button className={cx('post-btn')} onClick={onSubmit} disabled={isLoading || (!content.trim() && !image)}>
                    {isLoading ? 'Verifying & Posting...' : 'Post'}
                </button>
            </div>
        </div>
    );
};

export default PostsContainer;
