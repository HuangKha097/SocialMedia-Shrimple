import React from 'react';
import classNames from 'classnames/bind';
import styles from '../../assets/css/ChatHeader.module.scss';
import defaultAvatar from "../../../public/favicon.png";
import { Info, Phone, Video } from 'lucide-react';
import { useAuthStore } from "../../stores/useAuthStore.js";

const cx = classNames.bind(styles);

const ChatHeader = ({ onCloseChatInfo, chat }) => {
    const { user: currentUser } = useAuthStore();

    if (!chat) return null;

    const isGroup = chat.isGroup;
    let displayName = "Unknown";
    let statusText = "Offline";

    // --- 1. XỬ LÝ DỮ LIỆU ---
    const participants = chat.participants || [];
    const groupInfo = chat.group;

    if (isGroup) {
        // Group: Tên nhóm
        displayName = chat.name || groupInfo?.name || "Unnamed Group";
        statusText = `${participants.length} members`;
    } else {
        // 1-1: Tìm người chat cùng
        const partner = participants.find(p => p._id !== currentUser?._id) || participants[0];
        if (partner) {
            displayName = partner.displayName || partner.username || "User";
            statusText = "Online";
        }
    }

    // --- 2. HÀM RENDER AVATAR (Giống GroupChatCard) ---
    const renderAvatar = () => {
        // A. Nếu là Group
        if (isGroup) {
            // A1. Có ảnh đại diện nhóm -> Hiện 1 ảnh
            if (chat.avatarUrl || groupInfo?.avatarURL) {
                return (
                    <img
                        src={chat.avatarUrl || groupInfo?.avatarURL}
                        alt="Group Avatar"
                        className={cx("profile-pic", "single-avatar")}
                        onError={(e) => { e.target.src = defaultAvatar }}
                    />
                );
            }
            // A2. Không có ảnh nhóm -> Stack avatar thành viên
            if (participants.length > 0) {
                return (
                    <div className={cx('group-avatar-stack')}>
                        <img
                            src={participants[0]?.avatarUrl || defaultAvatar}
                            alt="mem1"
                            className={cx('stack-avatar', 'first')}
                        />
                        {participants.length > 1 && (
                            <img
                                src={participants[1]?.avatarUrl || defaultAvatar}
                                alt="mem2"
                                className={cx('stack-avatar', 'second')}
                            />
                        )}
                    </div>
                );
            }
        }

        // B. Nếu là 1-1 (Hoặc Group không có thành viên/ảnh) -> Hiện logic cũ
        let singleAvatarUrl = defaultAvatar;
        if (!isGroup) {
            const partner = participants.find(p => p._id !== currentUser?._id) || participants[0];
            singleAvatarUrl = partner?.avatarUrl || defaultAvatar;
        }

        return (
            <img
                src={singleAvatarUrl}
                alt="avatar"
                className={cx("profile-pic")}
                onError={(e) => { e.target.src = defaultAvatar }}
            />
        );
    };

    return (
        <div className={cx('header-wrapper')}>
            <div className={cx('user-info')}>
                {/* --- 3. GỌI HÀM RENDER --- */}
                <div className={cx('avatar-container')}>
                    {renderAvatar()}
                </div>

                <div className={cx("info")}>
                    <p className={cx('user-name')}>{displayName}</p>
                    <span className={cx('user-status')}>
                        {!isGroup && <span className={cx('online-dot')}></span>}
                        {statusText}
                    </span>
                </div>
            </div>

            <div className={cx('action-buttons')}>
                <button className={cx('btn')}><Phone size={16} /></button>
                <button className={cx('btn')}><Video size={16} /></button>
                <button className={cx('btn')} onClick={onCloseChatInfo}><Info size={16} /></button>
            </div>
        </div>
    );
};

export default ChatHeader;