import React, { useState, useMemo, useRef } from 'react';
import classNames from 'classnames/bind';
import styles from '../../assets/css/ChatInput.module.scss';
import { Paperclip, Send, Smile, Mic, MapPin, X, Image as ImageIcon } from 'lucide-react';
import { useChatStore } from "../../stores/useChatStore.js";
import { useAuthStore } from "../../stores/useAuthStore.js";
import EmojiPicker from 'emoji-picker-react';

const cx = classNames.bind(styles);

const ChatInput = () => {
    const [text, setText] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [image, setImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    
    const fileInputRef = useRef(null);

    const { sendDirectMessage, sendGroupMessage, activeConversationId, conversations, friends } = useChatStore();
    const { user: currentUser } = useAuthStore();

    // Check chat permission logic
    const chatStatus = useMemo(() => {
        const currentConvo = conversations.find(c => c._id === activeConversationId);
        if (!activeConversationId) return { allowed: false, reason: "No selection" };
        
        const isTemp = activeConversationId.toString().startsWith('temp_');
        const isGroup = currentConvo?.isGroup && !isTemp;
        
        if (isGroup) return { allowed: true, reason: "" };

        let partnerId = null;
        if (isTemp) {
            partnerId = activeConversationId.split('temp_')[1];
        } else if (currentConvo) {
            const partner = currentConvo.participants.find(p => p._id !== currentUser._id);
            partnerId = partner ? partner._id : null;
        }

        if (!partnerId) return { allowed: false, reason: "User not found" };
        
        // Check if I blocked them
        if (currentUser.blockedUsers && currentUser.blockedUsers.includes(partnerId)) {
             return { allowed: false, reason: "You have blocked this user" };
        }

        // Check friendship
        const isFriend = friends.some(f => f._id.toString() === partnerId.toString());
        if (!isFriend) {
            return { allowed: false, reason: "You are not friends with this user" };
        }
        
        return { allowed: true, reason: "" };

    }, [activeConversationId, conversations, friends, currentUser]);


    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            // Toast error here ideally
            console.error("Please select an image file");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
             setPreviewUrl(reader.result);
             setImage(file);
        };
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setImage(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const onEmojiClick = (emojiObject) => {
        setText((prev) => prev + emojiObject.emoji);
    };

    const handleSendMessage = async () => {
        if ((!text.trim() && !image) || !chatStatus.allowed) return;

        const currentConvo = conversations.find(c => c._id === activeConversationId);
        const isGroup = currentConvo?.isGroup && !activeConversationId.toString().startsWith('temp_');
        
        // Use previewUrl as base64 image data for simple handling
        const imageToSend = previewUrl; 

        try {
            if (isGroup) {
                await sendGroupMessage(activeConversationId, text, imageToSend, null, 'text'); // Type infer inside store if needed? Or pass 'image' if only image?
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
                   await sendDirectMessage(recipientId, text, convoIdToSend, imageToSend, null, 'text'); 
                }
            }
            // Reset state
            setText(""); 
            removeImage();
            setShowEmojiPicker(false);
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

    if (!chatStatus.allowed) {
        return (
            <div className={cx('container')}>
                <div className={cx('input-wrapper', 'disabled-banner')}>
                    <span className={cx('disabled-text')}>
                        {chatStatus.reason}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className={cx('container')}>
            {showEmojiPicker && (
                <div className={cx('emoji-picker-container')}>
                    <EmojiPicker onEmojiClick={onEmojiClick} theme="dark" width={300} height={400} />
                </div>
            )}

            {previewUrl && (
                <div className={cx('preview-area')}>
                    <div className={cx('preview-img-wrapper')}>
                        <img src={previewUrl} alt="Preview" />
                        <button className={cx('close-btn')} onClick={removeImage}>
                            <X size={12} />
                        </button>
                    </div>
                </div>
            )}

            <div className={cx('input-wrapper')}>
                <div className={cx('btn-group')}>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        style={{ display: 'none' }} 
                        accept="image/*"
                        onChange={handleFileChange} 
                    />
                    <button 
                        className={cx('btn', 'attach-btn')}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <ImageIcon size={20}/>
                    </button>
                    <button 
                        className={cx('btn', 'emoji-btn')}
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                        <Smile size={20}/>
                    </button>
                    {/* Placeholder for Map/Location */}
                    <button className={cx('btn', 'map-btn')}><MapPin size={20}/></button>
                </div>

                <input
                    type="text"
                    placeholder="Type a message..."
                    className={cx('text-input')}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setShowEmojiPicker(false)} 
                />

                <div className={cx("btn-group")}>
                    {/* Placeholder for Mic */}
                    <button 
                    className={cx('btn', 'mic-btn')}
                    onClick={() => alert("Voice messaging coming soon!")}
                >
                    <Mic size={20}/>
                </button>
                    <button
                        className={cx('btn', 'send-btn')}
                        onClick={handleSendMessage}
                        disabled={!text.trim() && !image}
                    >
                        <Send size={20}/>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatInput;