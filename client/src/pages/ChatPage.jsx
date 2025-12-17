import React, {useState} from 'react';
import classNames from 'classnames/bind';
import styles from '../assets/css/ChatPage.module.scss';
import { Outlet, useLocation } from 'react-router-dom';

import SlideBar from "../components/slidebar/SlideBar.jsx";
import {useAuthStore} from "../stores/useAuthStore.js";
import {toast} from "sonner";
import SettingContainer from "../components/setting/SettingContainer.jsx";
import {ChevronRight} from 'lucide-react';
import AddFriendPopUp from "../components/slidebar/AddFriendPopUp.jsx";
import CreateGroupPopUp from "../components/slidebar/CreateGroupPopUp.jsx";


import PostsSidebar from "../components/posts/PostsSidebar.jsx";

const cx = classNames.bind(styles);
const ChatPage = () => {
    const user = useAuthStore((s) => s.user);
    const [isShowSetting, setIsShowSetting] = useState(false);
    const [isShowSlideBar, setIsShowSlideBar] = useState(true);
    const [isShowChatInfo, setIisShowChatInfo] = useState(false);
    const [isShowAddFriendPopup, setIsShowAddFriendPopup] = useState(false);
    const [isShowCreateGroupPopup, setIsShowCreateGroupPopup] = useState(false);
    const signOut = useAuthStore((state) => state.signOut);
    const location = useLocation();
    
    // Determine view mode from URL
    const isFeedView = location.pathname.startsWith('/feed');
    const isChatView = location.pathname.startsWith('/chat');

    const handleLogout = async () => {
        try {
            await signOut()

        } catch (err) {
            toast.error(err.message);
            console.log(err)
        }
    }
    const onCloseSetting = () => {
        setIsShowSetting((prev) => !prev);
    }
    const onCloseSlideBar = () => {
        setIsShowSlideBar((prev) => !prev);
    }
    const onCloseChatInfo = () => {
        setIisShowChatInfo((prev) => !prev);
    }
    const onCloseAddFriendPopup = () => {
        setIsShowAddFriendPopup((prev) => !prev);
    }
    const onCloseCreateGroupPopup = () => {
        setIsShowCreateGroupPopup((prev) => !prev);
    }

    // Context to pass to Outlet (ChatContainer specifically needs this)
    const outletContext = {
        isShowChatInfo,
        onCloseChatInfo
    };

    return (<div className={cx("container")}>
        <div className={cx("chat-wrapper")}>
            {isShowSlideBar ? <div className={cx("block-left")}>
                {isFeedView ? (
                    <PostsSidebar 
                        onCloseSetting={onCloseSetting}
                    />
                ) : (
                    <SlideBar 
                        onCloseSetting={onCloseSetting} 
                        onCloseSlideBar={onCloseSlideBar} 
                        onCloseAddFriendPopup={onCloseAddFriendPopup} 
                        onCloseCreateGroupPopup={onCloseCreateGroupPopup}
                    />
                )}
            </div> : <div className={cx("block-left", "no-slide-bar")}>
                <button className={cx("more-btn")} onClick={onCloseSlideBar}><ChevronRight size={18}/></button>
            </div>}
            <div className={cx("block-right")}>
               <Outlet context={outletContext} />
            </div>

            {isShowSetting && <div className={cx("setting-wrapper")}>
                <SettingContainer onCloseSetting={onCloseSetting} handleLogout={handleLogout}/>
            </div>}
            {isShowAddFriendPopup && <div className={cx("add-friend-wrapper")}>
                <AddFriendPopUp onCloseAddFriendPopup={onCloseAddFriendPopup}/>
            </div>}
            {isShowCreateGroupPopup && <div className={cx("add-friend-wrapper")}>
                <CreateGroupPopUp onCloseCreateGroupPopup={onCloseCreateGroupPopup}/>
            </div>}
        </div>
        <p className={cx("copyright")}>
            © 2025 Shrimple. All rights reserved.
        </p>
    </div>);
};

export default ChatPage;