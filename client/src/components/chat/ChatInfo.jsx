import React, { useMemo, useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from '../../assets/css/ChatInfo.module.scss';
import defaultAvatar from "../../../public/favicon.png";
import { useAuthStore } from "../../stores/useAuthStore.js";
import { chatService } from "../../services/chatService";
import { userSettingsService } from "../../services/userSettingsService";
import { FileText, Ban, X } from "lucide-react";

import { useChatStore } from "../../stores/useChatStore.js"; // Import useChatStore

const cx = classNames.bind(styles);

const ChatInfo = ({ chat, onClose }) => {
    const { user: currentUser } = useAuthStore();
    const { friends } = useChatStore(); // Get friends list
    const [media, setMedia] = useState({ images: [], files: [] });
    const [loadingMedia, setLoadingMedia] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false); // Local check not accurate without checking blocked list, but purely for prompt feedback
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        if (chat?._id) {
            setLoadingMedia(true);
            chatService.getSharedMedia(chat._id)
                .then(data => setMedia(data))
                .catch(err => console.error("Failed to fetch media", err))
                .finally(() => setLoadingMedia(false));

            // Note: Keep blocked status in sync is harder without a store for blocked users or passing it in.
            // For now, assume unblocked unless we block.
        }
    }, [chat?._id]);

    if (!chat) return null;

    const isGroup = chat.isGroup;
    const participants = chat.participants || [];

    // --- 2. LOGIC SẮP XẾP: Đưa "Me" lên đầu ---
    const sortedParticipants = useMemo(() => {
        return [...participants].sort((a, b) => {
            if (a._id === currentUser?._id) return -1;
            if (b._id === currentUser?._id) return 1;
            return 0;
        });
    }, [participants, currentUser]);

    let displayName = "";
    let subInfo = "";
    let partnerId = null;

    // Resolve Partner (for 1-1)
    let partner = !isGroup ? (participants.find(p => p._id !== currentUser?._id) || participants[0]) : null;

    // START FIX: Try to find in friends list to fill missing data (email, avatar)
    if (partner && friends.length > 0) {
        const friend = friends.find(f => f._id === partner._id || f._id === partner._id?.toString());
        if (friend) {
            partner = { ...partner, ...friend };
        }
    }
    // END FIX

    if (isGroup) {
        displayName = chat.name || chat.group?.name || "Group Chat";
        subInfo = `${participants.length} members`;
    } else {
        displayName = partner?.displayName || partner?.username || "User";
        subInfo = partner?.email || "No email";
        partnerId = partner?._id;
    }

    const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "https://shrimple.onrender.com";

    const renderAvatar = () => {
        const getAvatarSrc = (url) => {
            if (!url) return defaultAvatar;
            if (url.startsWith('http') || url.startsWith('data:')) return url;
            return `${BASE_URL}${url}`;
        };

        if (isGroup) {
            if (chat.avatarURL || chat.group?.avatarURL) {
                return (
                    <img
                        src={getAvatarSrc(chat.avatarURL || chat.group?.avatarURL)}
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
                            src={getAvatarSrc(participants[0]?.avatarURL)}
                            alt="mem1"
                            className={cx('stack-avatar', 'first')}
                            onError={(e) => e.target.src = defaultAvatar}
                        />
                        {participants.length > 1 && (
                            <img
                                src={getAvatarSrc(participants[1]?.avatarURL)}
                                alt="mem2"
                                className={cx('stack-avatar', 'second')}
                                onError={(e) => e.target.src = defaultAvatar}
                            />
                        )}
                    </div>
                );
            }
        }

        // Use resolved partner
        const singleUrl = partner?.avatarURL;

        return (
            <img
                src={getAvatarSrc(singleUrl)}
                alt="avatar"
                className={cx('avatar')}
                onError={(e) => e.target.src = defaultAvatar}
            />
        );
    };

    const handleBlockUser = async () => {
        if (partnerId && window.confirm(`Are you sure you want to block ${displayName}?`)) {
            try {
                await userSettingsService.blockUser(partnerId);
                // Refresh auth store to update blocked list locally
                await useAuthStore.getState().checkAuth();

                setIsBlocked(true);
                alert(`${displayName} has been blocked.`);
                // Ideally refresh app state or close chat
            } catch (error) {
                console.error("Failed to block user", error);
                alert("Failed to block user.");
            }
        }
    };

    return (
        <div className={cx('chat-info-container')}>
            <div className={cx('header-row')}>
                <h2 className={cx('title')}>{isGroup ? "Group Info" : "Chat Info"}</h2>
                <button className={cx('close-btn')} onClick={onClose}><X size={24} /></button>
            </div>

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

            {/* Shared Media */}
            <div className={cx('files-section')}>
                <h3 className={cx('sub-heading')}>Shared Photos</h3>
                <div className={cx('media-grid')}>
                    {loadingMedia ? <p>Loading...</p> : (
                        media.images.length > 0 ? (
                            media.images.slice(0, 9).map((img) => (
                                <img
                                    key={img._id}
                                    src={img.url}
                                    alt="Shared"
                                    className={cx('media-item')}
                                    onClick={() => setSelectedImage(img.url)}
                                />
                            ))
                        ) : (
                            <p className={cx('no-files-text')}>No photos shared</p>
                        )
                    )}
                </div>
            </div>

            {/* Shared Files */}
            <div className={cx('files-section')}>
                <h3 className={cx('sub-heading')}>Shared Files</h3>
                <div className={cx('files-list')}>
                    {loadingMedia ? <p>Loading...</p> : (
                        media.files.length > 0 ? (
                            media.files.map((file) => (
                                <div key={file._id} className={cx('file-item')}>
                                    <FileText size={20} />
                                    <a href={file.url} target="_blank" rel="noopener noreferrer">
                                        {file.fileName || "File"}
                                    </a>
                                </div>
                            ))
                        ) : (
                            <p className={cx('no-files-text')}>No files shared yet</p>
                        )
                    )}
                </div>
            </div>

            {isGroup && participants.length > 0 && (
                <div className={cx('members-section')}>
                    <h3 className={cx('sub-heading')}>Members ({participants.length})</h3>
                    <div className={cx('members-list')}>
                        {sortedParticipants.map((member) => (
                            <div key={member._id} className={cx('member-item')}>
                                <img
                                    src={member.avatarURL ? (member.avatarURL.startsWith('http') ? member.avatarURL : `http://localhost:5001${member.avatarURL}`) : defaultAvatar}
                                    className={cx('member-avatar')}
                                    alt=""
                                    onError={(e) => e.target.src = defaultAvatar}
                                />
                                <span className={cx('member-name')}>
                                    {member._id === currentUser?._id ? "You" : (member.displayName || member.username)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!isGroup && (
                <div className={cx('actions-section')}>
                    <button
                        className={cx('block-btn')}
                        onClick={handleBlockUser}
                    >
                        <Ban size={18} />
                        {isBlocked ? "Blocked" : "Block User"}
                    </button>
                </div>
            )}

            {selectedImage && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0,0,0,1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10000
                    }}
                    onClick={() => setSelectedImage(null)}
                >
                    <img
                        src={selectedImage}
                        alt="Full size"
                        style={{
                            maxWidth: '90%',
                            maxHeight: '90%',
                            objectFit: 'contain'
                        }}
                    />
                    <button
                        onClick={() => setSelectedImage(null)}
                        style={{
                            position: 'absolute',
                            top: '20px',
                            right: '20px',
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer'
                        }}
                    >
                        <X size={32} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default ChatInfo;