import React from 'react';
import classNames from 'classnames/bind';
import styles from '../assets/css/SlideBar.module.scss';
import profilePic_test from "../../public/favicon.png";
import SlidebarBody from './SlidebarBody.jsx';
import {Menu} from 'lucide-react';

const cx = classNames.bind(styles);
const SlideBar = () => {
    return (<div className={cx('slide-bar-wrapper')}>
        <div className={cx("header")}>

            <div className={cx('logo')}>
                <h1 className={cx("logo-text")}>Shrimple</h1>
                <button className={cx("menu-btn")}><Menu size={16}/></button>
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
            <button className={cx("settings-btn")}>Settings</button>

        </div>
    </div>);
};

export default SlideBar;