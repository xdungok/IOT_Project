const mqttService = require('../services/mqttService');
const DeviceActivity = require('../models/deviceActivity');

const sendCommand = async (req, res) => {
    const { device, status } = req.body;

    if (!device || !status) {
        return res.status(400).json({ error: 'Missing device or status' });
    }

    try {
        mqttService.publishControlMessage(device, status);

        // Ghi lại hành động vào database
        const newActivity = new DeviceActivity({ device, status });
        await newActivity.save();

        res.status(200).json({ success: true, message: 'Command sent and activity logged' });
    } catch (error) {
        console.error('Error in sendCommand controller:', error);
        res.status(500).json({ error: 'Failed to send command' });
    }
};

module.exports = { sendCommand };