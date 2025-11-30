import React from 'react';
import classNames from 'classnames/bind';
import styles from '../../assets/css/SlideBarBody.module.scss';
import {NavLink, Route, Routes} from 'react-router-dom';
import {Navigate} from "react-router";
import BodyFriendsChat from "./BodyFriendsChat.jsx";
import BodyGroupsChat from "./BodyGroupsChat.jsx";
import BodyRequests from "./BodyRequests.jsx";
import {useChatStore} from "../../stores/useChatStore.js";


const cx = classNames.bind(styles);
const SlidebarBody = () => {
    const {conversations} = useChatStore();

    const directConversations = conversations?.filter((convo) => !convo.isGroup) || [];
    const groupConversations = conversations?.filter((convo) => convo.isGroup) || [];

    const countFriends = directConversations.length;
    const countGroups = groupConversations.length;

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

                <NavLink to="/friends-slide" className={(nav) => cx( "nav-item",{ active: nav.isActive })}>{`Friends (${countFriends})`}</NavLink>
                <NavLink to="/groups-slide" className={(nav) => cx( "nav-item",{ active: nav.isActive })}>{`Groups (${countGroups})`}</NavLink>
                <NavLink to="/requests-slide" className={(nav) => cx( "nav-item",{ active: nav.isActive })}>Requests</NavLink>
            </ul>

            <div className={cx("slidebar-body-list")}>
                <Routes>
                    <Route path="" element={<Navigate to="/friends-slide" replace />} />

                    <Route path="friends-slide" element={<BodyFriendsChat directConversations={directConversations}/>}/>
                    <Route path="groups-slide" element={<BodyGroupsChat groupConversations={groupConversations}/>}/>
                    <Route path="requests-slide" element={<BodyRequests/>}/>
                </Routes>
            </div>
        </div>
    );
};

export default SlidebarBody;