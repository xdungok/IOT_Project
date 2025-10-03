import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import '../App.css';

const API_URL = 'http://localhost:3001';

const deviceNameMap = {
    'led_1': 'Đèn',
    'led_2': 'Điều hòa',
    'led_3': 'Quạt'
};

function DeviceActivity() {
    // State quản lý dữ liệu và giao diện
    const [activities, setActivities] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    
    // State cho các bộ lọc
    const [filterDevice, setFilterDevice] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [searchTime, setSearchTime] = useState('');
    
    const [currentPage, setCurrentPage] = useState(1);

    // Gọi API
    const fetchActivities = useCallback(async (page, filters) => {
        try {
            setLoading(true);

            const params = new URLSearchParams({
                page: page,
                limit: 10,
                sortBy: 'createdAt', // Mặc định: Sắp xếp theo thời gian mới nhất
                order: 'desc',
            });

            if (filters.device) params.append('filterDevice', filters.device);
            if (filters.status) params.append('filterStatus', filters.status);
            if (filters.time) params.append('searchTime', filters.time);

            const response = await axios.get(`${API_URL}/api/history/activity`, { params });
            
            setActivities(response.data.data);
            setPagination(response.data.pagination);
            setCurrentPage(response.data.pagination.currentPage);

        } catch (error) {
            console.error("Failed to fetch activities:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchActivities(currentPage, { device: filterDevice, status: filterStatus, time: searchTime });
    }, [fetchActivities, currentPage]);
    
    // Các hàm xử lý sự kiện
    const handleSearch = () => {
        setCurrentPage(1);
        fetchActivities(1, { device: filterDevice, status: filterStatus, time: searchTime });
    };

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= pagination.totalPages) {
            setCurrentPage(newPage);
        }
    };
    
    const renderPaginationButtons = () => {
        const buttons = [];
        const totalPages = pagination.totalPages || 1;
        
        for (let i = 1; i <= totalPages; i++) {
            if (i >= currentPage - 2 && i <= currentPage + 2) {
                buttons.push(
                    <button 
                        key={i} 
                        onClick={() => handlePageChange(i)}
                        className={i === currentPage ? 'active' : ''}
                    >
                        {i}
                    </button>
                );
            }
        }
        return buttons;
    };

    // Render giao diện
    return (
        <div>
            {/* Thanh Filter và Search */}
            <div className="data-sensor-header">
                <select value={filterDevice} onChange={(e) => setFilterDevice(e.target.value)}>
                    <option value="">Tất cả thiết bị</option>
                    <option value="led_1">Đèn</option>
                    <option value="led_2">Điều hòa</option>
                    <option value="led_3">Quạt</option>
                </select>

                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="">Tất cả hành động</option>
                    <option value="ON">Bật</option>
                    <option value="OFF">Tắt</option>
                </select>

                <input 
                    type="text"
                    placeholder="HH:mm DD/MM/YYYY"
                    value={searchTime}
                    onChange={(e) => setSearchTime(e.target.value)}
                />

                <button onClick={handleSearch}>Search</button>
            </div>

            {/* Bảng Dữ liệu */}
            {loading ? (
                <p>Loading activity history...</p>
            ) : (
                <>
                    <table className="history-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Thiết bị</th>
                                <th>Hành động</th>
                                <th>Thời gian</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activities.map((activity, index) => (
                                <tr key={activity._id}>
                                    <td>{(currentPage - 1) * 10 + index + 1}</td>
                                    <td>{deviceNameMap[activity.device] || activity.device}</td>
                                    <td>{activity.status === 'ON' ? 'Bật' : 'Tắt'}</td>
                                    <td>{new Date(activity.createdAt).toLocaleString('vi-VN')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Phân trang */}
                    <div className="pagination">
                        <button onClick={() => handlePageChange(1)} disabled={currentPage === 1}>First</button>
                        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
                        {renderPaginationButtons()}
                        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === pagination.totalPages}>Next</button>
                        <button onClick={() => handlePageChange(pagination.totalPages)} disabled={currentPage === pagination.totalPages}>Last</button>
                    </div>
                </>
            )}
        </div>
    );
}

export default DeviceActivity;