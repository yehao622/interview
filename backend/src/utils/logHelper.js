const database = require('../config/database');

class LogHelper {
    // Log API request/response
    static async logApiRequest(logData) {
        console.log('📝 Logging API request:', logData.endpoint, logData.method);

        const sql = `
      INSERT INTO api_logs 
      (endpoint, method, request_body, response_status, response_body, ip_address, user_agent, processing_time_ms, error_message)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        try {
            await database.run(sql, [
                logData.endpoint,
                logData.method,
                JSON.stringify(logData.requestBody),
                logData.responseStatus,
                JSON.stringify(logData.responseBody),
                logData.ipAddress,
                logData.userAgent,
                logData.processingTimeMs,
                logData.errorMessage || null
            ]);
            console.log('✓ API request logged successfully'); // Add success log
        } catch (err) {
            console.error('Error logging API request:', err.message);
            // Don't throw - logging failure shouldn't break the API
        }
    }  // ← This was missing!

    // Save reconciliation history
    static async saveReconciliation(data) {
        const sql = `
      INSERT INTO reconciliation_history 
      (patient_age, patient_conditions, patient_labs, sources_data, reconciled_medication, 
       confidence_score, reasoning, recommended_actions, clinical_safety_check)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        try {
            const result = await database.run(sql, [
                data.patientAge,
                JSON.stringify(data.patientConditions),
                JSON.stringify(data.patientLabs),
                JSON.stringify(data.sources),
                data.reconciledMedication,
                data.confidenceScore,
                data.reasoning,
                JSON.stringify(data.recommendedActions),
                data.clinicalSafetyCheck
            ]);

            return result.id;
        } catch (err) {
            console.error('Error saving reconciliation:', err.message);
            throw err;
        }
    }  // ← This was missing!

    // Save data quality assessment
    static async saveDataQualityAssessment(data) {
        const sql = `
      INSERT INTO data_quality_assessments 
      (patient_data, overall_score, completeness_score, accuracy_score, 
       timeliness_score, plausibility_score, issues_detected)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

        try {
            const result = await database.run(sql, [
                JSON.stringify(data.patientData),
                data.overallScore,
                data.breakdown.completeness,
                data.breakdown.accuracy,
                data.breakdown.timeliness,
                data.breakdown.clinical_plausibility,
                JSON.stringify(data.issuesDetected)
            ]);

            return result.id;
        } catch (err) {
            console.error('Error saving data quality assessment:', err.message);
            throw err;
        }
    }  // ← This was missing!
}

module.exports = LogHelper;
