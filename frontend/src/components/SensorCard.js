import React from 'react';

function SensorCard({ label, value, color, icon }) {
    return (
        <div className={`sensor-card ${color}`}>
            <div className="card-icon">{icon}</div>
            <div className="card-content">
                <p>{label}</p>
                <h3>{value}</h3>
            </div>
        </div>
    );
}

export default SensorCard;