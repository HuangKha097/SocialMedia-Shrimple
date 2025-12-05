import React, { useEffect } from 'react'; // Nhớ import useEffect
import classNames from 'classnames/bind';
import styles from '../../assets/css/SlideBarBody.module.scss';
import { NavLink, Route, Routes } from 'react-router-dom';
import { Navigate } from "react-router";
import BodyFriendsChat from "./BodyFriendsChat.jsx";
import BodyGroupsChat from "./BodyGroupsChat.jsx";
import BodyRequests from "./BodyRequests.jsx";
import { useChatStore } from "../../stores/useChatStore.js";

const cx = classNames.bind(styles);

const SlidebarBody = () => {
    // 1. Lấy thêm fetchFriends
    const { conversations, friendRequests, friends, fetchFriends } = useChatStore();

    // 2. Thêm useEffect: Luôn gọi API lấy bạn bè khi component này được render
    useEffect(() => {
        fetchFriends();
    }, [fetchFriends]);

    // 3. LOGIC GỘP THÔNG MINH (Tránh trùng lặp giữa Friend và Conversation)
    // Mục tiêu: Hiển thị tất cả bạn bè.
    // - Nếu đã từng chat: Dùng object conversation (để hiện tin nhắn cuối).
    // - Nếu chưa chat: Dùng object friend (để hiện tên, avatar).

    const combinedList = React.useMemo(() => {
        // A. Lấy danh sách ID của những người đã có trong cuộc trò chuyện (cá nhân)
        const conversationPartnerIds = new Set();
        const directConvos = conversations.filter(c => !c.isGroup).map(c => {
            // Giả sử participants[1] là người kia, hoặc logic tìm partner của bạn
            // Lưu lại ID để tí nữa so sánh
            c.participants.forEach(p => conversationPartnerIds.add(p._id));
            return c;
        });

        // B. Lọc ra những người bạn CHƯA có cuộc trò chuyện nào
        const friendsNoChat = friends.filter(friend => !conversationPartnerIds.has(friend._id)).map(friend => ({
            _id: `temp_${friend._id}`, // ID tạm
            isGroup: false,
            participants: [friend], // Giả lập cấu trúc participants
            lastMessage: null,
            unreadCounts: {}
        }));

        // C. Gộp lại: Conversation thật + Friend chưa chat
        return [...directConvos, ...friendsNoChat];
    }, [conversations, friends]);

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
                    {/* Truyền combinedList vào đây */}
                    <Route path="friends-slide" element={<BodyFriendsChat convo={combinedList} />} />
                    <Route path="groups-slide" element={<BodyGroupsChat convo={groupConversations} />} />
                    <Route path="requests-slide" element={<BodyRequests friendRequests={friendRequests} />} />
                </Routes>
            </div>
        </div>
    );
};

export default SlidebarBody;