import React from 'react';
import classNames from 'classnames/bind';
import styles from '../../assets/css/ChatHeader.module.scss';
import profilePic_test from "../../../public/favicon.png";
import {Info, Phone, Video} from 'lucide-react';

const cx = classNames.bind(styles);
const ChatHeader = () => {
    return (
        <div className={cx('header-wrapper')}>
            <div className={cx('user-info')}>
                <img src={profilePic_test} alt="profile-pic" className={cx("profile-pic")}/>
                <div className={cx("info")}>
                    <p className={cx('user-name')}>Sarah Chen</p>
                    <span className={cx('user-status')}>
                    <span className={cx('online-dot')}></span>
                    Online
                </span>
                </div>
            </div>
            <div className={cx('action-buttons')}>
                <button className={cx('btn')}>
                    <Phone size={16}/>
                </button>
                <button className={cx('btn')}>
                    <Video size={16}/>
                </button>
                <button className={cx('btn')}>
                    <Info size={16}/>
                </button>
            </div>
        </div>
    );
};

export default ChatHeader;