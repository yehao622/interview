require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const database = require('./config/database');
const path = require('path');

const app = express();

// Basic middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Middleware
const requestLogger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const authenticateApiKey = require('./middleware/auth');
const { apiLimiter, aiLimiter } = require('./middleware/rateLimiter');

app.use(requestLogger);
app.use('/api', apiLimiter);

const reconcileRoutes = require('./routes/reconcile');
const validateRoutes = require('./routes/validate');

app.use('/api/reconcile', authenticateApiKey, aiLimiter, reconcileRoutes);
app.use('/api/validate', authenticateApiKey, aiLimiter, validateRoutes);

// Serve static frontend files in production
if (process.env.NODE_ENV === 'production') {
    const path = require('path');
    app.use(express.static(path.join(__dirname, '../public')));

    // Catch-all route to serve React app for any non-API route
    app.get(/^\/(?!api).*/, (req, res) => {
        res.sendFile(path.join(__dirname, '../public', 'index.html'));
    });
}

app.use(errorHandler);

// Only initialize database and start server if not in test mode
if (process.env.NODE_ENV !== 'test') {
    // Initialize database
    database.initialize()
        .then(() => {
            console.log('✓ Database ready');

            // Set up cache cleanup interval (run every 6 hours)
            setInterval(() => {
                database.cleanExpiredCache();
            }, 6 * 60 * 60 * 1000);
        })
        .catch(err => {
            console.error('Failed to initialize database:', err);
            process.exit(1);
        });

    // Start server
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`✓ Server listening on port ${PORT}`);
        console.log(`✓ API endpoint: http://localhost:${PORT}/api`);
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
        console.log('\nShutting down gracefully...');
        await database.close();
        process.exit(0);
    });
}

module.exports = app;
