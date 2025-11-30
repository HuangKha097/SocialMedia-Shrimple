import React from 'react';
import classNames from 'classnames/bind';
import styles from '../../assets/css/ChatCard.module.scss';
import default_avt from "../../../public/favicon.png";

const cx = classNames.bind(styles);

const ChatCard = ({convo}) => {
    console.log(convo);
    return (
        <div className={cx('chat-card-wrapper')}>
            <div className={cx('avatar-wrapper')}>
                <img src={convo.avatarUrl ||  default_avt} alt="avatar" className={cx('avatar')} />

            </div>

            <div className={cx('info-wrapper')}>
                <p className={cx('full-name')}>{convo?.lastMessage?.senderId?.displayName}</p>
                <p className={cx('last-message')}>{convo?.lastMessage?.content}</p>
            </div>

            <div className={cx('status-wrapper')}>
                <p className={cx('time')}>{convo.joinedAt}</p>

                {convo.unreadCounts > 0 && (
                    <span className={cx('unread-count')}>
                        {convo.unreadCounts}
                    </span>
                )}
            </div>
        </div>
    );
};

export default ChatCard;