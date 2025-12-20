import React, { useState } from 'react';
import classNames from 'classnames/bind';
import styles from '../../assets/css/Message.module.scss';
import profilePic_test from "../../../public/favicon.png";
import { X } from 'lucide-react';

const cx = classNames.bind(styles);

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "😡"];

const Message = ({
                     text,
                     time,
                     senderName,
                     avatar = profilePic_test,
                     isMe = false,
                     image = null,
                     isGroup = false,
                     reactions = [],
                     onReact
                 }) => {
    const [showPicker, setShowPicker] = useState(false);
    const [pickerStyle, setPickerStyle] = useState({});
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const containerRef = React.useRef(null);
    const timeoutRef = React.useRef(null);

    // Group reactions by emoji
    const reactionsByEmoji = reactions.reduce((acc, curr) => {
        if (!acc[curr.reaction]) {
            acc[curr.reaction] = [];
        }
        acc[curr.reaction].push(curr.userId);
        return acc;
    }, {});

    const hasReactions = Object.keys(reactionsByEmoji).length > 0;

    const handleMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            // Calculate fixed position for picker to be above the message
            // Adjust gap if necessary
            const top = rect.top - 55; 
            
            const style = {
                position: 'fixed',
                top: `${top}px`,
                zIndex: 9999,
            };

            if (isMe) {
                style.right = `${window.innerWidth - rect.right}px`;
                style.left = 'auto';
            } else {
                style.left = `${rect.left}px`;
                style.right = 'auto';
            }
            setPickerStyle(style);
            setShowPicker(true);
        }
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setShowPicker(false);
        }, 300); // 300ms delay to allow moving to picker
    };

    return (
        <div className={cx('message-wrapper', {me: isMe})}>
            {!isMe && <img src={avatar} alt="avatar" className={cx('avatar')}/>}

            <div className={cx('message-content')}>

                {(!isMe && isGroup && senderName) && (
                    <p className={cx('sender-name')}>{senderName}</p>
                )}

                <div 
                    className={cx('message-container')} 
                    ref={containerRef}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    {/* Reaction Picker - Fixed Position */}
                    {showPicker && (
                         <div 
                            className={cx('reaction-picker', { 'picker-me': isMe })} 
                            style={pickerStyle}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                         >
                            {EMOJIS.map(emoji => (
                                <span 
                                    key={emoji} 
                                    className={cx('emoji-btn')}
                                    onClick={() => {
                                        onReact(emoji);
                                        setShowPicker(false);
                                    }}
                                >
                                    {emoji}
                                </span>
                            ))}
                        </div>
                    )}

                    {image && (
                        <img 
                            src={image} 
                            alt="chat-content" 
                            className={cx('message-image')}
                            onClick={() => setIsImageModalOpen(true)}
                            style={{ cursor: 'pointer' }}
                        />
                    )}
                    <div className={cx('message-bubble')}>
                        {text && <p className={cx('message-text')}>{text}</p>}
                        <p className={cx('message-time')}>{time}</p>
                    </div>

                     {/* Reactions Display */}
                    {hasReactions && (
                        <div className={cx('reactions-display', { 'reactions-me': isMe })}>
                            {Object.entries(reactionsByEmoji).map(([emoji, users]) => (
                                <ReactionItem key={emoji} emoji={emoji} users={users} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Image Modal Overlay */}
            {isImageModalOpen && (
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
                    onClick={() => setIsImageModalOpen(false)}
                >
                    <img 
                        src={image} 
                        alt="Full size" 
                        style={{
                            maxWidth: '90%',
                            maxHeight: '90%',
                            objectFit: 'contain'
                        }} 
                    />
                    <button 
                        onClick={() => setIsImageModalOpen(false)}
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

const ReactionItem = ({ emoji, users }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    // Format users list
    const userNames = users.map(u => 
        typeof u === 'object' ? (u.displayName || u.username) : "Unknown"
    );

    const displayNames = userNames.slice(0, 5);
    const remaining = userNames.length - 5;

    let tooltipText = displayNames.join(', ');
    if (remaining > 0) tooltipText += ` and ${remaining} others`;

    return (
        <div 
            className={cx('reaction-item')}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            {emoji} <span className={cx('reaction-count')}>{users.length > 1 ? users.length : ''}</span>
            
            {showTooltip && (
                <div className={cx('reaction-tooltip')}>
                    {tooltipText}
                </div>
            )}
        </div>
    );
};
export default Message;