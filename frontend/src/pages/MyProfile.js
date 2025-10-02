import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

const API_URL = 'http://localhost:3001';

function MyProfile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_URL}/api/profile`);
                setProfile(response.data);
            } catch (error) {
                console.error("Failed to fetch profile data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []); // Mảng rỗng đảm bảo chỉ gọi 1 lần

    if (loading) {
        return <h2>Loading profile...</h2>;
    }

    if (!profile) {
        return <h2>Could not load profile data.</h2>;
    }

    return (
        <div>
            <h2>MY PROFILE</h2>
            <div className="profile-page-container">
                <div className="profile-card">
                    {/* Ảnh đại diện */}
                    <img 
                        src={profile.avatarUrl} 
                        alt="Profile Avatar" 
                        className="profile-avatar" 
                    />

                    {/* Thông tin và links */}
                    <div className="profile-info">
                        <div className="info-item">Họ và Tên: {profile.fullName}</div>
                        <div className="info-item">Mã sinh viên: {profile.studentId}</div>
                        <div className="info-item">Lớp: {profile.className}</div>
                        <div className="info-item">Số điện thoại: {profile.phone}</div>

                        <div className="profile-links">
                            {/* Link GitHub */}
                            <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer">
                                <img src="/images/github-logo.png" alt="GitHub Logo" />
                            </a>

                            {/* Link PDF */}
                            <a href={profile.pdfUrl} target="_blank" rel="noopener noreferrer">
                                <img src="/images/pdf-logo.png" alt="PDF Logo" />
                            </a>
                            {/* LINK API DOCS */}
                            <a href={profile.apiDocsUrl} target="_blank" rel="noopener noreferrer">
                                <img src="/images/api-docs-logo.png" alt="API Docs Logo" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MyProfile;