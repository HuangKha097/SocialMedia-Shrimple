import React from 'react';
import classNames from 'classnames/bind';
import styles from '../../assets/css/ChatCard.module.scss';
import default_avt from "../../../public/favicon.png";
import { useChatStore } from "../../stores/useChatStore.js";
import { useAuthStore } from "../../stores/useAuthStore.js";
import { useNavigate } from "react-router-dom";

const cx = classNames.bind(styles);

const ChatCard = ({ props }) => {
    const { setActiveConversationId, activeConversationId, messages, fetchMessages } = useChatStore();
    const { user: currentUser, onlineUsers } = useAuthStore(); 
    const navigate = useNavigate();

    // 3. LOGIC TÌM NGƯỜI CHAT CÙNG (PARTNER)
    // Lọc ra người có _id KHÁC với _id của mình.
    // Nếu không tìm thấy (trường hợp chat với chính mình), lấy người đầu tiên.
    const partner = props?.participants?.find(p => p._id !== currentUser?._id) || props?.participants?.[0];
    
    const isOnline = onlineUsers.includes(partner?._id);

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
                    src={partner?.avatarUrl || default_avt}
                    alt="avatar"
                    className={cx('avatar')}
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
                    style={{ fontWeight: (props.unreadCounts > 0) ? 'bold' : 'normal', color: (props.unreadCounts > 0) ? '#000' : '#c8c8c8' }}
                >
                    {/* Kiểm tra nếu là tin nhắn của mình thì thêm chữ "You: " (Tuỳ chọn) */}
                    {/* {props?.lastMessage?.senderId === currentUser?._id && "You: "} */}
                    {props?.lastMessage?.content || "No message yet!"}
                </p>
            </div>

            <div className={cx('status-wrapper')}>
                <p className={cx('time')}>{formatTime(props?.lastMessage?.createdAt)}</p>
                {props?.unreadCounts > 0 && (
                    <span className={cx('unread-count')}>
                        {props?.unreadCounts > 9 ? '9+' : props?.unreadCounts}
                    </span>
                )}
            </div>
        </div>
    );
};

export default ChatCard;