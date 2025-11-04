import React from 'react';
import classNames from 'classnames/bind';
import styles from '../assets/css/ChatCard.module.scss';
import profilePic_test from "../../public/favicon.png";

const cx = classNames.bind(styles);

const ChatCard = ({
                      name = "Sarah Chen",
                      lastMessage = "Hey! How's the new projec...",
                      time = "2m",
                      unreadCount = 2,
                      avatar = profilePic_test
                  }) => {
    return (
        <div className={cx('chat-card-wrapper')}>
            <div className={cx('avatar-wrapper')}>
                <img src={avatar} alt="avatar" className={cx('avatar')} />

            </div>

            <div className={cx('info-wrapper')}>
                <p className={cx('full-name')}>{name}</p>
                <p className={cx('last-message')}>{lastMessage}</p>
            </div>

            <div className={cx('status-wrapper')}>
                <p className={cx('time')}>{time}</p>

                {unreadCount > 0 && (
                    <span className={cx('unread-count')}>
                        {unreadCount}
                    </span>
                )}
            </div>
        </div>
    );
};

export default ChatCard;