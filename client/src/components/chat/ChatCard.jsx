import React from 'react';
import classNames from 'classnames/bind';
import styles from '../../assets/css/ChatCard.module.scss';
import default_avt from "../../../public/favicon.png";
import { useChatStore } from "../../stores/useChatStore.js";
import { useAuthStore } from "../../stores/useAuthStore.js";
import { useNavigate } from "react-router-dom";

const cx = classNames.bind(styles);

const ChatCard = ({ props }) => {
    const { setActiveConversationId, activeConversationId, messages, fetchMessages, friends } = useChatStore();
    const { user: currentUser, onlineUsers } = useAuthStore();
    const navigate = useNavigate();

    // 3. LOGIC TÌM NGƯỜI CHAT CÙNG (PARTNER)
    // Lọc ra người có _id KHÁC với _id của mình.
    // Nếu không tìm thấy (trường hợp chat với chính mình), lấy người đầu tiên.
    let partner = props?.participants?.find(p => p._id !== currentUser?._id) || props?.participants?.[0];

    // START FIX: Enhance with friend data
    if (partner && friends.length > 0) {
        const friend = friends.find(f => f._id === partner._id || f._id === partner._id?.toString());
        if (friend) {
            partner = { ...partner, ...friend, ...partner }; // Keep partner status but fill with friend details? actually friend details should override if partner is scant
            // Actually, usually friend object has better avatar/displayName. But let's prioritize prop if it's updated?
            // No, the issue is prop is SCANT. So friend > partner (partial).
            // EXCEPT: partner might have online status or something? No, user object usually static.
            partner = { ...partner, ...friend };
        }
    }
    // END FIX

    const isOnline = onlineUsers.includes(partner?._id);

    // Correctly extract unread count for current user
    const getUnreadCount = () => {
        if (!props.unreadCounts) return 0;

        // Assuming it's a map-like object { userId: count, ... }
        // Handle both Map object and plain object
        if (props.unreadCounts instanceof Map) {
            return props.unreadCounts.get(currentUser?._id) || 0;
        } else if (typeof props.unreadCounts === 'object') {
            return props.unreadCounts[currentUser?._id] || 0;
        }

        // Fallback if it's a number (legacy or incorrect state)
        return typeof props.unreadCounts === 'number' ? props.unreadCounts : 0;
    };

    const unreadCount = getUnreadCount();

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();

        if (date.toDateString() === now.toDateString()) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
    };

    const handleSelectConversation = async (conversationId) => {
        setActiveConversationId(conversationId);
        // Only navigate if standard chat (or temp), but let's just sync URL always
        navigate(`/chat?id=${conversationId}`);

        const isTempId = conversationId && conversationId.toString().startsWith('temp_');

        if (!isTempId) {
            if (!messages[conversationId]) {
                await fetchMessages(conversationId);
            }
        } else {
            console.log("Cuộc trò chuyện mới.");
        }
    }

    return (
        <div
            className={cx('chat-card-wrapper', { active: (Boolean(activeConversationId) && props._id === activeConversationId) })}
            onClick={() => handleSelectConversation(props._id)}
            style={{ cursor: 'pointer', border: (Boolean(activeConversationId) && props._id === activeConversationId) ? "2px solid var(--primary-color)" : "none" }}
        >
            <div className={cx('avatar-wrapper')}>
                {/* 4. Dùng avatar của partner đã tìm được */}
                <img
                    src={partner?.avatarURL ? (partner.avatarURL.startsWith('http') ? partner.avatarURL : `http://localhost:5001${partner.avatarURL}`) : default_avt}
                    alt="avatar"
                    className={cx('avatar')}
                    onError={(e) => { e.target.src = default_avt }}
                />

                {isOnline && <div className={cx("status", "online")}></div>}
            </div>

            <div className={cx('info-wrapper')}>
                {/* 5. Dùng tên của partner đã tìm được */}
                <p className={cx('full-name')}>
                    {partner?.displayName || "Unknown User"}
                </p>

                <p
                    className={cx('last-message')}
                    style={{ fontWeight: (unreadCount > 0) ? 'bold' : 'normal', color: (unreadCount > 0) ? '#000' : '#c8c8c8' }}
                >
                    {/* Kiểm tra nếu là tin nhắn của mình thì thêm chữ "You: " (Tuỳ chọn) */}
                    {/* {props?.lastMessage?.senderId === currentUser?._id && "You: "} */}
                    {props?.lastMessage?.content || "No message yet!"}
                </p>
            </div>

            <div className={cx('status-wrapper')}>
                <p className={cx('time')}>{formatTime(props?.lastMessage?.createdAt)}</p>
                {unreadCount > 0 && (
                    <span className={cx('unread-count')}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </div>
        </div>
    );
};

export default ChatCard;