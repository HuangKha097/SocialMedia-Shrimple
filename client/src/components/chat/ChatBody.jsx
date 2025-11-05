import React from 'react';
import classNames from 'classnames/bind';
import styles from '../../assets/css/ChatBody.module.scss';
import Message from './Message.jsx';
import dashboardImage from '../../../public/logo_bg.png';


const cx = classNames.bind(styles);
const ChatBody = () => {
    return (
        <div className={cx('chat-body-wrapper')}>
            <Message
                senderName="Sarah Chen"
                text="Wow, that looks really professional! Wow, that looks really professional! Wow, that looks really professional!  The UI design is clean and modern A web application for team collaboration. Still in early stages but excited about it!"
                time="10:37 AM"
            />
            <Message
                image={dashboardImage}
                time="10:38 AM"
            />
            <Message
                text="Thanks! I've been working on the user experience a lot"
                time="10:41 AM"
            />

            {/* Tin nhắn của bạn */}
            <Message
                text="Wow, that looks really professional! The UI design is clean and modern"
                time="10:42 AM"
                isMe={true}
            />

            <Message
                text="Wow, that looks really professional! The UI design is clean and modern"
                time="10:42 AM"
                isMe={true}
            />
            <Message
                text="Wow, that looks really professional! The UI design is clean and modern"
                time="10:42 AM"
                isMe={true}
            />

            <Message
                text=" Wow, that looks really professional! Wow, that looks really professional! Wow, that looks really professional!  The UI design is clean and modern Wow, that looks really professional! Wow, that looks really professional! Wow, that looks really professional!  The UI design is clean and modern"
                time="10:42 AM"
                isMe={true}
            />

        </div>
    );
};

export default ChatBody;