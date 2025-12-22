import React from 'react';
import { useNavigate } from "react-router-dom";
import classNames from 'classnames/bind';
import styles from '../../assets/css/ChatCard.module.scss';
import default_avt from "../../../public/favicon.png";
import { useChatStore } from "../../stores/useChatStore.js";

const cx = classNames.bind(styles);

const GroupChatCard = ({ props }) => {
    // Lấy các hàm và state cần thiết từ Store
    const { setActiveConversationId, activeConversationId, messages, fetchMessages, friends } = useChatStore();

    // 1. Phân tách dữ liệu
    const groupInfo = props?.group;
    const participants = props?.participants || [];
    const lastMessage = props?.lastMessage;

    // 2. Hàm format thời gian
    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();

        if (date.toDateString() === now.toDateString()) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
    };

    const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "https://shrimple.onrender.com";

    // 3. Logic hiển thị Avatar Group
    const renderAvatar = () => {
        const getAvatarSrc = (url) => {
            if (!url) return default_avt;
            if (url.startsWith('http') || url.startsWith('data:')) return url;
            return `${BASE_URL}${url}`;
        };

        if (groupInfo?.avatarURL) {
            return (
                <img
                    src={getAvatarSrc(groupInfo.avatarURL)}
                    alt="Group Avatar"
                    className={cx('avatar', 'single-avatar')}
                    onError={(e) => { e.target.src = default_avt }}
                />
            );
        }

        if (participants.length > 0) {
            // Resolve avatars for the first 2 participants from Friends list if available
            const resolveAvatar = (member) => {
                if (!member) return null;
                // Try to find in friends list
                if (friends && friends.length > 0) {
                    const friend = friends.find(f => f._id === member._id || f._id === member._id?.toString());
                    if (friend && friend.avatarURL) return friend.avatarURL;
                }
                return member.avatarURL;
            };

            const firstAvatar = resolveAvatar(participants[0]);
            const secondAvatar = participants.length > 1 ? resolveAvatar(participants[1]) : null;

            return (
                <div className={cx('group-avatar-stack')}>
                    <img
                        src={getAvatarSrc(firstAvatar)}
                        alt="mem1"
                        className={cx('stack-avatar', 'first')}
                        onError={(e) => { e.target.src = default_avt }}
                    />
                    {participants.length > 1 && (
                        <img
                            src={getAvatarSrc(secondAvatar)}
                            alt="mem2"
                            className={cx('stack-avatar', 'second')}
                            onError={(e) => { e.target.src = default_avt }}
                        />
                    )}
                </div>
            );
        }
        return <img src={default_avt} alt="default" className={cx('avatar', 'single-avatar')} />;
    };

    // 4. Xử lý khi click vào Card: Set Active ID + Tải tin nhắn
    const navigate = useNavigate();
    const handleSelectConversation = async (conversationId) => {
        setActiveConversationId(conversationId);
        navigate(`/chat?id=${conversationId}`);

        // Luôn gọi fetchMessages để đảm bảo tải dữ liệu mới nhất
        // Store sẽ tự xử lý nếu cần thiết (dựa vào cursor) nhưng gọi ở đây là an toàn nhất
        await fetchMessages(conversationId);
    };

    return (
        <div
            className={cx('chat-card-wrapper', { active: (Boolean(activeConversationId) && props._id === activeConversationId) })}
            // --- FIX QUAN TRỌNG: Gọi hàm handleSelectConversation ---
            onClick={() => handleSelectConversation(props._id)}
            style={{
                cursor: 'pointer',
                border: (Boolean(activeConversationId) && props._id === activeConversationId) ? "2px solid var(--primary-color)" : "none"
            }}
        >
            <div className={cx('avatar-wrapper')}>
                {renderAvatar()}
            </div>

            <div className={cx('info-wrapper')}>
                <p className={cx('group-name')}>
                    {groupInfo?.name || "Unnamed Group"}
                </p>

                <p className={cx('last-message', { 'unseen': props?.unreadCounts > 0 })}>
                    {lastMessage
                        ? (
                            <>
                                {/* Nếu muốn hiện tên người gửi: <span>{lastMessage.senderId?.displayName}: </span> */}
                                {lastMessage.content || "Sent an attachment"}
                            </>
                        )
                        : <span className={cx('empty-msg')}>No messages yet</span>
                    }
                </p>
            </div>

            <div className={cx('status-wrapper')}>
                <p className={cx('time')}>{formatTime(props?.updatedAt || props?.lastMessageAt)}</p>

                {props?.unreadCounts > 0 && (
                    <span className={cx('unread-badge')}>
                        {props?.unreadCounts > 9 ? '9+' : props?.unreadCounts}
                    </span>
                )}
            </div>
        </div>
    );
};

export default GroupChatCard;