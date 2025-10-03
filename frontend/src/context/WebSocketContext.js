import React, { createContext, useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';

const WEBSOCKET_URL = 'ws://localhost:8080';
const WebSocketContext = createContext(null);

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }) => {
    const [latestData, setLatestData] = useState({ temperature: 0, humidity: 0, light: 0 });
    const [historicalData, setHistoricalData] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [hasUnread, setHasUnread] = useState(false);

    useEffect(() => {
        const ws = new WebSocket(WEBSOCKET_URL);
        ws.onopen = () => console.log('Connected to WebSocket server');
        ws.onclose = () => console.log('Disconnected from WebSocket server');

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'sensorData') {
                const rawData = message.payload;
                const timestamp = message.timestamp;
                setLatestData(rawData);
                setHistoricalData(prevData => {
                    const chartDataPoint = {
                        name: timestamp,
                        temperature: rawData.temperature,
                        humidity: rawData.humidity,
                        light: rawData.light / 10 
                    };

                    const updatedData = [...prevData, chartDataPoint];
                    return updatedData.slice(Math.max(updatedData.length - 10, 0));
                });
            }
            else if (message.type === 'notification') {
                const newNotification = message.payload;
                console.log("Attempting to show toast for:", newNotification.message);
                // Kích hoạt toast, hiển thị toast dựa trên loại thông báo từ backend
                if (newNotification.type === 'warning') {
                    // Dùng toast.error (màu đỏ) cho cảnh báo
                    toast.error(newNotification.message);
                } else if (newNotification.type === 'info') {
                    toast.info(newNotification.message);
                } else {
                    toast(newNotification.message); // Mặc định
                }
                // Thêm thông báo vào danh sách để xem lại trong dropdown
                setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
                setHasUnread(true);
            }
        };

        return () => ws.close();
    }, []);

    const value = { latestData, historicalData, notifications, hasUnread, setHasUnread };

    return (
        <WebSocketContext.Provider value={value}>
            {children}
        </WebSocketContext.Provider>
    );
};