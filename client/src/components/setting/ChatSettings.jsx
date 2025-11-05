import React from 'react';
import classNames from 'classnames/bind';
import styles from '../../assets/css/SettingContainer.module.scss';

const cx = classNames.bind(styles);

const ChatSettings = () => {
    return (
        <>
            <h3>Chat Settings</h3>

            {/* Thêm nội dung cài đặt chat của bạn ở đây */}
            <div className={cx('section')}>
                <h4>Theme</h4>
                <div className={cx('form-group')}>
                    <label>Chat Theme</label>
                    <p> theme...</p>
                </div>
            </div>
        </>
    );
};

export default ChatSettings;