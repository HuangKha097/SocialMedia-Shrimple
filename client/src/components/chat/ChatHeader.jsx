import React, { useMemo } from 'react';
import classNames from 'classnames/bind';
import styles from '../../assets/css/ChatHeader.module.scss';
import defaultAvatar from "../../../public/favicon.png";
import { Info, Phone, Video } from 'lucide-react';
import { useAuthStore } from "../../stores/useAuthStore.js";
import { useChatStore } from "../../stores/useChatStore.js";
import { useCallStore } from '../../stores/useCallStore';
import { useNavigate } from 'react-router-dom';

const cx = classNames.bind(styles);

const ChatHeader = ({ onCloseChatInfo, chat }) => {
    const { user: currentUser, onlineUsers } = useAuthStore();
    const { friends } = useChatStore();
    const { initiateCall } = useCallStore();
    const navigate = useNavigate();

    if (!chat) return null;

    const isGroup = chat.isGroup;
    let displayName = "Unknown";
    let statusText = "Offline";
    let isOnline = false;
    let partnerId = null;

    // --- 1. XỬ LÝ DỮ LIỆU ---
    const participants = chat.participants || [];
    const groupInfo = chat.group;

    if (isGroup) {
        // Group: Tên nhóm
        displayName = chat.name || groupInfo?.name || "Unnamed Group";
        statusText = `${participants.length} members`;
    } else {
        // 1-1: Tìm người chat cùng
        const partner = participants.find(p => p._id !== currentUser?._id) || participants[0];
        if (partner) {
            displayName = partner.displayName || partner.username || "User";
            isOnline = onlineUsers.includes(partner._id);
            statusText = isOnline ? "Active now" : "Offline";
            partnerId = partner._id;
        }
    }

    // --- CHECK FRIENDSHIP FOR CALLS ---
    const isAllowedToCall = useMemo(() => {
        if (isGroup) return true; 

        const partner = participants.find(p => p._id !== currentUser?._id);
        if (!partner) return false;

        return friends.some(f => f._id.toString() === partner._id.toString());
    }, [isGroup, participants, currentUser, friends]);


    // --- 2. HÀM RENDER AVATAR ---
    const renderAvatar = () => {
        // A. Nếu là Group
        if (isGroup) {
            // A1. Có ảnh đại diện nhóm -> Hiện 1 ảnh
            if (chat.avatarUrl || groupInfo?.avatarURL) {
                return (
                    <img
                        src={chat.avatarUrl || groupInfo?.avatarURL}
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
                            src={participants[0]?.avatarUrl || defaultAvatar}
                            alt="mem1"
                            className={cx('stack-avatar', 'first')}
                        />
                        {participants.length > 1 && (
                            <img
                                src={participants[1]?.avatarUrl || defaultAvatar}
                                alt="mem2"
                                className={cx('stack-avatar', 'second')}
                            />
                        )}
                    </div>
                );
            }
        }

        // B. Nếu là 1-1
        let singleAvatarUrl = defaultAvatar;
        if (!isGroup) {
            const partner = participants.find(p => p._id !== currentUser?._id) || participants[0];
            singleAvatarUrl = partner?.avatarUrl || defaultAvatar;
        }

        return (
            <img
                src={singleAvatarUrl}
                alt="avatar"
                className={cx("profile-pic")}
                onError={(e) => { e.target.src = defaultAvatar }}
            />
        );
    };

    const handleCall = (video) => {
        // Find partner ID again if needed or use partnerId calculated above
        const partnerToCall = !isGroup 
            ? participants.find(p => p._id !== currentUser?._id) 
            : null;

        if (partnerToCall) {
            initiateCall(partnerToCall._id, video, partnerToCall);
        } else if (partnerId) {
             // Fallback to partnerId calculated in render checks
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
            <div className={cx('user-info')} onClick={handleProfileClick} style={{cursor: !isGroup ? 'pointer' : 'default'}}>
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
                    onClick={() => handleCall(false)}
                >
                    <Phone size={16} />
                </button>
                <button 
                    className={cx('btn')} 
                    disabled={!isAllowedToCall}
                    title={!isAllowedToCall ? "You are not friends" : "Video Call"}
                    onClick={() => handleCall(true)}
                >
                    <Video size={16} />
                </button>
                <button className={cx('btn')} onClick={onCloseChatInfo}><Info size={16} /></button>
            </div>
        </div>
    );
};

export default ChatHeader;