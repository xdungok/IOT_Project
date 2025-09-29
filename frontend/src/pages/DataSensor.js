import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

const API_URL = 'http://localhost:3001';

function DataSensor() {
    const [sensorHistory, setSensorHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSensorHistory = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_URL}/api/history/sensors`);
                setSensorHistory(response.data);
            } catch (error) {
                console.error("Failed to fetch sensor history:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSensorHistory();
    }, []);

    if (loading) return <h2>Loading sensor data history...</h2>;

    return (
        <div>
            <h2>DATA SENSOR HISTORY</h2>
            <p>Hiển thị 50 bản ghi dữ liệu cảm biến gần nhất.</p>
            <table className="history-table">
                <thead>
                    <tr>
                        <th>Thời gian</th>
                        <th>Nhiệt độ (°C)</th>
                        <th>Độ ẩm (%)</th>
                        <th>Ánh sáng (Lux)</th>
                    </tr>
                </thead>
                <tbody>
                    {sensorHistory.map(dataPoint => (
                        <tr key={dataPoint._id}>
                            <td>{new Date(dataPoint.createdAt).toLocaleString('vi-VN')}</td>
                            <td>{dataPoint.temperature.toFixed(2)}</td>
                            <td>{dataPoint.humidity.toFixed(2)}</td>
                            <td>{dataPoint.light}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
export default DataSensor;