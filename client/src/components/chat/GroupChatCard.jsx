import React from 'react';
import classNames from 'classnames/bind';
import styles from '../../assets/css/ChatCard.module.scss';
import default_avt from "../../../public/favicon.png";
import { useChatStore } from "../../stores/useChatStore.js";

const cx = classNames.bind(styles);

const GroupChatCard = ({ props }) => {
    // Lấy các hàm và state cần thiết từ Store
    const { setActiveConversationId, activeConversationId, messages, fetchMessages } = useChatStore();

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

    // 3. Logic hiển thị Avatar Group
    const renderAvatar = () => {
        if (groupInfo?.avatarURL) {
            return (
                <img
                    src={groupInfo.avatarURL}
                    alt="Group Avatar"
                    className={cx('avatar', 'single-avatar')}
                />
            );
        }

        if (participants.length > 0) {
            return (
                <div className={cx('group-avatar-stack')}>
                    <img
                        src={participants[0]?.avatarUrl || default_avt}
                        alt="mem1"
                        className={cx('stack-avatar', 'first')}
                    />
                    {participants.length > 1 && (
                        <img
                            src={participants[1]?.avatarUrl || default_avt}
                            alt="mem2"
                            className={cx('stack-avatar', 'second')}
                        />
                    )}
                </div>
            );
        }
        return <img src={default_avt} alt="default" className={cx('avatar', 'single-avatar')} />;
    };

    // 4. Xử lý khi click vào Card: Set Active ID + Tải tin nhắn
    const handleSelectConversation = async (conversationId) => {
        setActiveConversationId(conversationId);

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