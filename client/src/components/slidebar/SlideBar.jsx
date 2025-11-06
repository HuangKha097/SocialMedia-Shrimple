import React from 'react';
import classNames from 'classnames/bind';
import styles from '../../assets/css/SlideBar.module.scss';
import profilePic_test from "../../../public/z7082013609437_01be1980d4294a3a3015105eb317c9b8.jpg";
import SlidebarBody from './SlidebarBody.jsx';
import {
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

const cx = classNames.bind(styles);
const SlideBar = ({onCloseSetting,onCloseSlideBar}) => {
    return (<div className={cx('slide-bar-wrapper')}>
        <div className={cx("header")}>

            <div className={cx('logo')}>
                <h1 className={cx("logo-text")}>Shrimple</h1>
                <button className={cx("more-btn")} onClick={onCloseSlideBar}><ChevronLeft size={18}/></button>
            </div>
            <div className={cx('profile')}>
                <img src={profilePic_test} alt="profile-pic" className={cx('profile-pic')}/>
                <div className={cx("info-wrapper")}>
                    <p className={cx('full-name')}>Huang Kha</p>
                    <p className={cx("username")}>@huangkha097</p>
                </div>
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