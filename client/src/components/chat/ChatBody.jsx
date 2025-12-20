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
    const { messages, activeConversationId, conversations, fetchMessages, reactToMessageAction } = useChatStore();
    const { user: currentUser } = useAuthStore();

    const endOfMessagesRef = useRef(null);

    // Tìm conversation hiện tại
    const currentConvo = conversations.find(c => c._id === activeConversationId);

    // Lấy dữ liệu tin nhắn từ store
    const currentMessagesData = messages[activeConversationId];
    const messageList = currentMessagesData?.items || [];

    // --- 1. Tự động tải tin nhắn nếu chưa có (Backup cho trường hợp F5) ---
    useEffect(() => {
        if (activeConversationId && !currentMessagesData) {
            fetchMessages(activeConversationId);
        }
    }, [activeConversationId, currentMessagesData, fetchMessages]);

    // --- 2. Tự động cuộn xuống dưới cùng ---
    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messageList]);

    const formatTime = (isoString) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Hàm lấy thông tin người gửi
    const getSenderInfo = (senderId) => {
        if (!currentConvo?.participants) return { name: "Unknown", avatar: defaultAvatar };

        // Tìm user trong mảng participants
        const sender = currentConvo.participants.find(p => p._id === senderId);
        return {
            name: sender?.displayName || sender?.username || "Unknown User",
            avatar: sender?.avatarUrl || defaultAvatar
        };
    };

    return (
        <div className={cx('chat-body-wrapper')}>

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
                        avatar={isMe ? (currentUser?.avatarUrl || defaultAvatar) : senderInfo.avatar}
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
             {/* <div ref={endOfMessagesRef} /> */}
        </div>
    );
};

export default ChatBody;