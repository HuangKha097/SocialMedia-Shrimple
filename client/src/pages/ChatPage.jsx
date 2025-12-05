import React, {useState} from 'react';
import classNames from 'classnames/bind';
import styles from '../assets/css/ChatPage.module.scss';

import SlideBar from "../components/slidebar/SlideBar.jsx";
import ChatContainer from "../components/chat/ChatContainer.jsx";
import {useAuthStore} from "../stores/useAuthStore.js";
import {toast} from "sonner";
import SettingContainer from "../components/setting/SettingContainer.jsx";
import {ChevronRight} from 'lucide-react';
import AddFriendPopUp from "../components/slidebar/AddFriendPopUp.jsx";


const cx = classNames.bind(styles);
const ChatPage = () => {
    const user = useAuthStore((s) => s.user);

    const [isShowSetting, setIsShowSetting] = useState(false);
    const [isShowSlideBar, setIsShowSlideBar] = useState(true);
    const [isShowChatInfo, setIisShowChatInfo] = useState(false);
    const [isShowAddFriendPopup, setIsShowAddFriendPopup] = useState(false);
    const signOut = useAuthStore((state) => state.signOut);
    console.log(user);

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

    return (<div className={cx("container")}>
        <div className={cx("chat-wrapper")}>
            {isShowSlideBar ? <div className={cx("block-left")}>
                <SlideBar onCloseSetting={onCloseSetting} onCloseSlideBar={onCloseSlideBar} onCloseAddFriendPopup={onCloseAddFriendPopup}/>
            </div> : <div className={cx("block-left", "no-slide-bar")}>
                <button className={cx("more-btn")} onClick={onCloseSlideBar}><ChevronRight size={18}/></button>
            </div>}
            <div className={cx("block-right")}>
                <ChatContainer isShowChatInfo={isShowChatInfo} onCloseChatInfo={onCloseChatInfo}/>
            </div>

            {isShowSetting && <div className={cx("setting-wrapper")}>
                <SettingContainer onCloseSetting={onCloseSetting} handleLogout={handleLogout}/>
            </div>}
            {isShowAddFriendPopup && <div className={cx("add-friend-wrapper")}>
                <AddFriendPopUp onCloseAddFriendPopup={onCloseAddFriendPopup}/>
            </div>}
        </div>
        <p className={cx("copyright")}>
            © 2025 Shrimple. All rights reserved.
        </p>
    </div>);
};

export default ChatPage;