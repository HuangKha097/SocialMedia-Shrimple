import React from 'react';
import classNames from 'classnames/bind';
import styles from '../../assets/css/SlideBarBody.module.scss';
import ChatCard from "../chat/ChatCard.jsx";


const cx = classNames.bind(styles);
const SlidebarBody = () => {
    return (
        <div className={cx("slidebar-body-wrapper")}>
            <div className={cx("search-box")}>


                <input
                    type="text"
                    placeholder="Search friends, groups..."
                    className={cx("search-input")}
                />
            </div>
            <ul className={cx("slidebar-body-navigation")}>

                <li className={cx("active")}>Friends (5)</li>
                <li>Requests</li>
                <li>Groups (4)</li>
            </ul>

            <div className={cx("slidebar-body-list")}>
                <ChatCard/>
                <ChatCard/>
                <ChatCard/>
                <ChatCard/>
                <ChatCard/>
                <ChatCard/>
                <ChatCard/>
                <ChatCard/>
            </div>
        </div>
    );
};

export default SlidebarBody;