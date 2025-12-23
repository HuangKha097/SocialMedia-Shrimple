import React, { useState } from 'react';
import classNames from 'classnames/bind';
import styles from '../../assets/css/SettingContainer.module.scss';
import { motion } from 'framer-motion';

// --- Import các component "trang" mới của bạn ---
import AccountSettings from './AccountSettings';
import ChatSettings from './ChatSettings';
import Notifications from './Notifications';
import BlockedUsers from './BlockedUsers';
import Application from './Application';
import AntiPeepSettings from './AntiPeepSettings';

const cx = classNames.bind(styles);

const SettingContainer = ({ onCloseSetting, handleLogout }) => {

    const [activeTab, setActiveTab] = useState('account');

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'account':
                return <AccountSettings handleLogout={handleLogout} />;
            case 'chat':
                return <ChatSettings />;
            case 'notifications':
                return <Notifications />;
            case 'blocked':
                return <BlockedUsers />;
            case 'privacy':
                return <AntiPeepSettings />;
            case 'application':
                return <Application />;
            default:
                return <AccountSettings />;
        }
    };

    const panelVariants = {
        hidden: { x: "100%", opacity: 0 },
        visible: {
            x: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 300, damping: 30 }
        },
        exit: {
            x: "100%",
            opacity: 0,
            transition: { duration: 0.2 }
        }
    };

    return (
        <motion.div
            className={cx('setting-wrapper')}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <div className={cx("header")}>
                <span>Settings</span>
                <button onClick={onCloseSetting}>&times;</button>
            </div>
            <div className={cx("body")}>

                <div className={cx("block-left")}>

                    <div
                        className={cx("menu-item", { active: activeTab === 'account' })}
                        onClick={() => setActiveTab('account')}
                    >
                        <span>Account Settings</span>
                    </div>
                    <div
                        className={cx("menu-item", { active: activeTab === 'chat' })}
                        onClick={() => setActiveTab('chat')}
                    >
                        <span>Chat Settings</span>
                    </div>
                    <div
                        className={cx("menu-item", { active: activeTab === 'notifications' })}
                        onClick={() => setActiveTab('notifications')}
                    >
                        <span>Notifications</span>
                    </div>
                    <div
                        className={cx("menu-item", { active: activeTab === 'privacy' })}
                        onClick={() => setActiveTab('privacy')}
                    >
                        <span>Privacy & Security</span>
                    </div>
                    <div
                        className={cx("menu-item", { active: activeTab === 'blocked' })}
                        onClick={() => setActiveTab('blocked')}
                    >
                        <span>Blocked Users</span>
                    </div>
                    <div
                        className={cx("menu-item", { active: activeTab === 'application' })}
                        onClick={() => setActiveTab('application')}
                    >
                        <span>Application</span>
                    </div>
                </div>


                <div className={cx("block-right")}>
                    {renderActiveTab()}
                </div>
            </div>
        </motion.div>
    );
};

export default SettingContainer;