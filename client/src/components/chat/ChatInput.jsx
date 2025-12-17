import React, { useState, useMemo } from 'react';
import classNames from 'classnames/bind';
import styles from '../../assets/css/ChatInput.module.scss';
import { Paperclip, Send, Smile, Mic, MapPin } from 'lucide-react';
import { useChatStore } from "../../stores/useChatStore.js";
import { useAuthStore } from "../../stores/useAuthStore.js";

const cx = classNames.bind(styles);

const ChatInput = () => {
    const [text, setText] = useState("");
    const { sendDirectMessage, sendGroupMessage, activeConversationId, conversations, friends } = useChatStore();
    const { user: currentUser } = useAuthStore();

    // Check friendship logic
    const isAllowedToChat = useMemo(() => {
        // 1. Get current conversation
        const currentConvo = conversations.find(c => c._id === activeConversationId);
        
        // 2. If no conversation selected (e.g. init state), maybe disable or allow default
        if (!activeConversationId) return false;

        // 3. Check if temp or existing private
        const isTemp = activeConversationId.toString().startsWith('temp_');
        const isGroup = currentConvo?.isGroup && !isTemp;

        // 4. Always allow group chat
        if (isGroup) return true;

        // 5. Find partner ID for private chat
        let partnerId = null;
        if (isTemp) {
            partnerId = activeConversationId.split('temp_')[1];
        } else if (currentConvo) {
            const partner = currentConvo.participants.find(p => p._id !== currentUser._id);
            partnerId = partner ? partner._id : null;
        }

        // 6. Check if partnerId is in friends list
        if (!partnerId) return false;
        
        // friend._id check. usually IDs are strings, but ensure type safety
        const isFriend = friends.some(f => f._id.toString() === partnerId.toString());
        return isFriend;

    }, [activeConversationId, conversations, friends, currentUser]);


    const handleSendMessage = async () => {
        if (!text.trim() || !isAllowedToChat) return;

        // 1. Tìm thông tin cuộc trò chuyện hiện tại
        const currentConvo = conversations.find(c => c._id === activeConversationId);
        const isGroup = currentConvo?.isGroup && !activeConversationId.toString().startsWith('temp_');

        try {
            if (isGroup) {
                await sendGroupMessage(activeConversationId, text);
            } else {
                let recipientId = null;
                if (activeConversationId.toString().startsWith('temp_')) {
                    recipientId = activeConversationId.split('temp_')[1];
                } else if (currentConvo) {
                    const partner = currentConvo.participants.find(p => p._id !== currentUser._id);
                    recipientId = partner ? partner._id : null;
                }

                if (recipientId) {
                   const convoIdToSend = activeConversationId.toString().startsWith('temp_') ? null : activeConversationId;
                   await sendDirectMessage(recipientId, text, convoIdToSend);
                }
            }
            setText(""); 
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const placeholderText = isAllowedToChat ? "Type a message..." : "You are not friends with this user.";

    if (!isAllowedToChat) {
        return (
            <div className={cx('input-wrapper', 'disabled-banner')}>
                <span className={cx('disabled-text')}>
                    You are not friends with this user
                </span>
            </div>
        );
    }

    return (
        <div className={cx('input-wrapper')}>
            <div className={cx('btn-group')}>
                <button className={cx('btn', 'attach-btn')}><Paperclip size={16}/></button>
                <button className={cx('btn', 'emoji-btn')}><Smile size={16}/></button>
                <button className={cx('btn', 'emoji-btn')}><MapPin size={16}/></button>
            </div>

            <input
                type="text"
                placeholder="Type a message..."
                className={cx('text-input')}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
            />

            <div className={cx("btn-group")}>
                <button className={cx('btn', 'send-btn')}><Mic size={16}/></button>
                <button
                    className={cx('btn', 'send-btn')}
                    onClick={handleSendMessage}
                    disabled={!text.trim()}
                >
                    <Send size={16}/>
                </button>
            </div>
        </div>
    );
};

export default ChatInput;