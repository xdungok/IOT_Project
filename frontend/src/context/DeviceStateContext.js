import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3001';

// Tạo Context
const DeviceStateContext = createContext(null);

// Tạo một custom hook để dễ dàng sử dụng context này
export const useDeviceState = () => useContext(DeviceStateContext);

// Tạo Provider component
export const DeviceStateProvider = ({ children }) => {
    // Khởi tạo trạng thái rỗng ban đầu, sẽ được điền bởi API
    const [deviceStates, setDeviceStates] = useState({});
    // Thêm một state để theo dõi quá trình tải dữ liệu ban đầu
    const [loading, setLoading] = useState(true);

    // Sử dụng useEffect để lấy trạng thái ban đầu của thiết bị từ server khi app khởi động
    useEffect(() => {
        const fetchInitialStates = async () => {
            try {
                // Gọi API mới để lấy tất cả trạng thái hiện tại
                const response = await axios.get(`${API_URL}/api/control/states`);
                
                // Gộp trạng thái từ server với trạng thái mặc định.
                const initialStates = {
                    led_1: 'OFF',
                    led_2: 'OFF',
                    led_3: 'OFF',
                    ...response.data // Ghi đè các giá trị mặc định bằng giá trị thật từ server
                };
                setDeviceStates(initialStates);
            } catch (error) {
                console.error('Failed to fetch initial device states:', error);
                // Nếu có lỗi xảy ra, sử dụng trạng thái mặc định
                setDeviceStates({ 
                    led_1: 'OFF',
                    led_2: 'OFF',
                    led_3: 'OFF' 
                });
            } finally {
                // Dù thành công hay thất bại, cũng kết thúc quá trình loading
                setLoading(false);
            }
        };

        fetchInitialStates();
    }, []); // Mảng rỗng [] đảm bảo useEffect này chỉ chạy một lần duy nhất khi component được mount

    // Hàm điều khiển thiết bị, không thay đổi logic
    const handleControl = async (device, status) => {
        try {
            await axios.post(`${API_URL}/api/control`, { device, status });
            // Cập nhật trạng thái toàn cục ngay lập tức để giao diện phản hồi nhanh
            setDeviceStates(prev => ({ ...prev, [device]: status.toUpperCase() }));
        } catch (error) {
            console.error('Error sending control command:', error);
        }
    };
    
    // Cung cấp state, hàm điều khiển, và trạng thái loading cho các component con
    const value = { deviceStates, handleControl, loading };

    return (
        <DeviceStateContext.Provider value={value}>
            {children}
        </DeviceStateContext.Provider>
    );
};