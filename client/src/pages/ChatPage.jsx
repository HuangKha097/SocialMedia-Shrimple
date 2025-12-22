import React, { useState } from 'react';
import classNames from 'classnames/bind';
import styles from '../assets/css/ChatPage.module.scss';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import SlideBar from "../components/slidebar/SlideBar.jsx";
import { useAuthStore } from "../stores/useAuthStore.js";
import { useChatStore } from "../stores/useChatStore.js";
import { toast } from "sonner";
import SettingContainer from "../components/setting/SettingContainer.jsx";
import { ChevronRight } from 'lucide-react';
import AddFriendPopUp from "../components/slidebar/AddFriendPopUp.jsx";
import CreateGroupPopUp from "../components/slidebar/CreateGroupPopUp.jsx";
import PostsSidebar from "../components/posts/PostsSidebar.jsx";
import GlobalLoadingOverlay from "../components/common/GlobalLoadingOverlay.jsx";

const cx = classNames.bind(styles);

const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.2 }
};

const sidebarVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.2 }
};

const ChatPage = () => {
    const user = useAuthStore((s) => s.user);
    const { activeConversationId } = useChatStore();
    const [isShowSetting, setIsShowSetting] = useState(false);
    const [isShowSlideBar, setIsShowSlideBar] = useState(true);
    const [isShowChatInfo, setIisShowChatInfo] = useState(false);
    const [isShowAddFriendPopup, setIsShowAddFriendPopup] = useState(false);
    const [isShowCreateGroupPopup, setIsShowCreateGroupPopup] = useState(false);
    const signOut = useAuthStore((state) => state.signOut);
    const location = useLocation();

    // Determine view mode from URL
    const isFeedView = location.pathname.startsWith('/feed') || location.pathname.startsWith('/video');
    // const isChatView = location.pathname.startsWith('/chat');

    // FORCE SIDEBAR OPEN ON MOBILE/BACK NAVIGATION
    // If we are not in an active chat, we must ensure sidebar is open so users aren't stuck on a blank screen (if they collapsed it)
    React.useEffect(() => {
        if (!activeConversationId) {
            setIsShowSlideBar(true);
        }
    }, [activeConversationId]);

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
        onCloseChatInfo,
        toggleSidebar: onCloseSlideBar,
        isSidebarOpen: isShowSlideBar
    };

    return (<div className={cx("container")}>
        <div className={cx("chat-wrapper", {
            "has-active-chat": activeConversationId && !isFeedView,
            "feed-view": isFeedView,
            "sidebar-open": isShowSlideBar
        })}>
            {isShowSlideBar ? <div className={cx("block-left")}>
                <AnimatePresence mode="wait">
                    {isFeedView ? (
                        <motion.div
                            key="posts-sidebar"
                            variants={sidebarVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            style={{ height: '100%', width: '100%' }}
                        >
                            <PostsSidebar
                                onCloseSetting={onCloseSetting}
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="chat-sidebar"
                            variants={sidebarVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            style={{ height: '100%', width: '100%' }}
                        >
                            <SlideBar
                                onCloseSetting={onCloseSetting}
                                onCloseSlideBar={onCloseSlideBar}
                                onCloseAddFriendPopup={onCloseAddFriendPopup}
                                onCloseCreateGroupPopup={onCloseCreateGroupPopup}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div> : <div className={cx("block-left", "no-slide-bar")}>
                <button className={cx("more-btn")} onClick={onCloseSlideBar}><ChevronRight size={18} /></button>
            </div>}
            {/* On mobile feed view, create a backdrop to close sidebar */}
            {isFeedView && isShowSlideBar && (
                <div className={cx("mobile-backdrop")} onClick={onCloseSlideBar}></div>
            )}

            <div className={cx("block-right")}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname.split('/')[1]} // 'chat' or 'feed'
                        variants={pageVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        style={{ height: '100%', width: '100%' }}
                    >
                        <Outlet context={outletContext} />
                    </motion.div>
                </AnimatePresence>
            </div>

            <GlobalLoadingOverlay />

            <AnimatePresence>
                {isShowSetting && (
                    <motion.div
                        className={cx("setting-wrapper")}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={(e) => e.target === e.currentTarget && onCloseSetting()}
                    >
                        <SettingContainer onCloseSetting={onCloseSetting} handleLogout={handleLogout} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        <AnimatePresence>
            {isShowAddFriendPopup && (
                <motion.div
                    className={cx("add-friend-wrapper")}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={(e) => e.target === e.currentTarget && onCloseAddFriendPopup()}
                >
                    <AddFriendPopUp onCloseAddFriendPopup={onCloseAddFriendPopup} />
                </motion.div>
            )}
        </AnimatePresence>

        <AnimatePresence>
            {isShowCreateGroupPopup && (
                <motion.div
                    className={cx("add-friend-wrapper")}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={(e) => e.target === e.currentTarget && onCloseCreateGroupPopup()}
                >
                    <CreateGroupPopUp onCloseCreateGroupPopup={onCloseCreateGroupPopup} />
                </motion.div>
            )}
        </AnimatePresence>
        <p className={cx("copyright")}>
            © 2025 Shrimple. All rights reserved.
        </p>
    </div>);
};

export default ChatPage;