const DataQualityService = require('../services/dataQualityService');
const LogHelper = require('../utils/logHelper');

class ValidateController {
    static async validateDataQuality(req, res) {
        try {
            const patientData = req.body;

            // Assess data quality
            const result = await DataQualityService.assessQuality(patientData);

            // Save assessment to database
            await LogHelper.saveDataQualityAssessment({
                patientData: patientData,
                overallScore: result.overall_score,
                breakdown: result.breakdown,
                issuesDetected: result.issues_detected
            });

            res.json(result);
        } catch (error) {
            console.error('Data quality validation error:', error);
            res.status(500).json({
                error: 'Validation failed',
                message: error.message
            });
        }
    }
}

module.exports = ValidateController;
