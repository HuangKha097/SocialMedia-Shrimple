import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames/bind';
import styles from '../../assets/css/SettingContainer.module.scss';
import { useAuthStore } from '../../stores/useAuthStore';
import { authService } from '../../services/authService';
import { Camera } from 'lucide-react';

const cx = classNames.bind(styles);

const AccountSettings = ({ handleLogout }) => {
    const { user, checkAuth } = useAuthStore();
    
    const [displayName, setDisplayName] = useState(user?.displayName || "");
    const [username, setUsername] = useState(user?.username || ""); // Should we allow username update? Maybe.
    const [bio, setBio] = useState(user?.bio || "");
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || null);
    const [isUpdating, setIsUpdating] = useState(false);

    const fileInputRef = useRef(null);

    useEffect(() => {
        if (user) {
            setDisplayName(user.displayName || "");
            setUsername(user.username || "");
            setBio(user.bio || "");
            setAvatarPreview(user.avatarUrl || null);
        }
    }, [user]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdate = async () => {
        setIsUpdating(true);
        try {
            const formData = new FormData();
            formData.append("displayName", displayName);
            formData.append("bio", bio);
            formData.append("username", username);
            if (avatar) {
                formData.append("avatar", avatar);
            }

            const updatedUser = await authService.updateProfile(formData);
            
            // Refresh local user state
            // If checkAuth fetches full user, we can use it, or manually set.
            // checkAuth usually calls /me
            if (updatedUser) {
                useAuthStore.getState().updateUser(updatedUser);
            }
            await checkAuth(); 
            
            alert("Profile updated successfully!");
        } catch (error) {
            console.error("Failed to update profile:", error);
            alert("Failed to update profile");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <>
            <h3>Account Settings</h3>

            <div className={cx('section', 'profile-header')}>
                 <div className={cx('avatar-wrapper')} onClick={() => fileInputRef.current.click()}>
                    <img 
                        src={avatarPreview || "/favicon.png"} 
                        alt="Avatar" 
                        className={cx('avatar-preview')} 
                    />
                    <div className={cx('overlay')}>
                        <Camera size={24} />
                    </div>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        style={{ display: 'none' }} 
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                 </div>
                 <h4>{user?.displayName || user?.username}</h4>
            </div>

            <div className={cx('section')}>
                <h4>Profile Information</h4>
                <div className={cx('form-group')}>
                    <label htmlFor="displayName">Display Name</label>
                    <input 
                        type="text" 
                        id="displayName" 
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                    />
                </div>
                <div className={cx('form-group')}>
                    <label htmlFor="username">Username</label>
                    <input 
                        type="text" 
                        id="username" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className={cx('form-group')}>
                    <label htmlFor="bio">Bio</label>
                    <textarea 
                        id="bio" 
                        placeholder="Tell something about yourself..."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                    ></textarea>
                </div>
                <button 
                    className={cx("save-btn")} 
                    onClick={handleUpdate} 
                    disabled={isUpdating}
                >
                    {isUpdating ? "Saving..." : "Save Changes"}
                </button>
            </div>

            <div className={cx('section')}>
                <h4>Security</h4>
                <div className={cx('form-group')}>
                    <label htmlFor="password">New Password</label>
                    <input type="password" id="password" placeholder="••••••••" disabled />
                    <small>Password change coming soon</small>
                </div>
            </div>

            <div className={cx('section')}>
                <h4>Privacy</h4>
                <div className={cx('form-group')}>
                    <label htmlFor="whoCanMessage">Who can message you</label>
                    <select id="whoCanMessage" defaultValue="Everyone">
                        <option value="Everyone">Everyone</option>
                        <option value="Friends">Friends</option>
                        <option value="Nobody">Nobody</option>
                    </select>
                </div>
            </div>
            <button className={cx("sign-out-btn")} onClick={handleLogout}>Sign out</button>
        </>
    );
};

export default AccountSettings;