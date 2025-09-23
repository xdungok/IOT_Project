const mongoose = require('mongoose');

const deviceActivitySchema = new mongoose.Schema({
    device: { type: String, required: true },
    status: { type: String, required: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('DeviceActivity', deviceActivitySchema);