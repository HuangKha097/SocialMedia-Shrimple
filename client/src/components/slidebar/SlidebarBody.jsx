import React, { useEffect, useMemo } from 'react';
import classNames from 'classnames/bind';
import styles from '../../assets/css/SlideBarBody.module.scss';
import { NavLink, Route, Routes } from 'react-router-dom';
import { Navigate } from "react-router";
import BodyFriendsChat from "./BodyFriendsChat.jsx";
import BodyGroupsChat from "./BodyGroupsChat.jsx";
import BodyRequests from "./BodyRequests.jsx";
import { useChatStore } from "../../stores/useChatStore.js";
import { useAuthStore } from "../../stores/useAuthStore.js";

const cx = classNames.bind(styles);

const SlidebarBody = () => {
    const { conversations, friendRequests, friends, fetchFriends } = useChatStore();
    const { user } = useAuthStore();

    useEffect(() => {
        if (fetchFriends) fetchFriends();
    }, [fetchFriends]);

    // LOGIC LỌC TRÙNG LẶP QUAN TRỌNG
    const combinedList = useMemo(() => {
        if (!user) return [];

        const processedPartnerIds = new Set();
        const uniqueConversations = [];

        // 1. Sắp xếp conversations
        const sortedConversations = [...conversations].sort((a, b) => {
            const dateA = new Date(a.lastMessageAt || a.updatedAt || 0);
            const dateB = new Date(b.lastMessageAt || b.updatedAt || 0);
            return dateB - dateA;
        });

        // 2. Lặp qua danh sách đã sắp xếp để lọc trùng
        sortedConversations.forEach(c => {
            if (c.isGroup) return; // Group xử lý riêng

            // --- FIX: Thêm kiểm tra an toàn cho participants ---
            if (!c.participants || !Array.isArray(c.participants)) {
                return; // Bỏ qua nếu participants không tồn tại hoặc không phải mảng
            }

            // Tìm người chat cùng (Partner)
            const partner = c.participants.find(p => p._id !== user._id);

            if (partner) {
                if (!processedPartnerIds.has(partner._id)) {
                    processedPartnerIds.add(partner._id);
                    uniqueConversations.push(c);
                }
            }
        });

        // 3. Gộp thêm những người bạn CHƯA từng chat
        const friendsNoChat = friends
            .filter(friend => !processedPartnerIds.has(friend._id))
            .map(friend => ({
                _id: `temp_${friend._id}`,
                isGroup: false,
                participants: [friend],
                lastMessage: null,
                unreadCounts: 0,
                updatedAt: 0
            }));

        return [...uniqueConversations, ...friendsNoChat];
    }, [conversations, friends, user]);

    // Lọc Group riêng
    const groupConversations = conversations?.filter((convo) => convo.isGroup) || [];

    const countFriends = combinedList.length;
    const countGroups = groupConversations.length;
    const countFriendRequest = friendRequests.length;

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
                <NavLink to="/friends-slide" className={(nav) => cx("nav-item", { active: nav.isActive })}>{`Friends (${countFriends})`}</NavLink>
                <NavLink to="/groups-slide" className={(nav) => cx("nav-item", { active: nav.isActive })}>{`Groups (${countGroups})`}</NavLink>
                <NavLink to="/requests-slide" className={(nav) => cx("nav-item", { active: nav.isActive })}>{`Requests (${countFriendRequest})`}</NavLink>
            </ul>

            <div className={cx("slidebar-body-list")}>
                <Routes>
                    <Route path="" element={<Navigate to="/friends-slide" replace />} />
                    <Route path="friends-slide" element={<BodyFriendsChat convo={combinedList} />} />
                    <Route path="groups-slide" element={<BodyGroupsChat convo={groupConversations} />} />
                    <Route path="requests-slide" element={<BodyRequests friendRequests={friendRequests} />} />
                </Routes>
            </div>
        </div>
    );
};

export default SlidebarBody;