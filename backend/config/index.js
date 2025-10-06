module.exports = {
    database: {
        connectionString: process.env.DB_CONNECTION_STRING
    },
    mqtt: {
        brokerUrl: process.env.MQTT_BROKER_URL,
        username: process.env.MQTT_USERNAME,
        password: process.env.MQTT_PASSWORD,
        topics: {
            sensorData: 'sensors/data',
            deviceControl: 'devices/control',
            deviceResponse: 'response'
        }
    },
    server: {
        webServerPort: process.env.WEB_SERVER_PORT,
        websocketPort: process.env.WEBSOCKET_PORT
    }
};