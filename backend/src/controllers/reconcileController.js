const GeminiService = require('../services/geminiService');
const LogHelper = require('../utils/logHelper');

class ReconcileController {
    static async reconcileMedication(req, res) {
        const startTime = Date.now();

        try {
            const { patient_context, sources } = req.body;

            if (!patient_context || typeof patient_context !== 'object') {
                return res.status(400).json({
                    error: 'Validation failed',
                    errors: [{ msg: 'patient_context is required and must be an object' }]
                });
            }

            if (!sources || !Array.isArray(sources) || sources.length === 0) {
                return res.status(400).json({
                    error: 'Validation failed',
                    errors: [{ msg: 'sources is required and must be a non-empty array' }]
                });
            }

            // Get AI reconciliation
            const aiResult = await GeminiService.reconcileMedication(patient_context, sources);

            // Calculate final confidence score (weighted)
            const confidenceScore = ReconcileController.calculateConfidenceScore(
                aiResult.confidence_score,
                sources,
                patient_context
            );

            const response = {
                reconciled_medication: aiResult.reconciled_medication,
                confidence_score: confidenceScore,
                reasoning: aiResult.reasoning,
                recommended_actions: aiResult.recommended_actions,
                clinical_safety_check: aiResult.clinical_safety_check
            };

            // Save to history
            await LogHelper.saveReconciliation({
                patientAge: patient_context.age,
                patientConditions: patient_context.conditions,
                patientLabs: patient_context.recent_labs,
                sources: sources,
                reconciledMedication: response.reconciled_medication,
                confidenceScore: response.confidence_score,
                reasoning: response.reasoning,
                recommendedActions: response.recommended_actions,
                clinicalSafetyCheck: response.clinical_safety_check
            });

            res.json(response);
        } catch (error) {
            console.error('Reconciliation error:', error);
            res.status(500).json({
                error: 'Reconciliation failed',
                message: error.message
            });
        }
    }

    // Calculate weighted confidence score
    static calculateConfidenceScore(aiScore, sources, patientContext) {
        // Weight factors
        const weights = {
            ai: 0.4,
            sourceReliability: 0.35,
            recency: 0.15,
            completeness: 0.10
        };

        // Source reliability score (average of high=1, medium=0.5, low=0.2)
        const reliabilityMap = { high: 1, medium: 0.5, low: 0.2 };
        const avgReliability = sources.reduce((sum, s) =>
            sum + (reliabilityMap[s.source_reliability] || 0.5), 0) / sources.length;

        // Recency score (most recent source within 30 days = 1, >180 days = 0)
        const mostRecentDate = new Date(Math.max(...sources.map(s =>
            new Date(s.last_updated || s.last_filled || 0))));
        const daysSinceUpdate = (Date.now() - mostRecentDate) / (1000 * 60 * 60 * 24);
        const recencyScore = Math.max(0, 1 - daysSinceUpdate / 180);

        // Completeness score
        const hasAge = !!patientContext.age;
        const hasConditions = patientContext.conditions?.length > 0;
        const hasLabs = Object.keys(patientContext.recent_labs || {}).length > 0;
        const completenessScore = (hasAge + hasConditions + hasLabs) / 3;

        // Calculate weighted score
        const finalScore = (
            aiScore * weights.ai +
            avgReliability * weights.sourceReliability +
            recencyScore * weights.recency +
            completenessScore * weights.completeness
        );

        return Math.round(finalScore * 100) / 100; // Round to 2 decimals
    }
}

module.exports = ReconcileController;
