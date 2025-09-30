const express = require('express');
const cors = require('cors');
const controlRoutes = require('./routes/controlRoutes');
const historyRoutes = require('./routes/historyRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/control', controlRoutes);
app.use('/api/history', historyRoutes);

module.exports = app;