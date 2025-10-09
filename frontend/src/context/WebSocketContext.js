import React, { createContext, useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { useDeviceState } from './DeviceStateContext';

const WEBSOCKET_URL = 'ws://localhost:8080';
const WebSocketContext = createContext(null);

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }) => {
    const [latestData, setLatestData] = useState({ temperature: 0, humidity: 0, light: 0 });
    const [historicalData, setHistoricalData] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [hasUnread, setHasUnread] = useState(false);
    
    // Lấy các hàm cần thiết từ DeviceStateContext
    const { updateDeviceState, fetchInitialStates } = useDeviceState();
    
    // State để báo thiết bị offline
    const [isDeviceOffline, setIsDeviceOffline] = useState(false); 

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
                if (newNotification.type === 'warning') {
                    toast.error(newNotification.message);
                } else if (newNotification.type === 'info') {
                    toast.info(newNotification.message);
                } else {
                    toast(newNotification.message);
                }
                setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
                setHasUnread(true);
            }
            else if (message.type === 'deviceStateUpdate') {
                const { device, state } = message.payload;
                console.log(`Received confirmed state for ${device}: ${state}`);
                updateDeviceState(device, state);
            }
            // Logic xử lý trạng thái kết nối
            else if (message.type === 'deviceConnectionStatus') {
                if (message.payload.status === 'offline') {
                    console.warn('Device is offline!');
                    setIsDeviceOffline(true);
                    //updateDeviceState('all', 'OFF'); // Cập nhật giao diện về OFF
                    toast.warn("Thiết bị đã mất kết nối!");
                } else if (message.payload.status === 'online') {
                    console.log('Device is back online! Fetching latest states...');
                    setIsDeviceOffline(false);
                    fetchInitialStates(); // Đồng bộ lại trạng thái từ database
                    toast.success("Thiết bị đã kết nối trở lại.");
                }
            }
        };

        return () => ws.close();
    }, [updateDeviceState, fetchInitialStates]);

    const value = { latestData, historicalData, notifications, hasUnread, setHasUnread, isDeviceOffline };

    return (
        <WebSocketContext.Provider value={value}>
            {children}
        </WebSocketContext.Provider>
    );
};