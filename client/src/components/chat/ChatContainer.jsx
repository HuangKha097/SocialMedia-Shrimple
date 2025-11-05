import React from 'react';
import classNames from 'classnames/bind';
import styles from '../../assets/css/ChatContainer.module.scss';
import ChatHeader from "./ChatHeader.jsx";
import ChatBody from "./ChatBody.jsx";
import ChatInput from "./ChatInput.jsx";

const cx = classNames.bind(styles);

const ChatContainer = () => {
    return (
        <div className={cx('chat-container-wrapper')}>
            <div className={cx("header")}><ChatHeader/></div>
            <div className={cx("body")}><ChatBody/></div>
            <div className={cx("footer")}><ChatInput/></div>
        </div>
    );
};

export default ChatContainer;