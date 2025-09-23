require('dotenv').config();

const http = require('http');
const app = require('./app');
const config = require('./config');
const websocketService = require('./services/websocketService');
const mqttService = require('./services/mqttService');
const database = require('./services/database');

// Kết nối tới Database
database.connect();

// Khởi tạo WebSocket Service
websocketService.init();

// Khởi tạo MQTT Service và truyền hàm broadcast vào
mqttService.init(websocketService.broadcast);

// Tạo và khởi động HTTP Server
const server = http.createServer(app);
server.listen(config.server.webServerPort, () => {
    console.log(`HTTP Server is running on http://localhost:${config.server.webServerPort}`);
});