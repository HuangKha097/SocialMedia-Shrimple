import React, { useEffect, useState, useRef } from 'react';
import { usePostStore } from '../stores/usePostStore';
import styles from '../assets/css/VideoFeed.module.scss';
import classNames from 'classnames/bind';
import { Heart, MessageCircle, Share2, Volume2, VolumeX } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';

const cx = classNames.bind(styles);

const VideoItem = ({ post, isActive, toggleLike, toggleMute, isMuted }) => {
    const videoRef = useRef(null);
    const { user } = useAuthStore();

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (isActive) {
            // Slight delay ensures the source is fully recognized by the media engine
            const timer = setTimeout(() => {
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.log("Autoplay check:", error);
                    });
                }
            }, 150);
            return () => clearTimeout(timer);
        } else {
            video.pause();
        }
    }, [isActive]);

    const isLiked = post.likes && post.likes.includes(user?._id);

    return (
        <>
            <video
                ref={videoRef}
                className={cx('video-player')}
                loop
                muted={isMuted}
                playsInline
                onClick={toggleMute}
                preload="auto"
            >
                <source src={post.video} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            {/* Overlay */}
            <div className={cx('video-overlay')}>
                <div className={cx('author-info')}>
                    <img src={post.author?.avatarURL || "/favicon.png"} alt="user" />
                    <span>{post.author?.displayName || post.author?.username}</span>
                </div>
                <p className={cx('content-text')}>{post.content}</p>
            </div>
            
            {/* Actions */}
            <div className={cx('actions-bar')}>
                <button className={cx('action-btn')} onClick={(e) => { e.stopPropagation(); toggleLike(post._id); }}>
                    <Heart fill={isLiked ? "red" : "none"} color={isLiked ? "red" : "white"} />
                    <span>{post.likes?.length || 0}</span>
                </button>
                <button className={cx('action-btn')}>
                    <MessageCircle color="white" />
                    <span>{post.comments?.length || 0}</span>
                </button>
                <button className={cx('action-btn')}>
                    <Share2 color="white" />
                    <span>Share</span>
                </button>
                 <button className={cx('action-btn')} onClick={(e) => { e.stopPropagation(); toggleMute(); }}>
                    {isMuted ? <VolumeX color="white" /> : <Volume2 color="white" />}
                </button>
            </div>
        </>
    );
};

const VideoFeed = () => {
    const { videoPosts, fetchVideoFeed, likePost } = usePostStore();
    const [activePostId, setActivePostId] = useState(null);
    const [isMuted, setIsMuted] = useState(false); // Sound ON by default
    const observer = useRef(null);

    useEffect(() => {
        fetchVideoFeed(1);
    }, []);

    // Intersection Observer logic
    useEffect(() => {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.6
        };

        const handleIntersect = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('data-id');
                    setActivePostId(id);
                }
            });
        };

        observer.current = new IntersectionObserver(handleIntersect, options);
        
        // Timeout to ensure elements are in DOM
        const timer = setTimeout(() => {
            const elements = document.querySelectorAll('.video-item-target');
            elements.forEach(el => observer.current.observe(el));
        }, 500);

        return () => {
            clearTimeout(timer);
            observer.current?.disconnect();
        }
    }, [videoPosts]);

    const handleScroll = (e) => {
        const bottom = Math.abs(e.target.scrollHeight - e.target.scrollTop - e.target.clientHeight) < 150;
        if (bottom) {
             const nextPage = Math.floor(videoPosts.length / 5) + 1;
             fetchVideoFeed(nextPage);
        }
    };

    if (!videoPosts || videoPosts.length === 0) {
        return (
            <div className={cx('local-video-feed-container')} style={{color:'white', display:'flex', justifyContent:'center', alignItems:'center'}}>
                <p>No videos available. Upload a video to get started!</p>
            </div>
        );
    }

    return (
        <div className={cx('local-video-feed-container')} onScroll={handleScroll}>
            {videoPosts.map(post => (
                <div key={post._id} data-id={post._id} className={cx('video-item', 'video-item-target')}>
                     <VideoItem 
                        post={post} 
                        isActive={activePostId === post._id} 
                        toggleLike={likePost}
                        toggleMute={() => setIsMuted(!isMuted)}
                        isMuted={isMuted}
                     />
                </div>
            ))}
        </div>
    );
};

export default VideoFeed;
