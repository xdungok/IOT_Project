import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import '../App.css';

const API_URL = 'http://localhost:3001';

function DataSensor() {
    // State quản lý dữ liệu và giao diện
    const [sensorHistory, setSensorHistory] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    
    // State cho các bộ lọc
    const [sortOption, setSortOption] = useState('createdAt_desc'); // Mặc định: Mới nhất
    const [searchType, setSearchType] = useState('');
    const [searchValue, setSearchValue] = useState('');
    
    // State cho trang hiện tại
    const [currentPage, setCurrentPage] = useState(1);

    // useCallback để tránh tạo lại hàm fetchSensorHistory mỗi lần render
    const fetchSensorHistory = useCallback(async (page, sort, search) => {
        try {
            setLoading(true);

            // Xây dựng các tham số cho URL
            const params = new URLSearchParams({
                page: page,
                limit: 10,
            });

            // Xử lý tham số sắp xếp
            const [sortBy, order] = sort.split('_');
            params.append('sortBy', sortBy);
            params.append('order', order);
            
            // Xử lý tham số tìm kiếm
            if (search.type && search.value) {
                params.append('searchType', search.type);
                params.append('searchValue', search.value);
            }

            // Gọi API với các tham số đã xây dựng
            const response = await axios.get(`${API_URL}/api/history/sensors`, { params });
            
            setSensorHistory(response.data.data);
            setPagination(response.data.pagination);
            setCurrentPage(response.data.pagination.currentPage);

        } catch (error) {
            console.error("Failed to fetch sensor history:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // useEffect để gọi API lần đầu tiên khi component được mount
    useEffect(() => {
        fetchSensorHistory(currentPage, sortOption, { type: searchType, value: searchValue });
    }, [fetchSensorHistory, currentPage, sortOption]);
    
    // Các hàm xử lý sự kiện
    const handleSearch = () => {
        setCurrentPage(1); 
        fetchSensorHistory(1, sortOption, { type: searchType, value: searchValue });
    };

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= pagination.totalPages) {
            setCurrentPage(newPage);
        }
    };
    
    // Phân trang
    const renderPaginationButtons = () => {
        const buttons = [];
        const totalPages = pagination.totalPages || 1;
        
        for (let i = 1; i <= totalPages; i++) {
            // Hiển thị tối đa 5 nút số trang
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
            <h2>DATASENSOR</h2>
            
            {/* Thanh Filter và Search */}
            <div className="data-sensor-header">
                <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                    <option value="createdAt_desc">Sắp xếp: Mới nhất</option>
                    <option value="createdAt_asc">Sắp xếp: Cũ nhất</option>
                    <option value="temperature_desc">Nhiệt độ: Giảm dần</option>
                    <option value="temperature_asc">Nhiệt độ: Tăng dần</option>
                    <option value="humidity_desc">Độ ẩm: Giảm dần</option>
                    <option value="humidity_asc">Độ ẩm: Tăng dần</option>
                    <option value="light_desc">Ánh sáng: Giảm dần</option>
                    <option value="light_asc">Ánh sáng: Tăng dần</option>
                </select>

                <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                    <option value="">Loại tìm kiếm</option>
                    <option value="time">Thời gian</option>
                    <option value="temperature">Nhiệt độ (&gt;=)</option>
                    <option value="humidity">Độ ẩm (&gt;=)</option>
                    <option value="light">Ánh sáng (&gt;=)</option>
                </select>

                <input 
                    type="text"
                    placeholder="Nhập giá trị hoặc thời gian..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                />

                <button onClick={handleSearch}>Search</button>
            </div>

            {/* Bảng Dữ liệu */}
            {loading ? (
                <p>Loading sensor data history...</p>
            ) : (
                <>
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
                                    <td>{(currentPage - 1) * 10 + index + 1}</td>
                                    <td>{dataPoint.light}</td>
                                    <td>{dataPoint.humidity.toFixed(1)}</td>
                                    <td>{dataPoint.temperature.toFixed(1)}</td>
                                    <td>{new Date(dataPoint.createdAt).toLocaleString('vi-VN')}</td>
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

export default DataSensor;