const mqttService = require('../services/mqttService');
const DeviceActivity = require('../models/deviceActivity');
const DeviceState = require('../models/deviceState');

const sendCommand = async (req, res) => {
    const { device, status } = req.body;

    if (!device || !status) {
        return res.status(400).json({ error: 'Missing device or status' });
    }

    try {
        // Tạo một bản ghi hoạt động với trạng thái "pending"
        const newActivity = new DeviceActivity({ device, status, result: 'pending' });
        await newActivity.save();

        // Gửi lệnh đi tới MQTT Broker
        mqttService.publishControlMessage(device, status);
        
        // Đặt một bộ đếm thời gian để kiểm tra
        setTimeout(async () => {
            const activity = await DeviceActivity.findById(newActivity._id);
            // Chỉ cập nhật nếu trạng thái vẫn là "pending"
            if (activity && activity.result === 'pending') {
                console.warn(`Command ${activity._id} for device '${device}' timed out. Marking as failed.`);
                activity.result = 'failed';
                await activity.save();
            }
        }, 10000); // 10 giây timeout

        // Trả về mã 202 Accepted, báo cho frontend biết lệnh đã được chấp nhận để xử lý
        res.status(202).json({ success: true, message: 'Command accepted and is being processed.' });

    } catch (error) {
        console.error('Error in sendCommand controller:', error);
        res.status(500).json({ error: 'Failed to process command' });
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