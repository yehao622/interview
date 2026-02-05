const { GoogleGenAI } = require('@google/genai');
const CacheHelper = require('../utils/cacheHelper');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

class GeminiService {
    // Medication reconciliation prompt
    static async reconcileMedication(patientContext, sources) {
        const requestType = 'medication_reconciliation';
        const payload = { patientContext, sources };

        // Check cache first
        const cached = await CacheHelper.getCachedResponse(requestType, payload);
        if (cached) return cached;

        const prompt = `You are a clinical decision support system. Analyze conflicting medication records and determine the most likely accurate information.

Patient Context:
- Age: ${patientContext.age}
- Conditions: ${patientContext.conditions.join(', ')}
- Recent Labs: ${JSON.stringify(patientContext.recent_labs)}

Conflicting Medication Sources:
${sources.map((s, i) => `
Source ${i + 1}: ${s.system}
- Medication: ${s.medication}
- Last Updated: ${s.last_updated}
- Reliability: ${s.source_reliability}
${s.last_filled ? `- Last Filled: ${s.last_filled}` : ''}
`).join('\n')}

Analyze these sources and provide a JSON response with:
{
  "reconciled_medication": "most likely accurate medication and dose",
  "confidence_score": 0.0-1.0,
  "reasoning": "detailed clinical reasoning considering recency, reliability, and patient context",
  "recommended_actions": ["action 1", "action 2"],
  "clinical_safety_check": "PASSED or WARNING with explanation"
}

Consider:
1. Source reliability and recency
2. Clinical appropriateness given patient age, conditions, and labs
3. Medication dosing guidelines for patient's condition
4. Drug-disease interactions`;

        try {
            const startTime = Date.now();

            // New @google/genai API syntax
            const result = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt
            });

            const responseTime = Date.now() - startTime;
            const text = result.text;

            // Extract JSON from response (handle markdown code blocks)
            let jsonText = text.trim();
            if (jsonText.includes('```json')) {
                const match = jsonText.match(/```json\s*([\s\S]*?)\s*```/);
                if (match) jsonText = match[1].trim();
            } else if (jsonText.includes('```')) {
                const match = jsonText.match(/```\s*([\s\S]*?)\s*```/);
                if (match) jsonText = match[1].trim();
            }

            // Remove any leading/trailing whitespace or backticks
            jsonText = jsonText.replace(/^`+|`+$/g, '').trim();

            let response;
            try {
                response = JSON.parse(jsonText);
            } catch (parseError) {
                console.error('JSON parse error. Raw text:', text);
                throw new Error('Invalid JSON response from AI: ' + parseError.message);
            }

            // Save to cache
            await CacheHelper.saveCachedResponse(requestType, payload, response, {
                modelName: 'gemini-2.5-flash',
                responseTimeMs: responseTime
            });

            return response;
        } catch (error) {
            console.error('Gemini API error:', error);
            throw new Error('Failed to generate reconciliation: ' + error.message);
        }
    }

    // Data quality assessment prompt
    static async assessDataQuality(patientData) {
        const requestType = 'data_quality_assessment';
        const payload = { patientData };

        // Check cache first
        const cached = await CacheHelper.getCachedResponse(requestType, payload);
        if (cached) return cached;

        const prompt = `You are a healthcare data quality analyst. Assess the quality of this patient record across multiple dimensions.

Patient Record:
${JSON.stringify(patientData, null, 2)}

Analyze and provide a JSON response with:
{
  "completeness_issues": ["list of missing or incomplete fields"],
  "accuracy_issues": ["list of format/validation issues"],
  "plausibility_issues": ["list of clinically implausible values"],
  "timeliness_issues": ["list of outdated data concerns"]
}

Focus on:
1. Completeness: Missing critical fields (allergies, medications, etc.)
2. Accuracy: Invalid formats, data type mismatches
3. Clinical Plausibility: Physiologically impossible values (e.g., BP 340/180)
4. Timeliness: Stale data (>6 months old)`;

        try {
            const startTime = Date.now();

            // New @google/genai API syntax
            const result = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt
            });

            const responseTime = Date.now() - startTime;
            const text = result.text;

            let jsonText = text.trim();
            if (jsonText.includes('```json')) {
                const match = jsonText.match(/```json\s*([\s\S]*?)\s*```/);
                if (match) jsonText = match[1].trim();
            } else if (jsonText.includes('```')) {
                const match = jsonText.match(/```\s*([\s\S]*?)\s*```/);
                if (match) jsonText = match[1].trim();
            }

            // Remove any leading/trailing whitespace or backticks
            jsonText = jsonText.replace(/^`+|`+$/g, '').trim();

            let response;
            try {
                response = JSON.parse(jsonText);
            } catch (parseError) {
                console.error('JSON parse error. Raw text:', text);
                throw new Error('Invalid JSON response from AI: ' + parseError.message);
            }

            await CacheHelper.saveCachedResponse(requestType, payload, response, {
                modelName: 'gemini-2.5-flash',
                responseTimeMs: responseTime
            });

            return response;
        } catch (error) {
            console.error('Gemini API error:', error);
            throw new Error('Failed to assess data quality: ' + error.message);
        }
    }
}

module.exports = GeminiService;
