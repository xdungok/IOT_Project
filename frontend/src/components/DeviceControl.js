import React from 'react';
import '../App.css';

function DeviceControl({ label, device, state, onControl, icon }) {
    const isON = state === 'ON';

    const handleToggle = () => {
        // Xác định trạng thái mới sẽ được gửi đi
        const newStatus = isON ? 'OFF' : 'ON';
        onControl(device, newStatus);
    };
    
    return (
        <div className="device-control">
            <div className="device-info">
                {}
                <span className={`device-icon ${isON ? 'on' : ''}`}>{icon}</span>
                <p>{label}</p>
            </div>
            
            {}
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
            {}
        </div>
    );
}

export default DeviceControl;