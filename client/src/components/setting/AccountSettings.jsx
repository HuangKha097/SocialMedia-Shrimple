import React from 'react';
import classNames from 'classnames/bind';
// Import file CSS của component cha để dùng chung class
import styles from '../../assets/css/SettingContainer.module.scss';

const cx = classNames.bind(styles);

const AccountSettings = ({handleLogout}) => {
    return (
        <> {/* Dùng React Fragment bọc ngoài */}
            <h3>Account Settings</h3>

            <div className={cx('section')}>
                <h4>Profile Information</h4>
                <div className={cx('form-group')}>
                    <label htmlFor="displayName">Display Name</label>
                    <input type="text" id="displayName" defaultValue="Huang Kha"/>
                </div>
                <div className={cx('form-group')}>
                    <label htmlFor="bio">Bio</label>
                    <textarea id="bio" placeholder="Hello World..."></textarea>
                </div>
            </div>

            <div className={cx('section')}>
                <h4>Security</h4>
                <div className={cx('form-group')}>
                    <label htmlFor="password">New Password</label>
                    <input type="password" id="password" placeholder="••••••••"/>
                </div>
                <div className={cx('form-group')}>
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input type="password" id="confirmPassword" placeholder="••••••••"/>
                </div>
            </div>

            <div className={cx('section')}>
                <h4>Privacy</h4>
                <div className={cx('form-group')}>
                    <label htmlFor="whoCanMessage">Who can message you</label>
                    <select id="whoCanMessage" defaultValue="Everyone">
                        <option value="Everyone">Everyone</option>
                        <option value="Friends">Friends</option>
                        <option value="Nobody">Nobody</option>
                    </select>
                </div>
            </div>
            <button className={cx("sign-out-btn")} onClick={handleLogout}>Sign out</button>
        </>
    );
};

export default AccountSettings;