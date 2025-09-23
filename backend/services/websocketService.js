const { WebSocketServer } = require('ws');
const config = require('../config');

let wss;
const clients = new Set();

function init() {
    wss = new WebSocketServer({ port: config.server.websocketPort });
    
    wss.on('connection', (ws) => {
        console.log('Client connected to WebSocket');
        clients.add(ws);

        ws.on('close', () => {
            console.log('Client disconnected from WebSocket');
            clients.delete(ws);
        });

        ws.on('error', (error) => console.error('WebSocket error:', error));
    });

    console.log(`WebSocket Server is running on port ${config.server.websocketPort}`);
}

function broadcast(data) {
    const jsonData = JSON.stringify(data);
    for (const client of clients) {
        if (client.readyState === client.OPEN) {
            client.send(jsonData);
        }
    }
}

module.exports = {
    init,
    broadcast
};