import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3001';

// Tạo Context
const DeviceStateContext = createContext(null);

// Tạo custom hook để sử dụng context
export const useDeviceState = () => useContext(DeviceStateContext);

// Tạo Provider component
export const DeviceStateProvider = ({ children }) => {
    const [deviceStates, setDeviceStates] = useState({ 
        led_1: 'OFF',
        led_2: 'OFF',
        led_3: 'OFF'
    });

    const handleControl = async (device, status) => {
        try {
            await axios.post(`${API_URL}/api/control`, { device, status });
            // Cập nhật trạng thái toàn cục
            setDeviceStates(prev => ({ ...prev, [device]: status.toUpperCase() }));
        } catch (error) {
            console.error('Error sending control command:', error);
        }
    };

    // Giá trị được cung cấp cho các component con
    const value = { deviceStates, handleControl };

    return (
        <DeviceStateContext.Provider value={value}>
            {children}
        </DeviceStateContext.Provider>
    );
};