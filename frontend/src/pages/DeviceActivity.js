import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3001';

function DeviceActivity() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_URL}/api/history/activity`);
                setActivities(response.data);
            } catch (error) {
                console.error("Failed to fetch activities:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, []);

    if (loading) return <p>Loading history...</p>;

    return (
        <div>
            <h2>DEVICE ACTIVITY HISTORY</h2>
            <table className="history-table">
                <thead>
                    <tr>
                        <th>Thời gian</th>
                        <th>Thiết bị</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {activities.map(activity => (
                        <tr key={activity._id}>
                            <td>{new Date(activity.createdAt).toLocaleString('vi-VN')}</td>
                            <td>{activity.device}</td>
                            <td>{activity.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
export default DeviceActivity;