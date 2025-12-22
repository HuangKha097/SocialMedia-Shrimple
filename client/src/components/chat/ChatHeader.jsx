import React, { useMemo } from 'react';
import classNames from 'classnames/bind';
import styles from '../../assets/css/ChatHeader.module.scss';
import defaultAvatar from "../../../public/favicon.png";
import { Info, Phone, Video, ChevronLeft, MoreVertical } from 'lucide-react';
import { useAuthStore } from "../../stores/useAuthStore.js";
import { useChatStore } from "../../stores/useChatStore.js";
import { useCallStore } from '../../stores/useCallStore';
import { useNavigate, useLocation } from 'react-router-dom';

const cx = classNames.bind(styles);

const ChatHeader = ({ onCloseChatInfo, chat }) => {
    const { user: currentUser, onlineUsers } = useAuthStore();
    const { friends, setActiveConversationId } = useChatStore();
    const { initiateCall } = useCallStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [showMenu, setShowMenu] = React.useState(false);

    if (!chat) return null;

    const isGroup = chat.isGroup;
    let displayName = "Unknown";
    let statusText = "Offline";
    let isOnline = false;
    let partnerId = null;

    // --- 1. XỬ LÝ DỮ LIỆU ---
    const participants = chat.participants || [];
    const groupInfo = chat.group;

    // Resolve Partner (for 1-1)
    let partner = !isGroup ? (participants.find(p => p._id !== currentUser?._id) || participants[0]) : null;

    // START FIX: Enhance with friend data
    if (partner && friends.length > 0) {
        const friend = friends.find(f => f._id === partner._id || f._id === partner._id?.toString());
        if (friend) {
            partner = { ...partner, ...friend };
        }
    }
    // END FIX

    if (isGroup) {
        // Group: Tên nhóm
        displayName = chat.name || groupInfo?.name || "Unnamed Group";
        statusText = `${participants.length} members`;
    } else if (partner) {
        displayName = partner.displayName || partner.username || "User";
        isOnline = onlineUsers.includes(partner._id);
        statusText = isOnline ? "Active now" : "Offline";
        partnerId = partner._id;
    }

    // --- CHECK FRIENDSHIP FOR CALLS ---
    const isAllowedToCall = useMemo(() => {
        if (isGroup) return true;
        if (!partner) return false;
        return friends.some(f => f._id.toString() === partner._id.toString());
    }, [isGroup, partner, friends]);


    // --- 2. HÀM RENDER AVATAR ---
    const renderAvatar = () => {
        const getAvatarSrc = (url) => {
            if (!url) return defaultAvatar;
            if (url.startsWith('http') || url.startsWith('data:')) return url;
            return `http://localhost:5001${url}`;
        };

        // A. Nếu là Group
        if (isGroup) {
            // A1. Có ảnh đại diện nhóm -> Hiện 1 ảnh
            if (chat.avatarURL || groupInfo?.avatarURL) {
                return (
                    <img
                        src={getAvatarSrc(chat.avatarURL || groupInfo?.avatarURL)}
                        alt="Group Avatar"
                        className={cx("profile-pic", "single-avatar")}
                        onError={(e) => { e.target.src = defaultAvatar }}
                    />
                );
            }
            // A2. Không có ảnh nhóm -> Stack avatar thành viên
            if (participants.length > 0) {
                return (
                    <div className={cx('group-avatar-stack')}>
                        <img
                            src={getAvatarSrc(participants[0]?.avatarURL)}
                            alt="mem1"
                            className={cx('stack-avatar', 'first')}
                            onError={(e) => { e.target.src = defaultAvatar }}
                        />
                        {participants.length > 1 && (
                            <img
                                src={getAvatarSrc(participants[1]?.avatarURL)}
                                alt="mem2"
                                className={cx('stack-avatar', 'second')}
                                onError={(e) => { e.target.src = defaultAvatar }}
                            />
                        )}
                    </div>
                );
            }
        }

        // B. Nếu là 1-1
        // Use the resolved partner (merged with friend data)
        const singleAvatarUrl = partner?.avatarURL;

        return (
            <img
                src={getAvatarSrc(singleAvatarUrl)}
                alt="avatar"
                className={cx("profile-pic")}
                onError={(e) => { e.target.src = defaultAvatar }}
            />
        );
    };

    const handleCall = (video) => {
        if (partner) {
            initiateCall(partner._id, video, partner);
        } else if (partnerId) {
            // Fallback
            initiateCall(partnerId, video, { _id: partnerId, displayName: displayName });
        }
    };

    const handleProfileClick = () => {
        if (!isGroup && partnerId) {
            navigate(`/feed/profile/${partnerId}`);
        }
    };

    return (
        <div className={cx('header-wrapper')}>
            <button
                type="button"
                className={cx('mobile-back-btn')}
                onClick={(e) => {
                    e.stopPropagation();
                    setActiveConversationId(null);
                    // Clear search params to prevent refresh from re-opening chat
                    navigate(location.pathname, { replace: true });
                }}
            >
                <ChevronLeft size={30} />
            </button>
            <div className={cx('user-info')} onClick={handleProfileClick} style={{ cursor: !isGroup ? 'pointer' : 'default' }}>
                <div className={cx('avatar-container')}>
                    {renderAvatar()}
                </div>

                <div className={cx("info")}>
                    <p className={cx('user-name')}>{displayName}</p>
                    <span className={cx('user-status')}>
                        {!isGroup && isOnline && <span className={cx('online-dot')}></span>}
                        {statusText}
                    </span>
                </div>
            </div>

            <div className={cx('action-buttons')}>
                <button
                    className={cx('btn')}
                    disabled={!isAllowedToCall}
                    title={!isAllowedToCall ? "You are not friends" : "Voice Call"}
                    onClick={() => alert('Coming soon!')}
                >
                    <Phone size={20} />
                </button>
                <button
                    className={cx('btn')}
                    disabled={!isAllowedToCall}
                    title={!isAllowedToCall ? "You are not friends" : "Video Call"}
                    onClick={() => alert('Coming soon!')}
                >
                    <Video size={20} />
                </button>

                <div className={cx('more-menu-container')}>
                    <button
                        className={cx('btn', { active: showMenu })}
                        onClick={() => setShowMenu(!showMenu)}
                    >
                        <MoreVertical size={20} />
                    </button>

                    {showMenu && (
                        <div className={cx('dropdown-menu')}>
                            <button className={cx('menu-item')} onClick={() => { onCloseChatInfo(); setShowMenu(false); }}>
                                <Info size={18} />
                                <span>Chat Info</span>
                            </button>
                            {/* Add more items here like Search, Mute, Block etc. */}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatHeader;