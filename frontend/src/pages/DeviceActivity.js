import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import '../App.css';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:3001';

const deviceNameMap = {
    'led_1': 'Đèn',
    'led_2': 'Điều hòa',
    'led_3': 'Quạt'
};

function DeviceActivity() {
    const [activities, setActivities] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    
    const [filterDevice, setFilterDevice] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [searchTime, setSearchTime] = useState('');
    
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    // useCallback bây giờ nhận currentPage và các filter tự động
    const fetchActivities = useCallback((pageToFetch, currentFilters) => {
        setLoading(true);
        const params = new URLSearchParams({
            page: pageToFetch,
            limit: currentFilters.pageSize,
            sortBy: 'createdAt',
            order: 'desc',
            filterDevice: currentFilters.filterDevice,
            filterStatus: currentFilters.filterStatus,
            searchTime: currentFilters.searchTime, // searchTime sẽ được truyền vào khi search
        });

        axios.get(`${API_URL}/api/history/activity`, { params })
            .then(response => {
                setActivities(response.data.data);
                setPagination(response.data.pagination);
            })
            .catch(error => {
                console.error("Failed to fetch activities:", error);
                if (error.response && error.response.data.error) {
                    toast.error(error.response.data.error);
                }
                setActivities([]);
                setPagination({});
            })
            .finally(() => {
                setLoading(false);
            });
    }, []); // Mảng rỗng: hàm này chỉ được tạo 1 lần

    // useEffect này sẽ lắng nghe các thay đổi "tự động"
    useEffect(() => {
        // Khi các filter tự động thay đổi, searchTime sẽ được reset về rỗng
        const currentFilters = { pageSize, filterDevice, filterStatus, searchTime: '' };
        fetchActivities(currentPage, currentFilters);
    }, [currentPage, pageSize, filterDevice, filterStatus, fetchActivities]);
    
    // Xử lý khi nhấn nút Search hoặc Enter
    const handleSearch = (e) => {
        e.preventDefault();
        const currentFilters = { pageSize, filterDevice, filterStatus, searchTime };
        // Luôn tìm kiếm từ trang 1
        fetchActivities(1, currentFilters);
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
            if (i >= currentPage - 2 && i <= currentPage + 2 && i > 0 && i <= totalPages) {
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
        <div className="page-container">
            <div className="page-header">
                <form className="data-sensor-header" onSubmit={handleSearch}>
                    {/* Filter này sẽ tự động tìm kiếm */}
                    <select value={filterDevice} onChange={(e) => { setFilterDevice(e.target.value); if(currentPage !== 1) setCurrentPage(1); }}>
                        <option value="">Tất cả thiết bị</option>
                        <option value="led_1">Đèn</option>
                        <option value="led_2">Điều hòa</option>
                        <option value="led_3">Quạt</option>
                    </select>

                    {/* Filter này cũng sẽ tự động tìm kiếm */}
                    <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); if(currentPage !== 1) setCurrentPage(1); }}>
                        <option value="">Tất cả hành động</option>
                        <option value="ON">Bật</option>
                        <option value="OFF">Tắt</option>
                    </select>

                    {/* Ô nhập này chỉ cập nhật state, không tìm kiếm */}
                    <input 
                        type="text"
                        placeholder="HH:mm DD/MM/YYYY"
                        value={searchTime}
                        onChange={(e) => setSearchTime(e.target.value)}
                    />

                    <button type="submit">Search</button>
                </form>
            </div>

                <div className="table-container">
                    {loading ? (
                        <p style={{textAlign: 'center', paddingTop: '20px'}}>Loading activity history...</p>
                    ) : (
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
                                    <tr key={activity._id} className={activity.result === 'failed' ? 'activity-failed' : ''}>
                                        <td>{(pagination.currentPage - 1) * pagination.limit + index + 1}</td>
                                        <td>{deviceNameMap[activity.device] || activity.device}</td>
                                        <td>{activity.status === 'ON' ? 'Bật' : 'Tắt'}</td>
                                        <td>{new Date(activity.createdAt).toLocaleString('vi-VN')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="page-footer">
                {!loading && activities.length > 0 && (
                    <div className="pagination">
                        <div className="page-size-selector">
                            <label htmlFor="pageSizeActivity">Hàng/trang:</label>
                             {/* Filter này cũng tự động tìm kiếm */}
                            <select id="pageSizeActivity" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); if(currentPage !== 1) setCurrentPage(1); }}>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                        </div>

                            <div className="pagination-controls">
                                <button onClick={() => handlePageChange(1)} disabled={currentPage === 1}>First</button>
                                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
                                {renderPaginationButtons()}
                                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === pagination.totalPages || !pagination.totalPages}>Next</button>
                                <button onClick={() => handlePageChange(pagination.totalPages)} disabled={currentPage === pagination.totalPages || !pagination.totalPages}>Last</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    export default DeviceActivity;