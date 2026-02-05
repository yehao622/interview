const LogHelper = require('../utils/logHelper');

const requestLogger = (req, res, next) => {
    // console.log('🔵 Logger middleware triggered for:', req.method, req.path);

    const startTime = Date.now();

    // Store original json method
    const originalJson = res.json;
    let responseData = null;

    // Override res.json to capture response
    res.json = function (body) {
        // console.log('🟢 res.json called for:', req.originalUrl);
        responseData = body;

        // Call original json method
        const result = originalJson.call(this, body);

        // Log immediately after sending response
        const processingTime = Date.now() - startTime;

        if (req.originalUrl.startsWith('/api')) {
            console.log(' Attempting to log to database...');
            setImmediate(() => {
                LogHelper.logApiRequest({
                    endpoint: req.originalUrl,
                    method: req.method,
                    requestBody: req.body || {},
                    responseStatus: res.statusCode,
                    responseBody: responseData,
                    ipAddress: req.ip || req.connection?.remoteAddress || 'unknown',
                    userAgent: req.get('user-agent') || 'unknown',
                    processingTimeMs: processingTime,
                    errorMessage: res.statusCode >= 400 ? (responseData?.error || 'Error occurred') : null
                }).catch(err => console.error('🔴 Failed to log request:', err));
            });
        }

        return result;
    };

    next();
};

module.exports = requestLogger;
