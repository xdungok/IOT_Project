import React, { createContext, useState, useEffect, useContext } from 'react';

const WEBSOCKET_URL = 'ws://localhost:8080';
const WebSocketContext = createContext(null);

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }) => {
    const [latestData, setLatestData] = useState({ temperature: 0, humidity: 0, light: 0 });
    const [historicalData, setHistoricalData] = useState([]);

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
        };

        return () => ws.close();
    }, []);

    const value = { latestData, historicalData };

    return (
        <WebSocketContext.Provider value={value}>
            {children}
        </WebSocketContext.Provider>
    );
};