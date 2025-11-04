import React from 'react';
import classNames from 'classnames/bind';
import styles from '../assets/css/ChatPage.module.scss';
 
import SlideBar from "../components/SlideBar.jsx";
import ChatContainer from "../components/ChatContainer.jsx";


const cx = classNames.bind(styles);
const ChatPage = () => {
    return (
        <div className={cx("container")}>
            <div className={cx("chat-wrapper")}>
                <div className={cx("block-left")}>
                    <SlideBar/>
                </div>
                <div className={cx("block-right")}>
                 <ChatContainer/>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;