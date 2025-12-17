import React from 'react';
import classNames from 'classnames/bind';
import styles from '../../assets/css/ChatContainer.module.scss';
import ChatHeader from "./ChatHeader.jsx";
import ChatBody from "./ChatBody.jsx";
import ChatInput from "./ChatInput.jsx";
import ChatInfo from "./ChatInfo.jsx";
import {useChatStore} from "../../stores/useChatStore.js";
import {MessageSquare} from "lucide-react";
import { useSearchParams } from 'react-router-dom';

const cx = classNames.bind(styles);

const ChatContainer = ({onCloseChatInfo, isShowChatInfo}) => {
    const {activeConversationId, setActiveConversationId, conversations, friends} = useChatStore();
    const [searchParams] = useSearchParams();

    React.useEffect(() => {
        const idFromUrl = searchParams.get('id');
        if (idFromUrl && idFromUrl !== activeConversationId) {
             setActiveConversationId(idFromUrl);
        }
    }, [searchParams, setActiveConversationId, activeConversationId]);

    // 1. Lấy thêm `friends` từ store để tìm thông tin người bạn nếu là chat mới

    // 2. Logic tìm conversation:
    // Ưu tiên 1: Tìm trong danh sách chat đã có (conversations)
    let selectedConvo = conversations.find(conversation => conversation._id === activeConversationId);

    // Ưu tiên 2: Nếu không thấy (và là ID tạm), tự tạo object conversation giả từ list friends
    if (!selectedConvo && activeConversationId?.startsWith('temp_')) {
        const friendId = activeConversationId.replace('temp_', '');
        const friend = friends.find(f => f._id === friendId);

        if (friend) {
            selectedConvo = {
                _id: activeConversationId,
                isGroup: false,
                // Giả lập cấu trúc participants giống hệt Backend trả về để ChatHeader không bị lỗi
                participants: [friend],
                updatedAt: new Date().toISOString(),
                unreadCounts: 0
            };
        }
    }

    // console.log(selectedConvo);

    // Nếu vẫn không có (User chưa chọn ai), hiện màn hình Welcome
    if (!selectedConvo) {
        return (
            <div className={cx('chat-container', 'no-chat-selected')}>
                <div className={cx('welcome-content')}>
                    <div className={cx('icon-wrapper')}>
                        <MessageSquare size={50}/>
                    </div>
                    <h2>Welcome to Shrimple Chat!</h2>
                    <p>Select a conversation from the sidebar to start chatting.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={cx('chat-container-wrapper')}>
            <div className={cx("block-left")}>
                <div className={cx("header")}>
                    {/* QUAN TRỌNG: Sửa prop `chat` truyền vào.
                        Lúc trước bạn truyền cả mảng `conversations`, đúng ra phải là `selectedConvo` */}
                    <ChatHeader onCloseChatInfo={onCloseChatInfo} chat={selectedConvo}/>
                </div>

                <div className={cx("body")}>
                    {/* ChatBody cần biết đang chat với ai để render tin nhắn */}
                    <ChatBody   />
                </div>

                <div className={cx("footer")}>
                    {/* ChatInput cũng có thể cần prop chat để biết gửi cho ai (nếu không dùng activeId từ store) */}
                    <ChatInput/>
                </div>
            </div>

            {isShowChatInfo && (
                <div className={cx("block-right")}>
                    <div className={cx("chat-info-wrapper")}>
                        {/* ChatInfo cũng cần biết đang hiển thị info của ai */}
                        <ChatInfo chat={selectedConvo}/>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatContainer;