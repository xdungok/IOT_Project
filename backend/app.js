const express = require('express');
const cors = require('cors');
const controlRoutes = require('./routes/controlRoutes');
const historyRoutes = require('./routes/historyRoutes');
const profileRoutes = require('./routes/profileRoutes');

const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
// Đọc file swagger.yaml từ thư mục gốc của backend
const swaggerDocument = YAML.load(path.join(__dirname, './swagger.yaml'));

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/control', controlRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/profile', profileRoutes);

module.exports = app;