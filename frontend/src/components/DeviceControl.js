import React from 'react';
import '../App.css';
import { CgSpinner } from 'react-icons/cg';

// THÊM isOffline vào danh sách props
function DeviceControl({ label, device, state, onControl, icon, isPending, isOffline }) {
    const isON = state === 'ON';

    const handleToggle = () => {
        // SỬ DỤNG isOffline trong điều kiện kiểm tra
        if (isPending || isOffline) return;
        
        const newStatus = isON ? 'OFF' : 'ON';
        onControl(device, newStatus);
    };
    
    // Cập nhật logic render icon để không có hiệu ứng 'on' khi offline
    const fanIcon = <span className={`device-icon ${isON && !isOffline ? 'on spinning-icon' : ''}`}>{icon}</span>;
    const lightIcon = <div className={`light-rays-container ${isON && !isOffline ? 'on' : ''}`}><span className={`device-icon ${isON && !isOffline ? 'on' : ''}`}>{icon}</span></div>;
    
    return (
        // Thêm class 'offline' vào div chính
        <div className={`device-control ${isPending ? 'pending' : ''} ${isOffline ? 'offline' : ''}`}>
            <div className="device-info">
                {/* Chọn cách render icon dựa trên tên thiết bị */}
                {device === 'led_1' ? lightIcon : (device === 'led_3' ? fanIcon : (
                    // Dùng cách render mặc định cho các thiết bị khác
                    <span className={`device-icon ${isON && !isOffline ? 'on' : ''}`}>{icon}</span>
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
                    // Vô hiệu hóa checkbox khi đang chờ hoặc offline
                    disabled={isPending || isOffline} 
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