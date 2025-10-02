const express = require('express');
const cors = require('cors');
const controlRoutes = require('./routes/controlRoutes');
const historyRoutes = require('./routes/historyRoutes');
const profileRoutes = require('./routes/profileRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/control', controlRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/profile', profileRoutes);

module.exports = app;