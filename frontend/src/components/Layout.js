import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { useWebSocket } from '../context/WebSocketContext';
import { FaTachometerAlt, FaDatabase, FaHistory, FaUser, FaBell, FaCloudsmith } from 'react-icons/fa';
import '../App.css';

function Layout() {
    // Sử dụng hook useLocation để lấy thông tin về route hiện tại
    const location = useLocation();
    const [pageTitle, setPageTitle] = useState('');
    const { profile } = useProfile();
    
    // Lấy state và hàm quản lý thông báo từ WebSocketContext
    const { notifications, hasUnread, setHasUnread } = useWebSocket();
    const [showNotifications, setShowNotifications] = useState(false);

    // Sử dụng useEffect để cập nhật tiêu đề mỗi khi URL thay đổi
    useEffect(() => {
        switch (location.pathname) {
            case '/':
                setPageTitle('DASHBOARD');
                break;
            case '/data-sensor':
                setPageTitle('DATA SENSOR');
                break;
            case '/device-activity':
                setPageTitle('DEVICE ACTIVITY');
                break;
            case '/my-profile':
                setPageTitle('MY PROFILE');
                break;
            default:
                setPageTitle('DASHBOARD');
        }
    }, [location.pathname]); // Phụ thuộc vào sự thay đổi của pathname

    // Hàm xử lý khi click vào biểu tượng chuông
    const handleBellClick = () => {
        // Đảo ngược trạng thái hiển thị của dropdown
        setShowNotifications(!showNotifications);
        // Khi mở dropdown, đánh dấu là đã đọc tất cả thông báo
        if (hasUnread) {
            setHasUnread(false);
        }
    };

    return (
        <div className="dashboard-container">
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <FaCloudsmith className="logo-icon" />
                    <h1>IOT CONTROL</h1>
                </div>
                <nav className="sidebar-nav">
                    <ul>
                        <li><NavLink to="/"><FaTachometerAlt className="nav-icon" /> DASHBOARD</NavLink></li>
                        <li><NavLink to="/data-sensor"><FaDatabase className="nav-icon" /> DATA SENSOR</NavLink></li>
                        <li><NavLink to="/device-activity"><FaHistory className="nav-icon" /> DEVICE ACTIVITY</NavLink></li>
                        <li><NavLink to="/my-profile"><FaUser className="nav-icon" /> MY PROFILE</NavLink></li>
                    </ul>
                </nav>
            </aside>
            <main className="main-content">
                <header className="header">
                    <h2>{pageTitle}</h2>
                    <div className="header-profile">
                        {/* Container cho chuông thông báo và dropdown */}
                        <div className="notification-container">
                            <FaBell 
                                className={`notification-icon ${hasUnread ? 'unread' : ''}`}
                                onClick={handleBellClick}
                            />
                            {/* Hiển thị dropdown nếu showNotifications là true */}
                            {showNotifications && (
                                <div className="notification-dropdown">
                                    {notifications.length === 0 ? (
                                        <div className="notification-item">Không có thông báo mới.</div>
                                    ) : (
                                        notifications.map(notif => (
                                            <div key={notif.id} className={`notification-item ${notif.type}`}>
                                                <strong>{notif.message}</strong>
                                                <span>{notif.time}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                        
                        {/* Hiển thị tên từ context, có fallback */}
                        <span>{profile ? profile.fullName : 'User'}</span>
                        
                        {/* Hiển thị ảnh từ context, có fallback */}
                        <img 
                            src={profile ? profile.avatarUrl : "https://via.placeholder.com/40"} 
                            alt="Avatar" 
                            className="avatar" 
                        />
                    </div>
                </header>
                <Outlet />
            </main>
        </div>
    );
}
export default Layout;