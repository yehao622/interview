const express = require('express');
const { body, validationResult } = require('express-validator');
const ValidateController = require('../controllers/validateController');

const router = express.Router();

// Validation middleware
const validateDataQualityInput = [
    body('demographics').optional().isObject(),
    body('medications').optional().isArray(),
    body('allergies').optional().isArray(),
    body('conditions').optional().isArray(),
    body('vital_signs').optional().isObject(),
    body('last_updated').optional().isISO8601().withMessage('Invalid date format')
];

router.post('/data-quality', validateDataQualityInput, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    ValidateController.validateDataQuality(req, res);
});

module.exports = router;
