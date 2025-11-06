import React from 'react';
import classNames from 'classnames/bind';
import styles from '../../assets/css/ChatInfo.module.scss';
import profile_pic_test from "../../../public/favicon.png"

const cx = classNames.bind(styles);

const ChatInfo = () => {
    return (

        <>
            <h2 className={cx('title')}>Chat Info</h2>

            {/* Thông tin User */}
            <div className={cx('profile-section')}>
                <img
                    src={ profile_pic_test}
                    alt="avatar"
                    className={cx('avatar')}
                />
                <div className={cx('user-details')}>
                    <span className={cx('user-name')}>Sarah Chen</span>
                    <div className={cx('user-status')}>
                        <span className={cx('online-dot')}></span>
                        <span className={cx('status-text')}>online</span>
                    </div>
                </div>
            </div>


            <div className={cx('media-section')}>
                <h3 className={cx('sub-heading')}>Shared Media</h3>
                <div className={cx('media-grid')}>
                    <div className={cx('media-item')}></div>
                    <div className={cx('media-item')}></div>
                    <div className={cx('media-item')}></div>
                </div>
            </div>

            {/* Shared Files */}
            <div className={cx('files-section')}>
                <h3 className={cx('sub-heading')}>Shared Files</h3>
                <div className={cx('files-list')}>
                    <p className={cx('no-files-text')}>No files shared yet</p>
                </div>
            </div>
        </>
    );
};

export default ChatInfo;