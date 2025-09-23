const mongoose = require('mongoose');
const config = require('../config');

async function connect() {
    try {
        await mongoose.connect(config.database.connectionString);
        console.log('Successfully connected to MongoDB!');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1); // Thoát khỏi ứng dụng nếu không kết nối được DB
    }
}

module.exports = { connect };