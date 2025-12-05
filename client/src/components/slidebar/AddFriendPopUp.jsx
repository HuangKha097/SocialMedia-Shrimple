import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from '../../assets/css/AddFriendPopUp.module.scss';
import { Loader2, Search, UserPlus, X, Check, UserCheck } from 'lucide-react';
import default_avt from "../../../public/favicon.png";

import { userService } from "../../services/userService.js";
import { useChatStore } from "../../stores/useChatStore.js";
import { toast } from "sonner";

// --- SỬA LỖI: CHUYỂN DÒNG IMPORT NÀY RA NGOÀI ---
import { friendService } from "../../services/friendService.js";

const cx = classNames.bind(styles);

const AddFriendPopUp = ({ onCloseAddFriendPopup }) => {
    // 1. Lấy friends và action sendRequest từ Store
    const {
        friends,
        fetchFriends,
    } = useChatStore();

    const [keyword, setKeyword] = useState('');
    const [isLoadingSearch, setIsLoadingSearch] = useState(false);
    const [searchResults, setSearchResults] = useState([]);

    // State lưu trạng thái
    const [sentRequests, setSentRequests] = useState({});
    const [pendingRequests, setPendingRequests] = useState({});

    // 2. Load danh sách bạn bè khi mở popup
    useEffect(() => {
        // Kiểm tra nếu hàm tồn tại mới gọi (đề phòng chưa update store)
        if (fetchFriends) {
            fetchFriends();
        }
    }, [fetchFriends]);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!keyword.trim()) return;

        setIsLoadingSearch(true);
        setSearchResults([]);

        try {
            const data = await friendService.findUserByUsername(keyword);
            setSearchResults(data);
        } catch (error) {
            console.error(error);
            toast.error("Lỗi tìm kiếm");
        } finally {
            setIsLoadingSearch(false);
        }
    };

    const handleAddFriend = async (userId) => {
        setPendingRequests(prev => ({ ...prev, [userId]: true }));
        try {
            await friendService.sendRequest(userId);
            setSentRequests(prev => ({ ...prev, [userId]: true }));
            toast.success("Đã gửi lời mời!");
        } catch (error) {
            const msg = error.response?.data?.message || "Lỗi";
            if (msg === "You already send request") {
                setSentRequests(prev => ({ ...prev, [userId]: true }));
                toast.info("Đã gửi lời mời trước đó rồi.");
            } else {
                toast.error(msg);
            }
        } finally {
            setPendingRequests(prev => ({ ...prev, [userId]: false }));
        }
    };

    // Kiểm tra an toàn: Đảm bảo friends luôn là mảng
    const safeFriends = Array.isArray(friends) ? friends : [];

    return (
        <div className={cx('popup-container')}>
            <div className={cx('header')}>
                <h3 className={cx('title')}>Add Friend</h3>
                <button className={cx('close-btn')} onClick={onCloseAddFriendPopup}>
                    <X size={24}/>
                </button>
            </div>

            <form onSubmit={handleSearch} className={cx('search-wrapper')}>
                <input
                    type="text"
                    placeholder="Enter username..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className={cx('search-input')}
                />
                <button type="submit" className={cx('search-btn')} disabled={isLoadingSearch}>
                    {isLoadingSearch ? <Loader2 className={cx('spinner')} size={20} /> : <Search size={20}/>}
                </button>
            </form>

            <div className={cx('divider')}></div>

            <div className={cx('results-list')}>

                {/* Loading State */}
                {isLoadingSearch && (
                    <div style={{textAlign: 'center', padding: '20px', color: '#888'}}>
                        <Loader2 className={cx('spinner')} size={24} style={{margin: '0 auto 10px'}}/>
                        <p>Searching...</p>
                    </div>
                )}

                {/* Empty State */}
                {!isLoadingSearch && searchResults.length === 0 && keyword && (
                    <p style={{textAlign: 'center', padding: '20px', color: '#888'}}>No user found.</p>
                )}

                {/* List Users */}
                {!isLoadingSearch && searchResults.map((user) => {
                    // 3. LOGIC KIỂM TRA BẠN BÈ (Dùng safeFriends để không bị lỗi crash)
                    const isFriend = safeFriends.some((f) => f._id === user._id);
                    const isSent = sentRequests[user._id];
                    const isPending = pendingRequests[user._id];

                    return (
                        <div key={user._id} className={cx('user-item')}>
                            <div className={cx('user-info')}>
                                <img src={user.avatarUrl || default_avt} alt="avatar" className={cx('avatar')} />
                                <div className={cx('details')}>
                                    <p className={cx('name')}>{user.displayName || user.username}</p>
                                    <p className={cx('email')}>{user.email}</p>
                                </div>
                            </div>

                            <button
                                className={cx('add-btn', {
                                    sent: isSent,
                                    friend: isFriend
                                })}
                                onClick={() => handleAddFriend(user._id)}
                                disabled={isSent || isFriend || isPending}
                            >
                                {isPending ? (
                                    <Loader2 className={cx('spinner')} size={18} />
                                ) : isFriend ? (
                                    <>
                                        <UserCheck size={18} />
                                        <span>Friend</span>
                                    </>
                                ) : isSent ? (
                                    <>
                                        <Check size={18} />
                                        <span>Sent</span>
                                    </>
                                ) : (
                                    <>
                                        <UserPlus size={18}/>
                                        <span>Add</span>
                                    </>
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AddFriendPopUp;