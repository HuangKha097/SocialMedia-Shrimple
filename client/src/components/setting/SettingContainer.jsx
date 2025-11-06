import React, {useState} from 'react'; // <--- Thêm useState
import classNames from 'classnames/bind';
import styles from '../../assets/css/SettingContainer.module.scss';

// --- Import các component "trang" mới của bạn ---
import AccountSettings from './AccountSettings';
import ChatSettings from './ChatSettings';
// import Notifications from './Notifications';
// import BlockedUsers from './BlockedUsers';
// import Application from './Application';

const cx = classNames.bind(styles);

const SettingContainer = ({onCloseSetting, handleLogout}) => {
    // --- State để theo dõi tab đang active ---
    // 'account' là giá trị mặc định
    const [activeTab, setActiveTab] = useState('account');

    // --- Hàm để render nội dung tab ---
    const renderActiveTab = () => {
        switch (activeTab) {
            case 'account':
                return <AccountSettings handleLogout={handleLogout}/>;
            case 'chat':
                return <ChatSettings/>;
            // case 'notifications':
            //     return <Notifications />;
            // case 'blocked':
            //     return <BlockedUsers />;
            // case 'application':
            //     return <Application />;
            default:
                return <AccountSettings/>;
        }
    };

    return (
        <div className={cx('setting-wrapper')}>
            <div className={cx("header")}>
                <span>Settings</span>
                <button onClick={onCloseSetting}>&times;</button>
            </div>
            <div className={cx("body")}>

                <div className={cx("block-left")}>
                    {/* Thêm onClick để đổi state
                        Thêm class 'active' tự động dựa trên state
                    */}
                    <div
                        className={cx("menu-item", {active: activeTab === 'account'})}
                        onClick={() => setActiveTab('account')}
                    >
                        <span>Account Settings</span>
                    </div>
                    <div
                        className={cx("menu-item", {active: activeTab === 'chat'})}
                        onClick={() => setActiveTab('chat')}
                    >
                        <span>Chat Settings</span>
                    </div>
                    <div
                        className={cx("menu-item", {active: activeTab === 'notifications'})}
                        onClick={() => setActiveTab('notifications')}
                    >
                        <span>Notifications</span>
                    </div>
                    <div
                        className={cx("menu-item", {active: activeTab === 'blocked'})}
                        onClick={() => setActiveTab('blocked')}
                    >
                        <span>Blocked Users</span>
                    </div>
                    <div
                        className={cx("menu-item", {active: activeTab === 'application'})}
                        onClick={() => setActiveTab('application')}
                    >
                        <span>Application</span>
                    </div>
                </div>


                <div className={cx("block-right")}>
                    {renderActiveTab()}
                </div>
            </div>
        </div>
    );
};

export default SettingContainer;