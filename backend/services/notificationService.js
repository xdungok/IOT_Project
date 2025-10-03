const config = require('../config');

// Cấu hình ngưỡng cảnh báo
const THRESHOLDS = {
    temperature: { low: 18, high: 37, sudden: 3, fluctuation: 2 },
    humidity: { low: 30, high: 90, sudden: 10, fluctuation: 5 },
    light: { low: 50, high: 20000, sudden: 5000, fluctuation: 2000 }
};

const COOLDOWNS = { // in milliseconds
    threshold: 2 * 60 * 1000,   // 2 phút
    sudden: 30 * 1000,          // 30 giây
    fluctuation: 5 * 60 * 1000, // 5 phút
};

// Biến lưu trữ trạng thái của các cảm biến
const sensorStates = {
    temperature: createInitialState(),
    humidity: createInitialState(),
    light: createInitialState()
};

let broadcastCallback; // Hàm gửi thông báo qua WebSocket

function createInitialState() {
    return {
        previousValue: null,
        breachCounter: 0, // Đếm số lần liên tiếp vượt ngưỡng
        normalCounter: 0, // Đếm số lần liên tiếp trong ngưỡng
        fluctuationHistory: [], // Lưu lịch sử 20 lần thay đổi gần nhất
        isAlarmActive: false, // Cờ báo hiệu đang có cảnh báo
        lastNotificationTime: { // Lưu thời điểm gửi cảnh báo cuối cùng
            threshold: 0,
            sudden: 0,
            fluctuation: 0,
        }
    };
}

// Hàm khởi tạo, nhận hàm broadcast từ bên ngoài
function init(callback) {
    broadcastCallback = callback;
}

// Hàm gửi thông báo
function sendNotification(type, message) {
    if (broadcastCallback) {
        broadcastCallback({
            type: 'notification',
            payload: {
                id: Date.now(), // ID duy nhất cho mỗi thông báo
                type, // 'warning', 'info'
                message,
                time: new Date().toLocaleTimeString('vi-VN')
            }
        });
        console.log(`NOTIFICATION SENT: ${message}`);
    }
}

// Các hàm kiểm tra logic 

function checkThresholdBreach(sensor, value, state) {
    const now = Date.now();
    const config = THRESHOLDS[sensor];
    
    if (value < config.low || value > config.high) {
        state.breachCounter++;
        state.normalCounter = 0;
        if (state.breachCounter === 2 && (now - state.lastNotificationTime.threshold > COOLDOWNS.threshold)) {
            const direction = value < config.low ? 'thấp' : 'cao';
            sendNotification('warning', `Cảnh báo: ${sensor} vượt ngưỡng ${direction} (${value.toFixed(1)})`);
            state.lastNotificationTime.threshold = now;
            state.isAlarmActive = true;
        }
    } else {
        state.breachCounter = 0;
        state.normalCounter++;
        if (state.isAlarmActive && state.normalCounter === 3) {
            sendNotification('info', `Thông báo: ${sensor} đã trở lại trạng thái bình thường.`);
            state.isAlarmActive = false; // Reset cờ cảnh báo
        }
    }
}

function checkSuddenChange(sensor, value, state) {
    if (state.previousValue === null) return;

    const now = Date.now();
    const delta = Math.abs(value - state.previousValue);
    const config = THRESHOLDS[sensor];

    if (delta > config.sudden && (now - state.lastNotificationTime.sudden > COOLDOWNS.sudden)) {
        sendNotification('warning', `Cảnh báo: ${sensor} thay đổi đột ngột (${delta.toFixed(1)})`);
        state.lastNotificationTime.sudden = now;
        state.isAlarmActive = true;
    }
}

function checkFluctuation(sensor, value, state) {
    if (state.previousValue === null) return;

    const now = Date.now();
    const delta = Math.abs(value - state.previousValue);
    const config = THRESHOLDS[sensor];

    // Cập nhật lịch sử dao động
    state.fluctuationHistory.push(delta);
    if (state.fluctuationHistory.length > 20) {
        state.fluctuationHistory.shift(); // Giữ lại 20 phần tử gần nhất
    }

    // Chỉ kiểm tra khi có đủ 20 mẫu
    if (state.fluctuationHistory.length === 20) {
        const excessiveFluctuations = state.fluctuationHistory.filter(d => d > config.fluctuation).length;
        if (excessiveFluctuations > 10 && (now - state.lastNotificationTime.fluctuation > COOLDOWNS.fluctuation)) {
            sendNotification('warning', `Cảnh báo: ${sensor} dao động liên tục bất thường.`);
            state.lastNotificationTime.fluctuation = now;
            state.isAlarmActive = true;
            state.fluctuationHistory = []; // Reset lịch sử sau khi cảnh báo
        }
    }
}

function processSensorData(data) {
    // Lặp qua từng loại cảm biến (temperature, humidity, light)
    Object.keys(data).forEach(sensor => {
        if (sensorStates[sensor]) {
            const value = data[sensor];
            const state = sensorStates[sensor];

            // Chạy các hàm kiểm tra
            checkThresholdBreach(sensor, value, state);
            checkSuddenChange(sensor, value, state);
            checkFluctuation(sensor, value, state);

            // Cập nhật giá trị cuối cùng
            state.previousValue = value;
        }
    });
}

module.exports = {
    init,
    processSensorData
};