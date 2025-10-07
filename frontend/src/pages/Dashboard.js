import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import { useDeviceState } from '../context/DeviceStateContext';
import SensorCard from '../components/SensorCard';
import DeviceControl from '../components/DeviceControl';
import DataChart from '../components/DataChart';
import { FaThermometerHalf, FaTint, FaSun, FaLightbulb, FaFan, FaSnowflake } from 'react-icons/fa';
import LightBulbEffect from '../components/LightBulbEffect';
import WindEffect from '../components/WindEffect';
import SpinningFanEffect from '../components/SpinningFanEffect';

function Dashboard() {
    const { latestData, historicalData, isDeviceOffline } = useWebSocket();
    // Lấy trạng thái và hàm điều khiển từ Context
    const { deviceStates, handleControl: contextHandleControl, loading: devicesLoading } = useDeviceState();
    
    // State để kích hoạt các hiệu ứng một lần
    const [pendingDevices, setPendingDevices] = useState({});
    const [showLightEffect, setShowLightEffect] = useState(false);
    const [showWindEffect, setShowWindEffect] = useState(false);
    const [showFanEffect, setShowFanEffect] = useState(false);

    const handleControl = (device, status) => {
        // Set pending và gọi hàm context
        setPendingDevices(prev => ({ ...prev, [device]: true }));
        contextHandleControl(device, status);
    };

    // useEffect để xử lý khi có trạng thái mới được xác nhận từ WebSocket
    useEffect(() => {
        Object.keys(deviceStates).forEach(device => {
            if (pendingDevices[device]) {
                setPendingDevices(prev => ({ ...prev, [device]: false }));
                if (deviceStates[device] === 'ON') {
                    if (device === 'led_1') {
                        setShowLightEffect(true);
                        setTimeout(() => setShowLightEffect(false), 2000);
                    }
                    if (device === 'led_2') {
                        setShowWindEffect(true);
                        setTimeout(() => setShowWindEffect(false), 4000); 
                    }
                    if (device === 'led_3') {
                        setShowFanEffect(true);
                        setTimeout(() => setShowFanEffect(false), 2500);
                    }
                }
            }
        });
    }, [deviceStates]);

    if (devicesLoading) {
        return <h2 style={{ textAlign: 'center', marginTop: '40px' }}>Loading Device States...</h2>;
    }

    return (
        <>
            {showLightEffect && <LightBulbEffect />}
            {showWindEffect && <WindEffect />}
            {showFanEffect && <SpinningFanEffect />}
            
            {isDeviceOffline && <div style={{backgroundColor: '#ffc107', color: '#343a40', textAlign: 'center', fontWeight: 'bold', padding: '10px', borderRadius: '8px', marginBottom: '15px'}}>Cảnh báo: Thiết bị đang offline!</div>}

            <section className="sensor-cards">
                <SensorCard label="Nhiệt độ" value={`${latestData.temperature.toFixed(1)} °C`} color="blue" icon={<FaThermometerHalf />}/>
                <SensorCard label="Độ ẩm" value={`${latestData.humidity.toFixed(1)} %`} color="pink" icon={<FaTint />}/>
                <SensorCard label="Ánh sáng" value={`${latestData.light.toFixed(2)} LUX`} color="orange" icon={<FaSun />}/>
            </section>
            <section className="main-panel">
                <div className="chart-container">
                    <DataChart data={historicalData} />
                </div>
                <div className="device-controls">
                    <DeviceControl label="Đèn" device="led_1" state={deviceStates.led_1} onControl={handleControl} icon={<FaLightbulb />} isPending={pendingDevices['led_1']} isOffline={isDeviceOffline} />
                    <DeviceControl label="Điều hòa" device="led_2" state={deviceStates.led_2} onControl={handleControl} icon={<FaSnowflake />} isPending={pendingDevices['led_2']} isOffline={isDeviceOffline} />
                    <DeviceControl label="Quạt" device="led_3" state={deviceStates.led_3} onControl={handleControl} icon={<FaFan />} isPending={pendingDevices['led_3']} isOffline={isDeviceOffline} />
                </div>
            </section>
        </>
    );
}

export default Dashboard;