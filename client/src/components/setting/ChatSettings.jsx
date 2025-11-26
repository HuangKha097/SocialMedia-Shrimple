import React from 'react';
import classNames from 'classnames/bind';
import styles from '../../assets/css/SettingContainer.module.scss';
import {useThemeStore} from "../../stores/useThemeStore.js";

const cx = classNames.bind(styles);

const ChatSettings = () => {
    const {isLight, toggleTheme} = useThemeStore()
    return (
        <>
            <h3>Chat Settings</h3>

            <div className={cx('section')}>
                <h4>Theme</h4>
                <div className={cx('form-group', 'row-layout')}>
                    <label>Light Mode</label>

                    <label className={cx('switch')}>
                        <input
                            type="checkbox"
                            checked={isLight}
                            onChange={toggleTheme}
                        />
                        <span className={cx('slider')}></span>
                    </label>


                </div>
            </div>
        </>
    );
};

export default ChatSettings;