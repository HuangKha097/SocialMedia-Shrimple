import React, { useMemo } from 'react'; // 1. Import useMemo để tối ưu
import classNames from 'classnames/bind';
import styles from '../../assets/css/ChatInfo.module.scss';
import defaultAvatar from "../../../public/favicon.png";
import { useAuthStore } from "../../stores/useAuthStore.js";

const cx = classNames.bind(styles);

const ChatInfo = ({ chat }) => {
    const { user: currentUser } = useAuthStore();

    if (!chat) return null;

    const isGroup = chat.isGroup;
    const participants = chat.participants || [];

    // --- 2. LOGIC SẮP XẾP: Đưa "Me" lên đầu ---
    const sortedParticipants = useMemo(() => {
        // Tạo bản sao để không ảnh hưởng dữ liệu gốc
        return [...participants].sort((a, b) => {
            // Nếu a là mình -> a lên trước (-1)
            if (a._id === currentUser?._id) return -1;
            // Nếu b là mình -> b lên trước (1)
            if (b._id === currentUser?._id) return 1;
            // Còn lại giữ nguyên thứ tự
            return 0;
        });
    }, [participants, currentUser]);
    // ------------------------------------------

    let displayName = "";
    let subInfo = "";

    // --- XỬ LÝ TEXT ---
    if (isGroup) {
        displayName = chat.name || chat.group?.name || "Group Chat";
        subInfo = `${participants.length} members`;
    } else {
        const partner = participants.find(p => p._id !== currentUser?._id) || participants[0];
        displayName = partner?.displayName || partner?.username || "User";
        subInfo = partner?.email || "No email";
    }

    // --- HÀM RENDER AVATAR (Logic Stack) ---
    const renderAvatar = () => {
        if (isGroup) {
            if (chat.avatarUrl || chat.group?.avatarURL) {
                return (
                    <img
                        src={chat.avatarUrl || chat.group?.avatarURL}
                        alt="Group Avatar"
                        className={cx('avatar')}
                        onError={(e) => e.target.src = defaultAvatar}
                    />
                );
            }
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

        const partner = participants.find(p => p._id !== currentUser?._id) || participants[0];
        const singleUrl = partner?.avatarUrl || defaultAvatar;

        return (
            <img
                src={singleUrl}
                alt="avatar"
                className={cx('avatar')}
                onError={(e) => e.target.src = defaultAvatar}
            />
        );
    };

    return (
        <>
            <h2 className={cx('title')}>{isGroup ? "Group Info" : "Chat Info"}</h2>

            <div className={cx('profile-section')}>
                <div className={cx('avatar-wrapper')}>
                    {renderAvatar()}
                </div>

                <div className={cx('user-details')}>
                    <span className={cx('user-name')}>{displayName}</span>
                    <div className={cx('user-status')}>
                        <span className={cx('status-text')}>{subInfo}</span>
                    </div>
                </div>
            </div>

            {/* Danh sách thành viên (Nếu là Group) */}
            {isGroup && participants.length > 0 && (
                <div className={cx('members-section')}>
                    <h3 className={cx('sub-heading')}>Members ({participants.length})</h3>
                    <div className={cx('members-list')}>
                        {/* --- 3. SỬ DỤNG sortedParticipants THAY VÌ participants --- */}
                        {sortedParticipants.map((member) => (
                            <div key={member._id} className={cx('member-item')}>
                                <img
                                    src={member.avatarUrl || defaultAvatar}
                                    className={cx('member-avatar')}
                                    alt=""
                                />
                                <span className={cx('member-name')}>
                                    {/* Logic hiển thị tên */}
                                    {member._id === currentUser?._id ? "You" : (member.displayName || member.username)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className={cx('files-section')}>
                <h3 className={cx('sub-heading')}>Shared Files</h3>
                <div className={cx('files-list')}>
                    <p className={cx('no-files-text')}>No files shared yet</p>
                </div>
            </div>
        </>
    );
};

export default ChatInfo;