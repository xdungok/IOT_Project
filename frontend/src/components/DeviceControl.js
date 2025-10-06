import React from 'react';
import '../App.css';
import { CgSpinner } from 'react-icons/cg';

function DeviceControl({ label, device, state, onControl, icon, isPending }) {
    const isON = state === 'ON';

    const handleToggle = () => {
        // Không cho phép click khi đang chờ phản hồi
        if (isPending) return;
        
        const newStatus = isON ? 'OFF' : 'ON';
        onControl(device, newStatus);
    };
    
    // Logic render cho icon của quạt
    const fanIcon = <span className={`device-icon ${isON ? 'on spinning-icon' : ''}`}>{icon}</span>;

    // Logic render cho icon của đèn
    const lightIcon = <div className={`light-rays-container ${isON ? 'on' : ''}`}><span className={`device-icon ${isON ? 'on' : ''}`}>{icon}</span></div>;
    
    return (
        <div className={`device-control ${isPending ? 'pending' : ''}`}>
            <div className="device-info">
                {/* Chọn cách render icon dựa trên tên thiết bị */}
                {device === 'led_1' ? lightIcon : (device === 'led_3' ? fanIcon : (
                    // Dùng cách render mặc định cho các thiết bị khác
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
                    disabled={isPending} // Vô hiệu hóa checkbox khi đang chờ
                />
                <div className="switch-track">
                    <div className="switch-thumb">
                        {/* Hiển thị icon loading khi đang chờ */}
                        {isPending && <CgSpinner className="loading-spinner" />}
                    </div>
                </div>
            </label>
        </div>
    );
}

export default DeviceControl;