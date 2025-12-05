import React, {useState} from 'react';
import classNames from 'classnames/bind';
import styles from '../../assets/css/SlideBar.module.scss';
import default_avt from "../../../public/favicon.png";
import SlidebarBody from './SlidebarBody.jsx';
import {ChevronLeft,UserPlus} from 'lucide-react';
import {useAuthStore} from "../../stores/useAuthStore.js";

const cx = classNames.bind(styles);
const SlideBar = ({onCloseSetting, onCloseSlideBar,onCloseAddFriendPopup}) => {
    const {user} = useAuthStore()
    console.log(user)
    return (<div className={cx('slide-bar-wrapper')}>
        <div className={cx("header")}>

            <div className={cx('logo')}>
                <h1 className={cx("logo-text")}>Shrimple</h1>
                <button className={cx("more-btn")} onClick={onCloseSlideBar}><ChevronLeft size={18}/></button>
            </div>
            <div className={cx('profile')}>
                <div className={cx('profile')}>
                    <img src={user?.avatarURL || default_avt} alt="profile-pic" className={cx('profile-pic')}/>
                    <div className={cx("info-wrapper")}>
                        <p className={cx('full-name')}>{user?.displayName}</p>
                        <p className={cx("username")}>{`@${user?.username}`}</p>
                    </div>
                </div>
                <button className={cx("add-friend-btn")} onClick={onCloseAddFriendPopup} ><UserPlus size={18}/></button>
            </div>
        </div>


        <div className={cx("body")}>
            <SlidebarBody/>
        </div>

        <div className={cx("footer")}>
            <button className={cx("settings-btn")} onClick={onCloseSetting}>Settings</button>

        </div>
    </div>);
};

export default SlideBar;