const mqttService = require('../services/mqttService');
const DeviceActivity = require('../models/deviceActivity');
const DeviceState = require('../models/deviceState');

const sendCommand = async (req, res) => {
    const { device, status } = req.body;

    if (!device || !status) {
        return res.status(400).json({ error: 'Missing device or status' });
    }

    try {
        mqttService.publishControlMessage(device, status);

        // Ghi lại hành động vào database
        const newActivity = new DeviceActivity({ device, status });
        await DeviceState.findOneAndUpdate(
            { _id: device }, // Điều kiện tìm kiếm
            { status: status.toUpperCase() }, // Dữ liệu cập nhật
            { upsert: true, new: true } // Tùy chọn
        );
        
        await newActivity.save();
        res.status(200).json({ success: true, message: 'Command sent and activity logged' });
    } catch (error) {
        console.error('Error in sendCommand controller:', error);
        res.status(500).json({ error: 'Failed to send command' });
    }
};

const getDeviceStates = async (req, res) => {
    try {
        const states = await DeviceState.find({});
        // Chuyển đổi mảng trả về thành một đối tượng dễ dùng hơn cho frontend
        const statesMap = states.reduce((acc, curr) => {
            acc[curr._id] = curr.status;
            return acc;
        }, {});
        res.status(200).json(statesMap);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch device states' });
    }
};

module.exports = { sendCommand, getDeviceStates };