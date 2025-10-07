const mqtt = require('mqtt');
const config = require('../config');
const SensorData = require('../models/sensorData');
const DeviceState = require('../models/deviceState');
const DeviceActivity = require('../models/deviceActivity');
const notificationService = require('./notificationService');

let mqttClient;
let isDeviceConnected = false;

// Nhận hàm broadcast từ websocketService
function init(broadcastCallback) {
    mqttClient = mqtt.connect(config.mqtt.brokerUrl, {
        username: config.mqtt.username,
        password: config.mqtt.password,
        reconnectPeriod: 1000,
        queue: false, // Vô hiệu hóa hàng đợi offline
        resubscribe: true
    });

    mqttClient.on('connect', () => {
        console.log('Connected to MQTT Broker!');
        mqttClient.subscribe([
            config.mqtt.topics.sensorData,
            config.mqtt.topics.deviceResponse,
            config.mqtt.topics.deviceStatus,
            'devices/get_states'
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
                const newSensorData = new SensorData(data);
                await newSensorData.save();
                broadcastCallback({ type: 'sensorData', payload: data, timestamp: new Date().toLocaleTimeString('vi-VN') });
                notificationService.processSensorData(data);
            } catch (error) {
                console.error('Error processing sensor data:', error);
            }
        }
        // Xử lý tin nhắn phản hồi trạng thái từ thiết bị
        else if (topic === config.mqtt.topics.deviceResponse) {
            try {
                const stateData = JSON.parse(payload.toString());
                console.log('Received device state feedback:', stateData);

                // Tìm hoạt động gần nhất đang 'pending' của thiết bị và cập nhật thành 'success'
                const pendingActivity = await DeviceActivity.findOneAndUpdate(
                    { device: stateData.device, result: 'pending' },
                    { result: 'success' },
                    { sort: { createdAt: -1 } } // Luôn chọn cái mới nhất để cập nhật
                );

                if (pendingActivity) {
                    console.log(`Command ${pendingActivity._id} for device '${stateData.device}' confirmed as successful.`);
                }

                // Đẩy ra WebSocket cho frontend cập nhật giao diện
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
        // Xử lý tin nhắn trạng thái online/offline (LWT)
        else if (topic === config.mqtt.topics.deviceStatus) {
            try {
                const statusMsg = JSON.parse(payload.toString());
                console.log('Received device status:', statusMsg);
                isDeviceConnected = (statusMsg.status === 'online');
                broadcastCallback({
                    type: 'deviceConnectionStatus',
                    payload: { deviceId: statusMsg.deviceId, status: statusMsg.status }
                });
            } catch (error) {
                console.error('Error processing device status:', error);
            }
        }
        // Xử lý yêu cầu lấy trạng thái cuối cùng từ thiết bị
        else if (topic === 'devices/get_states') {
            try {
                const states = await DeviceState.find({});
                const statesMap = states.reduce((acc, curr) => {
                    acc[curr._id] = curr.status;
                    return acc;
                }, {});
                const responsePayload = JSON.stringify(statesMap);
                mqttClient.publish('devices/state/response', responsePayload);
                console.log('Sent last known states to device:', responsePayload);
            } catch (error) {
                console.error('Error fetching and sending last states:', error);
            }
        }
    });

    mqttClient.on('error', (error) => console.error('MQTT Client error:', error));
}

function publishControlMessage(device, status) {
    const message = JSON.stringify({ device, status });
    const options = { qos: 1, retain: false };

    if (mqttClient.connected) {
        mqttClient.publish(config.mqtt.topics.deviceControl, message, options, (error) => {
            if (error) {
                console.error('Failed to publish control message (callback error):', error);
            } else {
                console.log(`Published to ${config.mqtt.topics.deviceControl}: ${message}`);
            }
        });
    } else {
        console.error('MQTT client not connected. Message publish was skipped.');
    }
}

// Hàm kiểm tra trạng thái kết nối của thiết bị
function getDeviceConnectionStatus() {
    return isDeviceConnected;
}

module.exports = {
    init,
    publishControlMessage,
    getDeviceConnectionStatus
};