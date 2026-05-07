const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { initDB } = require('./db/database');
const { initSocket } = require('./socket');

// Import routes
const uploadRoute = require('./routes/upload');
const filesRoute = require('./routes/files');
const notificationsRoute = require('./routes/notifications');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Serve static uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routes
app.use('/api/upload', uploadRoute);
app.use('/api/files', filesRoute);
app.use('/api/notifications', notificationsRoute);

// Initialize Socket.io
initSocket(server);

// Initialize Database
initDB();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
