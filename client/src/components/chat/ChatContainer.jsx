import React from 'react';
import classNames from 'classnames/bind';
import styles from '../../assets/css/ChatContainer.module.scss';
import ChatHeader from "./ChatHeader.jsx";
import ChatBody from "./ChatBody.jsx";
import ChatInput from "./ChatInput.jsx";
import ChatInfo from "./ChatInfo.jsx";
import { useChatStore } from "../../stores/useChatStore.js";
import { MessageSquare } from "lucide-react"; // Icon cho màn hình chờ

const cx = classNames.bind(styles);

const ChatContainer = ({ onCloseChatInfo, isShowChatInfo }) => {
    const { activeConversationId } = useChatStore();


    if (!activeConversationId) {
        return (
            <div className={cx('chat-container', 'no-chat-selected')}>
                <div className={cx('welcome-content')}>
                    <div className={cx('icon-wrapper')}>
                        <MessageSquare size={50} />
                    </div>
                    <h2>Welcome to Shrimple Chat!</h2>
                    <p>Select a conversation from the sidebar to start chatting.</p>
                </div>
            </div>
        );
    }


    return (
        <div className={cx('chat-container-wrapper')}>
            <div className={cx("block-left")}>
                <div className={cx("header")}>
                    <ChatHeader onCloseChatInfo={onCloseChatInfo} />
                </div>

                <div className={cx("body")}>
                    <ChatBody />
                </div>

                <div className={cx("footer")}>
                    <ChatInput />
                </div>
            </div>

            {isShowChatInfo && (
                <div className={cx("block-right")}>
                    <div className={cx("chat-info-wrapper")}>
                        <ChatInfo />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatContainer;