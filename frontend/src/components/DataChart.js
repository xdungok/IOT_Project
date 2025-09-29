import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function DataChart({ data }) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="temperature" name="Nhiệt độ(°C)" stroke="#ff0000" />
                <Line type="monotone" dataKey="humidity" name="Độ ẩm(%)" stroke="#8884d8" />
                {}
                <Line type="monotone" dataKey="light" name="Ánh sáng(Lux/10)" stroke="#82ca9d" />
            </LineChart>
        </ResponsiveContainer>
    );
}

export default DataChart;