const authenticateApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    // In development or test mode, allow requests without API key
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
        return next();
    }

    // Check API key
    const validApiKey = process.env.API_KEY;

    if (!apiKey) {
        return res.status(401).json({
            error: 'Authentication required',
            message: 'API key is missing'
        });
    }

    if (apiKey !== validApiKey) {
        return res.status(403).json({
            error: 'Authentication failed',
            message: 'Invalid API key'
        });
    }

    next();
};

module.exports = authenticateApiKey;
