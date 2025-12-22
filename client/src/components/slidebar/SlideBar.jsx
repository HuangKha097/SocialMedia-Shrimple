import React, { useState } from 'react';
import classNames from 'classnames/bind';
import styles from '../../assets/css/SlideBar.module.scss';
import default_avt from "../../../public/favicon.png";
import SlidebarBody from './SlidebarBody.jsx';
import { ChevronLeft, UserPlus, Users, Newspaper, MessageSquare, Video, Menu } from 'lucide-react';
import { useAuthStore } from "../../stores/useAuthStore.js";
import { useNavigate, useLocation } from 'react-router-dom';

const cx = classNames.bind(styles);
const SlideBar = ({ onCloseSetting, onCloseSlideBar, onCloseAddFriendPopup, onCloseCreateGroupPopup }) => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    return (<div className={cx('slide-bar-wrapper')}>
        <div className={cx("header")}>

            <div className={cx('logo')}>
                <h1 className={cx("logo-text")} onClick={() => navigate('/feed')} style={{ cursor: 'pointer' }}>Shrimple</h1>
                <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                    <div className={cx("menu-wrapper")}>
                        <button className={cx("more-btn")}>
                            <Menu size={18} />
                        </button>
                        <div className={cx("menu-dropdown")}>
                            <button
                                className={cx("more-btn", { active: location.pathname.startsWith('/chat') })}
                                onClick={() => navigate('/chat')}
                                title="Chats"
                            >
                                <MessageSquare size={18} />
                            </button>
                            <button
                                className={cx("more-btn", { active: location.pathname.startsWith('/feed') })}
                                onClick={() => navigate('/feed')}
                                title="News Feed"
                            >
                                <Newspaper size={18} />
                            </button>
                            <button
                                className={cx("more-btn", { active: location.pathname.startsWith('/video') })}
                                onClick={() => navigate('/video')}
                                title="Video Feed"
                            >
                                <Video size={18} />
                            </button>
                        </div>
                    </div>

                    <button className={cx("more-btn", "collapse-sidebar-btn")} onClick={onCloseSlideBar}><ChevronLeft size={18} /></button>
                </div>
            </div>
            <div className={cx('profile')}>
                <div className={cx('profile')}>
                    <img
                        src={user?.avatarURL ? (user.avatarURL.startsWith('http') ? user.avatarURL : `http://localhost:5001${user.avatarURL}`) : default_avt}
                        alt="profile-pic"
                        className={cx('profile-pic')}
                        onError={(e) => { e.target.src = default_avt }}
                    />
                    <div className={cx("info-wrapper")}>
                        <p className={cx('full-name')}>{user?.displayName}</p>
                        <p className={cx("username")}>{`@${user?.username}`}</p>
                    </div>
                </div>
                <button className={cx("add-friend-btn")} onClick={onCloseAddFriendPopup} ><UserPlus size={18} /></button>
                <button className={cx("add-friend-btn")} onClick={onCloseCreateGroupPopup} ><Users size={18} /></button>
            </div>
        </div>


        <div className={cx("body")}>
            <SlidebarBody />
        </div>

        <div className={cx("footer")}>
            <button className={cx("settings-btn")} onClick={onCloseSetting}>Settings</button>

        </div>
    </div>);
};

export default SlideBar;