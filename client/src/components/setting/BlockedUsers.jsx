import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from '../../assets/css/SettingContainer.module.scss';
import { userSettingsService } from "../../services/userSettingsService.js";
import { useAuthStore } from "../../stores/useAuthStore.js";

const cx = classNames.bind(styles);

const BlockedUsers = () => {
    const [blockedList, setBlockedList] = useState([]);
    const { checkAuth } = useAuthStore(); // Unblocking might change user object (blockedUsers array)

    useEffect(() => {
        fetchBlockedUsers();
    }, []);

    const fetchBlockedUsers = async () => {
        try {
            const users = await userSettingsService.getBlockedUsers();
            setBlockedList(users);
        } catch (error) {
            console.error("Failed to fetch blocked users", error);
        }
    };

    const handleUnblock = async (userId) => {
        if (!confirm("Are you sure you want to unblock this user?")) return;
        
        try {
            await userSettingsService.unblockUser(userId);
            setBlockedList(prev => prev.filter(u => u._id !== userId));
            checkAuth(); 
        } catch (error) {
            console.error("Failed to unblock user", error);
            alert("Failed to unblock user");
        }
    };

    return (
        <>
            <h3>Blocked Users</h3>
            <div className={cx('section')}>
                <h4>Management</h4>
                {blockedList.length === 0 ? (
                    <p style={{ fontSize: '1.4rem', color: '#888' }}>You haven't blocked anyone yet.</p>
                ) : (
                    <ul className={cx('blocked-list')}>
                        {blockedList.map(u => (
                            <li key={u._id} className={cx('blocked-item')}>
                                <div className={cx('info')}>
                                    <img src={u.avatarUrl || "/favicon.png"} alt="avatar" />
                                    <span>{u.displayName || u.username}</span>
                                </div>
                                <button onClick={() => handleUnblock(u._id)} className={cx('unblock-btn')}>Unblock</button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </>
    );
};

export default BlockedUsers;
