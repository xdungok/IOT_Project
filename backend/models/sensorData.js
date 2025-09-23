const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema({
    temperature: { type: Number, required: true },
    humidity: { type: Number, required: true },
    light: { type: Number, required: true }
}, {
    timestamps: true 
});

module.exports = mongoose.model('SensorData', sensorDataSchema);