import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3001';

// Tạo Context
const ProfileContext = createContext(null);

// Tạo custom hook
export const useProfile = () => useContext(ProfileContext);

// Tạo Provider component
export const ProfileProvider = ({ children }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/profile`);
                setProfile(response.data);
            } catch (error) {
                console.error("Failed to fetch profile data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []); // Mảng rỗng đảm bảo useEffect chỉ chạy 1 lần khi app khởi động

    const value = { profile, loading };

    return (
        <ProfileContext.Provider value={value}>
            {children}
        </ProfileContext.Provider>
    );
};