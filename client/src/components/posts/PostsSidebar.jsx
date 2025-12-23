import React from 'react';
import classNames from 'classnames/bind';
import styles from '../../assets/css/PostsSidebar.module.scss';
import { useAuthStore } from '../../stores/useAuthStore';
import { useChatStore } from '../../stores/useChatStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    Users, 
    Newspaper, 
    Bookmark, 
    Video, 
    Store, 
    MessageSquare,
    ChevronLeft
} from 'lucide-react';

const cx = classNames.bind(styles);

const PostsSidebar = ({ onCloseSetting }) => {
    const { user } = useAuthStore();
    const { friends, suggestedFriends, fetchSuggestedFriends } = useChatStore(); 
    const navigate = useNavigate();
    const location = useLocation();

    React.useEffect(() => {
        fetchSuggestedFriends();
    }, [fetchSuggestedFriends]);

    // Limit to 5 suggestions
    const displayedSuggestions = suggestedFriends.slice(0, 5);

    return (
        <div className={cx('posts-sidebar-wrapper')}>
            <div className={cx('header')}>
                <div className={cx('logo')}>
                    <h1 className={cx('logo-text')}>Shrimple</h1>
                    <div className={cx('nav-buttons')}>
                        <button 
                            className={cx('btn', { active: location.pathname.startsWith('/chat') })} 
                            onClick={() => navigate('/chat')} 
                            title="Chats"
                        >
                            <MessageSquare size={20} />
                        </button>
                        <button 
                            className={cx('btn', { active: location.pathname === '/feed' })} 
                            onClick={() => navigate('/feed')} 
                            title="News Feed"
                        >
                            <Newspaper size={20} />
                        </button>
                        <button 
                            className={cx('btn', { active: location.pathname === '/feed/saved' })} 
                            onClick={() => navigate('/feed/saved')} 
                            title="Saved Posts"
                        >
                            <Bookmark size={20} />
                        </button>
                        <button 
                            className={cx('btn', { active: location.pathname === '/video' })} 
                            onClick={() => navigate('/video')} 
                            title="Video Feed"
                        >
                            <Video size={20} />
                        </button>
                    </div>
                </div>

                <div className={cx('profile')} onClick={() => navigate(`/feed/profile/${user?._id}`)} style={{cursor: 'pointer'}}>
                    <img 
                        src={user?.avatarURL || '/favicon.png'} 
                        alt="profile" 
                        className={cx('profile-pic')} 
                    />
                    <div className={cx('info-wrapper')}>
                        <span className={cx('full-name')}>{user?.displayName}</span>
                        <span className={cx('username')}>@{user?.username}</span>
                    </div>
                </div>
            </div>

            <div className={cx('body')}>
                <div className={cx('menu-list')}>
                    <div 
                        className={cx('menu-item', { active: location.pathname === '/feed' })} 
                        onClick={() => navigate('/feed')}
                    >
                        <Newspaper size={24} />
                        <span>Feed</span>
                    </div>
                    <div 
                        className={cx('menu-item', { active: location.pathname === '/feed/friends' })} 
                        onClick={() => navigate('/feed/friends')} 
                    >
                        <Users size={24} />
                        <span>Friends</span>
                    </div>
                    <div 
                        className={cx('menu-item', { active: location.pathname === '/feed/saved' })} 
                        onClick={() => navigate('/feed/saved')} 
                    >
                        <Bookmark size={24} />
                        <span>Saved</span>
                    </div>
                    <div 
                        className={cx('menu-item', { active: location.pathname.startsWith('/video') })} 
                        onClick={() => navigate('/video')} 
                    >
                        <Video size={24} />
                        <span>Video</span>
                    </div>
                    <div className={cx('menu-item')} onClick={()=>alert("Marketplace is coming soon")}>
                        <Store size={24} />
                        <span>Marketplace</span>
                    </div>
                </div>

                <div className={cx('separator')}></div>

                <div className={cx('friends-section')}>
                    <h3 className={cx('section-title')}>Suggested Friends</h3>
                    {(displayedSuggestions.length === 0) ? (
                        <p style={{color: '#666', fontSize: '1.2rem', textAlign: 'center'}}>No suggestions available</p>
                    ) : (
                        <div className={cx('friend-list')}>
                            {displayedSuggestions.map(friend => (
                                <div 
                                    key={friend._id} 
                                    className={cx('friend-item')} 
                                    onClick={() => navigate(`/feed/profile/${friend._id}`)}
                                    style={{cursor: 'pointer'}}
                                >
                                    <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                                        <img src={friend.avatarURL || '/favicon.png'} alt={friend.displayName} />
                                        <div style={{display: 'flex', flexDirection: 'column'}}>
                                            <span>{friend.displayName}</span>
                                            {/* <small style={{opacity: 0.6}}>@{friend.username}</small> */}
                                        </div>
                                    </div>
                                    {/* Placeholder for Add action - functionality can be added here */}
                                    {/* <button className={cx('add-friend-btn')}><UserPlus size={16}/></button> */}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

             <div className={cx("footer")}>
                <button className={cx("settings-btn")} onClick={onCloseSetting}>Settings</button>
            </div>
        </div>
    );
};

export default PostsSidebar;
