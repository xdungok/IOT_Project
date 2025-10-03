import React from 'react';
import '../App.css';

function DeviceControl({ label, device, state, onControl, icon }) {
    const isON = state === 'ON';

    const handleToggle = () => {
        // Xác định trạng thái mới sẽ được gửi đi
        const newStatus = isON ? 'OFF' : 'ON';
        onControl(device, newStatus);
    };
    
    // Logic render cho icon của quạt
    const fanIcon = (
        <span className={`device-icon ${isON ? 'on' : ''} ${isON ? 'spinning-icon' : ''}`}>
            {icon}
        </span>
    );

    // Logic render cho icon của đèn
    const lightIcon = (
        <div className={`light-rays-container ${isON ? 'on' : ''}`}>
            <span className={`device-icon ${isON ? 'on' : ''}`}>{icon}</span>
        </div>
    );
    
    return (
        <div className="device-control">
            <div className="device-info">
                {/* Render icon dựa trên tên thiết bị */}
                {device === 'led_1' ? lightIcon : (device === 'led_3' ? fanIcon : (
                    <span className={`device-icon ${isON ? 'on' : ''}`}>{icon}</span>
                ))}
                <p>{label}</p>
            </div>
            
            {/* Cần gạt */}
            <label className="toggle-switch">
                <input 
                    type="checkbox" 
                    className="switch-checkbox"
                    checked={isON} 
                    onChange={handleToggle} 
                />
                <div className="switch-track">
                    <div className="switch-thumb"></div>
                </div>
            </label>
        </div>
    );
}

export default DeviceControl;