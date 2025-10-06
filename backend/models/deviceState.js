const mongoose = require('mongoose');

// dùng deviceId làm khóa chính
const deviceStateSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    status: { type: String, required: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('DeviceState', deviceStateSchema);