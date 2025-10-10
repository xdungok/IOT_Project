import React from 'react';
import { useProfile } from '../context/ProfileContext';
import '../App.css';

function MyProfile() {
    // Lấy dữ liệu và trạng thái loading trực tiếp từ Context
    const { profile, loading } = useProfile();
    if (loading) {
        return <h2>Loading profile...</h2>;
    }

    if (!profile) {
        return <h2>Could not load profile data.</h2>;
    }

    return (
        <div>
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
                            <a href={profile.apiDocsUrl} target="_blank" rel="noopener noreferrer" >
                                <img src="/images/api-logo.png" alt="API Docs Logo" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MyProfile;