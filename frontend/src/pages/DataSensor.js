import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import '../App.css';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:3001';

function DataSensor() {
    // State quản lý dữ liệu và giao diện
    const [sensorHistory, setSensorHistory] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    
    // State cho các bộ lọc
    const [sortOption, setSortOption] = useState('newest');
    const [searchField, setSearchField] = useState('all');
    const [searchValue, setSearchValue] = useState('');
    
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    // Logic gọi API
    // useCallback để ghi nhớ hàm fetch, tránh tạo lại không cần thiết
    const fetchSensorHistory = useCallback((pageToFetch, currentFilters) => {
        setLoading(true);
        const params = new URLSearchParams({
            page: pageToFetch,
            limit: currentFilters.pageSize,
            sortOption: currentFilters.sortOption,
            searchField: currentFilters.searchField,
            searchValue: currentFilters.searchValue,
        });

        axios.get(`${API_URL}/api/history/sensors`, { params })
            .then(response => {
                setSensorHistory(response.data.data);
                setPagination(response.data.pagination);
                // Cập nhật lại currentPage để đồng bộ với kết quả từ server
                setCurrentPage(response.data.pagination.currentPage);
            })
            .catch(error => {
                console.error("Failed to fetch sensor history:", error);
                if (error.response && error.response.data.error) {
                    toast.error(error.response.data.error);
                }
                setSensorHistory([]);
                setPagination({});
            })
            .finally(() => {
                setLoading(false);
            });
    }, []); // Mảng rỗng: hàm này chỉ được tạo 1 lần

    // useEffect này sẽ chạy khi component mount lần đầu và khi các state TỰ ĐỘNG thay đổi
    useEffect(() => {
        const currentFilters = { pageSize, sortOption, searchField, searchValue };
        fetchSensorHistory(currentPage, currentFilters);
    }, [currentPage, pageSize, sortOption]); // Chỉ lắng nghe các state tự động
    
    // Các hàm xử lý sự kiện
    // Chỉ được kích hoạt bởi nút Search hoặc Enter
    const handleSearch = (e) => {
        e.preventDefault();
        const currentFilters = { pageSize, sortOption, searchField, searchValue };
        // Luôn tìm kiếm từ trang 1
        fetchSensorHistory(1, currentFilters);
    };

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= pagination.totalPages && newPage !== currentPage) {
            setCurrentPage(newPage); // Kích hoạt useEffect
        }
    };
    
    // Vô hiệu hóa tùy chọn sắp xếp "Lớn nhất", "Nhỏ nhất" khi không hợp lệ
    const isSortByValueDisabled = searchField === 'all' || searchField === 'time';
    
    // Phân trang
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
                    <select value={sortOption} onChange={(e) => { setSortOption(e.target.value); setCurrentPage(1); }}>
                        <option value="newest">Sắp xếp: Mới nhất</option>
                        <option value="oldest">Sắp xếp: Cũ nhất</option>
                        <option value="highest" disabled={isSortByValueDisabled}>Sắp xếp: Lớn nhất</option>
                        <option value="lowest" disabled={isSortByValueDisabled}>Sắp xếp: Nhỏ nhất</option>
                    </select>

                    {/* Filter này chỉ cập nhật state, không tìm kiếm */}
                    <select value={searchField} onChange={(e) => setSearchField(e.target.value)}>
                        <option value="all">Tìm theo: Tất cả</option>
                        <option value="time">Tìm theo: Thời gian</option>
                        <option value="temperature">Tìm theo: Nhiệt độ</option>
                        <option value="humidity">Tìm theo: Độ ẩm</option>
                        <option value="light">Tìm theo: Ánh sáng</option>
                    </select>

                    <input 
                        type="text"
                        placeholder="Nhập giá trị hoặc thời gian..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                    />
                    <button type="submit">Search</button>
                </form>
            </div>

            <div className="table-container">
                {loading ? (
                    <p style={{textAlign: 'center', paddingTop: '20px'}}>Loading sensor data history...</p>
                ) : (
                    <table className="history-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Ánh sáng (Lux)</th>
                                <th>Độ ẩm (%)</th>
                                <th>Nhiệt độ (°C)</th>
                                <th>Thời gian</th>
                            </tr>
                        </thead>
                        <tbody>
                                {sensorHistory.map((dataPoint, index) => (
                                    <tr key={dataPoint._id}>
                                        <td>{(pagination.currentPage - 1) * pagination.limit + index + 1}</td>
                                        <td>{dataPoint.light.toFixed(4)}</td>
                                        <td>{dataPoint.humidity.toFixed(1)}</td>
                                        <td>{dataPoint.temperature.toFixed(1)}</td>
                                        <td>{new Date(dataPoint.createdAt).toLocaleString('vi-VN')}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="page-footer">
                {!loading && sensorHistory.length > 0 && (
                    <div className="pagination">
                        <div className="page-size-selector">
                            <label htmlFor="pageSize">Hàng/trang:</label>
                            {/* Filter này cũng tự động tìm kiếm */}
                            <select id="pageSize" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}>
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

export default DataSensor;