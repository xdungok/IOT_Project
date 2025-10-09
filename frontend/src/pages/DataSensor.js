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
    // State cho trang hiện tại
    const [currentPage, setCurrentPage] = useState(1);

    const fetchSensorHistory = useCallback((page) => {
        setLoading(true);
        const params = new URLSearchParams({
            page: page,
            limit: pageSize,
            sortOption: sortOption,
            searchField: searchField,
            searchValue: searchValue,
        });

        axios.get(`${API_URL}/api/history/sensors`, { params })
            .then(response => {
                setSensorHistory(response.data.data);
                setPagination(response.data.pagination);
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
    }, [pageSize, sortOption, searchField, searchValue]);

    useEffect(() => {
        fetchSensorHistory(currentPage);
    }, [currentPage, fetchSensorHistory]);
    
    // Các hàm xử lý sự kiện
    const handleSearch = (e) => {
        e.preventDefault();
        if (currentPage === 1) {
            fetchSensorHistory(1);
        } else {
            setCurrentPage(1);
        }
    };

    const handleFilterChange = (setter) => (e) => {
        setter(e.target.value);
        if (currentPage !== 1) {
            setCurrentPage(1);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= pagination.totalPages) {
            setCurrentPage(newPage);
        }
    };
    
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
            {/* Thanh Filter và Search */}
            <form className="data-sensor-header" onSubmit={handleSearch}>
                <select value={sortOption} onChange={handleFilterChange(setSortOption)}>
                    <option value="newest">Sắp xếp: Mới nhất</option>
                    <option value="oldest">Sắp xếp: Cũ nhất</option>
                    <option value="highest" disabled={isSortByValueDisabled}>Sắp xếp: Lớn nhất</option>
                    <option value="lowest" disabled={isSortByValueDisabled}>Sắp xếp: Nhỏ nhất</option>
                </select>

                <select value={searchField} onChange={handleFilterChange(setSearchField)}>
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

        {/* Bảng Dữ liệu */}
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
                                    {/* Sử dụng thông tin từ pagination để tính ID chính xác */}
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
                    {/* Phân trang */}
                    <div className="page-size-selector">
                        <label htmlFor="pageSize">Hàng/trang:</label>
                        <select id="pageSize" value={pageSize} onChange={handleFilterChange(setPageSize)}>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>

                    {/* Container để nhóm và căn giữa các nút điều khiển trang */}
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