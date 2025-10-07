const mongoose = require('mongoose');

const deviceActivitySchema = new mongoose.Schema({
    device: { type: String, required: true },
    status: { type: String, required: true },
    result: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' }
}, {
    timestamps: true
});

module.exports = mongoose.model('DeviceActivity', deviceActivitySchema);