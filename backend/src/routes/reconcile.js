const express = require('express');
const { body, validationResult } = require('express-validator');
const reconcileController = require('../controllers/reconcileController');

const router = express.Router();

// Validation middleware
const validateReconciliation = [
    body('patient_context').exists().withMessage('patient_context is required').isObject().withMessage('patient_context must be an object'),
    body('patient_context.age').optional().isInt({ min: 0, max: 120 }).withMessage('age must be between 0 and 120'),
    body('patient_context.conditions').optional().isArray().withMessage('conditions must be an array'),
    body('patient_context.recent_labs').optional().isObject().withMessage('recent_labs must be an object'),
    body('sources').exists().withMessage('sources is required').isArray({ min: 1 }).withMessage('sources must be a non-empty array'),
    body('sources.*.system').notEmpty().withMessage('Each source must have a system'),
    body('sources.*.medication').notEmpty().withMessage('Each source must have a medication'),
    body('sources.*.last_updated').notEmpty().withMessage('Each source must have a last_updated date'),
    body('sources.*.source_reliability').optional().isIn(['high', 'medium', 'low']).withMessage('source_reliability must be high, medium, or low')
];

// Validation error handler middleware
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

router.post('/medication', validateReconciliation, handleValidationErrors, reconcileController.reconcileMedication);

module.exports = router;
