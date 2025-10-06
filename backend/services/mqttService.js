const mqtt = require('mqtt');
const config = require('../config');
const SensorData = require('../models/sensorData');
const DeviceState = require('../models/deviceState');
const notificationService = require('./notificationService');

let mqttClient;

// Nhận hàm broadcast từ websocketService
function init(broadcastCallback) {
    mqttClient = mqtt.connect(config.mqtt.brokerUrl, {
        username: config.mqtt.username,
        password: config.mqtt.password,
    });

    mqttClient.on('connect', () => {
        console.log('Connected to MQTT Broker!');
        // Lắng nghe cả topic dữ liệu và topic phản hồi
        mqttClient.subscribe([
            config.mqtt.topics.sensorData,
            config.mqtt.topics.deviceResponse 
        ], (err) => {
            if (!err) {
                console.log(`Subscribed to topics.`);
            }
        });
    });

    mqttClient.on('message', async (topic, payload) => {
        // Xử lý dữ liệu cảm biến
        if (topic === config.mqtt.topics.sensorData) {
            try {
                const data = JSON.parse(payload.toString());
                // console.log('Received sensor data:', data);

                // Phân tích cảnh báo
                notificationService.processSensorData(data);

                // Lưu dữ liệu vào database
                const newSensorData = new SensorData(data);
                await newSensorData.save();

                // Đẩy dữ liệu real-time ra frontend
                broadcastCallback({ type: 'sensorData', payload: data, timestamp: new Date().toLocaleTimeString('vi-VN') });
            } catch (error) {
                console.error('Error processing sensor data:', error);
            }
        }
        // Xử lý tin nhắn phản hồi trạng thái từ thiết bị
        else if (topic === config.mqtt.topics.deviceResponse) {
            try {
                const stateData = JSON.parse(payload.toString());
                console.log('Received device state feedback:', stateData);

                // Đẩy thẳng ra WebSocket cho frontend xử lý
                broadcastCallback({
                    type: 'deviceStateUpdate',
                    payload: stateData
                });

                // Cập nhật trạng thái cuối cùng vào DB
                await DeviceState.findOneAndUpdate(
                    { _id: stateData.device },
                    { status: stateData.state.toUpperCase() },
                    { upsert: true }
                );
            } catch (error) {
                console.error('Error processing device state feedback:', error);
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