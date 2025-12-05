import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from '../../assets/css/BodyChatList.module.scss';

import FriendRequestCard from "../../components/chat/FriendRequestCard.jsx";
import { useChatStore } from "../../stores/useChatStore.js";
import { toast } from "sonner";
import { UserX } from 'lucide-react';

const cx = classNames.bind(styles);

const BodyRequests = () => {
    // 1. Lấy state và action MỚI từ Store
    const {
        friendRequests,
        fetchFriendRequests,
        isFriendRequestsLoading,
        acceptRequestAction,   // Action tích hợp (API + Store update)
        declineRequestAction   // Action tích hợp (API + Store update)
    } = useChatStore();

    // State lưu ID của request đang xử lý để hiện loading spinner
    const [processingId, setProcessingId] = useState(null);

    // 2. Load dữ liệu khi vào trang
    useEffect(() => {
        fetchFriendRequests();
    }, [fetchFriendRequests]);

    // 3. Xử lý Chấp nhận (Gọi Action của Store)
    const handleAccept = async (requestId) => {
        setProcessingId(requestId);
        try {
            await acceptRequestAction(requestId);
            toast.success("Đã chấp nhận lời mời!");
            // Không cần gọi removeFriendRequest thủ công nữa, Store tự làm
        } catch (error) {
            console.error(error);
            toast.error("Lỗi khi chấp nhận kết bạn");
        } finally {
            setProcessingId(null);
        }
    };

    // 4. Xử lý Từ chối (Gọi Action của Store)
    const handleDecline = async (requestId) => {
        setProcessingId(requestId);
        try {
            await declineRequestAction(requestId);
            toast.success("Đã từ chối lời mời.");
        } catch (error) {
            console.error(error);
            toast.error("Lỗi khi từ chối");
        } finally {
            setProcessingId(null);
        }
    };

    // 5. Biến an toàn: Đảm bảo luôn là mảng trước khi map
    const safeRequests = Array.isArray(friendRequests) ? friendRequests : [];

    return (
        <div className={cx('body-requests-container')}>

            <div className={cx('list-container')}>
                {/* Case 1: Đang tải lần đầu */}
                {isFriendRequestsLoading && (
                    <p className={cx('loading-text')}>Đang tải danh sách...</p>
                )}

                {/* Case 2: Danh sách trống */}
                {!isFriendRequestsLoading && safeRequests.length === 0 && (
                    <div className={cx('empty-state')}>
                        <p style={{color:"white"}}>No friend request yet!</p>
                    </div>
                )}

                {/* Case 3: Có dữ liệu -> Render List */}
                {!isFriendRequestsLoading && safeRequests.map((req) => (
                    <FriendRequestCard
                        key={req._id}
                        request={req}
                        onAccept={handleAccept}
                        onDecline={handleDecline}
                        isProcessing={processingId === req._id}
                    />
                ))}
            </div>
        </div>
    );
};

export default BodyRequests;