import React from 'react';
import classNames from 'classnames/bind';
import styles from '../../assets/css/ChatCard.module.scss';
import default_avt from "../../../public/favicon.png";
import {useChatStore} from "../../stores/useChatStore.js"; // Ảnh mặc định nếu user không có avatar

const cx = classNames.bind(styles);

const ChatCard = ({props}) => {
    const {setActiveConversationId, activeConversationId} = useChatStore();
    // 1. Phân tách dữ liệu cho gọn
    const groupInfo = props?.group;
    const participants = props?.participants || [];
    const lastMessage = props?.lastMessage;

    // 2. Hàm format thời gian đơn giản (Ví dụ: 10:30 hoặc 20/10)
    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();

        // Nếu là ngày hôm nay thì hiện giờ
        if (date.toDateString() === now.toDateString()) {
            return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
        }
        // Khác ngày thì hiện ngày/tháng
        return date.toLocaleDateString([], {day: '2-digit', month: '2-digit'});
    };

    // 3. Logic hiển thị Avatar
    const renderAvatar = () => {
        // Ưu tiên 1: Group có avatar riêng
        if (groupInfo?.avatarURL) {
            return (
                <img
                    src={groupInfo.avatarURL}
                    alt="Group Avatar"
                    className={cx('avatar', 'single-avatar')}
                />
            );
        }

        // Ưu tiên 2: Group chưa có avatar -> Lấy 2 thành viên đầu tiên ghép lại
        if (participants.length > 0) {
            return (
                <div className={cx('group-avatar-stack')}>
                    {/* Ảnh thành viên thứ 1 (Góc trên trái) */}
                    <img
                        src={participants[0]?.avatarUrl || default_avt}
                        alt="mem1"
                        className={cx('stack-avatar', 'first')}
                    />

                    {/* Ảnh thành viên thứ 2 (Góc dưới phải) - Nếu có */}
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

        // Fallback: Nếu không có ai (trường hợp hiếm)
        return <img src={default_avt} alt="default" className={cx('avatar', 'single-avatar')}/>;
    };

    return (
        <div
            className={cx('chat-card-wrapper', {active: (Boolean(activeConversationId) && props._id === activeConversationId)})}
            onClick={() => setActiveConversationId(props._id)}
            style={{
                cursor: 'pointer',
                border: (Boolean(activeConversationId) && props._id === activeConversationId) ? "2px solid var(--primary-color)" : "none"
            }}
        >

            <div className={cx('avatar-wrapper')}>
                {renderAvatar()}
            </div>

            {/* Cột giữa: Tên & Tin nhắn */}
            <div className={cx('info-wrapper')}>
                <p className={cx('group-name')}>
                    {groupInfo?.name || "Unnamed Group"}
                </p>

                <p className={cx('last-message', {'unseen': props?.unreadCounts > 0})}>
                    {/* Xử lý hiển thị nội dung tin nhắn */}
                    {lastMessage
                        ? (
                            <>
                                {/* Nếu cần hiện tên người gửi: <span>{lastMessage.senderName}: </span> */}
                                {lastMessage.content || "Sent an attachment"}
                            </>
                        )
                        : <span className={cx('empty-msg')}>No messages yet</span>
                    }
                </p>
            </div>

            {/* Cột phải: Thời gian & Số tin chưa đọc */}
            <div className={cx('status-wrapper')}>
                {/* Dùng updatedAt hoặc lastMessageAt */}
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

export default ChatCard;