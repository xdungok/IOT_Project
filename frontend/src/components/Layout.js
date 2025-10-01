import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { FaTachometerAlt, FaDatabase, FaHistory, FaUser, FaBell, FaCloudsmith } from 'react-icons/fa';
import '../App.css';

function Layout() {
    return (
        <div className="dashboard-container">
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <FaCloudsmith className="logo-icon" />
                    <h1>IOT CONTROL</h1>
                </div>
                <nav className="sidebar-nav">
                    <ul>
                        <li>
                            <NavLink to="/"><FaTachometerAlt className="nav-icon" /> DASHBOARD</NavLink>
                        </li>
                        <li>
                            <NavLink to="/data-sensor"><FaDatabase className="nav-icon" /> DATA SENSOR</NavLink>
                        </li>
                        <li>
                            <NavLink to="/device-activity"><FaHistory className="nav-icon" /> DEVICE ACTIVITY</NavLink>
                        </li>
                        <li className="disabled-link">
                            <a><FaUser className="nav-icon" /> MY PROFILE</a>
                        </li>
                    </ul>
                </nav>
            </aside>
            <main className="main-content">
                <header className="header">
                    {}
                    <h2>DASHBOARD</h2> 
                    <div className="header-profile">
                        <FaBell className="notification-icon" />
                        <span>Lưu Xuân Dũng</span>
                        <img src="https://via.placeholder.com/40" alt="Avatar" className="avatar" />
                    </div>
                </header>
                <Outlet />
            </main>
        </div>
    );
}
export default Layout;