const mqtt = require('mqtt');
const config = require('../config');
const SensorData = require('../models/sensorData');

let mqttClient;

// Nhận hàm broadcast từ websocketService
function init(broadcastCallback) {
    mqttClient = mqtt.connect(config.mqtt.brokerUrl, {
        username: config.mqtt.username,
        password: config.mqtt.password,
    });

    mqttClient.on('connect', () => {
        console.log('Connected to MQTT Broker!');
        mqttClient.subscribe(config.mqtt.topics.sensorData, (err) => {
            if (!err) {
                console.log(`Subscribed to topic: ${config.mqtt.topics.sensorData}`);
            }
        });
    });

    mqttClient.on('message', async (topic, payload) => {
    if (topic === config.mqtt.topics.sensorData) {
        try {
            const data = JSON.parse(payload.toString());
            console.log('Received sensor data:', data);

            // Lưu dữ liệu vào database
            const newSensorData = new SensorData(data);
            await newSensorData.save();

            // Đẩy dữ liệu real-time ra frontend
            broadcastCallback({
                type: 'sensorData',
                payload: data,
                timestamp: new Date().toLocaleTimeString('vi-VN')
            });
        } catch (error) {
            console.error('Error processing sensor data:', error);
        }
    }
});

    mqttClient.on('error', (error) => console.error('MQTT Client error:', error));
}

function publishControlMessage(device, status) {
    const message = JSON.stringify({ device, status });
    mqttClient.publish(config.mqtt.topics.deviceControl, message, (err) => {
        if (err) {
            console.error('Failed to publish control message:', err);
        } else {
            console.log(`Published to ${config.mqtt.topics.deviceControl}: ${message}`);
        }
    });
}

module.exports = {
    init,
    publishControlMessage
};