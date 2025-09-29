import React, { useState } from 'react';
import axios from 'axios';
import { useWebSocket } from '../context/WebSocketContext';
import SensorCard from '../components/SensorCard';
import DeviceControl from '../components/DeviceControl';
import DataChart from '../components/DataChart';
import { FaThermometerHalf, FaTint, FaSun, FaLightbulb, FaFan, FaSnowflake } from 'react-icons/fa';

const API_URL = 'http://localhost:3001';

function Dashboard() {
    const { latestData, historicalData } = useWebSocket();
    const [deviceStates, setDeviceStates] = useState({ 
        led_1: 'OFF',
        led_2: 'OFF',
        led_3: 'OFF'
    });

    const handleControl = async (device, status) => {
        try {
            await axios.post(`${API_URL}/api/control`, { device, status }, {
            });
            setDeviceStates(prev => ({ ...prev, [device]: status.toUpperCase() }));
        } catch (error) {
            console.error('Error sending control command:', error);
        }
    };
    
    return (
        <>
            <section className="sensor-cards">
                <SensorCard 
                    label="Nhiệt độ" 
                    value={`${latestData.temperature.toFixed(1)} °C`} 
                    color="blue" 
                    icon={<FaThermometerHalf />}
                />
                <SensorCard 
                    label="Độ ẩm" 
                    value={`${latestData.humidity.toFixed(1)} %`}
                    color="pink"
                    icon={<FaTint />}
                />
                <SensorCard 
                    label="Ánh sáng" 
                    value={`${latestData.light} LUX`}
                    color="orange"
                    icon={<FaSun />}
                />
            </section>
            <section className="main-panel">
                <div className="chart-container">
                    <DataChart data={historicalData} />
                </div>
                <div className="device-controls">
                    <DeviceControl 
                        label="Đèn" 
                        device="led_1" 
                        state={deviceStates.led_1} 
                        onControl={handleControl}
                        icon={<FaLightbulb />}
                    />
                    <DeviceControl 
                        label="Điều hòa" 
                        device="led_2" 
                        state={deviceStates.led_2} 
                        onControl={handleControl}
                        icon={<FaSnowflake />}
                    />
                    <DeviceControl 
                        label="Quạt" 
                        device="led_3" 
                        state={deviceStates.led_3} 
                        onControl={handleControl}
                        icon={<FaFan />}
                    />
                </div>
            </section>
        </>
    );
}

export default Dashboard;