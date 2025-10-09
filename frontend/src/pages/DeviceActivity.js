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
    // State quản lý dữ liệu và giao diện
    const [activities, setActivities] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    
    // State cho các bộ lọc
    const [filterDevice, setFilterDevice] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [searchTime, setSearchTime] = useState('');
    
    // State cho phân trang và kích thước trang
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    // useCallback để tối ưu hóa, tránh tạo lại hàm fetchActivities mỗi lần render
    const fetchActivities = useCallback(async (pageToFetch) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pageToFetch,
                limit: pageSize,
                sortBy: 'createdAt', // Luôn sắp xếp theo thời gian mới nhất
                order: 'desc',
                filterDevice: filterDevice,
                filterStatus: filterStatus,
                searchTime: searchTime,
            });

            const response = await axios.get(`${API_URL}/api/history/activity`, { params });
            
            setActivities(response.data.data);
            setPagination(response.data.pagination);
            
        } catch (error) {
            console.error("Failed to fetch activities:", error);
            if (error.response && error.response.data.error) {
                toast.error(error.response.data.error);
            }
            setActivities([]);
            setPagination({});
        } finally {
            setLoading(false);
        }
    }, [pageSize, filterDevice, filterStatus, searchTime]); // Phụ thuộc vào các bộ lọc

    // useEffect này sẽ chạy khi trang thay đổi, hoặc khi các bộ lọc thay đổi
    useEffect(() => {
        fetchActivities(currentPage);
    }, [currentPage, fetchActivities]);
    
    // Các hàm xử lý sự kiện
    const handleSearch = (e) => {
        e.preventDefault(); // Ngăn form submit và tải lại trang
        if (currentPage === 1) {
            fetchActivities(1);
        } else {
            setCurrentPage(1); // Nếu khác trang 1, việc set state này sẽ kích hoạt useEffect
        }
    };

    // Hàm chung để xử lý thay đổi filter và pageSize
    const handleFilterChange = (setter) => (e) => {
        setter(e.target.value);
        // Khi thay đổi bất kỳ bộ lọc nào, quay về trang đầu tiên
        if (currentPage !== 1) {
            setCurrentPage(1);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= pagination.totalPages && newPage !== currentPage) {
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
                    <select value={filterDevice} onChange={handleFilterChange(setFilterDevice)}>
                        <option value="">Tất cả thiết bị</option>
                        <option value="led_1">Đèn</option>
                        <option value="led_2">Điều hòa</option>
                        <option value="led_3">Quạt</option>
                    </select>

                    <select value={filterStatus} onChange={handleFilterChange(setFilterStatus)}>
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
                            <select id="pageSizeActivity" value={pageSize} onChange={handleFilterChange(setPageSize)}>
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