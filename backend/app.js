const express = require('express');
const cors = require('cors');
const controlRoutes = require('./routes/controlRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/control', controlRoutes);

module.exports = app;