import React, {useState} from 'react';
import classNames from 'classnames/bind';
import styles from '../assets/css/ChatPage.module.scss';

import SlideBar from "../components/slidebar/SlideBar.jsx";
import ChatContainer from "../components/chat/ChatContainer.jsx";
import {useAuthStore} from "../stores/useAuthStore.js";
import {toast} from "sonner";
import api from "../lib/axios.js"
import SettingContainer from "../components/setting/SettingContainer.jsx";


const cx = classNames.bind(styles);
const ChatPage = () => {
    const user = useAuthStore((s) => s.user);
    const [isShowSetting, setIsShowSetting] = useState(false);
    const signOut = useAuthStore((state) => state.signOut);
    console.log(user);
    // const hadleOnClick = async () => {
    //     try {
    //         await api.get("/api/users/test", {withCredentials: true});
    //         toast.success("User test successful!");
    //     } catch (err) {
    //         toast.error(err.message);
    //         console.log(err)
    //     }
    // }
    const handleLogout = async () => {
        try {
            await signOut()
        } catch (err) {
            toast.error(err.message);
            console.log(err)
        }
    }
    const onClose = () =>{
        setIsShowSetting((prev) => !prev);
    }
    return (
        <div className={cx("container")}>
            <div className={cx("chat-wrapper")}>
                <div className={cx("block-left")}>
                    <SlideBar onClose={onClose} />
                </div>
                <div className={cx("block-right")}>
                    <ChatContainer/>
                </div>

                {isShowSetting && <div className={cx("setting-wrapper")}>
                    <SettingContainer onClose={onClose} handleLogout={handleLogout}/>
                </div>}
            </div>
        </div>
    );
};

export default ChatPage;