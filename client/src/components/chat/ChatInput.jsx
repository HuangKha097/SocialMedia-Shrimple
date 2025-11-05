import React from 'react';
import classNames from 'classnames/bind';
import styles from '../../assets/css/ChatInput.module.scss';
import {Paperclip, Send, Smile, Mic, MapPin} from 'lucide-react';

const cx = classNames.bind(styles);

const ChatInput = () => {
    return (
        <div className={cx('input-wrapper')}>
            <div className={cx('btn-group')}>
                <button className={cx('btn', 'attach-btn')}>
                    <Paperclip size={16}/>
                </button>
                <button className={cx('btn', 'emoji-btn')}>
                    <Smile size={16}/>
                </button>
                <button className={cx('btn', 'emoji-btn')}>
                    <MapPin size={16}/>
                </button>
            </div>

            <input
                type="text"
                placeholder="Type a message..."
                className={cx('text-input')}
            />

            <div className={cx("btn-group")}>
                <button className={cx('btn', 'send-btn')}>
                    <Mic size={16}/>
                </button>
                <button className={cx('btn', 'send-btn')}>
                    <Send size={16}/>
                </button>
            </div>
        </div>
    );
};

export default ChatInput;