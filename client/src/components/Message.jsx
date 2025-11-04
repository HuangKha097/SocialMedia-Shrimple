import React from 'react';
import classNames from 'classnames/bind';
import styles from '../assets/css/Message.module.scss';
import profilePic_test from "../../public/favicon.png";

const cx = classNames.bind(styles);

const Message = ({
                     text,
                     time,
                     senderName,
                     avatar = profilePic_test,
                     isMe = false,
                     image = null
                 }) => {
    return (
        <div className={cx('message-wrapper', {me: isMe})}>
            {!isMe && <img src={avatar} alt="avatar" className={cx('avatar')}/>}

            <div className={cx('message-content')}>

                {image ? (
                    <img src={image} alt="chat-content" className={cx('message-image')}/>
                ) : (

                    <div className={cx('message-bubble')}>
                        <p className={cx('message-text')}>{text}</p>
                    </div>
                )}
                <p className={cx('message-time')}>{time}</p>
            </div>
        </div>
    );
};

export default Message;