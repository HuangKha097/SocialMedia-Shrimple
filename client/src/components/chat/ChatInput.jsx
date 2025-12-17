import React, { useState } from 'react';
import classNames from 'classnames/bind';
import styles from '../../assets/css/ChatInput.module.scss';
import { Paperclip, Send, Smile, Mic, MapPin } from 'lucide-react';
import { useChatStore } from "../../stores/useChatStore.js";
import { useAuthStore } from "../../stores/useAuthStore.js";

const cx = classNames.bind(styles);

const ChatInput = () => {
    const [text, setText] = useState("");
    // Lấy thêm hàm sendGroupMessage từ store
    const { sendDirectMessage, sendGroupMessage, activeConversationId, conversations } = useChatStore();
    const { user: currentUser } = useAuthStore();

    const handleSendMessage = async () => {
        if (!text.trim()) return;

        // 1. Tìm thông tin cuộc trò chuyện hiện tại
        const currentConvo = conversations.find(c => c._id === activeConversationId);

        // Kiểm tra xem là Group hay Chat 1-1
        // (Nếu activeId bắt đầu bằng temp_ thì chắc chắn là 1-1 mới tạo)
        const isGroup = currentConvo?.isGroup && !activeConversationId.toString().startsWith('temp_');

        try {
            if (isGroup) {
                // --- TRƯỜNG HỢP GROUP ---
                // Gọi hàm gửi tin nhắn Group (chỉ cần conversationId và nội dung)
                await sendGroupMessage(activeConversationId, text);
            } else {
                // --- TRƯỜNG HỢP 1-1 ---
                // Logic cũ: Cần tìm recipientId
                let recipientId = null;

                if (activeConversationId.toString().startsWith('temp_')) {
                    recipientId = activeConversationId.split('temp_')[1];
                } else if (currentConvo) {
                    const partner = currentConvo.participants.find(p => p._id !== currentUser._id);
                    recipientId = partner ? partner._id : null;
                }

                if (recipientId) {
                    await sendDirectMessage(recipientId, text, activeConversationId);
                } else {
                    console.error("Cannot determine recipient ID");
                    return;
                }
            }

            setText(""); // Xóa ô nhập sau khi gửi thành công
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

    return (
        <div className={cx('input-wrapper')}>
            {/* ... Giữ nguyên phần UI nút bấm ... */}
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