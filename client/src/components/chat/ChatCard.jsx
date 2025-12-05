import React from 'react';
import classNames from 'classnames/bind';
import styles from '../../assets/css/ChatCard.module.scss';
import default_avt from "../../../public/favicon.png";
import {useChatStore} from "../../stores/useChatStore.js";

const cx = classNames.bind(styles);

const ChatCard = ({props}) => {
    const { setActiveConversationId, activeConversationId} = useChatStore();
    console.log(activeConversationId)

    // // Helper format giờ (Hiện giờ:phút)
    // const formatTime = (date) => {
    //     if (!date) return "";
    //     if (date instanceof Date) {
    //         return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    //     }
    //     return "";
    // };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();

        // Nếu là ngày hôm nay thì hiện giờ
        if (date.toDateString() === now.toDateString()) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        // Khác ngày thì hiện ngày/tháng
        return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
    };
    return (
        <div
            className={cx('chat-card-wrapper', { active: (Boolean(activeConversationId) && props._id === activeConversationId) })}
            onClick={() => setActiveConversationId(props._id)}
            style={{ cursor: 'pointer', border: (Boolean(activeConversationId) && props._id === activeConversationId) ? "2px solid var(--primary-color)": "none" }}
        >
            <div
                className={cx('avatar-wrapper')}

            >
                <img src={props?.participants?.[1]?.avatarUrl || default_avt} alt="avatar" className={cx('avatar')} />

                {/* Tạm thời để cứng online, sau này check props isOnline */}
                <div className={cx("status", "online")}></div>
            </div>

            <div className={cx('info-wrapper')}>
                <p className={cx('full-name')}>{props?.participants?.[1]?.displayName || props?.participants?.[0]?.displayName}</p>

                {/* Logic style: Nếu chưa đọc thì in đậm */}
                <p
                    className={cx('last-message')}
                    style={{ fontWeight: (props.unreadCounts > 0) ? 'bold' : 'normal', color: (props.unreadCounts > 0) ? '#000' : '#c8c8c8' }}
                >
                    {props?.lastMessage?.content || "No message yet!"}
                </p>
            </div>

            <div className={cx('status-wrapper')}>
                <p className={cx('time')}>{formatTime(props?.lastMessage?.createdAt)}</p>
                {props?.unreadCounts > 0 && (
                    <span className={cx('unread-count')}>
                        {props?.[0]?.unreadCounts}
                    </span>
                )}
            </div>
        </div>
    );
};

export default ChatCard;