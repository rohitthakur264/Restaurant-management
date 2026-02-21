require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const connectDB = require('./config/db');
const logger = require('./middleware/logger');

// Route imports
const authRoutes = require('./routes/auth');
const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/orders');
const inventoryRoutes = require('./routes/inventory');
const paymentRoutes = require('./routes/payments');
const userRoutes = require('./routes/users');
const analyticsRoutes = require('./routes/analytics');
const roomRoutes = require('./routes/rooms');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Global middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(logger);

// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));

// API Routes (microservice-style modules)
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/rooms', roomRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// SPA fallback — serve index.html for unmatched routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`\n🍽️  Restaurant Management System`);
    console.log(`   Server running on http://localhost:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

module.exports = app;
