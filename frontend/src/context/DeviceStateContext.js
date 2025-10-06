import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3001';
const DeviceStateContext = createContext(null);

export const useDeviceState = () => useContext(DeviceStateContext);

export const DeviceStateProvider = ({ children }) => {
    const [deviceStates, setDeviceStates] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInitialStates = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/control/states`);
                const initialStates = {
                    led_1: 'OFF', led_2: 'OFF', led_3: 'OFF',
                    ...response.data
                };
                setDeviceStates(initialStates);
            } catch (error) {
                console.error('Failed to fetch initial device states:', error);
                setDeviceStates({ led_1: 'OFF', led_2: 'OFF', led_3: 'OFF' });
            } finally {
                setLoading(false);
            }
        };
        fetchInitialStates();
    }, []);

    const handleControl = async (device, status) => {
        try {
            await axios.post(`${API_URL}/api/control`, { device, status });
        } catch (error) {
            console.error('Error sending control command:', error);
        }
    };
    
    const updateDeviceState = (device, state) => {
        // Xử lý cho lệnh 'all'
        if (device === 'all') {
            setDeviceStates(prev => {
                const newState = { ...prev };
                Object.keys(newState).forEach(key => {
                    newState[key] = state.toUpperCase();
                });
                return newState;
            });
        } else {
            setDeviceStates(prev => ({ ...prev, [device]: state.toUpperCase() }));
        }
    };

    const value = { deviceStates, handleControl, loading, updateDeviceState };

    return (
        <DeviceStateContext.Provider value={value}>
            {children}
        </DeviceStateContext.Provider>
    );
};