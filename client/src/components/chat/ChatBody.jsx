import React, { useEffect, useRef } from 'react';
import classNames from 'classnames/bind';
import styles from '../../assets/css/ChatBody.module.scss';
import Message from './Message.jsx';
import { useChatStore } from "../../stores/useChatStore.js";
import { useAuthStore } from "../../stores/useAuthStore.js";
import defaultAvatar from "../../../public/favicon.png";

const cx = classNames.bind(styles);

const ChatBody = () => {
    // Lấy thêm fetchMessages từ store
    const { messages, activeConversationId, conversations, fetchMessages, reactToMessageAction, friends } = useChatStore();
    const { user: currentUser } = useAuthStore();

    const endOfMessagesRef = useRef(null);

    // Tìm conversation hiện tại
    const currentConvo = conversations.find(c => c._id === activeConversationId);

    // Lấy dữ liệu tin nhắn từ store
    const currentMessagesData = messages[activeConversationId];
    const messageList = currentMessagesData?.items || [];
    const hasMore = currentMessagesData?.hasMore;

    // Ref cho container để tính toán scroll
    const containerRef = useRef(null);
    const prevScrollHeightRef = useRef(0);
    const isFetchingRef = useRef(false);

    // --- 1. Tự động tải tin nhắn nếu chưa có (Backup cho trường hợp F5) ---
    useEffect(() => {
        if (activeConversationId && !currentMessagesData) {
            fetchMessages(activeConversationId);
        }
    }, [activeConversationId, currentMessagesData, fetchMessages]);

    // --- 2. Tự động cuộn xuống dưới cùng ---
    useEffect(() => {
        // Chỉ cuộn xuống đáy nếu:
        // A. Lần đầu load (prevScrollHeightRef.current === 0)
        // B. Tin nhắn mới được thêm vào CUỐI (không phải load more từ nextCursor)

        if (!containerRef.current) return;

        // Nếu chiều cao tăng lên và chúng ta KHÔNG đang ở trạng thái loading more (đơn giản hoá bằng cách xem scrollHeight)
        // Logic đơn giản: Nếu sender là mình hoặc đang ở gần đáy -> auto scroll
        // Nhưng phức tạp hơn là phân biệt "Load More" vs "New Message".

        // Cách xử lý: 
        // Nếu fetch old messages -> Scroll height tăng, nhưng scrollTop phải giữ nguyên vị trí tương đối
        if (isFetchingRef.current) {
            const newScrollHeight = containerRef.current.scrollHeight;
            const diff = newScrollHeight - prevScrollHeightRef.current;
            containerRef.current.scrollTop = diff; // Jump to previous relative position
            isFetchingRef.current = false;
        } else {
            // Default behaviour: Scroll to bottom for new messages or initial load
            // (Optional: Check if user is already near bottom before forcing scroll)
            endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
        }

    }, [messageList]);

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight } = e.target;

        // Nếu cuộn lên đỉnh và còn tin nhắn cũ -> Load more
        if (scrollTop === 0 && hasMore) {
            isFetchingRef.current = true;
            prevScrollHeightRef.current = scrollHeight; // Lưu lại chiều cao trước khi load
            fetchMessages(activeConversationId);
        }
    };

    const formatTime = (isoString) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Hàm lấy thông tin người gửi
    const getAvatarSrc = (url) => {
        if (!url) return defaultAvatar;
        if (url.startsWith('http') || url.startsWith('data:')) return url;
        return `http://localhost:5001${url}`;
    };

    const getSenderInfo = (senderId) => {
        if (!currentConvo?.participants) return { name: "Unknown", avatar: defaultAvatar };

        // Tìm user trong mảng participants
        let sender = currentConvo.participants.find(p => p._id === senderId);

        // Enhance with friend data if available (store uses 'friends' from useChatStore)
        if (sender && friends && friends.length > 0) {
            const friend = friends.find(f => f._id === sender._id || f._id === sender._id?.toString());
            if (friend) sender = { ...sender, ...friend };
        }

        return {
            name: sender?.displayName || sender?.username || "Unknown User",
            avatar: getAvatarSrc(sender?.avatarURL)
        };
    };

    return (
        <div
            className={cx('chat-body-wrapper')}
            ref={containerRef}
            onScroll={handleScroll}
        >

            {/* Loading Indicator for older messages */}
            {hasMore && isFetchingRef.current && (
                <div style={{ textAlign: 'center', padding: '10px', color: '#888' }}>
                    Loading...
                </div>
            )}

            {/* Hiển thị thông báo nếu chưa có tin nhắn */}
            {messageList.length === 0 && (
                <div style={{ textAlign: 'center', marginTop: '20px', color: '#999', fontSize: '0.9rem' }}>
                    Send a message to start the conversation!
                </div>
            )}

            {messageList.map((message, index) => {
                // --- FIX QUAN TRỌNG: Xử lý senderId là Object hay String ---
                const senderId = typeof message.senderId === 'object'
                    ? message.senderId?._id
                    : message.senderId;

                const isMe = message.isOwn !== undefined
                    ? message.isOwn
                    : (currentUser?._id && senderId === currentUser._id);

                // Lấy thông tin người gửi (chỉ cần lấy nếu không phải là mình)
                const senderInfo = isMe ? {} : getSenderInfo(senderId);

                return (
                    <Message
                        key={message._id || index}
                        senderName={isMe ? "Me" : senderInfo.name}
                        avatar={isMe ? (getAvatarSrc(currentUser?.avatarURL)) : senderInfo.avatar}
                        text={message.content}
                        image={message.imgUrl}
                        isGroup={currentConvo?.isGroup}
                        time={formatTime(message.createdAt)}
                        isMe={isMe}
                        reactions={message.reactions || []}
                        onReact={(emoji) => reactToMessageAction(message._id, emoji, activeConversationId)}
                    />
                );
            })}
            <div ref={endOfMessagesRef} />
        </div>
    );
};

export default ChatBody;