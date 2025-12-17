import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames/bind';
import styles from '../../assets/css/SlideBarBody.module.scss';
import BodyFriendsChat from "./BodyFriendsChat.jsx";
import BodyGroupsChat from "./BodyGroupsChat.jsx";
import BodyRequests from "./BodyRequests.jsx";
import { useChatStore } from "../../stores/useChatStore.js";
import { useAuthStore } from "../../stores/useAuthStore.js";

const cx = classNames.bind(styles);

const SlidebarBody = () => {
    const { conversations, friendRequests, friends, fetchFriends } = useChatStore();
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState('friends'); // 'friends', 'groups', 'requests'

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

    const renderContent = () => {
        switch (activeTab) {
            case 'friends':
                return <BodyFriendsChat convo={combinedList} />;
            case 'groups':
                return <BodyGroupsChat convo={groupConversations} />;
            case 'requests':
                return <BodyRequests friendRequests={friendRequests} />;
            default:
                return <BodyFriendsChat convo={combinedList} />;
        }
    };

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
                <button 
                    className={cx("nav-item", { active: activeTab === 'friends' })} 
                    onClick={() => setActiveTab('friends')}
                >
                    {`Friends (${countFriends})`}
                </button>
                <button 
                    className={cx("nav-item", { active: activeTab === 'groups' })} 
                    onClick={() => setActiveTab('groups')}
                >
                    {`Groups (${countGroups})`}
                </button>
                <button 
                    className={cx("nav-item", { active: activeTab === 'requests' })} 
                    onClick={() => setActiveTab('requests')}
                >
                    {`Requests (${countFriendRequest})`}
                </button>
            </ul>

            <div className={cx("slidebar-body-list")}>
                {renderContent()}
            </div>
        </div>
    );
};

export default SlidebarBody;