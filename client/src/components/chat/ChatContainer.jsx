import React from 'react';
import classNames from 'classnames/bind';
import styles from '../../assets/css/ChatContainer.module.scss';
import ChatHeader from "./ChatHeader.jsx";
import ChatBody from "./ChatBody.jsx";
import ChatInput from "./ChatInput.jsx";
import ChatInfo from "./ChatInfo.jsx";

const cx = classNames.bind(styles);

const ChatContainer = ({onCloseChatInfo,isShowChatInfo}) => {
    return (
        <div className={cx('chat-container-wrapper')}>
            <div className={cx("block-left")}>
                <div className={cx("header")}><ChatHeader onCloseChatInfo={onCloseChatInfo}/></div>
                <div className={cx("body")}><ChatBody/></div>
                <div className={cx("footer")}><ChatInput/></div>
            </div>
            {isShowChatInfo && <div className={cx("block-right")}>
                <div className={cx("chat-info-wrapper")}><ChatInfo/></div>
            </div>}
        </div>
    );
};

export default ChatContainer;