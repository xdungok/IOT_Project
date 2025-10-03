import React, { useState } from 'react';
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
    const { latestData, historicalData } = useWebSocket();
    // Lấy trạng thái và hàm điều khiển từ Context
    const { deviceStates, handleControl: contextHandleControl } = useDeviceState();
    
    // State để kích hoạt các hiệu ứng một lần
    const [showLightEffect, setShowLightEffect] = useState(false);
    const [showWindEffect, setShowWindEffect] = useState(false);
    const [showFanEffect, setShowFanEffect] = useState(false);

    // Bọc hàm handleControl của context lại để thêm logic hiệu ứng
    const handleControl = async (device, status) => {
        await contextHandleControl(device, status);

        if (status.toUpperCase() === 'ON') {
            if (device === 'led_1') { // Đèn
                setShowLightEffect(true);
                setTimeout(() => setShowLightEffect(false), 2000); // Animation kéo dài 2s
            }
            if (device === 'led_2') { // Điều hòa
                setShowWindEffect(true);
                setTimeout(() => setShowWindEffect(false), 4000); 
            }
            if (device === 'led_3') { // Quạt
                setShowFanEffect(true);
                setTimeout(() => setShowFanEffect(false), 2500);
            }
        }
    };

    return (
        <>
            {/* Render các hiệu ứng toàn màn hình */}
            {showLightEffect && <LightBulbEffect />}
            {showWindEffect && <WindEffect />}
            {showFanEffect && <SpinningFanEffect />}

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
                    value={`${latestData.light.toFixed(0)} LUX`} 
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